import { render, screen } from '../../utils/test-utils';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import PlacesMap from '../PlacesMap';
import type { Place } from '../../types';

// Mock the Google Maps API
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-google-map">{children}</div>
  ),
  MarkerF: () => <div data-testid="mock-marker" />,
  CircleF: () => <div data-testid="mock-circle" />,
  useLoadScript: () => ({
    isLoaded: true,
    loadError: null,
  }),
}));

// Mock useCategories hook
vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: '1', name: 'Healthcare', slug: 'healthcare', color: '#10B981' },
      { id: '2', name: 'Food Assistance', slug: 'food-assistance', color: '#EF4444' },
    ],
    isLoading: false,
  }),
}));

describe('PlacesMap', () => {
  const mockPlaces: Place[] = [
    {
      id: '1',
      name: 'Test Place 1',
      description: 'Description 1',
      latitude: 47.6062,
      longitude: -122.3321,
      addressLine1: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      status: 'active',
      categories: [{ id: '1', name: 'Healthcare', slug: 'healthcare' }],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Place 2',
      description: 'Description 2',
      latitude: 47.6162,
      longitude: -122.3421,
      addressLine1: '456 Oak Ave',
      city: 'Seattle',
      state: 'WA',
      status: 'active',
      categories: [{ id: '2', name: 'Food Assistance', slug: 'food-assistance' }],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockProps = {
    places: mockPlaces,
    searchCenter: { latitude: 47.6062, longitude: -122.3321 },
    radiusMiles: 10,
    selectedPlace: null,
    onPlaceClick: vi.fn(),
  };

  it('renders the map container', () => {
    render(<PlacesMap {...mockProps} />);

    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
    expect(screen.getByText('2 places found within 10 miles')).toBeInTheDocument();
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('renders with empty places array', () => {
    render(<PlacesMap {...mockProps} places={[]} />);

    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
    expect(screen.getByText('Search for places to see them on the map')).toBeInTheDocument();
  });

  it('renders with null searchCenter', () => {
    render(<PlacesMap {...mockProps} searchCenter={undefined} />);

    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
    expect(screen.getByText('2 places found within 10 miles')).toBeInTheDocument();
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('handles selectedPlace prop', () => {
    const selectedPlace = mockPlaces[0];
    render(<PlacesMap {...mockProps} selectedPlace={selectedPlace} />);

    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
    expect(screen.getByText('2 places found within 10 miles')).toBeInTheDocument();
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('handles different radius values', () => {
    render(<PlacesMap {...mockProps} radiusMiles={25} />);

    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
    expect(screen.getByText('2 places found within 25 miles')).toBeInTheDocument();
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });
});