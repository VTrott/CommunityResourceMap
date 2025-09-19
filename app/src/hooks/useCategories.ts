import { useQuery } from '@tanstack/react-query';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Mock categories for now - in a real app, this would come from the API
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Food Assistance', slug: 'food-assistance' },
  { id: '2', name: 'Healthcare', slug: 'healthcare' },
  { id: '3', name: 'Housing', slug: 'housing' },
  { id: '4', name: 'Legal Aid', slug: 'legal-aid' },
  { id: '5', name: 'Family Services', slug: 'family-services' },
  { id: '6', name: 'Employment', slug: 'employment' },
  { id: '7', name: 'Education', slug: 'education' },
];

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return MOCK_CATEGORIES;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
