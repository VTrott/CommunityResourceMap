import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlaceSearchRequest } from '../../types';
import { useCategories } from '../../hooks/useCategories';
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
    resolver: zodResolver(searchSchema),
    defaultValues: {
      status: 'active',
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDirection: 'asc',
    },
  });

  const handleSubmit = (values: SearchFormValues) => {
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categoryOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                value={option.value}
                {...form.register('categoryIds')}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          Search
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
