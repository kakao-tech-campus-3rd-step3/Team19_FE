/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

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

// 버튼 오버레이 스타일
const overlayButtonStyle = css`
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 10;
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
  background-color: #337afdff;
  color: white;
  border: 1px solid #ccccccff;
  border-radius: 20px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.75rem;
`;

// 쉼터 찾기 버튼 스타일
const findShelterButtonStyle = css`
  width: 100%;
  min-width: 425px;
  padding: 1.25rem 1rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 2.6rem;
  font-weight: bold;
  cursor: pointer;

  @media (min-width: 720px) {
    width: 650px;
    padding: 1rem 1rem;
    font-size: 4rem;
  }
`;
