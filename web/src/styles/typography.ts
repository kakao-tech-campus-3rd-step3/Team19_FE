/**
 * typography tokens (원래 값은 유지하면서 fontFamily를 전역으로 주입)
 * - 프로젝트 전역 기본 폰트: Nanum Gothic
 * - 필요하면 FONT_HEADING을 Hahmlet 등으로 바꿔서 제목에만 사용하세요.
 */

const FONT_PRIMARY = "'Nanum Gothic', sans-serif";
const FONT_HEADING = "'Hahmlet', serif"; // 필요시 제목에 사용

const raw = {
  // Home
  home1: { fontSize: '2.30rem', fontWeight: 700, lineHeight: '3.21rem' },
  home2: { fontSize: '1.90rem', fontWeight: 700, lineHeight: '1.70rem' },

  // Card - HomePage
  cardh1: { fontSize: '1.90rem', fontWeight: 800, lineHeight: '1.98rem' },
  cardh2: { fontSize: '1.40rem', fontWeight: 700, lineHeight: '1.80rem' },
  cardh3: { fontSize: '2.00rem', fontWeight: 700, lineHeight: '2.50rem' },
  cardh4: { fontSize: '1.20rem', fontWeight: 700, lineHeight: '1.70rem' },

  // FindSheltersPage
  cardf1: { fontSize: '1.80rem', fontWeight: 800, lineHeight: '1.78rem' },
  cardf2: { fontSize: '1.20rem', fontWeight: 600, lineHeight: '1.40rem' },
  cardf3: { fontSize: '1.90rem', fontWeight: 700, lineHeight: '1.70rem' },
  cardf4: { fontSize: '1.30rem', fontWeight: 700, lineHeight: '1.61rem' },

  // ShelterDetailPage
  detail1: { fontSize: '2.39rem', fontWeight: 800, lineHeight: '2.80rem' },
  detail2: { fontSize: '1.90rem', fontWeight: 800, lineHeight: '1.98rem' },
  detail3: { fontSize: '1.55rem', fontWeight: 700, lineHeight: '1.80rem' },

  // Review section
  review1: { fontSize: '1.86rem', fontWeight: 800, lineHeight: '2.80rem' },
  review2: { fontSize: '1.40rem', fontWeight: 700, lineHeight: '1.80rem' },
  review3: { fontSize: '1.49rem', fontWeight: 500, lineHeight: '1.80rem' },

  // MyPage
  my1: { fontSize: '2.39rem', fontWeight: 700, lineHeight: '3.19rem' },
  my2: { fontSize: '2.13rem', fontWeight: 700, lineHeight: '2.39rem' },
  my3: { fontSize: '1.70rem', fontWeight: 700, lineHeight: '1.91rem' },
  my4: { fontSize: '2.02rem', fontWeight: 700, lineHeight: '2.18rem' },

  // WishList
  wish1: { fontSize: '2.39rem', fontWeight: 700, lineHeight: '3.19rem' },
  wish2: { fontSize: '1.80rem', fontWeight: 800, lineHeight: '2.18rem' },
  wish3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.56rem' },

  // MyReview / EditReview
  myr1: { fontSize: '2.39rem', fontWeight: 700, lineHeight: '3.19rem' },
  myr2: { fontSize: '1.80rem', fontWeight: 700, lineHeight: '2.18rem' },
  myr3: { fontSize: '1.30rem', fontWeight: 600, lineHeight: '1.61rem' },
  myr4: { fontSize: '2.02rem', fontWeight: 600, lineHeight: '2.23rem' },
  myr5: { fontSize: '1.49rem', fontWeight: 500, lineHeight: '1.80rem' },

  // EditProfile
  edit1: { fontSize: '2.39rem', fontWeight: 700, lineHeight: '3.19rem' },
  edit2: { fontSize: '1.49rem', fontWeight: 600, lineHeight: '1.70rem' },
  edit3: { fontSize: '1.30rem', fontWeight: 500, lineHeight: '1.64rem' },
  edit4: { fontSize: '2.00rem', fontWeight: 700, lineHeight: '2.21rem' },

  // Button
  button1: { fontSize: '1.80rem', fontWeight: 700, lineHeight: '1.87rem' },

  // Text
  text1: { fontSize: '2.00rem', fontWeight: 800, lineHeight: '2.80rem' },
  text2: { fontSize: '1.49rem', fontWeight: 500, lineHeight: '1.80rem' },

  // Guide
  guide1: { fontSize: '1.60rem', fontWeight: 700, lineHeight: '1.81rem' },
  guide2: { fontSize: '1.60rem', fontWeight: 700, lineHeight: '1.81rem' },

  // Auth
  authTab: { fontSize: '1.60rem', fontWeight: 800, lineHeight: '1.81rem' },
  authLabel: { fontSize: '1.49rem', fontWeight: 600, lineHeight: '1.70rem' },
  authInput: { fontSize: '1.28rem', fontWeight: 400, lineHeight: '1.49rem' },
  authHelper: { fontSize: '1.17rem', fontWeight: 500, lineHeight: '1.49rem' },
  authButton: { fontSize: '1.81rem', fontWeight: 700, lineHeight: '2.02rem' },
  authLink: { fontSize: '1.28rem', fontWeight: 550, lineHeight: '1.49rem' },

  // Modal
  modal1: { fontSize: '1.70rem', fontWeight: 600, lineHeight: '1.91rem' },
  modal2: { fontSize: '1.49rem', fontWeight: 600, lineHeight: '1.81rem' },
} as const;

/**
 * 보정 규칙:
 * - lineHeight 값이 fontSize 대비 너무 작게 설정된 경우(비율 < MIN_RATIO),
 *   안전한 기본 비율(DEFAULT_RATIO)을 적용해 lineHeight를 증가시킵니다.
 */
const MIN_RATIO = 1.2; // 허용 최소 lineHeight 비율 (fontSize 대비)
const DEFAULT_RATIO = 1.4; // 부족할 때 적용할 기본 비율

const parseRem = (v: string | number) => {
  if (typeof v === 'number') return v;
  const m = String(v).match(/^([\d.]+)rem$/);
  return m ? Number(m[1]) : NaN;
};
const formatRem = (n: number) => `${Number(n.toFixed(3))}rem`;

export const typography = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => {
    const fontSizeStr = (v as any).fontSize;
    const lineHeightStr = (v as any).lineHeight;
    const fontSizeVal = parseRem(fontSizeStr);
    const lineHeightVal = parseRem(lineHeightStr);

    let finalLineHeight = lineHeightVal;
    if (!isFinite(fontSizeVal)) {
      // fallback: 단순 숫자로 사용
      finalLineHeight = isFinite(lineHeightVal) ? lineHeightVal : fontSizeVal * DEFAULT_RATIO;
    } else {
      if (!isFinite(lineHeightVal) || lineHeightVal < fontSizeVal * MIN_RATIO) {
        finalLineHeight = Number((fontSizeVal * DEFAULT_RATIO).toFixed(3));
      }
    }

    return [
      k,
      {
        fontFamily: FONT_PRIMARY,
        fontSize: (v as any).fontSize,
        fontWeight: (v as any).fontWeight,
        lineHeight: formatRem(finalLineHeight),
      },
    ];
  }),
) as {
  [K in keyof typeof raw]: {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
  };
};

export const fonts = {
  primary: FONT_PRIMARY,
  heading: FONT_HEADING,
};

export default typography;

/*
1rem = 16px
vh 값 = (rem 값 * 16 / 851) * 100
*/
