# Optional aggregate program evaluation

## Feature

Count anonymous screen views, quiz attempts, submissions, certificates, and interest
in redemption through a cookieless, storage-free Azure Application Insights setup.
Analytics is disabled by default; the default build contains no SDK artifact or
connection string. GitHub Pages (`main`) stays off. Deployment branches (such as
`fm-rotary-foundation`) map `ANALYTICS_ENABLED=true` and their branch-specific
`APPLICATIONINSIGHTS_CONNECTION_STRING` into the build.

A dedicated public **Privacy** page (`#privacy`, linked in the site footer and from
the About page) explicitly documents for parents, guardians, and educators what is
tracked, for what purpose, the **October 30, 2026** tracking start date, and why
no cookie consent banner is required.

## User story

As a Rotary organizer, I can assess use of the dictionary activity and certificate
redemption by screen and stage without identifying children, collecting their
answers, or requiring a cookie banner.

## Implementation

`src/analytics.js` owns asynchronous initialization of `@microsoft/applicationinsights-web`,
a bounded in-memory startup queue (50 items), and best-effort event and route tracking.
`src/analytics-policy.js` defines the six-event contract, the approved SPA route list,
the October 30, 2026 start date constants, and configuration validation. Quiz mechanics
remain provider-free; `src/main.js` tracks actual transitions, intentional UI actions,
and SPA route changes.

### Anonymous SPA route views (`pageViews`)

When the active route changes, `navigate()` in `src/main.js` calls
`trackPageView(safeRoute)` for the approved screens:
`home`, `intro`, `levels`, `challenge`, `review`, `results`, `certificate`,
`about`, `sponsors`, `libraries`, `redeem`, `contact`, and `privacy`.
Stepping from question to question within `challenge` does not emit duplicate
`challenge` page views. URL query parameters and user/session identifiers are
stripped before transmission.

### Aggregate custom events (`customEvents`)

| Event | Properties | Counting rule |
| --- | --- | --- |
| `quiz_started` | stage 1–3 | New attempt, including retakes; excludes resume |
| `quiz_submitted` | stage, passed | First completed submission of an attempt |
| `certificate_earned` | stage | Passed submission creates a certificate |
| `certificate_viewed` | stage | Intentional certificate button click |
| `certificate_print_requested` | stage | Each print-button click, before the dialog |
| `redemption_viewed` | none | Intentional navigation through a redemption control |

Render, reload, and browser history do not create duplicate custom events. A print
request is not proof of printing, and a redemption-page view is not proof of
redemption. Counts and attempt-based ratios are not unique children. Offline use,
blockers, failed SDK loads, the bounded queue, and browser unload can cause
undercounting.

## Configuration and build

Install dependencies with `npm ci`. The official SDK (`@microsoft/applicationinsights-web`)
is pinned to 3.4.5. The copy-based build copies its browser artifact, MIT license,
and notice only when analytics is enabled; no bundler or public CDN is required.

The build accepts these inputs:

- `ANALYTICS_ENABLED=true` enables analytics for the build; unset or other values produce an off artifact.
- `APPLICATIONINSIGHTS_CONNECTION_STRING` supplies the branch-specific public browser connection string (must include a valid `InstrumentationKey`).

An enabled build fails before replacing a successful artifact when the connection
string is missing or invalid. Generated `dist/src/analytics-config.js` contains
only the enabled flag and public connection string. Deployment credentials are
never read by the build.

At runtime, initialization skips local development hostnames (`localhost`, `127.0.0.1`,
`[::1]`, `*.localhost`, `*.local`) and initializes cleanly on deployed production
and Azure Static Web Apps hosts without requiring a separate host-allowlist variable.

Follow [Azure setup](AZURE-MONITOR-SETUP.md) for resource creation, OTLP set to Off,
secret/variable entry, deployment, ingestion checks, and disabling tracking.

## Privacy compliance (US COPPA, EU GDPR-K, and EU ePrivacy Directive)

- **No cookie banner required (EU ePrivacy Directive Art. 5(3)):** Cookies
  (`disableCookiesUsage: true`) and Web Storage (`isStorageUseDisabled: true`,
  `enableSessionStorageBuffer: false`) are disabled in the Application Insights
  configuration. Zero analytics cookies (`ai_user`, `ai_session`) or `localStorage` /
  `sessionStorage` keys are ever read from or written to the user's device.
- **Child anonymity (US COPPA & EU GDPR-K):** Only the approved route name or event
  name, stage (1–3), and submission pass/fail flag enter the telemetry contract.
  Answers, scores, certificate codes, free text, question IDs, attempt IDs, and
  student details are discarded. A telemetry initializer (`sanitizeTelemetry`)
  rebuilds approved `EventData` and `PageviewData` envelopes and rejects all other
  telemetry types, stripping in-memory SDK user, session, and device identifiers
  (`ai.user.id`, `ai.session.id`, `ai.device.id`), URL query strings, and measurements.
- **Network metadata:** Standard HTTPS requests transmit source IP and browser headers
  to Azure Monitor at ingestion; Azure Application Insights masks stored client IP
  addresses to `0.0.0.0` by default after coarse regional lookup.
- **Transparency (`#privacy`):** The public Privacy page explicitly explains what is
  tracked, for what purpose, and that tracking started on **October 30, 2026**.

## Acceptance and validation

- Unit/build tests cover property filtering, typed stages, approved routes, local-host
  skipping, no-op mode, SDK failure, missing configuration, enabled assets, and clean
  disabled rebuilds.
- Browser checks run the full child/adult flows (including the `#privacy` page) and
  assert no default-off SDK or ingestion requests.
- Real-SDK browser validation checks all three stages, passed/failed attempts,
  retakes, reload/history, certificate views, repeated prints, intentional redemption
  navigation, and anonymous SPA route page views.
- Captured payload and storage checks reject child input, user/session/operation IDs,
  unapproved telemetry types, extra properties, SDK cookies, and SDK storage keys.
- Blocked delivery or blocked SDK load leaves the quiz functional.

Run `npm test`, `npm run build`, and `npm run test:browser`.

## Reporting

In Application Insights → **Logs**, query custom events and anonymous route views:

```kusto
customEvents
| where timestamp >= ago(30d)
| where name in ("quiz_started", "quiz_submitted")
| extend stage = tostring(customDimensions.stage)
| summarize started = sumif(itemCount, name == "quiz_started"),
    submitted = sumif(itemCount, name == "quiz_submitted") by stage
| extend submission_to_start_ratio = iff(started == 0, real(null), todouble(submitted) / started)
```

```kusto
pageViews
| where timestamp >= ago(30d)
| summarize views = sum(itemCount) by name
| order by views desc
```

In workspace-scoped Logs, adapt to `AppEvents` and `AppPageViews`.
