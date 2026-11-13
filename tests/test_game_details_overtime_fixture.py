"""Validation d'une vraie rencontre ESPN terminée après deux prolongations."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details_overtime", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)

FIXTURE = ROOT / "tests" / "fixtures" / "espn_summary_overtime_401909977.json"


class OvertimeSummaryFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_final_header_and_two_overtime_score(self):
        state = module.parse_game_state(self.raw)
        self.assertEqual(state["event_id"], "401909977")
        self.assertEqual(state["state"], "post")
        self.assertTrue(state["completed"])
        self.assertEqual(state["status_detail"], "Final/2OT")
        self.assertEqual(
            [(team["abbr"], team["home_away"], team["score"], team["winner"])
             for team in state["competitors"]],
            [("WSH", "home", 140, False), ("DET", "away", 144, True)],
        )

    def test_real_period_end_events_include_both_overtimes(self):
        plays = module.parse_plays(self.raw)
        period_ends = [play for play in plays if play["is_period_end"]]
        self.assertEqual([play["period"] for play in period_ends], ["1", "2", "3", "4", "5", "6"])
        self.assertEqual(
            [play["period_display"] for play in period_ends],
            ["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter", "OT", "2OT"],
        )
        self.assertEqual(
            [(play["home_score"], play["away_score"]) for play in period_ends[-2:]],
            [("132", "132"), ("140", "144")],
        )
        self.assertEqual(period_ends[-1]["text"], "End of the 2nd  Overtime")

    def test_end_game_is_distinct_from_end_of_second_overtime(self):
        plays = module.parse_plays(self.raw)
        game_ends = [play for play in plays if play["is_game_end"]]
        self.assertEqual(len(game_ends), 1)
        self.assertEqual(game_ends[0]["period"], "6")
        self.assertEqual(game_ends[0]["action_category"], "game_end")
        self.assertFalse(game_ends[0]["is_period_end"])


if __name__ == "__main__":
    unittest.main()
