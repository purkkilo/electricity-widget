import { formatDate, formatHourRange } from '../format';
import { DateTime } from 'luxon';

describe('Format Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly for single digit month and day', () => {
      const date = DateTime.fromISO('2024-01-05T14:30:00');
      const result = formatDate(date);
      expect(result).toBe('2024/01-05');
    });

    it('should format date correctly for double digit month and day', () => {
      const date = DateTime.fromISO('2024-11-25T14:30:00');
      const result = formatDate(date);
      expect(result).toBe('2024/11-25');
    });

    it('should format date correctly for edge cases', () => {
      // New Year's Day
      const newYear = DateTime.fromISO('2024-01-01T00:00:00');
      expect(formatDate(newYear)).toBe('2024/01-01');

      // New Year's Eve
      const newYearEve = DateTime.fromISO('2024-12-31T23:59:59');
      expect(formatDate(newYearEve)).toBe('2024/12-31');

      // Leap year date
      const leapYear = DateTime.fromISO('2024-02-29T12:00:00');
      expect(formatDate(leapYear)).toBe('2024/02-29');
    });

    it('should handle different years correctly', () => {
      const date2023 = DateTime.fromISO('2023-06-15T14:30:00');
      expect(formatDate(date2023)).toBe('2023/06-15');

      const date2025 = DateTime.fromISO('2025-06-15T14:30:00');
      expect(formatDate(date2025)).toBe('2025/06-15');
    });

    it('should pad single digit months with zero', () => {
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      months.forEach(month => {
        const date = DateTime.fromISO(`2024-${month.toString().padStart(2, '0')}-15T14:30:00`);
        const result = formatDate(date);
        if (month < 10) {
          expect(result).toBe(`2024/0${month}-15`);
        } else {
          expect(result).toBe(`2024/${month}-15`);
        }
      });
    });

    it('should pad single digit days with zero', () => {
      const days = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      days.forEach(day => {
        const date = DateTime.fromISO(`2024-06-${day.toString().padStart(2, '0')}T14:30:00`);
        const result = formatDate(date);
        if (day < 10) {
          expect(result).toBe(`2024/06-0${day}`);
        } else {
          expect(result).toBe(`2024/06-${day}`);
        }
      });
    });
  });

  describe('formatHourRange', () => {
    // Mock DateTime.fromISO for this test suite
    beforeEach(() => {
      const originalDateTime = jest.requireActual('luxon').DateTime;
      (DateTime.fromISO as jest.Mock) = jest.fn((iso: string) => {
        // Extract hour from ISO string
        const match = iso.match(/T(\d{2}):/); 
        const hour = match ? parseInt(match[1], 10) : 0;
        return {
          get: (unit: string) => unit === 'hour' ? hour : 0
        };
      });
    });

    it('should format single digit hours with leading zeros', () => {
      const start = '2024-01-15T08:00:00Z';
      const end = '2024-01-15T09:00:00Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('08 - 09');
    });

    it('should format double digit hours correctly', () => {
      const start = '2024-01-15T14:00:00Z';
      const end = '2024-01-15T15:00:00Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('14 - 15');
    });

    it('should handle midnight hours', () => {
      const start = '2024-01-15T00:00:00Z';
      const end = '2024-01-15T01:00:00Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('00 - 01');
    });

    it('should handle late night hours', () => {
      const start = '2024-01-15T23:00:00Z';
      const end = '2024-01-16T00:00:00Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('23 - 00');
    });

    it('should handle noon hours', () => {
      const start = '2024-01-15T12:00:00Z';
      const end = '2024-01-15T13:00:00Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('12 - 13');
    });

    it('should handle mixed single and double digit hours', () => {
      const start = '2024-01-15T09:00:00Z';
      const end = '2024-01-15T10:00:00Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('09 - 10');
    });

    it('should work with different date formats', () => {
      // Test with different ISO string formats
      const start1 = '2024-01-15T08:00:00.000Z';
      const end1 = '2024-01-15T09:00:00.000Z';
      expect(formatHourRange(start1, end1)).toBe('08 - 09');

      const start2 = '2024-01-15T08:00:00+00:00';
      const end2 = '2024-01-15T09:00:00+00:00';
      expect(formatHourRange(start2, end2)).toBe('08 - 09');
    });

    it('should handle all 24 hours of the day', () => {
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        const nextHour = ((hour + 1) % 24).toString().padStart(2, '0');
        
        const start = `2024-01-15T${hourStr}:00:00Z`;
        const end = hour === 23 
          ? `2024-01-16T00:00:00Z` 
          : `2024-01-15T${nextHour}:00:00Z`;
        
        const result = formatHourRange(start, end);
        
        if (hour < 10) {
          expect(result).toBe(`0${hour} - ${nextHour}`);
        } else {
          expect(result).toBe(`${hourStr} - ${nextHour}`);
        }
      }
    });

    it('should ignore minutes and seconds', () => {
      const start = '2024-01-15T08:30:45Z';
      const end = '2024-01-15T09:45:30Z';
      const result = formatHourRange(start, end);
      expect(result).toBe('08 - 09');
    });

    it('should handle timezone information', () => {
      const start = '2024-01-15T08:00:00+02:00';
      const end = '2024-01-15T09:00:00+02:00';
      const result = formatHourRange(start, end);
      expect(result).toBe('08 - 09');
    });
  });
});
