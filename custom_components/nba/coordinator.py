"""Coordinateur : récupère les données ESPN et déclenche les événements."""
from __future__ import annotations

import asyncio
import logging
import math
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
from .player_data import parse_core_postseason_stats, parse_player_gamelog, parse_player_stats, season_matches_espn_year
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
    """Convertit un entier ESPN sans tronquer les fractions ni accepter booléens/infini."""
    if isinstance(value, dict):
        value = value.get("value", value.get("displayValue"))
    if isinstance(value, bool) or value is None or value == "":
        return 0
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError):
        return 0
    if not math.isfinite(number) or not number.is_integer():
        return 0
    return int(number)


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
        self._leaders_fetched: dict[str, datetime] = {}
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
        """Appel ESPN avec deux tentatives courtes pour les incidents réseau transitoires."""
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                async with self.session.get(url, params=params, timeout=20) as resp:
                    resp.raise_for_status()
                    payload = await resp.json()
                    if not isinstance(payload, dict):
                        raise ValueError(f"Réponse ESPN invalide pour {url}: objet JSON attendu")
                    return payload
            except Exception as err:  # noqa: BLE001 - les erreurs réseau ESPN varient selon aiohttp
                last_error = err
                if attempt < 2:
                    await asyncio.sleep(1 + attempt)
        assert last_error is not None
        raise last_error

    async def _async_update_data(self) -> dict[str, Any]:
        """Actualise chaque ressource indépendamment et conserve les dernières données valides."""
        previous = self.data or {}
        errors: list[str] = []

        try:
            scoreboard = await self._get(SCOREBOARD_URL)
            games = [g for g in (self._parse_game(e) for e in scoreboard.get("events", [])) if g]
        except Exception as err:  # noqa: BLE001 - une panne ESPN ne doit pas effacer les données déjà affichées
            errors.append(f"scoreboard: {err}")
            games = previous.get("games", [])
            _LOGGER.warning(
                "Scoreboard ESPN indisponible : démarrage en mode dégradé ou conservation des données précédentes (%s)",
                err,
            )

        try:
            standings_raw = await self._get(STANDINGS_URL)
            standings = self._parse_standings(standings_raw)
            if not standings and previous.get("standings"):
                raise ValueError("ESPN a renvoyé un classement vide")
        except Exception as err:  # noqa: BLE001
            errors.append(f"standings: {err}")
            standings = previous.get("standings", {})
            _LOGGER.warning("Classements ESPN indisponibles : conservation des données précédentes (%s)", err)

        team_data: dict[str, Any] = {}
        for team_id in self.teams:
            try:
                schedule = await self._get(TEAM_SCHEDULE_URL.format(team_id=team_id))
                team_data[team_id] = self._parse_team(team_id, schedule, games)
            except Exception as err:  # noqa: BLE001
                errors.append(f"schedule {team_id}: {err}")
                old_team = previous.get("teams", {}).get(team_id)
                if old_team is not None:
                    team_data[team_id] = old_team
                else:
                    team_data[team_id] = {
                        "name": team_id, "abbr": None, "logo": None,
                        "last": None, "next": None, "live": None, "recent": [],
                    }
                _LOGGER.warning("Calendrier ESPN indisponible pour %s : conservation des données précédentes (%s)", team_id, err)

        errors.extend(await self._update_leaders())
        errors.extend(await self._update_teams_catalog())

        # Enrichit les matchs récents sans rendre le rafraîchissement global dépendant
        # de la disponibilité de l'endpoint summary.
        detail_ids = list(dict.fromkeys(
            game["id"] for info in team_data.values() for game in info.get("recent", [])
        ))
        for game_id in detail_ids:
            summary = await self.async_get_game_details(game_id)
            detail = {"teams": summary.get("teams", [])} if summary and not summary.get("error") else {"teams": []}
            for info in team_data.values():
                for recent_game in info.get("recent", []):
                    if recent_game.get("id") == game_id:
                        recent_game["details"] = detail

        data = {
            "games": games,
            "standings": standings,
            "teams": team_data,
            "leaders": self._leaders,
            "postseason_leaders": self._postseason_leaders,
            "favorites": list(self.teams),
            "teams_catalog": self._teams_catalog,
            "data_errors": errors,
            "data_updated_at": dt_util.utcnow().isoformat(),
            "data_stale": bool(errors),
        }
        if any(error.startswith("scoreboard:") for error in errors):
            _LOGGER.warning("Événements NBA non évalués : scoreboard indisponible")
        else:
            self._fire_events(games)
        if errors:
            _LOGGER.warning("NBA Center utilise des données partiellement conservées : %s", "; ".join(errors))
        live = any(g.get("state") == "in" for g in games)
        self.update_interval = SCAN_INTERVAL_LIVE if live else SCAN_INTERVAL_IDLE
        return data

    async def _update_teams_catalog(self) -> list[str]:
        """Actualise le catalogue des franchises au maximum une fois par jour.

        Une réponse vide/incomplète ne remplace pas un catalogue complet déjà
        connu. Une panne du catalogue ne bloque pas les autres données NBA.
        """
        now = dt_util.utcnow()
        if self._teams_catalog_fetched and (now - self._teams_catalog_fetched).total_seconds() < 86400:
            return []
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
                return [f"teams_catalog: catalogue incomplet ({parsed['count']}/30), cache complet conservé"]
            self._teams_catalog = parsed
            self._teams_catalog_fetched = now
            if not parsed["complete"]:
                _LOGGER.warning("Catalogue ESPN incomplet : %s/30 franchises", parsed["count"])
                return [f"teams_catalog: catalogue incomplet ({parsed['count']}/30)"]
            return []
        except Exception as err:  # noqa: BLE001 - cette ressource ne bloque pas le coordinator
            _LOGGER.warning("Catalogue des franchises NBA indisponible : %s", err)
            return [f"teams_catalog: {err}"]

    async def _update_leaders(self) -> list[str]:
        """Actualise chaque classement indépendamment sans effacer les données valides."""
        now = dt_util.utcnow()
        regular = dict(self._leaders)
        postseason = dict(self._postseason_leaders)
        season_year = now.year + (1 if now.month >= 10 else 0)
        errors: list[str] = []

        for key, (_label, sort) in LEADER_CATEGORIES.items():
            for season_type, target, cache in (
                (2, regular, self._leaders),
                (3, postseason, self._postseason_leaders),
            ):
                cache_key = f"{season_type}:{key}"
                fetched_at = self._leaders_fetched.get(cache_key)
                if fetched_at and (now - fetched_at).total_seconds() < 3600:
                    continue

                params = {
                    "region": "us", "lang": "en", "contentorigin": "espn",
                    "season": season_year, "seasontype": season_type,
                    "isqualified": "true", "page": 1, "limit": LEADERS_COUNT, "sort": sort,
                }
                try:
                    raw = await self._get(LEADERS_URL, params=params)
                    expected = {
                        "points": "avgPoints", "rebounds": "avgRebounds",
                        "assists": "avgAssists", "steals": "avgSteals",
                        "blocks": "avgBlocks",
                    }[key]
                    categories = raw.get("categories")
                    if not isinstance(categories, list) or not any(
                        isinstance(category, dict)
                        and isinstance(category.get("names"), list)
                        and expected in category["names"]
                        for category in categories
                    ) or not isinstance(raw.get("athletes"), list):
                        raise ValueError(f"structure ESPN invalide ou statistique {expected} absente")
                    parsed = self._parse_leaders(raw, key)
                    self._leaders_fetched[cache_key] = now
                    if parsed:
                        target[key] = parsed
                    elif key in cache:
                        _LOGGER.debug("Classement ESPN vide (%s) ; cache conservé", cache_key)
                except Exception as err:  # noqa: BLE001
                    errors.append(f"leaders {cache_key}: {err}")
                    _LOGGER.warning(
                        "Classement ESPN indisponible (%s) ; cache conservé : %s",
                        cache_key, err,
                    )

        self._leaders = regular
        self._postseason_leaders = postseason
        return errors

    @staticmethod
    def _parse_leaders(raw: dict, key: str) -> list[dict]:
        """Extrait uniquement la statistique demandée ; aucune substitution silencieuse."""
        wanted = {
            "points": "avgPoints",
            "rebounds": "avgRebounds",
            "assists": "avgAssists",
            "steals": "avgSteals",
            "blocks": "avgBlocks",
        }.get(key)
        if not wanted or not isinstance(raw, dict):
            return []

        positions: list[tuple[int, int]] = []
        categories = raw.get("categories")
        athletes = raw.get("athletes")
        if not isinstance(categories, list) or not isinstance(athletes, list):
            return []
        for category_index, category in enumerate(categories):
            if not isinstance(category, dict):
                continue
            names = category.get("names")
            if isinstance(names, list):
                positions.extend(
                    (category_index, stat_index)
                    for stat_index, name in enumerate(names)
                    if name == wanted
                )
        if not positions:
            return []

        rows: list[dict] = []
        for item in athletes:
            if not isinstance(item, dict):
                continue
            athlete = item.get("athlete")
            if not isinstance(athlete, dict) or not athlete.get("displayName"):
                continue
            athlete_categories = item.get("categories")
            if not isinstance(athlete_categories, list):
                continue
            value = None
            for category_index, stat_index in positions:
                try:
                    values = athlete_categories[category_index].get("values")
                    if isinstance(values, list) and stat_index < len(values):
                        value = values[stat_index]
                        break
                except (IndexError, TypeError, AttributeError):
                    continue
            if value is None:
                continue
            try:
                numeric_value = float(value)
            except (TypeError, ValueError, OverflowError):
                continue
            if not math.isfinite(numeric_value):
                continue
            numeric_value = round(numeric_value, 1)

            athlete_team = athlete.get("team") if isinstance(athlete.get("team"), dict) else {}
            team_logos = athlete_team.get("logos") or athlete.get("teamLogos") or []
            team_logo = athlete_team.get("logo")
            if not team_logo and team_logos and isinstance(team_logos[0], dict):
                team_logo = team_logos[0].get("href")
            headshot = athlete.get("headshot")
            rows.append({
                "rank": len(rows) + 1,
                "id": str(athlete.get("id")) if athlete.get("id") is not None else None,
                "player": athlete.get("displayName"),
                "team": athlete_team.get("abbreviation") or athlete.get("teamAbbreviation")
                        or athlete.get("teamShortName") or athlete.get("teamName"),
                "team_abbreviation": athlete_team.get("abbreviation") or athlete.get("teamAbbreviation"),
                "team_id": str(athlete_team.get("id") or athlete.get("teamId"))
                           if athlete_team.get("id") or athlete.get("teamId") else None,
                "team_logo": team_logo,
                "headshot": headshot.get("href") if isinstance(headshot, dict) else headshot,
                "value": numeric_value,
            })
            if len(rows) >= LEADERS_COUNT:
                break
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
        # L'ordre des événements ESPN n'est pas garanti : trier avant de retenir
        # le dernier match terminé et les cinq rencontres récentes.
        history.sort(key=lambda game: game.get("date") or "")
        last = history[-1] if history else None
        upcoming = [
            self._parse_game(event)
            for event in schedule.get("events", [])
        ]
        upcoming = [
            game for game in upcoming
            if game and game["state"] in ("pre", "in")
        ]
        upcoming.sort(key=lambda game: game.get("date") or "")
        nxt = upcoming[0] if upcoming else None
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
                    "result": "V" if me.get("winner") is True else (
                        "D" if opp.get("winner") is True else "—"
                    ),
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
                # Le Web API v3 expose les catégories de moyennes par match (avgMinutes,
                # avgPoints, etc.). Il est prioritaire : on affiche les valeurs ESPN telles
                # quelles, sans recalculer des moyennes à partir de totaux.
                try:
                    postseason_raw = await self._get(
                        PLAYER_DATA_URL.format(player_id=player_id, resource="stats"),
                        params={"season": season_year, "seasontype": 3},
                    )
                    parsed_postseason = parse_player_stats(postseason_raw, season_year=season_year)
                    if (parsed_postseason.get("season_type_id") == "3"
                            and season_matches_espn_year(str(parsed_postseason.get("season") or ""), season_year)
                            and parsed_postseason.get("statistics")):
                        postseason_stats = parsed_postseason
                except Exception as err:  # noqa: BLE001 - Core v2 reste le fallback historique
                    _LOGGER.debug(
                        "Web v3 playoffs indisponible pour le joueur %s / saison %s: %s",
                        player_id, season_year, err,
                    )

                # Core v2 ne sert que de repli si le Web v3 ne fournit pas le split
                # playoffs demandé. Ses valeurs sont conservées telles que renvoyées.
                if not postseason_stats:
                    core_url = (
                        "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/"
                        f"seasons/{season_year}/types/3/athletes/{player_id}/statistics/"
                    )
                    try:
                        core_raw = await self._get(core_url)
                        postseason_stats = parse_core_postseason_stats(core_raw, season_year)
                        if not postseason_stats.get("statistics"):
                            postseason_stats = {}
                    except Exception as core_err:  # noqa: BLE001 - les playoffs ne bloquent jamais le profil régulier
                        _LOGGER.debug(
                            "Core v2 playoffs indisponible pour le joueur %s / saison %s: %s",
                            player_id, season_year, core_err,
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

        try:
            details = self._parse_summary(game_id, raw)
        except Exception as err:  # noqa: BLE001 - une réponse ESPN mal formée ne doit pas casser le websocket
            _LOGGER.warning("Résumé ESPN mal formé pour le match %s: %s", game_id, err)
            return {"game_id": game_id, "error": f"Réponse ESPN invalide: {err}", "teams": []}
        if not isinstance(details, dict):
            return {"game_id": game_id, "error": "Réponse ESPN invalide: résumé inattendu", "teams": []}
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
