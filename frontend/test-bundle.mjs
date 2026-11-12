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
assert.match(bundle, /EASTERN CONFERENCE/, "standings view must be included");
assert.match(bundle, /Filtrer une équipe/, "interactive team search must be included");
assert.match(bundle, /sensor\.nba_matchs_du_jour/, "existing NBA sensor default must be mapped");
assert.doesNotMatch(bundle, /site\.api\.espn\.com|site\.web\.api\.espn\.com/, "browser bundle must not call ESPN");
assert.doesNotMatch(bundle, /from\s*["']lit["']/, "Lit imports must be bundled, not external");
assert.match(source, /config\.entities/, "custom entity mapping must be configurable");
console.log("NBA Center frontend bundle and feature checks passed.");
