"""Tests du parseur d'effectif ESPN."""
import unittest

from custom_components.nba.team_roster import parse_team_roster


class TeamRosterParserTests(unittest.TestCase):
    def test_parses_real_espn_roster_shape(self):
        raw = {
            "season": {"year": 2027, "displayName": "2026-27"},
            "athletes": [
                {
                    "id": "3945274", "displayName": "Luka Doncic", "shortName": "L. Doncic",
                    "jersey": "77", "displayHeight": "6' 8\"", "displayWeight": "230 lbs",
                    "age": 27, "headshot": {"href": "https://example.test/luka.png"},
                    "position": {"displayName": "Guard", "abbreviation": "G"},
                    "college": {"name": "Real Madrid", "shortName": "Real Madrid"},
                    "experience": {"years": 9},
                    "status": {"name": "Active"},
                    "injuries": [{"status": "Day-To-Day", "date": "2026-11-12T03:34Z"}],
                },
                {
                    "id": "2", "fullName": "Center Example", "jersey": "10",
                    "position": {"displayName": "Center", "abbreviation": "C"},
                    "status": {"abbreviation": "Active"},
                },
            ],
        }
        result = parse_team_roster(raw)
        self.assertEqual(result["season"], "2026-27")
        self.assertEqual(result["count"], 2)
        luka = next(player for player in result["players"] if player["id"] == "3945274")
        self.assertEqual(luka["name"], "Luka Doncic")
        self.assertEqual(luka["position"], "G")
        self.assertEqual(luka["injuries"][0]["status"], "Day-To-Day")
        self.assertEqual(luka["experience_years"], 9)

    def test_skips_invalid_and_duplicate_players(self):
        result = parse_team_roster({"athletes": [
            {"id": "1", "displayName": "First"},
            {"id": "1", "displayName": "Duplicate"},
            {"id": "2"},
            None,
        ]})
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["players"][0]["name"], "First")

    def test_missing_optional_values_remain_none(self):
        result = parse_team_roster({"athletes": [{"id": "1", "displayName": "Player"}]})
        player = result["players"][0]
        self.assertIsNone(player["age"])
        self.assertIsNone(player["headshot"])
        self.assertIsNone(player["jersey"])
        self.assertEqual(player["injuries"], [])

    def test_unexpected_payload_is_empty_not_fabricated(self):
        self.assertEqual(parse_team_roster({"athletes": "invalid"})["players"], [])

    def test_players_are_sorted_by_position_and_jersey(self):
        result = parse_team_roster({"athletes": [
            {"id": "3", "displayName": "Guard 12", "jersey": "12", "position": {"abbreviation": "G"}},
            {"id": "2", "displayName": "Guard 2", "jersey": "2", "position": {"abbreviation": "G"}},
            {"id": "1", "displayName": "Center", "jersey": "1", "position": {"abbreviation": "C"}},
        ]})
        self.assertEqual([p["name"] for p in result["players"]], ["Center", "Guard 2", "Guard 12"])


if __name__ == "__main__":
    unittest.main()
