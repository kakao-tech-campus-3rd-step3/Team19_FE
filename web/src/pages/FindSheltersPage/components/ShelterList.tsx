/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ShelterInfoCard from '@/components/ShelterInfoCard';

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
}

const ShelterList = ({ shelters, favoriteIds, onToggleFavorite }: Props) => {
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
    </div>
  );
};

export default ShelterList;

const listContainerStyle = css`
  display: flex;
  flex-direction: column;
`;
