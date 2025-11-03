type TmapAny = any;

const MapCache = {
  map: null as TmapAny | null,
  div: null as HTMLElement | null,
  _persistentRoot: null as HTMLElement | null,

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
      // 즉시 체크
      if ((window as any).Tmapv3 && (window as any).Tmapv3.Map) {
        resolve(true);
        return;
      }
      // 빠른 폴링(50ms)로 변경 — 이전의 느린 쓰로틀 제거
      const intervalMs = 50;
      const id = setInterval(() => {
        if ((window as any).Tmapv3 && (window as any).Tmapv3.Map) {
          clearInterval(id);
          resolve(true);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          clearInterval(id);
          console.warn('Tmap SDK 로드 타임아웃');
          resolve(false);
        }
      }, intervalMs);
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

    // 이미 생성된 map이 있으면 div를 재부착(또는 영속 루트에서 가져와 붙임)하고
    // SDK에 따라 리레이아웃/리프레시를 시도한다.
    if (this.map && this.div) {
      try {
        // 보통 container가 주어지면 그 안에 붙임, 없으면 persistent root에 보관
        const target = container ?? this.getPersistentRoot();
        if (this.div.parentElement !== target) {
          target.appendChild(this.div);
        }
        // 마커 재부착 시도
        if (this.myMarker && typeof this.myMarker.setMap === 'function') {
          this.myMarker.setMap(this.map);
          if (this.lastIcon && typeof this.myMarker.setIcon === 'function') {
            try {
              this.myMarker.setIcon(this.lastIcon);
            } catch {}
          }
        }
        // reflow/refresh 시도: SDK마다 메소드명이 다르므로 여러 시도
        try {
          if (this.map && typeof (this.map as any).updateSize === 'function') {
            (this.map as any).updateSize();
          } else if (this.map && typeof (this.map as any).refresh === 'function') {
            (this.map as any).refresh();
          } else if (this.map && typeof (this.map as any).repaint === 'function') {
            (this.map as any).repaint();
          } else if (
            this.map &&
            typeof (this.map as any).setCenter === 'function' &&
            typeof (this.map as any).getCenter === 'function'
          ) {
            // 강제 redraw 트릭
            const c = (this.map as any).getCenter();
            (this.map as any).setCenter(c);
          }
        } catch {}
      } catch {}
      return this.map;
    }

    const mapInstance = createFn();
    const div =
      mapInstance && typeof mapInstance.getDiv === 'function' ? mapInstance.getDiv() : container;
    this.map = mapInstance;
    this.div = div instanceof HTMLElement ? div : null;

    // 최초 생성 시, div가 문서에 붙지 않으면 persistent root에 먼저 보관
    try {
      if (this.div && !this.div.parentElement) {
        this.getPersistentRoot().appendChild(this.div);
      }
    } catch {}

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
      // 제거 대신 영속 루트로 이동하여 SDK 인스턴스가 유지되도록 함
      if (this.div) {
        try {
          const persistent = this.getPersistentRoot();
          if (this.div.parentElement !== persistent) {
            persistent.appendChild(this.div);
          }
        } catch {
          // fallback: 직접 제거(최후 수단)
          try {
            if (this.div.parentElement) this.div.parentElement.removeChild(this.div);
          } catch {}
        }
      }
      try {
        // 페이지에서 분리 시 마커를 map에서 떼지 않음(인스턴스 유지). 만약 필요하면 setMap(null) 대신 재사용 유지
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

  // 영속 루트 엘리먼트 반환(없으면 생성)
  getPersistentRoot(): HTMLElement {
    if (this._persistentRoot) return this._persistentRoot;
    try {
      const id = 'tmap-persistent-root';
      let el = document.getElementById(id) as HTMLElement | null;
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        // 화면 밖에 두되 DOM에 남도록 (display:none은 일부 SDK 동작에 문제를 줄 수 있음)
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.top = '-9999px';
        el.style.width = '1px';
        el.style.height = '1px';
        el.style.overflow = 'hidden';
        document.body.appendChild(el);
      }
      this._persistentRoot = el;
    } catch (e) {
      this._persistentRoot = document.body;
    }
    return this._persistentRoot!;
  },
};

export default MapCache;
