"""Tests du parseur pur des événements de playoffs ESPN."""
import json
import unittest
from pathlib import Path

from custom_components.nba.playoff_data import (\n    build_playoff_series,\n    parse_playoff_event,\n    parse_playoff_payload,\n)

FIXTURES = Path(__file__).parent / "fixtures"


def load_fixture(name):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


class PlayoffPayloadTests(unittest.TestCase):
    def test_team_schedule_uses_season_type_and_ignores_root_current_season(self):
        payload = load_fixture("espn_playoff_team_schedule_2024_25.json")
        games = parse_playoff_payload(payload)
        self.assertEqual(len(games), 11)
        self.assertEqual({game["season_year"] for game in games}, {2025})
        self.assertEqual({game["phase"] for game in games}, {"playoffs"})
        self.assertEqual(games[0]["round_label"], "East 1st Round")
        self.assertEqual(games[0]["game_number"], 1)
        self.assertEqual(games[0]["teams"][0]["abbreviation"], "BOS")
        self.assertEqual(games[0]["teams"][0]["score"], 103)
        self.assertTrue(games[0]["completed"])

    def test_scoreboard_accepts_string_scores_and_optional_series(self):
        payload = load_fixture("espn_playoff_scoreboard_2025_06_05.json")
        games = parse_playoff_payload(payload)
        self.assertEqual(len(games), 1)
        game = games[0]
        self.assertEqual(game["phase"], "playoffs")
        self.assertEqual(game["label"], "NBA Finals - Game 1")
        self.assertEqual(game["round_label"], "NBA Finals")
        self.assertEqual(game["game_number"], 1)
        self.assertEqual(game["teams"][0]["score"], 110)
        self.assertEqual(game["teams"][1]["score"], 111)
        self.assertEqual(game["series"]["summary"], "IND leads series 1-0")
        self.assertEqual(game["series"]["total_games"], 7)

    def test_multi_game_scoreboard_preserves_four_distinct_events(self):
        games = parse_playoff_payload(load_fixture("espn_playoff_scoreboard_2025_04_20.json"))
        self.assertEqual(len(games), 4)
        self.assertEqual(len({game["id"] for game in games}), 4)
        self.assertTrue(all(game["series"] is not None for game in games))
        self.assertEqual(games[0]["teams"][0]["score"], 131)

    def test_play_in_is_separate_and_does_not_require_series(self):
        games = parse_playoff_payload(load_fixture("espn_playin_scoreboard_2025_04_16.json"))
        self.assertEqual(len(games), 2)
        self.assertTrue(all(game["phase"] == "play_in" for game in games))
        self.assertTrue(all(game["season_type"] == 5 for game in games))
        self.assertTrue(all(game["series"] is None for game in games))
        self.assertIsNone(games[0]["game_number"])
        self.assertIn("Play-In", games[0]["label"])


    def test_reconstructs_both_celtics_series_from_real_team_schedule(self):
        games = parse_playoff_payload(load_fixture("espn_playoff_team_schedule_2024_25.json"))
        series = build_playoff_series(games)
        self.assertEqual(len(series), 2)
        first_round = next(item for item in series if item["round_label"] == "East 1st Round")
        semifinals = next(item for item in series if item["round_label"] == "East Semifinals")
        self.assertEqual(first_round["status"], "completed")
        self.assertEqual(first_round["games_played"], 5)
        self.assertEqual(first_round["winner"]["abbreviation"], "BOS")
        self.assertEqual([team["wins"] for team in first_round["teams"]], [4, 1])
        self.assertEqual(semifinals["status"], "completed")
        self.assertEqual(semifinals["games_played"], 6)
        self.assertEqual(semifinals["winner"]["abbreviation"], "NY")
        self.assertEqual([team["wins"] for team in semifinals["teams"]], [4, 2])

    def test_reconstructs_all_four_okc_series_from_real_team_schedule(self):
        games = parse_playoff_payload(load_fixture("espn_playoff_team_schedule_okc_2024_25.json"))
        series = build_playoff_series(games)
        self.assertEqual(len(games), 23)
        self.assertEqual(len(series), 4)
        by_round = {item["round_label"]: item for item in series}
        self.assertEqual(by_round["West 1st Round"]["games_played"], 4)
        self.assertEqual(by_round["West 1st Round"]["winner"]["abbreviation"], "OKC")
        self.assertEqual(by_round["West Semifinals"]["games_played"], 7)
        self.assertEqual(by_round["West Semifinals"]["winner"]["abbreviation"], "OKC")
        self.assertEqual(by_round["West Finals"]["games_played"], 5)
        self.assertEqual(by_round["West Finals"]["winner"]["abbreviation"], "OKC")
        self.assertEqual(by_round["NBA Finals"]["games_played"], 7)
        self.assertEqual(by_round["NBA Finals"]["winner"]["abbreviation"], "OKC")

    def test_play_in_is_not_grouped_into_best_of_seven_series(self):
        games = parse_playoff_payload(load_fixture("espn_playin_scoreboard_2025_04_16.json"))
        self.assertEqual(build_playoff_series(games), [])

    def test_regular_season_and_invalid_events_are_ignored(self):
        self.assertIsNone(parse_playoff_event({"id": "regular", "season": {"type": 2}}))
        self.assertIsNone(parse_playoff_event({"id": "missing", "season": {"type": 3}}))
        self.assertEqual(parse_playoff_payload({}), [])
        self.assertEqual(parse_playoff_payload({"events": [None, {}, {"season": {"type": 2}}]}), [])


class DefensiveParsingTests(unittest.TestCase):
    def test_invalid_or_incomplete_competitors_are_skipped(self):
        event = {
            "id": "bad",
            "season": {"type": 3},
            "competitions": [{"competitors": [{"id": "1", "team": {"abbreviation": "A"}}]}],
        }
        self.assertIsNone(parse_playoff_event(event))

    def test_missing_score_is_not_zero_and_winner_must_be_boolean(self):
        event = {
            "id": "partial",
            "season": {"type": 3, "year": 2025},
            "competitions": [{
                "competitors": [
                    {"id": "1", "homeAway": "home", "score": "N/A", "winner": "true", "team": {"abbreviation": "A"}},
                    {"id": "2", "homeAway": "away", "score": None, "team": {"abbreviation": "B"}},
                ],
            }],
        }
        parsed = parse_playoff_event(event)
        self.assertIsNotNone(parsed)
        self.assertIsNone(parsed["teams"][0]["score"])
        self.assertIsNone(parsed["teams"][0]["winner"])
        self.assertIsNone(parsed["teams"][1]["score"])
        self.assertIsNone(parsed["completed"])

    def test_score_display_value_is_used_when_numeric_value_is_absent(self):
        event = {
            "id": "display-score",
            "season": {"type": 3, "year": 2025},
            "competitions": [{
                "competitors": [
                    {"id": "1", "homeAway": "home", "score": {"displayValue": "87"}, "team": {}},
                    {"id": "2", "homeAway": "away", "score": {"displayValue": "82"}, "team": {}},
                ],
            }],
        }
        parsed = parse_playoff_event(event)
        self.assertEqual([team["score"] for team in parsed["teams"]], [87, 82])


    def test_only_completed_games_with_explicit_winner_count(self):
        games = []
        for number in range(1, 5):
            games.append({
                "id": str(number),
                "season_year": 2025,
                "phase": "playoffs",
                "round_label": "East 1st Round",
                "game_number": number,
                "date": f"2025-04-{20 + number:02d}T00:00Z",
                "completed": True,
                "teams": [
                    {"id": "1", "abbreviation": "AAA", "name": "Team A", "winner": True},
                    {"id": "2", "abbreviation": "BBB", "name": "Team B", "winner": False},
                ],
            })
        games[3]["completed"] = None
        games[2]["teams"][0]["winner"] = None
        series = build_playoff_series(games)[0]
        self.assertEqual(series["teams"][0]["wins"], 2)
        self.assertEqual(series["status"], "in_progress")
        self.assertEqual(series["unknown_results"], 2)
        self.assertIsNone(series["winner"])

    def test_more_than_seven_games_is_flagged_inconsistent(self):
        games = []
        for number in range(1, 9):
            games.append({
                "id": str(number),
                "season_year": 2025,
                "phase": "playoffs",
                "round_label": "NBA Finals",
                "game_number": number,
                "completed": True,
                "teams": [
                    {"id": "1", "abbreviation": "AAA", "winner": number <= 4},
                    {"id": "2", "abbreviation": "BBB", "winner": number > 4},
                ],
            })
        series = build_playoff_series(games)[0]
        self.assertEqual(series["status"], "inconsistent")
        self.assertIn("more_than_7_games", series["issues"])
        self.assertIsNone(series["winner"])

    def test_schedule_score_object_and_scoreboard_string_are_both_supported(self):
        event = {
            "id": "schedule",
            "season": {"year": 2025},
            "seasonType": {"type": 3},
            "competitions": [{
                "competitors": [
                    {"id": "1", "homeAway": "home", "score": {"value": 99, "displayValue": "99"}, "team": {}},
                    {"id": "2", "homeAway": "away", "score": "95", "team": {}},
                ],
            }],
        }
        parsed = parse_playoff_event(event)
        self.assertEqual([team["score"] for team in parsed["teams"]], [99, 95])


if __name__ == "__main__":
    unittest.main()
