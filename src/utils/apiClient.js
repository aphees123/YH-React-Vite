import { createBrowserHistory } from 'history';

// A custom error class for authentication errors that should trigger a logout
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

// History package allows navigation from outside a React component (like this utility file)
const history = createBrowserHistory();

// ✅ UPDATED: Hardcoded the API base URL directly as requested.
// NOTE: Using an environment variable (import.meta.env.VITE_API_URL) is the recommended practice for production.
const API_BASE_URL = "http://backend-staging-alb-928761586.ap-southeast-2.elb.amazonaws.com";

// This promise will manage concurrent requests during a token refresh
let refreshTokenPromise = null;

// The main API client function
export const apiClient = async (url, options = {}) => {
  // Construct the full URL
  const fullUrl = `${API_BASE_URL}${url}`;
  
  let token = localStorage.getItem('accessToken');
  console.log(token,"token")
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(fullUrl, { ...options, headers });

  if (response.status === 401) {
    if (!refreshTokenPromise) {
      refreshTokenPromise = getNewToken();
    }
    
    try {
      const newToken = await refreshTokenPromise;
      refreshTokenPromise = null;

      // Retry the original request with the new token
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(fullUrl, { ...options, headers });

    } catch (refreshError) {
      // This function now lives inside the Sidebar component, but we can still call a local version for API errors.
      handleApiLogout(); 
      throw new AuthError('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  if (response.status === 204) return null;
  return response.json();
};

async function getNewToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, { // IMPORTANT: Use your actual refresh endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token.');
    }

    const data = await response.json();
    const newAccessToken = data.token; // IMPORTANT: Confirm this key from your API response

    localStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;

  } catch (error) {
    console.error("Refresh token failed:", error);
    throw error; // Propagate error to trigger logout
  }
}

// This is a local logout handler specifically for API-triggered logouts (e.g., refresh token fails)
function handleApiLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  
  history.push('/login');
  window.location.reload();
}

