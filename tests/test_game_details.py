"""Tests du parseur de box score ESPN sans Home Assistant ni réseau."""
import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)
parse_boxscore = module.parse_boxscore
parse_plays = module.parse_plays


class BoxscoreParsingTests(unittest.TestCase):
    def test_parses_team_stats_and_player_rows_by_team(self):
        raw = {
            "boxscore": {
                "teams": [
                    {"team": {"id": "2", "displayName": "Boston Celtics", "abbreviation": "BOS"},
                     "statistics": [
                         {"name": "rebounds", "label": "Rebounds", "displayValue": "42"},
                         {"name": "fieldGoalPct", "label": "FG%", "displayValue": "48.2"},
                     ]},
                    {"team": {"id": "17", "displayName": "New York Knicks", "abbreviation": "NYK"},
                     "statistics": [{"name": "rebounds", "displayValue": "39"}]},
                ],
                "players": [
                    {"team": {"id": "2"}, "statistics": [{
                        "names": ["MIN", "FG", "3PT", "REB", "AST", "PTS"],
                        "athletes": [
                            {"athlete": {"id": "1", "displayName": "Jayson Tatum", "shortName": "J. Tatum",
                                         "jersey": "0", "headshot": {"href": "https://img.test/tatum.png"}},
                             "starter": True, "active": True, "stats": ["38:12", "10-20", "4-9", "8", "5", "27"]},
                            {"athlete": {"id": "2", "displayName": "Bench Player"},
                             "didNotPlay": True, "reason": "Coach's Decision", "stats": []},
                        ],
                    }]},
                ],
            }
        }
        result = parse_boxscore(raw)
        self.assertTrue(result["has_boxscore"])
        self.assertEqual([t["abbr"] for t in result["team_stats"]], ["BOS", "NYK"])
        self.assertEqual(result["team_stats"][0]["statistics"][0]["value"], "42")
        bos = result["player_stats"][0]
        self.assertEqual(bos["team_id"], "2")
        self.assertEqual(bos["players"][0]["stats"]["FG"], "10-20")
        self.assertEqual(bos["players"][0]["stats"]["PTS"], "27")
        self.assertTrue(bos["players"][0]["starter"])
        self.assertTrue(bos["players"][1]["did_not_play"])
        self.assertEqual(bos["players"][1]["reason"], "Coach's Decision")


    def test_parses_play_by_play_and_scoring_state(self):
        raw = {"plays": [
            {"id": "p1", "period": {"number": 4}, "clock": {"displayValue": "02:14"},
             "type": {"text": "3PT Made"}, "text": "Player makes 3-pt jump shot",
             "team": {"id": "2"}, "scoreValue": 3, "homeScore": 98, "awayScore": 101,
             "scoringPlay": True},
            {"id": "p2", "period": {"number": 4}, "clock": {"displayValue": "01:59"},
             "text": "Defensive rebound", "scoringPlay": False},
        ]}
        plays = parse_plays(raw)
        self.assertEqual(len(plays), 2)
        self.assertEqual(plays[0]["period"], "4")
        self.assertEqual(plays[0]["clock"], "02:14")
        self.assertEqual(plays[0]["type"], "3PT Made")
        self.assertTrue(plays[0]["scoring"])
        self.assertEqual(plays[0]["home_score"], "98")
        self.assertFalse(plays[1]["scoring"])


    def test_play_parser_tolerates_scalar_nested_fields(self):
        plays = parse_plays({"plays": [
            {"id": 9, "period": 3, "clock": "00:12", "type": "Timeout", "team": "2"},
            None,
            "invalid",
        ]})
        self.assertEqual(len(plays), 1)
        self.assertEqual(plays[0]["period"], "3")
        self.assertEqual(plays[0]["clock"], "00:12")
        self.assertEqual(plays[0]["type"], "Timeout")
        self.assertIsNone(plays[0]["team_id"])

    def test_missing_plays_is_empty(self):
        self.assertEqual(parse_plays({}), [])

    def test_missing_boxscore_is_empty_not_an_error(self):
        self.assertEqual(parse_boxscore({}), {
            "team_stats": [], "player_stats": [], "has_boxscore": False
        })

    def test_missing_stat_values_are_not_fabricated_as_zero(self):
        result = parse_boxscore({"boxscore": {"players": [
            {"team": {"id": "9"}, "statistics": [{
                "names": ["MIN", "PTS"],
                "athletes": [{"athlete": {"id": "3", "displayName": "Player"}, "stats": ["DNP"]}],
            }]},
        ]}})
        stats = result["player_stats"][0]["players"][0]["stats"]
        self.assertEqual(stats, {"MIN": "DNP", "PTS": None})


if __name__ == "__main__":
    unittest.main()
