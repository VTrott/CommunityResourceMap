import { z } from 'zod';

// Place validation schemas
export const placeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  addressLine1: z.string().max(255, 'Address line 1 must be less than 255 characters').optional(),
  addressLine2: z.string().max(255, 'Address line 2 must be less than 255 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  postalCode: z.string().max(20, 'Postal code must be less than 20 characters').optional(),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional(),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  categories: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  })).default([]),
});

export const createPlaceSchema = placeSchema.omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true }).extend({
  status: z.enum(['active', 'inactive']).default('active'),
});
export const updatePlaceSchema = placeSchema.partial().omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });

// Category validation schemas
export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const createCategorySchema = categorySchema.omit({ id: true });
export const updateCategorySchema = categorySchema.partial().omit({ id: true });

// Search validation schemas
export const placeSearchSchema = z.object({
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  name: z.string().max(255, 'Name must be less than 255 characters').optional(),
  status: z.enum(['active', 'inactive']).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMiles: z.number().min(0.1, 'Radius must be at least 0.1 miles').max(500, 'Radius must be less than 500 miles').optional(),
  page: z.number().int().min(0, 'Page must be non-negative').default(0),
  size: z.number().int().min(1, 'Size must be at least 1').max(100, 'Size must be less than 100').default(20),
  sortBy: z.string().max(50, 'Sort field must be less than 50 characters').default('name'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
});

export const locationSearchSchema = z.object({
  address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  radiusMiles: z.number().min(0.1).max(500).default(15),
  categoryIds: z.array(z.string().uuid()).optional(),
});

// Geocoding validation schemas
export const geocodingResultSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

// Validation helper functions
export function validatePlace(data: unknown) {
  return placeSchema.parse(data);
}

export function validateCreatePlace(data: unknown) {
  return createPlaceSchema.parse(data);
}

export function validateUpdatePlace(data: unknown) {
  return updatePlaceSchema.parse(data);
}

export function validateCategory(data: unknown) {
  return categorySchema.parse(data);
}

export function validateCreateCategory(data: unknown) {
  return createCategorySchema.parse(data);
}

export function validateUpdateCategory(data: unknown) {
  return updateCategorySchema.parse(data);
}

export function validatePlaceSearch(data: unknown) {
  return placeSearchSchema.parse(data);
}

export function validateLocationSearch(data: unknown) {
  return locationSearchSchema.parse(data);
}

export function validateGeocodingResult(data: unknown) {
  return geocodingResultSchema.parse(data);
}

// Error formatting helper
export function formatValidationError(error: z.ZodError): string {
  return error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
}
