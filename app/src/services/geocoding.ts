export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface GeocodingError {
  message: string;
  code?: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

let lastRequestTime = 0;
const RATE_LIMIT_MS = 1000;

async function rateLimitedRequest(url: string): Promise<any> {
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
    throw new Error(`Geocoding API error: ${response.status}`);
  }
  
  return response.json();
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    throw new Error('Address is required');
  }

  const searchParams = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
    addressdetails: '1',
    countrycodes: 'us', // Focus on US addresses
  });

  const url = `${NOMINATIM_BASE_URL}?${searchParams.toString()}`;
  
  try {
    const results = await rateLimitedRequest(url);
    
    if (!results || results.length === 0) {
      throw new Error('No results found for the provided address');
    }

    const result = results[0];
    const addressDetails = result.address || {};
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      city: addressDetails.city || addressDetails.town || addressDetails.village,
      state: addressDetails.state,
      country: addressDetails.country,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const RADIUS_OPTIONS = [
  { value: 10, label: '10 miles' },
  { value: 15, label: '15 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
] as const;
