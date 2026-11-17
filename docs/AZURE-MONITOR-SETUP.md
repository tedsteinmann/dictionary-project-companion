# Azure Monitor Setup — FM Rotary Dictionary Challenge

**Scope:** Application Insights, workspace, monitoring, and operator-entered GitHub deployment settings.  
**Target site:** `fm-rotary-foundation` branch, existing Azure Static Web Apps deployment.  
**Implementation source:** reusable analytics code on `main`, enabled per deployment branch.  
**Tracking start date:** October 30, 2026 (documented publicly on `#privacy`).

> **Important:** Azure Static Web Apps **runtime application settings do not automatically configure a static frontend built by GitHub Actions/Oryx**. Enter the settings in GitHub Actions; the Azure workflow maps `ANALYTICS_ENABLED` and `APPLICATIONINSIGHTS_CONNECTION_STRING` into the deploy action's build environment.

## 1. Resource inventory

| Resource | Example Azure name | Role |
| --- | --- | --- |
| Log Analytics workspace | `log-dictionary-fmrotary` | Stores Application Insights events and allows KQL queries |
| Workspace-based Application Insights | `appi-dictionary-fmrotary` | Receives the browser SDK telemetry |
| Azure Workbook (optional) | `Dictionary Engagement - FM Rotary` | Saved graphical reporting; deploy later |

## 2. Manually create the workspace

1. Sign in to [Azure Portal](https://portal.azure.com/).
2. Search for **Log Analytics workspaces** → **Create**.
3. Choose the subscription and resource group; give the workspace a customer-specific name such as `log-dictionary-fmrotary` and region.
4. Review and create.
5. Check **Usage and estimated costs**, default retention, workspace daily cap, and budget alerts.

## 3. Manually create Application Insights

1. In Azure Portal, search for **Application Insights** → **Create**.
2. Choose the same subscription and resource group; name it `appi-dictionary-fmrotary`.
3. Select **workspace-based** Application Insights and link the newly created Log Analytics workspace.
4. If the creation form offers **OTLP support**, leave it **Off**. This site uses the Application Insights JavaScript browser SDK (`@microsoft/applicationinsights-web`).
5. After deployment, open the Application Insights resource → **Overview** or **Properties** and copy the **Connection String**.

## 4. Configure GitHub Actions settings

Open `tedsteinmann/dictionary-project-companion` → **Settings** → **Secrets and variables** → **Actions**.

| GitHub setting | Location | Value |
| --- | --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Repository (or branch environment) secret | Paste Azure's Application Insights connection string |
| `ANALYTICS_ENABLED` | Repository (or branch environment) variable | `true` to enable on the Azure deployment branch (`false` to disable) |

## 5. Deploy and verify the build configuration

The `.github/workflows/azure-static-web-apps-witty-water-0a5a5ad10.yml` workflow maps the two settings under **Build And Deploy**:

```yaml
        env:
          APPLICATIONINSIGHTS_CONNECTION_STRING: ${{ secrets.APPLICATIONINSIGHTS_CONNECTION_STRING }}
          ANALYTICS_ENABLED: ${{ vars.ANALYTICS_ENABLED }}
```

1. Ensure the analytics implementation and workflow mapping are on `fm-rotary-foundation`. GitHub Pages on `main` does not pass these variables and remains disabled (`{"enabled":false}`).
2. Run the **Azure Static Web Apps CI/CD** workflow on `fm-rotary-foundation`.
3. Confirm **Build And Deploy** succeeds and verify `/#privacy` shows `October 30, 2026 (active on this deployment)`.
4. Local preview URLs (`localhost`, `127.0.0.1`) automatically skip loading the SDK even if built with `ANALYTICS_ENABLED=true`.

## 6. Query and report

In **Application Insights → Logs**, verify custom events and anonymous route views:

```kusto
customEvents
| where timestamp >= ago(1h)
| extend stage = tostring(customDimensions.stage)
| summarize events = sum(itemCount) by name, stage
```

```kusto
pageViews
| where timestamp >= ago(1h)
| summarize views = sum(itemCount) by name, url
| order by views desc
```
