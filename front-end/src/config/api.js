export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://resumy-api.duckdns.org'
    : 'http://127.0.0.1:5000');
