"""Tests des parseurs de données individuelles ESPN."""
import unittest

from custom_components.nba.player_data import parse_core_postseason_stats, parse_player_gamelog, parse_player_stats


class PlayerDataParserTests(unittest.TestCase):
    def test_non_finite_stat_values_are_rejected(self):
        result = parse_player_stats({"categories": [{
            "names": ["avgPoints", "avgRebounds", "avgAssists", "avgSteals"],
            "labels": ["PTS", "REB", "AST", "STL"],
            "totals": ["NaN", "Infinity", "-Infinity", "12.5"],
        }]})
        self.assertEqual(
            [row["value"] for row in result["statistics"]],
            [None, None, None, 12.5],
        )
        self.assertEqual(
            [row["display_value"] for row in result["statistics"]],
            [None, None, None, "12.5"],
        )

    def test_non_finite_and_boolean_display_values_are_hidden_in_all_shapes(self):
        result = parse_player_stats({"categories": [{
            "stats": [
                {"name": "avgPoints", "value": "NaN", "displayValue": "NaN"},
                {"name": "avgRebounds", "value": True, "displayValue": "True"},
                {"name": "avgAssists", "value": 7.5, "displayValue": "7.5"},
            ],
        }]})
        self.assertEqual(
            [row["display_value"] for row in result["statistics"]],
            [None, None, "7.5"],
        )

        postseason = parse_core_postseason_stats({"splits": {"categories": [{
            "stats": [
                {"name": "avgPoints", "value": "Infinity", "displayValue": "Infinity"},
                {"name": "avgRebounds", "value": 8.2, "displayValue": "8.2"},
            ],
        }]}}, 2025)
        self.assertEqual(
            [row["display_value"] for row in postseason["statistics"]],
            [None, "8.2"],
        )

    def test_parses_core_v2_historical_postseason_statistics(self):
        result = parse_core_postseason_stats({
            "athlete": {"id": "2544", "displayName": "LeBron James"},
            "splits": {"categories": [{
                "name": "averages", "displayName": "Postseason Averages",
                "stats": [
                    {"name": "gamesPlayed", "displayName": "Games Played", "value": 16, "displayValue": "16"},
                    {"name": "avgPoints", "displayName": "Points Per Game", "value": 28.4, "displayValue": "28.4"},
                    {"name": "avgRebounds", "displayName": "Rebounds Per Game", "value": 9.1, "displayValue": "9.1"},
                ],
            }]},
        }, 2023)
        self.assertEqual(result["season"], "2022-23")
        self.assertEqual(result["season_type_id"], "3")
        self.assertEqual(result["season_type"], "Playoffs")
        self.assertEqual(result["athlete"]["id"], "2544")
        self.assertEqual(result["statistics"][1]["name"], "avgPoints")
        self.assertEqual(result["statistics"][1]["value"], 28.4)

    def test_parses_all_six_espn_web_v3_playoff_per_game_averages(self):
        result = parse_player_stats({
            "filters": {"season": {"value": "2024", "options": [
                {"value": "2024", "displayValue": "2023-24"},
            ]}, "seasonType": {"value": "3", "displayValue": "Playoffs"}},
            "categories": [{
                "name": "averages", "displayName": "Postseason Averages",
                "stats": [
                    {"name": "avgMinutes", "abbreviation": "MIN", "displayName": "Minutes Per Game",
                     "value": 40.2, "displayValue": "40.2"},
                    {"name": "avgPoints", "abbreviation": "PTS", "displayName": "Points Per Game",
                     "value": 28.9, "displayValue": "28.9"},
                    {"name": "avgRebounds", "abbreviation": "REB", "displayName": "Rebounds Per Game",
                     "value": 9.5, "displayValue": "9.5"},
                    {"name": "avgAssists", "abbreviation": "AST", "displayName": "Assists Per Game",
                     "value": 8.1, "displayValue": "8.1"},
                    {"name": "avgSteals", "abbreviation": "STL", "displayName": "Steals Per Game",
                     "value": 1.4, "displayValue": "1.4"},
                    {"name": "avgBlocks", "abbreviation": "BLK", "displayName": "Blocks Per Game",
                     "value": 0.4, "displayValue": "0.4"},
                ],
            }],
        })
        self.assertEqual(result["season_type_id"], "3")
        self.assertEqual(
            [row["value"] for row in result["statistics"]],
            [40.2, 28.9, 9.5, 8.1, 1.4, 0.4],
        )
        self.assertEqual(result["statistics"][1]["display_value"], "28.9")

    def test_core_v2_empty_postseason_payload_stays_empty(self):
        result = parse_core_postseason_stats({"splits": {"categories": []}}, 2025)
        self.assertEqual(result["statistics"], [])
        self.assertIsNone(result["season_type_id"])

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

    def test_selects_requested_season_from_multiyear_playoff_response(self):
        result = parse_player_stats({
            "filters": [
                {"name": "seasontype", "value": "3",
                 "options": [{"value": "3", "displayValue": "Postseason"}]},
            ],
            "categories": [
                {
                    "name": "averages", "displayName": "Postseason Averages",
                    "names": ["gamesPlayed", "avgMinutes", "avgPoints", "avgRebounds",
                              "avgAssists", "avgSteals", "avgBlocks"],
                    "labels": ["GP", "MIN", "PTS", "REB", "AST", "STL", "BLK"],
                    "displayNames": ["Games Played", "Minutes Per Game", "Points Per Game",
                                     "Rebounds Per Game", "Assists Per Game", "Steals Per Game",
                                     "Blocks Per Game"],
                    "statistics": [
                        # Plusieurs saisons antérieures précèdent la saison demandée
                        # dans la vraie réponse ESPN de Luka Dončić.
                        {"season": {"year": 2020, "displayName": "2019-20"},
                         "stats": ["6", "35.8", "10.7", "5.4", "4.4", "1.1", "0.4"]},
                        {"season": {"year": 2021, "displayName": "2020-21"},
                         "stats": ["7", "40.1", "13.7", "7.9", "5.9", "1.3", "0.5"]},
                        {"season": {"year": 2022, "displayName": "2021-22"},
                         "stats": ["15", "36.8", "31.7", "9.8", "6.4", "1.8", "1.1"]},
                        {"season": {"year": 2024, "displayName": "2023-24"},
                         "stats": ["22", "40.9", "28.9", "9.5", "8.1", "1.9", "0.4"]},
                        {"season": {"year": 2025, "displayName": "2024-25"},
                         "stats": ["5", "41.6", "30.2", "7.0", "5.8", "1.0", "0.6"]},
                    ],
                },
            ],
        }, season_year=2024)
        self.assertEqual(result["season"], "2023-24")
        self.assertEqual(result["season_type_id"], "3")
        self.assertEqual(
            {row["name"]: row["value"] for row in result["statistics"]},
            {"gamesPlayed": 22, "avgMinutes": 40.9, "avgPoints": 28.9,
             "avgRebounds": 9.5, "avgAssists": 8.1, "avgSteals": 1.9, "avgBlocks": 0.4},
        )

    def test_traded_player_uses_espn_season_totals_not_first_team_split(self):
        raw = {"categories": [
            {
                "name": "averages", "displayName": "Regular Season Averages",
                "names": ["gamesPlayed", "avgPoints"],
                "labels": ["GP", "PTS"],
                "displayNames": ["Games Played", "Points Per Game"],
                "statistics": [
                    {"season": {"year": 2025, "displayName": "2024-25"},
                     "teamId": "6", "teamSlug": "dallas-mavericks",
                     "stats": ["22", "28.1"]},
                    {"season": {"year": 2025, "displayName": "2024-25"},
                     "teamId": "13", "teamSlug": "los-angeles-lakers",
                     "stats": ["28", "28.2"]},
                    {"season": {"year": 2025, "displayName": "2024-25"},
                     "displayName": "2024-25  Totals", "teamSlug": "2024-25 Totals",
                     "stats": ["50", "28.2"]},
                ],
            },
            {
                "name": "totals", "displayName": "Regular Season Totals",
                "names": ["points"],
                "labels": ["PTS"],
                "displayNames": ["Points"],
                "statistics": [
                    {"season": {"year": 2025, "displayName": "2024-25"},
                     "teamId": "6", "teamSlug": "dallas-mavericks", "stats": ["619"]},
                    {"season": {"year": 2025, "displayName": "2024-25"},
                     "teamId": "13", "teamSlug": "los-angeles-lakers", "stats": ["789"]},
                    {"season": {"year": 2025, "displayName": "2024-25"},
                     "displayName": "2024-25  Totals", "teamSlug": "2024-25 Totals",
                     "stats": ["1408"]},
                ],
            },
        ]}
        result = parse_player_stats(raw, season_year=2025)
        quick_stats = {row["name"]: row["value"] for row in result["statistics"]}
        self.assertEqual(quick_stats, {"gamesPlayed": 50, "avgPoints": 28.2, "points": 1408})

        season = result["season_history"][0]
        self.assertEqual(
            [team["team_id"] for team in season["teams"]],
            ["6", "13"],
        )
        history_stats = {row["name"]: row["value"] for row in season["statistics"]}
        self.assertEqual(history_stats, {"gamesPlayed": 50, "avgPoints": 28.2, "points": 1408})

    def test_builds_season_history_across_categories(self):
        result = parse_player_stats({"categories": [
            {"name": "averages", "displayName": "Averages", "names": ["avgPoints", "avgRebounds"],
             "labels": ["PTS", "REB"], "statistics": [
                 {"season": {"year": 2025, "displayName": "2024-25"}, "stats": ["22.1", "5.4"]},
                 {"season": {"year": 2026, "displayName": "2025-26"}, "stats": ["24.3", "6.1"]},
             ]},
            {"name": "totals", "displayName": "Totals", "names": ["gamesPlayed"], "labels": ["GP"],
             "statistics": [
                 {"season": {"year": 2025, "displayName": "2024-25"}, "stats": ["70"]},
                 {"season": {"year": 2026, "displayName": "2025-26"}, "stats": ["68"]},
             ]},
        ]})
        history = result["season_history"]
        self.assertEqual([item["display_name"] for item in history], ["2025-26", "2024-25"])
        self.assertEqual(len(history[0]["statistics"]), 3)
        self.assertEqual(history[1]["statistics"][0]["value"], 22.1)

    def test_season_history_keeps_explicit_team_metadata(self):
        result = parse_player_stats({"categories": [{
            "name": "averages", "names": ["avgPoints"], "labels": ["PTS"],
            "statistics": [
                {"season": {"year": 2026, "displayName": "2025-26"},
                 "team": {"id": "25", "abbreviation": "OKC", "displayName": "Oklahoma City Thunder"},
                 "stats": ["32.0"]},
            ],
        }]})
        season = result["season_history"][0]
        self.assertEqual(season["team_abbreviation"], "OKC")
        self.assertEqual(season["team_name"], "Oklahoma City Thunder")
        self.assertEqual(season["team_id"], "25")

    def test_season_history_lists_all_teams_for_traded_player(self):
        result = parse_player_stats({"categories": [{
            "name": "averages", "names": ["avgPoints"], "labels": ["PTS"],
            "statistics": [
                {"season": {"year": 2026, "displayName": "2025-26"},
                 "team": {"id": "25", "abbreviation": "OKC", "displayName": "Oklahoma City Thunder"},
                 "stats": ["24.0"]},
                {"season": {"year": 2026, "displayName": "2025-26"},
                 "team": {"id": "12", "abbreviation": "IND", "displayName": "Indiana Pacers"},
                 "stats": ["21.0"]},
            ],
        }]})
        season = result["season_history"][0]
        self.assertEqual(
            [team["team_abbreviation"] for team in season["teams"]],
            ["OKC", "IND"],
        )
        # Legacy singular fields remain available to existing consumers.
        self.assertEqual(season["team_abbreviation"], "OKC")
        self.assertEqual(season["team_id"], "25")

    def test_season_history_deduplicates_teams_across_categories(self):
        result = parse_player_stats({"categories": [
            {"name": "averages", "names": ["avgPoints"], "statistics": [
                {"season": {"year": 2026, "displayName": "2025-26"},
                 "team": {"id": "25", "abbreviation": "OKC"}, "stats": ["24.0"]},
            ]},
            {"name": "totals", "names": ["gamesPlayed"], "statistics": [
                {"season": {"year": 2026, "displayName": "2025-26"},
                 "team": {"id": "25", "abbreviation": "OKC"}, "stats": ["70"]},
            ]},
        ]})
        self.assertEqual(len(result["season_history"][0]["teams"]), 1)

    def test_exposes_career_split_separately(self):
        result = parse_player_stats({"statistics": {
            "labels": ["GP", "PTS"],
            "names": ["gamesPlayed", "avgPoints"],
            "displayNames": ["Games Played", "Points Per Game"],
            "splits": [
                {"displayName": "Regular Season", "stats": ["12", "30.3"]},
                {"displayName": "Career", "stats": ["193", "23.8"]},
            ],
        }})
        self.assertEqual(result["career_statistics"][0]["value"], 193)
        self.assertEqual(result["career_statistics"][1]["value"], 23.8)
        self.assertEqual(result["statistics"][1]["value"], 30.3)

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
        self.assertEqual(result["games"][0]["opponent_abbreviation"], "CHI")
        self.assertEqual(result["games"][0]["score"], "124-119")
        self.assertEqual(result["games"][0]["home_away"], "@")
        self.assertEqual(result["games"][0]["stats"], {})

    def test_gamelog_skips_events_without_ids_and_duplicate_ids(self):
        result = parse_player_gamelog({"events": [
            {"gameDate": "2026-11-14T00:00:00Z", "gameResult": "W"},
            {"id": "game-1", "gameDate": "2026-11-13T00:00:00Z", "gameResult": "L"},
            {"eventId": "game-1", "gameDate": "2026-11-12T00:00:00Z", "gameResult": "W"},
            {"id": "game-2", "gameDate": "2026-11-11T00:00:00Z", "gameResult": "W"},
        ]})
        self.assertEqual(result["count"], 2)
        self.assertEqual({game["id"] for game in result["games"]}, {"game-1", "game-2"})

    def test_gamelog_is_sorted_newest_first(self):
        result = parse_player_gamelog({"events": [
            {"id": "older", "gameDate": "2026-11-10T00:00:00Z", "gameResult": "W"},
            {"id": "newest", "gameDate": "2026-11-13T00:00:00Z", "gameResult": "L"},
            {"id": "middle", "gameDate": "2026-11-11T00:00:00Z", "gameResult": "W"},
        ]})
        self.assertEqual([game["id"] for game in result["games"]], ["newest", "middle", "older"])

    def test_gamelog_sort_uses_timezone_offsets_not_lexical_dates(self):
        result = parse_player_gamelog({"events": [
            {"id": "lexically-later", "gameDate": "2026-11-13T00:30:00+02:00"},
            {"id": "actually-newer", "gameDate": "2026-11-12T23:00:00Z"},
        ]})
        self.assertEqual(
            [game["id"] for game in result["games"]],
            ["actually-newer", "lexically-later"],
        )

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

    def test_parses_postseason_season_type_filter(self):
        result = parse_player_stats({
            "filters": [
                {"displayName": "Season", "name": "season", "value": "2027",
                 "options": [{"value": "2027", "displayValue": "2026-27"}]},
                {"displayName": "Season Type", "name": "seasontype", "value": "3",
                 "options": [
                     {"value": "2", "displayValue": "Regular Season"},
                     {"value": "3", "displayValue": "Playoffs"},
                 ]},
            ],
            "categories": [{
                "name": "averages", "displayName": "Postseason Averages",
                "names": ["gamesPlayed", "avgPoints"],
                "labels": ["GP", "PTS"],
                "displayNames": ["Games Played", "Points Per Game"],
                "totals": ["12", "29.5"],
            }],
        })
        self.assertEqual(result["season"], "2026-27")
        self.assertEqual(result["season_type_id"], "3")
        self.assertEqual(result["season_type"], "Playoffs")
        points = next(row for row in result["statistics"] if row["name"] == "avgPoints")
        self.assertEqual(result["statistics"][0]["value"], 12)
        self.assertEqual(points["value"], 29.5)

    def test_parses_keyed_espn_season_type_filter(self):
        # ESPN utilise aussi un dictionnaire indexé par "seasonType";
        # dans cette forme, le champ name est absent de l'objet imbriqué.
        result = parse_player_stats({
            "filters": {
                "season": {
                    "value": "2023",
                    "options": [{"value": "2023", "displayValue": "2022-23"}],
                },
                "seasonType": {
                    "value": "3",
                    "displayValue": "Playoffs",
                    "options": [
                        {"value": "2", "displayValue": "Regular Season"},
                        {"value": "3", "displayValue": "Playoffs"},
                    ],
                },
            },
            "categories": [{
                "name": "averages",
                "displayName": "Postseason Averages",
                "names": ["gamesPlayed", "avgPoints"],
                "labels": ["GP", "PTS"],
                "totals": ["16", "28.4"],
            }],
        })
        self.assertEqual(result["season"], "2022-23")
        self.assertEqual(result["season_type_id"], "3")
        self.assertEqual(result["season_type"], "Playoffs")
        self.assertEqual(result["statistics"][1]["value"], 28.4)

    def test_parses_gamelog_stats_nested_under_season_types(self):
        result = parse_player_gamelog({
            "events": {
                "game-1": {
                    "id": "game-1",
                    "gameDate": "2025-05-20T00:00:00Z",
                    "opponent": {"displayName": "Minnesota Timberwolves", "abbreviation": "MIN"},
                    "gameResult": "W",
                    "atVs": "@",
                },
            },
            "seasonTypes": [{
                "id": "3",
                "displayName": "Postseason",
                "categories": [{
                    "name": "general",
                    "labels": ["MIN", "PTS", "REB", "AST"],
                    "names": ["minutes", "points", "rebounds", "assists"],
                    "events": [{
                        "eventId": "game-1",
                        "stats": ["42", "31", "8", "7"],
                    }],
                }],
            }],
        })
        self.assertEqual(result["count"], 1)
        game = result["games"][0]
        self.assertEqual(game["id"], "game-1")
        self.assertEqual(game["opponent_abbreviation"], "MIN")
        self.assertEqual(game["home_away"], "@")
        self.assertEqual(game["stats"]["points"], 31)
        self.assertEqual(game["stats"]["rebounds"], 8)
        self.assertEqual(game["stats"]["assists"], 7)

    def test_unexpected_gamelog_payload_is_empty(self):
        self.assertEqual(parse_player_gamelog({"events": "invalid"})["games"], [])




if __name__ == "__main__":
    unittest.main()
