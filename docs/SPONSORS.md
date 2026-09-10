# Challenge branding and sponsor builds

## Feature

The Dictionary Challenge combines a clean, contemporary interface with recognition for one or more build-configured sponsors. Each sponsor has an optional uploaded logo, a title, a local description, and a learn-more link. A build can also publish optional organizer name, address or service area, phone, and email details.

## User story

As a dictionary-project organizer, I can prepare a static site recognizing all participating service organizations so families can discover who made the project possible.

## Implementation tasks

- Use restrained navy and blue branding with clear audience choices and readable sponsor recognition.
- Render sponsor recognition on the welcome and Sponsors pages, separate from quiz mechanics.
- Provide a local sponsor setup page with logo upload and JSON download.
- Validate configuration and produce a self-contained static build.
- Test one and multiple sponsors, invalid input, upload/export, quiz flow, mobile layout, and keyboard access.

## Acceptance criteria

- The default build works, and a custom build accepts one or more sponsors.
- Sponsor titles and descriptions render as text; links accept only HTTP(S).
- Uploaded PNG, JPEG, or WebP logos are included in the configuration and built site.
- The setup page runs locally, sends no files to a server, and is excluded from the deployed build.
- Welcome and Sponsors pages show each configured sponsor and a learn-more link.
- The Contact page publishes configured organizer details and sponsor website links without a contact form.
- Local descriptions come directly from configuration; rendering never selects copy by matching sponsor names.
- Child questions still require dictionary skills, with no sponsor knowledge required.
- Mobile layouts do not overflow and controls have visible keyboard focus.

## Out of scope

Accounts, a CMS, hosted uploads, tenant management, theme switching, prize claims, and changes to the question set. Rotary service examples remain educational context, independent of the sponsor list. Configuration is consumed at build time and becomes static output; it is not runtime administration.

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
  "organizer": {
    "name": "Your dictionary project organizer",
    "address": "123 Main Street, Your Community",
    "phone": "(555) 555-0100",
    "email": "dictionary@example.org"
  },
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

The organizer object is optional, as are its individual fields, but it must contain at least one nonblank detail when present. These values are public contact information printed into the built Contact page. The page also links to every sponsor website. It never asks visitors to submit their own details.

The setup page exports logos as embedded data URLs and includes the optional organizer fields. Hand-edited configuration can instead use a PNG, JPEG, or WebP file path relative to the JSON file. The build embeds those files, so it has no dependency on the original paths or an external image host. Logos are optional; a letter mark is shown when omitted. Transparent PNG or WebP files blend into both welcome and Sponsors page backgrounds. The current sponsor configuration includes transparent logo assets; the setup tool preserves their alpha when importing and exporting configuration. It does not automatically remove backgrounds from new uploads. Each logo is limited to 2 MB. Titles are limited to 120 characters and descriptions to 600. Sponsor links navigate in the same tab and do not send a referrer.

## Validation

- `npm test`: all automated tests pass, including default/custom builds, logo embedding, input validation, safe text rendering, and the existing quiz state/content checks.
- Browser walkthrough: all eight questions, retry, progress, completion, replay, and keyboard entry pass.
- Browser sponsor setup: logo upload/preview, three-sponsor export/import, and sponsor/logo removal pass. The exported configuration builds successfully, and its embedded image renders on welcome and Sponsors pages.
- Layout checked at 320, 390, 768, and 1280 pixels, including a three-sponsor build served from a subdirectory. No horizontal overflow.
