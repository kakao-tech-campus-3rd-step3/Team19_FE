// 타이포그래피 토큰 정의
export const typography = {
  // 버튼 (Button)
  button1Bold: {
    fontSize: '1.8rem', // "내 위치" 버튼, "안내 시작" 버튼
    fontWeight: 700,
    lineHeight: '2.3rem',
  },
  button2Bold: {
    fontSize: '2.3rem', // "가까운 쉼터 찾기" 버튼
    fontWeight: 700,
    lineHeight: '3.2rem',
  },
  button3Bold: {
    fontSize: '1.6rem', // "안내 시작" 버튼
    fontWeight: 700,
    lineHeight: '1.7rem',
  },

  body1Regular: {
    fontSize: '2rem', // 권한 거부 안내 문구
    fontWeight: 800,
    lineHeight: '2.8rem',
  },
  body2Bold: {
    fontSize: '1.2rem', // 카드 내 거리, 운영시간
    fontWeight: 700,
    lineHeight: '1.8rem',
  },
  body3Bold: {
    fontSize: '1.0rem', // 카드 내 거리, 운영시간
    fontWeight: 700,
    lineHeight: '1.2rem',
  },

  // 제목 (Title)
  title1Bold: {
    fontSize: '1.8rem', // 쉼터 이름
    fontWeight: 700,
    lineHeight: '2rem',
  },
  title2Bold: {
    fontSize: '1.3rem', // 쉼터 이름
    fontWeight: 700,
    lineHeight: '1.4rem',
  },

  // 기타 강조 텍스트
  highlight1Bold: {
    fontSize: '1.2rem', // 평점 숫자
    fontWeight: 700,
    lineHeight: '1.7rem',
  },
  highlight2Bold: {
    fontSize: '1rem', // 운영중, 야외 태그
    fontWeight: 700,
    lineHeight: '1.5rem',
  },
} as const;
