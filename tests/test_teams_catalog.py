"""Tests du parseur de catalogue des franchises NBA."""
import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "nba" / "teams_catalog.py"
SPEC = importlib.util.spec_from_file_location("teams_catalog", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)
parse_teams_catalog = module.parse_teams_catalog


def row(team_id, name, abbreviation=None, logo=None):
    team = {"id": team_id, "displayName": name, "abbreviation": abbreviation}
    if logo:
        team["logos"] = [{"href": logo}]
    return {"team": team}


class TeamsCatalogParserTests(unittest.TestCase):
    def test_parses_standard_espn_envelope_and_sorts_names(self):
        raw = {"sports": [{"leagues": [{"teams": [
            row("2", "Boston Celtics", "BOS", "https://img/bos.png"),
            row("1", "Atlanta Hawks", "ATL"),
        ]}]}]}
        result = parse_teams_catalog(raw)
        self.assertEqual([team["id"] for team in result["teams"]], ["1", "2"])
        self.assertEqual(result["teams"][1]["logo"], "https://img/bos.png")
        self.assertFalse(result["complete"])
        self.assertEqual(result["count"], 2)

    def test_accepts_direct_team_list(self):
        result = parse_teams_catalog({"teams": [
            {"id": "1", "name": "Atlanta Hawks", "abbreviation": "ATL"}
        ]})
        self.assertEqual(result["teams"][0]["name"], "Atlanta Hawks")

    def test_skips_invalid_and_duplicate_rows(self):
        result = parse_teams_catalog({"teams": [
            {"id": "1", "name": "Atlanta Hawks"},
            {"id": "1", "name": "Duplicate Hawks"},
            {"name": "Missing ID"},
            {"id": "2"},
            None,
        ]})
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["teams"][0]["name"], "Atlanta Hawks")

    def test_marks_exactly_thirty_valid_teams_as_complete(self):
        rows = [{"team": {"id": str(i), "displayName": f"Team {i}"}} for i in range(30)]
        result = parse_teams_catalog({"sports": [{"leagues": [{"teams": rows}]}]})
        self.assertEqual(result["count"], 30)
        self.assertTrue(result["complete"])

    def test_empty_or_unexpected_payload_is_not_fabricated(self):
        result = parse_teams_catalog({"unexpected": []})
        self.assertEqual(result["teams"], [])
        self.assertEqual(result["count"], 0)
        self.assertFalse(result["complete"])

    def test_known_nba_groups_fill_missing_espn_metadata(self):
        result = parse_teams_catalog({"teams": [
            {"team": {"id": "2", "displayName": "Boston Celtics", "abbreviation": "BOS"}},
            {"team": {"id": "14", "displayName": "Los Angeles Lakers", "abbreviation": "LAL"}},
        ]})
        teams = {team["abbreviation"]: team for team in result["teams"]}
        self.assertEqual(teams["BOS"]["conference"], "Eastern Conference")
        self.assertEqual(teams["BOS"]["division"], "Atlantic Division")
        self.assertEqual(teams["LAL"]["conference"], "Western Conference")
        self.assertEqual(teams["LAL"]["division"], "Pacific Division")

    def test_optional_conference_and_division_metadata(self):
        result = parse_teams_catalog({"teams": [{
            "team": {
                "id": "1", "displayName": "Boston Celtics",
                "groups": {
                    "parent": {"name": "Eastern Conference"},
                    "child": {"name": "Atlantic"}
                }
            }
        }]})
        self.assertEqual(result["teams"][0]["conference"], "Eastern Conference")
        self.assertEqual(result["teams"][0]["division"], "Atlantic")


if __name__ == "__main__":
    unittest.main()
