import { build } from "esbuild";

await build({
  entryPoints: ["frontend/src/nba-center-card.js"],
  outfile: "custom_components/nba/www/nba-center-card.js",
  bundle: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
});
