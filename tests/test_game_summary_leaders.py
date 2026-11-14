"""Tests du parsing global des résumés ESPN, sans dépendance à Home Assistant."""
import importlib
import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _module(name, package=False):
    mod = types.ModuleType(name)
    if package:
        mod.__path__ = []
    sys.modules[name] = mod
    return mod


def _load_coordinator():
    # Le coordinateur importe Home Assistant, mais _parse_summary est une
    # fonction pure. Des stubs minimaux permettent de tester le vrai code
    # sans installer ni démarrer Home Assistant.
    ha = _module("homeassistant", package=True)
    config_entries = _module("homeassistant.config_entries")
    config_entries.ConfigEntry = type("ConfigEntry", (), {})
    core = _module("homeassistant.core")
    core.HomeAssistant = type("HomeAssistant", (), {})
    helpers = _module("homeassistant.helpers", package=True)
    aiohttp = _module("homeassistant.helpers.aiohttp_client")
    aiohttp.async_get_clientsession = lambda hass: None
    update = _module("homeassistant.helpers.update_coordinator")
    class DataUpdateCoordinator:
        @classmethod
        def __class_getitem__(cls, item):
            return cls
    update.DataUpdateCoordinator = DataUpdateCoordinator
    update.UpdateFailed = type("UpdateFailed", (Exception,), {})
    util = _module("homeassistant.util", package=True)
    dt = _module("homeassistant.util.dt")
    dt.parse_datetime = lambda value: None
    dt.as_local = lambda value: value
    util.dt = dt

    custom = _module("custom_components", package=True)
    custom.__path__ = [str(ROOT / "custom_components")]
    nba = _module("custom_components.nba", package=True)
    nba.__path__ = [str(ROOT / "custom_components" / "nba")]
    return importlib.import_module("custom_components.nba.coordinator")


coordinator = _load_coordinator()
parse_summary = coordinator.NBACoordinator._parse_summary


class SummaryLeadersTests(unittest.TestCase):
    def _raw(self, leaders_marker=True):
        raw = {
            "header": {"competitions": [{
                "status": {"type": {"completed": True}},
                "competitors": [
                    {"id": "8", "homeAway": "home", "score": "101",
                     "team": {"abbreviation": "WSH", "displayName": "Washington Wizards"}},
                    {"id": "9", "homeAway": "away", "score": "99",
                     "team": {"abbreviation": "DET", "displayName": "Detroit Pistons"}},
                ],
            }]},
            "plays": [{"id": "p1", "text": "End of Game"}],
            "boxscore": {"teams": [{"team": {"id": "8"}, "statistics": [
                {"name": "rebounds", "displayValue": "40"}
            ]}]},
        }
        if leaders_marker:
            raw["leaders"] = []
        return raw

    def test_missing_leaders_does_not_affect_score_boxscore_or_plays(self):
        result = parse_summary("game-1", self._raw(leaders_marker=False))
        self.assertTrue(result["final"])
        self.assertEqual([(t["abbr"], t["score"]) for t in result["teams"]],
                         [("WSH", 101), ("DET", 99)])
        self.assertEqual(result["team_stats"][0]["statistics"][0]["value"], "40")
        self.assertEqual(result["plays"][0]["id"], "p1")
        self.assertNotIn("top_players", result["teams"][0])

    def test_leader_without_athlete_is_skipped_but_next_category_survives(self):
        raw = self._raw()
        raw["leaders"] = [{"team": {"id": "8"}, "leaders": [
            {"name": "points", "leaders": []},
            {"name": "rebounds", "leaders": [
                {"athlete": {"displayName": "Player A"}, "displayValue": "12"}
            ]},
        ]}]
        result = parse_summary("game-1", raw)
        self.assertEqual(result["teams"][0]["top_players"], [
            {"category": "rebounds", "player": "Player A", "headshot": None, "value": "12"}
        ])

    def test_malformed_category_does_not_discard_later_categories(self):
        raw = self._raw()
        raw["leaders"] = [{"team": {"id": "8"}, "leaders": [
            None,
            {"name": "assists", "leaders": [
                {"athlete": {"displayName": "Player B", "headshot": "https://img.test/b.png"},
                 "displayValue": "9"}
            ]},
        ]}]
        result = parse_summary("game-1", raw)
        self.assertEqual(result["teams"][0]["top_players"][0]["player"], "Player B")
        self.assertEqual(result["teams"][0]["top_players"][0]["headshot"], "https://img.test/b.png")

    def test_malformed_team_leader_block_does_not_discard_other_team(self):
        raw = self._raw()
        raw["leaders"] = [
            None,
            {"team": {"id": "9", "abbreviation": "DET"}, "leaders": [
                {"name": "points", "leaders": [
                    {"athlete": {"displayName": "Player C", "headshot": {"href": "img-c"}},
                     "displayValue": "20"}
                ]}
            ]},
        ]
        result = parse_summary("game-1", raw)
        det = next(team for team in result["teams"] if team.get("abbr") == "DET")
        self.assertEqual(det["top_players"][0]["player"], "Player C")
        self.assertEqual(det["top_players"][0]["headshot"], "img-c")

    def test_malformed_leader_list_and_empty_leader_objects_are_safe(self):
        raw = self._raw()
        raw["leaders"] = [
            {"team": {"id": "8"}, "leaders": "invalid"},
            {"team": {"id": "9"}, "leaders": [
                {"name": "blocks", "leaders": [None, {}]}
            ]},
        ]
        result = parse_summary("game-1", raw)
        self.assertTrue(result["final"])
        self.assertEqual(result["teams"][0]["score"], 101)
        self.assertEqual(result["teams"][1]["top_players"], [])



    def test_integer_parser_rejects_booleans_fractions_and_non_finite_values(self):
        for value in (True, False, "101.5", float("nan"), float("inf"), "-inf"):
            with self.subTest(value=value):
                self.assertEqual(coordinator._to_int(value), 0)
        self.assertEqual(coordinator._to_int("101"), 101)
        self.assertEqual(coordinator._to_int({"displayValue": "0"}), 0)

    def test_leaders_parser_skips_non_finite_values(self):
        raw = {
            "categories": [{"names": ["avgPoints"]}],
            "athletes": [
                {"athlete": {"id": "1", "displayName": "Infinite"},
                 "categories": [{"values": [float("inf")]}]},
                {"athlete": {"id": "2", "displayName": "Valid"},
                 "categories": [{"values": [24.7]}]},
            ],
        }
        result = coordinator.NBACoordinator._parse_leaders(raw, "points")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["player"], "Valid")
        self.assertEqual(result[0]["rank"], 1)

    def test_game_parser_rejects_missing_or_duplicate_competitors(self):
        base = {
            "id": "game-1",
            "date": "2026-11-14T00:00Z",
            "status": {"type": {"state": "pre"}},
            "competitions": [{"competitors": [
                {"homeAway": "home", "team": {"id": "1", "abbreviation": "AAA"}},
            ]}],
        }
        self.assertIsNone(coordinator.NBACoordinator._parse_game(base))

        duplicate = {
            **base,
            "competitions": [{"competitors": [
                {"homeAway": "home", "team": {"id": "1"}},
                {"homeAway": "home", "team": {"id": "2"}},
                {"homeAway": "away", "team": {"id": "3"}},
            ]}],
        }
        parsed = coordinator.NBACoordinator._parse_game(duplicate)
        self.assertEqual(parsed["home"]["id"], "1")
        self.assertEqual(parsed["away"]["id"], "3")

    def test_game_parser_rejects_unknown_status_state(self):
        event = {
            "id": "game-2",
            "date": "2026-11-14T00:00Z",
            "status": {"type": {"state": "delayed"}},
            "competitions": [{"competitors": [
                {"homeAway": "home", "team": {"id": "1"}},
                {"homeAway": "away", "team": {"id": "2"}},
            ]}],
        }
        self.assertIsNone(coordinator.NBACoordinator._parse_game(event))

    def test_standings_parser_skips_malformed_rows_and_keeps_valid_teams(self):
        raw = {
            "children": [
                None,
                {"name": "Eastern Conference", "standings": {"entries": [
                    None,
                    {"team": None, "stats": []},
                    {"team": {"id": "bad"}, "stats": [None, {"displayValue": "broken"}]},
                    {"team": {"id": "2", "displayName": "Team B", "abbreviation": "BBB",
                              "logos": "invalid"},
                     "stats": [{"name": "wins", "displayValue": "42"},
                               {"displayValue": "ignored"}]},
                ]}},
                {"name": "Malformed", "standings": "invalid"},
            ],
        }
        result = coordinator.NBACoordinator._parse_standings(raw)
        self.assertEqual(list(result), ["Eastern Conference"])
        self.assertEqual(len(result["Eastern Conference"]), 2)
        valid = result["Eastern Conference"][1]
        self.assertEqual(valid["team_id"], "2")
        self.assertEqual(valid["team"], "Team B")
        self.assertEqual(valid["wins"], "42")
        self.assertIsNone(valid["logo"])
        self.assertEqual(valid["rank"], 0)

    def test_leaders_parser_uses_requested_statistic_not_first_available(self):
        raw = {
            "categories": [{"names": ["avgRebounds", "avgPoints"]}],
            "athletes": [{
                "athlete": {"id": "23", "displayName": "Player A", "team": {"abbreviation": "AAA"}},
                "categories": [{"values": [12.4, 31.2]}],
            }],
        }
        self.assertEqual(coordinator.NBACoordinator._parse_leaders(raw, "points")[0]["value"], 31.2)
        self.assertEqual(coordinator.NBACoordinator._parse_leaders(raw, "rebounds")[0]["value"], 12.4)

    def test_leaders_parser_returns_empty_when_requested_statistic_is_missing(self):
        raw = {
            "categories": [{"names": ["avgRebounds"]}],
            "athletes": [{
                "athlete": {"id": "23", "displayName": "Player A"},
                "categories": [{"values": [12.4]}],
            }],
        }
        self.assertEqual(coordinator.NBACoordinator._parse_leaders(raw, "points"), [])

    def test_leaders_parser_skips_malformed_rows_and_preserves_valid_players(self):
        raw = {
            "categories": [{"names": ["avgPoints"]}],
            "athletes": [
                None,
                {"athlete": None, "categories": [{"values": [20]}]},
                {"athlete": {"id": "23", "displayName": "Player A"},
                 "categories": [{"values": [25.6]}]},
            ],
        }
        result = coordinator.NBACoordinator._parse_leaders(raw, "points")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["rank"], 1)
        self.assertEqual(result[0]["value"], 25.6)


    def test_recent_games_are_sorted_by_date_before_selecting_latest_five(self):
        coordinator_instance = object.__new__(coordinator.NBACoordinator)
        def event(game_id, date, home_winner, away_winner):
            return {
                "id": game_id, "date": date,
                "competitions": [{
                    "status": {"type": {"state": "post"}},
                    "competitors": [
                        {"homeAway": "home", "winner": home_winner, "score": "101",
                         "team": {"id": "8", "abbreviation": "HOM"}},
                        {"homeAway": "away", "winner": away_winner, "score": "99",
                         "team": {"id": "9", "abbreviation": "AWY"}},
                    ],
                }],
            }
        schedule = {"team": {"displayName": "Home Team"}, "events": [
            event("newest", "2026-11-14T00:00:00Z", True, False),
            event("oldest", "2026-11-01T00:00:00Z", False, True),
            event("middle", "2026-11-10T00:00:00Z", False, True),
        ]}
        result = coordinator_instance._parse_team("8", schedule, [])
        self.assertEqual([game["id"] for game in result["recent"]],
                         ["newest", "middle", "oldest"])

    def test_unknown_winner_is_not_reported_as_a_loss(self):
        coordinator_instance = object.__new__(coordinator.NBACoordinator)
        schedule = {"team": {"displayName": "Home Team"}, "events": [{
            "id": "unknown", "date": "2026-11-14T00:00:00Z",
            "competitions": [{
                "status": {"type": {"state": "post"}},
                "competitors": [
                    {"homeAway": "home", "score": "0", "team": {"id": "8", "abbreviation": "HOM"}},
                    {"homeAway": "away", "score": "0", "team": {"id": "9", "abbreviation": "AWY"}},
                ],
            }],
        }]}
        result = coordinator_instance._parse_team("8", schedule, [])
        self.assertEqual(result["recent"][0]["result"], "—")

if __name__ == "__main__":
    unittest.main()
