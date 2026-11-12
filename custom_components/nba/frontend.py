"""Frontend resources for the NBA Center Lovelace card."""
from __future__ import annotations

from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

RESOURCE_URL = "/nba-center/nba-center-card.js"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the bundled card file as a Home Assistant static path."""
    card_path = Path(__file__).parent / "www" / "nba-center-card.js"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(RESOURCE_URL, str(card_path), True)]
    )
