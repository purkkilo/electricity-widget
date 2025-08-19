import { getPricesForDate } from '../api';
import { DateTime } from 'luxon';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
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

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPricesForDate', () => {
    const mockDate = DateTime.fromISO('2024-01-15T14:30:00');
    const apiURL = 'https://www.sahkonhintatanaan.fi/api/v1/prices';

    it('should fetch prices successfully', async () => {
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
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockPriceData),
      });

      const result = await getPricesForDate(mockDate);

      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/01-15.json`);
      expect(result).toEqual(mockPriceData);
    });

    it('should handle 404 response gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 404,
        json: () => Promise.resolve({}),
      });

      const result = await getPricesForDate(mockDate);

      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/01-15.json`);
      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalledWith(
        'No data available for the date:',
        mockDate
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValueOnce(networkError);

      const result = await getPricesForDate(mockDate);

      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/01-15.json`);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(networkError);
    });

    it('should handle JSON parsing errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await getPricesForDate(mockDate);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(new Error('Invalid JSON'));
    });

    it('should handle different date formats correctly', async () => {
      // Test with single digit month
      const januaryDate = DateTime.fromISO('2024-01-05T14:30:00');
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve([]),
      });

      await getPricesForDate(januaryDate);
      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/01-05.json`);

      // Test with double digit month
      const novemberDate = DateTime.fromISO('2024-11-25T14:30:00');
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve([]),
      });

      await getPricesForDate(novemberDate);
      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/11-25.json`);
    });

    it('should handle server errors (5xx)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' }),
      });

      const result = await getPricesForDate(mockDate);

      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/01-15.json`);
      expect(result).toEqual({ error: 'Internal Server Error' });
    });

    it('should handle empty response data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(null),
      });

      const result = await getPricesForDate(mockDate);

      expect(result).toBeNull();
    });

    it('should handle malformed price data', async () => {
      const malformedData = {
        not_an_array: 'this should be an array',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(malformedData),
      });

      const result = await getPricesForDate(mockDate);

      expect(result).toEqual(malformedData);
    });

    it('should work with edge case dates', async () => {
      // Test leap year date
      const leapYearDate = DateTime.fromISO('2024-02-29T14:30:00');
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve([]),
      });

      await getPricesForDate(leapYearDate);
      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/02-29.json`);

      // Test New Year's Day
      const newYearDate = DateTime.fromISO('2024-01-01T14:30:00');
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve([]),
      });

      await getPricesForDate(newYearDate);
      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/01-01.json`);

      // Test New Year's Eve
      const newYearEveDate = DateTime.fromISO('2024-12-31T14:30:00');
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve([]),
      });

      await getPricesForDate(newYearEveDate);
      expect(fetch).toHaveBeenCalledWith(`${apiURL}/2024/12-31.json`);
    });

    it('should handle timeout scenarios', async () => {
      // Simulate a timeout by rejecting with a timeout error
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      
      (fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      const result = await getPricesForDate(mockDate);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(timeoutError);
    });

    it('should handle different HTTP status codes', async () => {
      const statusCodes = [200, 201, 300, 400, 401, 403, 500, 502, 503];

      for (const status of statusCodes) {
        (fetch as jest.Mock).mockResolvedValueOnce({
          status,
          json: () => Promise.resolve({ status }),
        });

        const result = await getPricesForDate(mockDate);

        if (status === 404) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toEqual({ status });
        }
      }
    });
  });
});
