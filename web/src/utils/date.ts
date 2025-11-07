/**
 * '09:00~16:00' 또는 '09시~16시' 형식을 '09시~16시'로 변환하는 함수
 * @param timeString - 운영 시간 문자열 (예: '09:00~16:00' 또는 '09시~16시')
 * @returns 변환된 문자열 (예: '09시~16시') 또는 '정보 없음'
 */
export const formatOperatingHours = (timeString: string): string => {
  if (!timeString || !timeString.includes('~')) {
    return '정보 없음';
  }
  const parts = timeString.split('~').map((s) => s.trim());
  if (parts.length !== 2) return '정보 없음';

  const parseHour = (s: string) => {
    // '09:00' / '9:00' / '09시' / '9시' / '09' 등을 처리
    const m1 = s.match(/(\d{1,2})[:h시]?/);
    if (!m1) return null;
    const h = Number(m1[1]);
    if (Number.isNaN(h)) return null;
    return h;
  };

  const sh = parseHour(parts[0]);
  const eh = parseHour(parts[1]);
  if (sh == null || eh == null) return '정보 없음';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(sh)}시~${pad(eh)}시`;
};

/**
 * 주어진 운영시간 문자열이 현재 시각에 '운영중'인지 판단
 * 지원 포맷:
 *  - '09:00~16:00', '9:00~16:00'
 *  - '09시~16시', '9시~16시'
 *  - '09~16'
 *  - '24시간', '연중무휴' -> 항상 운영
 *  - '정보 없음' 등 -> false
 *
 * @param operatingHours - 운영시간 문자열
 * @returns 운영중이면 true, 아니면 false
 */
export const checkIfOpenNow = (operatingHours: string | undefined | null): boolean => {
  if (!operatingHours) return false;
  const raw = operatingHours.trim().toLowerCase();
  if (raw === '') return false;
  if (/24시간|연중무휴|항상/.test(raw)) return true;
  if (/정보없음|정보 없음/.test(raw)) return false;

  // 공통적으로 '~'을 기준으로 분해
  if (!raw.includes('~')) return false;
  const [startRaw, endRaw] = raw.split('~').map((s) => s.trim());

  const parseToMinutes = (s: string): number | null => {
    // 포맷: HH:MM 또는 H:MM 또는 HH시 또는 H시 또는 HH
    const m = s.match(/^(\d{1,2})(?::(\d{2}))?/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = m[2] ? Number(m[2]) : 0;
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  const startMin = parseToMinutes(startRaw);
  const endMin = parseToMinutes(endRaw);
  if (startMin == null || endMin == null) return false;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  if (endMin > startMin) {
    // 일반적인 당일 종료
    return nowMin >= startMin && nowMin < endMin;
  } else if (endMin === startMin) {
    // start == end -> 의미 불명(보수적으로 false)
    return false;
  } else {
    // 자정을 넘기는 영업시간 (예: 22:00~02:00)
    return nowMin >= startMin || nowMin < endMin;
  }
};
