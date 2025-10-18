/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ShelterInfoCard from '@/components/ShelterInfoCard';
import { useEffect, useRef } from 'react';

// API 응답과 호환되도록 optional 필드로 선언
interface Shelter {
  shelterId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  isOutdoors?: boolean;
  operatingHours?: {
    weekday?: string;
    weekend?: string;
  };
  averageRating?: number;
  photoUrl?: string;
}

// onToggleFavorite 시그니처은 (shelterId, isFavorite)
interface Props {
  shelters: Shelter[];
  favoriteIds: number[];
  onToggleFavorite: (shelterId: number, isFavorite: boolean) => void;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

const ShelterList = ({
  shelters,
  favoriteIds,
  onToggleFavorite,
  onLoadMore,
  isFetchingMore,
}: Props) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!onLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isFetchingMore) {
            onLoadMore();
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [onLoadMore, isFetchingMore]);

  return (
    <div css={listContainerStyle}>
      {shelters.map((shelter) => {
        const isFav = favoriteIds.includes(shelter.shelterId);
        return (
          <ShelterInfoCard
            key={shelter.shelterId}
            shelter={shelter as any} // ShelterInfoCard prop 타입이 엄격하면 매핑 필요
            variant="find"
            isFavorite={isFav}
            onToggleFavorite={() => onToggleFavorite(shelter.shelterId, isFav)}
            onStart={() => console.log(`${shelter.name} 안내 시작`)}
          />
        );
      })}
      {/* sentinel: 리스트 끝에서 더 불러오기 트리거 */}
      <div ref={sentinelRef} css={sentinelStyle} />
      {isFetchingMore && <div css={loadingMoreStyle}>로딩 중...</div>}
    </div>
  );
};

export default ShelterList;

const listContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const sentinelStyle = css`
  width: 100%;
  height: 1px;
`;

const loadingMoreStyle = css`
  text-align: center;
  padding: 12px 0;
`;
