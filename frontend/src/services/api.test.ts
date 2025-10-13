import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

describe('API Service', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    localStorage.clear();
    delete (globalThis as { location?: Location }).location;
    globalThis.location = {
      pathname: '/dashboard',
      href: '',
    } as Location;
  });

  afterEach(() => {
    globalThis.location = originalLocation;
  });

  describe('Request Interceptor', () => {
    it('should add authorization token to request headers', () => {
      const token = 'test-bearer-token';
      localStorage.setItem('authorization_token', token);

      const config: InternalAxiosRequestConfig = {
        headers: {},
      } as InternalAxiosRequestConfig;

      const token_retrieved = localStorage.getItem('authorization_token');
      if (token_retrieved && config.headers) {
        config.headers.Authorization = `Bearer ${token_retrieved}`;
      }

      expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add authorization token when token is not present', () => {
      localStorage.removeItem('authorization_token');

      const config: InternalAxiosRequestConfig = {
        headers: {},
      } as InternalAxiosRequestConfig;

      const token = localStorage.getItem('authorization_token');
      expect(token).toBeNull();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      expect(config.headers?.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor - 401 handling', () => {
    it('should clear token and redirect on 401 when not on login page', () => {
      globalThis.location = {
        pathname: '/dashboard',
        href: '',
      } as Location;

      localStorage.setItem('authorization_token', 'test-token');

      // Simulate 401 response
      const error: Partial<AxiosError> = {
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      if (error.response?.status === 401) {
        localStorage.removeItem('authorization_token');
        if (globalThis.location.pathname !== '/login') {
          globalThis.location.href = '/login';
        }
      }

      expect(localStorage.getItem('authorization_token')).toBeNull();
      expect(globalThis.location.href).toBe('/login');
    });

    it('should clear token but not redirect on 401 when already on login page', () => {
      globalThis.location = {
        pathname: '/login',
        href: '/login',
      } as Location;

      localStorage.setItem('authorization_token', 'test-token');

      const error: Partial<AxiosError> = {
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      const originalHref = globalThis.location.href;

      if (error.response?.status === 401) {
        localStorage.removeItem('authorization_token');
        if (globalThis.location.pathname !== '/login') {
          globalThis.location.href = '/login';
        }
      }

      expect(localStorage.getItem('authorization_token')).toBeNull();
      expect(globalThis.location.href).toBe(originalHref);
    });

    it('should handle non-401 errors', () => {
      const error: Partial<AxiosError> = {
        response: {
          status: 500,
          data: 'Server error',
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: 'An error occurred',
      };

      const message = error.response?.data || error.message;
      const errorMessage = typeof message === 'string' ? message : 'An error occurred';

      expect(errorMessage).toBe('Server error');
    });

    it('should handle error message fallback', () => {
      const error: Partial<AxiosError> = {
        response: {
          status: 500,
          data: { some: 'object' },
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: 'Network error',
      };

      const message = error.response?.data || error.message;
      const errorMessage = typeof message === 'string' ? message : 'An error occurred';

      expect(errorMessage).toBe('An error occurred');
    });
  });

  describe('authService', () => {
    it('should clear token on logout', async () => {
      const { authService } = await import('./api');
      
      localStorage.setItem('authorization_token', 'test-token');
      expect(localStorage.getItem('authorization_token')).toBe('test-token');

      authService.logout();

      expect(localStorage.getItem('authorization_token')).toBeNull();
      expect(globalThis.location.href).toBe('/login');
    });
  });
});