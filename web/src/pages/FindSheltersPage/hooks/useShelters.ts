import { useState } from 'react';
//import { useQuery } from '@tanstack/react-query';
//import { getNearbyShelters } from '@/api/shelterApi';
// TODO: 추후 삭제 필요 - 개발 중 목데이터 import
import { nearbyShelters } from '@/mock/nearbyShelters';

export function useShelters() {
  // TODO: 실제 위치 정보 연동 시 아래 값 변경
  //const [latitude] = useState(37.5665);
  //const [longitude] = useState(126.978);

  // TODO: 추후 삭제 필요 - 개발 중 목데이터 사용
  const [shelters, _setShelters] = useState(nearbyShelters);

  // TODO: react-query로 쉼터 데이터 가져오기 (API 연동 시 사용)
  /*
  const {
    data: shelters = [],
    error,
    isLoading,
    refetch,
    
    // TODO: 실제 API 연동 시 아래 onError 추가
    onError: (err: any) => {
      // 공통 에러 응답이면 에러 페이지로 이동
      if (err && err.status && err.error && err.message) {
        navigate('/error', { state: err });
      }
    },
    
  } = useQuery({
    queryKey: ['nearbyShelters', latitude, longitude],
    queryFn: () => getNearbyShelters({ latitude, longitude }),
    retry: 1,
  });
  */

  // 더보기: 3개씩 보여주기
  const [visibleCount, setVisibleCount] = useState(3); // 초기값 3으로 변경

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const handleToggleFavorite = (shelterId: number) => {
    setFavoriteIds((prev) =>
      prev.includes(shelterId) ? prev.filter((id) => id !== shelterId) : [...prev, shelterId],
    );
    setToastMessage('찜 목록이 변경되었습니다.');
    setTimeout(() => setToastMessage(''), 1500);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3); // 3개씩 증가
  };

  const hasMoreItems = shelters.length > visibleCount;

  // TODO: 추후 삭제 필요 - 목데이터 사용 시 isLoading, error는 false/undefined로 처리
  const isLoading = false;
  const error = undefined;

  return {
    shelters: shelters.slice(0, visibleCount),
    favoriteIds,
    toastMessage,
    visibleCount,
    hasMoreItems,
    handleToggleFavorite,
    handleLoadMore,
    isLoading,
    error,
    // refetch: () => {}, // 필요시 목함수
  };
}
