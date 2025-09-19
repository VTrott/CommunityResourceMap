import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useLocationSearch } from '../useLocationSearch';
import { COMMUNITY_RESOURCE_SEARCHES } from '../../services/nominatim';
import type { LocationSearchRequest } from '../../types';

// Mock the nominatim service
vi.mock('../../services/nominatim', () => ({
  COMMUNITY_RESOURCE_SEARCHES: {
    foodBanks: vi.fn(),
    healthcare: vi.fn(),
    shelters: vi.fn(),
    communityCenters: vi.fn(),
    libraries: vi.fn(),
  },
  convertNominatimToPlace: vi.fn((place) => ({
    name: place.name || 'Test Place',
    description: 'Test description',
    addressLine1: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    latitude: 40.7128,
    longitude: -74.0060,
    status: 'active',
    categories: ['Test Category'],
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLocationSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined when no location request is provided', () => {
    const { result } = renderHook(() => useLocationSearch(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
  });

  it('should return empty response when city or state is missing', async () => {
    const locationRequest: LocationSearchRequest = {
      address: 'Test Address',
      radiusMiles: 10,
      city: '',
      state: '',
    };

    const { result } = renderHook(() => useLocationSearch(locationRequest), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        content: [],
        page: 0,
        size: 100,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      });
    });
  });

  it('should search for places when valid location request is provided', async () => {
    const mockPlaces = [
      { name: 'Food Bank 1', place_id: 1 },
      { name: 'Hospital 1', place_id: 2 },
    ];

    (COMMUNITY_RESOURCE_SEARCHES.foodBanks as any).mockResolvedValue([mockPlaces[0]]);
    (COMMUNITY_RESOURCE_SEARCHES.healthcare as any).mockResolvedValue([mockPlaces[1]]);
    (COMMUNITY_RESOURCE_SEARCHES.shelters as any).mockResolvedValue([]);
    (COMMUNITY_RESOURCE_SEARCHES.communityCenters as any).mockResolvedValue([]);
    (COMMUNITY_RESOURCE_SEARCHES.libraries as any).mockResolvedValue([]);

    const locationRequest: LocationSearchRequest = {
      address: 'Seattle, WA',
      radiusMiles: 10,
      city: 'Seattle',
      state: 'WA',
    };

    const { result } = renderHook(() => useLocationSearch(locationRequest), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.content).toHaveLength(2);
    expect(result.current.data?.totalElements).toBe(2);
  });

  it('should handle errors gracefully', async () => {
    (COMMUNITY_RESOURCE_SEARCHES.foodBanks as any).mockRejectedValue(new Error('API Error'));
    (COMMUNITY_RESOURCE_SEARCHES.healthcare as any).mockResolvedValue([]);
    (COMMUNITY_RESOURCE_SEARCHES.shelters as any).mockResolvedValue([]);
    (COMMUNITY_RESOURCE_SEARCHES.communityCenters as any).mockResolvedValue([]);
    (COMMUNITY_RESOURCE_SEARCHES.libraries as any).mockResolvedValue([]);

    const locationRequest: LocationSearchRequest = {
      address: 'Seattle, WA',
      radiusMiles: 10,
      city: 'Seattle',
      state: 'WA',
    };

    const { result } = renderHook(() => useLocationSearch(locationRequest), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should return empty response on error
    expect(result.current.data).toEqual({
      content: [],
      page: 0,
      size: 100,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
  });
});
