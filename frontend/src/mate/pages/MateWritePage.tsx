import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { matePostApi } from "@/mate/api/mate";
import { PREFERRED_GENDERS, TRAVEL_STYLES } from "@/mate/types/mate";
import LoadingSpinner from "@/common/component/LoadingSpinner";

export default function MateWritePage() {
  const { matePostId } = useParams<{ matePostId: string }>();
  const isEditMode = Boolean(matePostId);
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState("");
  const [preferredAge, setPreferredAge] = useState("");
  const [preferredGender, setPreferredGender] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [recruitCount, setRecruitCount] = useState("1");

  const { data: existingPost, isLoading } = useQuery({
    queryKey: ["mate-post", matePostId],
    queryFn: () =>
      matePostApi.getDetail(Number(matePostId)).then((res) => res.data.data),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingPost) {
      setDestination(existingPost.destination);
      setStartDate(existingPost.startDate);
      setEndDate(existingPost.endDate);
      setContent(existingPost.content);
      setPreferredAge(existingPost.preferredAge ?? "");
      setPreferredGender(existingPost.preferredGender ?? "");
      setTravelStyle(existingPost.travelStyle ?? "");
      setRecruitCount(String(existingPost.recruitCount ?? 1));
    }
  }, [existingPost]);

  const createMutation = useMutation({
    mutationFn: () =>
      matePostApi.create({
        destination: destination.trim(),
        startDate,
        endDate,
        content: content.trim(),
        preferredAge: preferredAge || null,
        preferredGender: preferredGender || null,
        travelStyle: travelStyle || null,
        recruitCount: recruitCount ? Number(recruitCount) : null,
      }),
    onSuccess: (res) => navigate(`/matching/${res.data.data.id}`),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      matePostApi.update(Number(matePostId), {
        destination: destination.trim(),
        startDate,
        endDate,
        content: content.trim(),
        preferredAge: preferredAge || null,
        preferredGender: preferredGender || null,
        travelStyle: travelStyle || null,
        recruitCount: recruitCount ? Number(recruitCount) : null,
      }),
    onSuccess: () => navigate(`/matching/${matePostId}`),
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const isFormValid =
    destination.trim() && startDate && endDate && content.trim();

  const handleSubmit = () => {
    if (!isFormValid) return;
    mutation.mutate();
  };

  if (isEditMode && isLoading) {
    return <LoadingSpinner message="모집글을 불러오는 중..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-headline-md font-bold mb-stack-lg">
        {isEditMode ? "동행 모집글 수정" : "동행 모집글 작성"}
      </h1>

      <div className="flex flex-col gap-stack-md">
        <div>
          <label className="text-label-md font-bold block mb-2">여행지</label>
          <input
            className="input-base"
            value={destination}
            maxLength={100}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="예: 오사카, 일본"
          />
        </div>

        <div className="flex gap-stack-md">
          <div className="flex-1">
            <label className="text-label-md font-bold block mb-2">시작일</label>
            <input
              type="date"
              className="input-base"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-label-md font-bold block mb-2">종료일</label>
            <input
              type="date"
              className="input-base"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-label-md font-bold block mb-2">내용</label>
          <textarea
            className="input-base h-48 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="어떤 동행을 찾고 있는지 알려주세요"
          />
        </div>

        <div className="flex gap-stack-md">
          <div className="flex-1">
            <label className="text-label-md font-bold block mb-2">
              희망 연령대
            </label>
            <input
              className="input-base"
              value={preferredAge}
              onChange={(e) => setPreferredAge(e.target.value)}
              placeholder="예: 20대, 무관"
            />
          </div>
          <div className="flex-1">
            <label className="text-label-md font-bold block mb-2">
              희망 성별
            </label>
            <select
              className="input-base"
              value={preferredGender}
              onChange={(e) => setPreferredGender(e.target.value)}
            >
              <option value="">선택 안 함</option>
              {PREFERRED_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-stack-md">
          <div className="flex-1">
            <label className="text-label-md font-bold block mb-2">
              여행 스타일
            </label>
            <select
              className="input-base"
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
            >
              <option value="">선택 안 함</option>
              {TRAVEL_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-label-md font-bold block mb-2">
              모집 인원
            </label>
            <input
              type="number"
              min={1}
              className="input-base"
              value={recruitCount}
              onChange={(e) => setRecruitCount(e.target.value)}
            />
          </div>
        </div>

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
            disabled={!isFormValid || mutation.isPending}
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
