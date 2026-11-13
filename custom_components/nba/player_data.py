"""Normalisation des statistiques individuelles ESPN (Web API v3)."""
from __future__ import annotations

from typing import Any


def _mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _text(value: Any) -> str | None:
    if value is None:
        return None
    result = str(value).strip()
    return result or None


def _number(value: Any) -> int | float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, str):
        try:
            parsed = float(value.replace(",", ""))
            return int(parsed) if parsed.is_integer() else parsed
        except ValueError:
            return None
    return None


def _stat_rows(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Convertit les catégories ESPN et les splits overview en lignes stables."""
    rows: list[dict[str, Any]] = []
    categories = raw.get("categories")
    if isinstance(categories, list):
        for category in categories:
            block = _mapping(category)
            names = block.get("names") or []
            labels = block.get("labels") or []
            displays = block.get("displayNames") or []
            seasons = block.get("statistics")
            if isinstance(seasons, list) and seasons:
                selected = max(
                    seasons,
                    key=lambda item: _number(_mapping(_mapping(item).get("season")).get("year")) or 0,
                )
                values = _mapping(selected).get("stats")
                season_name = _text(_mapping(_mapping(selected).get("season")).get("displayName"))
                if isinstance(values, list):
                    for index, value in enumerate(values):
                        name = names[index] if index < len(names) else f"stat_{index}"
                        rows.append({
                            "name": str(name),
                            "label": _text(displays[index] if index < len(displays) else None)
                                or _text(labels[index] if index < len(labels) else None) or str(name),
                            "value": _number(value),
                            "display_value": _text(value),
                            "category": _text(block.get("displayName") or block.get("name")),
                            "season": season_name,
                        })
                continue
            stats = block.get("stats")
            if isinstance(stats, list):
                for stat in stats:
                    item = _mapping(stat)
                    name = _text(item.get("name"))
                    if name:
                        rows.append({
                            "name": name,
                            "label": _text(item.get("displayName") or item.get("label") or item.get("shortDisplayName")) or name,
                            "value": _number(item.get("value")),
                            "display_value": _text(item.get("displayValue")),
                            "category": _text(block.get("displayName") or block.get("name")),
                        })
                continue
            values = block.get("values")
            if isinstance(names, list) and isinstance(values, list):
                for index, name in enumerate(names):
                    if index >= len(values):
                        continue
                    rows.append({
                        "name": str(name),
                        "label": _text(displays[index] if index < len(displays) else None)
                            or _text(labels[index] if index < len(labels) else None) or str(name),
                        "value": _number(values[index]),
                        "display_value": _text(values[index]),
                        "category": _text(block.get("displayName") or block.get("name")),
                    })

    statistics = _mapping(raw.get("statistics"))
    if statistics and not rows:
        names = statistics.get("names") or []
        labels = statistics.get("labels") or []
        displays = statistics.get("displayNames") or []
        splits = statistics.get("splits")
        if isinstance(splits, list):
            split = next((item for item in splits if "regular" in str(_mapping(item).get("displayName", "")).lower()), splits[0] if splits else {})
            values = _mapping(split).get("stats")
            if isinstance(values, list):
                for index, value in enumerate(values):
                    name = names[index] if index < len(names) else f"stat_{index}"
                    rows.append({
                        "name": str(name),
                        "label": _text(displays[index] if index < len(displays) else None)
                            or _text(labels[index] if index < len(labels) else None) or str(name),
                        "value": _number(value),
                        "display_value": _text(value),
                        "category": _text(_mapping(split).get("displayName")) or "Saison",
                    })
    return rows

def parse_player_stats(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise les statistiques saison ESPN, y compris la structure overview."""
    season = _mapping(raw.get("season"))
    athlete = _mapping(raw.get("athlete"))
    season_name = _text(season.get("displayName") or raw.get("seasonDisplayName"))
    if not season_name:
        filters = _mapping(raw.get("filters"))
        for filter_item in filters.values():
            item = _mapping(filter_item)
            selected = _text(item.get("value"))
            options = item.get("options")
            if selected and isinstance(options, list):
                match = next((option for option in options if _text(_mapping(option).get("value")) == selected), None)
                if match:
                    season_name = _text(_mapping(match).get("displayValue"))
                    break
    if not season_name:
        season_values = [
            _text(_mapping(_mapping(row).get("season")).get("displayName"))
            for category in raw.get("categories", []) if isinstance(category, dict)
            for row in category.get("statistics", []) if isinstance(category.get("statistics"), list)
        ]
        season_name = next((value for value in reversed(season_values) if value), None)
    return {
        "season": season_name,
        "athlete": {
            "id": _text(athlete.get("id")),
            "name": _text(athlete.get("displayName") or athlete.get("fullName")),
        },
        "statistics": _stat_rows(raw),
    }


def parse_player_gamelog(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise le journal ESPN dont events est un dictionnaire indexé par event ID."""
    events = raw.get("events")
    if isinstance(events, dict):
        source = list(events.values())
    elif isinstance(events, list):
        source = events
    else:
        nested = _mapping(raw.get("gameLog")).get("events")
        source = list(nested.values()) if isinstance(nested, dict) else nested if isinstance(nested, list) else []

    games: list[dict[str, Any]] = []
    for row in source:
        event = _mapping(row)
        if not event:
            continue
        stats = event.get("stats")
        if isinstance(stats, dict):
            stat_values = {str(key): _number(value) for key, value in stats.items()}
        elif isinstance(stats, list):
            names = event.get("labels") or event.get("names") or raw.get("labels") or raw.get("names")
            stat_values = {
                str(names[index]): _number(value)
                for index, value in enumerate(stats)
                if isinstance(names, list) and index < len(names) and isinstance(names[index], str)
            }
        else:
            # L'endpoint gamelog fourni ne contient pas les statistiques individuelles,
            # seulement les métadonnées de rencontre.
            stat_values = {}
        opponent = _mapping(event.get("opponent"))
        team = _mapping(event.get("team"))
        games.append({
            "id": _text(event.get("id") or event.get("eventId")),
            "date": _text(event.get("date") or event.get("gameDate")),
            "name": _text(event.get("name") or event.get("shortName")),
            "result": _text(event.get("gameResult") or event.get("result")),
            "score": _text(event.get("score")),
            "home_away": _text(event.get("atVs")),
            "team": _text(team.get("abbreviation")),
            "opponent": _text(opponent.get("displayName") or opponent.get("abbreviation") or event.get("opponentDisplayName")),
            "stats": stat_values,
        })
    games.sort(key=lambda item: item.get("date") or "", reverse=True)
    return {"games": games, "count": len(games)}
