import { geocodeAddress, calculateDistance, RADIUS_OPTIONS } from '../geocoding';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = vi.fn();

describe('geocoding service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should geocode a valid address', async () => {
      const mockResponse = [
        {
          lat: '40.7128',
          lon: '-74.0060',
          display_name: 'New York, NY, USA',
          address: {
            city: 'New York',
            state: 'NY',
            country: 'USA',
          },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await geocodeAddress('New York, NY');

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        formattedAddress: 'New York, NY, USA',
        city: 'New York',
        state: 'NY',
        country: 'USA',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/search'),
        expect.objectContaining({
          headers: {
            'User-Agent': 'CommunityResourceMap/1.0 (contact@example.com)',
          },
        })
      );
    });

    it('should handle geocoding errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(geocodeAddress('Invalid Address')).rejects.toThrow(
        'Failed to geocode address: Network error'
      );
    });

    it('should handle empty results', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      await expect(geocodeAddress('Non-existent Place')).rejects.toThrow(
        'No results found for the provided address'
      );
    });

    it('should handle empty address', async () => {
      await expect(geocodeAddress('')).rejects.toThrow('Address is required');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // Distance between New York and Los Angeles (approximately 2,445 miles)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(2445, -1);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      // Distance between two nearby points in NYC (approximately 0.5 miles)
      const distance = calculateDistance(40.7128, -74.0060, 40.7168, -74.0060);
      expect(distance).toBeCloseTo(0.28, 1);
    });
  });

  describe('RADIUS_OPTIONS', () => {
    it('should have correct radius options', () => {
      expect(RADIUS_OPTIONS).toEqual([
        { value: 10, label: '10 miles' },
        { value: 15, label: '15 miles' },
        { value: 25, label: '25 miles' },
        { value: 50, label: '50 miles' },
      ]);
    });
  });
});
