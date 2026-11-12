import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const bundle = await readFile(
  "custom_components/nba/www/nba-center-card.js",
  "utf8",
);

assert.ok(bundle.length > 10_000, "Lit bundle should include the bundled runtime");
assert.match(bundle, /nba-center-card/, "custom card type must be present");
assert.match(bundle, /customElements\.define/, "custom element must be registered");
assert.match(bundle, /window\.customCards/, "Lovelace card metadata must be exposed");
assert.doesNotMatch(bundle, /site\.api\.espn\.com|site\.web\.api\.espn\.com/, "browser bundle must not call ESPN");
assert.doesNotMatch(bundle, /from\s*["']lit["']/, "Lit imports must be bundled, not external");
console.log("NBA Center frontend bundle checks passed.");
