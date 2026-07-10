import { useState } from "react";

interface Props {
  onSubmit: (rating: number, content: string) => void;
  isSubmitting?: boolean;
}

export default function MateReviewForm({ onSubmit, isSubmitting }: Props) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  return (
    <div className="card-base p-stack-md flex flex-col gap-3">
      <h4 className="text-label-md font-bold">동행 후기 남기기</h4>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="text-2xl leading-none"
            aria-label={`${n}점`}
          >
            {n <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>

      <textarea
        className="input-base h-24 resize-none"
        placeholder="함께한 여행은 어땠나요? (최대 500자)"
        maxLength={500}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={() => onSubmit(rating, content.trim())}
        disabled={isSubmitting}
        className="btn-primary self-end disabled:opacity-50"
      >
        {isSubmitting ? "등록 중..." : "후기 등록"}
      </button>
    </div>
  );
}
