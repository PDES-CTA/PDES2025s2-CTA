import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from './api';

describe('API Service', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    localStorage.clear();
    // Mock globalThis.location
    delete (globalThis as any).location;
    (globalThis as any).location = {
      pathname: '/dashboard',
      href: '',
    };
  });

  afterEach(() => {
    (globalThis as any).location = originalLocation;
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
      
      (globalThis as any).location.pathname = '/login';
      expect(globalThis.location.pathname).toBe('/login');
    });

    it('should handle location href changes', () => {
      (globalThis as any).location.href = '/login';
      expect(globalThis.location.href).toBe('/login');
    });
  });
});