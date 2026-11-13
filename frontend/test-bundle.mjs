import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const bundle = await readFile("custom_components/nba/www/nba-center-card.js", "utf8");
const source = await readFile("frontend/src/nba-center-card.js", "utf8");

console.log("BUNDLE LENGTH", bundle.length, "SOURCE LENGTH", source.length);
assert.ok(bundle.length > source.length + 8_000, "Lit runtime must be bundled into the standalone card (not just the card source)");
assert.match(bundle, /nba-center-card/, "custom card type must be present");
assert.match(bundle, /customElements\.define/, "custom element must be registered");
assert.match(bundle, /window\.customCards/, "Lovelace card metadata must be exposed");
assert.match(bundle, /SCORES & CALENDRIER/, "scores view must be included");
assert.match(bundle, /PLAYERS CENTER/, "players view must be included");
assert.match(bundle, /FORME RÉCENTE/, "favorite team recent form must be included");
assert.match(source, /_teamsCatalog\(\)/, "Teams Center must read the global franchise catalog sensor");
assert.match(source, /_teamCatalogCard\(team\)/, "Teams Center must render lightweight franchise cards");
assert.match(source, /nba\/team_roster/, "franchise detail must load its roster through Home Assistant websocket");
assert.match(source, /_teamRosterPanel\(\)/, "franchise roster overlay must be rendered");
assert.match(source, /roster-injury/, "player injury status must be visible when supplied");
assert.match(source, /roster-headshot/, "roster player headshots must be supported");
assert.match(source, /team-season-summary/, "team detail must show the season standings summary");
assert.match(source, /teamRoster\.standing\.wins/, "team detail must show the wins/losses record");
assert.match(source, /teamRoster\.schedule\?\.recent/, "team detail must show recent form when available");
assert.match(source, /FICHE JOUEUR/, "roster players must open an individual profile");
assert.match(source, /RETOUR À L'EFFECTIF/, "player profile must return to the roster");
assert.match(bundle, /EFFECTIF/, "bundled card must include the franchise roster overlay");
assert.match(source, /FAVORI/, "Teams Center must distinguish favorite franchises");
assert.match(source, /Rechercher une équipe/, "Teams Center must include franchise search");
assert.match(source, /EAST/, "Teams Center must include conference filtering");
assert.match(source, /WEST/, "Teams Center must include conference filtering");
assert.match(bundle, /EASTERN CONFERENCE/, "standings view must be included");
assert.match(bundle, /Filtrer une équipe/, "interactive team search must be included");
assert.match(bundle, /nba\/scoreboard/, "date-based scoreboard websocket command must be used");
assert.match(bundle, /nba\/game_details/, "game details websocket command must be used");
assert.match(bundle, /MATCH CENTER/, "interactive match overlay must be included");
assert.match(bundle, /BOX SCORE · JOUEURS/, "full player box score view must be included");
assert.match(source, /game-leaders-grid/, "compact team leaders layout must be present");
assert.match(source, /game-leader-value/, "team leader values must be visually highlighted");
assert.match(bundle, /COMPARAISON DES ÉQUIPES/, "team statistics comparison must be included");
assert.match(bundle, /SCORE PAR PÉRIODE/, "quarter-by-quarter scoreboard must be included");
assert.match(source, /ÉJECTÉ/, "player ejection status must be included");
assert.match(bundle, /period_display/, "ESPN period display labels must be used in play-by-play");
assert.match(source, /_quarterScorePanel\(\)/, "quarter score panel renderer must be present");
assert.match(source, /player\.ejected/, "player ejection metadata must be rendered");
assert.match(source, /const preferred = \["MIN", "PTS", "FG"/, "player points must appear immediately after minutes in the box score");
assert.match(bundle, /player-table/, "responsive player statistics table must be included");
assert.match(bundle, /type="date"/, "calendar date picker must be included");
assert.match(bundle, /sensor\.nba_matchs_du_jour/, "existing NBA sensor default must be mapped");
assert.doesNotMatch(bundle, /site\.api\.espn\.com|site\.web\.api\.espn\.com/, "browser bundle must not call ESPN");
assert.doesNotMatch(bundle, /from\s*["']lit["']/, "Lit imports must be bundled, not external");
assert.match(source, /config\.entities/, "custom entity mapping must be configurable");
assert.match(source, /const shiftDateISO =/, "calendar date shifting must be timezone-independent");
assert.match(source, /localDateISO\(new Date\(\), this\.hass\?\.config\?\.time_zone\)/, "Today shortcut must use the Home Assistant timezone");
assert.match(source, /request !== this\._calendarRequest/, "stale calendar responses must not overwrite newer navigation");
assert.match(source, /_calendarStaleError/, "stale cache errors must be exposed to the user");
assert.match(source, /value\(away\.score\).*value\(home\.score\)/s, "match score must be displayed away first, home second");
assert.match(source, /this\._overlayGame\.away\?\.name[\s\S]*this\._overlayGame\.home\?\.name/, "Match Center overlay must show away team before home team");
console.log("NBA Center frontend bundle and feature checks passed.");

if (!source.includes("_playByPlayPanel") || !source.includes("POINTS SEULEMENT") || !bundle.includes("FIL DU MATCH")) {
  throw new Error("Play-by-play UI is missing from source or bundle");
}

if (!source.includes("aria-label=\"Actualiser les détails du match\"") || !bundle.includes("RÉESSAYER")) {
  throw new Error("Match detail refresh/error state is missing");
}
