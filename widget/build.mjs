// Builds the framework-free embeddable widget runtime into public/widget/v1/embed.js
// Full runtime spec: specs/20-runtime/03-embed-widget.md (Phase 4).
import { build } from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("public/widget/v1", { recursive: true });

build({
  entryPoints: ["widget/src/embed.ts"],
  outfile: "public/widget/v1/embed.js",
  bundle: true,
  format: "iife",
  target: ["es2018"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
})
  .then(() => console.log("[widget] built public/widget/v1/embed.js"))
  .catch((err) => {
    console.error("[widget] build failed:", err);
    process.exit(1);
  });
