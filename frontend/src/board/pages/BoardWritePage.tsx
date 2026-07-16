import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardPostApi, boardImageApi } from "@/board/api/board";
import { uploadApi } from "@/board/api/upload";
import {
  BOARD_WRITE_CATEGORIES,
  BOARD_CATEGORY_LABELS,
  TRADE_STATUSES,
  TRADE_STATUS_LABELS,
  type BoardCategory,
  type BoardImage,
} from "@/board/types/board";
import LoadingSpinner from "@/common/component/LoadingSpinner";

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

const MAX_IMAGE_COUNT = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function BoardWritePage() {
  const { postId } = useParams<{ postId: string }>();
  const isEditMode = Boolean(postId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<BoardCategory>("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [tradeStatus, setTradeStatus] = useState("ON_SALE");

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  // 수정 모드에서 기존에 첨부돼 있던 이미지 목록 (새로 고른 파일과는 별개로 관리)
  const [existingImages, setExistingImages] = useState<BoardImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const { data: existingPost, isLoading } = useQuery({
    queryKey: ["board-post", postId],
    queryFn: () =>
      boardPostApi.getDetail(Number(postId)).then((res) => res.data.data),
    enabled: isEditMode,
  });

  // 수정 모드에서 기존 이미지 목록도 같이 불러온다.
  const { data: fetchedImages } = useQuery({
    queryKey: ["board-post-images", postId],
    queryFn: () =>
      boardImageApi.getList(Number(postId)).then((res) => res.data.data),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingPost) {
      setCategory(existingPost.category as BoardCategory);
      setTitle(existingPost.title);
      setContent(existingPost.content);
      setPrice(existingPost.price != null ? String(existingPost.price) : "");
      setTradeStatus(existingPost.tradeStatus ?? "ON_SALE");
    }
  }, [existingPost]);

  useEffect(() => {
    if (fetchedImages) {
      setExistingImages(fetchedImages);
    }
  }, [fetchedImages]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalImageCount = existingImages.length + pendingImages.length;

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setImageError(null);

    if (totalImageCount + files.length > MAX_IMAGE_COUNT) {
      setImageError(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있어요.`);
      return;
    }

    const validFiles: PendingImage[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageError(
          "jpg, png, gif, webp 형식의 이미지만 업로드할 수 있어요.",
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError("이미지 하나당 용량은 10MB를 넘을 수 없어요.");
        continue;
      }
      validFiles.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setPendingImages((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  // 기존 이미지는 삭제 버튼 누르면 바로 서버에 삭제 요청을 보낸다.
  const handleRemoveExistingImage = async (imageId: number) => {
    if (!isEditMode) return;
    await boardImageApi.delete(Number(postId), imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    queryClient.invalidateQueries({ queryKey: ["board-post-images", postId] });
  };

  const uploadAndAttachImages = async (targetPostId: number) => {
    if (pendingImages.length === 0) return;

    setIsUploadingImages(true);
    try {
      const startOrderNo = existingImages.length;
      for (let i = 0; i < pendingImages.length; i++) {
        const { file } = pendingImages[i];
        const uploadRes = await uploadApi.uploadImage(file);
        const imageUrl = uploadRes.data.data.imageUrl;
        await boardImageApi.add(targetPostId, {
          imageUrl,
          orderNo: startOrderNo + i,
        });
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: () =>
      boardPostApi.create({
        category,
        title: title.trim(),
        content: content.trim(),
        price: category === "TRANSFER" && price ? Number(price) : null,
      }),
    onSuccess: async (res) => {
      const newPostId = res.data.data.id;
      await uploadAndAttachImages(newPostId);
      navigate(`/community/${newPostId}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      boardPostApi.update(Number(postId), {
        title: title.trim(),
        content: content.trim(),
        price: category === "TRANSFER" && price ? Number(price) : null,
        tradeStatus: category === "TRANSFER" ? tradeStatus : null,
      }),
    onSuccess: async () => {
      await uploadAndAttachImages(Number(postId));
      navigate(`/community/${postId}`);
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const isSubmitting = mutation.isPending || isUploadingImages;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    mutation.mutate();
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isEditMode && isLoading) {
    return <LoadingSpinner message="게시글을 불러오는 중..." />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-headline-md font-bold mb-stack-lg">
        {isEditMode ? "게시글 수정" : "게시글 작성"}
      </h1>

      <div className="flex flex-col gap-stack-lg">
        <div>
          <label className="text-label-md font-bold block mb-2">카테고리</label>
          <div className="flex gap-2">
            {BOARD_WRITE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                disabled={isEditMode}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-label-md border ${
                  category === c
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface-variant"
                } disabled:opacity-50`}
              >
                {BOARD_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          {isEditMode && (
            <p className="text-label-sm text-on-surface-variant mt-1">
              카테고리는 수정할 수 없어요.
            </p>
          )}
        </div>

        <div>
          <label className="text-label-md font-bold block mb-2">제목</label>
          <input
            type="text"
            className="input-base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
          />
        </div>

        <div>
          <label className="text-label-md font-bold block mb-2">내용</label>
          <textarea
            className="input-base min-h-[160px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="text-label-md font-bold block mb-2">
            사진 첨부 ({totalImageCount}/{MAX_IMAGE_COUNT})
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            {/* 기존에 서버에 저장돼 있던 이미지들 */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-20 h-20">
                <img
                  src={img.imageUrl}
                  alt="첨부된 이미지"
                  className="w-20 h-20 object-cover rounded-lg border border-outline-variant"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-on-error text-label-sm flex items-center justify-center"
                  aria-label="이미지 삭제"
                >
                  ×
                </button>
              </div>
            ))}

            {/* 이번에 새로 첨부하려고 고른 이미지들 */}
            {pendingImages.map((img) => (
              <div key={img.id} className="relative w-20 h-20">
                <img
                  src={img.previewUrl}
                  alt="첨부 이미지 미리보기"
                  className="w-20 h-20 object-cover rounded-lg border border-outline-variant"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-on-error text-label-sm flex items-center justify-center"
                  aria-label="이미지 삭제"
                >
                  ×
                </button>
              </div>
            ))}

            {totalImageCount < MAX_IMAGE_COUNT && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center text-outline text-headline-sm"
                aria-label="사진 선택"
              >
                +
              </button>
            )}
          </div>

          {imageError && (
            <p className="text-error text-label-sm mt-2">{imageError}</p>
          )}
        </div>

        {category === "TRANSFER" && (
          <div className="flex gap-stack-md">
            <div className="flex-1">
              <label className="text-label-md font-bold block mb-2">가격</label>
              <input
                type="number"
                className="input-base"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            {isEditMode && (
              <div className="flex-1">
                <label className="text-label-md font-bold block mb-2">
                  거래 상태
                </label>
                <select
                  className="input-base"
                  value={tradeStatus}
                  onChange={(e) => setTradeStatus(e.target.value)}
                >
                  {TRADE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {TRADE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {mutation.isError && (
          <p className="text-error text-label-md">
            저장에 실패했어요. 입력값을 확인하고 다시 시도해주세요.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-stack-md">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isUploadingImages
              ? "이미지 업로드 중..."
              : mutation.isPending
                ? "저장 중..."
                : isEditMode
                  ? "수정 완료"
                  : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
