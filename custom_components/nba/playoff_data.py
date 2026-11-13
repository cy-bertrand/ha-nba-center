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
