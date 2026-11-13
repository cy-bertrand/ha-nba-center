"""WebSocket API for NBA Center frontend requests."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN


@websocket_api.websocket_command(
    {
        vol.Required("type"): "nba/scoreboard",
        vol.Required("date"): str,
    }
)
@websocket_api.async_response
async def websocket_get_scoreboard(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return the NBA scoreboard for a local Home Assistant date."""
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if not coordinators:
        connection.send_error(msg["id"], "not_ready", "L'intégration NBA n'est pas chargée.")
        return
    try:
        result = await coordinators[0].async_get_scoreboard_for_local_date(msg["date"])
    except (ValueError, HomeAssistantError) as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    except Exception as err:  # noqa: BLE001 - return a recoverable websocket error
        connection.send_error(msg["id"], "api_error", str(err))
        return
    connection.send_result(msg["id"], result)



@websocket_api.websocket_command(
    {
        vol.Required("type"): "nba/game_details",
        vol.Required("game_id"): str,
    }
)
@websocket_api.async_response
async def websocket_get_game_details(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return cached ESPN summary details for one game."""
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if not coordinators:
        connection.send_error(msg["id"], "not_ready", "L'intégration NBA n'est pas chargée.")
        return
    result = await coordinators[0].async_get_game_details(msg["game_id"])
    if result.get("error"):
        connection.send_error(msg["id"], "api_error", result["error"])
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "nba/team_roster",
        vol.Required("team_id"): str,
    }
)
@websocket_api.async_response
async def websocket_get_team_roster(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return the cached on-demand roster for one NBA franchise."""
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if not coordinators:
        connection.send_error(msg["id"], "not_ready", "L'intégration NBA n'est pas chargée.")
        return
    try:
        result = await coordinators[0].async_get_team_roster(msg["team_id"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_team", str(err))
        return
    except Exception as err:  # noqa: BLE001 - recoverable ESPN/network failure
        connection.send_error(msg["id"], "api_error", str(err))
        return
    connection.send_result(msg["id"], result)



@websocket_api.websocket_command(
    {
        vol.Required("type"): "nba/player_data",
        vol.Required("player_id"): str,
        vol.Optional("postseason_year"): int,
    }
)
@websocket_api.async_response
async def websocket_get_player_data(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return ESPN overview, season stats and gamelog for one player."""
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if not coordinators:
        connection.send_error(msg["id"], "not_ready", "L'intégration NBA n'est pas chargée.")
        return
    try:
        result = await coordinators[0].async_get_player_data(msg["player_id"], msg.get("postseason_year"))
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_player", str(err))
        return
    except Exception as err:  # noqa: BLE001 - recoverable ESPN/network failure
        connection.send_error(msg["id"], "api_error", str(err))
        return
    connection.send_result(msg["id"], result)



@websocket_api.websocket_command(
    {
        vol.Required("type"): "nba/playoff_bracket",
        vol.Required("season_year"): int,
    }
)
@websocket_api.async_response
async def websocket_get_playoff_bracket(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return an on-demand, cached playoff bracket for one NBA season."""
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if not coordinators:
        connection.send_error(msg["id"], "not_ready", "L'intégration NBA n'est pas chargée.")
        return
    try:
        result = await coordinators[0].async_get_playoff_bracket(msg["season_year"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_season", str(err))
        return
    except Exception as err:  # noqa: BLE001 - recoverable ESPN/network failure
        connection.send_error(msg["id"], "api_error", str(err))
        return
    connection.send_result(msg["id"], result)


def async_register(hass: HomeAssistant) -> None:
    """Register NBA Center websocket commands once per HA instance."""
    if hass.data.get("nba_center_websocket_registered"):
        return
    websocket_api.async_register_command(hass, websocket_get_scoreboard)
    websocket_api.async_register_command(hass, websocket_get_game_details)
    websocket_api.async_register_command(hass, websocket_get_team_roster)
    websocket_api.async_register_command(hass, websocket_get_player_data)
    websocket_api.async_register_command(hass, websocket_get_playoff_bracket)
    hass.data["nba_center_websocket_registered"] = True
