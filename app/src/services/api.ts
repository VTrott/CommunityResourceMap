import type { 
  HealthResponse, 
  Place, 
  Category, 
  PlaceSearchRequest, 
  PlaceSearchResponse, 
  CreatePlaceRequest, 
  UpdatePlaceRequest,
  LocationSearchRequest
} from '../types';

const baseUrl = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    ...init,
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  
  return resp.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<HealthResponse>('/api/health'),
  
  getPlaces: () => request<Place[]>('/api/places'),
  getPlace: (id: string) => request<Place>(`/api/places/${id}`),
  createPlace: (place: CreatePlaceRequest) => 
    request<Place>('/api/places', {
      method: 'POST',
      body: JSON.stringify(place),
    }),
  updatePlace: (id: string, place: UpdatePlaceRequest) =>
    request<Place>(`/api/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(place),
    }),
  deletePlace: (id: string) =>
    request<void>(`/api/places/${id}`, {
      method: 'DELETE',
    }),
  
  searchPlaces: (searchRequest: PlaceSearchRequest) =>
    request<PlaceSearchResponse>('/api/places/search', {
      method: 'POST',
      body: JSON.stringify(searchRequest),
    }),

  searchPlacesByLocation: (locationRequest: LocationSearchRequest) =>
    request<PlaceSearchResponse>('/api/places/search/location', {
      method: 'POST',
      body: JSON.stringify(locationRequest),
    }),

  getCategories: () => request<Category[]>('/api/categories'),
  createCategory: (category: Omit<Category, 'id'>) =>
    request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),
  updateCategory: (id: string, category: Omit<Category, 'id'>) =>
    request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
};
