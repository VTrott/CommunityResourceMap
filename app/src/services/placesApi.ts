/**
 * Places API service for calling backend Google Places integration
 */

export interface PlaceSearchParams {
  latitude: number;
  longitude: number;
  radiusMiles: number;
  categoryIds?: string[];
}

export interface Place {
  id: string;
  name: string;
  description: string;
  website?: string;
  phone?: string;
  addressLine1: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  status: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface PlaceSearchResponse {
  content: Place[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Map radius miles to specific endpoint
 */
function getRadiusEndpoint(radiusMiles: number): string {
  switch (radiusMiles) {
    case 5:
      return '5-miles';
    case 10:
      return '10-miles';
    case 25:
      return '25-miles';
    case 50:
      return '50-miles';
    default:
      // Default to 10 miles if radius not found
      return '10-miles';
  }
}

/**
 * Search for community resources using the backend API
 */
export async function searchCommunityResources(params: PlaceSearchParams): Promise<Place[]> {
  // Map radius to specific endpoint and send coordinates in POST body
  const radiusEndpoint = getRadiusEndpoint(params.radiusMiles);
  const url = `/api/places/search/${radiusEndpoint}`;
  
  const requestBody = {
    latitude: params.latitude,
    longitude: params.longitude,
    categoryIds: params.categoryIds
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: PlaceSearchResponse = await response.json();
  return data.content;
}

