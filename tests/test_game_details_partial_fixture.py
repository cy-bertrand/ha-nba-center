"""Vérifie la tolérance du parseur à un résumé ESPN sans boxscore."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details_partial", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)

FIXTURE = ROOT / "tests" / "fixtures" / "espn_summary_partial_401909977.json"


class PartialSummaryFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_header_and_live_score_survive_missing_boxscore(self):
        self.assertNotIn("boxscore", self.raw)
        state = module.parse_game_state(self.raw)
        self.assertEqual(state["event_id"], "401909977")
        self.assertEqual(state["state"], "in")
        self.assertEqual(
            [(team["abbr"], team["score"]) for team in state["competitors"]],
            [("WSH", 32), ("DET", 26)],
        )

    def test_missing_boxscore_is_explicit_and_empty(self):
        box = module.parse_boxscore(self.raw)
        self.assertFalse(box["has_boxscore"])
        self.assertEqual(box["team_stats"], [])
        self.assertEqual(box["player_stats"], [])

    def test_play_by_play_remains_available_without_player_index(self):
        plays = module.parse_plays(self.raw)
        self.assertEqual(len(plays), 3)
        self.assertEqual(
            [play["action_category"] for play in plays],
            ["score", "rebound", "substitution"],
        )
        substitution = module.parse_substitutions(plays)
        self.assertEqual(len(substitution), 1)
        self.assertEqual(
            [player["id"] for player in substitution[0]["participants"]],
            ["2596112", "3908845"],
        )
        self.assertTrue(all(player["name"] is None for player in substitution[0]["participants"]))

    def test_null_empty_and_wrong_type_boxscore_are_safe(self):
        for value in (None, {}, [], "unavailable"):
            with self.subTest(boxscore=value):
                result = module.parse_boxscore({"boxscore": value})
                self.assertFalse(result["has_boxscore"])
                self.assertEqual(result["team_stats"], [])
                self.assertEqual(result["player_stats"], [])

    def test_header_and_plays_are_safe_when_optional_sections_are_null(self):
        raw = {"header": self.raw["header"], "plays": None, "boxscore": None}
        self.assertEqual(module.parse_plays(raw), [])
        self.assertEqual(module.parse_game_state(raw)["state"], "in")
        self.assertFalse(module.parse_boxscore(raw)["has_boxscore"])


if __name__ == "__main__":
    unittest.main()
