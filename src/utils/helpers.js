// Token management helpers
export const TOKEN_KEY = 'akwa_ibom_health_token';
export const REFRESH_TOKEN_KEY = 'akwa_ibom_health_refresh_token';
export const USER_KEY = 'akwa_ibom_health_user';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Set refresh token in localStorage
export const setRefreshToken = (refreshToken) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Remove refresh token from localStorage
export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Set user data in localStorage
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Remove user data from localStorage
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Clear all auth data
export const clearAuthData = () => {
  removeToken();
  removeRefreshToken();
  removeUser();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
