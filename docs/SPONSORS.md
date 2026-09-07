# Detective branding and sponsor builds

## Feature

A flyer-inspired Dictionary Detective Challenge with one or more build-configured sponsors. Each sponsor has an optional uploaded logo, a title, a description, and a learn-more link.

## User story

As a dictionary-project organizer, I can prepare a static site recognizing all participating service organizations so families can discover who made the project possible.

## Implementation tasks

- Apply navy, blue, yellow, green, and red branding with a book motif and clear audience choices.
- Render sponsor recognition on the welcome and grown-up pages, separate from quiz mechanics.
- Provide a local sponsor setup page with logo upload and JSON download.
- Validate configuration and produce a self-contained static build.
- Test one and multiple sponsors, invalid input, upload/export, quiz flow, mobile layout, and keyboard access.

## Acceptance criteria

- The default build works, and a custom build accepts one or more sponsors.
- Sponsor titles and descriptions render as text; links accept only HTTP(S).
- Uploaded PNG, JPEG, or WebP logos are included in the configuration and built site.
- The setup page runs locally, sends no files to a server, and is excluded from the deployed build.
- Welcome and grown-up pages show each configured sponsor and a learn-more link.
- Child questions still require dictionary skills, with no sponsor knowledge required.
- Mobile layouts do not overflow and controls have visible keyboard focus.

## Out of scope

Accounts, a CMS, hosted uploads, tenant management, theme switching, prize claims, and changes to the question set. Rotary service examples remain educational context, independent of the sponsor list.

## Configure a build

1. Run `npm run dev` and open `http://localhost:4173/tools/sponsors.html`.
2. Add sponsors, choose optional logo files, and enter each title, description, and full website URL.
3. Download the JSON configuration and save it as `sponsors.json` in the project root (alongside `package.json`). To revise it later, open it again using the setup page's import control.
4. Run `npm run build`, then refresh the dev page. `npm run dev` also rebuilds on startup. If you keep your configuration elsewhere, select it explicitly:

   ```bash
   npm run build -- --config /path/to/sponsors.json
   ```

5. Deploy the contents of `dist/`. To preview the custom build locally, run `python3 -m http.server 4174 --directory dist` and open `http://localhost:4174`.

Both `npm run build` and `npm run dev` automatically read the project-root `sponsors.json`. If it is absent, they use the default Rotary sponsor in `src/content/sponsors.js`. An explicit `--config` path takes precedence for a build. Invalid configuration fails with an error instead of silently using defaults. The build reports which configuration it used.

The dev server serves `dist/` and additionally makes the local sponsor editor available at `/tools/sponsors.html`; the editor is still excluded from production output. Source and configuration changes require `npm run build` followed by a page refresh, or a dev restart. To preview an explicit custom build, use the `--directory dist` command above; restarting dev uses the project-root configuration again. `config/sponsors.example.json` illustrates three sponsors with placeholder links; replace them before publishing.

The configuration format is:

```json
{
  "sponsors": [
    {
      "title": "Your community service club",
      "description": "Helping local children discover the joy of reading.",
      "url": "https://example.org",
      "logo": null
    }
  ]
}
```

The setup page exports logos as embedded data URLs. Hand-edited configuration can instead use a PNG, JPEG, or WebP file path relative to the JSON file. The build embeds those files, so it has no dependency on the original paths or an external image host. Logos are optional; a letter mark is shown when omitted. Each logo is limited to 2 MB. Titles are limited to 120 characters and descriptions to 600. Sponsor links navigate in the same tab and do not send a referrer.

## Validation

- `npm test`: 18 tests pass, including default/custom builds, logo embedding, input validation, safe text rendering, and the existing quiz state/content checks.
- Browser walkthrough: all eight questions, retry, progress, completion, replay, and keyboard entry pass.
- Browser sponsor setup: logo upload/preview, three-sponsor export/import, and sponsor/logo removal pass. The exported configuration builds successfully, and its embedded image renders on welcome and grown-up pages.
- Layout checked at 320, 390, 768, and 1280 pixels, including a three-sponsor build served from a subdirectory. No horizontal overflow.
