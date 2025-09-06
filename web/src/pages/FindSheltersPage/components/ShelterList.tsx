/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ShelterInfoCard from '@/components/ShelterInfoCard';

interface Shelter {
  shelterId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  isOutdoors: boolean;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
  averageRating: number;
  photoUrl: string;
}

interface Props {
  shelters: Shelter[];
  favoriteIds: number[];
  onToggleFavorite: (shelterId: number) => void;
}

const ShelterList = ({ shelters, favoriteIds, onToggleFavorite }: Props) => {
  return (
    <div css={listContainerStyle}>
      {shelters.map((shelter) => (
        <ShelterInfoCard
          key={shelter.shelterId}
          shelter={shelter}
          variant="find"
          isFavorite={favoriteIds.includes(shelter.shelterId)}
          onToggleFavorite={() => onToggleFavorite(shelter.shelterId)}
          onStart={() => console.log(`${shelter.name} 안내 시작`)}
        />
      ))}
    </div>
  );
};

export default ShelterList;

const listContainerStyle = css`
  display: flex;
  flex-direction: column;
`;
