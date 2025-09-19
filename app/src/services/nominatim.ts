export interface NominatimPlace {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: {
    amenity?: string;
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  extratags?: {
    website?: string;
    phone?: string;
    email?: string;
    opening_hours?: string;
  };
}

export interface NominatimSearchParams {
  q?: string;
  city?: string;
  state?: string;
  country?: string;
  amenity?: string;
  format?: 'json' | 'xml';
  limit?: number;
  viewbox?: string;
  bounded?: 0 | 1;
  addressdetails?: 0 | 1;
  extratags?: 0 | 1;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

let lastRequestTime = 0;
const RATE_LIMIT_MS = 1000;

async function rateLimitedRequest(url: string): Promise<unknown> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CommunityResourceMap/1.0 (contact@example.com)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }
  
  return response.json();
}

export async function searchPlaces(params: NominatimSearchParams): Promise<NominatimPlace[]> {
  const searchParams = new URLSearchParams();
  
  let query = '';
  if (params.q) {
    query = params.q;
  } else {
    const parts = [];
    if (params.amenity) parts.push(params.amenity);
    if (params.city) parts.push(params.city);
    if (params.state) parts.push(params.state);
    if (params.country) parts.push(params.country);
    query = parts.join(', ');
  }
  
  searchParams.set('q', query);
  searchParams.set('format', params.format || 'json');
  searchParams.set('limit', (params.limit || 10).toString());
  searchParams.set('addressdetails', '1');
  searchParams.set('extratags', '1');
  
  if (params.viewbox) {
    searchParams.set('viewbox', params.viewbox);
    searchParams.set('bounded', '1');
  }
  
  const url = `${NOMINATIM_BASE_URL}?${searchParams.toString()}`;
  
  try {
    const results = await rateLimitedRequest(url);
    return results as NominatimPlace[];
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

export const COMMUNITY_RESOURCE_SEARCHES = {
  foodBanks: (city: string, state: string) => 
    searchPlaces({ amenity: 'food_bank', city, state, limit: 20 }),
  
  healthcare: (city: string, state: string) => 
    searchPlaces({ amenity: 'hospital', city, state, limit: 20 }),
  
  shelters: (city: string, state: string) => 
    searchPlaces({ amenity: 'shelter', city, state, limit: 20 }),
  
  communityCenters: (city: string, state: string) => 
    searchPlaces({ amenity: 'community_centre', city, state, limit: 20 }),
  
  libraries: (city: string, state: string) => 
    searchPlaces({ amenity: 'library', city, state, limit: 20 }),
  
  socialServices: (city: string, state: string) => 
    searchPlaces({ q: 'social services', city, state, limit: 20 }),
};

export function convertNominatimToPlace(nominatimPlace: NominatimPlace) {
  const address = nominatimPlace.address || {};
  
  return {
    name: nominatimPlace.name || nominatimPlace.display_name.split(',')[0],
    description: `Community resource found via OpenStreetMap`,
    website: nominatimPlace.extratags?.website,
    phone: nominatimPlace.extratags?.phone,
    email: nominatimPlace.extratags?.email,
    addressLine1: [address.house_number, address.road].filter(Boolean).join(' '),
    city: address.city || address.state,
    state: address.state,
    postalCode: address.postcode,
    latitude: parseFloat(nominatimPlace.lat),
    longitude: parseFloat(nominatimPlace.lon),
    status: 'active',
    categories: mapAmenityToCategories(nominatimPlace.address?.amenity || nominatimPlace.class),
  };
}

function mapAmenityToCategories(amenity: string): string[] {
  const categoryMap: Record<string, string[]> = {
    'food_bank': ['Food Assistance'],
    'hospital': ['Healthcare'],
    'clinic': ['Healthcare'],
    'pharmacy': ['Healthcare'],
    'shelter': ['Housing'],
    'community_centre': ['Community Centers'],
    'library': ['Education'],
    'school': ['Education'],
    'social_facility': ['Family Services'],
    'courthouse': ['Legal Aid'],
    'police': ['Emergency Services'],
  };
  
  return categoryMap[amenity] || ['Community Centers'];
}
