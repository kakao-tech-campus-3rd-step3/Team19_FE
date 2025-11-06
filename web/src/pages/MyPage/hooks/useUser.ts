import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/api/userApi';
import { getMyProfile } from '@/api/userApi';

export const useUser = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserProfile, any>({
    // EditProfile과 동일한 키 사용하여 캐시를 공유
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
    retry: 1,
  });

  return { user: user ?? null, error, isLoading };
};
