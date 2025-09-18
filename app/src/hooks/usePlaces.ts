import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, PlaceSearchRequest, CreatePlaceRequest, UpdatePlaceRequest } from '../services/api';

export const usePlaces = (searchParams: PlaceSearchRequest) => {
  return useQuery({
    queryKey: ['places', 'search', searchParams],
    queryFn: () => api.searchPlaces(searchParams),
  });
};

export const useCreatePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
};

export const useUpdatePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, place }: { id: string; place: UpdatePlaceRequest }) => 
      api.updatePlace(id, place),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deletePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
};
