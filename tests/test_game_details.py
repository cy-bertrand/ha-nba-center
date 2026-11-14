"""Tests du parseur de détails de match ESPN NBA."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "custom_components" / "nba" / "game_details.py"
SPEC = importlib.util.spec_from_file_location("game_details", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)
parse_boxscore = module.parse_boxscore
parse_plays = module.parse_plays
parse_game_state = module.parse_game_state
parse_substitutions = module.parse_substitutions


class BoxscoreParsingTests(unittest.TestCase):
    def test_score_and_shot_coordinates_reject_invalid_numbers(self):
        self.assertIsNone(module._score(True))
        self.assertIsNone(module._score(12.5))
        self.assertIsNone(module._score(float("inf")))
        self.assertEqual(module._score("102"), 102)
        self.assertIsNone(module._coordinate({"x": float("nan"), "y": 12}))
        self.assertIsNone(module._coordinate({"x": True, "y": 12}))
        self.assertEqual(module._coordinate({"x": 36, "y": 0}), {"x": 36, "y": 0})

    def test_home_away_is_read_from_team_block_or_team_object(self):
        raw = {"boxscore": {"teams": [
            {"team": {"id": "1", "abbreviation": "WSH"}, "homeAway": "home"},
            {"team": {"id": "2", "abbreviation": "DET", "homeAway": "away"}},
        ]}}
        parsed = parse_boxscore(raw)
        self.assertEqual([team["home_away"] for team in parsed["team_stats"]], ["home", "away"])
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
        self.assertEqual(bos["players"][0]["id"], "1")
        self.assertTrue(bos["players"][0]["starter"])
        self.assertTrue(bos["players"][0]["active"])
        self.assertIsNone(bos["players"][1]["active"])
        self.assertTrue(bos["players"][1]["did_not_play"])
        self.assertEqual(bos["players"][1]["reason"], "Coach's Decision")

    def test_player_availability_and_disciplinary_flags_are_preserved(self):
        raw = {"boxscore": {"players": [{
            "team": {"id": "8", "abbreviation": "BOS"},
            "statistics": [{
                "names": ["MIN", "PTS"],
                "athletes": [
                    {"athlete": {"id": "1", "displayName": "Starter", "jersey": "7"},
                     "starter": True, "active": True, "stats": ["32:10", "18"]},
                    {"athlete": {"id": "2", "displayName": "Inactive", "jersey": "9"},
                     "starter": False, "active": False, "didNotPlay": False,
                     "reason": "COACH'S DECISION", "stats": ["DNP", "0"]},
                    {"athlete": {"id": "3", "displayName": "DNP Player", "jersey": "11"},
                     "starter": False, "active": False, "didNotPlay": True,
                     "reason": "INJURY", "stats": []},
                    {"athlete": {"id": "4", "displayName": "Ejected", "jersey": "15"},
                     "starter": False, "active": False, "ejected": True,
                     "stats": ["12:00", "4"]},
                ],
            }],
        }]}}
        players = parse_boxscore(raw)["player_stats"][0]["players"]
        self.assertEqual(
            [(p["name"], p["jersey"], p["starter"], p["active"],
              p["did_not_play"], p["ejected"], p["reason"]) for p in players],
            [
                ("Starter", "7", True, True, None, None, None),
                ("Inactive", "9", False, False, False, None, "COACH'S DECISION"),
                ("DNP Player", "11", False, False, True, None, "INJURY"),
                ("Ejected", "15", False, False, None, True, None),
            ],
        )

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

    def test_play_participants_are_enriched_by_espn_player_id(self):
        raw = {
            "boxscore": {"players": [{"team": {"id": "8"}, "statistics": [{
                "athletes": [{"athlete": {"id": "3908845", "displayName": "John Collins",
                                       "shortName": "J. Collins", "jersey": "20",
                                       "position": {"abbreviation": "C"},
                                       "headshot": {"href": "https://img.test/collins.png"}}}]
            }]}]},
            "plays": [{"participants": [{"athlete": {"id": "3908845"}},
                                           {"athlete": {"id": "unknown-id"}}]}],
        }
        play = parse_plays(raw)[0]
        self.assertEqual(play["participants"], ["3908845", "unknown-id"])
        self.assertEqual(play["participant_details"][0], {
            "id": "3908845", "name": "John Collins", "short_name": "J. Collins",
            "jersey": "20", "position": "C", "team_id": "8",
            "headshot": "https://img.test/collins.png",
        })
        self.assertEqual(play["participant_details"][1], {"id": "unknown-id", "name": None})

    def test_substitution_events_preserve_linked_players_and_order(self):
        raw = {
            "boxscore": {"players": [{"team": {"id": "8"}, "statistics": [{
                "athletes": [
                    {"athlete": {"id": "101", "displayName": "Player In"}},
                    {"athlete": {"id": "102", "displayName": "Player Out"}},
                ]
            }]}]},
            "plays": [{
                "id": "sub-1", "sequenceNumber": "22", "period": {"number": 2},
                "clock": {"displayValue": "08:15"}, "type": {"text": "Substitution"},
                "text": "Player In enters the game for Player Out",
                "team": {"id": "8"},
                "participants": [{"athlete": {"id": "101"}}, {"athlete": {"id": "102"}}],
            }],
        }
        plays = parse_plays(raw)
        changes = parse_substitutions(plays)
        self.assertEqual(len(changes), 1)
        self.assertEqual(changes[0]["sequence_number"], "22")
        self.assertEqual([p["name"] for p in changes[0]["participants"]],
                         ["Player In", "Player Out"])
        self.assertEqual(changes[0]["team_id"], "8")

    def test_play_parser_tolerates_scalar_nested_fields(self):
        plays = parse_plays({"plays": [
            {"id": 9, "period": 3, "clock": "00:12", "type": "Timeout", "team": "2"},
            None, "invalid",
        ]})
        self.assertEqual(len(plays), 1)
        self.assertEqual(plays[0]["period"], "3")
        self.assertEqual(plays[0]["clock"], "00:12")
        self.assertEqual(plays[0]["type"], "Timeout")
        self.assertIsNone(plays[0]["team_id"])

    def test_live_header_score_is_kept_separate_from_stale_play_scores(self):
        raw = {
            "header": {"id": "401909977", "competitions": [{
                "status": {"period": 1, "displayClock": "2:40", "displayPeriod": "1st Quarter",
                           "type": {"state": "in", "completed": False, "detail": "2:40 - 1st Quarter"}},
                "competitors": [
                    {"id": "8", "homeAway": "home", "score": "32", "team": {"abbreviation": "WSH", "displayName": "Washington Wizards"}},
                    {"id": "9", "homeAway": "away", "score": "26", "team": {"abbreviation": "DET", "displayName": "Detroit Pistons"}},
                ],
            }]},
            "meta": {"gameState": "in", "lastUpdatedAt": "2026-11-13T00:27:42Z", "lastPlayWallClock": "2026-11-13T00:27:42Z"},
            "plays": [{"homeScore": 32, "awayScore": 24, "scoringPlay": False}],
        }
        state = parse_game_state(raw)
        play = parse_plays(raw)[0]
        self.assertEqual(state["state"], "in")
        self.assertEqual(state["clock"], "2:40")
        self.assertEqual([team["score"] for team in state["competitors"]], [32, 26])
        self.assertEqual(play["away_score"], "24")
        self.assertEqual(state["score_source"], "header.competitions[0].competitors")
    def test_play_parser_sorts_numeric_sequence_numbers_chronologically(self):
        plays = parse_plays({"plays": [
            {"id": "late", "sequenceNumber": "300", "text": "Late event"},
            {"id": "unknown", "text": "No sequence"},
            {"id": "early", "sequenceNumber": "12", "text": "Early event"},
            {"id": "middle", "sequenceNumber": "150", "text": "Middle event"},
        ]})
        self.assertEqual([play["id"] for play in plays],
                         ["early", "middle", "late", "unknown"])

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

    def test_actual_espn_fixture_schema_and_enriched_fields(self):
        fixture = json.loads((ROOT / "tests" / "fixtures" / "espn_summary_401909971.json").read_text())
        box = parse_boxscore(fixture)
        self.assertEqual([team["abbr"] for team in box["team_stats"]], ["LAL", "MIL"])
        self.assertEqual(box["team_stats"][0]["statistics"][0]["value"], "44-95")
        self.assertEqual(box["team_stats"][0]["home_away"], "away")
        self.assertEqual(box["player_stats"][0]["players"][0]["stats"]["PTS"], "0")
        self.assertEqual(box["player_stats"][0]["players"][0]["stats_by_key"]["points"], "0")
        self.assertEqual(box["player_stats"][0]["players"][0]["stat_labels"]["points"]["description"], "Points")
        self.assertEqual(box["player_stats"][0]["totals"][1]["value"], "123")
        self.assertEqual(box["player_stats"][1]["totals"][1]["value"], "112")

        plays = parse_plays(fixture)
        self.assertEqual(len(plays), 3)
        self.assertEqual(plays[-1]["sequence_number"], "766")
        self.assertEqual(plays[-1]["away_score"], "123")
        self.assertEqual(plays[-1]["home_score"], "112")
        self.assertEqual(plays[-1]["short_description"], "End of Game")
        self.assertEqual(plays[-1]["action_category"], "game_end")
        self.assertTrue(plays[-1]["is_game_end"])
        self.assertEqual(plays[0]["participants"], ["4433136", "5105623", "4592691"])
        self.assertEqual(plays[0]["action_category"], "jump_ball")
        self.assertTrue(plays[1]["is_foul"])
        self.assertIsNone(plays[0]["coordinate"])
        self.assertEqual(plays[1]["coordinate"], {"x": 36, "y": 0})

    def test_fixture_play_events_keep_clock_and_period_display(self):
        fixture = json.loads((ROOT / "tests" / "fixtures" / "espn_summary_401909971.json").read_text())
        plays = parse_plays(fixture)
        self.assertEqual(plays[0]["period_display"], "1st Quarter")
        self.assertEqual(plays[0]["clock"], "12:00")
        self.assertEqual(plays[-1]["type"], "End Game")


    def test_structured_event_labels_avoid_commentary_false_positives(self):
        plays = parse_plays({"plays": [
            {"type": {"text": "Jump Shot"}, "shortDescription": "+2 Points",
             "text": "Player makes a shot after a timeout review"},
            {"type": {"text": "End Period"}, "shortDescription": "Halftime",
             "text": "End of the 2nd Quarter"},
            {"type": {"text": "Full Timeout"}, "shortDescription": "Timeout",
             "text": "Timeout after a foul review"},
        ]})
        self.assertEqual(plays[0]["action_category"], "score")
        self.assertFalse(plays[0]["is_timeout"])
        self.assertTrue(plays[1]["is_period_end"])
        self.assertEqual(plays[2]["action_category"], "timeout")
        self.assertFalse(plays[2]["is_foul"])

    def test_event_flags_fall_back_to_commentary_only_when_labels_are_missing(self):
        plays = parse_plays({"plays": [
            {"text": "Player offensive foul turnover"},
            {"type": {"text": "Jump Shot"}, "text": "Player misses after a timeout"},
        ]})
        self.assertTrue(plays[0]["is_foul"])
        self.assertTrue(plays[0]["is_turnover"])
        self.assertEqual(plays[0]["action_category"], "foul")
        self.assertFalse(plays[1]["is_timeout"])
        self.assertEqual(plays[1]["action_category"], "other")
    def test_score_change_uses_espn_scoring_play_marker(self):
        plays = parse_plays({"plays": [
            {"homeScore": 0, "awayScore": 0, "scoringPlay": False},
            {"homeScore": 2, "awayScore": 0, "scoringPlay": True},
            {"homeScore": 2, "awayScore": 0, "scoringPlay": False},
            {"homeScore": 2, "awayScore": 3, "scoringPlay": True},
            {"homeScore": 2, "awayScore": 3, "scoringPlay": False},
        ]})
        self.assertEqual([p["score_changed"] for p in plays],
                         [False, True, False, True, False])

    def test_event_flags_can_describe_compound_events(self):
        plays = parse_plays({"plays": [
            {"type": {"text": "Offensive Foul Turnover"}, "text": "Player offensive foul turnover"},
            {"type": {"text": "Defensive Rebound"}, "shortDescription": "Rebound"},
            {"type": {"text": "End Period"}, "text": "End of the 2nd Quarter",
             "shortDescription": "Halftime"},
        ]})
        self.assertEqual(plays[0]["action_category"], "foul")
        self.assertTrue(plays[0]["is_foul"])
        self.assertTrue(plays[0]["is_turnover"])
        self.assertTrue(plays[1]["is_rebound"])
        self.assertTrue(plays[2]["is_period_end"])


if __name__ == "__main__":
    unittest.main()
