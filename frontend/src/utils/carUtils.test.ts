import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatDate,
  formatMileage,
  getFuelTypeClass,
  getTransmissionClass,
  getFuelTypeLabel,
  getTransmissionLabel,
} from './carUtils';

describe('carUtils', () => {
  describe('formatPrice', () => {
    it('should format price', () => {
      expect(formatPrice(25000)).toContain('25');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeTruthy();
    });

    it('should format Date object', () => {
      const result = formatDate(new Date('2024-01-15'));
      expect(result).toBeTruthy();
    });
  });

  describe('formatMileage', () => {
    it('should format mileage', () => {
      const result = formatMileage(50000);
      expect(result).toContain('50');
      expect(result).toContain('km');
    });
  });

  describe('getFuelTypeClass', () => {
    it('should return class for NAFTA', () => {
      expect(getFuelTypeClass('NAFTA')).toBe('fuel-nafta');
    });

    it('should return class for DIESEL', () => {
      expect(getFuelTypeClass('DIESEL')).toBe('fuel-diesel');
    });

    it('should return class for HIBRIDO', () => {
      expect(getFuelTypeClass('HIBRIDO')).toBe('fuel-hybrid');
    });

    it('should return class for ELECTRICO', () => {
      expect(getFuelTypeClass('ELECTRICO')).toBe('fuel-electric');
    });

    it('should return class for GNC', () => {
      expect(getFuelTypeClass('GNC')).toBe('fuel-gnc');
    });
  });

  describe('getTransmissionClass', () => {
    it('should return class for MANUAL', () => {
      expect(getTransmissionClass('MANUAL')).toBe('transmission-manual');
    });

    it('should return class for AUTOMATICA', () => {
      expect(getTransmissionClass('AUTOMATICA')).toBe('transmission-auto');
    });

    it('should return class for SEMI_AUTOMATICA', () => {
      expect(getTransmissionClass('SEMI_AUTOMATICA')).toBe('transmission-semi');
    });
  });

  describe('getFuelTypeLabel', () => {
    it('should return label for NAFTA', () => {
      expect(getFuelTypeLabel('NAFTA')).toBe('Nafta');
    });

    it('should return label for DIESEL', () => {
      expect(getFuelTypeLabel('DIESEL')).toBe('Diesel');
    });

    it('should return label for HIBRIDO', () => {
      expect(getFuelTypeLabel('HIBRIDO')).toBe('Híbrido');
    });

    it('should return label for ELECTRICO', () => {
      expect(getFuelTypeLabel('ELECTRICO')).toBe('Eléctrico');
    });

    it('should return label for GNC', () => {
      expect(getFuelTypeLabel('GNC')).toBe('GNC');
    });
  });

  describe('getTransmissionLabel', () => {
    it('should return label for MANUAL', () => {
      expect(getTransmissionLabel('MANUAL')).toBe('Manual');
    });

    it('should return label for AUTOMATICA', () => {
      expect(getTransmissionLabel('AUTOMATICA')).toBe('Automática');
    });

    it('should return label for SEMI_AUTOMATICA', () => {
      expect(getTransmissionLabel('SEMI_AUTOMATICA')).toBe('Semi-automática');
    });
  });
});