/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '../../../styles/theme';
import { typography } from '../../../styles/typography';

interface Props {
  onMyLocation: () => void;
}

const MapOverlayButtons = ({ onMyLocation }: Props) => (
  <div css={overlayButtonStyle}>
    <button css={myLocationButtonStyle} onClick={onMyLocation}>
      내위치
    </button>
    <button css={findShelterButtonStyle}>가까운 쉼터 찾기</button>
  </div>
);

export default MapOverlayButtons;

const overlayButtonStyle = css`
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 10;
  width: 90%;
  max-width: 650px;
`;

// 내 위치 버튼 스타일
const myLocationButtonStyle = css`
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 8rem;
  min-width: 7rem;
  padding: 0.5rem 0.5rem;
  background-color: ${theme.colors.button.bule};
  color: white;
  border: 1px solid ${theme.colors.text.gray100};
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 0.75rem;

  ${typography.button1Bold};
`;

// 쉼터 찾기 버튼 스타일
const findShelterButtonStyle = css`
  width: 100%;
  padding: 1rem 1rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;

  ${typography.button2Bold};

  // 모바일에서는 max-width 제한 제거
  @media (max-width: 720px) {
    max-width: none;
    ${typography.button4Bold};
  }

  // 720px 이상일 때 스타일
  @media (min-width: 720px) {
    padding: 1rem 1rem;
    ${typography.button3Bold};
  }
`;
