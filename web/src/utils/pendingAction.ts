// Pending Action utility: 로그인 후 사용자가 의도한 동작을 복원하기 위한 임시 저장소

export type PendingActionType = 'toggle-wish' | 'write-review' | 'navigate';

export interface PendingActionPayload {
  shelterId?: string | number;
  isFavorite?: boolean;
  path?: string;
  state?: any;
}

export interface PendingAction {
  type: PendingActionType;
  payload?: PendingActionPayload;
  returnUrl?: string; // 로그인 후 돌아갈 경로
  createdAt?: number; // 디버깅/만료 처리용 타임스탬프
}

const KEY = 'app.pendingAction';

export function setPendingAction(action: PendingAction) {
  try {
    const withTs: PendingAction = { ...action, createdAt: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(withTs));
  } catch {
    // ignore storage errors (quota / private mode)
  }
}

export function getPendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: PendingAction = JSON.parse(raw);
    // 간단 만료 정책: 30분 경과 시 무시
    const THIRTY_MIN = 30 * 60 * 1000;
    if (parsed.createdAt && Date.now() - parsed.createdAt > THIRTY_MIN) {
      clearPendingAction();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingAction() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}


