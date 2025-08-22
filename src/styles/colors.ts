// 색상 토큰 정의
export const colors = {
  // Gray 계열
  gray00: '#ffffff',
  gray100: '#f7f8f9',
  gray200: '#f3f4f5',
  gray300: '#eeeff1',
  gray400: '#dcdee3',
  gray500: '#d1d3d8',
  gray600: '#b0b3ba',
  gray700: '#868b94',
  gray800: '#555d6d',
  gray900: '#2a3038',
  gray1000: '#1a1c20',

  // Yellow 계열 (카카오 브랜드 컬러)
  yellow00: '#fffef9',
  yellow100: '#fffce5',
  yellow200: '#fff8b7',
  yellow300: '#fff38a',
  yellow400: '#ffef5c',
  yellow500: '#ffea2e',
  yellow600: '#fee500',
  yellow700: '#d5c000',
  yellow800: '#ac9b00',
  yellow900: '#847700',
  yellow1000: '#5b5200',

  // Brown 계열
  brown00: '#fff9f4',
  brown100: '#ffeedc',
  brown200: '#ffe2c4',
  brown300: '#f9d0a8',
  brown400: '#edbc8a',
  brown500: '#cb9a69',
  brown600: '#a97b4d',
  brown700: '#875e35',
  brown800: '#654321',
  brown900: '#432a12',
  brown1000: '#2d1b08',

  // Blue 계열
  blue00: '#f8faff',
  blue100: '#eff6ff',
  blue200: '#e2edfc',
  blue300: '#cbdffa',
  blue400: '#aacefd',
  blue500: '#85b8fd',
  blue600: '#5e98fe',
  blue700: '#217cf9',
  blue800: '#135fcd',
  blue900: '#0b4596',
  blue1000: '#032451',

  // Red 계열
  red00: '#fffafa',
  red100: '#fdf0f0',
  red200: '#fde7e7',
  red300: '#fed4d2',
  red400: '#feb7b3',
  red500: '#fe928d',
  red600: '#fc6a66',
  red700: '#fa342c',
  red800: '#ca1d13',
  red900: '#921708',
  red1000: '#4a1209',
} as const;

// 시맨틱 컬러
export const semanticColors = {
  // 브랜드 컬러
  kakaoYellow: '#fee500',
  kakaoYellowHover: '#ffea2e',
  kakaoYellowActive: '#d5c000',
  kakaoYellowPressed: '#d5c000',
  kakaoBrown: '#654321',
  kakaoBrownPressed: '#432a12',

  // 배경 컬러
  background: {
    default: '#ffffff',
    disabled: '#f3f4f5',
    fill: '#f7f8f9',
  },

  // 텍스트 컬러
  text: {
    default: '#2a3038',
    sub: '#b0b3ba',
    disabled: '#dcdee3',
    placeholder: '#b0b3ba',
  },

  // 테두리 컬러
  border: {
    default: '#dcdee3',
    disabled: '#eeeff1',
  },

  // 상태 컬러
  state: {
    critical: '#fa342c',
    criticalBackground: '#fdf0f0',
    info: '#217cf9',
    infoBackground: '#eff6ff',
  },
} as const;
