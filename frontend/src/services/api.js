const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const token = options.token || localStorage.getItem('pju_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: options.credentials || 'include',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchPublicDashboard() {
  return request('/public/dashboard');
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchKpi() {
  return request('/monitoring/kpi');
}

export async function fetchLamps() {
  return request('/lamps?limit=50');
}

export async function sendTelemetry(payload) {
  return request('/iot/telemetry', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export { API_BASE_URL };
