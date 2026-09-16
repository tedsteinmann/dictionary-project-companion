# Media assets

These project assets were created or edited with the built-in image-generation tool, then resized and encoded as WebP with alpha preserved. No runtime image service is used.

| Asset | Saved path | Purpose |
| --- | --- | --- |
| Dictionary | `src/assets/dictionary.webp` | Landing-page illustration; 900 × 600, approximately 76KiB |
| Lions | `assets/sponsors/lions-transparent.webp` | Transparent cutout of supplied sponsor mark |
| Elks | `assets/sponsors/elks-transparent.webp` | Transparent cutout of supplied sponsor mark |
| Grown-up benefit icons | `src/assets/material-symbols-grownups.woff2` | Locally served subset of Google Material Symbols Outlined; approximately 3KiB |

The two sponsor cutouts are also embedded in `sponsors.json` so the local editor can import/export the complete configuration. The supplied Rotary asset already had transparency and was retained. The dictionary is a generic illustrative book, not a photograph of a specific distributed edition. Sponsor marks remain the identities of their respective organizations.

## Sponsor-logo display guidance

Use current, organization-approved artwork supplied by the sponsoring club or downloaded from the organization's official brand center. Confirm permission and the correct local-club lockup before publishing. In particular, do not redraw, recolor, invert, crop, stretch, add effects to, or assemble a new lockup from any of the Elks, Rotary, or Lions marks.

The three marks have very different silhouettes and color behavior: the Elks script is nearly black, while the Rotary and Lions artwork uses fixed brand colors. The site therefore displays every sponsor asset unchanged on the same opaque white holding field in both light and dark environments. A visible neutral border, subtle shadow, and inset clear space distinguish that field from either page background without placing a dark box behind the artwork. This also avoids CSS filters or automatic dark-mode color transformations that could alter a brand color or make the Elks mark disappear.

Before release, the project organizer should replace any proof-of-concept asset with the latest official production file, preserve its aspect ratio, and compare the rendered clear space and minimum size with that organization's current brand guide. Organization-specific minimum sizes and exclusion zones take precedence over the site's default frame. The adjacent sponsor title remains visible text; the decorative image intentionally has an empty alternative text to avoid announcing the same organization twice.

The icon font contains only the six symbols used by the grown-up benefit cards and is served locally, so displaying the icons makes no request to Google Fonts.

## Final prompts

### Dictionary

Use case: product-mockup. Asset type: lightweight dictionary companion website landing-page image. Create a refined, photorealistic studio product photograph of one closed navy-blue clothbound physical dictionary, viewed from above at a gentle three-quarter angle, showing the front cover and cream page edges. Title on cover, exact text: "DICTIONARY", in small understated cream lettering. The whole book is visible with generous breathing room on all sides, centered in a landscape 3:2 composition. Soft natural studio lighting, realistic fabric and paper, restrained professional educational aesthetic. Transparent background with real alpha, no backdrop, no white rectangle, no checkerboard drawn into the image. Minimal soft contact shadow only. No extra objects, no logos, no decorative symbols, no cartoon style. The image will sit to the right of navy sans-serif text on a very light gray website and must be clear at 360px wide.

### Lions

Use case: background-extraction. Edit target: supplied Lions International logo. Remove ONLY the white exterior background to genuine transparent alpha. Preserve the exact existing logo: all original blue and gold colors, letter shapes, lion silhouettes, text, outline, proportions, detail, and orientation. Do not redraw, redesign, restyle, sharpen into new shapes, or invent text. Preserve original foreground pixels as closely as possible. No shadow added. Transparent PNG cutout with the original full logo visible, centered with a small margin. This is a sponsor brand asset; identity preservation is essential. No fake checkerboard or colored backdrop.

### Elks

Use case: background-extraction. INPUT IS AN EDIT TARGET, NOT A STYLE REFERENCE. Remove the white background of this supplied Elks script logo, and output an actual RGBA PNG with alpha=0 in the background. This is a file transparency requirement: NEVER draw a checkerboard, never simulate transparency with gray squares, and never use a white or colored backdrop. The original dark charcoal lettering and all its contours must remain exactly as supplied. Preserve the original subtle drop shadow using semitransparent pixels. Change only background alpha, no redesign, no new letters, no new texture. Keep the full mark at its original proportions. Genuine transparent image cutout.
