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
      // 즉시 리다이렉트
      window.location.href = '/error';
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
    window.location.href = '/error';
  }
  throw err;
}

export const apiClient = {
  get: (url: string) =>
    fetch(`${BASE}${url}`, { credentials: 'include' }).then(parseResponse).catch(handleFetchError),
  post: (url: string, body?: any) =>
    fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(parseResponse)
      .catch(handleFetchError),
  patch: (url: string, body?: any) =>
    fetch(`${BASE}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(parseResponse)
      .catch(handleFetchError),
  delete: (url: string) =>
    fetch(`${BASE}${url}`, { method: 'DELETE', credentials: 'include' })
      .then(parseResponse)
      .catch(handleFetchError),
};
