import { api } from '../api';
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
      } as Response);

      const result = await api.getHealth();

      expect(result).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith('/api/health', {
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as Response);

      await expect(api.getHealth()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(api.getHealth()).rejects.toThrow('Network error');
    });
  });
});
