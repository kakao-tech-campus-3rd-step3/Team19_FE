import { apiClient } from '@/api/client';

// 개발용: 런타임에서 목데이터 사용을 강제할 수 있도록 토글 및 검사 함수 추가
let _forceUseMock = false;
export function setForceUseMock(v: boolean) {
  _forceUseMock = Boolean(v);
}
function isMockEnabled(): boolean {
  if (_forceUseMock) return true;
  if (typeof window !== 'undefined' && (window as any).__USE_MOCK__ === true) return true;
  const meta = typeof import.meta !== 'undefined' ? (import.meta as any) : undefined;
  if (meta?.env?.VITE_USE_MOCK === 'true' || meta?.env?.VITE_USE_MOCK === true) return true;
  return false;
}

// FindSheltersPage에서 사용된 api 함수들

// 가까운 쉼터 조회
export async function getNearbyShelters({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const qs = `?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(
    String(longitude),
  )}`;
  const res = await apiClient.get(`/api/shelters/nearby${qs}`);
  return res && (res as any).data ? (res as any).data : res;
}

// 바운딩 박스 기반 쉼터/클러스터 조회
export async function getSheltersByBbox({
  minLat,
  minLng,
  maxLat,
  maxLng,
  zoom,
  page,
  size,
}: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoom: number;
  page?: number;
  size?: number;
}) {
  // 목데이터 생성기 (개선: 지도에서 눈에 띄는 cluster 분포 생성)
  const makeMock = () => {
    const spanLat = Math.abs(maxLat - minLat);
    const spanLng = Math.abs(maxLng - minLng);
    const useCluster = spanLat > 3 || spanLng > 3 || zoom < 13;

    if (useCluster) {
      const clusters: any[] = [
        { id: 'seoul-1', latitude: 37.5665, longitude: 126.978, count: 233 },
        { id: 'gyeonggi-north', latitude: 37.8, longitude: 127.0, count: 21 },
        { id: 'gangwon-east', latitude: 37.75, longitude: 128.9, count: 5 },
        { id: 'chungcheong-center', latitude: 36.372, longitude: 127.355, count: 37 },
        { id: 'jeonbuk-west', latitude: 35.8242, longitude: 127.148, count: 14 },
        { id: 'gyeongsang-south', latitude: 35.1796, longitude: 129.0756, count: 29 },
        { id: 'ulsan-east', latitude: 35.5384, longitude: 129.3114, count: 23 },
        { id: 'chungnam-south', latitude: 36.5, longitude: 126.7, count: 16 },
        {
          id: 'small-1',
          latitude: minLat + (maxLat - minLat) * 0.2,
          longitude: minLng + (maxLng - minLng) * 0.3,
          count: 7,
        },
        {
          id: 'small-2',
          latitude: minLat + (maxLat - minLat) * 0.7,
          longitude: minLng + (maxLng - minLng) * 0.6,
          count: 13,
        },
      ];

      return {
        mode: 'cluster',
        features: clusters,
        total: clusters.reduce((s, c) => s + (c.count || 0), 0),
      };
    } else {
      const shelters: any[] = [];
      const seeds = [
        { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 },
        { lat: minLat + (maxLat - minLat) * 0.25, lng: minLng + (maxLng - minLng) * 0.3 },
        { lat: minLat + (maxLat - minLat) * 0.7, lng: minLng + (maxLng - minLng) * 0.6 },
      ];
      let id = 2000;
      seeds.forEach((s, si) => {
        const perSeed = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < perSeed; i++) {
          const lat = Math.max(minLat, Math.min(maxLat, s.lat + (Math.random() - 0.5) * 0.02));
          const lng = Math.max(minLng, Math.min(maxLng, s.lng + (Math.random() - 0.5) * 0.02));
          shelters.push({
            shelterId: id++,
            name: `목데이터 쉼터 ${si + 1}-${i + 1}`,
            address: `샘플 주소 ${si + 1} - ${i + 1}`,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            distance: `${50 + Math.floor(Math.random() * 1200)}m`,
            isOutdoors: Math.random() > 0.6,
            operatingHours: {
              weekday: '09:00~18:00',
              weekend: '10:00~16:00',
            },
            averageRating: Number((2 + Math.random() * 3).toFixed(1)),
            photoUrl: `https://via.placeholder.com/320x200.png?text=Shelter+${id}`,
          });
        }
      });
      for (let j = 0; j < 6; j++) {
        const lat = minLat + Math.random() * (maxLat - minLat);
        const lng = minLng + Math.random() * (maxLng - minLng);
        shelters.push({
          shelterId: id++,
          name: `산발 쉼터 ${j + 1}`,
          address: `랜덤 주소 ${j + 1}`,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          distance: `${30 + Math.floor(Math.random() * 2000)}m`,
          isOutdoors: Math.random() > 0.5,
          operatingHours: {
            weekday: '09:00~20:00',
            weekend: '10:00~18:00',
          },
          averageRating: Number((2 + Math.random() * 3).toFixed(1)),
          photoUrl: `https://via.placeholder.com/320x200.png?text=Shelter+${id}`,
        });
      }
      return {
        mode: 'detail',
        features: shelters,
        total: shelters.length,
      };
    }
  };

  // build query string
  const params = new URLSearchParams();
  params.set('minLat', String(minLat));
  params.set('minLng', String(minLng));
  params.set('maxLat', String(maxLat));
  params.set('maxLng', String(maxLng));
  params.set('zoom', String(zoom));
  if (typeof page !== 'undefined') params.set('page', String(page));
  if (typeof size !== 'undefined') params.set('size', String(size));
  const qs = params.toString() ? `?${params.toString()}` : '';

  // 목데이터 허용 검사
  if (isMockEnabled()) {
    // eslint-disable-next-line no-console
    console.debug('[getSheltersByBbox] using MOCK data (mock enabled)', {
      minLat,
      minLng,
      maxLat,
      maxLng,
      zoom,
    });
    return makeMock();
  }

  try {
    const res = await apiClient.get(`/api/shelters${qs}`);
    return res && (res as any).data ? (res as any).data : res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[getSheltersByBbox] API call failed, falling back to MOCK data', err);
    return makeMock();
  }
}

// --- 추가: react-query용 fetcher / key 헬퍼 (FindSheltersPage에서 사용) ---
export const nearbySheltersQueryKey = (latitude: number, longitude: number) =>
  ['nearbyShelters', String(latitude), String(longitude)] as const;

export async function fetchNearbyShelters(latitude: number, longitude: number) {
  // 단순 wrapper: 기존 getNearbyShelters 재사용
  return getNearbyShelters({ latitude, longitude });
}

// 쉼터 상세 조회
export async function getShelterDetail({
  shelterId,
  latitude,
  longitude,
}: {
  shelterId: number;
  latitude?: number;
  longitude?: number;
}) {
  const params: string[] = [];
  if (typeof latitude !== 'undefined')
    params.push(`latitude=${encodeURIComponent(String(latitude))}`);
  if (typeof longitude !== 'undefined')
    params.push(`longitude=${encodeURIComponent(String(longitude))}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  const res = await apiClient.get(`/api/shelters/${shelterId}${qs}`);
  return res && (res as any).data ? (res as any).data : res;
}

// 쉼터 리뷰 조회
export async function getShelterReviews(shelterId: number, sort?: string) {
  const qs = sort ? `?sort=${encodeURIComponent(sort)}` : '';
  const res = await apiClient.get(`/api/shelters/${shelterId}/reviews${qs}`);
  return res && (res as any).data ? (res as any).data : res;
}
