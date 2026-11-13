import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const bundle = await readFile("custom_components/nba/www/nba-center-card.js", "utf8");
const source = await readFile("frontend/src/nba-center-card.js", "utf8");

console.log("BUNDLE LENGTH", bundle.length, "SOURCE LENGTH", source.length);
assert.ok(bundle.length > source.length + 1_000, "Lit runtime must be bundled into the standalone card (not just the card source)");
assert.match(bundle, /nba-center-card/, "custom card type must be present");
assert.match(bundle, /customElements\.define/, "custom element must be registered");
assert.match(bundle, /window\.customCards/, "Lovelace card metadata must be exposed");
assert.match(bundle, /SCORES & CALENDRIER/, "scores view must be included");
assert.match(bundle, /PLAYERS CENTER/, "players view must be included");
assert.match(source, /\{ id: "playoffs", label: "PLAYOFFS" \}/, "sixth PLAYOFFS navigation tab must be present");
assert.match(source, /nba\/playoff_bracket/, "playoffs view must use the Home Assistant websocket service");
assert.match(source, /PLAYOFFS CENTER/, "dedicated playoffs center must be rendered");
assert.match(source, /_playoffSeriesCard\(series\)/, "playoff series must have a dedicated card renderer");
assert.match(source, /TÊTES DE SÉRIE NON VALIDÉES|Têtes de série non validées/, "unvalidated playoff seeds must be disclosed");
assert.match(bundle, /PLAYOFFS CENTER/, "bundled card must include the playoffs center");
assert.match(bundle, /NBA FINALS/, "bundled card must include NBA Finals");
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
assert.match(source, /catalog-favorite-tracking/, "favorite teams must expose their live tracking data");
assert.match(source, /home_away === "@"/, "recent form must mark away games with @");
assert.match(source, /height_cm/, "player profile must display metric height");
assert.match(source, /weight_kg/, "player profile must display metric weight");
assert.match(source, /scrollTo\(\{ top: 0/, "player selection must scroll the profile to the top");
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
assert.match(source, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/, "player profile and average-stat grids must use three compact columns");
assert.match(bundle, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/, "bundled player profile and average-stat grids must use three compact columns");
assert.match(source, /player-season-picker/, "season selector must have a dedicated placement above season averages");
assert.match(bundle, /player-season-picker/, "bundled season selector must be placed above season averages");
assert.match(source, /team_id: this\._teamOverlay\?\.id/, "opening a player from a roster must preserve the franchise ID");
assert.match(bundle, /team_id:this\._teamOverlay\?\.id/, "bundled roster player selection must preserve the franchise ID");
assert.match(source, /team_logo: this\._teamOverlay\?\.logo/, "roster player profile must carry the current team logo");
assert.match(bundle, /team_logo:this\._teamOverlay\?\.logo/, "bundled roster player profile must carry the current team logo");
assert.match(source, /\.player-game-row\{display:grid;grid-template-columns:minmax\(0,1fr\)/, "last five game rows must use a compact stacked layout");
assert.match(bundle, /\.player-game-row\{display:grid;grid-template-columns:minmax\(0,1fr\)/, "bundled last five game rows must use a compact stacked layout");
assert.match(source, /\.player-game-meta\{display:flex;align-items:center/, "game date and opponent must share one line");
assert.match(source, /\.player-game-stats\{display:flex;flex-wrap:nowrap/, "game statistics must stay on one line");
assert.match(bundle, /\.player-game-stats\{display:flex;flex-wrap:nowrap/, "bundled game statistics must stay on one line");

console.log("NBA Center frontend bundle and feature checks passed.");

if (!source.includes("_playByPlayPanel") || !source.includes("POINTS SEULEMENT") || !bundle.includes("FIL DU MATCH")) {
  throw new Error("Play-by-play UI is missing from source or bundle");
}

if (!source.includes("aria-label=\"Actualiser les détails du match\"") || !bundle.includes("RÉESSAYER")) {
  throw new Error("Match detail refresh/error state is missing");
}

assert.match(source, /leader-button/, "season leader rows must be clickable");
assert.match(source, /_openPlayer\(p\.id, p\)/, "clicking a season leader must open that player's profile");
assert.match(source, /TOP 10 · SAISON/, "Players Center must show top-ten leaderboards instead of a duplicate player directory");
assert.match(source, /_leaderPanel\(key,10\)/, "Players Center must render ten players per leaderboard");
assert.match(source, /opponent_abbreviation/, "recent player games must use the opponent's NBA abbreviation");
assert.match(source, /\["MIN",pick\("MIN","minutes"\)\]/, "recent player game stats must expose six labelled values");
assert.match(source, /player-game-stat/, "recent player game stats must use readable stat chips");
assert.match(bundle, /leader-button/, "bundled season leader rows must be clickable");
assert.match(bundle, /TOP 10 · SAISON/, "bundled Players Center must show top-ten leaderboards");
assert.match(bundle, /this\._leaderPanel\([a-z],10\)/, "bundled Players Center must render ten players per leaderboard");
assert.match(bundle, /opponent_abbreviation/, "bundled recent player games must use opponent abbreviations");

assert.match(source, /postseason_stats/, "player profile must receive separate playoff statistics");
assert.match(source, /STATISTIQUES PLAYOFFS/, "player profile must display a separate postseason section");
assert.match(source, /_loadPlayerPlayoffSeason/, "player profile must load postseason stats for the selected year");
assert.match(source, /SAISON PLAYOFFS/, "player profile must offer a postseason year selector");
assert.match(source, /postseason_year: seasonYear/, "postseason selector must request the selected season from Home Assistant");
assert.match(source, /const selectedPlayoffSeason = seasonHistory\.find/, "playoff selector must resolve its own selected season");
assert.match(source, /this\._playerSelectedPlayoffSeason \|\| seasonHistory\[0\]\?\.year/, "playoff selector must not inherit the regular-season selection");
assert.match(source, /selectedPlayoffSeason\?\.display_name/, "playoff season heading must use the actual NBA season label");
assert.ok(source.includes("ÉTAT MÉDICAL</small>"), "player medical status must occupy a profile grid cell");
assert.doesNotMatch(source, /5 DERNIERS MATCHS · PLAYOFFS/, "player profile must not duplicate the recent game log for playoffs");

assert.match(source, /playoff_\$\{key\}/, "Players Center must resolve dedicated playoff leaderboard entities");
assert.match(source, /SAISON & PLAYOFFS/, "Players Center must distinguish regular season and playoff leaderboards");
assert.match(source, /_leaderPanel\(key,10,true\)/, "Players Center must render top-ten playoff leaderboards");
