import { eventProperties, validateAnalyticsConfig } from './analytics-policy.js';

async function loadSdk() {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('./vendor/ai.min.js', import.meta.url).href;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  return globalThis.Microsoft.ApplicationInsights.ApplicationInsights;
}

// Runs after the SDK's context plugin and before its sender. Rebuild rather than
// selectively deleting known identifiers, so new SDK fields cannot leak through.
export function sanitizeTelemetry(item) {
  if (item.baseType !== 'EventData') return false;
  const properties = eventProperties(item.baseData?.name, item.baseData?.properties);
  if (!properties) return false;
  const name = item.baseData.name;
  for (const key of Object.keys(item)) {
    if (!['name', 'time', 'iKey', 'baseType', 'baseData', 'tags', 'ext', 'data'].includes(key)) delete item[key];
  }
  item.baseData = { name, properties };
  item.tags = [];
  item.ext = {};
  item.data = {};
  return true;
}

export function createAnalytics({ hostname = () => globalThis.location?.hostname, load = loadSdk } = {}) {
  let client;
  let pending;
  const queue = [];
  function track(name, props = {}) {
    try {
      const properties = eventProperties(name, props);
      if (!properties || !pending) return;
      if (client) client.trackEvent({ name, properties });
      else if (queue.length < 50) queue.push({ name, properties });
    } catch { /* Telemetry must never interrupt learning. */ }
  }
  function initializeAnalytics(config) {
    if (pending) return pending;
    try {
      config = validateAnalyticsConfig(config);
      if (!config.enabled || !config.allowedHosts.includes(hostname())) return Promise.resolve();
    } catch { return Promise.resolve(); }
    pending = Promise.resolve().then(load).then((ApplicationInsights) => {
      const sdk = new ApplicationInsights({ config: {
        connectionString: config.connectionString,
        disableCookiesUsage: true, isStorageUseDisabled: true,
        disableAjaxTracking: true, disableFetchTracking: true,
        disableExceptionTracking: true, enableAutoRouteTracking: false,
        enableSessionStorageBuffer: false, autoTrackPageVisitTime: false,
        enablePerfMgr: false,
        isRetryDisabled: true,
        alwaysUseXhrOverride: true,
        httpXHROverride: { sendPOST(payload, complete) {
          // Explicit transport policy excludes cookies and Referer headers.
          fetch(payload.urlString, {
            method: 'POST', body: payload.data, headers: payload.headers,
            credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true
          }).then(async (response) => complete(response.status, {}, await response.text()))
            .catch(() => complete(0, {}, ''));
        } },
        diagnosticLogInterval: 0, loggingLevelConsole: 0, loggingLevelTelemetry: 0,
        extensionConfig: { AppInsightsCfgSyncPlugin: { blkCdnCfg: true, syncMode: 0 } },
        featureOptIn: { sdkStats: { mode: 2 } }
      } });
      sdk.addTelemetryInitializer(sanitizeTelemetry);
      sdk.loadAppInsights();
      client = sdk;
      for (const event of queue.splice(0)) track(event.name, event.properties);
    }).catch(() => { queue.length = 0; });
    return pending;
  }
  return { initializeAnalytics, track };
}

const analytics = createAnalytics();
export const initializeAnalytics = analytics.initializeAnalytics;
export const track = analytics.track;
