type TmapAny = any;

const MapCache = {
  map: null as TmapAny | null,
  div: null as HTMLElement | null,

  // 전역 내위치 마커(하나만 유지)
  myMarker: null as any | null,
  lastIcon: null as any | null,

  // SDK 로드/준비를 나타내는 전역 Promise (앱에서 반복 폴링을 피하기 위함)
  sdkReady: null as Promise<boolean> | null,

  // SDK 준비를 보장하는 헬퍼: 이미 준비중이면 기존 Promise 반환
  ensureSDKReady(timeoutMs = 15000) {
    if (this.sdkReady) return this.sdkReady;
    this.sdkReady = new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if ((window as any).Tmapv3 && (window as any).Tmapv3.Map) {
          resolve(true);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          console.warn('Tmap SDK 로드 타임아웃');
          resolve(false);
          return;
        }
        setTimeout(check, 300);
      };
      check();
    });
    return this.sdkReady;
  },

  async ensureMap(container: HTMLElement, createFn: () => any) {
    // SDK 준비 보장 (앱에서 느릴 수 있으니 await)
    const sdkOk = await this.ensureSDKReady();
    if (!sdkOk) {
      // SDK가 준비되지 않으면 createFn 호출하지 않고 null 반환
      console.warn('ensureMap: Tmap SDK가 준비되지 않았음');
      return null;
    }

    if (this.map && this.div) {
      if (container && this.div.parentElement !== container) {
        container.appendChild(this.div);
      }
      try {
        if (this.myMarker && typeof this.myMarker.setMap === 'function') {
          this.myMarker.setMap(this.map);
          if (this.lastIcon) {
            try {
              if (typeof this.myMarker.setIcon === 'function') {
                this.myMarker.setIcon(this.lastIcon);
              } else {
                const pos = this.myMarker.getPosition ? this.myMarker.getPosition() : null;
                this.myMarker.setMap(null);
                this.myMarker = new (window as any).Tmapv3.Marker({
                  position: pos,
                  iconSize: new (window as any).Tmapv3.Size(50, 50),
                  icon: this.lastIcon,
                  map: this.map,
                });
              }
            } catch {}
          }
        }
      } catch {}
      return this.map;
    }

    const mapInstance = createFn();
    const div =
      mapInstance && typeof mapInstance.getDiv === 'function' ? mapInstance.getDiv() : container;
    this.map = mapInstance;
    this.div = div instanceof HTMLElement ? div : null;

    try {
      if (this.myMarker && typeof this.myMarker.setMap === 'function') {
        this.myMarker.setMap(this.map);
        if (this.lastIcon) {
          try {
            if (typeof this.myMarker.setIcon === 'function') {
              this.myMarker.setIcon(this.lastIcon);
            }
          } catch {}
        }
      }
    } catch {}

    return this.map;
  },

  // myMarker를 하나만 유지하도록 재사용 로직 적용
  setMyMarkerOnMap(map: any, lat: number, lng: number, icon?: string | any) {
    try {
      const LatLng = (window as any).Tmapv3?.LatLng;
      if (!LatLng) throw new Error('Tmapv3 LatLng 없음');

      const pos = new LatLng(lat, lng);

      // 이미 전역 마커가 있으면 재사용(위치/맵)하고, 아이콘이 제공되면 적용 시도
      if (this.myMarker) {
        try {
          if (typeof this.myMarker.setPosition === 'function') {
            this.myMarker.setPosition(pos);
          }
          if (typeof this.myMarker.setMap === 'function') {
            this.myMarker.setMap(map);
          }

          if (icon) {
            if (typeof this.myMarker.setIcon === 'function') {
              // setIcon이 있으면 적용
              this.myMarker.setIcon(icon);
              this.lastIcon = icon;
              this.map = map;
              return this.myMarker;
            } else {
              // setIcon이 없으면 안전하게 제거 후 재생성
              try {
                this.myMarker.setMap(null);
              } catch {}
              this.myMarker = null;
            }
          } else {
            // 아이콘 미지정이면 위치/맵 갱신만으로 충분
            this.map = map;
            return this.myMarker;
          }
        } catch (err) {
          // 재사용 실패하면 제거 후 재생성
          try {
            this.myMarker.setMap(null);
          } catch {}
          this.myMarker = null;
        }
      }

      // 새로 생성 (아이콘 포함)
      const Marker = (window as any).Tmapv3?.Marker;
      const Size = (window as any).Tmapv3?.Size;
      if (!Marker) throw new Error('Tmapv3 Marker 없음');

      this.myMarker = new Marker({
        position: pos,
        iconSize: Size ? new Size(50, 50) : undefined,
        icon: icon ?? undefined,
        map: map,
      });

      this.lastIcon = icon ?? null;
      this.map = map;
      return this.myMarker;
    } catch (err) {
      console.warn('setMyMarkerOnMap 실패', err);
      return null;
    }
  },

  updateMyMarkerPosition(lat: number, lng: number) {
    try {
      const LatLng = (window as any).Tmapv3?.LatLng;
      if (!LatLng) return false;
      const pos = new LatLng(lat, lng);

      if (this.myMarker && typeof this.myMarker.setPosition === 'function') {
        this.myMarker.setPosition(pos);
        return true;
      }

      // myMarker가 없지만 map이 있으면 lastIcon으로 생성
      if (this.map) {
        this.setMyMarkerOnMap(this.map, lat, lng, this.lastIcon ?? undefined);
        return true;
      }
    } catch (err) {
      console.warn('updateMyMarkerPosition 실패', err);
    }
    return false;
  },

  // 마커 완전 제거(필요 시 호출)
  clearMyMarker() {
    try {
      if (this.myMarker && typeof this.myMarker.setMap === 'function') {
        this.myMarker.setMap(null);
      }
    } catch {}
    this.myMarker = null;
    this.lastIcon = null;
  },

  detach() {
    try {
      if (this.div && this.div.parentElement) {
        this.div.parentElement.removeChild(this.div);
      }
      try {
        if (this.myMarker && typeof this.myMarker.setMap === 'function') {
          // 페이지에서 분리할 때는 마커를 map에서 떼지만 인스턴스는 유지
          this.myMarker.setMap(null);
        }
      } catch {}
    } catch {}
  },

  destroy() {
    try {
      if (this.map && typeof this.map.destroy === 'function') {
        this.map.destroy();
      }
    } catch {}
    this.map = null;
    this.div = null;
    this.myMarker = null;
    this.lastIcon = null;
  },
};

export default MapCache;
