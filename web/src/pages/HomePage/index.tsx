/** @jsxImportSource @emotion/react */
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { nearbyShelters } from '@/mock/nearbyShelters';
import { useMap } from './hooks/useMap';

const HomePage = () => {
  const { handleMapReady, handleMyLocation } = useMap();

  return (
    <div>
      <MapView onMapReady={handleMapReady} shelters={nearbyShelters} />
      <MapOverlayButtons onMyLocation={handleMyLocation} />
    </div>
  );
};

export default HomePage;
