import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/admin/api/adminApi";

/**
 * 관리자 페이지에 처음 들어오면 보이는 대시보드.
 * 지금 홈 화면에 실제로 노출되고 있는 이미지(배너/메인배경/이달의 여행지)를
 * 한눈에 미리보고, 클릭하면 바로 그 관리 페이지로 이동해 수정할 수 있다.
 */
export default function AdminDashboardPage() {
  const { data: bannerData, isLoading: bannersLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: adminApi.getBanners,
  });
  const { data: bgData, isLoading: bgLoading } = useQuery({
    queryKey: ["admin", "main-backgrounds"],
    queryFn: adminApi.getMainBackgrounds,
  });
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["admin", "monthly-destinations"],
    queryFn: adminApi.getMonthlyDestinations,
  });

  const banners = bannerData?.data?.data ?? [];
  const backgrounds = bgData?.data?.data ?? [];
  const monthly = monthlyData?.data?.data ?? [];

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md font-bold">홈 화면 미리보기</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          지금 홈페이지에 실제로 노출되는 이미지들이에요. 카드를 클릭하면 수정 페이지로 이동해요.
        </p>
      </div>

      <PreviewSection
        title="배너 (팝업/코너 광고)"
        to="/admin/banners"
        loading={bannersLoading}
        empty={banners.length === 0}
      >
        {banners.map((b) => (
          <Link key={b.id} to="/admin/banners" className="group relative h-32 rounded-xl overflow-hidden">
            {b.mediaType === "VIDEO" ? (
              <div className="absolute inset-0 bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">movie</span>
              </div>
            ) : (
              <img src={b.imageUrl} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-2 left-2 right-2 text-white text-label-sm font-bold truncate">
              {b.title} {!b.active && "(비노출)"}
            </p>
          </Link>
        ))}
      </PreviewSection>

      <PreviewSection
        title="메인 배경"
        to="/admin/main-backgrounds"
        loading={bgLoading}
        empty={backgrounds.length === 0}
      >
        {backgrounds.map((bg) => (
          <Link key={bg.id} to="/admin/main-backgrounds" className="group relative h-32 rounded-xl overflow-hidden">
            {bg.mediaType === "VIDEO" ? (
              <div className="absolute inset-0 bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">movie</span>
              </div>
            ) : (
              <img src={bg.mediaUrl} alt="메인 배경" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
            )}
            {!bg.active && (
              <p className="absolute bottom-2 left-2 right-2 text-white text-label-sm font-bold">비노출</p>
            )}
          </Link>
        ))}
      </PreviewSection>

      <PreviewSection
        title="이달의 여행지"
        to="/admin/monthly-destinations"
        loading={monthlyLoading}
        empty={monthly.length === 0}
      >
        {monthly.map((m) => (
          <Link key={m.id} to="/admin/monthly-destinations" className="group relative h-32 rounded-xl overflow-hidden">
            <img src={m.imageUrl} alt={m.destinationName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-2 left-2 right-2 text-white text-label-sm font-bold truncate">
              {m.destinationName} {!m.active && "(비노출)"}
            </p>
          </Link>
        ))}
      </PreviewSection>
    </div>
  );
}

function PreviewSection({
  title,
  to,
  loading,
  empty,
  children,
}: {
  title: string;
  to: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="card-base p-stack-lg">
      <div className="flex items-center justify-between mb-stack-sm">
        <h2 className="text-headline-sm font-bold">{title}</h2>
        <Link to={to} className="text-label-sm text-primary font-bold hover:underline">
          관리하기 →
        </Link>
      </div>
      {loading ? (
        <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
      ) : empty ? (
        <p className="text-body-sm text-on-surface-variant">등록된 게 없어요.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{children}</div>
      )}
    </section>
  );
}
