/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots, FaRegEdit, FaHeart } from 'react-icons/fa';
import { useState } from 'react';
import NoProfile from '@/assets/images/NoProfile.png';
import { theme } from '@/styles/theme';
import { useNavigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';

const MyPage = () => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  // TODO: 실제 로그인 연동 시 변경 필요.
  const { user, error, isLoading, isMock } = useUser();

  if (isLoading) return <div css={container}>로딩 중...</div>;

  if (error && !isMock)
    return (
      <div css={container}>
        <div css={errorMsgStyle}>사용자 정보를 불러오지 못했습니다.</div>
      </div>
    );

  if (!user) return <div css={container}>사용자 정보가 없습니다.</div>;

  const profileImgUrl = !user.profileImageUrl || imgError ? NoProfile : user.profileImageUrl;

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
        <button css={menuBtn}>앱 푸쉬 알림 ON/OFF</button>
      </div>

      {/* TODO: 로그아웃 버튼 기능 추가 */}
      <button css={logoutBtn}>로그아웃</button>
    </div>
  );
};

export default MyPage;

// 스타일
const container = css`
  background: #ffffffff;
  padding: 0;
  font-family: 'Pretendard', sans-serif;
  height: calc(100vh - ${theme.spacing.spacing16});
  padding-top: ${theme.spacing.spacing16};
  display: flex;
  flex-direction: column;
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
  width: 180px;
  height: 180px;
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
`;

const logoutBtn = css`
  width: 90%;
  margin: auto auto 5% auto;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: ${theme.typography.my4.fontSize};
  font-weight: ${theme.typography.my4.fontWeight};
  line-height: ${theme.typography.my4.lineHeight};
  cursor: pointer;
`;

const errorMsgStyle = css`
  color: red;
  text-align: center;
  margin-top: 24px;
`;
