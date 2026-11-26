// Hearthhold — hand-in program for the best household budget site bounty.
// The site itself is the static app/ folder beside this file (plain HTML, CSS
// and ES modules, no build step, nothing fetched from the network). This
// program copies app/ and screenshots/ into the output directory and writes
// dossier.json with the kit's vendored library — byte for byte the dossier the
// scorer rebuilds, so vendor/makefun-frontend.ts stays exactly as the kit
// shipped it.
//
// Locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and the output is /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the gate's own limits (at most 4 screenshots of 256 KiB,
// at most 993 app entries and 16 MiB of app files, dossier text cut at
// 160 KiB), so an entry this program writes is one the scorer accepts.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

console.log(`Hearthhold handed in: app/ and screenshots/ copied to ${outputDir}, dossier.json written.`);
