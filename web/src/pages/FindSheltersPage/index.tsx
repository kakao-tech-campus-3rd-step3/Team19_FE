/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import theme from '../../styles/theme';
import ShelterInfoCard from '../homepage/components/ShelterInfoCard';
import { nearbyShelters } from '../../mock/nearbyShelters';

// 한 번에 보여줄 아이템의 개수를 상수로 정의하면 나중에 관리하기 편합니다.
const ITEMS_PER_PAGE = 3;

const FindSheltersPage = () => {
  // '좋아요' 누른 쉼터의 id를 배열로 관리
  const [favoriteIds, setFavoriteIds] = useState<number[]>([2]); // 2번 쉼터는 기본으로 '좋아요'

  // 토스트 메시지 상태 관리
  const [toastMessage, setToastMessage] = useState<string>('');

  // 화면에 보여줄 쉼터의 개수를 관리하는 상태
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // '좋아요' 버튼 클릭 핸들러
  const handleToggleFavorite = (shelterId: number) => {
    // 이미 '좋아요' 목록에 있는지 확인
    const isAlreadyFavorite = favoriteIds.includes(shelterId);

    if (isAlreadyFavorite) {
      // 있다면 목록에서 제거
      setFavoriteIds((prev) => prev.filter((id) => id !== shelterId));
      setToastMessage('찜 목록에서 삭제되었습니다.');
    } else {
      // 없다면 목록에 추가하고 토스트 메시지 띄우기
      setFavoriteIds((prev) => [...prev, shelterId]);
      setToastMessage('찜 목록에 추가되었습니다.');
    }
    // 2초 후에 토스트 메시지 사라지게 하기
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    // 보여줄 개수를 3개씩 늘립니다.
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  return (
    <div css={containerStyle}>
      <div
        css={listContainerStyle({
          hasMoreItems: visibleCount < nearbyShelters.length,
        })}
      >
        {/* 전체 데이터를 slice하여 visibleCount만큼만 렌더링합니다. */}
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

      {/* 더 보여줄 쉼터가 있을 경우에만 '더보기' 버튼을 렌더링합니다. */}
      {visibleCount < nearbyShelters.length && (
        <button type="button" css={loadMoreButtonStyle} onClick={handleLoadMore}>
          더보기
        </button>
      )}

      {/* 토스트 메시지 */}
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

const listContainerStyle = ({ hasMoreItems }: { hasMoreItems: boolean }) => css`
  display: flex;
  flex-direction: column;
  gap: 4px;

  // '더보기' 버튼이 없을 때(!hasMoreItems)만 하단 여백을 추가합니다.
  ${!hasMoreItems &&
  css`
    padding-bottom: ${theme.spacing.spacing18};
  `}
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
