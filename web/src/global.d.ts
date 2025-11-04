// src/global.d.ts
export {};

declare global {
  interface Window {
    kakao: any; // 전역 kakao 객체 선언
    Tmapv3: any; // 전역 TMAP SDK 객체 선언
    AndroidBridge?: {
      clearCookies: () => void;
      speakText: (text: string) => void;
      stopSpeaking: () => void;
    };
  }

  // kakao 네임스페이스 타입 선언 (간단 버전)
  namespace kakao {
    export namespace maps {
      class Map {
        constructor(container: HTMLElement, options: any);
        setCenter(latlng: LatLng): void;
        setLevel(level: number): void;
      }

      class LatLng {
        constructor(lat: number, lng: number);
      }

      class Marker {
        constructor(options: { position: LatLng; image?: MarkerImage });
        setMap(map: Map | null): void;
        setPosition(position: LatLng): void;
      }
    }
  }
}
