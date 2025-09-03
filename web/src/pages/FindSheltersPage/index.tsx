/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import theme from '../../styles/theme';
import ShelterInfoCard from '../homepage/components/ShelterInfoCard';
import { nearbyShelters } from '../../mock/nearbyShelters';

const FindSheltersPage = () => {
  // '좋아요' 누른 쉼터의 id를 배열로 관리
  const [favoriteIds, setFavoriteIds] = useState<number[]>([2]); // 2번 쉼터는 기본으로 '좋아요'

  // 토스트 메시지 상태 관리
  const [toastMessage, setToastMessage] = useState<string>('');

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

  return (
    <div css={containerStyle}>
      <div css={listContainerStyle}>
        {nearbyShelters.map((shelter) => (
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

      {/* 토스트 메시지 */}
      {toastMessage && <div css={toastStyle}>{toastMessage}</div>}
    </div>
  );
};

export default FindSheltersPage;

const containerStyle = css`
  position: relative;
  padding: ${theme.spacing.spacing16} 0;
  margin: 0 auto;
  background: ${theme.colors.button.white};
`;

const listContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
  padding-bottom: ${theme.spacing.spacing16};
`;

const toastStyle = css`
  position: fixed;
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
