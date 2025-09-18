export type HealthResponse = {
  status: string;
  timestamp: string;
};

export type Place = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  categories: Category[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type PlaceSearchRequest = {
  city?: string;
  state?: string;
  categoryIds?: string[];
  name?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
};

export type PlaceSearchResponse = {
  content: Place[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type CreatePlaceRequest = Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'categories'> & {
  categoryIds?: string[];
};

export type UpdatePlaceRequest = Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'categories'> & {
  categoryIds?: string[];
};
