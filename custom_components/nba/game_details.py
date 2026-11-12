"""Normalisation pure des box scores ESPN NBA."""
from __future__ import annotations

from typing import Any


def _text(value: Any) -> str | None:
    if value is None:
        return None
    return str(value)


def parse_boxscore(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise les statistiques d'équipe et les lignes individuelles ESPN.

    ESPN expose boxscore.players comme un tableau par équipe ; chaque bloc
    statistics contient les en-têtes names et les lignes athletes associées.
    Les valeurs restent des chaînes (ex. 8-14, 35:42) pour ne rien déduire.
    """
    boxscore = raw.get("boxscore") or {}
    teams: dict[str, dict[str, Any]] = {}
    for block in boxscore.get("teams") or []:
        team = block.get("team") or {}
        team_id = _text(team.get("id"))
        if not team_id:
            continue
        teams[team_id] = {
            "team_id": team_id,
            "name": team.get("displayName") or team.get("name"),
            "abbr": team.get("abbreviation"),
            "statistics": [
                {
                    "name": stat.get("name"),
                    "label": stat.get("label") or stat.get("displayName") or stat.get("name"),
                    "value": _text(stat.get("displayValue", stat.get("value"))),
                }
                for stat in block.get("statistics") or []
                if stat.get("name") and stat.get("displayValue", stat.get("value")) is not None
            ],
        }

    player_blocks: list[dict[str, Any]] = []
    for block in boxscore.get("players") or []:
        team = block.get("team") or {}
        team_id = _text(team.get("id"))
        if not team_id:
            continue
        team_meta = teams.get(team_id, {})
        rows: list[dict[str, Any]] = []
        for group in block.get("statistics") or []:
            names = group.get("names") or group.get("labels") or []
            for athlete_row in group.get("athletes") or []:
                athlete = athlete_row.get("athlete") or {}
                values = athlete_row.get("stats") or []
                stats = {
                    str(name): _text(values[index]) if index < len(values) else None
                    for index, name in enumerate(names)
                }
                rows.append({
                    "id": _text(athlete.get("id")),
                    "name": athlete.get("displayName") or athlete.get("fullName"),
                    "short_name": athlete.get("shortName"),
                    "jersey": athlete.get("jersey"),
                    "position": (athlete_row.get("athlete") or {}).get("position", {}).get("abbreviation")
                        if isinstance((athlete_row.get("athlete") or {}).get("position"), dict)
                        else athlete_row.get("position"),
                    "headshot": (athlete.get("headshot") or {}).get("href")
                        if isinstance(athlete.get("headshot"), dict) else athlete.get("headshot"),
                    "starter": athlete_row.get("starter"),
                    "active": athlete_row.get("active"),
                    "did_not_play": athlete_row.get("didNotPlay", athlete_row.get("did_not_play")),
                    "ejected": athlete_row.get("ejected"),
                    "reason": athlete_row.get("reason"),
                    "stats": stats,
                })
        player_blocks.append({
            "team_id": team_id,
            "team": team_meta.get("name") or team.get("displayName"),
            "abbr": team_meta.get("abbr") or team.get("abbreviation"),
            "players": rows,
        })

    return {
        "team_stats": list(teams.values()),
        "player_stats": player_blocks,
        "has_boxscore": bool(teams or player_blocks),
    }
