"""Tests unitaires des règles de calendrier NBA (sans réseau ni Home Assistant)."""
import importlib.util
import unittest
from pathlib import Path
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

MODULE_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "nba" / "scoreboard_utils.py"
SPEC = importlib.util.spec_from_file_location("scoreboard_utils", MODULE_PATH)
scoreboard_utils = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(scoreboard_utils)

cache_ttl = scoreboard_utils.cache_ttl
is_cache_fresh = scoreboard_utils.is_cache_fresh
parse_score = scoreboard_utils.parse_score
validate_local_date = scoreboard_utils.validate_local_date
event_local_date = scoreboard_utils.event_local_date
filter_games_for_local_date = scoreboard_utils.filter_games_for_local_date


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


class EventTimezoneTests(unittest.TestCase):
    def setUp(self):
        self.brussels = ZoneInfo("Europe/Brussels")

    def test_us_evening_game_maps_to_next_local_day(self):
        self.assertEqual(
            event_local_date("2026-11-12T23:30:00Z", self.brussels),
            date(2026, 11, 13),
        )

    def test_cet_and_cest_offsets_are_respected(self):
        # Just before and after the spring DST transition in Brussels.
        self.assertEqual(event_local_date("2026-03-29T00:30:00Z", self.brussels), date(2026, 3, 29))
        self.assertEqual(event_local_date("2026-03-29T01:30:00Z", self.brussels), date(2026, 3, 29))
        self.assertEqual(event_local_date("2026-10-25T00:30:00Z", self.brussels), date(2026, 10, 25))
        self.assertEqual(event_local_date("2026-10-25T01:30:00Z", self.brussels), date(2026, 10, 25))

    def test_invalid_or_timezone_naive_date_is_rejected(self):
        self.assertIsNone(event_local_date("not-a-date", self.brussels))
        self.assertIsNone(event_local_date("2026-11-12T23:30:00", self.brussels))
        self.assertIsNone(event_local_date(None, self.brussels))



class CalendarFilteringTests(unittest.TestCase):
    def setUp(self):
        self.brussels = ZoneInfo("Europe/Brussels")
        self.selected = date(2026, 11, 13)

    def test_filters_local_day_and_sorts_chronologically(self):
        games = [
            {"id": "late", "date": "2026-11-13T02:00:00+01:00"},
            {"id": "previous", "date": "2026-11-12T23:30:00+00:00"},
            {"id": "early", "date": "2026-11-13T00:30:00+01:00"},
        ]
        result = filter_games_for_local_date(games, self.selected, self.brussels)
        self.assertEqual([game["id"] for game in result], ["early", "late"])

    def test_duplicate_ids_keep_last_payload(self):
        games = [
            {"id": "same", "date": "2026-11-13T01:00:00+01:00", "score": 10},
            {"id": "same", "date": "2026-11-13T01:00:00+01:00", "score": 11},
        ]
        result = filter_games_for_local_date(games, self.selected, self.brussels)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["score"], 11)

    def test_invalid_dates_and_missing_ids_are_skipped(self):
        games = [
            {"id": "bad", "date": "not-a-date"},
            {"date": "2026-11-13T01:00:00+01:00"},
        ]
        self.assertEqual(filter_games_for_local_date(games, self.selected, self.brussels), [])


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
