"""Tests du parseur pur des événements de playoffs ESPN."""
import json
import unittest
from pathlib import Path

from custom_components.nba.playoff_data import (
    build_playoff_bracket,
    build_playoff_series,
    annotate_playoff_bracket,
    parse_playoff_event,
    parse_playoff_payload,
    parse_playoff_standings,
    validate_playoff_seeds,
)

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


    def test_bracket_links_okc_winners_across_all_four_rounds(self):
        games = parse_playoff_payload(load_fixture("espn_playoff_team_schedule_okc_2024_25.json"))
        series = build_playoff_series(games)
        brackets = build_playoff_bracket(series)
        self.assertEqual(len(brackets), 1)
        bracket = brackets[0]
        self.assertEqual(bracket["season_year"], 2025)
        self.assertEqual([round_data["round_label"] for round_data in bracket["conferences"]["West"]], [
            "West 1st Round", "West Semifinals", "West Finals"
        ])
        first_round = next(item for item in series if item["round_label"] == "West 1st Round")
        semifinals = next(item for item in series if item["round_label"] == "West Semifinals")
        conference_finals = next(item for item in series if item["round_label"] == "West Finals")
        nba_finals = bracket["finals"][0]
        self.assertEqual(first_round["advances_to"], [semifinals["id"]])
        self.assertEqual(semifinals["advanced_from"], [first_round["id"]])
        self.assertEqual(semifinals["advances_to"], [conference_finals["id"]])
        self.assertEqual(conference_finals["advances_to"], [nba_finals["id"]])
        self.assertEqual(nba_finals["advanced_from"], [conference_finals["id"]])
        self.assertEqual(bracket["unplaced"], [])

    def test_bracket_does_not_invent_seed_positions_or_unverified_links(self):
        series = [{
            "id": "2025:playoffs:East 1st Round:1:2",
            "season_year": 2025,
            "phase": "playoffs",
            "round_label": "East 1st Round",
            "winner": {"id": "1", "name": "Team A"},
            "teams": [{"id": "1"}, {"id": "2"}],
        }, {
            "id": "2025:playoffs:East Semifinals:3:4",
            "season_year": 2025,
            "phase": "playoffs",
            "round_label": "East Semifinals",
            "winner": None,
            "teams": [{"id": "3"}, {"id": "4"}],
        }]
        bracket = build_playoff_bracket(series)[0]
        self.assertEqual(series[0]["advances_to"], [])
        self.assertEqual(series[1]["advanced_from"], [])
        self.assertEqual(bracket["unplaced"], [])

    def test_bracket_does_not_mutate_input_series(self):
        series = [{
            "id": "first", "season_year": 2025, "phase": "playoffs",
            "round_label": "East 1st Round", "winner": {"id": "1"},
            "teams": [{"id": "1"}, {"id": "8"}],
        }, {
            "id": "next", "season_year": 2025, "phase": "playoffs",
            "round_label": "East Semifinals", "winner": None,
            "teams": [{"id": "1"}, {"id": "4"}],
        }]
        original = json.loads(json.dumps(series))
        bracket = build_playoff_bracket(series)
        self.assertEqual(series, original)
        self.assertEqual(bracket[0]["conferences"]["East"][0]["series"][0]["advances_to"], ["next"])

    def test_bracket_keeps_unknown_rounds_out_of_conference_slots(self):
        series = [{
            "id": "unknown",
            "season_year": 2025,
            "phase": "playoffs",
            "round_label": "Special Playoff Round",
            "winner": None,
            "teams": [{"id": "1"}, {"id": "2"}],
        }]
        bracket = build_playoff_bracket(series)[0]
        self.assertEqual(bracket["unplaced"], series)

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


class PlayoffStandingsTests(unittest.TestCase):
    def test_extracts_conference_seed_and_clincher_without_assuming_seed_is_official(self):
        def entry(team_id, abbr, seed, clincher):
            return {
                "team": {"id": str(team_id), "abbreviation": abbr, "displayName": abbr},
                "stats": [
                    {"type": "playoffseed", "value": float(seed), "displayValue": str(seed),
                     "description": "Projected seed in the NBA Playoffs, according to BPI"},
                    {"type": "clincher", "value": 7.0, "displayValue": clincher},
                    {"type": "wins", "value": 45.0, "displayValue": "45"},
                    {"type": "losses", "value": 37.0, "displayValue": "37"},
                ],
            }

        payload = {
            "children": [
                {"name": "Eastern Conference", "abbreviation": "East", "standings": {
                    "seasonDisplayName": "2025-26",
                    "entries": [
                        entry(20, "PHI", 7, "xp"),
                        entry(19, "ORL", 8, "xp"),
                        entry(14, "MIA", 10, "pb"),
                    ],
                }},
                {"name": "Western Conference", "abbreviation": "West", "standings": {
                    "seasonDisplayName": "2025-26",
                    "entries": [
                        entry(22, "POR", 7, "xp"),
                        entry(21, "PHX", 8, "xp"),
                    ],
                }},
            ],
        }

        teams = parse_playoff_standings(payload)
        by_abbr = {team["abbreviation"]: team for team in teams}
        self.assertEqual(len(teams), 5)
        self.assertEqual(by_abbr["POR"]["seed"], 7)
        self.assertEqual(by_abbr["PHX"]["seed"], 8)
        self.assertEqual(by_abbr["POR"]["conference"], "West")
        self.assertEqual(by_abbr["PHI"]["conference"], "East")
        self.assertEqual(by_abbr["MIA"]["clincher"], "pb")
        self.assertEqual(by_abbr["POR"]["season"], "2025-26")
        self.assertIn("Projected seed", by_abbr["POR"]["seed_description"])

    def test_missing_or_malformed_standings_return_empty_or_partial_data(self):
        self.assertEqual(parse_playoff_standings({}), [])
        payload = {"children": [{
            "abbreviation": "East",
            "standings": {"entries": [
                {"team": {"id": "1", "abbreviation": "AAA"}, "stats": []},
                {"team": {"id": "2"}, "stats": []},
                {"team": {"abbreviation": "BBB"}, "stats": []},
            ]},
        }]}
        teams = parse_playoff_standings(payload)
        self.assertEqual(len(teams), 1)
        self.assertIsNone(teams[0]["seed"])
        self.assertIsNone(teams[0]["clincher"])



class ValidatedSeedTests(unittest.TestCase):
    def test_real_historical_standings_have_complete_unique_seeds(self):
        expected = {
            "2024-25": {
                "East": ["CLE", "BOS", "NY", "IND", "MIL", "DET", "ORL", "MIA"],
                "West": ["OKC", "HOU", "LAL", "DEN", "LAC", "MIN", "GS", "MEM"],
            },
            "2025-26": {
                "East": ["DET", "BOS", "NY", "CLE", "TOR", "ATL", "PHI", "ORL"],
                "West": ["OKC", "SA", "DEN", "LAL", "HOU", "MIN", "POR", "PHX"],
            },
        }
        for fixture, season, conferences in (
            ("espn_standings_2024_25_seeds.json", "2024-25", expected["2024-25"]),
            ("espn_standings_2025_26_seeds.json", "2025-26", expected["2025-26"]),
        ):
            parsed = parse_playoff_standings(load_fixture(fixture))
            validated = validate_playoff_seeds(parsed)["seasons"][season]["conferences"]
            by_id = {item["team_id"]: item for item in parsed}
            for conference, abbreviations in conferences.items():
                self.assertTrue(validated[conference]["valid"], validated[conference]["errors"])
                actual = [
                    next(item["abbreviation"] for item in parsed
                         if item["conference"] == conference and item["seed"] == seed)
                    for seed in range(1, 9)
                ]
                self.assertEqual(actual, abbreviations)

    def test_missing_or_duplicate_seed_invalidates_entire_conference(self):
        teams = [
            {"season": "2025-26", "conference": "East", "team_id": str(seed),
             "abbreviation": str(seed), "seed": seed}
            for seed in range(1, 9)
        ]
        teams[-1]["seed"] = 7
        result = validate_playoff_seeds(teams)["seasons"]["2025-26"]["conferences"]["East"]
        self.assertFalse(result["valid"])
        self.assertEqual(result["seeds"], {})
        self.assertIn("duplicate_seed_7", result["errors"])
        self.assertIn("missing_seed_8", result["errors"])

    def test_missing_team_id_with_valid_seed_invalidates_conference_without_crashing(self):
        teams = [
            {"season": "2025-26", "conference": "East", "team_id": str(seed), "seed": seed}
            for seed in range(1, 9)
        ]
        teams[3]["team_id"] = None
        result = validate_playoff_seeds(teams)["seasons"]["2025-26"]["conferences"]["East"]
        self.assertFalse(result["valid"])
        self.assertEqual(result["seeds"], {})
        self.assertIn("duplicate_or_missing_team_ids", result["errors"])

    def test_bracket_annotation_is_non_mutating_and_checks_first_round_pairings(self):
        standings = validate_playoff_seeds([
            {"season": "2025-26", "conference": "East", "team_id": str(seed),
             "seed": seed} for seed in range(1, 9)
        ])
        original = {
            "season_year": 2026,
            "conferences": {"East": [
                {"round_label": "East 1st Round", "series": [
                    {"id": "a", "teams": [{"id": "1"}, {"id": "8"}]},
                    {"id": "b", "teams": [{"id": "2"}, {"id": "7"}]},
                    {"id": "c", "teams": [{"id": "3"}, {"id": "6"}]},
                    {"id": "d", "teams": [{"id": "4"}, {"id": "5"}]},
                ]}
            ], "West": []},
            "finals": [], "unplaced": [],
        }
        annotated = annotate_playoff_bracket(original, standings)
        self.assertTrue(annotated["conferences"]["East"][0]["matchups_valid"])
        self.assertNotIn("seed", original["conferences"]["East"][0]["series"][0]["teams"][0])
        self.assertEqual(
            [tuple(team["seed"] for team in item["teams"])
             for item in annotated["conferences"]["East"][0]["series"]],
            [(1, 8), (2, 7), (3, 6), (4, 5)],
        )

    def test_partial_first_round_is_not_claimed_valid(self):
        standings = validate_playoff_seeds([
            {"season": "2025-26", "conference": "East", "team_id": str(seed),
             "seed": seed} for seed in range(1, 9)
        ])
        bracket = {"season_year": 2026, "conferences": {"East": [
            {"round_label": "East 1st Round", "series": [
                {"id": "a", "teams": [{"id": "1"}, {"id": "8"}]}
            ]}
        ], "West": []}, "finals": [], "unplaced": []}
        annotated = annotate_playoff_bracket(bracket, standings)
        self.assertFalse(annotated["conferences"]["East"][0]["matchups_valid"])



class HistoricalBracketSeedIntegrationTests(unittest.TestCase):
    def test_real_2024_25_okc_and_celtics_series_receive_verified_seeds(self):
        standings = validate_playoff_seeds(
            parse_playoff_standings(load_fixture("espn_standings_2024_25_seeds.json"))
        )
        okc_games = parse_playoff_payload(
            load_fixture("espn_playoff_team_schedule_okc_2024_25.json")
        )
        celtics_games = parse_playoff_payload(
            load_fixture("espn_playoff_team_schedule_2024_25.json")
        )
        all_series = build_playoff_series(okc_games + celtics_games)
        brackets = build_playoff_bracket(all_series)
        self.assertEqual(len(brackets), 1)
        bracket = annotate_playoff_bracket(brackets[0], standings)

        west_first = next(
            item for item in bracket["conferences"]["West"]
            if item["round_label"] == "West 1st Round"
        )
        okc_memphis = next(
            item for item in west_first["series"]
            if {team["abbreviation"] for team in item["teams"]} == {"OKC", "MEM"}
        )
        self.assertEqual(
            {team["abbreviation"]: team["seed"] for team in okc_memphis["teams"]},
            {"OKC": 1, "MEM": 8},
        )

        east_first = next(
            item for item in bracket["conferences"]["East"]
            if item["round_label"] == "East 1st Round"
        )
        bos_orlando = next(
            item for item in east_first["series"]
            if {team["abbreviation"] for team in item["teams"]} == {"BOS", "ORL"}
        )
        self.assertEqual(
            {team["abbreviation"]: team["seed"] for team in bos_orlando["teams"]},
            {"BOS": 2, "ORL": 7},
        )
        # Only two of the eight first-round series are present in these captures.
        # The parser must not mark the partial historical bracket as complete.
        self.assertFalse(west_first["matchups_valid"])
        self.assertFalse(east_first["matchups_valid"])

        west_semis = next(
            item for item in bracket["conferences"]["West"]
            if item["round_label"] == "West Semifinals"
        )
        okc_denver = next(
            item for item in west_semis["series"]
            if {team["abbreviation"] for team in item["teams"]} == {"OKC", "DEN"}
        )
        self.assertEqual(
            {team["abbreviation"]: team["seed"] for team in okc_denver["teams"]},
            {"OKC": 1, "DEN": 4},
        )
        nba_finals = bracket["finals"][0]
        self.assertEqual(
            {team["abbreviation"]: team["seed"] for team in nba_finals["teams"]},
            {"OKC": 1, "IND": 4},
        )
        self.assertEqual(okc_denver["winner"]["abbreviation"], "OKC")
        self.assertEqual(nba_finals["winner"]["abbreviation"], "OKC")
