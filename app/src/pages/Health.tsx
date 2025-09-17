import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api';

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
    <div style={{ padding: 16 }}>
      <h2>Health</h2>
      <div>
        {isLoading || isFetching ? 'Loading...' : error ? `Error: ${(error as Error).message}` : (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 16 }}>
        <label>
          Echo text:
          <input {...register('echo')} placeholder="Type anything" />
        </label>
        {errors.echo && <div style={{ color: 'red' }}>{errors.echo.message}</div>}
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}


