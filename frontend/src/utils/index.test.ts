import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatKilometers,
  formatDate,
  isValidEmail,
  isValidDNI,
  isValidCUIT,
  isValidPhone,
  truncateText,
  cleanObject,
  debounce,
} from './index';

describe('Formatters', () => {
  describe('formatPrice', () => {
    it('should format price in ARS currency', () => {
      const result = formatPrice(1000);
      expect(result).toContain('$');
      expect(result).toContain('1');
    });

    it('should return "-" for null', () => {
      expect(formatPrice(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatPrice(undefined)).toBe('-');
    });

    it('should format zero', () => {
      expect(formatPrice(0)).toContain('0');
    });
  });

  describe('formatKilometers', () => {
    it('should format kilometers', () => {
      expect(formatKilometers(1000)).toBe('1.000 km');
    });

    it('should return "0 km" for null', () => {
      expect(formatKilometers(null)).toBe('0 km');
    });

    it('should return "0 km" for undefined', () => {
      expect(formatKilometers(undefined)).toBe('0 km');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024');
    });

    it('should format Date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('2024');
    });

    it('should return "-" for null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });
  });
});

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(isValidEmail('test @example.com')).toBe(false);
    });

    it('should reject email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });

    it('should accept email with special characters', () => {
      expect(isValidEmail('test.name+tag@example.co.uk')).toBe(true);
    });
  });

  describe('isValidDNI', () => {
    it('should validate 8 digit DNI', () => {
      expect(isValidDNI('12345678')).toBe(true);
    });

    it('should validate 7 digit DNI', () => {
      expect(isValidDNI('1234567')).toBe(true);
    });

    it('should reject 6 digit DNI', () => {
      expect(isValidDNI('123456')).toBe(false);
    });

    it('should reject 9 digit DNI', () => {
      expect(isValidDNI('123456789')).toBe(false);
    });

    it('should handle DNI with dots', () => {
      expect(isValidDNI('12.345.678')).toBe(true);
    });
  });

  describe('isValidCUIT', () => {
    it('should validate 11 digit CUIT', () => {
      expect(isValidCUIT('20123456789')).toBe(true);
    });

    it('should handle CUIT with hyphens', () => {
      expect(isValidCUIT('20-12345678-9')).toBe(true);
    });

    it('should reject invalid length', () => {
      expect(isValidCUIT('123456789')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate 10 digit phone', () => {
      expect(isValidPhone('1123456789')).toBe(true);
    });

    it('should reject 9 digit phone', () => {
      expect(isValidPhone('112345678')).toBe(false);
    });

    it('should handle phone with spaces', () => {
      expect(isValidPhone('11 2345 6789')).toBe(true);
    });
  });
});

describe('Helpers', () => {
  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello')).toBe('Hello');
    });

    it('should truncate long text', () => {
      const longText = 'a'.repeat(150);
      const result = truncateText(longText, 100);
      expect(result).toBe('a'.repeat(100) + '...');
    });

    it('should return empty string for null', () => {
      expect(truncateText(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(truncateText(undefined)).toBe('');
    });
  });

  describe('cleanObject', () => {
    it('should remove null values', () => {
      const obj = { a: 1, b: null, c: 3 };
      expect(cleanObject(obj)).toEqual({ a: 1, c: 3 });
    });

    it('should remove undefined values', () => {
      const obj = { a: 1, b: undefined, c: 3 };
      expect(cleanObject(obj)).toEqual({ a: 1, c: 3 });
    });

    it('should remove empty strings', () => {
      const obj = { a: 1, b: '', c: 3 };
      expect(cleanObject(obj)).toEqual({ a: 1, c: 3 });
    });

    it('should keep zero values', () => {
      const obj = { a: 0, b: null };
      expect(cleanObject(obj)).toEqual({ a: 0 });
    });

    it('should keep false values', () => {
      const obj = { a: false, b: null };
      expect(cleanObject(obj)).toEqual({ a: false });
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let count = 0;
      const increment = () => count++;
      const debounced = debounce(increment, 100);

      debounced();
      debounced();
      debounced();

      expect(count).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(count).toBe(1);
    });
  });
});