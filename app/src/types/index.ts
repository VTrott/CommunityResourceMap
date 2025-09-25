// Core types for the Community Resource Map application

export interface Place {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  email?: string;
  categories: Category[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  color?: string;
  icon?: string;
}

export interface PlaceSearchRequest {
  query: string;
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  categoryIds?: string[];
}

export interface PlaceSearchResponse {
  places: Place[];
  totalElements: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radiusMiles?: number;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  placeId?: string;
  categoryId?: string;
  source: 'google' | 'facebook' | 'spotify' | 'manual';
  externalId?: string;
  externalUrl?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  status: 'active' | 'inactive' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventSearchRequest {
  location?: {
    latitude: number;
    longitude: number;
    radiusMiles?: number;
  };
  categoryIds?: string[];
  startDate?: string;
  endDate?: string;
  source?: string;
}

export interface EventSearchResponse {
  events: Event[];
  totalElements: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface UserProfile {
  id: string;
  externalId: string;
  provider: 'google' | 'facebook' | 'spotify';
  email: string;
  name: string;
  profilePicture?: string;
  preferences: {
    categories: string[];
    radiusMiles: number;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfileRequest {
  externalId: string;
  provider: 'google' | 'facebook' | 'spotify';
  email: string;
  name: string;
  profilePicture?: string;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  formattedAddress: string;
}

export interface LocationSearchRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  categoryIds?: string[];
}

export interface LocationSearchResponse {
  places: Place[];
  totalElements: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radiusMiles: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  apiKeyLength: number;
  apiKeyConfigured: boolean;
}

export interface CreatePlaceRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  email?: string;
  categoryIds: string[];
}

export interface UpdatePlaceRequest {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  email?: string;
  categoryIds?: string[];
  status?: 'active' | 'inactive' | 'pending';
}
