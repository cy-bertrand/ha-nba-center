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
    """Convertit les catégories ESPN en lignes stables sans supposer un ordre."""
    rows: list[dict[str, Any]] = []
    categories = raw.get("categories")
    if isinstance(categories, list):
        for category in categories:
            block = _mapping(category)
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
            names, labels = block.get("names"), block.get("labels")
            values, displays = block.get("values"), block.get("displayValues")
            if isinstance(names, list) and isinstance(values, list):
                for index, name in enumerate(names):
                    if not isinstance(name, str) or index >= len(values):
                        continue
                    rows.append({
                        "name": name,
                        "label": _text(labels[index]) if isinstance(labels, list) and index < len(labels) else name,
                        "value": _number(values[index]),
                        "display_value": _text(displays[index]) if isinstance(displays, list) and index < len(displays) else None,
                        "category": _text(block.get("displayName") or block.get("name")),
                    })
    # Certaines réponses overview exposent directement statistics.labels/names/values.
    statistics = _mapping(raw.get("statistics"))
    if statistics and not rows:
        names, labels = statistics.get("names"), statistics.get("labels")
        values, displays = statistics.get("values"), statistics.get("displayValues")
        if isinstance(names, list) and isinstance(values, list):
            for index, name in enumerate(names):
                if not isinstance(name, str) or index >= len(values):
                    continue
                rows.append({
                    "name": name,
                    "label": _text(labels[index]) if isinstance(labels, list) and index < len(labels) else name,
                    "value": _number(values[index]),
                    "display_value": _text(displays[index]) if isinstance(displays, list) and index < len(displays) else None,
                    "category": "Saison",
                })
    return rows


def parse_player_stats(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise les statistiques saison ESPN, y compris la structure overview."""
    season = _mapping(raw.get("season"))
    athlete = _mapping(raw.get("athlete"))
    return {
        "season": _text(season.get("displayName") or raw.get("seasonDisplayName")),
        "athlete": {
            "id": _text(athlete.get("id")),
            "name": _text(athlete.get("displayName") or athlete.get("fullName")),
        },
        "statistics": _stat_rows(raw),
    }


def parse_player_gamelog(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise le journal de matchs en conservant uniquement les champs fournis."""
    events = raw.get("events")
    if not isinstance(events, list):
        events = _mapping(raw.get("seasonTypes")).get("categories", [])
    games: list[dict[str, Any]] = []
    for row in events:
        event = _mapping(row)
        if not event:
            continue
        stats = event.get("stats")
        if isinstance(stats, dict):
            stat_values = {str(key): _number(value) for key, value in stats.items()}
        elif isinstance(stats, list):
            names = event.get("labels") or event.get("names")
            stat_values = {
                str(names[index]): _number(value)
                for index, value in enumerate(stats)
                if isinstance(names, list) and index < len(names) and isinstance(names[index], str)
            }
        else:
            stat_values = {}
        games.append({
            "id": _text(event.get("id") or event.get("eventId")),
            "date": _text(event.get("date") or event.get("gameDate")),
            "name": _text(event.get("name") or event.get("shortName")),
            "result": _text(event.get("gameResult") or event.get("result")),
            "opponent": _text(event.get("opponent") or event.get("opponentDisplayName")),
            "stats": stat_values,
        })
    return {"games": games, "count": len(games)}
