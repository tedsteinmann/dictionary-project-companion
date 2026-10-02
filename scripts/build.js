import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig as defaultSiteConfig } from '../src/content/site-config.js';
import { MAX_LOGO_BYTES, validateSiteConfig } from '../src/site-config.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);

try {
  if (args.length && (args.length !== 2 || args[0] !== '--config')) {
    throw new Error('Usage: npm run build -- --config /path/to/sponsors.json');
  }
  let config = defaultSiteConfig;
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
          const relativeLogo = sponsor.logo.replace(/^\/+/, '');
          const bytes = await readFile(resolve(dirname(configPath), relativeLogo));
          if (bytes.length > MAX_LOGO_BYTES) throw new Error('Logo files must be no larger than 2 MB.');
          sponsor.logo = `data:${mime};base64,${bytes.toString('base64')}`;
        }
      }
    }
  }
  const prizePath = resolve(root, 'prize.json');
  let prizeText;
  try {
    prizeText = await readFile(prizePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (prizeText !== undefined) {
    const prizeConfig = JSON.parse(prizeText);
    if (!prizeConfig || !prizeConfig.redemption || typeof prizeConfig.redemption !== 'object' || Array.isArray(prizeConfig.redemption)) {
      throw new Error('prize.json must contain a redemption object.');
    }
    config = {
      ...config,
      prize: { title: prizeConfig.title, description: prizeConfig.description },
      redemption: prizeConfig.redemption
    };
  }
  const librariesPath = resolve(root, 'libraries.json');
  let librariesText;
  try {
    librariesText = await readFile(librariesPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (librariesText !== undefined) {
    const libraryConfig = JSON.parse(librariesText);
    if (!libraryConfig || !Array.isArray(libraryConfig.libraries)) {
      throw new Error('libraries.json must contain a libraries array.');
    }
    for (const library of libraryConfig.libraries) {
      if (typeof library?.logo === 'string' && library.logo && !library.logo.startsWith('data:') && !/^https?:\/\//i.test(library.logo)) {
        const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(library.logo).toLowerCase()];
        if (!mime) throw new Error('Logo files must be PNG, JPEG, or WebP.');
        const relativeLogo = library.logo.replace(/^\/+/, '');
        const bytes = await readFile(resolve(dirname(librariesPath), relativeLogo));
        if (bytes.length > MAX_LOGO_BYTES) throw new Error('Logo files must be no larger than 2 MB.');
        library.logo = `data:${mime};base64,${bytes.toString('base64')}`;
      }
    }
    config = { ...config, libraries: libraryConfig.libraries };
    if (config.redemption?.locations) {
      const { locations, ...redemption } = config.redemption;
      config.redemption = redemption;
    }
  }
  // Validate before replacing a previous successful build.
  config = validateSiteConfig(config);
  const dist = resolve(root, 'dist');
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist);
  await Promise.all([
    cp(resolve(root, 'index.html'), resolve(dist, 'index.html')),
    cp(resolve(root, 'favicon.svg'), resolve(dist, 'favicon.svg')),
    cp(resolve(root, 'src'), resolve(dist, 'src'), { recursive: true })
  ]);
  await writeFile(resolve(dist, 'src/content/site-config.js'), `export const siteConfig = ${JSON.stringify(config, null, 2)};\n`);
  console.log(`Built static site in dist/ with ${config.sponsors.length} sponsor(s) and ${config.libraries.length} library location(s).`);
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
}
