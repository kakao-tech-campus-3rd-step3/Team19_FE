type TmapAny = any;

const MapCache = {
  map: null as TmapAny | null,
  div: null as HTMLElement | null,

  // container: 현재 렌더링된 wrapper element (mapRef.current)
  // createFn: 실제로 new window.Tmapv3.Map를 호출하는 함수 (container에 마운트되어야 함)
  async ensureMap(container: HTMLElement, createFn: () => any) {
    if (this.map && this.div) {
      // 기존 div가 다른 부모에 붙어있으면 새 부모에 옮김
      if (container && this.div.parentElement !== container) {
        container.appendChild(this.div);
      }
      return this.map;
    }

    // 새로 생성 (createFn은 container를 직접 사용하여 Map 생성)
    const mapInstance = createFn();
    // Tmap SDK의 Map 인스턴스에서 getDiv()를 제공하면 그 값을 저장
    const div =
      mapInstance && typeof mapInstance.getDiv === 'function' ? mapInstance.getDiv() : container;
    this.map = mapInstance;
    this.div = div instanceof HTMLElement ? div : null;
    return this.map;
  },

  // 언마운트 시 map 자체는 파괴하지 않고 DOM에서만 제거
  detach() {
    try {
      if (this.div && this.div.parentElement) {
        this.div.parentElement.removeChild(this.div);
      }
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
  },
};

export default MapCache;
