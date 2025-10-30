type TmapAny = any;

const MapCache = {
  map: null as TmapAny | null,
  div: null as HTMLElement | null,

  // 새로 추가: 내 위치 마커 전역 저장
  myMarker: null as any | null,

  // container: 현재 렌더링된 wrapper element (mapRef.current)
  // createFn: 실제로 new window.Tmapv3.Map를 호출하는 함수 (container에 마운트되어야 함)
  async ensureMap(container: HTMLElement, createFn: () => any) {
    if (this.map && this.div) {
      // 기존 div가 다른 부모에 붙어있으면 새 부모에 옮김
      if (container && this.div.parentElement !== container) {
        container.appendChild(this.div);
      }
      // reattach marker to the reused map
      try {
        if (this.myMarker && typeof this.myMarker.setMap === 'function') {
          this.myMarker.setMap(this.map);
        }
      } catch {}
      return this.map;
    }

    // 새로 생성 (createFn은 container를 직접 사용하여 Map 생성)
    const mapInstance = createFn();
    // Tmap SDK의 Map 인스턴스에서 getDiv()를 제공하면 그 값을 저장
    const div =
      mapInstance && typeof mapInstance.getDiv === 'function' ? mapInstance.getDiv() : container;
    this.map = mapInstance;
    this.div = div instanceof HTMLElement ? div : null;

    // 새로 생성한 map에 기존에 저장된 myMarker가 있으면 붙여줌
    try {
      if (this.myMarker && typeof this.myMarker.setMap === 'function') {
        this.myMarker.setMap(this.map);
      }
    } catch {}

    return this.map;
  },

  // 내 위치 마커를 전역으로 하나만 유지하도록 하는 헬퍼들
  setMyMarkerOnMap(map: any, lat: number, lng: number, icon?: string | any) {
    try {
      // 이전 마커 제거(있으면)
      if (this.myMarker && typeof this.myMarker.setMap === 'function') {
        try {
          this.myMarker.setMap(null);
        } catch {}
      }

      // 새 마커 생성 및 저장
      const marker = new (window as any).Tmapv3.Marker({
        position: new (window as any).Tmapv3.LatLng(lat, lng),
        iconSize: new (window as any).Tmapv3.Size(50, 50),
        icon: icon,
        map: map,
      });
      this.myMarker = marker;
      return marker;
    } catch (err) {
      console.warn('setMyMarkerOnMap 실패', err);
      return null;
    }
  },

  updateMyMarkerPosition(lat: number, lng: number) {
    try {
      if (this.myMarker && typeof this.myMarker.setPosition === 'function') {
        this.myMarker.setPosition(new (window as any).Tmapv3.LatLng(lat, lng));
        return true;
      }
      // myMarker가 없지만 map이 있으면 생성
      if (this.map) {
        this.setMyMarkerOnMap(this.map, lat, lng);
        return true;
      }
    } catch (err) {
      console.warn('updateMyMarkerPosition 실패', err);
    }
    return false;
  },

  // 언마운트 시 map 자체는 파괴하지 않고 DOM에서만 제거
  detach() {
    try {
      if (this.div && this.div.parentElement) {
        this.div.parentElement.removeChild(this.div);
      }
      // 마커는 map에서 분리하되 인스턴스는 유지 (재사용 목적)
      try {
        if (this.myMarker && typeof this.myMarker.setMap === 'function') {
          this.myMarker.setMap(null);
        }
      } catch {}
    } catch (err) {
      // 안전하게 무시
    }
  },

  // (선택) 필요 시 캐시 완전 초기화
  destroy() {
    try {
      if (this.map && typeof this.map.destroy === 'function') {
        // Tmap 라이브러리가 destroy 메서드를 제공할 경우 호출
        this.map.destroy();
      }
    } catch {}
    this.map = null;
    this.div = null;
    this.myMarker = null;
  },
};

export default MapCache;
