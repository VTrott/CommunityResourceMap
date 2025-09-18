import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { geocodeAddress } from '../services/geocoding';
import type { LocationSearchRequest, PlaceSearchRequest } from '../types';

export function useLocationSearch(locationRequest: LocationSearchRequest | null) {
  return useQuery({
    queryKey: ['locationSearch', locationRequest],
    queryFn: async () => {
      if (!locationRequest) return null;

      const geocodedLocation = await geocodeAddress(locationRequest.address);
      
      const searchRequest: PlaceSearchRequest = {
        latitude: geocodedLocation.latitude,
        longitude: geocodedLocation.longitude,
        radiusMiles: locationRequest.radiusMiles,
        categoryIds: locationRequest.categoryIds,
        page: 0,
        size: 100,
        sortBy: 'name',
        sortDirection: 'asc',
      };

      return api.searchPlaces(searchRequest);
    },
    enabled: !!locationRequest,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
