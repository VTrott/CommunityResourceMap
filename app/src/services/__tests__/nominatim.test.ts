import { searchPlaces, COMMUNITY_RESOURCE_SEARCHES, convertNominatimToPlace } from '../nominatim';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = vi.fn();

describe('nominatim service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchPlaces', () => {
    it('should search for places with basic query', async () => {
      const mockResponse = [
        {
          place_id: 1,
          name: 'Test Hospital',
          display_name: 'Test Hospital, 123 Main St, Test City, Test State',
          lat: '40.7128',
          lon: '-74.0060',
          type: 'hospital',
          class: 'amenity',
          address: {
            city: 'Test City',
            state: 'Test State',
            country: 'USA',
          },
          extratags: {
            website: 'https://testhospital.com',
            phone: '555-1234',
          },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await searchPlaces({ q: 'hospital', city: 'Test City', state: 'Test State' });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/search'),
        expect.objectContaining({
          headers: {
            'User-Agent': 'CommunityResourceMap/1.0 (contact@example.com)',
          },
        })
      );
    });

    it('should handle search errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await searchPlaces({ q: 'hospital' });

      expect(result).toEqual([]);
    });

    it('should handle empty results', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const result = await searchPlaces({ q: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('COMMUNITY_RESOURCE_SEARCHES', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });

    it('should search for food banks', async () => {
      await COMMUNITY_RESOURCE_SEARCHES.foodBanks('Seattle', 'WA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('food_bank'),
        expect.any(Object)
      );
    });

    it('should search for healthcare facilities', async () => {
      await COMMUNITY_RESOURCE_SEARCHES.healthcare('Seattle', 'WA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('hospital'),
        expect.any(Object)
      );
    });

    it('should search for shelters', async () => {
      await COMMUNITY_RESOURCE_SEARCHES.shelters('Seattle', 'WA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('shelter'),
        expect.any(Object)
      );
    });

    it('should search for community centers', async () => {
      await COMMUNITY_RESOURCE_SEARCHES.communityCenters('Seattle', 'WA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('community_centre'),
        expect.any(Object)
      );
    });

    it('should search for libraries', async () => {
      await COMMUNITY_RESOURCE_SEARCHES.libraries('Seattle', 'WA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('library'),
        expect.any(Object)
      );
    });
  });

  describe('convertNominatimToPlace', () => {
    it('should convert nominatim place to our place format', () => {
      const nominatimPlace = {
        place_id: 1,
        name: 'Test Hospital',
        display_name: 'Test Hospital, 123 Main St, Test City, Test State',
        lat: '40.7128',
        lon: '-74.0060',
        type: 'hospital',
        class: 'amenity',
        address: {
          city: 'Test City',
          state: 'Test State',
          country: 'USA',
          house_number: '123',
          road: 'Main St',
        },
        extratags: {
          website: 'https://testhospital.com',
          phone: '555-1234',
        },
      };

      const result = convertNominatimToPlace(nominatimPlace);

      expect(result).toEqual({
        name: 'Test Hospital',
        description: 'Community resource found via OpenStreetMap',
        website: 'https://testhospital.com',
        phone: '555-1234',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'active',
        categories: ['Community Centers'],
        email: undefined,
        postalCode: undefined,
      });
    });

    it('should handle missing address details', () => {
      const nominatimPlace = {
        place_id: 1,
        name: 'Test Place',
        display_name: 'Test Place',
        lat: '40.7128',
        lon: '-74.0060',
        type: 'amenity',
        class: 'unknown',
        address: {},
        extratags: {},
      };

      const result = convertNominatimToPlace(nominatimPlace);

      expect(result).toEqual({
        name: 'Test Place',
        description: 'Community resource found via OpenStreetMap',
        website: undefined,
        phone: undefined,
        addressLine1: '',
        city: undefined,
        state: undefined,
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'active',
        categories: ['Community Centers'],
        email: undefined,
        postalCode: undefined,
      });
    });
  });
});
