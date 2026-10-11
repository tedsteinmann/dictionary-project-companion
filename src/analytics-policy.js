const stageEvents = new Set(['quiz_started', 'quiz_submitted', 'certificate_earned',
  'certificate_viewed', 'certificate_print_requested']);

export function eventProperties(name, props = {}) {
  if (name === 'redemption_viewed') return {};
  if (!stageEvents.has(name) || !props || ![1, 2, 3].includes(props.stage)) return null;
  if (name === 'quiz_submitted' && typeof props.passed !== 'boolean') return null;
  return name === 'quiz_submitted' ? { stage: props.stage, passed: props.passed } : { stage: props.stage };
}

export function validHost(host) {
  return typeof host === 'string' && host.length <= 253 &&
    /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(host) &&
    host.split('.').every((label) => label.length <= 63) &&
    !/(^|\.)(localhost|local|test|invalid)$/.test(host) &&
    !/\.azurestaticapps\.net$/.test(host);
}

export function validateAnalyticsConfig(config) {
  if (config?.enabled !== true) return { enabled: false };
  const connectionString = config.connectionString;
  if (typeof connectionString !== 'string' || connectionString.length > 4096) throw new Error('Invalid analytics connection string.');
  const entries = connectionString.split(';').filter(Boolean).map((part) => part.split('='));
  const fields = Object.fromEntries(entries);
  if (entries.some(([key, value, extra]) => !key || !value || extra !== undefined) ||
      new Set(entries.map(([key]) => key)).size !== entries.length ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fields.InstrumentationKey || '')) {
    throw new Error('Analytics requires a valid Application Insights connection string.');
  }
  // Use an explicit ingestion endpoint; reject credentials, query strings and arbitrary fields.
  if (entries.some(([key]) => !['InstrumentationKey', 'IngestionEndpoint', 'LiveEndpoint', 'ApplicationId'].includes(key))) {
    throw new Error('Unsupported analytics connection string field.');
  }
  for (const [key, hostnameSuffix] of [
    ['IngestionEndpoint', '.applicationinsights.azure.com'],
    ['LiveEndpoint', '.livediagnostics.monitor.azure.com']
  ]) {
    if (!fields[key] && key === 'LiveEndpoint') continue;
    let endpoint;
    try { endpoint = new URL(fields[key]); } catch { throw new Error('Analytics requires an HTTPS ingestion endpoint.'); }
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.port ||
        !endpoint.hostname.endsWith(hostnameSuffix) || endpoint.pathname !== '/') {
      throw new Error('Analytics endpoint must be an Azure Application Insights HTTPS endpoint.');
    }
  }
  if (!Array.isArray(config.allowedHosts) || !config.allowedHosts.length || !config.allowedHosts.every(validHost)) {
    throw new Error('Analytics requires exact production hosts; local and Azure preview hosts are forbidden.');
  }
  return { enabled: true, connectionString, allowedHosts: [...new Set(config.allowedHosts)] };
}
