"""Validation du parseur sur un summary ESPN réel après la fin du match."""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details_completed", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)

FIXTURE = ROOT / "tests" / "fixtures" / "espn_summary_completed_401909971.json"


class CompletedSummaryFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = json.loads(FIXTURE.read_text(encoding="utf-8"))
        cls.box = module.parse_boxscore(cls.raw)
        cls.plays = module.parse_plays(cls.raw)
        cls.state = module.parse_game_state(cls.raw)

    def test_final_header_and_score_are_parsed(self):
        self.assertEqual(self.state["event_id"], "401909971")
        self.assertEqual(self.state["state"], "post")
        self.assertTrue(self.state["completed"])
        self.assertEqual(self.state["game_state"], "post")
        self.assertEqual(
            [(team["abbr"], team["home_away"], team["score"], team["winner"])
             for team in self.state["competitors"]],
            [("MIL", "home", 112, False), ("LAL", "away", 123, True)],
        )

    def test_complete_team_and_player_boxscores_keep_source_values(self):
        self.assertTrue(self.box["has_boxscore"])
        self.assertEqual(
            [(team["abbr"], team["home_away"], len(team["statistics"]))
             for team in self.box["team_stats"]],
            [("LAL", "away", 25), ("MIL", "home", 25)],
        )
        self.assertEqual(
            [(team["abbr"], len(team["players"]), len(team["totals"]))
             for team in self.box["player_stats"]],
            [("LAL", 15, 14), ("MIL", 15, 14)],
        )
        lakers, bucks = self.box["player_stats"]
        self.assertEqual(lakers["totals"][1]["value"], "123")
        self.assertEqual(bucks["totals"][1]["value"], "112")
        self.assertEqual(lakers["players"][0]["stats_by_key"]["points"], "0")
        self.assertEqual(lakers["players"][0]["stat_labels"]["points"]["description"], "Points")

        dnp = [
            player for team in self.box["player_stats"] for player in team["players"]
            if player["did_not_play"]
        ]
        self.assertEqual(
            [(player["name"], player["reason"]) for player in dnp],
            [("Carson Cooper", "COACH'S DECISION"),
             ("Caris LeVert", "COACH'S DECISION")],
        )
        self.assertTrue(all(value is None for player in dnp\n                                for value in player["stats_by_key"].values()))

    def test_full_play_by_play_volume_and_event_categories(self):
        self.assertEqual(len(self.plays), 515)
        self.assertEqual(len({play["id"] for play in self.plays}), 515)
        self.assertEqual(len({play["sequence_number"] for play in self.plays}), 515)
        self.assertEqual(
            Counter(play["action_category"] for play in self.plays),
            Counter({
                "score": 128, "missed_shot": 104, "rebound": 104,
                "substitution": 70, "foul": 52, "turnover": 33,
                "timeout": 10, "challenge": 5, "period_end": 4,
                "violation": 3, "jump_ball": 1, "game_end": 1,
            }),
        )
        self.assertEqual(sum(play["scoring"] for play in self.plays), 128)
        self.assertTrue(self.plays[-1]["is_game_end"])
        self.assertEqual(self.plays[-1]["short_description"], "End of Game")
        self.assertEqual(self.plays[-1]["away_score"], "123")
        self.assertEqual(self.plays[-1]["home_score"], "112")

    def test_all_real_substitutions_and_participants_are_resolved(self):
        changes = module.parse_substitutions(self.plays)
        self.assertEqual(len(changes), 70)
        participant_details = [
            player for play in self.plays for player in play["participant_details"]
        ]
        self.assertEqual(len(participant_details), 643)
        self.assertTrue(all(player.get("name") for player in participant_details))
        self.assertEqual(
            len({player["id"] for player in participant_details}), 28
        )
        self.assertTrue(all(
            participant["name"]
            for change in changes for participant in change["participants"]
        ))

    def test_real_shot_coordinates_exclude_espn_sentinels(self):
        coordinates = [play["coordinate"] for play in self.plays if play["coordinate"]]
        self.assertEqual(len(coordinates), 355)
        self.assertTrue(all(
            abs(point["x"]) <= 10000 and abs(point["y"]) <= 10000
            for point in coordinates
        ))


if __name__ == "__main__":
    unittest.main()
