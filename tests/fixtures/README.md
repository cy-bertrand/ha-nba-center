# ESPN summary fixture notes

## Representative committed fixture

`espn_summary_401909971.json` is a deliberately reduced fixture used by the unit tests. It contains the two teams, one representative player row per team, and three representative play-by-play events. It is **not** the complete ESPN summary and must not be described as a full-game regression fixture.

## Full-source audit baseline (local source supplied for development)

The complete source summary for ESPN event `401909971` (Lakers 123–112 Bucks) was audited separately. The original file is not included in this repository; its SHA-256 is:

`0d705ca386919abe21b997360bff249890ef20992941158fc9aa7aa0149c29a3`

Observed source dimensions:

- 515 play-by-play entries; 515 unique play IDs and 515 unique sequence numbers.
- 2 team boxscore blocks, with 25 team statistics each.
- 2 player boxscore blocks, with 15 athletes each (30 total), and 14 player-stat columns per team.
- 643 participant references across plays, covering 28 distinct athlete IDs. All 28 IDs exist in the 30-player boxscore.
- 355 usable shot coordinates; sentinel coordinates are excluded by the parser.
- 128 plays have ESPN's `scoringPlay=true`; all 128 classify as `score`.

Observed primary action-category counts from the current parser rules:

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

The independent event flags intentionally overlap: 36 plays carry a turnover flag, including 3 also flagged as fouls. This is why primary category counts and flag counts are not interchangeable.

## Source-data caveat

The Lakers player-level foul values sum to 25 while ESPN's team-level foul statistic is 24 in this source. The parser preserves both source values; it must not silently adjust player or team statistics to force reconciliation.

To upgrade this to a full automated regression test, add the original or a suitably redacted complete `boxscore` + `plays` payload as a versioned fixture, then assert these dimensions and counts against `parse_boxscore` and `parse_plays`.
