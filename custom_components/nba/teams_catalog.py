"""Parsing du catalogue ESPN des franchises NBA (sans dépendance Home Assistant)."""
from __future__ import annotations

from typing import Any

EXPECTED_NBA_TEAMS = 30


def _mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _text(value: Any) -> str | None:
    if value is None:
        return None
    result = str(value).strip()
    return result or None


def _first_logo(team: dict[str, Any]) -> str | None:
    logo = team.get("logo")
    if isinstance(logo, str):
        return _text(logo)
    logos = team.get("logos")
    if isinstance(logos, list):
        for item in logos:
            href = _text(_mapping(item).get("href"))
            if href:
                return href
    return None


def _team_rows(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Accepte les enveloppes ESPN teams classiques et une liste directe."""
    if isinstance(raw.get("teams"), list):
        return raw["teams"]
    sports = raw.get("sports")
    if isinstance(sports, list):
        for sport in sports:
            for league in _mapping(sport).get("leagues", []) or []:
                rows = _mapping(league).get("teams")
                if isinstance(rows, list):
                    return rows
    return []


def parse_teams_catalog(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise les franchises et signale explicitement un catalogue incomplet.

    Ne fabrique jamais une franchise pour atteindre 30 entrées. Les métadonnées
    de conférence/division sont facultatives car ESPN ne les fournit pas toujours
    dans la réponse du catalogue.
    """
    teams: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in _team_rows(_mapping(raw)):
        wrapper = _mapping(row)
        team = _mapping(wrapper.get("team")) or wrapper
        team_id = _text(team.get("id"))
        name = _text(team.get("displayName") or team.get("name"))
        abbreviation = _text(team.get("abbreviation"))
        if not team_id or not name or team_id in seen:
            continue
        seen.add(team_id)
        groups = _mapping(team.get("groups"))
        conference = _mapping(groups.get("parent"))
        division = _mapping(groups.get("child"))
        teams.append({
            "id": team_id,
            "name": name,
            "display_name": name,
            "abbreviation": abbreviation,
            "nickname": _text(team.get("nickname")),
            "logo": _first_logo(team),
            "color": _text(team.get("color")),
            "alternate_color": _text(team.get("alternateColor")),
            "conference": _text(conference.get("name") or team.get("conference")),
            "division": _text(division.get("name") or team.get("division")),
        })
    teams.sort(key=lambda item: (item["name"].casefold(), item["id"]))
    return {
        "teams": teams,
        "count": len(teams),
        "expected_count": EXPECTED_NBA_TEAMS,
        "complete": len(teams) == EXPECTED_NBA_TEAMS,
    }
