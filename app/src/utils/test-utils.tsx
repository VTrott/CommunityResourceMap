import React, {type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock implementations
export const mockGeocodingResult = {
  latitude: 40.7128,
  longitude: -74.0060,
  formattedAddress: 'New York, NY, USA',
  city: 'New York',
  state: 'NY',
  country: 'USA',
};

export const mockPlace = {
  id: '1',
  name: 'Test Food Bank',
  description: 'A test food bank',
  website: 'https://example.com',
  phone: '555-1234',
  email: 'test@example.com',
  addressLine1: '123 Test St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  latitude: 40.7128,
  longitude: -74.0060,
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  categories: [
    {
      id: '1',
      name: 'Food Assistance',
      slug: 'food-assistance',
    },
  ],
  distance: 2.5,
};

export const mockSearchResponse = {
  content: [mockPlace],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

// Mock fetch
export const mockFetch = (response: any, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
  });
};

// Mock geolocation
export const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

// Mock Google Maps
export const mockGoogleMaps = {
  Map: vi.fn().mockImplementation(() => ({
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    fitBounds: vi.fn(),
  })),
  Marker: vi.fn().mockImplementation(() => ({
    setMap: vi.fn(),
    addListener: vi.fn(),
    getPosition: vi.fn().mockReturnValue({
      lat: () => 40.7128,
      lng: () => -74.0060,
    }),
  })),
  Circle: vi.fn().mockImplementation(() => ({
    setMap: vi.fn(),
  })),
  LatLngBounds: vi.fn().mockImplementation(() => ({
    extend: vi.fn(),
  })),
  LatLng: vi.fn(),
  SymbolPath: {
    CIRCLE: 'circle',
  },
  Animation: {
    BOUNCE: 'bounce',
  },
  MapTypeId: {
    ROADMAP: 'roadmap',
  },
};

// Setup mocks
export const setupMocks = () => {
  // Mock fetch
  global.fetch = vi.fn();
  
  // Mock geolocation
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });
  
  // Mock Google Maps
  Object.defineProperty(window, 'google', {
    value: { maps: mockGoogleMaps },
    writable: true,
  });
};

// Cleanup mocks
export const cleanupMocks = () => {
  vi.clearAllMocks();
  delete (global as any).fetch;
  delete (navigator as any).geolocation;
  delete (window as any).google;
};

export * from '@testing-library/react';
export { customRender as render };
