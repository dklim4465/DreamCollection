import { Link } from "react-router-dom";

export default function TripHubPage() {
  return (
    <div className="flex flex-col items-center gap-stack-lg py-stack-xl">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white">
        <span className="material-symbols-outlined text-4xl">auto_awesome</span>
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-headline-md font-bold">AI 여행 일정</h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          조건을 선택하면 AI가 맞춤 일정을 추천해드려요
        </p>
      </div>

      <Link
        to="/trip/choice"
        className="btn-primary w-full max-w-sm text-center"
      >
        AI 일정 추천받기
      </Link>

      <Link
        to="/trip/saved"
        className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
      >
        이미 일정이 있습니다 →
      </Link>
    </div>
  );
}
