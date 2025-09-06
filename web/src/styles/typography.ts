// 타이포그래피 토큰 정의
export const typography = {
  // 홈 화면 (Home)
  home1: {
    fontSize: '4.33vh', // "가까운 쉼터 찾기" 버튼
    fontWeight: 700,
    lineHeight: '6.03vh',
  },
  home2: {
    fontSize: '3.57vh', // "내 위치" 버튼
    fontWeight: 700,
    lineHeight: '3.2vh',
  },

  // 카드 (Card)- HomePage
  cardh1: {
    fontSize: '3.57vh', // 쉼터 이름
    fontWeight: 800,
    lineHeight: '3.72vh',
  },
  cardh2: {
    fontSize: '2.63vh', // 카드 내 거리, 운영시간
    fontWeight: 700,
    lineHeight: '3.39vh',
  },
  cardh3: {
    fontSize: '3.76vh', // "안내 시작" 버튼
    fontWeight: 700,
    lineHeight: '4.7vh',
  },
  cardh4: {
    fontSize: '2.26vh', // 평점 숫자, 상태 태그
    fontWeight: 700,
    lineHeight: '3.2vh',
  },

  //카드 (Card) - FindSheltersPage
  cardf1: {
    fontSize: '3.38vh', // 쉼터 이름
    fontWeight: 800,
    lineHeight: '3.34vh',
  },
  cardf2: {
    fontSize: '2.26vh', // 카드 내 거리, 운영시간
    fontWeight: 600,
    lineHeight: '2.64vh',
  },
  cardf3: {
    fontSize: '3.57vh', // "안내 시작" 버튼
    fontWeight: 700,
    lineHeight: '3.2vh',
  },
  cardf4: {
    fontSize: '2.44vh', // 평점 숫자
    fontWeight: 700,
    lineHeight: '3.02vh',
  },

  //버튼 (Button)
  button1: {
    fontSize: '3.38vh', // "더보기" 버튼
    fontWeight: 700,
    lineHeight: '3.52vh',
  },

  //텍스트 (Text)
  text1: {
    fontSize: '3.76vh', // 권한 거부 안내 문구
    fontWeight: 800,
    lineHeight: '5.27vh',
  },
  text2: {
    fontSize: '2.8vh', // 찜 toast 메시지
    fontWeight: 500,
    lineHeight: '3.39vh',
  },
} as const;

/*
1rem = 16px
vh 값 = (rem 값 * 16 / 851) * 100
*/
