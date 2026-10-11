# Dictionary Challenge — Privacy-Preserving Analytics Implementation Plan

**Target branch:** `main`  
**Initial enabled deployment:** `fm-rotary-foundation` (Azure Static Web Apps)  
**Status:** Reusable default-off implementation and Azure workflow environment mapping are in place; Azure rollout pending. No Azure resources or GitHub settings have been created. See [`ANALYTICS.md`](ANALYTICS.md) for implemented behavior and validation.  
**Companion runbook:** [`AZURE-MONITOR-SETUP.md`](AZURE-MONITOR-SETUP.md)

## Goal

Measure uptake and use of the Dictionary Challenge, especially quiz attempts and earned/viewed/print-requested certificates, using customer-specific Azure Monitor resources. Maintain a static, child-friendly site with no accounts, Docker, database, custom backend, third-party analytics provider, or collection of student identities. Keep the instrumentation mergeable from `main` into existing deployment branches, configurable per deployment, and easy to hand over later.

## Constraints and current state

- Preserve existing GitHub repository, branches, hosting, custom URLs, and deployment workflows. A narrowly scoped workflow environment-variable change is allowed when a branch is ready to enable telemetry.
- Current `main` uses `src/main.js`, `src/quiz.js`, `scripts/build.js`, `src/content/site-config.js`, and `npm run build` → `dist/`. `main` deploys through `.github/workflows/pages.yml`.
- Current `fm-rotary-foundation` deploys through `.github/workflows/azure-static-web-apps-witty-water-0a5a5ad10.yml`, with `app_location: /`, `output_location: dist`, and an empty `api_location`. The Azure Static Web Apps action builds the site. Do **not** assume Static Web Apps runtime application settings become build variables or browser runtime configuration.
- The application is a hash-routed SPA. `main.js` handles starting, submitting, and viewing certificates; certificates and completion codes are created client-side and stored in tab `sessionStorage`. Do not send these codes or answers to analytics.
- Retakes and repeated print requests are legitimate separate events. An event does not establish a distinct child, real print, or completed prize redemption.
- The existing `AGENTS.md` and product definition prohibit analytics for the original POC. As part of this feature, narrowly update the documentation to authorize **aggregate, privacy-restricted, optional program evaluation**. All other child privacy prohibitions remain in force.

## Architecture and ownership

```text
main: reusable quiz + opt-in analytics adapter (disabled by default)
   |
   +-- GitHub Pages / development: disabled, no SDK loaded
   |
   +-- fm-rotary-foundation: build-time configuration from manually entered
       GitHub Actions secret/variable + exact production host allowlist
         |
         +-- browser Application Insights SDK (explicit custom events only)
               |
               +-- FM Rotary's Azure Application Insights resource
                     +-- FM Rotary's Log Analytics workspace
                     +-- Optional Azure Workbook (definition stored in repo)
```

Customer isolation is provided through separate Azure resources and deployment-time connection strings. Do not introduce a runtime tenant selector, customer profiles, or cross-customer identifiers. All telemetry configuration is replaceable. For a future handoff, resource and report creation is documented; historical data may require resource transfer or export.

## Event contract (v1)

| Event name | Trigger (one logical action) | Allowed properties |
| --- | --- | --- |
| `quiz_started` | A new attempt is actually created (including retakes) | `stage` (1–3) |
| `quiz_submitted` | First successful final submission of an attempt | `stage`, `passed` (boolean) |
| `certificate_earned` | A previously unsubmitted attempt transitions into a passed result with a new locally generated certificate | `stage` |
| `certificate_viewed` | A user opens the certificate screen intentionally | `stage` |
| `certificate_print_requested` | A click initiates `window.print()` | `stage` |
| `redemption_viewed` | A user intentionally navigates to the redemption information | none |

**Out of scope for v1:** per-question responses and correctness, scores, certificate IDs, persistent attempt IDs, student IDs, school names, precise location, passive navigation trails, real print success, redemption verification. Consider `site_visited` or an adult-page counter only after confirming whether the reports truly need them and the privacy policy is approved.

### Event lifecycle rules

- Track `quiz_started` only when `startAttempt()` returns a new session, not when someone merely opens the levels page or resumes an attempt.
- Track submission only if the state changes from `submitted: false` to `submitted: true`; submission errors, navigation back, and reloads must not double count. Derive `passed` from `gradeAttempt` or the resulting certificate.
- Track `certificate_earned` once for that transition; opening an older certificate is not another earned event.
- Track `certificate_viewed` only after a purposeful certificate button action; exclude automatic render/refresh, back/forward popstate, and redirections. Opening the same certificate twice intentionally counts twice (documented as views, not unique viewers).
- Track print requests before opening the browser dialog, but never state that paper was printed or a PDF saved.
- `redemption_viewed` tracks intentional UI navigation, not repeated repaint/reload. It is an interest signal only.
- Events are best effort. Offline use, blockers, browser unload and network failures may produce undercounting. Telemetry must never delay or interrupt the child experience.

## Deliverables / implementation tasks

### F1 — Provider-independent analytics interface

**Story:** As a developer, I can instrument meaningful actions without depending on Azure-specific code in quiz logic.

- Add `src/analytics.js` exposing `initializeAnalytics(config)` and `track(eventName, props = {})`. Keep it a no-op unless explicitly enabled.
- Use an event-name allowlist and strictly typed, property-allowlisted data. Ignore arbitrary or unknown properties; do not forward free text.
- Keep initialization lazy/asynchronous and resilient to blocked network, malformed config, or SDK load failure.
- Prefer a pinned NPM dependency on the official Microsoft Application Insights browser SDK and a deliberate build strategy. The current build is a copy-based static site with no bundler: either introduce a minimal bundling step for the analytics module or use a pinned local SDK artifact (with licensing) copied into `dist/`. **Do not add an unpinned public CDN or silently assume browser bare-module imports work.** Keep the existing site build functioning.
- Do not collect or store custom IDs. Explicitly disable automatic page, route, exception, fetch/XHR, and performance telemetry as appropriate; disable SDK cookie/storage use. Install a telemetry initializer that allows only approved custom event envelopes and strips identifiers / URL fields where supported. Validate actual network payloads before production; do not claim the SDK has no ephemeral identifiers without testing.

**Acceptance:** No telemetry/SDK network traffic on an unconfigured build; attempted tracking is harmless; only allowlisted custom events and properties can leave the browser.

### F2 — Precise quiz instrumentation

**Story:** As a Rotary organizer, I can measure attempt starts, submissions, certificates and print intent per stage.

- Add calls only at existing state transitions and UI handlers in `src/main.js`, not inside render functions or generic navigation loops.
- Keep the quiz engine (`src/quiz.js`) provider-free; avoid tracking raw user input.
- Preserve existing certificate generation, tab-state persistence, and printing behavior unchanged.

**Acceptance:** A passed quiz yields one start, one submit, one earned event; a failed attempt yields one start, one submit, no earned; a retake starts again; print clicked twice yields two print-requested events.

### F3 — Build-time customer configuration

**Story:** As a deployer, I can enable Azure analytics for one approved production deployment without enabling it on other branches, local builds, or pull-request previews.

- Add safe defaults to `scripts/build.js`: analytics **disabled** unless enabled and all required settings are valid.
- Suggested variables (exact names may be adjusted consistently during implementation):
  - `ANALYTICS_ENABLED=true`
  - `APPLICATIONINSIGHTS_CONNECTION_STRING=<connection string>`
  - `ANALYTICS_ALLOWED_HOSTS=dictionary.fmrotaryfoundation.org` (comma-separated exact hostnames; replace with verified real production domain)
  - `ANALYTICS_SITE_ID=fm-rotary-foundation` only if useful for internal configuration; **do not transmit this property if the resource already identifies the customer**.
- Generate `dist/src/content/analytics-config.js` or `dist/analytics-config.json` with only a Boolean, connection string, and approved production hostnames. **Never place private keys or deploy tokens in this file.** A browser telemetry connection string is publicly visible by design, regardless of whether GitHub stores the input as a secret.
- If `ANALYTICS_ENABLED=true`, fail the build for a missing/invalid connection string or empty/malformed allowlist; otherwise produce a clean uninstrumented build.
- At runtime, require exact `window.location.hostname` allowlist membership; do not accept suffix/substring matching. Disallow localhost, `127.0.0.1`, and known preview hosts by default; the preview host must not be added to the allowlist.
  - Initial implementation is more restrictive: all `azurestaticapps.net` hostnames are rejected. Use a verified custom production domain. Only explicit public Azure HTTPS ingestion endpoints are supported initially.
- Be explicit that GitHub **repository secrets are not automatically exposed** to Oryx, node, or the Static Web Apps deployment action. The Azure workflow maps these settings into the deployment build environment; operators must create the settings manually (see runbook). GitHub Pages on `main` stays unchanged and disabled.

**Acceptance:** Build tests prove main/preview builds don't collect; production build has correct sanitized configuration; enabling with missing settings fails clearly.

### F4 — Reporting and operational documentation

**Story:** As a Rotary organizer, I can review weekly participation trends without needing a custom portal.

- Add `docs/AZURE-MONITOR-SETUP.md` with resource creation, manually configured deployment secrets, privacy validation, KQL, retention/cost checks, and handoff notes.
- Add `docs/ANALYTICS.md` (or keep this plan as the final feature documentation) explaining metrics, counting rules, known limitations, and data governance.
- Add optional `infra/workbooks/dictionary-engagement.workbook.json` only once the tested Workbook definition is ready; do not make Workbook deployment a prerequisite for event collection.
- Provide a KQL view for events by day/stage and a funnel-ish ratio of `quiz_submitted / quiz_started`, clearly marked as *attempt-based*, not user-based. Query `customEvents` or workspace `AppEvents` appropriately; use `sum(itemCount)` when available to account for sampling.
- Document manual retention/ingestion cap/cost alert review and customer resource IDs in an operational inventory (without embedding secrets).

### F5 — Testing, rollout and release

- Unit tests: event whitelist, property validation, disabled mode, malformed configuration, exact host checks, initialization failure, double-submit protection, stage mapping, no IDs/answers/codes/URLs.
- Browser tests: current quiz flows unchanged, no analytics requests on the GitHub Pages/development host, telemetry enablement in a mocked approved hostname/build, failed telemetry never blocks the quiz.
- Test in an isolated Azure resource or controlled local SDK mock before deploying production. Validate Application Insights ingestion by generating test traffic on the **actual approved production origin**; don't accidentally allow preview environments.
- Perform human privacy review of a captured outbound payload, confirming that telemetry envelope fields, headers and automatic SDK fields meet the approved standard. This is separate from reviewing only application-supplied event properties.
- Merge the instrumentation into `main` first with analytics disabled. Existing GitHub Pages CI should continue to pass. Later merge to `fm-rotary-foundation`, provision Azure resources, enter the GitHub settings consumed by the existing workflow mapping, and validate on production. A merge alone must not activate tracking.
- Update the parent-facing privacy description before enabling collection. Obtain any required organizational/legal review for a child-directed site.

## Out of scope

Repository transfer, repository split, branching redesign, deployment migration, new hosting, Docker, backend functions, student login, verified certificate redemption, school-level tracking, automated secret provisioning, analytics SaaS, a bespoke dashboard, and copying history between Azure tenants.

## Definition of done

1. `main` contains the opt-in analytics implementation, tests, and documentation; the default GitHub Pages deployment remains analytics-off.
2. The FM Rotary production site can be enabled using its own Azure resources plus manually created GitHub settings, without replacing its existing deployment architecture.
3. The six defined events are visible in Azure Monitor with stage breakdowns where applicable; counting rules are documented.
4. No raw child input, personal identity, certificate code, or persistent identity is intentionally transmitted, and outgoing telemetry has passed a documented privacy review.
5. Quiz, results, certificate, and printing behavior remain functional when telemetry is disabled, blocked, or offline.
6. Azure resource setup, configuration replacement, workbook/report setup, and future handoff are reproducible from docs.

## References

- Microsoft: [Application Insights JavaScript SDK configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk-configuration)
- Microsoft: [Create workspace-based Application Insights resources](https://learn.microsoft.com/en-us/azure/azure-monitor/app/create-workspace-resource)
- Microsoft: [Azure Static Web Apps build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
