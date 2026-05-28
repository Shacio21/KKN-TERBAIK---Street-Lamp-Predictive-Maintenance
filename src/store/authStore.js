import { create } from 'zustand';
import api from '../lib/axios';

/**
 * Auth store — manages authentication state.
 * Access token is stored in memory (window.__pju_access_token) for XSS protection.
 * Refresh token is in HttpOnly cookie (handled by browser automatically).
 */
const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isLoading: true, // true until initial auth check completes
  error: null,

  // ── Actions ────────────────────────────────────────────────

  /**
   * Login with credentials. Stores access token in memory.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { access_token, user } = data;

      // Store access token in memory (not localStorage — anti-XSS)
      window.__pju_access_token = access_token;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.detail || 'Login gagal. Periksa email dan password Anda.';
      set({ isLoading: false, error: message });
      return { success: false, error: message, status: error.response?.status, data: error.response?.data };
    }
  },

  /**
   * Register new user account.
   */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registrasi gagal.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Logout — revoke refresh token, clear state.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors during logout
    }
    window.__pju_access_token = null;
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Set access token directly (used by refresh interceptor).
   */
  setAccessToken: (token) => {
    window.__pju_access_token = token;
  },

  /**
   * Check auth status on app load — try to refresh token.
   */
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Try refreshing the token (cookie sent automatically)
      const { data } = await api.post('/auth/refresh');
      window.__pju_access_token = data.access_token;

      // Fetch user profile
      const { data: user } = await api.get('/users/me');

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Not authenticated — that's okay
      window.__pju_access_token = null;
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Update user profile in state.
   */
  setUser: (user) => set({ user }),

  /**
   * Clear error.
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
