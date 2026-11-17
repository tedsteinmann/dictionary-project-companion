# Dictionary Challenge — Privacy-Preserving Analytics Implementation Plan

**Target branch:** `main`  
**Initial enabled deployment:** `fm-rotary-foundation` (Azure Static Web Apps)  
**Tracking start date:** October 30, 2026  
**Status:** Reusable default-off implementation, anonymous SPA route views, `#privacy` notice page, and Azure workflow build-variable mapping (`ANALYTICS_ENABLED` and `APPLICATIONINSIGHTS_CONNECTION_STRING`) are implemented. See [`ANALYTICS.md`](ANALYTICS.md) and [`AZURE-MONITOR-SETUP.md`](AZURE-MONITOR-SETUP.md).

## Goal

Measure uptake and use of the Dictionary Challenge—including anonymous screen views, quiz attempts, and earned/viewed/print-requested certificates—using customer-specific Azure Monitor resources. Maintain a static, child-friendly site with no accounts, cookies, database, custom backend, third-party analytics SaaS, or collection of student identities, complying with US COPPA, EU GDPR-K, and the EU ePrivacy Directive (no cookie consent banner required).

## Architecture and ownership

```text
main: reusable quiz + opt-in analytics adapter (disabled by default)
   |
   +-- GitHub Pages / local development: disabled, no SDK loaded
   |
   +-- Deployment branch (e.g. fm-rotary-foundation):
       build-time ANALYTICS_ENABLED=true + APPLICATIONINSIGHTS_CONNECTION_STRING
         |
         +-- browser Application Insights SDK (cookieless, storage-free)
               |
               +-- Anonymous SPA route views (PageviewData) + 6 aggregate events (EventData)
                     |
                     +-- Customer's Azure Application Insights & Log Analytics workspace
```

## Telemetry contract

### 1. Anonymous SPA route views (`pageViews`)

Emitted when the active screen route changes (`home`, `intro`, `levels`, `challenge`, `review`, `results`, `certificate`, `about`, `sponsors`, `libraries`, `redeem`, `contact`, `privacy`), with URL query parameters and user/session/device identifiers stripped.

### 2. Aggregate custom events (`customEvents`)

| Event name | Trigger (one logical action) | Allowed properties |
| --- | --- | --- |
| `quiz_started` | A new attempt is created (including retakes) | `stage` (1–3) |
| `quiz_submitted` | First successful final submission of an attempt | `stage`, `passed` (boolean) |
| `certificate_earned` | A previously unsubmitted attempt transitions into a passed result with a certificate | `stage` |
| `certificate_viewed` | A user opens the certificate screen intentionally | `stage` |
| `certificate_print_requested` | A click initiates `window.print()` | `stage` |
| `redemption_viewed` | A user intentionally navigates to redemption information | none |

## Privacy & Regulatory Safeguards

1. **No cookie banner required (EU ePrivacy Directive Art. 5(3)):** `disableCookiesUsage: true`, `isStorageUseDisabled: true`, and `enableSessionStorageBuffer: false` prevent reading or writing any cookies or Web Storage keys for analytics.
2. **Child anonymity (US COPPA & EU GDPR-K):** `sanitizeTelemetry` strips all SDK-generated user, session, and device identifiers (`ai.user.id`, `ai.session.id`, `ai.device.id`), query strings, typed answers, scores, and completion codes before any payload leaves the browser.
3. **Public transparency (`#privacy`):** The dedicated Privacy page explains what is tracked, for what purpose, and the October 30, 2026 start date.
