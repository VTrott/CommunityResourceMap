export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface GeocodingError {
  message: string;
  code?: string;
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
    throw new Error(`Geocoding API error: ${response.status}`);
  }
  
  return response.json();
}

async function geocodeWithNominatim(address: string): Promise<GeocodingResult> {
  const searchParams = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
    addressdetails: '1',
    countrycodes: 'us', // Focus on US addresses
  });

  const url = `${NOMINATIM_BASE_URL}?${searchParams.toString()}`;
  
  const results = await rateLimitedRequest(url) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
      postcode?: string;
      road?: string;
      house_number?: string;
    };
  }>;
  
  if (!results || results.length === 0) {
    throw new Error('No results found for the provided address');
  }

  const result = results[0];
  const addressDetails = result.address || {};
  
  // Build a clean address string
  const addressParts = [];
  if (addressDetails.house_number) addressParts.push(addressDetails.house_number);
  if (addressDetails.road) addressParts.push(addressDetails.road);
  const streetAddress = addressParts.join(' ');
  
  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    displayName: result.display_name,
    address: streetAddress || result.display_name.split(',')[0].trim(),
    city: addressDetails.city || addressDetails.town || addressDetails.village,
    state: addressDetails.state,
    zipCode: addressDetails.postcode,
    country: addressDetails.country,
  };
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    throw new Error('Address is required');
  }

  try {
    const nominatimResult = await geocodeWithNominatim(address);
    return nominatimResult;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Current location functionality
export interface CurrentLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

export async function getCurrentLocation(): Promise<CurrentLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Try to get a readable address for the coordinates
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy,
            address
          });
        } catch (error) {
          // If reverse geocoding fails, still return the coordinates
          resolve({
            latitude,
            longitude,
            accuracy
          });
        }
      },
      (error) => {
        let message = 'Failed to get current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Reverse geocoding to get address from coordinates
async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const searchParams = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'json',
    addressdetails: '1',
  });

  const url = `https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CommunityResourceMap/1.0 (contact@example.com)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.status}`);
  }
  
  const result = await response.json() as {
    display_name: string;
    address?: {
      house_number?: string;
      road?: string;
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
  };
  
  // Clean up the address format to remove extra commas and make it more readable
  let cleanAddress = result.display_name;
  
  // Remove common extra commas and clean up formatting
  cleanAddress = cleanAddress
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/,\s*$/, '') // Remove trailing comma
    .replace(/^,\s*/, '') // Remove leading comma
    .trim();
  
  // If we have address details, try to build a cleaner address
  if (result.address) {
    const addressParts = [];
    if (result.address.house_number && result.address.road) {
      addressParts.push(`${result.address.house_number} ${result.address.road}`);
    } else if (result.address.road) {
      addressParts.push(result.address.road);
    }
    if (result.address.city || result.address.town || result.address.village) {
      addressParts.push(result.address.city || result.address.town || result.address.village);
    }
    if (result.address.state) {
      addressParts.push(result.address.state);
    }
    if (result.address.postcode) {
      addressParts.push(result.address.postcode);
    }
    
    if (addressParts.length > 0) {
      cleanAddress = addressParts.join(', ');
    }
  }
  
  return cleanAddress;
}

// Validate if an address string looks like a valid location
export function isValidLocationInput(input: string): boolean {
  if (!input || input.trim().length < 2) return false;
  
  // Clean the input first
  const cleanInput = input.trim().replace(/,\s*,/g, ',').replace(/,\s*$/, '').replace(/^,\s*/, '');
  
  // Check for common location patterns
  const patterns = [
    /^\d+\s+[a-zA-Z\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|place|pl|court|ct|circle|cir)/i, // Street address
    /^[a-zA-Z\s]+,\s*[a-zA-Z\s]+$/i, // City, State
    /^\d{5}(-\d{4})?$/i, // ZIP code
    /^[a-zA-Z\s]+$/i, // City name only
    /^[a-zA-Z0-9\s,.-]+$/i, // General address format (more permissive)
  ];
  
  return patterns.some(pattern => pattern.test(cleanInput));
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
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
] as const;