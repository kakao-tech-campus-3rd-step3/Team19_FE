/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots, FaRegEdit, FaHeart } from 'react-icons/fa';
import { useState } from 'react';
import NoProfile from '@/assets/images/NoProfile.png';
import { theme } from '@/styles/theme';
import { useNavigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';

const MyPage = () => {
  const user = useUser(1); // userId를 실제 로그인 정보에 맞게 변경 필요
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  if (!user) return <div css={container}>로딩 중...</div>;

  const profileImgUrl = !user.profileImageUrl || imgError ? NoProfile : user.profileImageUrl;

  // 아이콘 크기 글자 크기와 동일하게 맞추기 위한 스타일
  const iconStyle = css`
    font-size: ${theme.typography.my3.fontSize};
    margin-right: 8px;
    vertical-align: middle;
  `;

  return (
    <div css={container}>
      {/* 마이페이지 타이틀 */}
      <div css={mypageTitle}>마이페이지</div>
      {/* 프로필 */}
      <div css={profileBox}>
        <img src={profileImgUrl} alt="프로필" css={profileImg} onError={() => setImgError(true)} />
      </div>
      <div css={userNameRow}>
        <span css={userName}>{user.nickname}</span>
        <FaRegEdit css={editIcon} onClick={() => navigate('/edit-profile')} />
      </div>

      {/* 메뉴 버튼들 */}
      <div css={menuBox}>
        <button css={menuBtn} onClick={() => navigate('/wishlist')}>
          <FaHeart color="red" css={iconStyle} />찜 목록
        </button>
        <button css={menuBtn} onClick={() => navigate('/myreviews')}>
          <FaRegCommentDots color="#444" css={iconStyle} />
          내가 쓴 리뷰 목록
        </button>
        <button css={menuBtn}>앱 푸쉬 알림 ON/OFF</button>{' '}
        {/* 앱 푸시 현재 설정에 따른 변화 필요 */}
      </div>

      {/* 로그아웃 버튼 */}
      <button css={logoutBtn}>로그아웃</button>
    </div>
  );
};

export default MyPage;

// 스타일
const container = css`
  background: #fff;
  padding: 0;
  font-family: 'Pretendard', sans-serif;
`;

const mypageTitle = css`
  font-size: ${theme.typography.my1.fontSize};
  font-weight: ${theme.typography.my1.fontWeight};
  line-height: ${theme.typography.my1.lineHeight};
  padding: 4% 5%;
  text-align: center;
  text-shadow: 2px 2px 6px #bbb;
`;

const profileBox = css`
  display: flex;
  justify-content: center;
`;

const profileImg = css`
  width: 45%;
  height: 45%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #eee;
  background: #fafafa;
`;

const userNameRow = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 3%;
`;

const userName = css`
  font-size: ${theme.typography.my2.fontSize};
  font-weight: ${theme.typography.my2.fontWeight};
  line-height: ${theme.typography.my2.lineHeight};
`;

const editIcon = css`
  font-size: 2rem;
  color: #222;
  cursor: pointer;
`;

const menuBox = css`
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  padding-top: 5%;
  padding-bottom: 10%;
`;

const menuBtn = css`
  width: 90%;
  background: ${theme.colors.button.gray100};
  border: none;
  border-radius: 12px;
  font-size: ${theme.typography.my3.fontSize};
  font-weight: ${theme.typography.my3.fontWeight};
  line-height: ${theme.typography.my3.lineHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
  cursor: pointer;
  /* 버튼 반응 없애기 */
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

const logoutBtn = css`
  width: 90%;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: ${theme.typography.my4.fontSize};
  font-weight: ${theme.typography.my4.fontWeight};
  line-height: ${theme.typography.my4.lineHeight};
  cursor: pointer;
  /* 버튼 반응 없애기 */
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;
