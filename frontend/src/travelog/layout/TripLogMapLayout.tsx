import { ArrowLeft, Home } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { MapProvider } from "@/travelog/map/MapProvider";

export default function TripLogMapLayout() {
  const navigate = useNavigate();
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-glow">
          <p className="text-label-md text-primary">여행기 지도</p>
          <h1 className="mt-2 text-headline-md text-on-surface">
            지도를 불러올 수 없습니다.
          </h1>
          <p className="mt-3 text-body-md text-on-surface-variant">
            지도 서비스 설정을 확인한 후 다시 시도해 주세요.
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
        </section>
      </main>
    );
  }

  return (
    <MapProvider>
      <Outlet />
    </MapProvider>
  );
}
