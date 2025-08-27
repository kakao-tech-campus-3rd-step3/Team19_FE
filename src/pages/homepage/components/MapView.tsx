/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';

interface Props {
  onMapReady?: (map: kakao.maps.Map) => void;
}

const MapView = ({ onMapReady }: Props) => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('map');
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapInstanceRef.current = map;
      if (onMapReady) onMapReady(map);
    });
  }, [onMapReady]);

  return <div id="map" css={mapStyle}></div>;
};

export default MapView;

const mapStyle = css`
  width: 100%;
  height: 100%;
  margin: 0;
`;
