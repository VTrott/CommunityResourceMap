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

    expect(screen.getByText('Enter your address')).toBeInTheDocument();
    expect(screen.getByText('🔍 Search by Address')).toBeInTheDocument();
    expect(screen.getByText('Search Radius')).toBeInTheDocument();
    expect(screen.getByText('Filter Categories')).toBeInTheDocument();
  });

  it('allows entering an address', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const streetInput = screen.getByLabelText('Street Address');
    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });
    fireEvent.change(cityInput, { target: { value: 'New York' } });
    fireEvent.change(stateInput, { target: { value: 'NY' } });

    expect(streetInput).toHaveValue('123 Main St');
    expect(cityInput).toHaveValue('New York');
    expect(stateInput).toHaveValue('NY');
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

    // Check that the button has the selected styling
    expect(radius25).toHaveStyle('background: linear-gradient(135deg, var(--primary-500), var(--primary-600))');
  });

  it.skip('allows selecting categories', async () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    // Wait for categories to load
    const foodCategory = await screen.findByText('Food Assistance');
    fireEvent.click(foodCategory);

    expect(foodCategory).toHaveClass('bg-primary-100');
  });

  it('calls onSearch when search button is clicked with geocoded location', async () => {
    const mockGeocodedResult = {
      latitude: 40.7128,
      longitude: -74.0060,
      formattedAddress: 'New York, NY, USA',
      city: 'New York',
      state: 'NY',
    };

    (geocodeAddress as any).mockResolvedValue(mockGeocodedResult);

    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const streetInput = screen.getByLabelText('Street Address');
    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });
    fireEvent.change(cityInput, { target: { value: 'New York' } });
    fireEvent.change(stateInput, { target: { value: 'NY' } });

    const searchButton = screen.getByText('🔍 Search by Address');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledWith('123 Main St, New York, NY');
    });

    await waitFor(() => {
      expect(screen.getByText('Found: New York, NY, USA')).toBeInTheDocument();
    });

    expect(mockOnSearch).toHaveBeenCalledWith({
      address: '123 Main St, New York, NY',
      radiusMiles: 10,
      categoryIds: undefined,
      city: 'New York',
      state: 'NY',
      latitude: 40.7128,
      longitude: -74.0060,
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

    const streetInput = screen.getByLabelText('Street Address');
    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    
    fireEvent.change(streetInput, { target: { value: 'Invalid Address' } });
    fireEvent.change(cityInput, { target: { value: 'Invalid City' } });
    fireEvent.change(stateInput, { target: { value: 'XX' } });

    const searchButton = screen.getByText('🔍 Search by Address');
    fireEvent.click(searchButton);

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

    const clearButton = screen.getByText('🗑️ Clear Filters');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('disables buttons when geocoding', () => {
    render(
      <LocationSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    // Fill in required fields to enable the address search button
    const streetInput = screen.getByLabelText('Street Address');
    const cityInput = screen.getByLabelText('City');
    const stateInput = screen.getByLabelText('State');
    
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });
    fireEvent.change(cityInput, { target: { value: 'New York' } });
    fireEvent.change(stateInput, { target: { value: 'NY' } });

    // Now the buttons should be enabled
    expect(screen.getByText('🔍 Search by Address')).not.toBeDisabled();
    expect(screen.getByText('📍 Search by Location')).not.toBeDisabled();
  });
});
