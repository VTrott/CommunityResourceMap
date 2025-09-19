import { api } from '../api';
import { mockPlace, mockSearchResponse } from '../../utils/test-utils';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = vi.fn();

describe('API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should fetch health status', async () => {
      const mockHealth = { status: 'UP', timestamp: '2024-01-01T00:00:00Z' };
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHealth),
      });

      const result = await api.getHealth();

      expect(result).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith('/api/health', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('searchPlaces', () => {
    it('should search places with filters', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      });

      const searchRequest = {
        city: 'New York',
        page: 0,
        size: 10,
      };

      const result = await api.searchPlaces(searchRequest);

      expect(result).toEqual(mockSearchResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest),
      });
    });
  });

  describe('createPlace', () => {
    it('should create a new place', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlace),
      });

      const newPlace = {
        name: 'Test Place',
        description: 'A test place',
        city: 'New York',
        state: 'NY',
        status: 'active',
        categories: [],
      };

      const result = await api.createPlace(newPlace);

      expect(result).toEqual(mockPlace);
      expect(global.fetch).toHaveBeenCalledWith('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(api.getHealth()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(api.getHealth()).rejects.toThrow('Network error');
    });
  });
});
