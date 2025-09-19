import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../../hooks/useCategories';
import type { Place, CreatePlaceRequest } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

const placeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.string().default('active'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  categoryIds: z.array(z.string()).optional(),
});

type PlaceFormValues = z.infer<typeof placeFormSchema>;

interface PlaceFormProps {
  initialData?: Place;
  onSubmit: (data: CreatePlaceRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PlaceForm: React.FC<PlaceFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const { data: categories = [] } = useCategories();
  
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      postalCode: initialData?.postalCode || '',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
      status: (initialData?.status as 'active' | 'inactive') || 'active',
      categoryIds: initialData?.categories?.map(c => c.id) || [],
    },
  });

  const handleSubmit = (values: any) => {
    const cleanValues = {
      ...values,
      website: values.website || undefined,
      email: values.email || undefined,
      categoryIds: values.categoryIds?.length ? values.categoryIds : undefined,
    };
    onSubmit(cleanValues);
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('name')}
          label="Name *"
          placeholder="Place name"
          error={form.formState.errors.name?.message}
        />
        
        <Select
          {...form.register('status')}
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        
        <Input
          {...form.register('city')}
          label="City"
          placeholder="City"
        />
        
        <Input
          {...form.register('state')}
          label="State"
          placeholder="State"
        />
        
        <Input
          {...form.register('phone')}
          label="Phone"
          placeholder="Phone number"
        />
        
        <Input
          {...form.register('email')}
          label="Email"
          type="email"
          placeholder="Email address"
          error={form.formState.errors.email?.message}
        />
        
        <Input
          {...form.register('website')}
          label="Website"
          type="url"
          placeholder="https://example.com"
          error={form.formState.errors.website?.message}
        />
        
        <Input
          {...form.register('latitude', { valueAsNumber: true })}
          label="Latitude"
          type="number"
          step="any"
          placeholder="47.6062"
        />
        
        <Input
          {...form.register('longitude', { valueAsNumber: true })}
          label="Longitude"
          type="number"
          step="any"
          placeholder="-122.3321"
        />
      </div>
      
      <div>
        <Textarea
          {...form.register('description')}
          label="Description"
          placeholder="Describe this place..."
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="space-y-2">
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
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Place' : 'Add Place'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PlaceForm;
