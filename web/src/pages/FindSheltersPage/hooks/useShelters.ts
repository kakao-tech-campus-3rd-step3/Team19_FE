import { useState, useEffect } from 'react';
import { nearbyShelters } from '@/mock/nearbyShelters';
import { toggleWish } from '@/utils/wishApi';

const ITEMS_PER_PAGE = 3;

export const useShelters = () => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([2]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const hasMoreItems = visibleCount < nearbyShelters.length;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // wishApi를 활용한 찜 버튼 클릭 핸들러
  const handleToggleFavorite = async (shelterId: number, userId: number = 1) => {
    const isAlreadyFavorite = favoriteIds.includes(shelterId);

    const result = await toggleWish({
      shelterId,
      userId,
      isFavorite: isAlreadyFavorite,
    });

    if (result.success) {
      if (isAlreadyFavorite) {
        setFavoriteIds((prev) => prev.filter((id) => id !== shelterId));
      } else {
        setFavoriteIds((prev) => [...prev, shelterId]);
      }
    }
    setToastMessage(result.message);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    favoriteIds,
    toastMessage,
    visibleCount,
    showScrollToTop,
    hasMoreItems,
    handleToggleFavorite,
    handleLoadMore,
    handleScrollToTop,
  };
};
