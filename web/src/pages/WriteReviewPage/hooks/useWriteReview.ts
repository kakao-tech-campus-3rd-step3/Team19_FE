import { postReview } from '@/api/reviewApi';
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
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [showImage, setShowImage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => () => {});
  const [onModalCancel, setOnModalCancel] = useState<() => void>(() => () => {});
  const [toastMessage, setToastMessage] = useState<string>('');

  // postReview mutation
  const mutation = useMutation({
    mutationFn: async (payload: {
      shelterId: number;
      content: string;
      rating: number;
      photoUrl?: string;
    }) => {
      return await postReview(payload.shelterId, {
        content: payload.content,
        rating: payload.rating,
        photoUrl: payload.photoUrl,
      });
    },
    onSuccess: (_res) => {
      // 작성 후 쉼터 상세로 이동 (필요 시 변경)
      if (shelterId) navigate(`/shelter-detail/${shelterId}`);
      else navigate('/'); // fallback
    },
    onError: (err: any) => {
      console.error('[useWriteReview] postReview error', err);
      setToastMessage((err && err.message) || '리뷰 작성에 실패했습니다.');
    },
  });

  const isPending = mutation.status === 'pending';

  // 별점 클릭 핸들러
  const handleStarClick = (idx: number) => {
    setRating(idx + 1);
  };

  // 저장 버튼 클릭
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setModalText('리뷰를 등록하시겠습니까?');
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
      photoUrl: photoUrl || undefined,
    });
  };

  // 사진 삭제 버튼 클릭
  const handleRemoveImage = () => {
    setShowImage(false);
    setPhotoUrl('');
  };

  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 단순히 미리보기 URL 사용 (실제 업로드가 필요하면 별도 처리)
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setShowImage(true);
    e.currentTarget.value = '';
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoUrl) {
      e.preventDefault();
      setToastMessage('사진은 한 장만 첨부할 수 있습니다.');
    }
  };

  return {
    content,
    setContent,
    rating,
    setRating,
    photoUrl,
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
