/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import theme from '../../styles/theme';
import ShelterInfoCard from '../../components/ShelterInfoCard';
import { nearbyShelters } from '../../mock/nearbyShelters';
import { FaArrowUp } from 'react-icons/fa';

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  // '맨 위로 가기' 버튼 클릭 시 window를 스크롤
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div css={containerStyle}>
      <div css={listContainerStyle}>
        {nearbyShelters.slice(0, visibleCount).map((shelter) => (
          <ShelterInfoCard
            key={shelter.shelterId}
            shelter={shelter}
            variant="find"
            isFavorite={favoriteIds.includes(shelter.shelterId)}
            onToggleFavorite={() => handleToggleFavorite(shelter.shelterId)}
            onStart={() => console.log(`${shelter.name} 안내 시작`)}
          />
        ))}
      </div>

      <div css={bottomButtonContainerStyle}>
        {hasMoreItems ? (
          <button type="button" css={loadMoreButtonStyle} onClick={handleLoadMore}>
            더보기
          </button>
        ) : (
          <div /> // '더보기' 버튼이 없을 때 레이아웃 유지를 위한 빈 div
        )}

        {/* '맨 위로' 버튼을 조건부로 렌더링 */}
        {showScrollToTop && (
          <button type="button" css={scrollToTopButtonStyle} onClick={handleScrollToTop}>
            <FaArrowUp size={40} color="#ffffffff" />
          </button>
        )}
      </div>

      {toastMessage && <div css={toastStyle}>{toastMessage}</div>}
    </div>
  );
};

export default FindSheltersPage;

const containerStyle = css`
  position: relative;
  padding: ${theme.spacing.spacing18} 0;
  margin: 0 auto;
  background: ${theme.colors.text.blue};
  height: calc(100vh - ${theme.spacing.spacing18} - ${theme.spacing.spacing18});
`;

const listContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const bottomButtonContainerStyle = css`
  display: flex;
  justify-content: space-between; // 양쪽 끝으로 버튼을 배치
  align-items: center;
  padding: 0 18px; // 좌우 여백
  margin-top: 12px; // 리스트와의 간격
`;

// '맨 위로 가기' 버튼 스타일
const scrollToTopButtonStyle = css`
  background: ${theme.colors.button.black};
  padding: 0;
  display: flex;
  align-items: center;

  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: 10px;
`;

// '더보기' 버튼 스타일
const loadMoreButtonStyle = css`
  width: 40%;
  margin: 12px auto 0;
  padding: 6px 20px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background-color: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  font-size: ${theme.typography.body2Bold.fontSize};
  font-weight: ${theme.typography.body2Bold.fontWeight};
  cursor: pointer;
`;

const toastStyle = css`
  position: fixed;
  width: 70%;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  z-index: 2000;
  font-size: ${theme.typography.body2Bold.fontSize};
  animation: fadeInOut 2s ease-in-out forwards;

  @keyframes fadeInOut {
    0%,
    100% {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    10%,
    90% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;
