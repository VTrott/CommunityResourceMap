// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Types
export interface Place {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
}

export interface PlaceSearchRequest {
  latitude: number;
  longitude: number;
  radiusMiles: number;
  categoryIds?: string[];
}

export interface PlaceSearchResponse {
  places: Place[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category: Category;
  source: string;
  externalId?: string;
  url?: string;
  status: 'active' | 'inactive' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventSearchRequest {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  categoryIds?: string[];
  startDate?: string;
  endDate?: string;
}

export interface EventSearchResponse {
  events: Event[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface UserProfile {
  id: string;
  externalId: string;
  provider: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfileRequest {
  externalId: string;
  provider: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: Record<string, any>;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}


interface BackendPlaceResponse {
  id: string;
  name: string;
  description?: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

interface BackendSearchResponse {
  content: BackendPlaceResponse[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}

// Convert backend response to frontend format
function convertBackendPlace(backendPlace: BackendPlaceResponse): Place {
  return {
    id: backendPlace.id,
    name: backendPlace.name,
    description: backendPlace.description,
    address: backendPlace.addressLine1,
    city: backendPlace.city,
    state: backendPlace.state,
    zipCode: backendPlace.postalCode,
    latitude: backendPlace.latitude,
    longitude: backendPlace.longitude,
    phone: backendPlace.phone,
    website: backendPlace.website,
    status: backendPlace.status,
    categories: backendPlace.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    })),
    createdAt: backendPlace.createdAt,
    updatedAt: backendPlace.updatedAt
  };
}

// Mock data for development since backend doesn't have these endpoints yet
const mockCategories: Category[] = [
  { id: '1', name: 'Food Assistance', description: 'Food banks, pantries, and meal programs' },
  { id: '2', name: 'Housing', description: 'Shelters, transitional housing, and housing assistance' },
  { id: '3', name: 'Healthcare', description: 'Medical services, clinics, and health programs' },
  { id: '4', name: 'Education', description: 'Educational programs and resources' },
  { id: '5', name: 'Employment', description: 'Job training and employment services' },
  { id: '6', name: 'Transportation', description: 'Transportation assistance and services' },
];


export const placesApi = {

  getAll: (): Promise<Place[]> => 
    Promise.resolve([]),

  getById: (id: string): Promise<Place> => 
    Promise.resolve({} as Place),

  searchWithRadius: async (radiusMiles: number, request: PlaceSearchRequest): Promise<PlaceSearchResponse> => {
    const response = await apiCall<BackendSearchResponse>(`/places/search/${radiusMiles}-miles`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return {
      places: response.content.map(convertBackendPlace),
      totalElements: response.totalElements,
      page: response.page,
      size: response.size,
      totalPages: response.totalPages,
    };
  },

  search5Miles: (request: PlaceSearchRequest): Promise<PlaceSearchResponse> =>
    placesApi.searchWithRadius(5, request),

  search10Miles: (request: PlaceSearchRequest): Promise<PlaceSearchResponse> =>
    placesApi.searchWithRadius(10, request),

  search25Miles: (request: PlaceSearchRequest): Promise<PlaceSearchResponse> =>
    placesApi.searchWithRadius(25, request),

  search50Miles: (request: PlaceSearchRequest): Promise<PlaceSearchResponse> =>
    placesApi.searchWithRadius(50, request),

  health: (): Promise<HealthResponse> =>
    apiCall<HealthResponse>('/health'),
};

export const categoriesApi = {
  getAll: (): Promise<Category[]> => 
    Promise.resolve(mockCategories),

  getById: (id: string): Promise<Category> => 
    Promise.resolve(mockCategories.find(c => c.id === id) || mockCategories[0]),
};

export const eventsApi = {
  getAll: (): Promise<Event[]> => 
    Promise.resolve([]),

  getById: (id: string): Promise<Event> => 
    Promise.resolve({} as Event),

  search: (request: EventSearchRequest): Promise<EventSearchResponse> =>
    Promise.resolve({
      events: [],
      totalElements: 0,
      page: 0,
      size: 20,
      totalPages: 0,
    }),
};

export const userProfilesApi = {
  getByExternalId: (externalId: string, provider: string): Promise<UserProfile> =>
    Promise.resolve({} as UserProfile),

  create: (request: CreateUserProfileRequest): Promise<UserProfile> =>
    Promise.resolve({} as UserProfile),

  update: (id: string, request: Partial<CreateUserProfileRequest>): Promise<UserProfile> =>
    Promise.resolve({} as UserProfile),
};

export const api = {
  getPlaces: placesApi.getAll,
  getPlace: placesApi.getById,
  searchPlacesWithRadius: placesApi.searchWithRadius,
  searchPlaces5Miles: placesApi.search5Miles,
  searchPlaces10Miles: placesApi.search10Miles,
  searchPlaces25Miles: placesApi.search25Miles,
  searchPlaces50Miles: placesApi.search50Miles,
  getPlacesHealth: placesApi.health,

  getCategories: categoriesApi.getAll,
  getCategory: categoriesApi.getById,

  getEvents: eventsApi.getAll,
  getEvent: eventsApi.getById,
  searchEvents: eventsApi.search,

  getUserProfile: userProfilesApi.getByExternalId,
  createUserProfile: userProfilesApi.create,
  updateUserProfile: userProfilesApi.update,
};