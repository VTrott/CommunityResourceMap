import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { geocodeAddress, getCurrentLocation, isValidLocationInput, RADIUS_OPTIONS } from '../services/geocoding';
import type { Category } from '../types';

const searchSchema = z.object({
  searchQuery: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  radius: z.number().min(1).max(50),
  categoryIds: z.array(z.string()).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSearch: (data: {
    searchQuery: string;
    location: string;
    latitude: number;
    longitude: number;
    radius: number;
    categoryIds?: string[];
  }) => void;
  categories: Category[];
  loading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, categories, loading = false }) => {
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchQuery: '',
      location: '',
      radius: 10,
      categoryIds: []
    }
  });

  const selectedCategories = watch('categoryIds') || [];

  const handleUseCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      setValue('location', location.address || `${location.latitude}, ${location.longitude}`);
      
      // Automatically trigger search with current location
      const currentFormData = watch();
      await performSearch(currentFormData, location.latitude, location.longitude, location.address || 'Current Location');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get current location';
      setLocationError(message);
    } finally {
      setIsGettingLocation(false);
    }
  }, [setValue, watch]);

  const performSearch = useCallback(async (data: SearchFormData, lat: number, lng: number, address: string) => {
    onSearch({
      searchQuery: data.searchQuery || '', // Use empty string if no search query
      location: address,
      latitude: lat,
      longitude: lng,
      radius: data.radius,
      categoryIds: data.categoryIds?.length ? data.categoryIds : undefined
    });
  }, [onSearch]);

  const onSubmit = useCallback(async (data: SearchFormData) => {
    console.log('Form submitted with data:', data);
    setIsGeocoding(true);
    setLocationError(null);

    try {
      if (!isValidLocationInput(data.location)) {
        setLocationError('Please enter a valid address, city, state, or ZIP code');
        return;
      }

      console.log('Geocoding address:', data.location);
      const geocoded = await geocodeAddress(data.location);
      console.log('Geocoding result:', geocoded);
      
      await performSearch(data, geocoded.latitude, geocoded.longitude, geocoded.displayName);
    } catch (error) {
      console.error('Geocoding error:', error);
      const message = error instanceof Error ? error.message : 'Failed to find location';
      setLocationError(message);
    } finally {
      setIsGeocoding(false);
    }
  }, [onSearch, performSearch]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    setValue('categoryIds', newCategories);
  }, [selectedCategories, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="card-body">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Search Query - Optional */}
          <div className="form-group">
            <label htmlFor="searchQuery" className="form-label">
              Search for specific resources (optional)
            </label>
            <input
              {...register('searchQuery')}
              type="text"
              id="searchQuery"
              placeholder="e.g., specific organization name or detailed need"
              className="form-input"
            />
            {errors.searchQuery && (
              <div className="alert alert-error" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {errors.searchQuery.message}
              </div>
            )}
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              Leave blank to search all resources in selected categories
            </p>
          </div>

          {/* Unified Location Input */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Where are you looking?
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('location')}
                  type="text"
                  id="location"
                  placeholder="Enter address, city, state, or ZIP code"
                  className="form-input"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGettingLocation}
                  className="btn btn-success"
                  style={{ 
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.5rem',
                    minWidth: 'auto',
                    fontSize: '0.875rem'
                  }}
                >
                  {isGettingLocation ? (
                    <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                  ) : (
                    '📍'
                  )}
                </button>
              </div>
            </div>
            {errors.location && (
              <div className="alert alert-error" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {errors.location.message}
              </div>
            )}
            {locationError && (
              <div className="alert alert-error" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {locationError}
              </div>
            )}
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              Enter any location format: full address, city/state, or ZIP code. Click 📍 to use your current location.
            </p>
          </div>

          {/* Radius Selection */}
          <div className="form-group">
            <label className="form-label">
              Search radius
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('radius', option.value)}
                  className={`btn ${watch('radius') === option.value ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.875rem' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Category Filter */}
          {categories.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                Filter by category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`btn ${selectedCategories.includes(category.id) ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease-in-out',
                      minHeight: '2.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue('categoryIds', [])}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.75rem',
                      minHeight: 'auto'
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isGeocoding || isGettingLocation}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner"></div>
                Searching...
              </div>
            ) : isGeocoding ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner"></div>
                Finding location...
              </div>
            ) : isGettingLocation ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner"></div>
                Getting location...
              </div>
            ) : (
              'Find Resources'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;