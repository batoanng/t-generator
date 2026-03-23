const fallbackAppName = 'my-app';

export const env = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME?.trim() || fallbackAppName,
});
