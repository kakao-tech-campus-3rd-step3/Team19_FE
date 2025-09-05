// 타이포그래피 토큰 정의
export const typography = {
  // 버튼 (Button)
  button1Bold: {
    fontSize: '3.76vh', // "안내 시작" 버튼
    fontWeight: 700,
    lineHeight: '4.7vh',
  },
  button2Bold: {
    fontSize: '4.33vh', // "가까운 쉼터 찾기" 버튼
    fontWeight: 700,
    lineHeight: '6.03vh',
  },
  button3Bold: {
    fontSize: '3.57vh', // "내 위치" 버튼, "안내 시작" 버튼
    fontWeight: 700,
    lineHeight: '3.2vh',
  },

  body1Regular: {
    fontSize: '3.76vh', // 권한 거부 안내 문구
    fontWeight: 800,
    lineHeight: '5.27vh',
  },
  body2Bold: {
    fontSize: '2.63vh', // 카드 내 거리, 운영시간
    fontWeight: 700,
    lineHeight: '3.39vh',
  },
  body3Bold: {
    fontSize: '2.26vh', // 카드 내 거리, 운영시간
    fontWeight: 600,
    lineHeight: '2.64vh',
  },

  // 제목 (Title)
  title1Bold: {
    fontSize: '3.38vh', // 쉼터 이름, "더보기" 버튼
    fontWeight: 700,
    lineHeight: '3.52vh',
  },
  title2Bold: {
    fontSize: '3.38vh', // 쉼터 이름
    fontWeight: 800,
    lineHeight: '3.34vh',
  },

  // 기타 강조 텍스트
  highlight1Bold: {
    fontSize: '2.26vh', // 평점 숫자
    fontWeight: 700,
    lineHeight: '3.2vh',
  },
  highlight2Bold: {
    fontSize: '2.44vh', // 평정 숫자
    fontWeight: 700,
    lineHeight: '3.02vh',
  },
  highlight3Bold: {
    fontSize: '2.07vh', // 운영중, 야외 태그
    fontWeight: 700,
    lineHeight: '3.02vh',
  },
} as const;

/*
1rem = 16px
vh 값 = (rem 값 * 16 / 851) * 100
*/
