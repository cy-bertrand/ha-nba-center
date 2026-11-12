import { build } from "esbuild";

const result = await build({
  entryPoints: ["frontend/src/nba-center-card.js"],
  outfile: "custom_components/nba/www/nba-center-card.js",
  bundle: true,
  packages: "bundle",
  metafile: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
});
console.log("ESBUILD INPUTS", JSON.stringify(result.metafile.inputs));
console.log("ESBUILD OUTPUT IMPORTS", JSON.stringify(result.metafile.outputs["custom_components/nba/www/nba-center-card.js"].imports));
console.log("ESBUILD OUTPUT BYTES", result.metafile.outputs["custom_components/nba/www/nba-center-card.js"].bytes);
