import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/api/userApi';
import { getMyProfile } from '@/api/userApi';

export const useUser = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserProfile, any>({
    queryKey: ['user', 'me'],
    queryFn: getMyProfile,
    retry: 1,
  });

  return { user: user ?? null, error, isLoading };
};
