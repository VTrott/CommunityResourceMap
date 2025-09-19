import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../../hooks/useCategories';
import type { PlaceSearchRequest } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const searchSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  name: z.string().optional(),
  status: z.string().default('active'),
  categoryIds: z.array(z.string()).optional(),
  page: z.number().default(0),
  size: z.number().default(10),
  sortBy: z.string().default('name'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSubmit: (values: PlaceSearchRequest) => void;
  onClear: () => void;
  loading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  onSubmit, 
  onClear, 
  loading = false 
}) => {
  const { data: categories = [] } = useCategories();
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema) as any,
    defaultValues: {
      status: 'active',
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDirection: 'asc',
    },
  });

  const handleSubmit = (values: any) => {
    const cleanValues = {
      ...values,
      categoryIds: values.categoryIds?.length ? values.categoryIds : undefined,
    };
    onSubmit(cleanValues);
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="card-modern">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            {...form.register('name')}
            label="Name"
            placeholder="Search by name"
          />
          
          <Input
            {...form.register('city')}
            label="City"
            placeholder="Enter city"
          />
          
          <Input
            {...form.register('state')}
            label="State"
            placeholder="Enter state"
          />
          
          <Select
            {...form.register('status')}
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: '', label: 'All' },
            ]}
          />
        </div>
        
        <div>
          <label className="block text-lg font-medium text-neutral-700 mb-4">
            Categories
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryOptions.map((option) => (
              <label key={option.value} className="flex items-center p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  {...form.register('categoryIds')}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-3 text-sm font-medium text-neutral-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="submit" loading={loading} size="lg" className="flex-1 sm:flex-none">
            🔍 Search Resources
          </Button>
          <Button type="button" variant="secondary" onClick={onClear} size="lg" className="flex-1 sm:flex-none">
            🗑️ Clear Filters
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
