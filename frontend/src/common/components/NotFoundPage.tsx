import { ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[55vh] items-center justify-center py-16 text-center">
      <div className="max-w-md">
        <p className="text-label-md text-primary">404</p>
        <h1 className="mt-2 text-headline-md text-on-surface">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="mt-3 text-body-md text-on-surface-variant">
          주소가 변경되었거나 존재하지 않는 페이지입니다.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-5 text-label-md text-on-surface transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            이전 화면
          </button>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-label-md text-on-primary transition hover:opacity-90"
          >
            <Home size={18} aria-hidden="true" />
            홈으로
          </Link>
        </div>
      </div>
    </section>
  );
}
