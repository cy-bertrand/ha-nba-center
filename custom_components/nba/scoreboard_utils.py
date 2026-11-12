"""Règles pures du calendrier NBA, isolées pour les tests unitaires.

Ce module reste volontairement indépendant de Home Assistant et du réseau.
Les règles exposées ici sont couvertes par la suite unittest du dépôt.
"""
from __future__ import annotations

from datetime import date, datetime, tzinfo
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
