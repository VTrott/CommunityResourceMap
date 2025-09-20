import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';
import ImportPlaces from '../ImportPlaces';

// Mock the nominatim service
vi.mock('../../services/nominatim', () => ({
  COMMUNITY_RESOURCE_SEARCHES: {
    foodBanks: vi.fn(),
    healthcare: vi.fn(),
    shelters: vi.fn(),
    communityCenters: vi.fn(),
    libraries: vi.fn(),
    socialServices: vi.fn(),
  },
  convertNominatimToPlace: vi.fn((place) => ({
    id: place.place_id?.toString() || '1',
    name: place.name || 'Test Place',
    description: 'Community resource found via OpenStreetMap',
    addressLine1: place.address?.house_number && place.address?.road 
      ? `${place.address.house_number} ${place.address.road}` 
      : '',
    city: place.address?.city || place.address?.town || place.address?.village,
    state: place.address?.state,
    postalCode: place.address?.postcode,
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
    status: 'active',
    categories: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    website: place.extratags?.website,
    phone: place.extratags?.phone,
    email: place.extratags?.email,
  })),
}));

// Mock the API service
vi.mock('../../services/api', () => ({
  api: {
    createPlace: vi.fn(),
  },
}));

import { COMMUNITY_RESOURCE_SEARCHES, convertNominatimToPlace } from '../../services/nominatim';
import { api } from '../../services/api';

describe('ImportPlaces', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the import form', () => {
    render(<ImportPlaces onClose={mockOnClose} />);

    expect(screen.getByText('Import Places from OpenStreetMap')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByLabelText('Resource Type')).toBeInTheDocument();
    expect(screen.getByText('Search for food banks')).toBeInTheDocument();
  });

  it('allows entering city and state', () => {
    render(<ImportPlaces onClose={mockOnClose} />);

    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');

    fireEvent.change(cityInput, { target: { value: 'Seattle' } });
    fireEvent.change(stateInput, { target: { value: 'WA' } });

    expect(cityInput).toHaveValue('Seattle');
    expect(stateInput).toHaveValue('WA');
  });

  it('allows selecting resource type', () => {
    render(<ImportPlaces onClose={mockOnClose} />);

    const resourceTypeSelect = screen.getByLabelText('Resource Type');
    fireEvent.change(resourceTypeSelect, { target: { value: 'healthcare' } });

    expect(resourceTypeSelect).toHaveValue('healthcare');
  });

  it('searches for places when search button is clicked', async () => {
    const mockResults = [
      {
        place_id: 1,
        name: 'Test Hospital',
        display_name: 'Test Hospital, 123 Main St, Seattle, WA',
        lat: '47.6062',
        lon: '-122.3321',
        type: 'hospital',
        class: 'amenity',
        address: {
          city: 'Seattle',
          state: 'WA',
          country: 'USA',
          house_number: '123',
          road: 'Main St',
        },
        extratags: {
          website: 'https://testhospital.com',
          phone: '555-1234',
        },
      },
    ];

    (COMMUNITY_RESOURCE_SEARCHES.healthcare as any).mockResolvedValue(mockResults);

    render(<ImportPlaces onClose={mockOnClose} />);

    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    const resourceTypeSelect = screen.getByLabelText('Resource Type');

    fireEvent.change(cityInput, { target: { value: 'Seattle' } });
    fireEvent.change(stateInput, { target: { value: 'WA' } });
    fireEvent.change(resourceTypeSelect, { target: { value: 'healthcare' } });

    const searchButton = screen.getByText('Search for healthcare');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(COMMUNITY_RESOURCE_SEARCHES.healthcare).toHaveBeenCalledWith('Seattle', 'WA');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Hospital')).toBeInTheDocument();
    });
  });

  it('allows selecting places for import', async () => {
    const mockResults = [
      {
        place_id: 1,
        name: 'Test Hospital',
        display_name: 'Test Hospital, 123 Main St, Seattle, WA',
        lat: '47.6062',
        lon: '-122.3321',
        type: 'hospital',
        class: 'amenity',
        address: {
          city: 'Seattle',
          state: 'WA',
          country: 'USA',
        },
        extratags: {},
      },
    ];

    (COMMUNITY_RESOURCE_SEARCHES.healthcare as any).mockResolvedValue(mockResults);

    render(<ImportPlaces onClose={mockOnClose} />);

    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    const resourceTypeSelect = screen.getByLabelText('Resource Type');

    fireEvent.change(cityInput, { target: { value: 'Seattle' } });
    fireEvent.change(stateInput, { target: { value: 'WA' } });
    fireEvent.change(resourceTypeSelect, { target: { value: 'healthcare' } });

    const searchButton = screen.getByText('Search for healthcare');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Hospital')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('imports selected places', async () => {
    const mockResults = [
      {
        place_id: 1,
        name: 'Test Hospital',
        display_name: 'Test Hospital, 123 Main St, Seattle, WA',
        lat: '47.6062',
        lon: '-122.3321',
        type: 'hospital',
        class: 'amenity',
        address: {
          city: 'Seattle',
          state: 'WA',
          country: 'USA',
        },
        extratags: {},
      },
    ];

    (COMMUNITY_RESOURCE_SEARCHES.healthcare as any).mockResolvedValue(mockResults);
    (api.createPlace as any).mockResolvedValue({ id: '1', name: 'Test Hospital' });

    render(<ImportPlaces onClose={mockOnClose} />);

    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    const resourceTypeSelect = screen.getByLabelText('Resource Type');

    fireEvent.change(cityInput, { target: { value: 'Seattle' } });
    fireEvent.change(stateInput, { target: { value: 'WA' } });
    fireEvent.change(resourceTypeSelect, { target: { value: 'healthcare' } });

    const searchButton = screen.getByText('Search for healthcare');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Hospital')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const importButton = screen.getByText('Import Selected (1)');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(api.createPlace).toHaveBeenCalled();
    });
  });

  it('handles search errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (COMMUNITY_RESOURCE_SEARCHES.healthcare as any).mockRejectedValue(new Error('Search failed'));

    render(<ImportPlaces onClose={mockOnClose} />);

    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    const resourceTypeSelect = screen.getByLabelText('Resource Type');

    fireEvent.change(cityInput, { target: { value: 'Seattle' } });
    fireEvent.change(stateInput, { target: { value: 'WA' } });
    fireEvent.change(resourceTypeSelect, { target: { value: 'healthcare' } });

    const searchButton = screen.getByText('Search for healthcare');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ImportPlaces onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
