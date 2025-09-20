import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useLocationSearch } from '../useLocationSearch';
import type { LocationSearchRequest } from '../../types';
import { searchCommunityResources } from '../../services/placesApi';

// Mock the placesApi service
vi.mock('../../services/placesApi', () => ({
  searchCommunityResources: vi.fn(),
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

  it('should return empty response when coordinates are missing', async () => {
    const locationRequest: LocationSearchRequest = {
      address: 'Test Address',
      radiusMiles: 10,
      city: 'Test City',
      state: 'Test State',
      // Missing latitude and longitude
    };

    const { result } = renderHook(() => useLocationSearch(locationRequest), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should search for places when valid location request is provided', async () => {
    const mockPlaces = [
      { 
        id: '1', 
        name: 'Food Bank 1', 
        description: 'Test description',
        addressLine1: '123 Test St',
        city: 'Seattle',
        state: 'WA',
        latitude: 47.6062,
        longitude: -122.3321,
        status: 'active',
        categories: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      { 
        id: '2', 
        name: 'Hospital 1', 
        description: 'Test description',
        addressLine1: '456 Test Ave',
        city: 'Seattle',
        state: 'WA',
        latitude: 47.6062,
        longitude: -122.3321,
        status: 'active',
        categories: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
    ];

    (searchCommunityResources as any).mockResolvedValue(mockPlaces);

    const locationRequest: LocationSearchRequest = {
      address: 'Seattle, WA',
      radiusMiles: 10,
      city: 'Seattle',
      state: 'WA',
      latitude: 47.6062,
      longitude: -122.3321,
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
    (searchCommunityResources as any).mockRejectedValue(new Error('API Error'));

    const locationRequest: LocationSearchRequest = {
      address: 'Seattle, WA',
      radiusMiles: 10,
      city: 'Seattle',
      state: 'WA',
      latitude: 47.6062,
      longitude: -122.3321,
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
