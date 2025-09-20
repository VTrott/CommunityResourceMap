import { useQuery } from '@tanstack/react-query';
import { searchCommunityResources } from '../services/placesApi';
import type { LocationSearchRequest, PlaceSearchResponse, Place } from '../types';

/**
 * Hook for searching community resources using backend API
 */
export function useLocationSearch(locationRequest: LocationSearchRequest | null) {
  return useQuery({
    queryKey: ['locationSearch', locationRequest],
    queryFn: async (): Promise<PlaceSearchResponse | null> => {
      if (!locationRequest) return null;

      // Use coordinates from the request - require them to be provided
      if (!locationRequest.latitude || !locationRequest.longitude) {
        throw new Error('Coordinates are required for search');
      }
      
      const location = { 
        latitude: locationRequest.latitude, 
        longitude: locationRequest.longitude 
      };

      try {
        // Search for community resources using backend API
        const places = await searchCommunityResources({
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMiles: locationRequest.radiusMiles,
          categoryIds: locationRequest.categoryIds
        });

        return createSearchResponse(places);

      } catch (error) {
        console.error('Error searching places:', error);
        return createEmptyResponse();
      }
    },
    enabled: !!locationRequest,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}



/**
 * Create empty search response
 */
function createEmptyResponse(): PlaceSearchResponse {
  return {
    content: [],
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  };
}

/**
 * Create search response with pagination
 */
function createSearchResponse(places: Place[]): PlaceSearchResponse {
  const page = 0;
  const size = 100;
  const start = page * size;
  const end = start + size;
  const content = places.slice(start, end);

  return {
    content,
    page,
    size,
    totalElements: places.length,
    totalPages: Math.ceil(places.length / size),
    first: page === 0,
    last: page >= Math.ceil(places.length / size) - 1
  };
}
