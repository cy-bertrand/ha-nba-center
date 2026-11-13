"""Tests ciblés des box scores ESPN partiels ou incomplets."""
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details_partial_boxscore", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)
parse_boxscore = module.parse_boxscore


class PartialBoxscoreTests(unittest.TestCase):
    def test_team_boxscore_without_player_block_remains_available(self):
        result = parse_boxscore({"boxscore": {"teams": [
            {"team": {"id": "8", "displayName": "Washington Wizards", "abbreviation": "WSH"},
             "statistics": [{"name": "rebounds", "displayValue": "42"}]}
        ]}})
        self.assertTrue(result["has_boxscore"])
        self.assertEqual(result["team_stats"][0]["statistics"][0]["value"], "42")
        self.assertEqual(result["player_stats"], [])

    def test_player_boxscore_without_team_block_remains_available(self):
        result = parse_boxscore({"boxscore": {"players": [
            {"team": {"id": "8", "displayName": "Washington Wizards", "abbreviation": "WSH"},
             "statistics": [{"names": ["MIN", "PTS"], "athletes": [
                 {"athlete": {"id": "10", "displayName": "Player"}, "stats": ["12:30", "8"]}
             ]}]}
        ]}})
        self.assertTrue(result["has_boxscore"])
        self.assertEqual(result["team_stats"], [])
        self.assertEqual(result["player_stats"][0]["players"][0]["stats"], {"MIN": "12:30", "PTS": "8"})

    def test_player_block_without_statistics_is_empty_not_an_error(self):
        for statistics in (None, [], {}):
            with self.subTest(statistics=statistics):
                result = parse_boxscore({"boxscore": {"players": [
                    {"team": {"id": "8", "displayName": "Washington Wizards"},
                     "statistics": statistics}
                ]}})
                self.assertTrue(result["has_boxscore"])
                self.assertEqual(result["player_stats"][0]["players"], [])
                self.assertEqual(result["player_stats"][0]["totals"], [])

    def test_short_player_stats_keep_unprovided_columns_as_none(self):
        result = parse_boxscore({"boxscore": {"players": [
            {"team": {"id": "8"}, "statistics": [{
                "names": ["MIN", "FG", "REB", "AST", "PTS"],
                "keys": ["minutes", "fieldGoalsMade-fieldGoalsAttempted", "rebounds", "assists", "points"],
                "labels": ["Minutes", "Field Goals", "Rebounds", "Assists", "Points"],
                "athletes": [{"athlete": {"id": "10", "displayName": "Player"},
                              "stats": ["12:30", "3-7", "2"]}],
                "totals": ["12:30", "3-7", "2"]
            }]}
        ]}})
        player = result["player_stats"][0]["players"][0]
        self.assertEqual(player["stats"], {"MIN": "12:30", "FG": "3-7", "REB": "2", "AST": None, "PTS": None})
        self.assertEqual(player["stats_by_key"]["assists"], None)
        self.assertEqual(player["stats_by_key"]["points"], None)
        self.assertEqual(result["player_stats"][0]["totals"][-1]["value"], "2")

    def test_missing_names_or_keys_do_not_create_fabricated_statistics(self):
        result = parse_boxscore({"boxscore": {"players": [
            {"team": {"id": "8"}, "statistics": [{
                "keys": ["points", "rebounds"],
                "athletes": [{"athlete": {"id": "10"}, "stats": ["7"]}]
            }]}
        ]}})
        player = result["player_stats"][0]["players"][0]
        self.assertEqual(player["stats"], {})
        self.assertEqual(player["stats_by_key"], {"points": "7", "rebounds": None})

    def test_invalid_optional_blocks_are_skipped_without_losing_valid_team_data(self):
        result = parse_boxscore({"boxscore": {
            "teams": [None, "invalid", {"team": {"id": "8"}, "statistics": [None, {"name": "rebounds", "value": 40}]}],
            "players": [None, "invalid", {"team": {"id": "8"}, "statistics": [None, {"athletes": [None, "invalid"]}]}]
        }})
        self.assertTrue(result["has_boxscore"])
        self.assertEqual(result["team_stats"][0]["statistics"][0]["value"], "40")
        self.assertEqual(result["player_stats"][0]["players"], [])


if __name__ == "__main__":
    unittest.main()
