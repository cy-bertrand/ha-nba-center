"""Frontend resources for the NBA Center Lovelace card."""
from __future__ import annotations

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN

RESOURCE_URL = f"/{DOMAIN}-center/nba-center-card.js"
RESOURCE_PATH = "www/nba-center-card.js"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the bundled card file as a Home Assistant static path."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(RESOURCE_URL, hass.config.path("custom_components", DOMAIN, RESOURCE_PATH), True)]
    )
