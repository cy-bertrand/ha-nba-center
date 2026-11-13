"""Tests des parseurs de données individuelles ESPN."""
import unittest

from custom_components.nba.player_data import parse_player_gamelog, parse_player_stats


class PlayerDataParserTests(unittest.TestCase):
    def test_parses_flat_overview_statistics(self):
        result = parse_player_stats({
            "season": {"displayName": "2026-27"},
            "athlete": {"id": "123", "displayName": "Example Player"},
            "statistics": {
                "labels": ["GP", "PTS", "REB", "AST"],
                "names": ["gamesPlayed", "avgPoints", "avgRebounds", "avgAssists"],
                "values": [20, 27.4, 5.2, 7],
                "displayValues": ["20", "27.4", "5.2", "7.0"],
            },
        })
        self.assertEqual(result["season"], "2026-27")
        self.assertEqual(result["athlete"]["name"], "Example Player")
        self.assertEqual([row["name"] for row in result["statistics"]], [
            "gamesPlayed", "avgPoints", "avgRebounds", "avgAssists",
        ])
        self.assertEqual(result["statistics"][1]["value"], 27.4)
        self.assertEqual(result["statistics"][1]["display_value"], "27.4")

    def test_parses_categories_stats_shape(self):
        result = parse_player_stats({"categories": [{
            "displayName": "Offensive",
            "stats": [
                {"name": "avgPoints", "displayName": "Points per game", "value": 24.5, "displayValue": "24.5"},
                {"name": "avgAssists", "label": "Assists", "value": "6.2"},
            ],
        }]})
        self.assertEqual(len(result["statistics"]), 2)
        self.assertEqual(result["statistics"][0]["category"], "Offensive")
        self.assertEqual(result["statistics"][1]["value"], 6.2)

    def test_parses_real_espn_stats_categories(self):
        result = parse_player_stats({"filters": {"season": {"value": "2027"}}, "categories": [{
            "name": "averages", "displayName": "Regular Season Averages",
            "labels": ["GP", "REB", "AST", "PTS"],
            "names": ["gamesPlayed", "avgRebounds", "avgAssists", "avgPoints"],
            "displayNames": ["Games Played", "Rebounds Per Game", "Assists Per Game", "Points Per Game"],
            "statistics": [
                {"season": {"year": 2026, "displayName": "2025-26"}, "stats": ["64", "11.5", "3.1", "25.0"]},
                {"season": {"year": 2027, "displayName": "2026-27"}, "stats": ["12", "11.7", "2.8", "30.3"]},
            ],
        }]})
        self.assertEqual(result["statistics"][-1]["name"], "avgPoints")
        self.assertEqual(result["statistics"][-1]["value"], 30.3)
        self.assertEqual(result["statistics"][-1]["season"], "2026-27")

    def test_parses_real_espn_overview_splits(self):
        result = parse_player_stats({"statistics": {
            "labels": ["GP", "MIN", "REB", "AST", "PTS"],
            "names": ["gamesPlayed", "avgMinutes", "avgRebounds", "avgAssists", "avgPoints"],
            "displayNames": ["Games Played", "Minutes Per Game", "Rebounds Per Game", "Assists Per Game", "Points Per Game"],
            "splits": [
                {"displayName": "Regular Season", "stats": ["12", "30.0", "11.7", "2.8", "30.3"]},
                {"displayName": "Career", "stats": ["193", "30.4", "11.1", "3.5", "23.8"]},
            ],
        }})
        self.assertEqual(result["statistics"][-1]["value"], 30.3)
        self.assertEqual(result["statistics"][-1]["category"], "Regular Season")

    def test_parses_real_espn_gamelog_dictionary(self):
        result = parse_player_gamelog({"labels": ["MIN", "PTS"], "names": ["minutes", "points"], "events": {
            "401909969": {
                "id": "401909969", "gameDate": "2026-11-12T01:00:00.000+00:00",
                "score": "124-119", "atVs": "@", "gameResult": "W",
                "team": {"abbreviation": "SA"},
                "opponent": {"displayName": "Chicago Bulls", "abbreviation": "CHI"},
            },
        }})
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["games"][0]["opponent"], "Chicago Bulls")
        self.assertEqual(result["games"][0]["score"], "124-119")
        self.assertEqual(result["games"][0]["home_away"], "@")
        self.assertEqual(result["games"][0]["stats"], {})

    def test_missing_stats_are_not_fabricated(self):
        result = parse_player_stats({"statistics": {"labels": ["PTS"], "names": ["avgPoints"], "values": []}})
        self.assertEqual(result["statistics"], [])

    def test_parses_gamelog_events(self):
        result = parse_player_gamelog({"events": [
            {"id": "g1", "date": "2026-11-10T00:00Z", "name": "AAA at BBB",
             "gameResult": "W", "opponentDisplayName": "BBB", "stats": ["30", "8", "6"],
             "labels": ["PTS", "REB", "AST"]},
            {"eventId": "g2", "shortName": "CCC vs BBB", "stats": {"points": 18, "rebounds": 4}},
        ]})
        self.assertEqual(result["count"], 2)
        self.assertEqual(result["games"][0]["stats"]["PTS"], 30)
        self.assertEqual(result["games"][0]["opponent"], "BBB")
        self.assertEqual(result["games"][1]["stats"]["points"], 18)

    def test_parses_nested_overview_gamelog_events(self):
        result = parse_player_gamelog({"gameLog": {"events": [
            {"id": "g1", "gameResult": "W", "stats": ["32", "9", "7"],
             "labels": ["PTS", "REB", "AST"]},
        ]}})
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["games"][0]["stats"]["PTS"], 32)

    def test_unexpected_gamelog_payload_is_empty(self):
        self.assertEqual(parse_player_gamelog({"events": "invalid"})["games"], [])


if __name__ == "__main__":
    unittest.main()
