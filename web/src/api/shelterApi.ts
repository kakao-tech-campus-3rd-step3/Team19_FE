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
  // optional: 클라이언트 현재 위치(전달되면 서버에 함께 보냄)
  userLat,
  userLng,
}: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoom: number;
  page?: number;
  size?: number;
  userLat?: number;
  userLng?: number;
}) {
  // build query string according to spec
  const params = new URLSearchParams();
  params.set('minLat', String(minLat));
  params.set('minLng', String(minLng));
  params.set('maxLat', String(maxLat));
  params.set('maxLng', String(maxLng));
  params.set('zoom', String(zoom));
  // user 위치가 주어진 경우 쿼리에 포함
  if (typeof userLat !== 'undefined' && isFinite(Number(userLat))) {
    params.set('userLat', String(userLat));
  }
  if (typeof userLng !== 'undefined' && isFinite(Number(userLng))) {
    params.set('userLng', String(userLng));
  }
  if (typeof page !== 'undefined') params.set('page', String(page));
  if (typeof size !== 'undefined') params.set('size', String(size));
  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await apiClient.get(`/api/shelters${qs}`);
    const data = res && (res as any).data ? (res as any).data : res;

    // Basic validation/coercion to match the interface:
    // expected: { mode: 'cluster'|'detail', features: Array, total: number }
    if (
      data &&
      Array.isArray(data.features) &&
      (data.mode === 'cluster' || data.mode === 'detail')
    ) {
      return data;
    }

    // If backend returns an array directly, wrap as detail
    if (Array.isArray(data)) {
      return { mode: 'detail', features: data, total: data.length };
    }

    // Otherwise, log and return a safe empty shape
    // eslint-disable-next-line no-console
    console.warn('[getSheltersByBbox] unexpected response shape, returning empty result', { data });
    return { mode: 'cluster', features: [], total: 0 };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[getSheltersByBbox] API call failed', err);
    // Do not return mock data — return empty response shape so caller can handle gracefully
    return { mode: 'cluster', features: [], total: 0 };
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

// 쉼터 도착 알림 (리뷰 푸시 알림 트리거용)
// BE가 10분 후 FCM 푸시 알림을 자동으로 발송합니다.
export async function notifyShelterArrival(shelterId: number) {
  const res = await apiClient.post(`/api/shelters/${shelterId}/arrival`);
  return res && (res as any).data ? (res as any).data : res;
}

// 전체 쉼터 조회 (백엔드: /api/shelters/all)
// latitude, longitude: 지도 중앙 좌표 (필수)
export async function getAllShelters({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  try {
    const params = new URLSearchParams();
    params.set('latitude', String(latitude));
    params.set('longitude', String(longitude));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/api/shelters/all${qs}`);
    return res && (res as any).data ? (res as any).data : res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[getAllShelters] API call failed', err);
    return [];
  }
}

// wrapper: react-query 등에서 사용하기 위한 간단한 fetcher
export async function fetchAllShelters(latitude: number, longitude: number) {
  return getAllShelters({ latitude, longitude });
}

// 목데이터: bbox -> count 매핑 (userLat/userLng 무시)
const MOCK_BBOX_RESPONSES: Array<{
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoom: number;
  count: number;
}> = [
  {
    minLat: 37.95533338655539,
    minLng: 128.03898239703395,
    maxLat: 38.332622101196655,
    maxLng: 128.27915295450572,
    zoom: 10,
    count: 56,
  },
  {
    minLat: 37.695039721445994,
    minLng: 127.75470521590385,
    maxLat: 37.87593868375277,
    maxLng: 127.86929881725872,
    zoom: 11,
    count: 19,
  },
  {
    minLat: 37.50383961065654,
    minLng: 127.50509227294503,
    maxLat: 37.68507003611504,
    maxLng: 127.61960048951426,
    zoom: 11,
    count: 29,
  },
  {
    minLat: 36.47919500342009,
    minLng: 127.6544121416554,
    maxLat: 37.055721860623926,
    maxLng: 128.014719930814,
    zoom: 10,
    count: 588,
  },
  {
    minLat: 36.31497035919653,
    minLng: 126.6142183495327,
    maxLat: 36.520311197567544,
    maxLng: 126.74196729972924,
    zoom: 11,
    count: 145,
  },
  {
    minLat: 35.7537793366011,
    minLng: 126.99043582751237,
    maxLat: 36.23862115989276,
    maxLng: 127.29045268647435,
    zoom: 10,
    count: 1475,
  },
  {
    minLat: 35.45991594141807,
    minLng: 127.7886311803829,
    maxLat: 35.698013141631385,
    maxLng: 127.93519201684597,
    zoom: 11,
    count: 289,
  },
  {
    minLat: 35.58064724159706,
    minLng: 128.47533883572743,
    maxLat: 35.958699262410306,
    maxLng: 128.70860617390989,
    zoom: 10,
    count: 790,
  },
  {
    minLat: 34.24346989234865,
    minLng: 126.31933315934577,
    maxLat: 34.7175787792389,
    maxLng: 126.60727637915629,
    zoom: 10,
    count: 79,
  },
  {
    minLat: 36.829987881275024,
    minLng: 126.57948445474788,
    maxLat: 37.95049877380785,
    maxLng: 127.28555617673328,
    zoom: 9,
    count: 11106,
  },
  {
    minLat: 36.02814028605219,
    minLng: 127.19656245100066,
    maxLat: 36.596631432558176,
    maxLng: 127.54976309258838,
    zoom: 10,
    count: 1795,
  },
  {
    minLat: 34.868123444736064,
    minLng: 126.73771391600053,
    maxLat: 35.36964278459184,
    maxLng: 127.04467249640872,
    zoom: 10,
    count: 2384,
  },
  {
    minLat: 34.437989331122594,
    minLng: 128.64466549371025,
    maxLat: 35.84170676602778,
    maxLng: 129.50407956418,
    zoom: 8,
    count: 4379,
  },
  {
    minLat: 36.67295424526772,
    minLng: 127.68632010605394,
    maxLat: 38.71586769780013,
    maxLng: 128.9789970699977,
    zoom: 8,
    count: 2946,
  },
  {
    minLat: 36.418894542216414,
    minLng: 127.26342771114311,
    maxLat: 37.97123781690222,
    maxLng: 128.23910762372907,
    zoom: 8,
    count: 4815,
  },
  {
    minLat: 36.936905535282236,
    minLng: 128.98424118424313,
    maxLat: 37.404728995164675,
    maxLng: 129.27816594589189,
    zoom: 10,
    count: 54,
  },
  {
    minLat: 35.722691371022144,
    minLng: 127.81535704050269,
    maxLat: 36.903795338361256,
    maxLng: 128.54919973415332,
    zoom: 9,
    count: 2604,
  },
  {
    minLat: 35.172417692750535,
    minLng: 127.14782099870327,
    maxLat: 36.13429450691451,
    maxLng: 127.74046890862962,
    zoom: 9,
    count: 2993,
  },
  {
    minLat: 34.18621055531236,
    minLng: 127.30034099183918,
    maxLat: 35.35495297145575,
    maxLng: 128.01266586616617,
    zoom: 9,
    count: 2571,
  },
  {
    minLat: 32.70029710445574,
    minLng: 126.19666850269277,
    maxLat: 33.933279701018634,
    maxLng: 126.93537425815761,
    zoom: 9,
    count: 579,
  },
  {
    minLat: 34.10327203563395,
    minLng: 126.16765402135339,
    maxLat: 34.76161607393803,
    maxLng: 126.56726170277551,
    zoom: 9,
    count: 294,
  },
  {
    minLat: 36.26261457223133,
    minLng: 128.2116068932984,
    maxLat: 37.73238603509607,
    maxLng: 129.13297640509782,
    zoom: 8,
    count: 1944,
  },
  {
    minLat: 36.53475656101453,
    minLng: 128.84666147330358,
    maxLat: 37.38775027296139,
    maxLng: 129.3811102618814,
    zoom: 9,
    count: 262,
  },
];

// 범위 겹침 검사
const bboxIntersects = (
  a: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  b: { minLat: number; minLng: number; maxLat: number; maxLng: number },
) => {
  return !(
    a.maxLat < b.minLat ||
    a.minLat > b.maxLat ||
    a.maxLng < b.minLng ||
    a.minLng > b.maxLng
  );
};

// 목 항목 -> feature 변환 (목박스 중심으로 위치 설정)
function mockEntryToFeature(m: (typeof MOCK_BBOX_RESPONSES)[number], idx: number) {
  const centerLat = (m.minLat + m.maxLat) / 2;
  const centerLng = (m.minLng + m.maxLng) / 2;
  return {
    id: `mock_bbox_${idx}`,
    latitude: centerLat,
    longitude: centerLng,
    count: m.count,
    raw: { ...m },
  };
}

// fetcher: bbox로 실제 호출 또는 mock 반환
export async function fetchSheltersByBbox(
  payload: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
    zoom: number;
    page?: number;
    size?: number;
    userLat?: number;
    userLng?: number;
  },
  useMock = false,
) {
  try {
    // useMock이면 userLat/userLng/zoom 무시하고 bbox 겹침 기준으로 모든 매칭 목데이터를 반환
    if (useMock) {
      const reqBbox = {
        minLat: Number(payload.minLat),
        minLng: Number(payload.minLng),
        maxLat: Number(payload.maxLat),
        maxLng: Number(payload.maxLng),
      };

      const matches: Array<(typeof MOCK_BBOX_RESPONSES)[number]> = MOCK_BBOX_RESPONSES.filter((m) =>
        bboxIntersects(reqBbox, m),
      );

      if (matches.length > 0) {
        const features = matches.map((m, i) => mockEntryToFeature(m, i));
        const total = matches.reduce((acc, cur) => acc + (Number(cur.count) || 0), 0);
        return {
          mode: 'cluster' as const,
          features,
          total,
          rawResponse: {
            level: 'cluster',
            items: matches.map((m, i) => ({
              '@type': 'cluster',
              id: `mock_bbox_${i}`,
              latitude: (m.minLat + m.maxLat) / 2,
              longitude: (m.minLng + m.maxLng) / 2,
              count: m.count,
            })),
            total,
          },
        };
      }

      // 매칭 없으면 빈 cluster 반환
      return {
        mode: 'cluster' as const,
        features: [],
        total: 0,
        rawResponse: { level: 'cluster', items: [], total: 0 },
      };
    }

    // 실제 호출
    const res = await getSheltersByBbox(payload as any);
    return res;
  } catch (err) {
    console.error('[fetchSheltersByBbox] error', err);
    return { mode: 'cluster' as const, features: [], total: 0 };
  }
}
