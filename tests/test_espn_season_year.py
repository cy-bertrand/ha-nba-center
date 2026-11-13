"""Tests de correspondance des saisons NBA avec le paramètre ESPN."""
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "nba_player_data_test", ROOT / "custom_components" / "nba" / "player_data.py"
)
PLAYER_DATA = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PLAYER_DATA)
season_matches_espn_year = PLAYER_DATA.season_matches_espn_year


class ESPNSeasonYearTests(unittest.TestCase):
    def test_end_year_matches_full_nba_season_label(self):
        self.assertTrue(season_matches_espn_year("2022-23", 2023))
        self.assertTrue(_season_matches_espn_year("2025-26", 2026))

    def test_does_not_match_start_year_or_another_season(self):
        self.assertFalse(_season_matches_espn_year("2022-23", 2022))
        self.assertFalse(_season_matches_espn_year("2023-24", 2023))

    def test_accepts_full_year_label(self):
        self.assertTrue(_season_matches_espn_year("2023", 2023))


if __name__ == "__main__":
    unittest.main()
