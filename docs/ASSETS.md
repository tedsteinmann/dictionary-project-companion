# Media assets

These project assets were created or edited with the built-in image-generation tool, then resized and encoded as WebP with alpha preserved. No runtime image service is used.

| Asset | Saved path | Purpose |
| --- | --- | --- |
| Dictionary | `src/assets/dictionary.webp` | Landing-page illustration; 900 × 600, approximately 76KiB |
| Lions | `assets/sponsors/lions-transparent.webp` | Transparent cutout of supplied sponsor mark |
| Elks | `assets/sponsors/elks-transparent.webp` | Transparent cutout of supplied sponsor mark |
| Grown-up benefit icons | `src/assets/material-symbols-grownups.woff2` | Locally served subset of Google Material Symbols Outlined; approximately 3KiB |

The two sponsor cutouts are also embedded in `sponsors.json` so the local editor can import/export the complete configuration. The supplied Rotary asset already had transparency and was retained. The dictionary is a generic illustrative book, not a photograph of a specific distributed edition. Sponsor marks remain the identities of their respective organizations.

The icon font contains only the six symbols used by the grown-up benefit cards and is served locally, so displaying the icons makes no request to Google Fonts.

## Final prompts

### Dictionary

Use case: product-mockup. Asset type: lightweight dictionary companion website landing-page image. Create a refined, photorealistic studio product photograph of one closed navy-blue clothbound physical dictionary, viewed from above at a gentle three-quarter angle, showing the front cover and cream page edges. Title on cover, exact text: "DICTIONARY", in small understated cream lettering. The whole book is visible with generous breathing room on all sides, centered in a landscape 3:2 composition. Soft natural studio lighting, realistic fabric and paper, restrained professional educational aesthetic. Transparent background with real alpha, no backdrop, no white rectangle, no checkerboard drawn into the image. Minimal soft contact shadow only. No extra objects, no logos, no decorative symbols, no cartoon style. The image will sit to the right of navy sans-serif text on a very light gray website and must be clear at 360px wide.

### Lions

Use case: background-extraction. Edit target: supplied Lions International logo. Remove ONLY the white exterior background to genuine transparent alpha. Preserve the exact existing logo: all original blue and gold colors, letter shapes, lion silhouettes, text, outline, proportions, detail, and orientation. Do not redraw, redesign, restyle, sharpen into new shapes, or invent text. Preserve original foreground pixels as closely as possible. No shadow added. Transparent PNG cutout with the original full logo visible, centered with a small margin. This is a sponsor brand asset; identity preservation is essential. No fake checkerboard or colored backdrop.

### Elks

Use case: background-extraction. INPUT IS AN EDIT TARGET, NOT A STYLE REFERENCE. Remove the white background of this supplied Elks script logo, and output an actual RGBA PNG with alpha=0 in the background. This is a file transparency requirement: NEVER draw a checkerboard, never simulate transparency with gray squares, and never use a white or colored backdrop. The original dark charcoal lettering and all its contours must remain exactly as supplied. Preserve the original subtle drop shadow using semitransparent pixels. Change only background alpha, no redesign, no new letters, no new texture. Keep the full mark at its original proportions. Genuine transparent image cutout.
