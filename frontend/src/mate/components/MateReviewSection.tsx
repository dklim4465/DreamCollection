import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { mateReviewApi } from "@/mate/api/mateApi";
import MateReviewForm from "./MateReviewForm";

interface Props {
  matePostId: number;
  targetUserId: number;
  targetLabel: string;
  currentUserId: number;
}

export default function MateReviewSection({
  matePostId,
  targetUserId,
  targetLabel,
  currentUserId,
}: Props) {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["mate-reviews-for-user", targetUserId],
    queryFn: () =>
      mateReviewApi.getForUser(targetUserId).then((res) => res.data.data),
  });

  const myReview = reviews?.find(
    (r) => r.matePostId === matePostId && r.reviewerId === currentUserId,
  );

  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; content: string }) =>
      mateReviewApi.create({
        matePostId,
        revieweeId: targetUserId,
        rating: payload.rating,
        content: payload.content || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mate-reviews-for-user", targetUserId],
      });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "후기 등록에 실패했어요.");
    },
  });

  if (isLoading) return null;

  if (myReview) {
    return (
      <div className="card-base p-stack-md flex flex-col gap-2">
        <h4 className="text-label-md font-bold">{targetLabel}에게 남긴 후기</h4>
        <div className="flex gap-1 text-lg">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n}>{n <= myReview.rating ? "★" : "☆"}</span>
          ))}
        </div>
        {myReview.content && (
          <p className="text-body-md whitespace-pre-wrap">{myReview.content}</p>
        )}
        <p className="text-label-sm text-outline">
          {dayjs(myReview.createdAt).format("YYYY.MM.DD")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-sm text-outline">{targetLabel}</p>
      <MateReviewForm
        onSubmit={(rating, content) =>
          reviewMutation.mutate({ rating, content })
        }
        isSubmitting={reviewMutation.isPending}
      />
    </div>
  );
}
