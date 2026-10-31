import { eventProperties, isLocalHost, routeProperties, validateAnalyticsConfig } from './analytics-policy.js';

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

// Ensure COPPA / GDPR-K anonymity: allow only approved aggregate events and route
// pageviews, stripping SDK user/session/device identifiers and query strings.
export function sanitizeTelemetry(item) {
  if (item.baseType === 'EventData') {
    const properties = eventProperties(item.baseData?.name, item.baseData?.properties);
    if (!properties) return false;
    item.baseData = { name: item.baseData.name, properties };
  } else if (item.baseType === 'PageviewData') {
    const page = routeProperties(item.baseData?.name);
    if (!page) return false;
    item.baseData = { name: page.name, uri: page.uri };
  } else {
    return false;
  }
  for (const key of Object.keys(item)) {
    if (!['name', 'time', 'iKey', 'baseType', 'baseData', 'tags', 'ext', 'data'].includes(key)) delete item[key];
  }
  item.tags = [];
  item.ext = {};
  item.data = {};
  return true;
}

export function createAnalytics({ hostname = () => globalThis.location?.hostname, load = loadSdk } = {}) {
  let client;
  let pending;
  const queue = [];

  function enqueueOrSend(action) {
    if (!pending) return;
    if (client) action(client);
    else if (queue.length < 50) queue.push(action);
  }

  function track(name, props = {}) {
    try {
      const properties = eventProperties(name, props);
      if (!properties) return;
      enqueueOrSend((sdk) => sdk.trackEvent({ name, properties }));
    } catch { /* Telemetry must never interrupt learning. */ }
  }

  function trackPageView(route) {
    try {
      const page = routeProperties(route);
      if (!page) return;
      enqueueOrSend((sdk) => sdk.trackPageView({ ...page, properties: { duration: 0 } }));
    } catch { /* Telemetry must never interrupt learning. */ }
  }

  function initializeAnalytics(config) {
    if (pending) return pending;
    try {
      config = validateAnalyticsConfig(config);
      if (!config.enabled || isLocalHost(hostname())) return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
    pending = Promise.resolve().then(load).then((ApplicationInsights) => {
      const sdk = new ApplicationInsights({
        config: {
          connectionString: config.connectionString,
          disableCookiesUsage: true,
          isStorageUseDisabled: true,
          enableSessionStorageBuffer: false,
          disableAjaxTracking: true,
          disableFetchTracking: true,
          disableExceptionTracking: true,
          enableAutoRouteTracking: false,
          isRetryDisabled: true,
          extensionConfig: { AppInsightsCfgSyncPlugin: { blkCdnCfg: true, syncMode: 0 } }
        }
      });
      sdk.addTelemetryInitializer(sanitizeTelemetry);
      sdk.loadAppInsights();
      client = sdk;
      for (const send of queue.splice(0)) send(sdk);
    }).catch(() => { queue.length = 0; });
    return pending;
  }

  return { initializeAnalytics, track, trackPageView };
}

const analytics = createAnalytics();
export const initializeAnalytics = analytics.initializeAnalytics;
export const track = analytics.track;
export const trackPageView = analytics.trackPageView;
