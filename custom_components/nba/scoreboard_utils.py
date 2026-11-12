"""Règles pures du calendrier NBA, isolées pour les tests unitaires.

Ce module reste volontairement indépendant de Home Assistant et du réseau.
Les règles exposées ici sont couvertes par la suite unittest du dépôt.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, tzinfo
import asyncio
from collections.abc import Awaitable, Callable
from typing import Any


def validate_local_date(value: str) -> date:
    """Valide une date ISO stricte YYYY-MM-DD."""
    try:
        selected = date.fromisoformat(value)
    except (TypeError, ValueError) as err:
        raise ValueError("La date doit respecter le format YYYY-MM-DD") from err
    if selected.isoformat() != value:
        raise ValueError("La date doit respecter le format YYYY-MM-DD")
    return selected


def parse_score(value: Any) -> int | None:
    """Convertit un score ESPN sans transformer une valeur absente en zéro."""
    if isinstance(value, dict):
        value = value.get("value", value.get("displayValue"))
    if value is None or value == "":
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError, OverflowError):
        return None


def cache_ttl(games: list[dict[str, Any]]) -> int:
    """Durée du cache calendrier : 30 s en direct, 180 s sinon."""
    return 30 if any(game.get("state") == "in" for game in games) else 180


def is_cache_fresh(now: datetime, fetched_at: datetime, games: list[dict[str, Any]]) -> bool:
    """Indique si une entrée de cache est encore dans sa fenêtre de validité."""
    age = (now - fetched_at).total_seconds()
    return 0 <= age < cache_ttl(games)


def event_local_date(raw: str | None, local_timezone: tzinfo) -> date | None:
    """Convertit une date ESPN avec fuseau en date du fuseau Home Assistant."""
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None
    # Une date sans offset est ambiguë : ne pas lui inventer un fuseau.
    if parsed.tzinfo is None:
        return None
    return parsed.astimezone(local_timezone).date()


def filter_games_for_local_date(games: list[dict[str, Any]], selected: date, local_timezone: tzinfo) -> list[dict[str, Any]]:
    """Filtre, déduplique et trie les matchs pour une date locale HA."""
    games_by_id: dict[str, dict[str, Any]] = {}
    for game in games:
        game_id = game.get("id")
        if game_id is None or event_local_date(game.get("date"), local_timezone) != selected:
            continue
        games_by_id[str(game_id)] = game
    return sorted(games_by_id.values(), key=lambda item: item.get("date") or "")


async def async_load_scoreboard(
    local_date: str,
    *,
    now_factory: Callable[[], datetime],
    local_timezone: tzinfo,
    fetch_scoreboard: Callable[[str], Awaitable[dict[str, Any]]],
    parse_event: Callable[[dict[str, Any]], dict[str, Any] | None],
    cache: dict[str, tuple[datetime, dict[str, Any]]],
    lock: asyncio.Lock,
    update_failed: type[Exception],
) -> dict[str, Any]:
    """Charge un calendrier local, avec deux dates ESPN, cache et repli obsolète."""
    selected = validate_local_date(local_date)
    key = selected.isoformat()

    def fresh_entry(now: datetime) -> dict[str, Any] | None:
        cached = cache.get(key)
        if cached:
            fetched_at, payload = cached
            if is_cache_fresh(now, fetched_at, payload["games"]):
                return payload
        return None

    now = now_factory()
    fresh = fresh_entry(now)
    if fresh is not None:
        return fresh

    async with lock:
        now = now_factory()
        fresh = fresh_entry(now)
        if fresh is not None:
            return fresh

        source_dates = (selected - timedelta(days=1), selected)
        results = await asyncio.gather(
            *(fetch_scoreboard(day.strftime("%Y%m%d")) for day in source_dates),
            return_exceptions=True,
        )
        successful = [result for result in results if isinstance(result, dict)]
        failures = [result for result in results if isinstance(result, Exception)]
        if failures:
            cached = cache.get(key)
            if cached:
                payload = dict(cached[1])
                payload["stale"] = True
                payload["error"] = "; ".join(str(err) for err in failures)
                return payload
            raise update_failed("Calendrier ESPN incomplet : " + "; ".join(map(str, failures)))
        if not successful:
            raise update_failed("Impossible de charger le calendrier ESPN.")

        parsed_games = [
            game
            for raw in successful
            for event in raw.get("events", [])
            if (game := parse_event(event)) is not None
        ]
        games = filter_games_for_local_date(parsed_games, selected, local_timezone)
        payload = {
            "date": key,
            "timezone": str(local_timezone),
            "updated_at": now.isoformat(),
            "stale": False,
            "games": games,
        }
        cache[key] = (now, payload)
        for old_key, (fetched, _) in list(cache.items()):
            if (now - fetched).total_seconds() > 86400:
                cache.pop(old_key, None)
        return payload
