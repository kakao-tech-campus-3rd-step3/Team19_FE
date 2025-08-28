// 타이포그래피 토큰 정의
export const typography = {
  // 버튼 (Button)
  button1Bold: {
    fontSize: '2rem', // 내 위치 버튼
    fontWeight: 700,
    lineHeight: '2.8rem',
  },
  button2Bold: {
    fontSize: '2.6rem', // 기본 "가까운 쉼터 찾기" 버튼, 안내 시작 버튼
    fontWeight: 700,
    lineHeight: '3.4rem',
  },
  button3Bold: {
    fontSize: '4rem', // "가까운 쉼터 찾기" 버튼 (데스크탑)
    fontWeight: 700,
    lineHeight: '4.8rem',
  },
  button4Bold: {
    fontSize: '2.3rem', // "가까운 쉼터 찾기" 버튼 (모바일)
    fontWeight: 700,
    lineHeight: '3.2rem',
  },

  // 본문/알림 (Body, Message)
  body1Regular: {
    fontSize: '2rem', // 권한 거부 안내 문구
    fontWeight: 400,
    lineHeight: '2.8rem',
  },
  body2Bold: {
    fontSize: '1.8rem', // 카드 내 거리, 운영시간
    fontWeight: 700,
    lineHeight: '2.6rem',
  },

  // 제목 (Title)
  title1Bold: {
    fontSize: '2.2rem', // 쉼터 이름
    fontWeight: 700,
    lineHeight: '3rem',
  },

  // 기타 강조 텍스트
  highlight1Bold: {
    fontSize: '2rem', // 평점 숫자
    fontWeight: 700,
    lineHeight: '2.8rem',
  },
} as const;
