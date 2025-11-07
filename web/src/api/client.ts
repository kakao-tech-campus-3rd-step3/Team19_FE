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

// ===== 토큰 저장/조회 유틸 (로그인/재발급 기반 헤더 주입용) =====
type AuthTokens = { accessToken?: string | null; refreshToken?: string | null };
const ACCESS_KEY = 'auth.accessToken';
const REFRESH_KEY = 'auth.refreshToken';

export function getStoredTokens(): AuthTokens {
  if (typeof window === 'undefined') return {};
  try {
    return {
      accessToken: localStorage.getItem(ACCESS_KEY),
      refreshToken: localStorage.getItem(REFRESH_KEY),
    };
  } catch {
    return {};
  }
}

export function setStoredTokens(tokens: AuthTokens) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof tokens.accessToken !== 'undefined') {
      if (tokens.accessToken) localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      else localStorage.removeItem(ACCESS_KEY);
    }
    if (typeof tokens.refreshToken !== 'undefined') {
      if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
      else localStorage.removeItem(REFRESH_KEY);
    }
  } catch {
    // ignore
  }
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
}

/**
 * WebView의 쿠키를 삭제합니다 (Android 앱에서만 동작)
 * WebView JS 브릿지를 통해 네이티브 쿠키 관리자를 호출합니다.
 */
export function clearWebViewCookies() {
  if (typeof window === 'undefined') return;
  try {
    if (window.AndroidBridge?.clearCookies) {
      window.AndroidBridge.clearCookies();
    }
  } catch {
    // 브릿지가 없거나 실패해도 조용히 처리
  }
}

/**
 * 앱 시작 시 선제적으로 토큰 재발급 시도
 * refreshToken이 있거나 쿠키가 있으면 재발급을 시도하고, 실패해도 조용히 처리합니다.
 * @returns 성공 여부 (boolean)
 */
export async function tryReissueTokensSilently(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const { refreshToken } = getStoredTokens();

  // refreshToken이 없고 쿠키도 없을 가능성이 높으면 시도하지 않음
  // 하지만 쿠키는 확인할 수 없으므로, refreshToken이 없어도 쿠키 기반으로 시도
  try {
    const reissueHeaders = new Headers();
    if (refreshToken) {
      reissueHeaders.set('Authorization-Refresh', `Bearer ${refreshToken}`);
    }

    const reissueRes = await fetch(`${BASE}/api/users/reissue`, {
      method: 'POST',
      credentials: 'include',
      headers: reissueHeaders,
    });

    if (reissueRes.ok) {
      // 재발급 성공 시 토큰 저장
      try {
        const txt = await reissueRes.text();
        const json = txt ? JSON.parse(txt) : null;
        if (json && (json.accessToken || json.refreshToken)) {
          setStoredTokens({
            accessToken: json.accessToken ?? null,
            refreshToken: json.refreshToken ?? null,
          });
        }
      } catch {
        // 파싱 실패는 무시
      }
      return true;
    }
  } catch {
    // 네트워크 에러 등은 조용히 무시
  }

  return false;
}

async function fetchWithReissue(input: RequestInfo | URL, init: RequestInit = {}, retry = true) {
  try {
    // Authorization 헤더 주입: accessToken 보유 시
    const headers = new Headers(init.headers || {});
    const { accessToken, refreshToken } = getStoredTokens();
    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 && retry) {
      try {
        // 시도: 쿠키 기반 리프레시 재발급
        const reissueHeaders = new Headers();
        if (refreshToken) reissueHeaders.set('Authorization-Refresh', `Bearer ${refreshToken}`);
        const reissueRes = await fetch(`${BASE}/api/users/reissue`, {
          method: 'POST',
          credentials: 'include',
          headers: reissueHeaders,
        });
        if (reissueRes.ok) {
          // 재발급 토큰 저장 시도
          try {
            const txt = await reissueRes.text();
            const json = txt ? JSON.parse(txt) : null;
            if (json && (json.accessToken || json.refreshToken)) {
              setStoredTokens({
                accessToken: json.accessToken ?? accessToken ?? null,
                refreshToken: json.refreshToken ?? refreshToken ?? null,
              });
            }
          } catch {
            // ignore parse errors
          }
          // 원 요청 1회 재시도
          const retryHeaders = new Headers(init.headers || {});
          const after = getStoredTokens();
          if (after.accessToken) retryHeaders.set('Authorization', `Bearer ${after.accessToken}`);
          const retryRes = await fetch(input, { ...init, headers: retryHeaders });
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

// apiClient: fetchWithReissue 래퍼 — FormData(파일 업로드)를 자동으로 처리하도록 수정
export const apiClient = {
  get: (
    url: string,
    _p0?: { params: { latitude: string; longitude: string } } | { params?: undefined },
  ) => fetchWithReissue(`${BASE}${url}`, { credentials: 'include' }),
  post: (url: string, body?: any, options?: { headers?: Record<string, string> }) => {
    const headers = { ...(options?.headers || {}) };
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // 안전: FormData 전송 시 Content-Type 헤더가 있으면 제거하여
      // 브라우저가 boundary를 포함한 Content-Type을 자동으로 설정하도록 함
      delete (headers as Record<string, any>)['Content-Type'];
      delete (headers as Record<string, any>)['content-type'];
      return fetchWithReissue(`${BASE}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body,
      });
    }
    return fetchWithReissue(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch: (url: string, body?: any, options?: { headers?: Record<string, string> }) => {
    const headers = { ...(options?.headers || {}) };
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      delete (headers as Record<string, any>)['Content-Type'];
      delete (headers as Record<string, any>)['content-type'];
      return fetchWithReissue(`${BASE}${url}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body,
      });
    }
    return fetchWithReissue(`${BASE}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete: (url: string) =>
    fetchWithReissue(`${BASE}${url}`, { method: 'DELETE', credentials: 'include' }),
};
