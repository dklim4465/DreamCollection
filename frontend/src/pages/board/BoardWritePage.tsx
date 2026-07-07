import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { boardPostApi } from "@/api/board";
import {
  BOARD_CATEGORIES,
  BOARD_CATEGORY_LABELS,
  TRADE_STATUSES,
  TRADE_STATUS_LABELS,
  type BoardCategory,
} from "@/types/board/board";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * 게시글 작성 / 수정 페이지
 * - /community/new        → 작성 모드
 * - /community/:postId/edit → 수정 모드 (제목/내용/가격/거래상태만 수정 가능, 카테고리는 백엔드에서 수정 불가)
 */
export default function BoardWritePage() {
  const { postId } = useParams<{ postId: string }>();
  const isEditMode = Boolean(postId);
  const navigate = useNavigate();

  const [category, setCategory] = useState<BoardCategory>("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [tradeStatus, setTradeStatus] = useState("ON_SALE");

  const { data: existingPost, isLoading } = useQuery({
    queryKey: ["board-post", postId],
    queryFn: () =>
      boardPostApi.getDetail(Number(postId)).then((res) => res.data.data),
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

  const createMutation = useMutation({
    mutationFn: () =>
      boardPostApi.create({
        category,
        title: title.trim(),
        content: content.trim(),
        price: category === "TRANSFER" && price ? Number(price) : null,
      }),
    onSuccess: (res) => navigate(`/community/${res.data.data.id}`),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      boardPostApi.update(Number(postId), {
        title: title.trim(),
        content: content.trim(),
        price: category === "TRANSFER" && price ? Number(price) : null,
        tradeStatus: category === "TRANSFER" ? tradeStatus : null,
      }),
    onSuccess: () => navigate(`/community/${postId}`),
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    mutation.mutate();
  };

  if (isEditMode && isLoading) {
    return <LoadingSpinner message="게시글을 불러오는 중..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-headline-md font-bold mb-stack-lg">
        {isEditMode ? "게시글 수정" : "게시글 작성"}
      </h1>

      <div className="flex flex-col gap-stack-md">
        <div>
          <label className="text-label-md font-bold block mb-2">카테고리</label>
          <div className="flex gap-2">
            {BOARD_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                disabled={isEditMode}
                onClick={() => setCategory(c)}
                className={
                  c === category
                    ? "chip-primary"
                    : "chip bg-surface-container text-on-surface-variant disabled:opacity-50"
                }
              >
                {BOARD_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          {isEditMode && (
            <p className="text-label-sm text-outline mt-1">
              카테고리는 수정할 수 없어요.
            </p>
          )}
        </div>

        <div>
          <label className="text-label-md font-bold block mb-2">제목</label>
          <input
            className="input-base"
            value={title}
            maxLength={150}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div>
          <label className="text-label-md font-bold block mb-2">내용</label>
          <textarea
            className="input-base h-48 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
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
            disabled={!title.trim() || !content.trim() || mutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {mutation.isPending
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
