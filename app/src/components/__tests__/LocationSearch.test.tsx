import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';
import LocationSearch from '../LocationSearch';

vi.mock('../../services/geocoding', () => ({
  geocodeAddress: vi.fn(),
  RADIUS_OPTIONS: [
    { value: 10, label: '10 miles' },
    { value: 15, label: '15 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
  ],
}));

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: '1', name: 'Food Assistance', slug: 'food-assistance' },
      { id: '2', name: 'Healthcare', slug: 'healthcare' },
    ],
    isLoading: false,
  }),
}));

import { geocodeAddress } from '../../services/geocoding';

describe('LocationSearch', () => {
  const mockOnSearch = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the search form', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByLabelText('Enter your address')).toBeInTheDocument();
    expect(screen.getByText('Find Location')).toBeInTheDocument();
    expect(screen.getByText('Search radius')).toBeInTheDocument();
    expect(screen.getByText('Filter by category (optional)')).toBeInTheDocument();
  });

  it('allows entering an address', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const addressInput = screen.getByLabelText('Enter your address');
    fireEvent.change(addressInput, { target: { value: '123 Main St, New York, NY' } });

    expect(addressInput).toHaveValue('123 Main St, New York, NY');
  });

  it('allows selecting radius options', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const radius25 = screen.getByText('25 miles');
    fireEvent.click(radius25);

    expect(radius25).toHaveClass('bg-blue-600');
  });

  it('allows selecting categories', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const foodCategory = screen.getByText('Food Assistance');
    fireEvent.click(foodCategory);

    expect(foodCategory).toHaveClass('bg-blue-100');
  });

  it('calls onSearch when search button is clicked with geocoded location', async () => {
    const mockGeocodedResult = {
      latitude: 40.7128,
      longitude: -74.0060,
      formattedAddress: 'New York, NY, USA',
    };

    (geocodeAddress as any).mockResolvedValue(mockGeocodedResult);

    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const addressInput = screen.getByLabelText('Enter your address');
    fireEvent.change(addressInput, { target: { value: 'New York, NY' } });

    const findLocationButton = screen.getByText('Find Location');
    fireEvent.click(findLocationButton);

    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledWith('New York, NY');
    });

    await waitFor(() => {
      expect(screen.getByText('✓ Found: New York, NY, USA')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('Search Nearby Places');
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith({
      address: 'New York, NY',
      radiusMiles: 15,
      categoryIds: undefined,
    });
  });

  it('shows error when geocoding fails', async () => {
    (geocodeAddress as any).mockRejectedValue(new Error('Geocoding failed'));

    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const addressInput = screen.getByLabelText('Enter your address');
    fireEvent.change(addressInput, { target: { value: 'Invalid Address' } });

    const findLocationButton = screen.getByText('Find Location');
    fireEvent.click(findLocationButton);

    await waitFor(() => {
      expect(screen.getByText('Geocoding failed')).toBeInTheDocument();
    });
  });

  it('calls onClear when clear button is clicked', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        loading={true}
      />
    );

    expect(screen.getByText('Find Location')).toBeDisabled();
    expect(screen.getByText('Search Nearby Places')).toBeDisabled();
  });
});
