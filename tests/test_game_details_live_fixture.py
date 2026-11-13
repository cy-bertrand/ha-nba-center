"""Validation du parseur sur un extrait réel d'un summary ESPN live."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details_live", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)

FIXTURE = ROOT / "tests" / "fixtures" / "espn_summary_live_401909977.json"


class LiveSummaryFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_live_header_is_independent_from_play_score_snapshots(self):
        state = module.parse_game_state(self.raw)
        self.assertEqual(state["event_id"], "401909977")
        self.assertEqual(state["state"], "in")
        self.assertEqual(state["clock"], "2:40")
        self.assertEqual(
            [(team["abbr"], team["home_away"], team["score"])
             for team in state["competitors"]],
            [("WSH", "home", 32), ("DET", "away", 26)],
        )

    def test_real_team_and_player_boxscore_shapes(self):
        box = module.parse_boxscore(self.raw)
        self.assertTrue(box["has_boxscore"])
        self.assertEqual(
            [(team["abbr"], team["home_away"]) for team in box["team_stats"]],
            [("DET", "away"), ("WSH", "home")],
        )
        det = box["team_stats"][0]
        self.assertEqual(det["statistics"][0]["value"], "9-17")
        self.assertEqual(det["statistics"][1]["value"], "53")

        pistons = box["player_stats"][0]["players"]
        self.assertEqual(pistons[0]["name"], "Duncan Robinson")
        self.assertEqual(pistons[0]["stats_by_key"]["points"], "0")
        self.assertEqual(pistons[0]["stats_by_key"]["minutes"], "7")
        self.assertFalse(pistons[0]["active"])
        self.assertTrue(pistons[0]["starter"])

        dnp = next(player for player in pistons if player["name"] == "Taurean Prince")
        self.assertTrue(dnp["did_not_play"])
        self.assertEqual(dnp["reason"], "COACH'S DECISION")
        self.assertIsNone(dnp["stats_by_key"]["points"])

        wizards = box["player_stats"][1]["players"]
        self.assertEqual(wizards[0]["name"], "Anthony Davis")
        self.assertEqual(wizards[0]["stats_by_key"]["points"], "10")

    def test_real_play_events_and_substitution_participants(self):
        plays = module.parse_plays(self.raw)
        self.assertEqual(len(plays), 3)
        self.assertEqual(
            [play["action_category"] for play in plays],
            ["score", "rebound", "substitution"],
        )
        self.assertTrue(plays[0]["scoring"])
        self.assertEqual(plays[0]["score_value"], "3")
        self.assertEqual(plays[0]["coordinate"], {"x": 16, "y": 26})
        self.assertFalse(plays[1]["scoring"])

        changes = module.parse_substitutions(plays)
        self.assertEqual(len(changes), 1)
        self.assertEqual(changes[0]["team_id"], "8")
        self.assertEqual(
            [player["name"] for player in changes[0]["participants"]],
            ["Javonte Green", "John Collins"],
        )


if __name__ == "__main__":
    unittest.main()
