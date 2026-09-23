# Static project configuration

## Feature

The Dictionary Challenge supports two build-time JSON configurations with separate concerns:

- `site`: the organizer name and optional public contact methods;
- `sponsors`: one or more organizations recognized separately from quiz mechanics; and
- `redemption`: an explicit enabled state, general instructions, and an optional deadline in `sponsors.json`; and
- `participants`: certificate-redemption locations in the separate `participants.json` file.

The `participants` collection supplies the Participants page and redemption-location cards. These are certificate-redemption partners, not inferred sponsors: a participating library appears in sponsor recognition only if an organizer deliberately adds it to `sponsors` as well.

The browser setup tool edits these values locally and downloads `sponsors.json` and `participants.json`. The build validates and combines them into the static site; there are no accounts, hosted configuration, runtime editing, or backend.

## User stories

- As a dictionary-project organizer, I can publish safe public project and sponsor details in a static site.
- As a parent or guardian, I can tell whether certificate redemption is offered and, when enabled, see clear instructions and participating locations.
- As a family, I can open the Participants page to find the configured library redemption locations without confusing fulfillment partners with project sponsors.

## Configure a build

1. Run `npm run dev` and open `http://localhost:4173/tools/sponsors.html`.
2. Enter organizer contacts, sponsors, and any redemption instructions and locations.
3. Download `sponsors.json` and `participants.json` and save both in the project root.
4. Run:

   ```bash
   npm run build
   ```

5. Deploy `dist/`. To preview it directly, run `python3 -m http.server 4174 --directory dist`.

The local dictionary-project organizer maintains the `site` details. Review them before every publication and update them whenever the responsible organization, public email address, telephone number, website, redemption offer, deadline, or participating locations change. Test every published link as part of that review. Use a durable organizational or role-based address (for example, `dictionary@example.org`) instead of a volunteer's personal address whenever possible, so families are not directed to an individual's private contact details and the address remains useful when volunteers change.

The historical root filename `sponsors.json` remains the automatic sponsor configuration filename. Existing combined files remain valid: legacy `redemption.locations` values are migrated to the normalized `participants` collection when no separate participant collection is supplied. The former `organizer` shape is also migrated during validation. New exports use the separate canonical contracts below.

If no root configuration exists, the build uses `src/content/site-config.js`. The complete normalized configuration is emitted to `dist/src/content/site-config.js`. Invalid configuration fails before `dist/` is replaced, preserving the last successful build.

## Sponsor and redemption configuration

```json
{
  "site": {
    "organizerName": "Your dictionary project organizer",
    "addressLines": ["123 Main Street", "Your Community"],
    "telephone": "(555) 555-0100",
    "email": "dictionary@example.org",
    "website": "https://example.org/project"
  },
  "sponsors": [
    {
      "title": "Your community service club",
      "description": "Helping local children discover the joy of reading.",
      "url": "https://example.org",
      "logo": null
    }
  ],
  "redemption": {
    "enabled": true,
    "instructions": "Bring a printed certificate with a parent or guardian.",
    "deadline": "May 31, 2027"
  }
}
```

## Participant configuration

`participants.json` contains only fulfillment locations:

```json
{
  "participants": [
    {
      "name": "Main Library",
      "instructions": "Ask at the children's desk.",
      "addressLines": ["10 First Avenue", "Your Community"],
      "website": "https://library.example.org",
      "telephone": "(555) 555-0110"
    }
  ]
}
```

`site` is optional for legacy compatibility; when provided, its organizer name is required and its contact values are optional. The Contact page displays the organizer name and address plus links only for configured email, telephone, and HTTP(S) website values. `sponsors` requires at least one sponsor. `redemption.enabled` is required when the section is present; general instructions are required when enabled. Zero participants is valid only when the organizer supplies at least one public email, telephone, or website so an adult has a way to ask about redemption. Each configured participant requires a display name and its own instructions. Address lines, website, and telephone display value are optional.

The Participants page reuses each participant's configured name, address, and website. Keep `sponsors.json` and `participants.json` independently maintained so fulfillment participation never creates sponsor recognition by implication.

Text is trimmed and bounded. Collections are limited to 20 sponsors, 50 locations, and five address lines per address. Websites must be absolute HTTP(S) URLs without embedded credentials. Sponsor logos may be embedded PNG, JPEG, or WebP data URLs up to 2 MB. Hand-authored sponsor logo paths may point to those image types relative to the JSON file; the build embeds them before validation.

## Acceptance criteria

- Old sponsor-only files build with safe site and disabled-redemption defaults.
- Disabled redemption does not imply an offer; enabled redemption publishes only validated instructions and locations.
- One or multiple sponsors and participants preserve their configured order.
- Organizer and location links accept only HTTP(S), and rendered values are escaped.
- The Participants route lists every configured redemption location with semantic address markup and descriptive links while keeping those records separate from sponsors.
- The Contact page tells children to ask a parent, guardian, teacher, or librarian to make contact and never requests personal information.
- The local setup tool is keyboard-operable, labels its controls, sends no data to a server, and is excluded from `dist/`.
- Invalid configuration leaves the prior successful static build intact.

## Out of scope

Accounts, a CMS, hosted uploads, tenant management, runtime configuration, form submissions, prize inventory, and claim tracking. Redemption details are static public instructions; the application still collects no visitor or child information.
