# ESPN summary fixture notes

## Real completed-game fixture

`espn_summary_completed_401909971.json` is a real, full-coverage regression fixture for the parser-relevant parts of ESPN event `401909971` (Los Angeles Lakers 123–112 Milwaukee Bucks, final). It preserves the complete `header`, `boxscore`, `plays`, and `meta` sections from the supplied ESPN summary while omitting unrelated payload sections such as news, odds, video, and standings. The fixture is approximately 300 KB.

The SHA-256 of the original 483 KB source file supplied for this audit is:

`0d705ca386919abe21b997360bff249890ef20992941158fc9aa7aa0149c29a3`

The fixture covers:

- Final header state and score: LAL 123, MIL 112.
- 2 team boxscore blocks, 25 statistics each.
- 2 player boxscore blocks, 15 athletes each (30 total), and 14 player-stat columns per team.
- 2 DNP players, with ESPN's original reason and unavailable stats preserved.
- 515 play-by-play entries, with 515 unique play IDs and sequence numbers.
- 643 participant references across plays, covering 28 distinct athlete IDs; all resolve to a player in the boxscore.
- 355 usable shot coordinates; ESPN sentinel coordinates are excluded.
- 128 plays with ESPN's `scoringPlay=true`.

Observed primary action-category counts with the current parser:

| Category | Count |
| --- | ---: |
| score | 128 |
| missed_shot | 104 |
| rebound | 104 |
| substitution | 70 |
| foul | 52 |
| turnover | 33 |
| timeout | 10 |
| challenge | 5 |
| period_end | 4 |
| violation | 3 |
| jump_ball | 1 |
| game_end | 1 |

The independent event flags intentionally overlap: 36 plays carry a turnover flag, including 3 also flagged as fouls. Primary category counts and flag counts are therefore not interchangeable.

## Live fixture

`espn_summary_live_401909977.json` is a deliberately reduced sample of a real Wizards–Pistons live summary. It preserves the live header, representative team/player boxscore rows, DNP data, and scoring/rebound/substitution examples. It is not a full-game payload.

## Representative completed-game fixture

`espn_summary_401909971.json` is the earlier deliberately reduced completed-game sample: two teams, one representative player row per team, and three representative Play-by-Play events. The new `espn_summary_completed_401909971.json` should be used for full-game regression assertions.

## Source-data caveat

In the completed-game source, the Lakers player-level foul values sum to 25 while ESPN's team-level foul statistic is 24. The parser preserves both source values; it must not silently adjust player or team statistics to force reconciliation.


## Real double-overtime fixture

`espn_summary_overtime_401909977.json` is a focused extract from the supplied final ESPN summary for Wizards–Pistons (event `401909977`), which ended Detroit 144–140 Washington after two overtimes. It preserves the final header status and competitors, all six period scores, and the six period-end events plus the distinct end-game event. The source response contained 610 Play-by-Play entries; this focused fixture retains the exact real period-ending records needed to regression-test overtime handling without duplicating the full game payload.

- Period scores, Washington: 32, 29, 29, 31, 11, 8 (140).
- Period scores, Detroit: 33, 31, 30, 27, 11, 12 (144).
- The fourth quarter ended tied 121–121.
- First overtime ended tied 132–132.
- Second overtime ended 140–144.
- ESPN labels periods 5 and 6 as `OT` and `2OT`; the final period-end action is followed by a separate `End Game` action.

The fixture is used by `tests/test_game_details_overtime_fixture.py`.


## Degraded / partial summary fixture

`espn_summary_partial_401909977.json` is a deliberately degraded test input derived from the real live capture for event `401909977`. It preserves the original `header`, `plays`, and `meta` sections but deliberately omits `boxscore` to simulate an incomplete ESPN response. It is **not** presented as an unmodified ESPN response.

The regression tests verify that:
- the live game state and score remain available;
- missing team/player boxscores are represented by empty collections and `has_boxscore: false`, never by fabricated zero statistics;
- Play-by-Play and substitution participant IDs remain available even when player names cannot be enriched from a boxscore;
- null, empty, and wrong-type boxscore values do not raise parser errors.
