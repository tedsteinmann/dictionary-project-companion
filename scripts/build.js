import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sponsorConfig } from '../src/content/sponsors.js';
import { MAX_LOGO_BYTES, validateSponsorConfig } from '../src/sponsors.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);

try {
  if (args.length && (args.length !== 2 || args[0] !== '--config')) {
    throw new Error('Usage: npm run build -- --config /path/to/sponsors.json');
  }
  let config = sponsorConfig;
  const configPath = args.length ? resolve(args[1]) : resolve(root, 'sponsors.json');
  let configText;
  try {
    configText = await readFile(configPath, 'utf8');
  } catch (error) {
    if (args.length || error.code !== 'ENOENT') throw error;
  }
  if (configText !== undefined) {
    config = JSON.parse(configText);
    if (Array.isArray(config?.sponsors)) {
      for (const sponsor of config.sponsors) {
        if (typeof sponsor?.logo === 'string' && sponsor.logo && !sponsor.logo.startsWith('data:')) {
          const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(sponsor.logo).toLowerCase()];
          if (!mime) throw new Error('Logo files must be PNG, JPEG, or WebP.');
          const bytes = await readFile(resolve(dirname(configPath), sponsor.logo));
          if (bytes.length > MAX_LOGO_BYTES) throw new Error('Logo files must be no larger than 2 MB.');
          sponsor.logo = `data:${mime};base64,${bytes.toString('base64')}`;
        }
      }
    }
  }
  // Validate before replacing a previous successful build.
  config = validateSponsorConfig(config);
  const dist = resolve(root, 'dist');
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist);
  await Promise.all([
    cp(resolve(root, 'index.html'), resolve(dist, 'index.html')),
    cp(resolve(root, 'src'), resolve(dist, 'src'), { recursive: true })
  ]);
  await writeFile(resolve(dist, 'src/content/sponsors.js'), `export const sponsorConfig = ${JSON.stringify(config, null, 2)};\n`);
  console.log(`Built static site in dist/ with ${config.sponsors.length} sponsor(s) from ${configText === undefined ? 'the default configuration' : configPath}.`);
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
}
