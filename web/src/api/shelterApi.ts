import { apiClient } from '@/api/client';

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
      // 고정된 대표 cluster 샘플 (화면 예시와 유사한 분포/카운트)
      const clusters: any[] = [
        { id: 'seoul-1', latitude: 37.5665, longitude: 126.978, count: 233 }, // 서울 대형
        { id: 'gyeonggi-north', latitude: 37.8, longitude: 127.0, count: 21 },
        { id: 'gangwon-east', latitude: 37.75, longitude: 128.9, count: 5 },
        { id: 'chungcheong-center', latitude: 36.372, longitude: 127.355, count: 37 }, // 대전 근처
        { id: 'jeonbuk-west', latitude: 35.8242, longitude: 127.148, count: 14 },
        { id: 'gyeongsang-south', latitude: 35.1796, longitude: 129.0756, count: 29 }, // 부산 근처
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
      // detail mock: bbox 안에서 여러 시드(가운데 포인트)를 생성한 뒤, 각 시드 주변에 개별 쉼터들을 배치
      const shelters: any[] = [];
      const seeds = [
        { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 },
        { lat: minLat + (maxLat - minLat) * 0.25, lng: minLng + (maxLng - minLng) * 0.3 },
        { lat: minLat + (maxLat - minLat) * 0.7, lng: minLng + (maxLng - minLng) * 0.6 },
      ];
      let id = 2000;
      seeds.forEach((s, si) => {
        const perSeed = 4 + Math.floor(Math.random() * 4); // 각 시드별 4~7개
        for (let i = 0; i < perSeed; i++) {
          // 시드 주변에 약간의 오프셋
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
      // 추가로 bbox 전체에 흩어진 소수 쉼터 몇 개
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

  // 개발용 목 데이터 강제 사용 플래그
  const useMockFlag = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_USE_MOCK;

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

  // 목데이터 강제 모드
  if (useMockFlag === 'true' || useMockFlag === true) {
    // eslint-disable-next-line no-console
    console.debug('[getSheltersByBbox] using MOCK data (VITE_USE_MOCK)', {
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
