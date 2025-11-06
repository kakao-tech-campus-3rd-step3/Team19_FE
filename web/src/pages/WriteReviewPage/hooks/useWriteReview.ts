import { postReview, uploadReviewPhoto } from '@/api/reviewApi';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const useWriteReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // shelterId 우선순위: location.state -> URL param -> undefined
  const shelterIdFromState = (location.state as any)?.shelterId;
  const shelterIdFromParams = params.shelterId ? Number(params.shelterId) : undefined;
  const shelterId = shelterIdFromState ?? shelterIdFromParams;

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  // photoFile: 실제 업로드할 File. previewUrl: 로컬 미리보기용 URL
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showImage, setShowImage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => () => {});
  const [onModalCancel, setOnModalCancel] = useState<() => void>(() => () => {});
  const [toastMessage, setToastMessage] = useState<string>('');

  // postReview mutation
  const mutation = useMutation({
    // payload: { shelterId, content, rating, photoFile? }
    mutationFn: async (payload: {
      shelterId: number;
      content: string;
      rating: number;
      photoFile?: File | null;
    }) => {
      // 1) 리뷰 본문 생성 (photoUrl 필드 서버측 요구가 없으면 null로 보냄)
      const created = await postReview(payload.shelterId, {
        content: payload.content,
        rating: payload.rating,
        photoUrl: null,
      });
      // 서버 응답에서 reviewId를 얻어야 파일 업로드 수행
      const reviewId = (created && (created as any).reviewId) || (created && (created as any).id);
      if (payload.photoFile && reviewId) {
        // 2) 사진 업로드 (multipart/form-data, 파일만 전송)
        try {
          await uploadReviewPhoto(Number(reviewId), payload.photoFile);
        } catch (uploadErr) {
          // 업로드 실패 시 로그와 에러를 던져 상위에서 처리하게 하거나, 여기서 토스트 처리
          // 여기서는 에러를 위로 던져 onError에서 처리되도록 함
          // eslint-disable-next-line no-console
          console.error('[useWriteReview] uploadReviewPhoto failed', uploadErr);
          throw uploadErr;
        }
      }
      return created;
    },
    onSuccess: (_res) => {
      // 작성 후 쉼터 상세로 이동
      if (shelterId) navigate(`/shelter-detail/${shelterId}`);
      else navigate('/');
    },
    onError: (err: any) => {
      console.error('[useWriteReview] postReview/upload error', err);
      setToastMessage((err && err.message) || '리뷰 작성에 실패했습니다.');
    },
  });

  // 로딩 상태는 mutation.isLoading 사용
  const isPending = mutation.isLoading;

  // 별점 클릭 핸들러
  const handleStarClick = (idx: number) => {
    setRating(idx + 1);
  };

  // 저장 버튼 클릭
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // 줄바꿈 포함
    setModalText('리뷰를\n등록하시겠습니까?');
    setOnModalConfirm(() => handleSaveConfirm);
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 저장 모달에서 "예" 클릭 시
  const handleSaveConfirm = () => {
    setShowModal(false);
    if (!shelterId) {
      setToastMessage('쉼터 정보가 없습니다.');
      return;
    }
    mutation.mutate({
      shelterId,
      content,
      rating,
      // 없는 경우 null로 전달
      photoFile: photoFile ? photoFile : null,
    });
  };

  // 사진 삭제 버튼 클릭
  const handleRemoveImage = () => {
    setShowImage(false);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {}
    }
    setPreviewUrl('');
    setPhotoFile(null);
  };

  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPreviewUrl(url);
    setShowImage(true);
    e.currentTarget.value = '';
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoFile) {
      e.preventDefault();
      // 줄바꿈 포함
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
    }
  };

  return {
    content,
    setContent,
    rating,
    setRating,
    previewUrl,
    photoFile,
    showImage,
    showModal,
    modalText,
    onModalConfirm,
    onModalCancel,
    toastMessage,
    handleStarClick,
    handleSave,
    handleRemoveImage,
    handleImageChange,
    handleAddImageClick,
    navigate,
    shelterId,
    isPending,
  };
};
