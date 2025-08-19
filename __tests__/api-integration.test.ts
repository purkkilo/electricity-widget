import { getPricesForDate } from '../utils/api';
import { formatDate } from '../utils/format';
import { DateTime } from 'luxon';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API and Format Integration', () => {
    it('should format date correctly and use it in API call', async () => {
      const testDate = DateTime.fromISO('2024-01-15T14:30:00');
      const expectedUrl = 'https://www.sahkonhintatanaan.fi/api/v1/prices/2024/01-15.json';
      
      const mockPriceData = [
        {
          time_start: '2024-01-15T00:00:00Z',
          time_end: '2024-01-15T01:00:00Z',
          EUR_per_kWh: 0.08,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockPriceData),
      });

      const result = await getPricesForDate(testDate);

      // Verify the date formatting matches what's expected in the API call
      const formattedDate = formatDate(testDate);
      expect(formattedDate).toBe('2024/01-15');
      
      // Verify the API was called with the correctly formatted URL
      expect(fetch).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockPriceData);
    });

    it('should work with edge case dates in API calls', async () => {
      const testCases = [
        {
          date: DateTime.fromISO('2024-01-01T00:00:00'),
          expectedUrl: 'https://www.sahkonhintatanaan.fi/api/v1/prices/2024/01-01.json',
          description: 'New Year\'s Day',
        },
        {
          date: DateTime.fromISO('2024-12-31T23:59:59'),
          expectedUrl: 'https://www.sahkonhintatanaan.fi/api/v1/prices/2024/12-31.json',
          description: 'New Year\'s Eve',
        },
        {
          date: DateTime.fromISO('2024-02-29T12:00:00'),
          expectedUrl: 'https://www.sahkonhintatanaan.fi/api/v1/prices/2024/02-29.json',
          description: 'Leap year date',
        },
      ];

      for (const testCase of testCases) {
        (fetch as jest.Mock).mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve([]),
        });

        await getPricesForDate(testCase.date);

        expect(fetch).toHaveBeenCalledWith(testCase.expectedUrl);
      }
    });

    it('should handle API response with correct price data structure', async () => {
      const testDate = DateTime.fromISO('2024-01-15T14:30:00');
      
      // Mock realistic price data with proper time ranges
      const mockPriceData = [
        {
          time_start: '2024-01-15T00:00:00Z',
          time_end: '2024-01-15T01:00:00Z',
          EUR_per_kWh: 0.08,
        },
        {
          time_start: '2024-01-15T01:00:00Z',
          time_end: '2024-01-15T02:00:00Z',
          EUR_per_kWh: 0.09,
        },
        {
          time_start: '2024-01-15T14:00:00Z',
          time_end: '2024-01-15T15:00:00Z',
          EUR_per_kWh: 0.15,
        },
        {
          time_start: '2024-01-15T23:00:00Z',
          time_end: '2024-01-16T00:00:00Z',
          EUR_per_kWh: 0.12,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockPriceData),
      });

      const result = await getPricesForDate(testDate);

      expect(result).toEqual(mockPriceData);
      
      // Verify the structure of the returned data
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      
      result?.forEach(price => {
        expect(price).toHaveProperty('time_start');
        expect(price).toHaveProperty('time_end');
        expect(price).toHaveProperty('EUR_per_kWh');
        expect(typeof price.time_start).toBe('string');
        expect(typeof price.time_end).toBe('string');
        expect(typeof price.EUR_per_kWh).toBe('number');
      });
    });

    it('should handle full day price data (24 hours)', async () => {
      const testDate = DateTime.fromISO('2024-01-15T14:30:00');
      
      // Generate 24 hours of mock price data
      const mockPriceData = [];
      for (let hour = 0; hour < 24; hour++) {
        const startHour = hour.toString().padStart(2, '0');
        const endHour = hour === 23 ? '00' : (hour + 1).toString().padStart(2, '0');
        const endDate = hour === 23 ? '2024-01-16' : '2024-01-15';
        
        mockPriceData.push({
          time_start: `2024-01-15T${startHour}:00:00Z`,
          time_end: `${endDate}T${endHour}:00:00Z`,
          EUR_per_kWh: Math.random() * 0.3 + 0.05, // Random price between 0.05 and 0.35
        });
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockPriceData),
      });

      const result = await getPricesForDate(testDate);

      expect(result).toHaveLength(24);
      expect(result?.[0].time_start).toBe('2024-01-15T00:00:00Z');
      expect(result?.[0].time_end).toBe('2024-01-15T01:00:00Z');
      expect(result?.[23].time_start).toBe('2024-01-15T23:00:00Z');
      expect(result?.[23].time_end).toBe('2024-01-16T00:00:00Z');
    });

    it('should handle API error scenarios with proper error logging', async () => {
      const testDate = DateTime.fromISO('2024-01-15T14:30:00');
      
      const errorScenarios = [
        {
          error: new Error('Network timeout'),
          description: 'Network timeout error',
        },
        {
          error: new Error('DNS resolution failed'),
          description: 'DNS error',
        },
        {
          error: new TypeError('Failed to fetch'),
          description: 'Fetch API error',
        },
      ];

      for (const scenario of errorScenarios) {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockRejectedValueOnce(scenario.error);

        const result = await getPricesForDate(testDate);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(scenario.error);
      }
    });

    it('should handle malformed API responses gracefully', async () => {
      const testDate = DateTime.fromISO('2024-01-15T14:30:00');
      
      const malformedResponses = [
        null,
        undefined,
        '',
        'invalid json string',
        { error: 'API Error' },
        { prices: 'not an array' },
        []
      ];

      for (const response of malformedResponses) {
        jest.clearAllMocks();
        
        if (response === 'invalid json string') {
          (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.reject(new Error('Invalid JSON')),
          });
        } else {
          (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(response),
          });
        }

        const result = await getPricesForDate(testDate);

        if (response === 'invalid json string') {
          expect(result).toBeNull();
          expect(console.error).toHaveBeenCalledWith(new Error('Invalid JSON'));
        } else {
          expect(result).toEqual(response);
        }
      }
    });

    it('should work correctly with Finland timezone considerations', async () => {
      // Test around DST changes and midnight in Finland timezone
      const testDates = [
        DateTime.fromISO('2024-03-31T01:00:00'), // DST begins in Finland
        DateTime.fromISO('2024-10-27T02:00:00'), // DST ends in Finland
        DateTime.fromISO('2024-06-21T23:59:59'), // Summer solstice
        DateTime.fromISO('2024-12-21T00:00:01'), // Winter solstice
      ];

      for (const date of testDates) {
        (fetch as jest.Mock).mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve([]),
        });

        await getPricesForDate(date);

        const formattedDate = formatDate(date);
        const expectedUrl = `https://www.sahkonhintatanaan.fi/api/v1/prices/${formattedDate.replace('/', '/')}.json`;
        
        expect(fetch).toHaveBeenCalledWith(expectedUrl);
      }
    });
  });
});
