// わが家の家計簿 — hand-in program for the make.fun household-budget bounty.
//
// The site itself is the static bundle in app/ (plain HTML, CSS and ES
// modules, no build step, nothing loaded over the network). This program
// delivers it: it copies app/ and screenshots/ into the output directory
// and asks the vendored make.fun library to write dossier.json there, the
// summary (screenshots, first-load files and bytes, source listing) that
// the judge reads.
//
// vendor/makefun-frontend.ts stays exactly as the kit shipped it: the
// scorer rebuilds the dossier with its own copy and compares byte for
// byte, so the library must not be edited.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader.)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own limits, passed to the dossier builder so an entry the
// scorer would refuse (too many screenshots, an oversized app/) fails
// here first instead of at grading time.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function deliverSite() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoDir, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }
  const dossier = buildDossier(outputDir, DOSSIER_LIMITS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

deliverSite();
