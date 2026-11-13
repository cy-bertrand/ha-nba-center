"""Normalisation pure des box scores et actions ESPN NBA."""
from __future__ import annotations

import re
from typing import Any


def _text(value: Any) -> str | None:
    return None if value is None else str(value)


def _mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _coordinate(value: Any) -> dict[str, float] | None:
    coordinate = _mapping(value)
    x, y = coordinate.get("x"), coordinate.get("y")
    # ESPN uses large negative sentinels when no shot location exists.
    if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
        return None
    if abs(x) > 10000 or abs(y) > 10000:
        return None
    return {"x": x, "y": y}


def _score(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _classify_play(play_type: str | None, short_description: str | None,
                   text: str | None) -> str:
    """Classify common ESPN play-by-play events for consistent UI treatment."""
    combined = " ".join(filter(None, (play_type, short_description, text))).lower()
    if "end game" in combined or "end of game" in combined:
        return "game_end"
    if "end period" in (play_type or "").lower() or re.search(r"end of (the )?[1-4](st|nd|rd|th)", combined):
        return "period_end"
    if "foul" in combined:
        return "foul"
    if "rebound" in combined:
        return "rebound"
    if "substitution" in combined:
        return "substitution"
    if "turnover" in combined:
        return "turnover"
    if "timeout" in combined:
        return "timeout"
    if "jumpball" in combined or "jump ball" in combined:
        return "jump_ball"
    if "violation" in combined or "goaltending" in combined:
        return "violation"
    if "challenge" in combined:
        return "challenge"
    if "missed" in combined:
        return "missed_shot"
    if "point" in combined or "made" in (play_type or "").lower():
        return "score"
    return "other"


def parse_plays(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Normalise summary.plays and derive score/event markers without losing source data."""
    plays: list[dict[str, Any]] = []
    previous_home: int | None = None
    previous_away: int | None = None
    for item in raw.get("plays") or []:
        if not isinstance(item, dict):
            continue
        period = _mapping(item.get("period"))
        clock = _mapping(item.get("clock"))
        play_type = _mapping(item.get("type"))
        team = _mapping(item.get("team"))
        type_text = play_type.get("text") or play_type.get("description") or _text(item.get("type"))
        text = item.get("text") or item.get("shortText")
        short_description = item.get("shortDescription")
        home = _score(item.get("homeScore"))
        away = _score(item.get("awayScore"))
        score_changed = (
            (home is not None and previous_home is not None and home != previous_home)
            or (away is not None and previous_away is not None and away != previous_away)
        )
        participants = []
        for participant in item.get("participants") or []:
            athlete = _mapping(_mapping(participant).get("athlete"))
            athlete_id = _text(athlete.get("id"))
            if athlete_id:
                participants.append(athlete_id)
        category = _classify_play(type_text, short_description, text)
        # Prefer ESPN structured labels for flags: free-form commentary can mention\n        # another event (for example, a timeout during a foul review) and create\n        # false positives. Keep the play text for display, not event detection.\n        event_text = " ".join(filter(None, (type_text, short_description))).lower()
        plays.append({
            "id": _text(item.get("id")),
            "sequence_number": _text(item.get("sequenceNumber")),
            "text": text,
            "short_description": short_description,
            "period": _text(period.get("number", item.get("periodNumber", item.get("period")))),
            "period_display": period.get("displayValue"),
            "clock": clock.get("displayValue") or clock.get("value") or _text(item.get("clock")),
            "type": type_text,
            "team_id": _text(team.get("id")),
            "score_value": _text(item.get("scoreValue")),
            "home_score": _text(item.get("homeScore")),
            "away_score": _text(item.get("awayScore")),
            "scoring": bool(item.get("scoringPlay", False)),
            "score_changed": score_changed,
            "action_category": category,
            "is_period_end": category == "period_end",
            "is_game_end": category == "game_end",
            "is_foul": "foul" in event_text,
            "is_turnover": "turnover" in event_text,
            "is_rebound": "rebound" in event_text,
            "is_timeout": "timeout" in event_text,
            "is_substitution": "substitution" in event_text,
            "is_missed_shot": "missed" in event_text,
            "is_challenge": "challenge" in event_text,
            "is_violation": "violation" in event_text or "goaltending" in event_text,
            "shooting": bool(item.get("shootingPlay", False)),
            "participants": participants,
            "wallclock": item.get("wallclock"),
            "points_attempted": _text(item.get("pointsAttempted")),
            "coordinate": _coordinate(item.get("coordinate")),
        })
        # ESPN normally provides a score snapshot on each play. Keep the last
        # valid snapshot so sparse events do not reset score-change detection.
        if home is not None:
            previous_home = home
        if away is not None:
            previous_away = away
    return plays


def parse_boxscore(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise team and player statistics without inventing missing values.

    ESPN's names/labels are display headers; keys are stable technical stat IDs.
    The legacy stats map remains keyed by display header for UI compatibility.
    """
    boxscore = _mapping(raw.get("boxscore"))
    teams: dict[str, dict[str, Any]] = {}
    for block in boxscore.get("teams") or []:
        if not isinstance(block, dict):
            continue
        team = _mapping(block.get("team"))
        team_id = _text(team.get("id"))
        if not team_id:
            continue
        teams[team_id] = {
            "team_id": team_id,
            "name": team.get("displayName") or team.get("name"),
            "abbr": team.get("abbreviation"),
            "home_away": team.get("homeAway"),
            "statistics": [
                {
                    "name": stat.get("name"),
                    "label": stat.get("label") or stat.get("displayName") or stat.get("name"),
                    "value": _text(stat.get("displayValue", stat.get("value"))),
                }
                for stat in block.get("statistics") or []
                if isinstance(stat, dict) and stat.get("name")
                and stat.get("displayValue", stat.get("value")) is not None
            ],
        }

    player_blocks: list[dict[str, Any]] = []
    for block in boxscore.get("players") or []:
        if not isinstance(block, dict):
            continue
        team = _mapping(block.get("team"))
        team_id = _text(team.get("id"))
        if not team_id:
            continue
        team_meta = teams.get(team_id, {})
        rows: list[dict[str, Any]] = []
        totals: list[dict[str, Any]] = []
        for group in block.get("statistics") or []:
            if not isinstance(group, dict):
                continue
            names = group.get("names") or group.get("labels") or []
            keys = group.get("keys") or names
            labels = group.get("labels") or names
            descriptions = group.get("descriptions") or []
            for athlete_row in group.get("athletes") or []:
                if not isinstance(athlete_row, dict):
                    continue
                athlete = _mapping(athlete_row.get("athlete"))
                values = athlete_row.get("stats") or []
                count = max(len(names), len(keys), len(values))
                stats = {
                    str(names[i]): _text(values[i]) if i < len(values) else None
                    for i in range(len(names))
                }
                stats_by_key = {
                    str(keys[i]): _text(values[i]) if i < len(values) else None
                    for i in range(len(keys))
                }
                stat_labels = {
                    str(keys[i]): {
                        "label": _text(labels[i]) if i < len(labels) else str(names[i] if i < len(names) else keys[i]),
                        "description": _text(descriptions[i]) if i < len(descriptions) else None,
                    }
                    for i in range(count) if i < len(keys)
                }
                position = _mapping(athlete.get("position"))
                headshot = athlete.get("headshot")
                rows.append({
                    "id": _text(athlete.get("id")),
                    "name": athlete.get("displayName") or athlete.get("fullName"),
                    "short_name": athlete.get("shortName"),
                    "jersey": athlete.get("jersey"),
                    "position": position.get("abbreviation") or athlete_row.get("position"),
                    "headshot": _mapping(headshot).get("href") if isinstance(headshot, dict) else headshot,
                    "starter": athlete_row.get("starter"),
                    "active": athlete_row.get("active"),
                    "did_not_play": athlete_row.get("didNotPlay", athlete_row.get("did_not_play")),
                    "ejected": athlete_row.get("ejected"),
                    "reason": athlete_row.get("reason"),
                    "stats": stats,
                    "stats_by_key": stats_by_key,
                    "stat_labels": stat_labels,
                })
            total_values = group.get("totals") or []
            if total_values:
                totals = [
                    {"key": _text(keys[i]) if i < len(keys) else None,
                     "label": _text(labels[i]) if i < len(labels) else (_text(names[i]) if i < len(names) else None),
                     "value": _text(total_values[i])}
                    for i in range(len(total_values))
                ]
        player_blocks.append({
            "team_id": team_id,
            "team": team_meta.get("name") or team.get("displayName"),
            "abbr": team_meta.get("abbr") or team.get("abbreviation"),
            "players": rows,
            "totals": totals,
        })

    return {
        "team_stats": list(teams.values()),
        "player_stats": player_blocks,
        "has_boxscore": bool(teams or player_blocks),
    }
