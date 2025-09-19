import { useQuery } from '@tanstack/react-query';
import { COMMUNITY_RESOURCE_SEARCHES, convertNominatimToPlace } from '../services/nominatim';
import type { LocationSearchRequest, PlaceSearchResponse, Place, Category } from '../types';

/**
 * Hook for searching community resources using OpenStreetMap/Nominatim API
 */
export function useLocationSearch(locationRequest: LocationSearchRequest | null) {
  return useQuery({
    queryKey: ['locationSearch', locationRequest],
    queryFn: async (): Promise<PlaceSearchResponse | null> => {
      if (!locationRequest) return null;

      const city = locationRequest.city || '';
      const state = locationRequest.state || '';

      if (!city || !state) {
        return createEmptyResponse();
      }

      try {
        // Search for different types of community resources in parallel
        const [foodBanks, healthcare, shelters, communityCenters, libraries] = await Promise.all([
          COMMUNITY_RESOURCE_SEARCHES.foodBanks(city, state),
          COMMUNITY_RESOURCE_SEARCHES.healthcare(city, state),
          COMMUNITY_RESOURCE_SEARCHES.shelters(city, state),
          COMMUNITY_RESOURCE_SEARCHES.communityCenters(city, state),
          COMMUNITY_RESOURCE_SEARCHES.libraries(city, state)
        ]);

        // Convert all results to places and combine
        const allPlaces: Place[] = [
          ...foodBanks,
          ...healthcare,
          ...shelters,
          ...communityCenters,
          ...libraries
        ].map(convertNominatimToPlace).map(convertToPlace);

        return createSearchResponse(allPlaces);

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
 * Convert Nominatim place to our Place type
 */
function convertToPlace(place: Record<string, unknown>): Place {
  return {
    ...place,
    id: (place.id as string) || generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: ((place.categories as string[]) || []).map(convertToCategory)
  } as Place;
}

/**
 * Convert category name to Category object
 */
function convertToCategory(categoryName: string): Category {
  return {
    id: generateId(),
    name: categoryName,
    slug: categoryName.toLowerCase().replace(/\s+/g, '-')
  };
}

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
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
