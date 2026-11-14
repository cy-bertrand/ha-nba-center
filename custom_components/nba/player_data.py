"""Normalisation des statistiques individuelles ESPN (Web API v3)."""
from __future__ import annotations

from typing import Any
import math


def _mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _text(value: Any) -> str | None:
    if value is None:
        return None
    result = str(value).strip()
    return result or None


def _display_text(value: Any) -> str | None:
    """Évite d'afficher NaN ou l'infini comme une statistique valide."""
    result = _text(value)
    if isinstance(value, bool):
        return None
    if result is None:
        return None
    try:
        if not math.isfinite(float(result.replace(",", ""))):
            return None
    except ValueError:
        pass
    return result


def _number(value: Any) -> int | float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value if math.isfinite(value) else None
    if isinstance(value, str):
        try:
            parsed = float(value.replace(",", ""))
            if not math.isfinite(parsed):
                return None
            return int(parsed) if parsed.is_integer() else parsed
        except ValueError:
            return None
    return None


def _stat_rows(raw: dict[str, Any], season_year: int | None = None) -> list[dict[str, Any]]:
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
                if season_year is not None:
                    selected = next(
                        (item for item in seasons
                         if _number(_mapping(_mapping(item).get("season")).get("year")) == season_year),
                        None,
                    )
                    # Une réponse ESPN peut contenir plusieurs saisons malgré le
                    # paramètre season. Ne jamais substituer la saison la plus récente.
                    if selected is None:
                        continue
                else:
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
                            "display_value": _display_text(value),
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
                            "display_value": _display_text(item.get("displayValue")),
                            "category": _text(block.get("displayName") or block.get("name")),
                        })
                continue
            totals = block.get("totals")
            if isinstance(names, list) and isinstance(totals, list):
                for index, value in enumerate(totals):
                    if index >= len(names):
                        continue
                    name = str(names[index])
                    rows.append({
                        "name": name,
                        "label": _text(displays[index] if index < len(displays) else None)
                            or _text(labels[index] if index < len(labels) else None) or name,
                        "value": _number(value),
                        "display_value": _display_text(value),
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
                        "display_value": _display_text(values[index]),
                        "category": _text(block.get("displayName") or block.get("name")),
                    })

    statistics = _mapping(raw.get("statistics"))
    if statistics and not rows:
        names = statistics.get("names") or []
        labels = statistics.get("labels") or []
        displays = statistics.get("displayNames") or []
        splits = statistics.get("splits")
        split = {}
        values = statistics.get("values")
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
                    "display_value": _display_text(value),
                    "category": _text(_mapping(split).get("displayName")) or "Saison",
                })
    return rows

def _filter_items(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Normalise les filtres ESPN, parfois indexés par leur clé au lieu d'un champ name."""
    filters = raw.get("filters")
    if isinstance(filters, dict):
        items: list[dict[str, Any]] = []
        for key, value in filters.items():
            if not isinstance(value, dict):
                continue
            item = dict(value)
            # L'API ESPN renvoie fréquemment :
            # {"seasonType": {"value": "3", "displayValue": "Playoffs"}}
            # Dans cette forme, le nom du filtre est la clé du dictionnaire.
            item.setdefault("name", str(key))
            items.append(item)
        return items
    if isinstance(filters, list):
        return [_mapping(item) for item in filters if isinstance(item, dict)]
    return []


def _season_type(raw: dict[str, Any]) -> tuple[str | None, str | None]:
    for item in _filter_items(raw):
        name = str(item.get("name") or item.get("displayName") or "").lower().replace(" ", "")
        if name not in {"seasontype", "seasonphase"} and "seasontype" not in name:
            continue
        selected = _text(item.get("value"))
        options = item.get("options")
        label = _text(item.get("displayValue"))
        if isinstance(options, list):
            match = next((option for option in options
                          if _text(_mapping(option).get("value")) == selected), None)
            if match:
                label = _text(_mapping(match).get("displayValue")) or label
        return selected, label
    return None, None


def _overview_splits(raw: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    """Extrait séparément les splits Regular Season et Career d'overview."""
    statistics = _mapping(raw.get("statistics"))
    names = statistics.get("names") or []
    labels = statistics.get("labels") or []
    displays = statistics.get("displayNames") or []
    splits = statistics.get("splits")
    result: dict[str, list[dict[str, Any]]] = {}
    if not isinstance(splits, list):
        return result
    for split in splits:
        block = _mapping(split)
        split_name = _text(block.get("displayName"))
        values = block.get("stats")
        if not split_name or not isinstance(values, list):
            continue
        rows = []
        for index, value in enumerate(values):
            name = names[index] if index < len(names) else f"stat_{index}"
            rows.append({
                "name": str(name),
                "label": _text(displays[index] if index < len(displays) else None)
                    or _text(labels[index] if index < len(labels) else None) or str(name),
                "value": _number(value),
                "display_value": _display_text(value),
            })
        result[split_name.lower().replace(" ", "_")] = rows
    return result



def season_matches_espn_year(season: str, espn_year: int) -> bool:
    """Compare un libellé NBA YYYY-YY à l'année de fin utilisée par ESPN."""
    value = str(season or "").strip()
    parts = value.split("-")
    if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
        start = int(parts[0])
        suffix = int(parts[1])
        end = (start // 100) * 100 + suffix if suffix < 100 else suffix
        if end < start:
            end += 100
        return end == espn_year
    return value.isdigit() and int(value) == espn_year


def _season_history(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Fusionne les catégories ESPN par saison pour construire un historique complet."""
    seasons: dict[str, dict[str, Any]] = {}
    categories = raw.get("categories")
    if not isinstance(categories, list):
        return []
    for category in categories:
        block = _mapping(category)
        names = block.get("names") or []
        labels = block.get("labels") or []
        displays = block.get("displayNames") or []
        entries = block.get("statistics")
        if not isinstance(entries, list):
            continue
        for entry in entries:
            item = _mapping(entry)
            season = _mapping(item.get("season"))
            year = _text(season.get("year"))
            display_name = _text(season.get("displayName")) or year
            values = item.get("stats")
            if not year or not isinstance(values, list):
                continue
            team = _mapping(item.get("team"))
            team_abbreviation = _text(item.get("teamAbbreviation") or item.get("team_abbreviation")
                                       or team.get("abbreviation") or team.get("shortDisplayName"))
            team_name = _text(team.get("displayName") or team.get("name"))
            team_id = _text(item.get("teamId") or team.get("id"))
            record = seasons.setdefault(year, {"year": int(year) if year.isdigit() else year,
                                                "display_name": display_name, "statistics": []})
            if team_abbreviation and not record.get("team_abbreviation"):
                record["team_abbreviation"] = team_abbreviation
            if team_name and not record.get("team_name"):
                record["team_name"] = team_name
            if team_id and not record.get("team_id"):
                record["team_id"] = team_id
            for index, value in enumerate(values):
                name = str(names[index]) if index < len(names) else f"stat_{index}"
                record["statistics"].append({
                    "name": name,
                    "label": _text(displays[index] if index < len(displays) else None)
                        or _text(labels[index] if index < len(labels) else None) or name,
                    "value": _number(value),
                    "display_value": _display_text(value),
                    "category": _text(block.get("displayName") or block.get("name")),
                })
    return sorted(seasons.values(), key=lambda item: str(item["year"]), reverse=True)

def parse_player_stats(raw: dict[str, Any], season_year: int | None = None) -> dict[str, Any]:
    """Normalise les statistiques saison ESPN, y compris la structure overview."""
    season = _mapping(raw.get("season"))
    athlete = _mapping(raw.get("athlete"))
    season_name = _text(season.get("displayName") or raw.get("seasonDisplayName"))
    if season_year is not None:
        # Le Web API v3 renvoie un historique pluriannuel : le filtre de requête
        # ne garantit pas que statistics[] ne contienne que l'année demandée.
        # Le libellé doit provenir de l'entrée correspondant exactement à cette
        # année, jamais de la première saison rencontrée dans l'historique.
        requested_season_name = None
        for category in raw.get("categories", []) if isinstance(raw.get("categories"), list) else []:
            entries = _mapping(category).get("statistics")
            if not isinstance(entries, list):
                continue
            matching_entry = next(
                (
                    _mapping(entry)
                    for entry in entries
                    if _number(_mapping(_mapping(entry).get("season")).get("year")) == season_year
                ),
                None,
            )
            if matching_entry is not None:
                requested_season_name = _text(_mapping(matching_entry.get("season")).get("displayName"))
                if requested_season_name:
                    break
        season_name = requested_season_name or str(season_year)
    if not season_name:
        for filter_item in _filter_items(raw):
            item = _mapping(filter_item)
            filter_name = str(item.get("name") or item.get("displayName") or "").lower().replace(" ", "").replace("_", "")
            if filter_name not in {"season", "seasonyear"}:
                continue
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
    season_type_id, season_type_name = _season_type(raw)
    return {
        "season": season_name,
        "season_type_id": season_type_id,
        "season_type": season_type_name,
        "athlete": {
            "id": _text(athlete.get("id")),
            "name": _text(athlete.get("displayName") or athlete.get("fullName")),
        },
        "statistics": _stat_rows(raw, season_year=season_year),
        "season_history": _season_history(raw),
        "splits": _overview_splits(raw),
        "career_statistics": _overview_splits(raw).get("career", []),
    }


def parse_core_postseason_stats(raw: dict[str, Any], season_year: int) -> dict[str, Any]:
    """Normalise les statistiques playoffs ESPN Core v2 pour une saison précise.

    Core v2 expose les statistiques dans splits.categories[].stats[]. Contrairement
    au Web v3, la saison et le type de compétition sont portés par l'URL demandée.
    """
    splits = _mapping(raw.get("splits"))
    categories = splits.get("categories")
    if not isinstance(categories, list):
        categories = raw.get("categories")
    rows: list[dict[str, Any]] = []
    for category in categories if isinstance(categories, list) else []:
        block = _mapping(category)
        stats = block.get("stats")
        if not isinstance(stats, list):
            continue
        for stat in stats:
            item = _mapping(stat)
            name = _text(item.get("name") or item.get("abbreviation"))
            if not name:
                continue
            value = item.get("value")
            display_value = _display_text(item.get("displayValue"))
            if value is None and display_value is not None:
                value = display_value
            rows.append({
                "name": name,
                "label": _text(item.get("displayName") or item.get("shortDisplayName")
                               or item.get("abbreviation")) or name,
                "value": _number(value),
                "display_value": display_value or _display_text(value),
                "category": _text(block.get("displayName") or block.get("name")),
            })
    start_year = season_year - 1
    season_label = f"{start_year}-{str(season_year)[-2:]}"
    athlete = _mapping(raw.get("athlete"))
    return {
        "season": season_label if rows else None,
        "season_type_id": "3" if rows else None,
        "season_type": "Playoffs" if rows else None,
        "athlete": {
            "id": _text(athlete.get("id")),
            "name": _text(athlete.get("displayName") or athlete.get("fullName")),
        },
        "statistics": rows,
        "season_history": [],
        "splits": {},
        "career_statistics": [],
    }


def parse_player_gamelog(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise le gamelog ESPN, y compris les stats imbriquées dans seasonTypes."""
    events = raw.get("events")
    if isinstance(events, dict):
        source = list(events.values())
    elif isinstance(events, list):
        source = events
    else:
        nested = _mapping(raw.get("gameLog")).get("events")
        source = list(nested.values()) if isinstance(nested, dict) else nested if isinstance(nested, list) else []

    # Certaines réponses ESPN ne placent que les métadonnées dans events :
    # les lignes statistiques sont alors dans seasonTypes[].categories[].events[].
    nested_stats: dict[str, dict[str, Any]] = {}
    season_types = raw.get("seasonTypes")
    if isinstance(season_types, list):
        for season_type in season_types:
            season_block = _mapping(season_type)
            for category in season_block.get("categories", []) if isinstance(season_block.get("categories"), list) else []:
                category_block = _mapping(category)
                names = category_block.get("names") or category_block.get("labels") or raw.get("names") or raw.get("labels") or []
                labels = category_block.get("labels") or raw.get("labels") or names
                rows = category_block.get("events")
                if not isinstance(rows, list):
                    continue
                for row in rows:
                    item = _mapping(row)
                    event_id = _text(item.get("eventId") or item.get("id"))
                    values = item.get("stats") or item.get("values")
                    if not event_id or not isinstance(values, list):
                        continue
                    nested_stats.setdefault(event_id, {}).update({
                        str(names[index] if index < len(names) else labels[index] if index < len(labels) else f"stat_{index}"): _number(value)
                        for index, value in enumerate(values)
                    })

    games: list[dict[str, Any]] = []
    for row in source:
        event = _mapping(row)
        if not event:
            continue
        event_id = _text(event.get("id") or event.get("eventId"))
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
            stat_values = nested_stats.get(event_id or "", {})
        opponent = _mapping(event.get("opponent"))
        team = _mapping(event.get("team"))
        games.append({
            "id": event_id,
            "date": _text(event.get("date") or event.get("gameDate")),
            "name": _text(event.get("name") or event.get("shortName")),
            "result": _text(event.get("gameResult") or event.get("result")),
            "score": _text(event.get("score")),
            "home_away": _text(event.get("atVs") or event.get("homeAway")),
            "team": _text(team.get("abbreviation")),
            "opponent": _text(opponent.get("displayName") or opponent.get("abbreviation") or event.get("opponentDisplayName")),
            "opponent_abbreviation": _text(opponent.get("abbreviation") or opponent.get("shortDisplayName")
                                           or event.get("opponentAbbreviation") or event.get("opponent_abbreviation")),
            "stats": stat_values,
        })
    games.sort(key=lambda item: item.get("date") or "", reverse=True)
    return {"games": games, "count": len(games)}
