"""Normalisation des effectifs NBA renvoyés par ESPN."""
from __future__ import annotations

from typing import Any
import re


def _mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _text(value: Any) -> str | None:
    if value is None:
        return None
    result = str(value).strip()
    return result or None


def parse_team_roster(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise le tableau ESPN athletes[] sans inventer de données."""
    season = _mapping(_mapping(raw).get("season"))
    athletes = _mapping(raw).get("athletes")
    if not isinstance(athletes, list):
        athletes = []

    players: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in athletes:
        athlete = _mapping(row)
        player_id = _text(athlete.get("id"))
        name = _text(athlete.get("displayName") or athlete.get("fullName"))
        if not player_id or not name or player_id in seen:
            continue
        seen.add(player_id)
        position = _mapping(athlete.get("position"))
        headshot = _mapping(athlete.get("headshot"))
        college = _mapping(athlete.get("college"))
        status = _mapping(athlete.get("status"))
        injuries = athlete.get("injuries")
        injury_rows = []
        if isinstance(injuries, list):
            for injury in injuries:
                item = _mapping(injury)
                if item:
                    injury_rows.append({
                        "status": _text(item.get("status")),
                        "date": _text(item.get("date")),
                    })
        experience = _mapping(athlete.get("experience"))
        height_text = _text(athlete.get("displayHeight"))
        weight_text = _text(athlete.get("displayWeight"))
        height_match = re.search(r"(\\d+)\\s*'\\s*(\\d+)", height_text or "")
        weight_match = re.search(r"(\\d+(?:\\.\\d+)?)", weight_text or "")
        height_cm = round((int(height_match.group(1)) * 12 + int(height_match.group(2))) * 2.54) if height_match else None
        weight_kg = round(float(weight_match.group(1)) * 0.45359237, 1) if weight_match else None
        players.append({
            "id": player_id,
            "name": name,
            "short_name": _text(athlete.get("shortName")),
            "headshot": _text(headshot.get("href")),
            "jersey": _text(athlete.get("jersey")),
            "position": _text(position.get("abbreviation") or position.get("displayName")),
            "position_name": _text(position.get("displayName") or position.get("name")),
            "height": height_text,
            "weight": weight_text,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "age": athlete.get("age") if isinstance(athlete.get("age"), (int, float)) else None,
            "college": _text(college.get("shortName") or college.get("name")),
            "experience_years": experience.get("years") if isinstance(experience.get("years"), (int, float)) else None,
            "status": _text(status.get("name") or status.get("abbreviation")),
            "injuries": injury_rows,
        })
    players.sort(key=lambda player: (
        player["position"] or "Z",
        int(player["jersey"]) if (player["jersey"] or "").isdigit() else 999,
        player["name"].casefold(),
    ))
    return {
        "season": _text(season.get("displayName")),
        "season_year": season.get("year") if isinstance(season.get("year"), int) else None,
        "players": players,
        "count": len(players),
    }
