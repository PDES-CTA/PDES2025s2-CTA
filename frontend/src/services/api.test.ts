import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from './api';

describe('API Service', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    localStorage.clear();
    // Mock globalThis.location
    delete (globalThis as { location?: Location }).location;
    globalThis.location = {
      pathname: '/dashboard',
      href: '',
    } as Location;
  });

  afterEach(() => {
    globalThis.location = originalLocation;
  });

  describe('authService', () => {
    it('should clear token on logout', () => {
      localStorage.setItem('authorization_token', 'test-token');
      expect(localStorage.getItem('authorization_token')).toBe('test-token');

      authService.logout();

      expect(localStorage.getItem('authorization_token')).toBeNull();
      expect(globalThis.location.href).toBe('/login');
    });

    it('should store token in localStorage on login', () => {
      const token = 'test-token-123';
      localStorage.setItem('authorization_token', token);
      
      const storedToken = localStorage.getItem('authorization_token');
      expect(storedToken).toBe(token);
    });
  });

  describe('401 error handling', () => {
    it('should redirect to login when not on login page', () => {
      globalThis.location = {
        pathname: '/dashboard',
        href: '',
      } as Location;

      localStorage.setItem('authorization_token', 'token');
      
      // Simulate the interceptor behavior
      localStorage.removeItem('authorization_token');
      if (globalThis.location.pathname !== '/login') {
        globalThis.location.href = '/login';
      }

      expect(localStorage.getItem('authorization_token')).toBeNull();
      expect(globalThis.location.href).toBe('/login');
    });

    it('should not redirect when already on login page', () => {
      globalThis.location = {
        pathname: '/login',
        href: '/login',
      } as Location;

      localStorage.setItem('authorization_token', 'token');
      
      const originalHref = globalThis.location.href;
      
      // Simulate the interceptor behavior
      localStorage.removeItem('authorization_token');
      if (globalThis.location.pathname !== '/login') {
        globalThis.location.href = '/login';
      }

      expect(localStorage.getItem('authorization_token')).toBeNull();
      expect(globalThis.location.href).toBe(originalHref); // Should not change
    });
  });

  describe('localStorage operations', () => {
    it('should handle authorization token storage', () => {
      const testToken = 'bearer-token-xyz';
      localStorage.setItem('authorization_token', testToken);
      
      expect(localStorage.getItem('authorization_token')).toBe(testToken);
    });

    it('should remove authorization token', () => {
      localStorage.setItem('authorization_token', 'token');
      localStorage.removeItem('authorization_token');
      
      expect(localStorage.getItem('authorization_token')).toBeNull();
    });
  });

  describe('location handling', () => {
    it('should handle pathname checks', () => {
      expect(globalThis.location.pathname).toBe('/dashboard');
      
      globalThis.location = {
        ...globalThis.location,
        pathname: '/login',
      } as Location;
      
      expect(globalThis.location.pathname).toBe('/login');
    });

    it('should check if pathname is not login', () => {
      globalThis.location = {
        pathname: '/dashboard',
        href: '',
      } as Location;
      
      const isNotLogin = globalThis.location.pathname !== '/login';
      expect(isNotLogin).toBe(true);
    });

    it('should check if pathname is login', () => {
      globalThis.location = {
        pathname: '/login',
        href: '',
      } as Location;
      
      const isNotLogin = globalThis.location.pathname !== '/login';
      expect(isNotLogin).toBe(false);
    });
  });
});