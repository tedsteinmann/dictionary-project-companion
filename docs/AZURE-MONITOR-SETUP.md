# Azure Monitor Setup — FM Rotary Dictionary Challenge

**Scope:** Application Insights, workspace, monitoring, and operator-entered GitHub deployment settings.  
**Target site:** `fm-rotary-foundation` branch, existing Azure Static Web Apps deployment.  
**Implementation source:** reusable analytics code added to `main`, then merged into existing branch.  
**Status:** Reusable code is implemented with analytics disabled by default; deployment instructions remain manual. No resources or secrets have been created or edited. See [implemented analytics behavior](ANALYTICS.md).

> **Important:** Azure Static Web Apps **runtime application settings do not automatically configure a static frontend built by GitHub Actions/Oryx**. The Azure workflow maps the public browser telemetry connection string and analytics variables from GitHub Actions settings into the Azure deploy action's build environment. Enter the settings there; do not rely on Static Web Apps runtime settings.

## 1. Resource inventory

| Resource | Example Azure name | Role |
| --- | --- | --- |
| Log Analytics workspace | `log-dictionary-fmrotary` | Stores Application Insights events and allows KQL queries |
| Workspace-based Application Insights | `appi-dictionary-fmrotary` | Receives the browser SDK telemetry |
| Azure Workbook (optional) | `Dictionary Engagement - FM Rotary` | Saved graphical reporting; deploy later |

Create these in the **same Azure region where practical**, with a resource group and subscription appropriate for a future handoff. Do not put multiple customer projects into the same workspace if strict customer-specific access or retention is desired. A separate resource group also makes management simpler; it is optional, not a restructuring requirement.

## 2. Manually create the workspace

1. Sign in to [Azure Portal](https://portal.azure.com/).
2. Search for **Log Analytics workspaces** → **Create**.
3. Choose the existing subscription and desired resource group; give the workspace a customer-specific name such as `log-dictionary-fmrotary` and region.
4. Review and create. Record its subscription, resource group, region and resource ID in an operational inventory (not an analytics event).
5. Check **Usage and estimated costs**, default retention, workspace daily cap and budget alerts; choose a retention period suitable for organizational reporting. Verify pricing with your actual Azure agreement; limits and pricing change.

## 3. Manually create Application Insights

1. In Azure Portal, search for **Application Insights** → **Create**.
2. Choose the same subscription and appropriate resource group; name it `appi-dictionary-fmrotary`.
3. Select **workspace-based** Application Insights and link the newly created Log Analytics workspace; check region and selected workspace before creating.
4. After deployment, open the Application Insights resource → **Overview** or **Properties** and copy the **Connection String** (not the instrumentation key alone).
5. Review **Usage and estimated costs**, data sampling, retention and access control. Disable any unneeded additional collection. Assign access only to authorized administrators/report viewers.
6. Do not create alerts, availability tests or automatic browser instrumentation unless there is a concrete need. The intended feature is custom events only.

**Security note:** The Application Insights browser connection string is not an authentication credential, although it contains the ingestion endpoint and instrumentation key. Anyone with the value can potentially submit fabricated telemetry. Treat event counts as indicative, not audited, and monitor ingestion/cost. **Never** expose Azure deployment tokens, service principals, client secrets, or storage account keys in the static app or its generated config.

## 4. Manually configure GitHub Actions settings

Open `tedsteinmann/dictionary-project-companion` → **Settings** → **Secrets and variables** → **Actions**. Add values manually; do not commit them to source.

| GitHub setting | Suggested type | Example or contents |
| --- | --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Repository secret | Paste Azure's entire Application Insights connection string |
| `ANALYTICS_ENABLED` | Repository variable | `true` only when you intend to enable the approved production deployment |
| `ANALYTICS_ALLOWED_HOSTS` | Repository variable | Actual exact production hostname(s), comma-separated |

**Review the shared-repository constraint:** Repository-level Actions settings can also be read by other eligible workflows. A customer-specific GitHub **environment** (e.g., `fm-rotary-production`) with scoped secret/variables is preferable if you need isolated configuration. That requires adding a GitHub Actions `environment:` association to the existing Azure deployment job and may involve environment approval policies. Do not add a new environment or modify existing job gating without reviewing its effect on deployments. For the initial MVP, repository-level settings can work because the only workflow consuming them will be explicitly wired to do so, but they are not isolation boundaries.

Do **not** confuse these with the existing `AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_WATER_0A5A5AD10` secret. That token authorizes **deployment** and is unrelated to Application Insights tracking; keep it unchanged.

## 5. Azure workflow configuration

The existing `.github/workflows/azure-static-web-apps-witty-water-0a5a5ad10.yml` maps the three GitHub Actions settings under its `Build And Deploy` step:

```yaml
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          # Keep ALL the existing `with:` entries exactly as they are.
          # ...
        env:
          APPLICATIONINSIGHTS_CONNECTION_STRING: ${{ secrets.APPLICATIONINSIGHTS_CONNECTION_STRING }}
          ANALYTICS_ENABLED: ${{ vars.ANALYTICS_ENABLED }}
          ANALYTICS_ALLOWED_HOSTS: ${{ vars.ANALYTICS_ALLOWED_HOSTS }}
```

The snippet is an **illustration of the existing mapping**, not a replacement complete workflow. Verify in a controlled build that the environment variables reach the nested Oryx/Node build. If they do not, add a separate explicit build step fed from the same settings and adjust `skip_app_build` / `app_location` only after testing; do not silently change the production deployment mechanism.

**Critical:** A production build with `ANALYTICS_ENABLED=true` must fail rather than silently fall back to disabled when required configuration is absent. An unset flag must result in an entirely analytics-disabled artifact.

### Deployment host allowlist

- Use `window.location.hostname` with exact string equality against a configured list of known production hostnames.
- Do not configure `*.azurestaticapps.net` or suffix-based host patterns: those can accidentally include preview instances.
- If multiple production hostnames are in use, add only those explicitly approved. If the site is reachable through both a custom domain and a default Azure hostname, choose whether to enable both intentionally.
  - The initial validator rejects **all** `azurestaticapps.net` hostnames, including the default production hostname. Configure only a verified custom production domain for this release; default Azure hostname support requires a reviewed validator change.
- The connection string ends up in the generated website: that is expected for browser telemetry. The build must never include GitHub's deployment token.
- On `main` / GitHub Pages, leave analytics unconfigured and disabled. No workflow changes should be required there.

## 6. Validate site telemetry and children's privacy

Before activating production tracking:

1. Deploy and test default-off code on `main`. Check the browser network panel: no Application Insights SDK requests or telemetry ingestion requests should occur.
2. With a controlled enabled build and an approved production hostname, start a quiz, submit a passing result, open certificate and click print. Confirm correct event counts and stage properties.
3. Inspect the **full outbound request** to Azure ingestion (not only the user-supplied custom property dictionary). Make sure raw answers, certificate codes, student details, URLs with sensitive query strings, and disallowed SDK-generated anonymous identifiers are absent. Cookie/storage settings alone are **not** sufficient proof.
4. Confirm only custom events are emitted; unexpected page views, exceptions, dependencies, browsing data or automatically generated identifiers are grounds to stop rollout and fix instrumentation.
5. Verify custom analytics events cannot stop the quiz when the Azure endpoint is blocked, offline, or slow.
6. Verify PR preview and local hosts do not initialize SDK or send telemetry.
7. Update the site's parent/guardian privacy explanation and obtain whatever review is required for a child-directed audience prior to enabling collection.

Relevant Microsoft SDK settings to review: `disableCookiesUsage`, `isStorageUseDisabled`, `disableAjaxTracking`, `disableFetchTracking`, `disableExceptionTracking`, `enableAutoRouteTracking: false`, `enableSessionStorageBuffer: false`; plus a **telemetry initializer** that drops all telemetry except an explicit event allowlist and strips unauthorized fields. Verify API names against the pinned SDK version and inspect real network output.

## 7. Query and report

In Application Insights → **Logs**, query custom events:

```kusto
customEvents
| where timestamp >= ago(30d)
| where name in (
    "quiz_started", "quiz_submitted", "certificate_earned",
    "certificate_viewed", "certificate_print_requested", "redemption_viewed"
)
| extend stage = tostring(customDimensions.stage)
| summarize events = sum(itemCount) by day = bin(timestamp, 1d), name, stage
| order by day asc, name asc
```

When querying the **Log Analytics workspace** rather than the resource-scoped Application Insights Logs experience, use its `AppEvents` table and relevant columns (e.g. `TimeGenerated`, `Name`, `Properties`, `ItemCount`); table schema may vary, so inspect before adapting the query.

A simple stage summary:

```kusto
customEvents
| where timestamp >= ago(30d)
| where name in ("quiz_started", "quiz_submitted", "certificate_earned", "certificate_print_requested")
| extend stage = tostring(customDimensions.stage)
| summarize events = sum(itemCount) by stage, name
| order by stage asc, name asc
```

Create a Workbook from those queries if needed, and export/store the Workbook JSON in the repo after testing. Do not label an attempts-based ratio or event total as the number of unique children. Distinguish earned from viewed from print-requested certificates, and print-requested from actual print completion.

## 8. Operations, transfer and recovery

- Record Azure resource IDs, resource group, region, owner, retention setting, cost alert owner, exact configured hostname(s), and GitHub settings names in an operations inventory. Do not record the actual connection string or deployment token in public docs.
- Give Rotary admins appropriate Azure roles as needed. Resource ownership/access can be handed over later without changing quiz code.
- A future move to a different subscription/Entra tenant may require recreating resources and separately exporting historical analytics. This guide provides reproducibility, **not** a guarantee that Azure Monitor data can be moved intact.
- To restore: provision workspace and Application Insights, copy the new connection string into GitHub settings, confirm allowed hostname(s), run the existing deployment, then validate telemetry and dashboard queries.
- Rotate/change the connection string configuration if a new Application Insights resource is adopted; preserve the existing Azure Static Web Apps deployment secret unless hosting itself changes.
- Confirm automatic telemetry volume, cost, and retention periodically. Avoid capturing browsing identifiers that could be used to correlate children across visits.

## 9. Operational acceptance checklist

- [ ] Customer-specific workspace and Application Insights exist and are linked.
- [ ] Allowed production hostnames verified against the live site.
- [ ] GitHub Actions settings manually entered and restricted as appropriate.
- [ ] Existing Azure workflow `env` mapping reviewed and GitHub Actions settings entered when enabling.
- [ ] `main`/GitHub Pages telemetry stays disabled; PR previews also disabled.
- [ ] Event ingestion and KQL reports validated on production.
- [ ] Full SDK telemetry privacy validation recorded.
- [ ] Parent-facing privacy copy reviewed and updated.
- [ ] Resource inventory, owner access, cost guardrails, retention, and handoff notes completed.

## Microsoft references

- [Create workspace-based Application Insights resources](https://learn.microsoft.com/en-us/azure/azure-monitor/app/create-workspace-resource)
- [Application Insights JavaScript SDK configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk-configuration)
- [Azure Static Web Apps build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Azure Monitor Logs](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-overview)
