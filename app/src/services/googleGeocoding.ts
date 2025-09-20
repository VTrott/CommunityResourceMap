/**
 * Google Geocoding service for converting addresses to coordinates
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Geocode an address using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string, apiKey: string): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      // Extract address components
      const addressComponents = result.address_components || [];
      let city = '';
      let state = '';
      let country = '';
      
      for (const component of addressComponents) {
        const types = component.types;
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        }
      }
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined
      };
    }
    
    // Handle specific Google API error statuses
    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No results found for the provided address');
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Geocoding quota exceeded');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Geocoding request denied - check API key');
    } else if (data.status === 'INVALID_REQUEST') {
      throw new Error('Invalid geocoding request');
    } else {
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error geocoding address with Google:', error);
    throw error; // Re-throw to allow fallback mechanism to work
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(latitude: number, longitude: number, apiKey: string): Promise<GeocodingResult | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract address components
      const addressComponents = result.address_components || [];
      let city = '';
      let state = '';
      let country = '';
      
      for (const component of addressComponents) {
        const types = component.types;
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        }
      }
      
      return {
        latitude,
        longitude,
        formattedAddress: result.formatted_address,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined
      };
    }
    
    console.error('Reverse geocoding failed:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
    return null;
  }
}
