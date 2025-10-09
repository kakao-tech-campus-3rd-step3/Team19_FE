import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getReview, patchReview } from '@/api/reviewApi';

export const useEditReview = () => {
  const { id } = useParams();
  const reviewId = id ? Number(id) : undefined;

  const [review, setReview] = useState<any | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showImage, setShowImage] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => () => {});
  const [onModalCancel, setOnModalCancel] = useState<() => void>(() => () => {});
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 리뷰 단건 조회 (API 연동)
  useEffect(() => {
    let mounted = true;
    if (!reviewId) {
      // no id -> keep defaults
      return;
    }
    (async () => {
      try {
        const data = await getReview(reviewId); // res -> data로 사용
        if (!mounted) return;
        setReview(data);
        setContent(data?.content ?? '');
        setRating(typeof data?.rating === 'number' ? data.rating : 0);
        setPhotoUrl(data?.photoUrl ?? '');
        setShowImage(!!data?.photoUrl);
      } catch (err) {
        console.error('[useEditReview] getReview error', err);
        setErrorMessage((err as any)?.message ?? '리뷰를 불러오지 못했습니다.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reviewId]);

  // 별점 클릭 핸들러
  const handleStarClick = (idx: number) => {
    setRating(idx + 1);
  };

  // 저장 버튼 클릭 -> 확인 모달 오픈
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalText('저장 하시겠습니까?');
    setOnModalConfirm(() => handleSaveConfirm);
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 실제 API 호출: 리뷰 수정
  const patchReviewMutation = useMutation({
    mutationFn: async (params: {
      reviewId: number;
      content: string;
      rating?: number;
      photoUrl?: string;
    }) => {
      return await patchReview(params.reviewId, {
        content: params.content,
        rating: params.rating,
        photoUrl: params.photoUrl,
      });
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || '리뷰 수정 중 오류가 발생했습니다.');
    },
    onSuccess: (_res: any) => {
      // 성공 시 이동 또는 상태 반영
      navigate('/myreviews');
    },
  });

  // 저장 모달에서 "예" 클릭 시
  const handleSaveConfirm = async () => {
    setShowModal(false);
    if (!reviewId) {
      setErrorMessage('리뷰 ID가 없습니다.');
      return;
    }
    patchReviewMutation.mutate({
      reviewId,
      content,
      rating,
      photoUrl,
    });
  };

  // 사진 삭제 버튼 클릭
  const handleRemoveImage = () => {
    setModalText('사진을 삭제하시겠습니까?');
    setOnModalConfirm(() => () => {
      setShowImage(false);
      setPhotoUrl('');
      setShowModal(false);
    });
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showImage && photoUrl) {
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      e.target.value = ''; //input value 초기화 (중복 선택 가능)
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setShowImage(true);
      e.target.value = ''; //input value 초기화 (중복 선택 가능)
    }
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoUrl) {
      e.preventDefault(); // 파일 선택창이 뜨지 않도록 막음
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
    }
  };

  // React Query(vX) 에서는 상태명이 'pending'이므로 그에 맞게 검사
  const saving = patchReviewMutation.status === 'pending';

  return {
    review,
    content,
    setContent,
    rating,
    setRating,
    photoUrl,
    setPhotoUrl,
    showImage,
    setShowImage,
    showModal,
    setShowModal,
    modalText,
    setModalText,
    onModalConfirm,
    setOnModalConfirm,
    onModalCancel,
    setOnModalCancel,
    toastMessage,
    setToastMessage,
    errorMessage,
    patchReviewMutation,
    handleStarClick,
    handleSave,
    handleSaveConfirm,
    handleRemoveImage,
    handleImageChange,
    handleAddImageClick,
    navigate,
    saving, // 추가: 로딩 상태를 안전하게 제공
  };
};
