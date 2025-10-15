const ENV_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BASE =
  import.meta.env.MODE === 'production' && ENV_BASE // production이면 env에 지정된 외부 API 사용
    ? ENV_BASE
    : ''; // 개발 중에는 빈 문자열 -> 상대경로(/api/...)로 요청되어 vite proxy 로우킹

async function parseResponse(res: Response) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = data || { status: res.status, message: res.statusText };

    // 서버 내부 오류(5xx) 혹은 치명적 응답은 에러 페이지로 이동
    if (typeof window !== 'undefined' && res.status >= 500) {
      try {
        sessionStorage.setItem(
          'apiError',
          JSON.stringify({
            status: res.status,
            message: err?.message ?? String(err),
            url: res.url,
          }),
        );
      } catch {
        // ignore
      }
      // 개발 중 리다이렉트 비활성화: 콘솔로 에러 확인하기 위해 주석 처리
      // TODO: 실제 서비스 시 주석 해제
      // window.location.href = '/error';
      console.error('[apiClient] 서버 에러 발생 (리다이렉트 주석 처리):', err);
    }

    throw err;
  }
  return data;
}

function handleFetchError(err: any) {
  // 네트워크/파싱 에러 등 fetch 자체 실패 시 처리
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        'apiError',
        JSON.stringify({
          message: err?.message ?? String(err),
        }),
      );
    } catch {
      // ignore
    }
    // 개발 중 리다이렉트 비활성화: 콘솔로 에러 확인하기 위해 주석 처리
    // TODO: 실제 서비스 시 주석 해제
    // window.location.href = '/error';
    console.error('[apiClient] fetch 실패 (리다이렉트 주석 처리):', err);
  }
  throw err;
}

async function fetchWithReissue(input: RequestInfo | URL, init: RequestInit = {}, retry = true) {
  try {
    const res = await fetch(input, init);
    if (res.status === 401 && retry) {
      try {
        // 시도: 쿠키 기반 리프레시 재발급
        const reissueRes = await fetch(`${BASE}/api/users/reissue`, {
          method: 'POST',
          credentials: 'include',
        });
        if (reissueRes.ok) {
          // 원 요청 1회 재시도
          const retryRes = await fetch(input, init);
          return parseResponse(retryRes);
        }
      } catch (e) {
        // 재발급 실패 시 원래 에러 처리 흐름으로
      }
      // 재발급 실패했거나 401 지속되면 에러 파싱 후 throw
      return parseResponse(res);
    }
    return parseResponse(res);
  } catch (err) {
    return handleFetchError(err);
  }
}

export const apiClient = {
  get: (url: string) => fetchWithReissue(`${BASE}${url}`, { credentials: 'include' }),
  post: (url: string, body?: any, options?: { headers?: Record<string, string> }) =>
    fetchWithReissue(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: (url: string, body?: any, options?: { headers?: Record<string, string> }) =>
    fetchWithReissue(`${BASE}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (url: string) =>
    fetchWithReissue(`${BASE}${url}`, { method: 'DELETE', credentials: 'include' }),
};
