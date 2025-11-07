import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getReview, patchReview, uploadReviewPhoto } from '@/api/reviewApi';

export const useEditReview = () => {
  const { id } = useParams();
  const reviewId = id ? Number(id) : undefined;

  const [review, setReview] = useState<any | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  // 편집: 로컬 미리보기(previewUrl)와 실제 업로드할 File(photoFile)
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showImage, setShowImage] = useState<boolean>(false);
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
        // 서버에 있는 기존 사진 URL을 preview로 사용(파일 미설정)
        setPreviewUrl(data?.photoUrl ?? '');
        setPhotoFile(null);
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

  // 저장 모달에서 "예" 클릭 시
  const handleSaveConfirm = async () => {
    setShowModal(false);
    if (!reviewId) {
      setErrorMessage('리뷰 ID가 없습니다.');
      return;
    }

    // 변경 여부에 따라 null로 전송할 필드 결정 (null = 변경 없음)
    const contentPayload: string | null = review && review.content === content ? null : content;
    const ratingPayload: number | null =
      review && typeof review.rating === 'number' && review.rating === rating ? null : rating;

    const payload: {
      reviewId: number;
      content?: string | null;
      rating?: number | null;
      photoUrl?: string | null;
      photoFile?: File | null;
    } = {
      reviewId,
      content: contentPayload,
      rating: ratingPayload,
    };

    if (photoFile) {
      // 새 파일 업로드: 서버에 photo 업로드 예정임을 알리기 위해 null로 전달
      payload.photoUrl = null;
      payload.photoFile = photoFile;
    } else if (!showImage) {
      // 사용자가 사진을 삭제한 경우: 빈 문자열(또는 서버 규약에 따라 '') 전달
      payload.photoUrl = '';
    } else {
      // 이미지 표시중이고 previewUrl이 서버의 기존 URL과 동일하면 변경 없음(null)
      const originalUrl = review?.photoUrl ?? '';
      payload.photoUrl = previewUrl && previewUrl !== originalUrl ? previewUrl : null;
    }

    patchReviewMutation.mutate(payload);
  };

  const patchReviewMutation = useMutation({
    mutationFn: async (params: {
      reviewId: number;
      content?: string | null;
      rating?: number | null;
      photoUrl?: string | null;
      photoFile?: File | null;
    }) => {
      // 1) 리뷰 본문 업데이트: nullable 값을 그대로 서버로 전달
      const patched = await patchReview(params.reviewId, {
        content: typeof params.content === 'undefined' ? null : params.content,
        rating: typeof params.rating === 'undefined' ? null : params.rating,
        photoUrl: typeof params.photoUrl === 'undefined' ? null : params.photoUrl,
      });

      // patched에서 review id를 확실히 얻기 (서버 리턴 구조에 맞춰 조정)
      const returnedId =
        (patched && (patched as any).reviewId) ||
        (patched && (patched as any).id) ||
        params.reviewId;

      // 2) 파일 업로드는 patch 성공 후, reviewId가 확실할 때만 수행
      if (params.photoFile && returnedId) {
        try {
          await uploadReviewPhoto(Number(returnedId), params.photoFile);
        } catch (uploadErr) {
          const errMsg =
            (uploadErr && (uploadErr as any).message) || '사진 업로드 중 오류가 발생했습니다.';
          throw new Error(errMsg);
        }
      }

      return patched;
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || '리뷰 수정 중 오류가 발생했습니다.');
    },
    onSuccess: (_res: any) => {
      navigate('/myreviews');
    },
  });

  // 사진 삭제 버튼 클릭
  const handleRemoveImage = () => {
    setModalText('사진을\n삭제하시겠습니까?');
    setOnModalConfirm(() => () => {
      setShowImage(false);
      // 제거 표시: previewUrl 제거, photoFile 초기화
      setPreviewUrl('');
      setPhotoFile(null);
      setShowModal(false);
    });
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showImage && (previewUrl || photoFile)) {
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoFile(file);
      setPreviewUrl(url);
      setShowImage(true);
      e.target.value = '';
    }
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    // 이미 이미지가 보이거나 업로드할 파일이 있으면 추가 막기
    if (showImage && (previewUrl || photoFile)) {
      e.preventDefault(); // 파일 선택창이 뜨지 않도록 막음
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
    }
  };

  // 로딩 플래그 (react-query v5: 'pending' 상태 사용)
  const saving = patchReviewMutation.status === 'pending';

  return {
    review,
    content,
    setContent,
    rating,
    setRating,
    previewUrl,
    setPreviewUrl,
    photoFile,
    setPhotoFile,
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
