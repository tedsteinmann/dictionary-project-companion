# Azure Monitor Setup — FM Rotary Dictionary Challenge

**Scope:** Application Insights, workspace, monitoring, and operator-entered GitHub deployment settings.  
**Target site:** `fm-rotary-foundation` branch, existing Azure Static Web Apps deployment.  
**Implementation source:** reusable analytics code added to `main`, then merged into existing branch.  
**Status:** Reusable code and the Azure workflow's build-variable mapping are present on `main`. Analytics remains off in unconfigured builds. Azure resources, GitHub settings, delivery to the deployment branch, and production ingestion must be verified by the operator. See [implemented analytics behavior](ANALYTICS.md).

> **Important:** Azure Static Web Apps **runtime application settings do not automatically configure a static frontend built by GitHub Actions/Oryx**. Enter the settings in GitHub Actions; the Azure workflow now maps them into the deploy action's build environment. Setting values in the Azure Static Web App's runtime configuration alone will not enable browser telemetry.

Follow sections 2–5 in order to create resources, enter repository settings, and deploy. Complete the privacy review before changing `ANALYTICS_ENABLED` to `true`, then verify the deployed configuration and ingestion in sections 5–7.

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
4. If the creation form offers **OTLP support**, leave it **Off**. This site uses the Application Insights JavaScript browser SDK; OTLP ingestion is not required. [Microsoft browser-monitoring guidance](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview).
5. After deployment, open the Application Insights resource → **Overview** or **Properties** and copy the **Connection String** (not the instrumentation key alone). The current validator requires an explicit HTTPS `IngestionEndpoint` ending in `.applicationinsights.azure.com`.
6. Review **Usage and estimated costs**, data sampling, retention and access control. Disable any unneeded additional collection. Assign access only to authorized administrators/report viewers.
7. Do not create availability tests or automatic browser instrumentation unless there is a concrete need. The intended feature is custom events only; cost guardrails remain appropriate.

Copy the full portal value, including `LiveEndpoint` and `ApplicationId` when present.
Azure's regional live endpoint can end in `.livediagnostics.monitor.azure.com`, while
ingestion uses `.applicationinsights.azure.com`. The validator accepts these separate
endpoint formats; accepting `LiveEndpoint` does not enable live metrics.
[Microsoft endpoint reference](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/azure-monitor-network-access).

If an older build reports `Analytics endpoint must be an Azure Application Insights
HTTPS endpoint` for a portal connection string containing a regional `LiveEndpoint`,
ensure the deployment branch includes the endpoint-validation fix and redeploy.
Current errors identify `IngestionEndpoint` or `LiveEndpoint`; check that field's
HTTPS scheme and domain if validation still fails. Do not replace the Azure hostname
with an invented endpoint to bypass validation.

**Security note:** The Application Insights browser connection string is not an authentication credential, although it contains the ingestion endpoint and instrumentation key. Anyone with the value can potentially submit fabricated telemetry. Treat event counts as indicative, not audited, and monitor ingestion/cost. **Never** expose Azure deployment tokens, service principals, client secrets, or storage account keys in the static app or its generated config.

## 4. Manually configure GitHub Actions settings

Use **repository** secrets and variables for the current workflow, rather than environment-scoped settings. Open `tedsteinmann/dictionary-project-companion` → **Settings** → **Secrets and variables** → **Actions**. Add values manually; do not commit them to source.

| GitHub setting | Required location for current workflow | Initial value |
| --- | --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Repository secret | Paste Azure's entire Application Insights connection string |
| `ANALYTICS_ENABLED` | Repository variable | `false` until the production privacy review is complete |
| `ANALYTICS_ALLOWED_HOSTS` | Repository variable | Actual exact production custom hostname(s), comma-separated |

1. On the **Secrets** tab, select **New repository secret**. Enter `APPLICATIONINSIGHTS_CONNECTION_STRING` as the name and paste the entire Azure connection string as the value. Save it.
2. On the **Variables** tab, select **New repository variable**. Add `ANALYTICS_ENABLED` with the value `false`.
3. Add a second repository variable named `ANALYTICS_ALLOWED_HOSTS`. Use the hostname shown under the Azure Static Web App's **Custom domains**, in lowercase, without `https://`, a port, a path, or a trailing slash. For example, `dictionary.example.org` is a placeholder to replace with the actual approved domain. Multiple exact hosts use commas, such as `dictionary.example.org,www.dictionary.example.org`, only if both are intentionally approved.
4. Confirm the two configuration values appear under **Repository variables**, and the connection string under **Repository secrets**.

The connection string is public in the generated browser app. Keeping it in a GitHub secret avoids committing it and lets GitHub mask it in workflow logs; it does not make it private to site visitors. The workflow reads the secret through `secrets` and the variables through `vars`, then passes them to the build through `env`. [GitHub variables](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables), [GitHub secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

**Environment-scoped alternative:** The current Azure job has no `environment:` association, so it cannot use settings stored only in a GitHub environment. A customer-specific environment (e.g., `fm-rotary-production`) could provide more isolated configuration later, but would require explicitly associating the deployment job and reviewing its approval/deployment behavior. Repository settings can be accessed by other eligible workflows and are not customer isolation boundaries.

Do **not** confuse these with the existing `AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_WATER_0A5A5AD10` secret. That token authorizes **deployment** and is unrelated to Application Insights tracking; keep it unchanged.

## 5. Deploy and verify the build configuration

The existing `.github/workflows/azure-static-web-apps-witty-water-0a5a5ad10.yml` already has this mapping under **Build And Deploy** on `main`:

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

The snippet shows the mapping only; it is not a replacement complete workflow. Preserve the existing deployment-token reference, build locations and trigger configuration.

1. Ensure the analytics implementation **and** workflow mapping have reached `fm-rotary-foundation`. A commit on `main` alone does not update this Azure deployment. The current Azure workflow runs automatically on pushes to `fm-rotary-foundation`; GitHub Pages builds `main` separately.
2. With `ANALYTICS_ENABLED=false`, deploy the branch and check that the dictionary challenge still works.
3. Complete the parent-facing/privacy review described in section 6. When ready for controlled production validation, edit the repository variable `ANALYTICS_ENABLED` to the exact value `true`.
4. In GitHub **Actions → Azure Static Web Apps CI/CD → Run workflow**, choose `fm-rotary-foundation`, then run the workflow. Editing a secret or variable alone does not rebuild the site. If the manual workflow control is unavailable, a normal approved push to that branch also triggers deployment.
5. Confirm **Build And Deploy** succeeds. Open `https://YOUR-PRODUCTION-HOST/src/analytics-config.js`, replacing the placeholder hostname. Verify `enabled` is `true` and `allowedHosts` contains the exact domain you are visiting. An off build contains only `{"enabled":false}`. Never paste deployment credentials into this file or into troubleshooting output.
6. Run the production-origin event and payload checks in section 6, then the Logs query in section 7. Allow a few minutes for ingestion. These tests must use an allowlisted custom production domain; local and preview URLs intentionally do not initialize the SDK.

Verify that the environment variables reach the nested Oryx/Node build. If the deployed config remains off despite the exact `true` setting, check that the selected branch contains the mapping and that the settings are at repository scope. If those are correct but the build still does not receive them, investigate an explicit build step before changing `skip_app_build` / `app_location`; do not silently change the production deployment mechanism.

**Critical:** A production build with `ANALYTICS_ENABLED=true` must fail rather than silently fall back to disabled when required configuration is absent. An unset flag must result in an entirely analytics-disabled artifact.

### Deployment host allowlist

- Use `window.location.hostname` with exact string equality against a configured list of known production hostnames.
- Do not configure `*.azurestaticapps.net` or suffix-based host patterns: those can accidentally include preview instances.
- The validator rejects **all** `azurestaticapps.net` hostnames, including the default production hostname. Configure only verified custom production domains for this release; default Azure hostname support requires a reviewed validator change.
- The connection string ends up in the generated website: that is expected for browser telemetry. The build must never include GitHub's deployment token.
- GitHub Pages on `main` stays off because its workflow does not pass these settings into the build. Leave that workflow unchanged.

To disable tracking, set the repository variable `ANALYTICS_ENABLED` to `false` and redeploy `fm-rotary-foundation`. The variable change alone does not alter an already deployed artifact; visitors with an older page open can continue using that artifact until it is refreshed.

## 6. Validate site telemetry and children's privacy

Before public activation, complete the privacy review. Then use a controlled enabled build on the approved production origin for payload and ingestion validation:

1. Review the implemented parent/guardian privacy explanation and obtain whatever review is required for a child-directed audience prior to enabling collection. Update the explanation if the review requires changes.
2. Deploy and test default-off code on `main`. Check the browser network panel: no Application Insights SDK requests or telemetry ingestion requests should occur.
3. With a controlled enabled build and an approved production hostname, start a quiz, submit a passing result, open certificate and click print. Confirm correct event counts and stage properties.
4. Inspect the **full outbound request** to Azure ingestion (not only the user-supplied custom property dictionary). Make sure raw answers, certificate codes, student details, URLs with sensitive query strings, and disallowed SDK-generated anonymous identifiers are absent. Cookie/storage settings alone are **not** sufficient proof.
5. Confirm only custom events are emitted; unexpected page views, exceptions, dependencies, browsing data or automatically generated identifiers are grounds to stop rollout and fix instrumentation.
6. Verify custom analytics events cannot stop the quiz when the Azure endpoint is blocked, offline, or slow.
7. Verify PR preview and local hosts do not initialize SDK or send telemetry.

Relevant Microsoft SDK settings to review: `disableCookiesUsage`, `isStorageUseDisabled`, `disableAjaxTracking`, `disableFetchTracking`, `disableExceptionTracking`, `enableAutoRouteTracking: false`, `enableSessionStorageBuffer: false`; plus a **telemetry initializer** that drops all telemetry except an explicit event allowlist and strips unauthorized fields. Verify API names against the pinned SDK version and inspect real network output.

## 7. Query and report

For a first-ingestion check, open the **Application Insights resource → Logs** and run:

```kusto
customEvents
| where timestamp >= ago(1h)
| extend stage = tostring(customDimensions.stage)
| summarize events = sum(itemCount) by name, stage
```

A fresh passed attempt should produce one `quiz_started`, one `quiz_submitted`, and one `certificate_earned`. Intentionally opening the certificate adds `certificate_viewed`; each print click adds `certificate_print_requested`. Intentionally opening redemption information adds `redemption_viewed`. Reloads and resuming an attempt should not add starts or submissions. Counts remain best effort; print requests are not proof of actual printing.

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
- [ ] Existing Azure workflow `env` mapping present on the deployment branch and build inputs verified.
- [ ] `main`/GitHub Pages telemetry stays disabled; PR previews also disabled.
- [ ] Event ingestion and KQL reports validated on production.
- [ ] Full SDK telemetry privacy validation recorded.
- [ ] Parent-facing privacy copy reviewed and updated.
- [ ] Resource inventory, owner access, cost guardrails, retention, and handoff notes completed.

## References

- [Create workspace-based Application Insights resources](https://learn.microsoft.com/en-us/azure/azure-monitor/app/create-workspace-resource)
- [Application Insights JavaScript SDK configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk-configuration)
- [Azure Static Web Apps build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Azure Monitor Logs](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-overview)
- [Application Insights browser monitoring and OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [GitHub Actions configuration variables](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables)
- [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
