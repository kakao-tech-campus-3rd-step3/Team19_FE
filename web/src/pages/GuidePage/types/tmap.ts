// TMAP SDK 타입 정의
declare global {
  interface Window {
    Tmapv3: any;
  }
}

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface Shelter {
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

export interface RouteData {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: number[][] | number[][][];
    };
    properties: {
      index?: number;
      lineIndex?: number;
      pointIndex?: number;
      totalDistance?: number;
      totalTime?: number;
      distance?: number;
      time?: number;
      turnType?: number;
      pointType?: string;
      description?: string;
      name?: string;
    };
  }>;
}
