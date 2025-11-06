/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ShelterList from './components/ShelterList';
import emptyShelterImage from '@/assets/images/empty-shelter2.gif';
import { fetchNearbyShelters, nearbySheltersQueryKey } from '@/api/shelterApi';
import { getWishList } from '@/api/wishApi';
import { useQuery } from '@tanstack/react-query';
import { toggleWish } from '@/api/wishApi';
import theme from '@/styles/theme';
import { checkLoginStatus } from '@/api/userApi';
import { useNavigate } from 'react-router-dom';
import { setPendingAction } from '@/utils/pendingAction';

const INITIAL_VISIBLE = 4;
const LOAD_INCREMENT = 3;

const FindSheltersPage = () => {
  const [hasScroll, setHasScroll] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // 위치 좌표 (once) — 페이지 진입 시 한 번만 얻어와 React Query 키로 사용
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  // 위치 확인 완료 여부: 위치 성공/실패 중 하나라도 발생하면 true로 바뀜
  const [locationChecked, setLocationChecked] = useState<boolean>(false);

  // 화면 표시 제어(로컬): visibleCount / favoriteIds / isFetchingMore
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pendingWish, setPendingWish] = useState<{ shelterId: number; isFavorite: boolean } | null>(
    null,
  );

  // 1) 브라우저 위치 획득 (mount 시 한 번)
  useEffect(() => {
    if (!navigator?.geolocation) {
      console.warn('[FindSheltersPage] Geolocation not available');
      setLocationChecked(true); // geolocation 미지원이면 확인 완료로 취급
      return;
    }
    let mounted = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationChecked(true);
      },
      (err) => {
        console.warn('[FindSheltersPage] geolocation error', err);
        // 위치 획득 실패도 "확인 완료"로 표시하여 빈 화면 깜빡임 방지
        setLocationChecked(true);
        // 위치 못 얻어도 빈 상태로 진행(사용자 선택 동작 유도)
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
    return () => {
      mounted = false;
    };
  }, []);

  // 2) React Query: nearby shelters (캐시 적용)
  const {
    data: nearbyData,
    isLoading,
    error,
  } = useQuery<any, Error>({
    queryKey: coords
      ? nearbySheltersQueryKey(coords.latitude, coords.longitude)
      : ['nearbyShelters', 'idle'],
    queryFn: async () => {
      if (!coords) return [];
      return fetchNearbyShelters(coords.latitude, coords.longitude);
    },
    enabled: !!coords,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // 3) 정규화: API가 배열/객체 중 무엇을 반환해도 shelters 배열로 변환
  const shelters = useMemo(() => {
    if (!nearbyData) return [];
    if (Array.isArray(nearbyData)) return nearbyData;
    return nearbyData?.items ?? nearbyData?.shelters ?? nearbyData?.data ?? [];
  }, [nearbyData]);

  // 4) visibleShelters (로컬 페이징)
  const visibleShelters = shelters.slice(0, visibleCount);

  // 5) 찜 목록 초기 동기화: shelters가 바뀔 때 한 번 동기화
  useEffect(() => {
    let mounted = true;
    const loadWishes = async () => {
      try {
        const wish = await getWishList();
        if (!mounted) return;
        const list = Array.isArray(wish) ? wish : (wish?.items ?? wish?.data ?? []);
        setFavoriteIds(list.map((it: any) => Number(it.shelterId)));
      } catch (e) {
        // 인증/네트워크 문제면 빈 배열로 처리
        setFavoriteIds([]);
      }
    };
    // only sync when we have shelters (avoid unnecessary calls)
    if (shelters.length > 0) loadWishes();
    return () => {
      mounted = false;
    };
  }, [shelters]);

  // local toggle favorite (UI 즉시 반영)
  const handleToggleFavoriteLocal = (shelterId: number) => {
    setFavoriteIds((prev) =>
      prev.includes(shelterId) ? prev.filter((id) => id !== shelterId) : [...prev, shelterId],
    );
  };

  // API 호출(toggleWish) -> 성공 시 로컬 토글
  const handleToggleWithApi = async (shelterId: number, isFavorite: boolean) => {
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      setPendingWish({ shelterId, isFavorite });
      setShowLoginModal(true);
      return;
    }
    try {
      await toggleWish({ shelterId, isFavorite });
      handleToggleFavoriteLocal(shelterId);
    } catch (err: any) {
      if (err?.status === 403 || err?.status === 401) {
        setShowLoginModal(true);
        return;
      }
      console.error('[FindSheltersPage] toggleWish error', err);
    }
  };

  const handleLoadMore = async () => {
    if (isLoading || isFetchingMore) return;
    if (visibleCount >= shelters.length) return;
    setIsFetchingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(shelters.length, prev + LOAD_INCREMENT));
      setIsFetchingMore(false);
    }, 300);
  };

  useEffect(
    () => {
      const checkScroll = () => {
        setHasScroll(document.documentElement.scrollHeight > window.innerHeight);
      };
      checkScroll();
      window.addEventListener('resize', checkScroll);
      window.addEventListener('load', checkScroll);
      return () => {
        window.removeEventListener('resize', checkScroll);
        window.removeEventListener('load', checkScroll);
      };
    },
    [
      /* 빈 배열로 mount 시와 resize/load 이벤트로만 체크; 필요 시 shelters 의존성 추가 */
    ],
  );

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    if (pendingWish) {
      setPendingAction({
        type: 'toggle-wish',
        payload: { shelterId: pendingWish.shelterId, isFavorite: pendingWish.isFavorite },
        returnUrl: '/find-shelters',
      });
    }
    navigate('/auth');
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  // 위치 확인이 아직 끝나지 않았으면 아무것도 표시하지 않음(초기 깜빡임 방지)
  if (!locationChecked) return null;

  if (isLoading) return null;
  if (error)
    return (
      <div css={pageContainerStyle(hasScroll)}>
        <div css={emptyTextStyle}>근처 쉼터를 불러올 수 없습니다.</div>
      </div>
    );

  return (
    <>
      {shelters.length > 0 ? (
        <div css={pageContainerStyle(hasScroll)}>
          <ShelterList
            shelters={visibleShelters}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleWithApi}
            onLoadMore={handleLoadMore}
            isFetchingMore={isFetchingMore}
          />
        </div>
      ) : (
        <div css={emptyStateStyle}>
          <p css={emptyTextStyle}>
            근처에 가까운 쉼터가
            <br /> 없습니다
          </p>
          <img src={emptyShelterImage} alt="이미지를 불러올 수 없습니다" css={emptyImageStyle} />
        </div>
      )}

      {/* 로그인 필요 모달 */}
      {showLoginModal &&
        createPortal(
          <div css={modalOverlay} onClick={handleLoginCancel}>
            <div css={modalBox} onClick={(e) => e.stopPropagation()}>
              <div css={modalText}>
                로그인이 필요한
                <br />
                기능입니다
              </div>
              <div css={modalButtons}>
                <button css={modalBtn} onClick={handleLoginConfirm}>
                  로그인
                </button>
                <button css={modalBtn} onClick={handleLoginCancel}>
                  취소
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default FindSheltersPage;

/* 스타일 (기존 코드 재사용) */
const pageContainerStyle = (hasScroll: boolean) => css`
  position: relative;
  display: flex;
  flex-direction: column; /* 세로 스택: 카드가 자연스럽게 아래로 쌓이며 높이 확장 허용 */
  align-items: stretch; /* 내부 블록이 너비/높이를 자유롭게 가지도록 함 */
  width: 100%;
  box-sizing: border-box;
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  background: white;
  /* 스크롤이 있을 때만 하단 안전영역 만큼 패딩 확보 */
  padding-bottom: ${hasScroll ? 'env(safe-area-inset-bottom)' : '0'};
`;

const emptyStateStyle = css`
  position: fixed;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background: black;
  overflow: hidden;
`;

const emptyImageStyle = css`
  width: 200px;
  height: auto;
  margin-bottom: 16px;
`;

const emptyTextStyle = css`
  ${theme.typography.text1};
  color: ${theme.colors.text.white};
`;

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const modalBox = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const modalText = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const modalButtons = css`
  display: flex;
  gap: 18px;
`;

const modalBtn = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;
`;
