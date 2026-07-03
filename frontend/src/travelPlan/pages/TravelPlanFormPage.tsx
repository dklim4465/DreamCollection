import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { travelPlanApi, type CreatePlanReq } from "@/travelPlan/api/travelPlanApi";

/**
 * 일정 생성 폼
 * 목적지/기간/인원 입력 → 생성 후 상세 페이지로 이동
 * 홈페이지의 "인기 여행지"/검색창에서 넘어온 경우 ?destination=제주도 로 목적지가 미리 채워짐.
 * TODO: 목적지는 city 자동완성으로 교체 예정 (지금은 자유 텍스트)
 */
export default function TravelPlanFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlanReq>({
    defaultValues: {
      peopleCount: 1,
      destination: searchParams.get("destination") ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: travelPlanApi.create,
    onSuccess: (res) => {
      navigate(`/plan/${res.data.data.id}`);
    },
  });

  return (
    <div className="max-w-lg mx-auto w-full">
      <h1 className="text-headline-md font-bold mb-6">새 여행 계획</h1>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="card-base p-stack-lg flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">일정 제목</label>
          <input
            type="text"
            placeholder="예: 오사카 미식 여행"
            className="input-base"
            {...register("title", { required: "제목을 입력해주세요" })}
          />
          {errors.title && (
            <p className="text-label-sm text-error">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">목적지</label>
          <input
            type="text"
            placeholder="예: 오사카, 일본"
            className="input-base"
            {...register("destination", { required: "목적지를 입력해주세요" })}
          />
          {errors.destination && (
            <p className="text-label-sm text-error">{errors.destination.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-label-md">시작일</label>
            <input
              type="date"
              className="input-base"
              {...register("startDate", { required: true })}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-label-md">종료일</label>
            <input
              type="date"
              className="input-base"
              {...register("endDate", { required: true })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">인원수</label>
          <input
            type="number"
            min={1}
            className="input-base"
            {...register("peopleCount", { required: true, valueAsNumber: true, min: 1 })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">
            메모 <span className="text-on-surface-variant text-label-sm">(선택)</span>
          </label>
          <textarea
            rows={3}
            placeholder="여행에 대한 간단한 메모를 남겨보세요"
            className="input-base resize-none"
            {...register("memo")}
          />
        </div>

        {mutation.isError && (
          <p className="text-label-sm text-error">
            일정 생성에 실패했습니다. 다시 시도해주세요.
          </p>
        )}

        <button type="submit" className="btn-primary w-full mt-2" disabled={mutation.isPending}>
          {mutation.isPending ? "생성 중..." : "일정 만들기"}
        </button>
      </form>
    </div>
  );
}
