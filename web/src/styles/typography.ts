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

  //상세 페이지 - ShelterDetailPage
  detail1: {
    fontSize: '4.5vh', // 쉼터 이름
    fontWeight: 800,
    lineHeight: '5.27vh',
  },
  detail2: {
    fontSize: '3.57vh', // 거리, 평점
    fontWeight: 800,
    lineHeight: '3.72vh',
  },

  detail3: {
    fontSize: '2.83vh', // 나머지 정보들
    fontWeight: 700,
    lineHeight: '3.39vh',
  },

  //리뷰 섹션 - ShelterDetailPage
  review1: {
    fontSize: '3.5vh', // "리뷰" 제목
    fontWeight: 800,
    lineHeight: '5.27vh',
  },
  review2: {
    fontSize: '2.63vh', // 작성자 이름, 날짜
    fontWeight: 700,
    lineHeight: '3.39vh',
  },
  review3: {
    fontSize: '2.8vh', // 리뷰 내용
    fontWeight: 500,
    lineHeight: '3.39vh',
  },

  // 마이페이지 (MyPage)
  my1: {
    fontSize: '4.5vh', // 마이페이지 타이틀
    fontWeight: 700,
    lineHeight: '6vh',
  },
  my2: {
    fontSize: '4vh', // 사용자 이름
    fontWeight: 700,
    lineHeight: '4.5vh',
  },
  my3: {
    fontSize: '3.2vh', // 메뉴 버튼
    fontWeight: 700,
    lineHeight: '3.6vh',
  },
  my4: {
    fontSize: '3.8vh', // 로그아웃 버튼
    fontWeight: 700,
    lineHeight: '4.1vh',
  },

  //wishlist 페이지 (WishListPage)
  wish1: {
    fontSize: '4.5vh', // "찜 목록" 타이틀
    fontWeight: 700,
    lineHeight: '6vh',
  },
  wish2: {
    fontSize: '3vh', // 찜 목록 내 쉼터 이름
    fontWeight: 800,
    lineHeight: '3.72vh',
  },
  wish3: {
    fontSize: '2.26vh', // 찜 목록 내 거리, 운영시간
    fontWeight: 600,
    lineHeight: '2.84vh',
  },

  //내가 쓴 리뷰 페이지 (MyReviewPage) & 리뷰 수정 페이지 (EditReviewPage)
  myr1: {
    fontSize: '4.5vh', // "내가 쓴 리뷰" 타이틀
    fontWeight: 700,
    lineHeight: '6vh',
  },
  myr2: {
    fontSize: '2.8vh', // 내가 쓴 리뷰 내 쉼터 이름
    fontWeight: 800,
    lineHeight: '3.2vh',
  },
  myr3: {
    fontSize: '2.26vh', // 내가 쓴 리뷰 내 거리, 운영시간
    fontWeight: 550,
    lineHeight: '2.84vh',
  },
  myr4: {
    fontSize: '3.8vh', // 리뷰 수정 페이지 내 쉼터 이름
    fontWeight: 600,
    lineHeight: '4.2vh',
  },
  myr5: {
    fontSize: '2.8vh', // 리뷰 수정 페이지 내 리뷰 내용
    fontWeight: 500,
    lineHeight: '3.39vh',
  },

  //프로필 수정 페이지 (EditProfilePage)
  edit1: {
    fontSize: '4.5vh', // "프로필 수정" 타이틀
    fontWeight: 700,
    lineHeight: '6vh',
  },
  edit2: {
    fontSize: '2.8vh', // 라벨 (이름, 이메일)
    fontWeight: 600,
    lineHeight: '3.2vh',
  },
  edit3: {
    fontSize: '2.4vh', // 인풋 (이름, 이메일)
    fontWeight: 500,
    lineHeight: '2.9vh',
  },
  edit4: {
    fontSize: '3vh', // 저장 버튼
    fontWeight: 700,
    lineHeight: '3.4vh',
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

  // 길찾기 페이지 (GuidePage)
  guide1: {
    fontSize: '2.8vh', // 하단 경로안내 바 텍스트
    fontWeight: 700,
    lineHeight: '3.4vh',
  },
  guide2: {
    fontSize: '3vh', // 도착 팝업 텍스트
    fontWeight: 700,
    lineHeight: '3.4vh',
  },

  // 인증 페이지 (AuthPage)
  authTab: {
    fontSize: '3.2vh', // 상단 탭 라벨 (로그인/회원가입)
    fontWeight: 700,
    lineHeight: '3.6vh',
  },
  authLabel: {
    fontSize: '2.6vh', // 인풋 라벨
    fontWeight: 600,
    lineHeight: '3.0vh',
  },
  authInput: {
    fontSize: '2.6vh', // 인풋 텍스트
    fontWeight: 500,
    lineHeight: '3.0vh',
  },
  authHelper: {
    fontSize: '2.2vh', // 도움말/에러 메시지/부가 텍스트
    fontWeight: 500,
    lineHeight: '2.8vh',
  },
  authButton: {
    fontSize: '3.4vh', // 기본 제출 버튼
    fontWeight: 700,
    lineHeight: '3.8vh',
  },
  authLink: {
    fontSize: '2.4vh', // 비밀번호 찾기/약관 링크 등
    fontWeight: 600,
    lineHeight: '2.8vh',
  },
} as const;

/*
1rem = 16px
vh 값 = (rem 값 * 16 / 851) * 100
*/
