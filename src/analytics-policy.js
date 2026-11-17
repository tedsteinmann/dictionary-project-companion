export const ANALYTICS_START_DATE = '2026-10-30';
export const ANALYTICS_START_DATE_DISPLAY = 'October 30, 2026';

const stageEvents = new Set([
  'quiz_started',
  'quiz_submitted',
  'certificate_earned',
  'certificate_viewed',
  'certificate_print_requested'
]);

export const allowedRoutes = new Set([
  'home', 'intro', 'levels', 'challenge', 'review', 'results', 'certificate',
  'about', 'sponsors', 'libraries', 'redeem', 'contact', 'privacy'
]);

export function eventProperties(name, props = {}) {
  if (name === 'redemption_viewed') return {};
  if (!stageEvents.has(name) || !props || ![1, 2, 3].includes(props.stage)) return null;
  if (name === 'quiz_submitted' && typeof props.passed !== 'boolean') return null;
  return name === 'quiz_submitted'
    ? { stage: props.stage, passed: props.passed }
    : { stage: props.stage };
}

export function routeProperties(route) {
  if (typeof route !== 'string' || !allowedRoutes.has(route)) return null;
  return { name: route, uri: route === 'home' ? '/' : `/#${route}` };
}

export function isLocalHost(hostname = '') {
  return (
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    /^(?:.*\.)?(?:localhost|local|test|invalid)$/i.test(hostname)
  );
}

export function validateAnalyticsConfig(config) {
  if (config?.enabled !== true) return { enabled: false };
  const connectionString = typeof config.connectionString === 'string' ? config.connectionString.trim() : '';
  if (
    !connectionString ||
    connectionString.length > 4096 ||
    !/InstrumentationKey=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(connectionString)
  ) {
    throw new Error('Analytics requires a valid Application Insights connection string.');
  }
  return { enabled: true, connectionString };
}
