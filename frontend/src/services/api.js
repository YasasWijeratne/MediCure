const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const formatUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Token management helpers
const getAccessToken = () => localStorage.getItem('medicure_access_token');
const getRefreshToken = () => localStorage.getItem('medicure_refresh_token');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('medicure_access_token', accessToken);
  if (refreshToken) localStorage.setItem('medicure_refresh_token', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('medicure_access_token');
  localStorage.removeItem('medicure_refresh_token');
  localStorage.removeItem('medicure_auth');
  localStorage.removeItem('medicure_role');
  localStorage.removeItem('medicure_user');
};

// Auto-refresh flag to prevent infinite loops
let isRefreshing = false;
let pendingRequests = [];

const processPending = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingRequests = [];
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(formatUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

const buildHeaders = (extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response, retryFn) => {
  // Access token expired — try to refresh once
  if (response.status === 401) {
    const body = await response.json().catch(() => ({}));
    if (body.code === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then(newToken => retryFn(newToken));
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processPending(null, newToken);
        return retryFn(newToken);
      } catch (err) {
        processPending(err);
        // Dispatch a global event so AuthContext can log the user out
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
    throw new Error(body.message || 'Authentication required. Please log in.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `API error: ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  // Expose token setters for use by AuthContext after login
  setTokens,
  clearTokens,
  getAccessToken,

  async get(endpoint, params = {}) {
    const url = new URL(formatUrl(endpoint));
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const doRequest = async (token) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token || getAccessToken()) headers['Authorization'] = `Bearer ${token || getAccessToken()}`;
      const response = await fetch(url.toString(), { headers });
      return handleResponse(response, (newToken) => doRequest(newToken));
    };

    return doRequest();
  },

  async post(endpoint, data = {}) {
    const doRequest = async (token) => {
      const response = await fetch(formatUrl(endpoint), {
        method: 'POST',
        headers: buildHeaders(token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify(data)
      });
      return handleResponse(response, (newToken) => doRequest(newToken));
    };
    return doRequest();
  },

  async put(endpoint, data = {}) {
    const doRequest = async (token) => {
      const response = await fetch(formatUrl(endpoint), {
        method: 'PUT',
        headers: buildHeaders(token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify(data)
      });
      return handleResponse(response, (newToken) => doRequest(newToken));
    };
    return doRequest();
  },

  async delete(endpoint) {
    const doRequest = async (token) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token || getAccessToken()) headers['Authorization'] = `Bearer ${token || getAccessToken()}`;
      const response = await fetch(formatUrl(endpoint), { method: 'DELETE', headers });
      return handleResponse(response, (newToken) => doRequest(newToken));
    };
    return doRequest();
  }
};
