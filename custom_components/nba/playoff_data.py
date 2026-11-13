"""Parsing pur des événements NBA postseason ESPN.

Ce module n'effectue aucun appel réseau et ne dépend pas de Home Assistant.
Il normalise les deux variantes observées : calendrier d'équipe et scoreboard.
"""
from __future__ import annotations

import re
from typing import Any

POSTSEASON = 3
PLAY_IN = 5

_GAME_LABEL = re.compile(r"^(?P<round>.+?)\s*-\s*Game\s+(?P<number>\d+)\s*$", re.IGNORECASE)


def _mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _season_type(event: dict[str, Any]) -> int | None:
    """Le scoreboard et le calendrier d'équipe exposent le type à des endroits différents."""
    season = _mapping(event.get("season"))
    season_type = _mapping(event.get("seasonType"))
    raw = season.get("type")
    if raw is None:
        raw = season_type.get("type", season_type.get("id"))
    try:
        return int(raw)
    except (TypeError, ValueError, OverflowError):
        return None


def _score(value: Any) -> int | None:
    """Accepte les scores scoreboard (string/int) et schedule ({value, displayValue})."""
    if isinstance(value, dict):
        value = value.get("value", value.get("displayValue"))
        if value is None:
            return None
    if isinstance(value, bool) or value is None or value == "":
        return None
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError):
        return None
    if not number.is_integer():
        return None
    return int(number)


def _headline(competition: dict[str, Any]) -> str | None:
    notes = competition.get("notes")
    if not isinstance(notes, list):
        return None
    for note in notes:
        headline = _mapping(note).get("headline")
        if isinstance(headline, str) and headline.strip():
            return headline.strip()
    return None


def _team(competitor: dict[str, Any]) -> dict[str, Any]:
    team = _mapping(competitor.get("team"))
    team_id = competitor.get("id") or team.get("id")
    return {
        "id": str(team_id) if team_id is not None else None,
        "name": team.get("displayName") or team.get("name"),
        "abbreviation": team.get("abbreviation"),
        "home_away": competitor.get("homeAway"),
        "score": _score(competitor.get("score")),
        "winner": competitor.get("winner") if isinstance(competitor.get("winner"), bool) else None,
    }


def _series(competition: dict[str, Any]) -> dict[str, Any] | None:
    raw = competition.get("series")
    if not isinstance(raw, dict):
        return None
    teams = []
    raw_teams = raw.get("competitors")
    if isinstance(raw_teams, list):
        for item in raw_teams:
            item = _mapping(item)
            team_id = item.get("id")
            wins = item.get("wins")
            try:
                wins = int(wins) if wins is not None else None
            except (TypeError, ValueError, OverflowError):
                wins = None
            teams.append({"team_id": str(team_id) if team_id is not None else None, "wins": wins})
    total = raw.get("totalCompetitions")
    try:
        total = int(total) if total is not None else None
    except (TypeError, ValueError, OverflowError):
        total = None
    return {
        "summary": raw.get("summary") if isinstance(raw.get("summary"), str) else None,
        "completed": raw.get("completed") if isinstance(raw.get("completed"), bool) else None,
        "total_games": total,
        "teams": teams,
    }


def parse_playoff_event(event: Any) -> dict[str, Any] | None:
    """Normalise un événement postseason ou Play-In ; ignore les autres saisons."""
    if not isinstance(event, dict):
        return None

    season_type = _season_type(event)
    if season_type not in (POSTSEASON, PLAY_IN):
        return None

    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions or not isinstance(competitions[0], dict):
        return None
    competition = competitions[0]

    raw_competitors = competition.get("competitors")
    if not isinstance(raw_competitors, list):
        return None
    competitors = [_team(_mapping(item)) for item in raw_competitors if isinstance(item, dict)]
    if len(competitors) != 2 or any(team["id"] is None for team in competitors):
        return None
    competitors.sort(key=lambda team: 0 if team["home_away"] == "home" else 1 if team["home_away"] == "away" else 2)
    if competitors[0]["id"] == competitors[1]["id"]:
        return None

    headline = _headline(competition)
    match = _GAME_LABEL.match(headline or "")
    round_label = match.group("round").strip() if match else None
    game_number = int(match.group("number")) if match else None

    season = _mapping(event.get("season"))
    requested = _mapping(event.get("requestedSeason"))
    year = season.get("year")
    if year is None:
        year = requested.get("year")
    try:
        year = int(year) if year is not None else None
    except (TypeError, ValueError, OverflowError):
        year = None

    status = _mapping(_mapping(competition.get("status")).get("type"))
    series = _series(competition)
    return {
        "id": str(event.get("id")) if event.get("id") is not None else None,
        "date": event.get("date") if isinstance(event.get("date"), str) else None,
        "name": event.get("name") if isinstance(event.get("name"), str) else None,
        "season_year": year,
        "season_type": season_type,
        "phase": "play_in" if season_type == PLAY_IN else "playoffs",
        "label": headline,
        "round_label": round_label,
        "game_number": game_number,
        "competition_type": _mapping(competition.get("type")).get("text")
            or _mapping(competition.get("type")).get("abbreviation"),
        "completed": status.get("completed") if isinstance(status.get("completed"), bool) else None,
        "teams": competitors,
        "series": series,
    }


def parse_playoff_payload(payload: Any) -> list[dict[str, Any]]:
    """Parse les événements d'une réponse ESPN en ignorant les entrées invalides."""
    events = _mapping(payload).get("events")
    if not isinstance(events, list):
        return []
    parsed = []
    for event in events:
        result = parse_playoff_event(event)
        if result is not None:
            parsed.append(result)
    return parsed



def build_playoff_series(games: Any) -> list[dict[str, Any]]:
    """Reconstruit les séries à partir des événements normalisés.

    Une série est groupée par saison, phase, libellé de tour et paire d'équipes.
    Seuls les vainqueurs explicitement déclarés sur un match explicitement terminé
    sont comptabilisés. Les données ambiguës restent visibles mais non tranchées.
    """
    if not isinstance(games, (list, tuple)):
        return []

    grouped: dict[tuple[Any, ...], list[dict[str, Any]]] = {}
    for game in games:
        if not isinstance(game, dict) or game.get("phase") != "playoffs":
            continue
        year = game.get("season_year")
        round_label = game.get("round_label")
        teams = game.get("teams")
        if year is None or not isinstance(round_label, str) or not round_label.strip():
            continue
        if not isinstance(teams, list) or len(teams) != 2:
            continue
        if any(not isinstance(team, dict) or team.get("id") is None for team in teams):
            continue
        team_ids = tuple(sorted(str(team["id"]) for team in teams))
        if team_ids[0] == team_ids[1]:
            continue
        key = (year, game.get("phase"), round_label.strip(), team_ids)
        grouped.setdefault(key, []).append(game)

    series_list = []
    for (year, phase, round_label, team_ids), series_games in grouped.items():
        # Keep the first useful metadata for each team, independent of home/away.
        team_info: dict[str, dict[str, Any]] = {}
        for game in series_games:
            for team in game["teams"]:
                team_info.setdefault(str(team["id"]), {
                    "id": str(team["id"]),
                    "name": team.get("name"),
                    "abbreviation": team.get("abbreviation"),
                    "wins": 0,
                })

        unique_games: dict[str, dict[str, Any]] = {}
        for index, game in enumerate(series_games):
            game_id = game.get("id")
            identity = str(game_id) if game_id is not None else f"__index_{index}"
            unique_games[identity] = game
        ordered_games = list(unique_games.values())
        ordered_games.sort(key=lambda game: (
            game.get("game_number") if isinstance(game.get("game_number"), int) else 999,
            game.get("date") or "",
            game.get("id") or "",
        ))

        completed_games = 0
        unknown_results = 0
        for game in ordered_games:
            if game.get("completed") is not True:
                unknown_results += 1
                continue
            completed_games += 1
            winners = [
                team for team in game["teams"]
                if team.get("winner") is True
            ]
            if len(winners) != 1:
                unknown_results += 1
                continue
            team_info[str(winners[0]["id"])]["wins"] += 1

        duplicate_game_numbers = []
        numbers = [
            game["game_number"] for game in ordered_games
            if isinstance(game.get("game_number"), int)
        ]
        seen_numbers = set()
        for number in numbers:
            if number in seen_numbers and number not in duplicate_game_numbers:
                duplicate_game_numbers.append(number)
            seen_numbers.add(number)

        ordered_teams = [team_info[team_id] for team_id in team_ids]
        ordered_teams.sort(key=lambda team: (-team["wins"], team["id"]))
        max_wins = max((team["wins"] for team in ordered_teams), default=0)
        winners = [team for team in ordered_teams if team["wins"] >= 4]
        issues = []
        if len(ordered_games) > 7:
            issues.append("more_than_7_games")
        if len(winners) > 1:
            issues.append("both_teams_reached_4_wins")
        if duplicate_game_numbers:
            issues.append("duplicate_game_numbers")

        champion = winners[0] if len(winners) == 1 and not issues else None
        status = "completed" if champion else "inconsistent" if issues else "in_progress"
        series_list.append({
            "id": f"{year}:{phase}:{round_label}:{team_ids[0]}:{team_ids[1]}",
            "season_year": year,
            "phase": phase,
            "round_label": round_label,
            "status": status,
            "winner": dict(champion) if champion else None,
            "games_played": len(ordered_games),
            "completed_games": completed_games,
            "unknown_results": unknown_results,
            "teams": ordered_teams,
            "issues": issues,
            "games": ordered_games,
        })

    series_list.sort(key=lambda series: (
        series["season_year"],
        series["round_label"].casefold(),
        series["teams"][0]["id"],
        series["teams"][1]["id"],
    ))
    return series_list



def _round_metadata(label: str) -> tuple[str | None, int | None]:
    """Retourne conférence et rang depuis les libellés ESPN connus."""
    normalized = " ".join(label.casefold().split())
    if normalized == "nba finals":
        return "NBA", 4
    if normalized in ("east 1st round", "west 1st round", "east first round", "west first round"):
        return ("East" if normalized.startswith("east ") else "West"), 1
    if normalized in ("east semifinals", "west semifinals"):
        return ("East" if normalized.startswith("east ") else "West"), 2
    if normalized in ("east finals", "west finals"):
        return ("East" if normalized.startswith("east ") else "West"), 3
    return None, None


def build_playoff_bracket(series: Any) -> list[dict[str, Any]]:
    """Construit les parcours vérifiables entre séries, sans inventer de seeds.

    Les liens sont établis uniquement lorsqu'un vainqueur explicite d'un tour
    apparaît parmi les deux équipes d'une série du tour immédiatement suivant.
    Les positions de tableau et les têtes de série ne sont pas déduites.
    """
    if not isinstance(series, (list, tuple)):
        return []

    by_season: dict[int, list[dict[str, Any]]] = {}
    for item in series:
        if not isinstance(item, dict) or item.get("phase") != "playoffs":
            continue
        year = item.get("season_year")
        label = item.get("round_label")
        if not isinstance(year, int) or not isinstance(label, str):
            continue
        by_season.setdefault(year, []).append(item)

    brackets = []
    for year, season_series in sorted(by_season.items()):
        metadata = {}
        for item in season_series:
            conference, rank = _round_metadata(item["round_label"])
            metadata[item["id"]] = (conference, rank)

        links_out: dict[str, list[str]] = {item["id"]: [] for item in season_series}
        links_in: dict[str, list[str]] = {item["id"]: [] for item in season_series}
        for previous in season_series:
            winner = previous.get("winner")
            if not isinstance(winner, dict) or winner.get("id") is None:
                continue
            previous_conference, previous_rank = metadata[previous["id"]]
            if previous_rank is None:
                continue
            candidates = []
            for following in season_series:
                following_conference, following_rank = metadata[following["id"]]
                if following_rank != previous_rank + 1:
                    continue
                if previous_conference == "NBA":
                    continue
                if previous_conference in ("East", "West") and following_conference not in (previous_conference, "NBA"):
                    continue
                if following_conference is None:
                    continue
                team_ids = {
                    str(team.get("id")) for team in following.get("teams", [])
                    if isinstance(team, dict) and team.get("id") is not None
                }
                if str(winner["id"]) in team_ids:
                    candidates.append(following)
            if len(candidates) == 1:
                target_id = candidates[0]["id"]
                links_out[previous["id"]].append(target_id)
                links_in[target_id].append(previous["id"])

        for item in season_series:
            item["advances_to"] = links_out[item["id"]]
            item["advanced_from"] = links_in[item["id"]]

        conferences = {"East": [], "West": []}
        finals = []
        unplaced = []
        grouped: dict[tuple[str, str], list[dict[str, Any]]] = {}
        for item in season_series:
            conference, _rank = metadata[item["id"]]
            if conference == "NBA":
                finals.append(item)
            elif conference in conferences:
                grouped.setdefault((conference, item["round_label"]), []).append(item)
            else:
                unplaced.append(item)

        for (conference, label), items in grouped.items():
            conferences[conference].append({
                "round_label": label,
                "series": sorted(items, key=lambda item: item["id"]),
            })
        for conference in conferences:
            conferences[conference].sort(
                key=lambda round_data: _round_metadata(round_data["round_label"])[1] or 999
            )
        brackets.append({
            "season_year": year,
            "conferences": conferences,
            "finals": sorted(finals, key=lambda item: item["id"]),
            "unplaced": sorted(unplaced, key=lambda item: item["id"]),
        })

    return brackets


def parse_playoff_standings(payload: Any) -> list[dict[str, Any]]:
    """Extrait les seeds et identifiants d'équipes des standings ESPN.

    Les entrées sont classées par conférence à partir de l'arborescence
    children[].standings.entries[]. Le champ playoffSeed est conservé comme
    seed ESPN observé ; cette fonction ne prétend pas qu'il est toujours final.
    """
    root = _mapping(payload)
    children = root.get("children")
    if not isinstance(children, list):
        return []

    result: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for group in children:
        group = _mapping(group)
        conference = group.get("abbreviation") or group.get("name")
        standings = _mapping(group.get("standings"))
        season_label = standings.get("seasonDisplayName")
        entries = standings.get("entries")
        if not isinstance(entries, list):
            continue
        for entry in entries:
            entry = _mapping(entry)
            team = _mapping(entry.get("team"))
            team_id = team.get("id")
            abbreviation = team.get("abbreviation")
            if team_id is None or not isinstance(abbreviation, str) or not abbreviation:
                continue
            identity = (str(team_id), str(conference))
            if identity in seen:
                continue
            seen.add(identity)
            stats = entry.get("stats")
            stats_by_type = {
                item.get("type"): item
                for item in stats if isinstance(item, dict) and isinstance(item.get("type"), str)
            } if isinstance(stats, list) else {}

            def numeric_stat(name: str) -> int | None:
                raw = _mapping(stats_by_type.get(name)).get("value")
                if isinstance(raw, bool) or raw is None:
                    return None
                try:
                    number = float(raw)
                except (TypeError, ValueError, OverflowError):
                    return None
                return int(number) if number.is_integer() else None

            def display_stat(name: str) -> str | None:
                value = _mapping(stats_by_type.get(name)).get("displayValue")
                return value if isinstance(value, str) else None

            result.append({
                "team_id": str(team_id),
                "abbreviation": abbreviation,
                "name": team.get("displayName") or team.get("name"),
                "conference": str(conference) if conference is not None else None,
                "season": season_label if isinstance(season_label, str) else None,
                "seed": numeric_stat("playoffseed"),
                "clincher": display_stat("clincher"),
                "wins": numeric_stat("wins"),
                "losses": numeric_stat("losses"),
                "seed_description": _mapping(stats_by_type.get("playoffseed")).get("description"),
            })
    result.sort(key=lambda item: (
        item["season"] or "",
        item["conference"] or "",
        item["seed"] if item["seed"] is not None else 999,
        item["team_id"],
    ))
    return result



def validate_playoff_seeds(teams: Any) -> dict[str, Any]:
    """Valide les seeds ESPN 1..8 par saison/conférence.

    Les équipes 9..15 sont conservées hors du bracket. Une conférence n'est
    exploitable que si chaque seed 1..8 apparaît une fois et si les IDs sont
    uniques. Les résultats incomplets ou ambigus ne produisent aucun mapping.
    """
    if not isinstance(teams, (list, tuple)):
        teams = []
    groups: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for team in teams:
        if not isinstance(team, dict):
            continue
        season = team.get("season")
        conference = team.get("conference")
        if isinstance(season, str) and season and conference in ("East", "West"):
            groups.setdefault((season, conference), []).append(team)

    seasons: dict[str, dict[str, Any]] = {}
    for (season, conference), entries in sorted(groups.items()):
        ids = [str(item.get("team_id")) for item in entries if item.get("team_id") is not None]
        seeds: dict[int, list[str]] = {}
        errors: list[str] = []
        if len(ids) != len(entries) or len(set(ids)) != len(ids):
            errors.append("duplicate_or_missing_team_ids")
        for item in entries:
            seed = item.get("seed")
            if isinstance(seed, int) and not isinstance(seed, bool) and 1 <= seed <= 8:
                seeds.setdefault(seed, []).append(str(item["team_id"]))
        for seed in range(1, 9):
            count = len(seeds.get(seed, []))
            if count == 0:
                errors.append(f"missing_seed_{seed}")
            elif count > 1:
                errors.append(f"duplicate_seed_{seed}")
        valid = not errors and len(seeds) == 8
        season_result = seasons.setdefault(season, {"conferences": {}})
        season_result["conferences"][conference] = {
            "valid": valid,
            "errors": errors,
            "seeds": {seed: ids[0] for seed, ids in sorted(seeds.items())} if valid else {},
        }
    return {"seasons": seasons}


def annotate_playoff_bracket(bracket: Any, standings: Any) -> dict[str, Any] | None:
    """Retourne une copie du bracket annotée avec les seeds validés.

    Les seeds sont attachés aux participants de chaque série. Les affiches du
    premier tour sont contrôlées contre 1-8, 2-7, 3-6 et 4-5 ; aucune position
    de match n'est attribuée si le contrôle des quatre séries est incomplet ou
    incohérent. L'entrée n'est jamais mutée.
    """
    import copy

    if not isinstance(bracket, dict) or not isinstance(standings, dict):
        return None
    result = copy.deepcopy(bracket)
    season = str(result.get("season_year"))
    season_data = standings.get("seasons", {}).get(season)
    if not isinstance(season_data, dict):
        return result
    for conference in ("East", "West"):
        seed_data = season_data.get("conferences", {}).get(conference, {})
        if not seed_data.get("valid"):
            continue
        seed_by_id = {str(team_id): seed for seed, team_id in seed_data["seeds"].items()}
        rounds = result.get("conferences", {}).get(conference, [])
        first_round = next((item for item in rounds if _round_metadata(item.get("round_label", ""))[1] == 1), None)
        for round_data in rounds:
            for series_item in round_data.get("series", []):
                for team in series_item.get("teams", []):
                    team["seed"] = seed_by_id.get(str(team.get("id")))
        if first_round is None:
            continue
        series_items = first_round.get("series", [])
        actual = set()
        for series_item in series_items:
            team_seeds = sorted(
                team.get("seed") for team in series_item.get("teams", [])
                if isinstance(team.get("seed"), int)
            )
            if len(team_seeds) == 2:
                actual.add(tuple(team_seeds))
        expected = {(1, 8), (2, 7), (3, 6), (4, 5)}
        first_round["matchups_valid"] = len(series_items) == 4 and actual == expected
        if first_round["matchups_valid"]:
            first_round["series"] = sorted(
                series_items,
                key=lambda item: tuple(sorted(
                    team.get("seed") for team in item.get("teams", [])
                    if isinstance(team.get("seed"), int)
                )),
            )
    return result
