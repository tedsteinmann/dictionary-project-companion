# Optional aggregate program evaluation

## Feature

Count quiz attempts, submissions, certificates and interest in redemption through
an optional Azure Application Insights adapter. Analytics is disabled by default;
the default build contains no SDK artifact or connection string. GitHub Pages and
deployment workflows remain unchanged.

## User story

As a Rotary organizer, I can assess use of the dictionary activity by stage
without identifying children or collecting their answers.

## Implementation

`src/analytics.js` owns asynchronous initialization, a bounded in-memory startup
queue (50 events), and best-effort tracking. `src/analytics-policy.js` defines the
six-event contract and configuration validation. Quiz mechanics remain provider-free;
`src/main.js` tracks actual transitions and intentional UI actions.

| Event | Properties | Counting rule |
| --- | --- | --- |
| `quiz_started` | stage 1–3 | New attempt, including retakes; excludes resume |
| `quiz_submitted` | stage, passed | First completed submission of an attempt |
| `certificate_earned` | stage | Passed submission creates a certificate |
| `certificate_viewed` | stage | Intentional certificate button click |
| `certificate_print_requested` | stage | Each print-button click, before the dialog |
| `redemption_viewed` | none | Intentional navigation through a redemption control |

Render, reload and browser history do not create new events. A print request is
not proof of printing, and a redemption-page view is not proof of redemption.
Counts and attempt-based ratios are not unique children. Offline use, blockers,
failed SDK loads, the bounded queue and browser unload can cause undercounting.
Delivery is not retried or persisted by this feature.

## Configuration and build

Install dependencies with `npm ci`. The official SDK is pinned to 3.4.5. The existing
copy-based build copies its global browser artifact, MIT license and notice only
when analytics is enabled; no bundler or public CDN is required.

The build accepts only these inputs:

- `ANALYTICS_ENABLED=true` enables validation; unset or other values produce an off artifact.
- `APPLICATIONINSIGHTS_CONNECTION_STRING` supplies the public browser connection string.
- `ANALYTICS_ALLOWED_HOSTS` supplies comma-separated exact lowercase production hostnames.

An enabled build fails before replacing a successful artifact when configuration
is missing or invalid. Generated `dist/src/analytics-config.js` contains only the
enabled flag, public connection string and allowed hosts. Deployment credentials
are never read by the build.

This initial implementation supports explicit public Azure HTTPS ingestion
endpoints ending in `.applicationinsights.azure.com`. It rejects wildcard hosts,
local names, IP literals, URL paths and **all** `azurestaticapps.net` hosts. Use an
approved custom production domain. Supporting the default Azure production hostname
or a sovereign cloud would require a separately reviewed validation change.
Runtime initialization requires exact `location.hostname` membership. Local and
preview origins do not load the SDK even if they receive an enabled artifact.

See [Azure setup](AZURE-MONITOR-SETUP.md) for manual resources and GitHub settings.
No workflow mapping, secret, Azure resource, production activation or deployment
has been performed as part of the reusable code change.

## Data and privacy boundaries

Only the event name, stage, and submission pass/fail flag enter the event contract.
Answers, scores, certificate codes, free text, question IDs, attempt IDs and student
details are discarded. A telemetry initializer rebuilds approved EventData envelopes
and rejects other telemetry types, stripping SDK context, identifiers, URLs, extra
properties and measurements. The SDK sender adds its software-version tag; the
envelope also includes the resource instrumentation key, timestamp and schema fields.

Cookies, SDK storage, dependency/fetch tracking, automatic route/page/exception
tracking, remote SDK configuration and SDK usage reporting are disabled. A sender
transport uses fetch with omitted credentials and no Referer header. Normal network
transport still exposes the source IP, browser HTTP headers and Origin to Azure;
this is not a claim of anonymous network transport. Organizers must review Azure's
handling of network metadata, retention, access and costs before activation.

The grown-up page adds an aggregate-count explanation in enabled builds. It does
not replace required organizational/privacy review for a child-directed site.

## Acceptance and validation

- Unit/build tests cover property filtering, typed stages, allowlists, no-op mode,
  SDK failure, missing configuration, enabled assets and clean disabled rebuilds.
- Browser checks run the existing child/adult flows and assert no default-off SDK
  or ingestion requests.
- A synthetic approved HTTPS origin uses the real pinned SDK with intercepted
  ingestion. It checks all three stages, passed/failed attempts, retakes, reload/history,
  certificate views, repeated prints, and intentional redemption navigation.
- Captured payload/header checks reject child input, user/session/operation IDs,
  non-event telemetry, extra properties, Referer/cookies and correlation headers.
  Storage checks reject SDK cookies and storage keys. No traffic goes to Azure.
- Blocked delivery must leave the quiz functional.

Run `npm test`, `npm run build`, and `npm run test:browser`. A real production-origin
ingestion test, full human payload review, Azure reporting and organizational approval
remain rollout tasks; automated interception does not prove production configuration.

Local validation on October 10, 2026 passed all 44 unit/build tests, the existing
320–1280px browser checks, and real-SDK intercepted-payload checks. A captured
request was inspected: event envelopes contained the approved properties, resource
key, timestamp, schema fields and `ai.internal.sdkVersion` only; HTTP headers
contained ordinary browser metadata and Origin, with no Referer, Cookie or
correlation headers. Phone screenshots of the welcome and enabled grown-up page
were inspected. This local evidence does not complete the production privacy review.

## Reporting

The runbook includes daily event and stage summaries. For an attempt-based ratio
(which can cross day boundaries and exceed 100% for a reporting window):

```kusto
customEvents
| where timestamp >= ago(30d)
| where name in ("quiz_started", "quiz_submitted")
| extend stage = tostring(customDimensions.stage)
| summarize started = sumif(itemCount, name == "quiz_started"),
    submitted = sumif(itemCount, name == "quiz_submitted") by stage
| extend submission_to_start_ratio = iff(started == 0, real(null), todouble(submitted) / started)
```

In workspace-scoped Logs, adapt to `AppEvents`, `Name`, `Properties`, `ItemCount`
and `TimeGenerated`. Azure resources provide customer isolation; no customer ID
is transmitted in events.

## Out of scope

Individual tracking, persistent identities, per-question analytics, analytics
dashboards in the app, verified redemption, Azure provisioning, secret management,
deployment changes and a Workbook definition that has not been tested in Azure.
