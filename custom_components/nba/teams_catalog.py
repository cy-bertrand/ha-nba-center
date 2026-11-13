"""Parsing du catalogue ESPN des franchises NBA (sans dépendance Home Assistant)."""
from __future__ import annotations

from typing import Any

EXPECTED_NBA_TEAMS = 30

TEAM_GROUPS = {
    "ATL": ("Eastern Conference", "Southeast Division"), "BOS": ("Eastern Conference", "Atlantic Division"),
    "BKN": ("Eastern Conference", "Atlantic Division"), "CHA": ("Eastern Conference", "Southeast Division"),
    "CHI": ("Eastern Conference", "Central Division"), "CLE": ("Eastern Conference", "Central Division"),
    "DET": ("Eastern Conference", "Central Division"), "IND": ("Eastern Conference", "Central Division"),
    "MIA": ("Eastern Conference", "Southeast Division"), "MIL": ("Eastern Conference", "Central Division"),
    "NYK": ("Eastern Conference", "Atlantic Division"), "NY": ("Eastern Conference", "Atlantic Division"), "ORL": ("Eastern Conference", "Southeast Division"),
    "PHI": ("Eastern Conference", "Atlantic Division"), "TOR": ("Eastern Conference", "Atlantic Division"),
    "WAS": ("Eastern Conference", "Southeast Division"), "DAL": ("Western Conference", "Southwest Division"),
    "DEN": ("Western Conference", "Northwest Division"), "GSW": ("Western Conference", "Pacific Division"), "GS": ("Western Conference", "Pacific Division"),
    "HOU": ("Western Conference", "Southwest Division"), "LAC": ("Western Conference", "Pacific Division"),
    "LAL": ("Western Conference", "Pacific Division"), "MEM": ("Western Conference", "Southwest Division"),
    "MIN": ("Western Conference", "Northwest Division"), "NOP": ("Western Conference", "Southwest Division"), "NO": ("Western Conference", "Southwest Division"),
    "OKC": ("Western Conference", "Northwest Division"), "PHX": ("Western Conference", "Pacific Division"),
    "POR": ("Western Conference", "Northwest Division"), "SAC": ("Western Conference", "Pacific Division"),
    "SAS": ("Western Conference", "Southwest Division"), "SA": ("Western Conference", "Southwest Division"), "UTA": ("Western Conference", "Northwest Division"),
}


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
        known_conference, known_division = TEAM_GROUPS.get(abbreviation or "", (None, None))
        teams.append({
            "id": team_id,
            "name": name,
            "display_name": name,
            "abbreviation": abbreviation,
            "nickname": _text(team.get("nickname")),
            "logo": _first_logo(team),
            "color": _text(team.get("color")),
            "alternate_color": _text(team.get("alternateColor")),
            "conference": _text(conference.get("name") or team.get("conference") or known_conference),
            "division": _text(division.get("name") or team.get("division") or known_division),
        })
    teams.sort(key=lambda item: (item["name"].casefold(), item["id"]))
    return {
        "teams": teams,
        "count": len(teams),
        "expected_count": EXPECTED_NBA_TEAMS,
        "complete": len(teams) == EXPECTED_NBA_TEAMS,
    }
