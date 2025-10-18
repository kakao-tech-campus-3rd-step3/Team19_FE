/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import theme from '@/styles/theme';
import { typography } from '@/styles/typography';

interface Props {
  onMyLocation: () => void;
}

const MapOverlayButtons = ({ onMyLocation }: Props) => {
  const navigate = useNavigate(); // navigate 함수를 사용할 수 있도록 선언

  // '가까운 쉼터 찾기' 버튼을 클릭했을 때 실행될 함수
  const handleFindShelterClick = () => {
    navigate('/find-shelters'); // '/find-shelters' 경로로 페이지를 이동시킴
  };

  return (
    <div css={overlayButtonStyle}>
      <button css={myLocationButtonStyle} onClick={onMyLocation}>
        내위치
      </button>
      <button css={findShelterButtonStyle} onClick={handleFindShelterClick}>
        가까운 쉼터 찾기
      </button>
    </div>
  );
};

export default MapOverlayButtons;

const overlayButtonStyle = css`
  position: fixed;
  left: 50%;
  bottom: 2rem;
  //bottom: calc(2rem + env(safe-area-inset-bottom));
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
  width: 9rem;
  height: 3.5rem;
  padding: 0.5rem 0.5rem;
  background-color: ${theme.colors.button.blue};
  color: white;
  border: 1px solid ${theme.colors.text.gray100};
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 0.75rem;

  ${typography.home2};
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

  ${typography.home1};
`;
