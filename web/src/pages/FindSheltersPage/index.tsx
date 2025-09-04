/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import theme from '../../styles/theme';
import { nearbyShelters } from '../../mock/nearbyShelters';
import ShelterList from './components/ShelterList';
import BottomControls from './components/BottomControls';
import ToastMessage from './components/ToastMessage';

const ITEMS_PER_PAGE = 3;

const FindSheltersPage = () => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([2]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const hasMoreItems = visibleCount < nearbyShelters.length;

  // 스크롤 이벤트를 window에서 감지하도록 수정한 useEffect
  useEffect(() => {
    const handleScroll = () => {
      // 페이지 전체의 스크롤 위치(window.scrollY)를 확인
      if (window.scrollY > 100) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    // window 객체에 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll);
    // 컴포넌트가 사라질 때 window의 이벤트 리스너를 제거
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // '좋아요' 버튼 클릭 핸들러
  const handleToggleFavorite = (shelterId: number) => {
    const isAlreadyFavorite = favoriteIds.includes(shelterId);

    if (isAlreadyFavorite) {
      setFavoriteIds((prev) => prev.filter((id) => id !== shelterId));
      setToastMessage('찜 목록에서 삭제되었습니다.');
    } else {
      setFavoriteIds((prev) => [...prev, shelterId]);
      setToastMessage('찜 목록에 추가되었습니다.');
    }
    setTimeout(() => setToastMessage(''), 2000);
  };

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  // '맨 위로 가기' 버튼 클릭 시 window를 스크롤
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div css={containerStyle}>
      <ShelterList
        shelters={nearbyShelters.slice(0, visibleCount)}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 하단 버튼 영역 컴포넌트 분리 */}
      <BottomControls
        hasMoreItems={hasMoreItems}
        onLoadMore={handleLoadMore}
        showScrollToTop={showScrollToTop}
        onScrollToTop={handleScrollToTop}
      />

      {/* ToastMessage 컴포넌트 사용 */}
      <ToastMessage message={toastMessage} />
    </div>
  );
};

export default FindSheltersPage;

const containerStyle = css`
  position: relative;
  padding: ${theme.spacing.spacing18} 0;
  margin: 0 auto;
  background: white;
  height: calc(100vh - ${theme.spacing.spacing18} - ${theme.spacing.spacing18});
`;
