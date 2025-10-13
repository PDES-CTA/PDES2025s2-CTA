import { describe, it, expect } from 'vitest';
import { authService } from './api';

describe('API Service', () => {
  it('should clear token and redirect on logout', () => {
    const originalLocation = globalThis.location;
    
    delete (globalThis as { location?: Location }).location;
    globalThis.location = {
      pathname: '/dashboard',
      href: '',
    } as Location;

    localStorage.setItem('authorization_token', 'test-token');

    authService.logout();

    expect(localStorage.getItem('authorization_token')).toBeNull();
    expect(globalThis.location.href).toBe('/login');

    globalThis.location = originalLocation;
  });
});