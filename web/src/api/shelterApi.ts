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
    minLat: 36.90879286144031,
    minLng: 126.51810091292656,
    maxLat: 37.90711751708315,
    maxLng: 127.14732318664643,
    zoom: 9,
    count: 9366,
  },
  {
    minLat: 36.90879286134434,
    minLng: 127.11551795764356,
    maxLat: 37.90711751698871,
    maxLng: 127.74474023136355,
    zoom: 9,
    count: 3723,
  },
  {
    minLat: 36.92174114711064,
    minLng: 127.75432231067931,
    maxLat: 37.91989437272166,
    maxLng: 128.38354458439935,
    zoom: 9,
    count: 1168,
  },
  {
    minLat: 36.92893369771003,
    minLng: 128.3931266700107,
    maxLat: 37.92699167528978,
    maxLng: 129.02234894373078,
    zoom: 9,
    count: 425,
  },
  {
    minLat: 35.9343825056137,
    minLng: 128.53480686797673,
    maxLat: 36.94546392948026,
    maxLng: 129.16402914169672,
    zoom: 9,
    count: 1406,
  },
  {
    minLat: 35.93583942023542,
    minLng: 127.89060418858283,
    maxLat: 36.94690198364158,
    maxLng: 128.519826462303,
    zoom: 9,
    count: 1735,
  },
  {
    minLat: 35.9227256665918,
    minLng: 127.24100313232783,
    maxLat: 36.93395797075989,
    maxLng: 127.87022540604787,
    zoom: 9,
    count: 3528,
  },
  {
    minLat: 35.93146843682097,
    minLng: 126.58421425847811,
    maxLat: 36.94258758278651,
    maxLng: 127.2134365321983,
    zoom: 9,
    count: 5081,
  },
  {
    minLat: 34.37774214251087,
    minLng: 126.46099864526566,
    maxLat: 35.51403459614254,
    maxLng: 127.15502226860019,
    zoom: 9,
    count: 5829,
  },
  {
    minLat: 34.38092849906391,
    minLng: 127.28141457037431,
    maxLat: 35.51717709482236,
    maxLng: 127.97543819370884,
    zoom: 9,
    count: 3243,
  },
  {
    minLat: 34.47009759941897,
    minLng: 128.04584927232665,
    maxLat: 35.605117452119686,
    maxLng: 128.73987289566125,
    zoom: 9,
    count: 4050,
  },
  {
    minLat: 34.490783791631934,
    minLng: 128.81221430325564,
    maxLat: 35.625518205376686,
    maxLng: 129.50623792659016,
    zoom: 9,
    count: 2851,
  },
  {
    minLat: 32.62543414412441,
    minLng: 126.08299282350474,
    maxLat: 34.19118625140804,
    maxLng: 127.02207580341494,
    zoom: 8,
    count: 625,
  },
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
