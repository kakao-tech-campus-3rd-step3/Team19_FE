/**
 * '09:00~16:00' 형식을 '09시~16시'로 변환하는 함수
 * @param timeString - 운영 시간 문자열 (예: '09:00~16:00')
 * @returns 변환된 문자열 (예: '09시~16시') 또는 '정보 없음'
 */
export const formatOperatingHours = (timeString: string): string => {
  if (!timeString || !timeString.includes('~')) {
    return '정보 없음';
  }
  const [startTime, endTime] = timeString.split('~');
  const startHour = startTime.substring(0, 2);
  const endHour = endTime.substring(0, 2);

  return `${startHour}시~${endHour}시`;
};

/**
 * 현재 시간이 운영 시간 내에 있는지 확인하는 함수
 * @param operatingHours - 운영 시간 문자열 (예: '09:00~16:00')
 * @returns 운영 중이면 true, 아니면 false
 */
export const checkIfOpenNow = (operatingHours: string): boolean => {
  if (!operatingHours || !operatingHours.includes('~')) {
    return false;
  }

  const [startTime, endTime] = operatingHours.split('~');
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // 현재 시간을 분 단위로 변환

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return currentTime >= startTotalMinutes && currentTime <= endTotalMinutes;
};
