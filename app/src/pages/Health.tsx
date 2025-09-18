import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const schema = z.object({
  echo: z.string().min(1, 'Enter any text'),
});

type FormValues = z.infer<typeof schema>;

export default function HealthPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchOnWindowFocus: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { echo: '' },
  });

  const onSubmit = (values: FormValues) => {
    void refetch();
    console.log('Echo:', values.echo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Health Status</h1>
          <p className="mt-2 text-gray-600">Backend service health monitoring</p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${data?.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h2 className="text-lg font-semibold text-gray-900">
                Service Status: {data?.status || 'Unknown'}
              </h2>
            </div>
            
            {isLoading || isFetching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading health status...</p>
              </div>
            ) : error ? (
              <div className="text-red-800">
                <h3 className="font-semibold">Error loading health status</h3>
                <p className="mt-1">{(error as Error).message}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Echo</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('echo')}
                label="Echo text"
                placeholder="Type anything to test the API"
                error={errors.echo?.message}
              />
              <Button type="submit" loading={isFetching}>
                Test API
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}


