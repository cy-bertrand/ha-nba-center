"""Tests unitaires des règles de calendrier NBA (sans réseau ni Home Assistant)."""
import importlib.util
import unittest
from pathlib import Path
from datetime import date, datetime, timedelta, timezone

MODULE_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "nba" / "scoreboard_utils.py"
SPEC = importlib.util.spec_from_file_location("scoreboard_utils", MODULE_PATH)
scoreboard_utils = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(scoreboard_utils)

cache_ttl = scoreboard_utils.cache_ttl
is_cache_fresh = scoreboard_utils.is_cache_fresh
parse_score = scoreboard_utils.parse_score
validate_local_date = scoreboard_utils.validate_local_date


class ValidateDateTests(unittest.TestCase):
    def test_accepts_iso_date(self):
        self.assertEqual(validate_local_date("2026-11-12"), date(2026, 11, 12))

    def test_rejects_non_iso_or_invalid_date(self):
        for value in ("2026-2-12", "12/11/2026", "2026-02-30", "", None):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    validate_local_date(value)


class ScoreParsingTests(unittest.TestCase):
    def test_preserves_missing_or_invalid_score(self):
        for value in (None, "", "N/A", {}):
            with self.subTest(value=value):
                self.assertIsNone(parse_score(value))

    def test_parses_numeric_and_espn_values(self):
        self.assertEqual(parse_score("108"), 108)
        self.assertEqual(parse_score(108.0), 108)
        self.assertEqual(parse_score({"value": "99"}), 99)
        self.assertEqual(parse_score({"displayValue": "87"}), 87)

    def test_real_zero_is_preserved(self):
        self.assertEqual(parse_score("0"), 0)


class CalendarCacheTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 12, 20, 0, tzinfo=timezone.utc)

    def test_live_cache_ttl_is_30_seconds(self):
        games = [{"state": "in"}]
        self.assertEqual(cache_ttl(games), 30)
        self.assertTrue(is_cache_fresh(self.now, self.now - timedelta(seconds=29), games))
        self.assertFalse(is_cache_fresh(self.now, self.now - timedelta(seconds=30), games))

    def test_non_live_cache_ttl_is_180_seconds(self):
        games = [{"state": "pre"}, {"state": "post"}]
        self.assertEqual(cache_ttl(games), 180)
        self.assertTrue(is_cache_fresh(self.now, self.now - timedelta(seconds=179), games))
        self.assertFalse(is_cache_fresh(self.now, self.now - timedelta(seconds=180), games))

    def test_future_timestamp_is_not_fresh(self):
        self.assertFalse(is_cache_fresh(self.now, self.now + timedelta(seconds=1), []))


if __name__ == "__main__":
    unittest.main()
