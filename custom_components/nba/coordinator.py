"""Coordinateur : récupère les données ESPN et déclenche les événements."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .scoreboard_utils import async_load_scoreboard, parse_score
from .game_details import parse_boxscore, parse_game_state, parse_plays
from .teams_catalog import parse_teams_catalog
from .team_roster import parse_team_roster
from .player_data import parse_player_gamelog, parse_player_stats, season_matches_espn_year
from .playoff_data import (
    annotate_playoff_bracket,
    build_playoff_bracket,
    build_playoff_series,
    parse_playoff_payload,
    parse_playoff_standings,
    validate_playoff_seeds,
)

from .const import (
    CONF_NOTIFY_END,
    CONF_NOTIFY_START,
    CONF_TEAMS,
    DOMAIN,
    EVENT_GAME_END,
    EVENT_GAME_START,
    LAST_GAMES_COUNT,
    LEADER_CATEGORIES,
    LEADERS_COUNT,
    LEADERS_URL,
    PLAYER_DATA_URL,
    SCAN_INTERVAL_IDLE,
    SCAN_INTERVAL_LIVE,
    SCOREBOARD_URL,
    STANDINGS_URL,
    SUMMARY_URL,
    TEAM_SCHEDULE_URL,
    TEAM_ROSTER_URL,
    TEAMS_URL,
)

_LOGGER = logging.getLogger(__name__)


def _to_int(value: Any) -> int:
    """Convertit un score ESPN en entier (accepte nombre, texte ou dictionnaire)."""
    if isinstance(value, dict):
        value = value.get("value", value.get("displayValue", 0))
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0


def _local_date(raw: str | None) -> dict[str, str | None]:
    """Convertit une date ESPN (UTC) en heure locale de Home Assistant.

    Retourne l'ISO local, un texte lisible (ex: 'dim. 15/11 à 22:00') et le jour.
    """
    if not raw:
        return {"iso": None, "text": None, "day": None, "time": None}
    parsed = dt_util.parse_datetime(raw)
    if parsed is None:
        return {"iso": raw, "text": raw, "day": None, "time": None}
    local = dt_util.as_local(parsed)
    jours = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]
    day = f"{jours[local.weekday()]} {local:%d/%m}"
    hour = f"{local:%H:%M}"
    return {"iso": local.isoformat(), "text": f"{day} à {hour}", "day": day, "time": hour}


class NBACoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Gère la récupération des données NBA."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=SCAN_INTERVAL_IDLE)
        self.entry = entry
        self.session = async_get_clientsession(hass)
        self.teams: list[str] = entry.options.get(CONF_TEAMS, entry.data.get(CONF_TEAMS, []))
        self._last_state: dict[str, str] = {}
        self._leaders: dict[str, list[dict]] = {}
        self._postseason_leaders: dict[str, list[dict]] = {}
        self._leaders_fetched: datetime | None = None
        self._details_cache: dict[str, dict[str, Any]] = {}
        self._scoreboard_cache: dict[str, tuple[datetime, dict[str, Any]]] = {}
        self._scoreboard_lock = asyncio.Lock()
        self._teams_catalog: dict[str, Any] = {"teams": [], "count": 0, "expected_count": 30, "complete": False}
        self._teams_catalog_fetched: datetime | None = None
        self._team_roster_cache: dict[str, tuple[datetime, dict[str, Any]]] = {}
        self._team_roster_locks: dict[str, asyncio.Lock] = {}
        self._player_data_cache: dict[str, tuple[datetime, dict[str, Any]]] = {}
        self._player_data_locks: dict[str, asyncio.Lock] = {}
        self._playoff_cache: dict[int, tuple[datetime, dict[str, Any]]] = {}
        self._playoff_locks: dict[int, asyncio.Lock] = {}

    async def _get(self, url: str, params: dict | None = None) -> dict:
        async with self.session.get(url, params=params, timeout=20) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            scoreboard = await self._get(SCOREBOARD_URL)
            standings = await self._get(STANDINGS_URL)
            schedules: dict[str, Any] = {}
            for team_id in self.teams:
                schedules[team_id] = await self._get(TEAM_SCHEDULE_URL.format(team_id=team_id))
        except Exception as err:
            raise UpdateFailed(f"Erreur API ESPN: {err}") from err

        await self._update_leaders()
        await self._update_teams_catalog()

        games = [g for g in (self._parse_game(e) for e in scoreboard.get("events", [])) if g]
        team_data = {tid: self._parse_team(tid, schedules[tid], games) for tid in self.teams}
        # Complète les cinq rencontres de chaque équipe en réutilisant le cache
        # partagé avec le service nba.get_game_details.
        detail_ids = list(dict.fromkeys(
            game["id"] for info in team_data.values() for game in info["recent"]
        ))
        for game_id in detail_ids:
            try:
                summary = await self.async_get_game_details(game_id)
            except Exception as err:  # noqa: BLE001 - un résumé absent ne bloque pas l'actualisation
                _LOGGER.debug("Résumé ESPN %s indisponible: %s", game_id, err)
                summary = {}
            # Un résumé ESPN peut manquer ou être incomplet : un détail vide reste
            # utilisable et aucune erreur ne remonte au coordinateur.
            detail = {"teams": summary.get("teams", [])} if summary else {"teams": []}
            for info in team_data.values():
                for recent_game in info["recent"]:
                    if recent_game["id"] == game_id:
                        recent_game["details"] = detail

        data = {
            "games": games,
            "standings": self._parse_standings(standings),
            "teams": team_data,
            "leaders": self._leaders,
            "postseason_leaders": self._postseason_leaders,
            "favorites": list(self.teams),
            "teams_catalog": self._teams_catalog,
        }
        self._fire_events(games)
        live = any(g["state"] == "in" for g in games)
        self.update_interval = SCAN_INTERVAL_LIVE if live else SCAN_INTERVAL_IDLE
        return data

    async def _update_teams_catalog(self) -> None:
        """Actualise le catalogue des franchises au maximum une fois par jour.

        Une réponse vide/incomplète ne remplace pas un catalogue complet déjà
        connu. Une panne du catalogue ne bloque pas les autres données NBA.
        """
        now = dt_util.utcnow()
        if self._teams_catalog_fetched and (now - self._teams_catalog_fetched).total_seconds() < 86400:
            return
        try:
            raw = await self._get(TEAMS_URL)
            parsed = parse_teams_catalog(raw)
            if parsed["count"] == 0:
                raise ValueError("ESPN a renvoyé un catalogue d'équipes vide")
            if self._teams_catalog.get("complete") and not parsed["complete"]:
                _LOGGER.warning(
                    "Catalogue ESPN incomplet (%s/30) : conservation du catalogue complet en cache",
                    parsed["count"],
                )
                return
            self._teams_catalog = parsed
            self._teams_catalog_fetched = now
            if not parsed["complete"]:
                _LOGGER.warning("Catalogue ESPN incomplet : %s/30 franchises", parsed["count"])
        except Exception as err:  # noqa: BLE001 - cette ressource ne bloque pas le coordinator
            _LOGGER.warning("Catalogue des franchises NBA indisponible : %s", err)

    async def _update_leaders(self) -> None:
        """Récupère les leaders de saison régulière et de playoffs (cache horaire)."""
        now = dt_util.utcnow()
        if self._leaders_fetched and (now - self._leaders_fetched).total_seconds() < 3600 and self._leaders:
            return
        regular: dict[str, list[dict]] = {}
        postseason: dict[str, list[dict]] = {}
        # ESPN utilise l'année de fin de saison NBA (ex. 2027 pour 2026-27).
        season_year = now.year + (1 if now.month >= 10 else 0)
        for key, (_label, sort) in LEADER_CATEGORIES.items():
            params = {"region": "us", "lang": "en", "contentorigin": "espn",
                      "isqualified": "true", "page": 1, "limit": LEADERS_COUNT, "sort": sort}
            try:
                raw = await self._get(LEADERS_URL, params=params)
                regular[key] = self._parse_leaders(raw, key)
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Leaders réguliers '%s' indisponibles: %s", key, err)
                regular[key] = self._leaders.get(key, [])
            try:
                playoff_params = {**params, "season": season_year, "seasontype": 3}
                playoff_raw = await self._get(LEADERS_URL, params=playoff_params)
                postseason[key] = self._parse_leaders(playoff_raw, key)
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Leaders playoffs '%s' indisponibles: %s", key, err)
                postseason[key] = self._postseason_leaders.get(key, [])
        self._leaders = regular
        self._postseason_leaders = postseason
        self._leaders_fetched = now

    @staticmethod
    def _parse_leaders(raw: dict, key: str) -> list[dict]:
        """Extrait joueur / équipe / valeur depuis la réponse ESPN."""
        # Noms des colonnes de stats, par catégorie ESPN
        wanted = {
            "points": "avgPoints",
            "rebounds": "avgRebounds",
            "assists": "avgAssists",
            "steals": "avgSteals",
            "blocks": "avgBlocks",
        }[key]
        # Position de la colonne voulue dans chaque catégorie
        positions: list[tuple[int, int]] = []
        for ci, cat in enumerate(raw.get("categories", [])):
            for ni, name in enumerate(cat.get("names", [])):
                if name == wanted:
                    positions.append((ci, ni))
        rows: list[dict] = []
        for i, item in enumerate(raw.get("athletes", [])[:LEADERS_COUNT], start=1):
            athlete = item.get("athlete", {})
            athlete_team = athlete.get("team") if isinstance(athlete.get("team"), dict) else {}
            team_logos = athlete_team.get("logos") or athlete.get("teamLogos") or []
            team_logo = athlete_team.get("logo")
            if not team_logo and team_logos and isinstance(team_logos[0], dict):
                team_logo = team_logos[0].get("href")
            value = None
            for ci, ni in positions:
                try:
                    value = item["categories"][ci]["values"][ni]
                    break
                except (KeyError, IndexError, TypeError):
                    continue
            if value is None:
                try:
                    value = item["categories"][0]["values"][0]
                except (KeyError, IndexError, TypeError):
                    value = None
            rows.append(
                {
                    "rank": i,
                    "id": str(athlete.get("id")) if athlete.get("id") is not None else None,
                    "player": athlete.get("displayName"),
                    "team": athlete_team.get("abbreviation") or athlete.get("teamAbbreviation")
                            or athlete.get("teamShortName") or athlete.get("teamName"),
                    "team_abbreviation": athlete_team.get("abbreviation") or athlete.get("teamAbbreviation"),
                    "team_id": str(athlete_team.get("id") or athlete.get("teamId"))
                               if athlete_team.get("id") or athlete.get("teamId") else None,
                    "team_logo": team_logo,
                    "headshot": (athlete.get("headshot") or {}).get("href"),
                    "value": round(float(value), 1) if isinstance(value, (int, float)) else value,
                }
            )
        return rows

    @staticmethod
    def _parse_game(event: dict) -> dict[str, Any] | None:
        """Transforme un match ESPN en dictionnaire simple.

        Le format diffère selon l'endpoint : le statut est parfois sur l'événement
        (scoreboard), parfois dans competitions[0] (calendrier d'équipe).
        Retourne None si le match est dans un format inattendu.
        """
        try:
            comp = event["competitions"][0]
            status = event.get("status") or comp.get("status") or {}
            status_type = status.get("type") or {}
            state = status_type.get("state")
            if state is None:
                state = "post" if status_type.get("completed") else "pre"

            when = _local_date(event.get("date") or comp.get("date"))
            game: dict[str, Any] = {
                "id": event["id"],
                "date": when["iso"],
                "date_text": when["text"],
                "day": when["day"],
                "time": when["time"],
                "name": event.get("shortName") or event.get("name"),
                "state": state,  # pre / in / post
                "detail": status_type.get("detail") or status_type.get("shortDetail"),
                "period": status.get("period"),
                "clock": status.get("displayClock"),
                "home": {},
                "away": {},
            }
            for c in comp["competitors"]:
                team = c.get("team", {})
                logo = team.get("logo") or (team.get("logos") or [{}])[0].get("href")
                game[c["homeAway"]] = {
                    "id": str(team.get("id", c.get("id", ""))),
                    "name": team.get("displayName") or team.get("name"),
                    "abbr": team.get("abbreviation"),
                    "logo": logo,
                    "score": parse_score(c.get("score")),
                    "winner": c.get("winner", False),
                    "record": (c.get("records") or [{}])[0].get("summary"),
                }
            return game
        except (KeyError, IndexError, TypeError) as err:
            _LOGGER.debug("Match ignoré (format inattendu: %s): %s", err, event.get("id"))
            return None

    @staticmethod
    def _parse_standings(raw: dict) -> dict[str, list[dict]]:
        result: dict[str, list[dict]] = {}
        for conf in raw.get("children", []):
            rows = []
            for entry in conf.get("standings", {}).get("entries", []):
                stats = {s["name"]: s.get("displayValue") for s in entry.get("stats", [])}
                team = entry["team"]
                rows.append(
                    {
                        "team_id": str(team["id"]),
                        "team": team["displayName"],
                        "abbr": team["abbreviation"],
                        "logo": (team.get("logos") or [{}])[0].get("href"),
                        "wins": stats.get("wins"),
                        "losses": stats.get("losses"),
                        "pct": stats.get("winPercent"),
                        "gb": stats.get("gamesBehind"),
                        "streak": stats.get("streak"),
                        "rank": _to_int(stats.get("playoffSeed")),
                    }
                )
            rows.sort(key=lambda r: (r["rank"] == 0, r["rank"]))
            result[conf["name"]] = rows
        return result

    def _parse_team(self, team_id: str, schedule: dict, today_games: list[dict]) -> dict[str, Any]:
        team = schedule.get("team", {})
        last, nxt = None, None
        history: list[dict] = []
        for ev in schedule.get("events", []):
            g = self._parse_game(ev)
            if not g:
                continue
            if g["state"] == "post":
                last = g
                history.append(g)
            elif g["state"] in ("pre", "in") and nxt is None:
                nxt = g
        # Les plus récents d'abord, avec résultat (V/D) du point de vue de l'équipe
        recent: list[dict] = []
        for g in reversed(history[-LAST_GAMES_COUNT:]):
            is_home = g["home"].get("id") == team_id
            me = g["home"] if is_home else g["away"]
            opp = g["away"] if is_home else g["home"]
            recent.append(
                {
                    "id": g["id"],
                    "day": g["day"],
                    "date_text": g["date_text"],
                    "home_away": "vs" if is_home else "@",
                    "result": "V" if me.get("winner") else "D",
                    "team_abbr": me.get("abbr"),
                    "team_score": me.get("score"),
                    "opp_abbr": opp.get("abbr"),
                    "opp_name": opp.get("name"),
                    "opp_logo": opp.get("logo"),
                    "opp_score": opp.get("score"),
                }
            )
        live = next(
            (g for g in today_games if g["state"] == "in" and team_id in (g["home"].get("id"), g["away"].get("id"))),
            None,
        )
        return {
            "name": team.get("displayName", team_id),
            "abbr": team.get("abbreviation"),
            "logo": team.get("logo"),
            "last": last,
            "next": nxt,
            "live": live,
            "recent": recent,
        }


    async def async_get_team_roster(self, team_id: str) -> dict[str, Any]:
        """Charge à la demande l'effectif d'une franchise, avec cache d'une heure."""
        team_id = str(team_id).strip()
        known_teams = {
            str(team.get("id"))
            for team in self._teams_catalog.get("teams", [])
            if isinstance(team, dict) and team.get("id") is not None
        }
        if team_id not in known_teams:
            raise ValueError("Identifiant de franchise NBA inconnu")
        now = dt_util.utcnow()
        cached = self._team_roster_cache.get(team_id)
        if cached and (now - cached[0]).total_seconds() < 3600:
            return cached[1]

        lock = self._team_roster_locks.setdefault(team_id, asyncio.Lock())
        async with lock:
            now = dt_util.utcnow()
            cached = self._team_roster_cache.get(team_id)
            if cached and (now - cached[0]).total_seconds() < 3600:
                return cached[1]
            raw = await self._get(TEAM_ROSTER_URL.format(team_id=team_id))
            parsed = parse_team_roster(raw)
            if not parsed["players"]:
                raise ValueError("ESPN n'a renvoyé aucun joueur pour cette franchise")
            team = next(
                (item for item in self._teams_catalog.get("teams", [])
                 if str(item.get("id")) == team_id),
                {},
            )
            schedule_info = {}
            try:
                schedule_raw = await self._get(TEAM_SCHEDULE_URL.format(team_id=team_id))
                today_games = (self.data or {}).get("games", [])
                schedule_info = self._parse_team(team_id, schedule_raw, today_games)
            except Exception as err:  # noqa: BLE001 - l'effectif reste exploitable sans calendrier
                _LOGGER.debug("Calendrier de l'équipe %s indisponible: %s", team_id, err)

            standing = None
            for rows in (self.data or {}).get("standings", {}).values():
                standing = next((row for row in rows if str(row.get("team_id")) == team_id), None)
                if standing:
                    break

            result = {
                "team": team,
                "standing": standing,
                "schedule": schedule_info,
                **parsed,
                "fetched_at": now.isoformat(),
            }
            self._team_roster_cache[team_id] = (now, result)
            return result


    async def async_get_player_data(self, player_id: str, postseason_year: int | None = None) -> dict[str, Any]:
        """Charge les statistiques et le gamelog d'un joueur ESPN, avec cache d'une heure."""
        player_id = str(player_id).strip()
        if not player_id.isdigit() or len(player_id) > 12:
            raise ValueError("Identifiant de joueur ESPN invalide")
        if postseason_year is not None and (isinstance(postseason_year, bool) or not isinstance(postseason_year, int) or not 2000 <= postseason_year <= 2100):
            raise ValueError("Saison playoffs invalide")
        cache_key = f"{player_id}:{postseason_year or 'current'}"
        now = dt_util.utcnow()
        cached = self._player_data_cache.get(cache_key)
        if cached and (now - cached[0]).total_seconds() < 3600:
            return cached[1]

        lock = self._player_data_locks.setdefault(cache_key, asyncio.Lock())
        async with lock:
            now = dt_util.utcnow()
            cached = self._player_data_cache.get(cache_key)
            if cached and (now - cached[0]).total_seconds() < 3600:
                return cached[1]

            resources: dict[str, Any] = {}
            errors: dict[str, str] = {}
            for resource in ("overview", "stats", "gamelog"):
                url = PLAYER_DATA_URL.format(player_id=player_id, resource=resource)
                try:
                    resources[resource] = await self._get(url)
                except Exception as err:  # noqa: BLE001 - chaque ressource est indépendante
                    errors[resource] = str(err)
                    _LOGGER.debug("Données joueur %s (%s) indisponibles: %s", player_id, resource, err)

            overview = parse_player_stats(resources.get("overview", {}))
            stats = parse_player_stats(resources.get("stats", {}))
            gamelog = parse_player_gamelog(resources.get("gamelog", {}))

            # Les playoffs sont un split ESPN distinct (seasontype=3). On
            # conserve ce bloc séparément et on vérifie le filtre retourné
            # avant de l'exposer : aucune moyenne de saison régulière ne peut
            # ainsi être étiquetée par erreur comme une statistique de playoffs.
            postseason_stats: dict[str, Any] = {}
            season_year = None
            if stats.get("season_history"):
                try:
                    season_year = int(stats["season_history"][0].get("year"))
                except (TypeError, ValueError):
                    season_year = None
            if postseason_year is not None:
                season_year = postseason_year
            if season_year is None and stats.get("season"):
                parts = str(stats["season"]).split("-")
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    suffix = int(parts[1])
                    season_year = suffix if suffix > 99 else (int(parts[0]) // 100) * 100 + suffix
            if season_year:
                # Core v2 est plus adapté aux statistiques historiques par saison :
                # /seasons/{année de fin}/types/3/athletes/{id}/statistics/
                core_url = (
                    "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/"
                    f"seasons/{season_year}/types/3/athletes/{player_id}/statistics/"
                )
                try:
                    core_raw = await self._get(core_url)
                    postseason_stats = parse_core_postseason_stats(core_raw, season_year)
                    if not postseason_stats.get("statistics"):
                        postseason_stats = {}
                except Exception as core_err:  # noqa: BLE001 - fallback Web v3 si Core v2 ne répond pas
                    _LOGGER.debug(
                        "Core v2 playoffs indisponible pour le joueur %s / saison %s: %s",
                        player_id, season_year, core_err,
                    )
                # Le Web v3 reste une solution de repli, notamment si Core v2
                # ne fournit pas de statistiques pour un joueur/saison donné.
                if not postseason_stats:
                    try:
                        postseason_raw = await self._get(
                            PLAYER_DATA_URL.format(player_id=player_id, resource="stats"),
                            params={"season": season_year, "seasontype": 3},
                        )
                        parsed_postseason = parse_player_stats(postseason_raw)
                        if (parsed_postseason.get("season_type_id") == "3"
                                and season_matches_espn_year(str(parsed_postseason.get("season") or ""), season_year)
                                and parsed_postseason.get("statistics")):
                            postseason_stats = parsed_postseason
                    except Exception as err:  # noqa: BLE001 - les playoffs ne bloquent jamais le profil régulier
                        _LOGGER.debug(
                            "Web v3 playoffs indisponible pour le joueur %s / saison %s: %s",
                            player_id, season_year, err,
                        )

            postseason_gamelog: dict[str, Any] = {"games": [], "count": 0, "boxscore_count": 0}
            if postseason_stats and season_year:
                try:
                    raw_postseason_log = await self._get(
                        PLAYER_DATA_URL.format(player_id=player_id, resource="gamelog"),
                        params={"season": season_year, "seasontype": 3},
                    )
                    postseason_gamelog = parse_player_gamelog(raw_postseason_log)
                except Exception as err:  # noqa: BLE001 - les playoffs ne bloquent jamais le profil
                    _LOGGER.debug("Journal playoffs ESPN indisponible pour le joueur %s: %s", player_id, err)

            # Les gamelogs ESPN fournissent parfois uniquement les métadonnées.
            # Les cinq rencontres récentes sont enrichies via les box scores normalisés.
            async def enrich_recent_games(log: dict[str, Any], label: str) -> None:
                for game in log["games"][:5]:
                    game_id = game.get("id")
                    if not game_id:
                        continue
                    try:
                        summary = await self.async_get_game_details(game_id)
                    except Exception as err:  # noqa: BLE001 - le profil reste utilisable sans box score
                        _LOGGER.debug("Box score %s joueur %s / match %s indisponible: %s", label, player_id, game_id, err)
                        continue
                    found = next(
                        (
                            player
                            for team in summary.get("player_stats", [])
                            for player in team.get("players", [])
                            if str(player.get("id") or "") == player_id
                        ),
                        None,
                    )
                    if found:
                        game["stats"] = found.get("stats_by_key") or found.get("stats") or {}
                        game["player_name"] = found.get("name")
                        game["did_not_play"] = bool(found.get("did_not_play"))
                log["boxscore_count"] = sum(bool(game.get("stats")) for game in log["games"][:5])

            await enrich_recent_games(gamelog, "saison régulière")
            await enrich_recent_games(postseason_gamelog, "playoffs")
            result = {
                "player_id": player_id,
                "overview": overview,
                "stats": stats,
                "postseason_stats": postseason_stats,
                "gamelog": gamelog,
                "postseason_gamelog": postseason_gamelog,
                "errors": errors,
                "available": bool(overview["statistics"] or stats["statistics"] or gamelog["games"]),
                "fetched_at": now.isoformat(),
            }
            if not result["available"]:
                _LOGGER.warning(
                    "Aucune donnée exploitable pour le joueur %s. Réponses ESPN: overview=%s stats=%s gamelog=%s; erreurs=%s",
                    player_id,
                    sorted(resources.get("overview", {}).keys()) if isinstance(resources.get("overview"), dict) else type(resources.get("overview")).__name__,
                    sorted(resources.get("stats", {}).keys()) if isinstance(resources.get("stats"), dict) else type(resources.get("stats")).__name__,
                    sorted(resources.get("gamelog", {}).keys()) if isinstance(resources.get("gamelog"), dict) else type(resources.get("gamelog")).__name__,
                    errors,
                )
                _LOGGER.warning(
                    "Structure ESPN joueur %s: overview.statistics=%s; stats.categories[0]=%s; "
                    "gamelog.events[0]=%s; gamelog.names=%s; gamelog.labels=%s",
                    player_id,
                    (
                        {"type": type(resources.get("overview", {}).get("statistics")).__name__,
                         "keys": sorted(resources.get("overview", {}).get("statistics", {}).keys())}
                        if isinstance(resources.get("overview", {}).get("statistics"), dict)
                        else type(resources.get("overview", {}).get("statistics")).__name__
                    ),
                    (
                        sorted(resources.get("stats", {}).get("categories", [{}])[0].keys())
                        if resources.get("stats", {}).get("categories") and isinstance(resources.get("stats", {}).get("categories")[0], dict)
                        else type(resources.get("stats", {}).get("categories")).__name__
                    ),
                    (
                        sorted(resources.get("gamelog", {}).get("events", [{}])[0].keys())
                        if resources.get("gamelog", {}).get("events") and isinstance(resources.get("gamelog", {}).get("events")[0], dict)
                        else type(resources.get("gamelog", {}).get("events")).__name__
                    ),
                    resources.get("gamelog", {}).get("names", [])[:8],
                    resources.get("gamelog", {}).get("labels", [])[:8],
                )
                raise RuntimeError("ESPN n'a renvoyé aucune donnée exploitable pour ce joueur")
            self._player_data_cache[cache_key] = (now, result)
            return result


    async def async_get_playoff_bracket(self, season_year: int) -> dict[str, Any]:
        """Charge à la demande le bracket d'une saison, sans requêtes au démarrage.

        ESPN attend l'année de fin de saison (ex. 2025 pour 2024-25).
        Seules les 16 équipes disposant d'un seed 1..8 validé sont interrogées.
        """
        if isinstance(season_year, bool) or not isinstance(season_year, int) or not 2000 <= season_year <= 2100:
            raise ValueError("Saison NBA invalide")
        now = dt_util.utcnow()
        cached = self._playoff_cache.get(season_year)
        if cached and (now - cached[0]).total_seconds() < 3600:
            return cached[1]

        lock = self._playoff_locks.setdefault(season_year, asyncio.Lock())
        async with lock:
            now = dt_util.utcnow()
            cached = self._playoff_cache.get(season_year)
            if cached and (now - cached[0]).total_seconds() < 3600:
                return cached[1]

            raw_standings = await self._get(STANDINGS_URL, params={"season": season_year})
            parsed_standings = parse_playoff_standings(raw_standings)
            validated = validate_playoff_seeds(parsed_standings)
            season_label = next(
                (item.get("season") for item in parsed_standings if item.get("season")),
                None,
            )
            season_data = validated.get("seasons", {}).get(season_label, {}).get("conferences", {})
            team_ids: list[str] = []
            seed_errors: dict[str, list[str]] = {}
            for conference in ("East", "West"):
                info = season_data.get(conference, {})
                if info.get("valid"):
                    team_ids.extend(str(team_id) for team_id in info.get("seeds", {}).values())
                else:
                    seed_errors[conference] = info.get("errors", ["standings_unavailable"])

            semaphore = asyncio.Semaphore(4)

            async def load_team_schedule(team_id: str) -> tuple[str, dict[str, Any] | None, str | None]:
                async with semaphore:
                    try:
                        payload = await self._get(
                            TEAM_SCHEDULE_URL.format(team_id=team_id),
                            params={"season": season_year, "seasontype": 3},
                        )
                        return team_id, payload, None
                    except Exception as err:  # noqa: BLE001 - un calendrier manquant ne bloque pas les autres
                        _LOGGER.debug("Calendrier playoffs ESPN indisponible pour %s/%s: %s", season_year, team_id, err)
                        return team_id, None, str(err)

            loaded = await asyncio.gather(*(load_team_schedule(team_id) for team_id in dict.fromkeys(team_ids)))
            games = []
            schedule_errors = {}
            for team_id, payload, error in loaded:
                if payload is not None:
                    games.extend(parse_playoff_payload(payload))
                elif error:
                    schedule_errors[team_id] = error

            series = build_playoff_series(games)
            brackets = build_playoff_bracket(series)
            bracket = next((item for item in brackets if item.get("season_year") == season_year), None)
            if bracket is None:
                bracket = {
                    "season_year": season_year,
                    "conferences": {"East": [], "West": []},
                    "finals": [],
                    "unplaced": [],
                }
            annotated = annotate_playoff_bracket(bracket, validated) or bracket
            result = {
                **annotated,
                "available": bool(games),
                "games_count": len({game.get("id") for game in games if game.get("id")}),
                "series_count": len(series),
                "seed_errors": seed_errors,
                "schedule_errors": schedule_errors,
                "fetched_at": now.isoformat(),
            }
            self._playoff_cache[season_year] = (now, result)
            return result

    async def async_get_scoreboard_for_local_date(self, local_date: str) -> dict[str, Any]:
        """Return games for a calendar day in the Home Assistant timezone."""
        timezone = dt_util.now().tzinfo
        return await async_load_scoreboard(
            local_date,
            now_factory=dt_util.utcnow,
            local_timezone=timezone,
            fetch_scoreboard=lambda day: self._get(SCOREBOARD_URL, params={"dates": day}),
            parse_event=self._parse_game,
            cache=self._scoreboard_cache,
            lock=self._scoreboard_lock,
            update_failed=UpdateFailed,
        )

    async def async_get_game_details(self, game_id: str) -> dict[str, Any]:
        """Charge les détails d'un match (quart-temps, meilleurs joueurs).

        Les matchs terminés sont mis en cache (leurs détails ne changent plus).
        Ne lève jamais d'exception : en cas de problème, renvoie un dictionnaire
        avec une clé 'error'.
        """
        game_id = str(game_id)
        if game_id in self._details_cache:
            return self._details_cache[game_id]
        try:
            raw = await self._get(SUMMARY_URL, params={"event": game_id})
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Détails du match %s indisponibles: %s", game_id, err)
            return {"game_id": game_id, "error": str(err), "teams": []}

        details = self._parse_summary(game_id, raw)
        if details.get("final"):
            self._details_cache[game_id] = details
        return details

    @staticmethod
    def _parse_summary(game_id: str, raw: dict) -> dict[str, Any]:
        """Extrait scores par quart-temps et meilleurs joueurs (tolérant aux manques)."""
        result: dict[str, Any] = {"game_id": game_id, "teams": [], "final": False, "plays": parse_plays(raw), "live_state": parse_game_state(raw), **parse_boxscore(raw)}
        try:
            comp = (raw.get("header", {}).get("competitions") or [{}])[0]
            result["final"] = bool((comp.get("status", {}).get("type") or {}).get("completed"))
            lines: dict[str, dict] = {}
            for c in comp.get("competitors", []):
                tid = str(c.get("id") or (c.get("team") or {}).get("id", ""))
                lines[tid] = {
                    "abbr": (c.get("team") or {}).get("abbreviation"),
                    "name": (c.get("team") or {}).get("displayName"),
                    "logo": (c.get("team") or {}).get("logos", [{}])[0].get("href")
                    if (c.get("team") or {}).get("logos") else (c.get("team") or {}).get("logo"),
                    "score": parse_score(c.get("score")),
                    "winner": c.get("winner", False),
                    "home_away": c.get("homeAway"),
                    "quarters": [_to_int(ls) for ls in (c.get("linescores") or [])],
                }
        except (KeyError, IndexError, TypeError, AttributeError) as err:
            _LOGGER.debug("Résumé %s : en-tête inattendu (%s)", game_id, err)
            lines = {}

        # Meilleurs joueurs : une entrée ESPN invalide ne doit pas masquer
        # les catégories suivantes ni les leaders de l'autre équipe.
        leaders = raw.get("leaders")
        if isinstance(leaders, list):
            for block in leaders:
                if not isinstance(block, dict):
                    continue
                team = block.get("team") if isinstance(block.get("team"), dict) else {}
                tid = str(team.get("id", ""))
                entry = lines.setdefault(tid, {
                    "abbr": team.get("abbreviation"),
                    "quarters": [],
                })
                top: list[dict] = []
                categories = block.get("leaders")
                if isinstance(categories, list):
                    for cat in categories:
                        if not isinstance(cat, dict):
                            continue
                        category_leaders = cat.get("leaders")
                        if not isinstance(category_leaders, list):
                            continue
                        leader = next(
                            (item for item in category_leaders if isinstance(item, dict)),
                            None,
                        )
                        if leader is None:
                            continue
                        athlete = leader.get("athlete")
                        if not isinstance(athlete, dict) or not athlete:
                            continue
                        headshot = athlete.get("headshot")
                        top.append({
                            "category": cat.get("displayName") or cat.get("name"),
                            "player": athlete.get("displayName"),
                            "headshot": headshot.get("href") if isinstance(headshot, dict) else headshot,
                            "value": leader.get("displayValue"),
                        })
                entry["top_players"] = top

        result["teams"] = list(lines.values())
        return result

    def _fire_events(self, games: list[dict]) -> None:
        """Envoie des événements HA quand un match de vos équipes démarre ou se termine."""
        for g in games:
            ids = {g["home"].get("id"), g["away"].get("id")}
            if not ids & set(self.teams):
                continue
            old = self._last_state.get(g["id"])
            new = g["state"]
            if old is not None and old != new:
                payload = {
                    "game_id": g["id"],
                    "home": g["home"].get("name"),
                    "away": g["away"].get("name"),
                    "home_score": g["home"].get("score"),
                    "away_score": g["away"].get("score"),
                    "favorite_team_ids": sorted(ids & set(self.teams)),
                }
                if new == "in" and self.entry.options.get(CONF_NOTIFY_START, True):
                    self.hass.bus.async_fire(EVENT_GAME_START, payload)
                elif new == "post" and self.entry.options.get(CONF_NOTIFY_END, True):
                    self.hass.bus.async_fire(EVENT_GAME_END, payload)
            self._last_state[g["id"]] = new
