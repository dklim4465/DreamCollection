import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "@/home/api/bannerApi";

interface Props {
  onClose: () => void;
  onHideToday: () => void;
}

/**
 * 홈페이지 진입 시 노출되는 광고형 배너 팝업.
 * 관리자가 등록한 배너(GET /api/banners) 중 노출 순서가 가장 앞선 1개만 보여준다.
 * 배너가 하나도 없으면 아무것도 렌더링하지 않는다 (HomePage에서 처리).
 */
export default function AdBannerModal({ onClose, onHideToday }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.getBanners,
    retry: false,
  });

  const banner = data?.data?.data?.[0];

  // 로딩 중이거나 노출할 배너가 없으면 팝업 자체를 띄우지 않음
  if (!isLoading && !banner) {
    return null;
  }

  const handleBannerClick = () => {
    if (banner?.linkUrl) {
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4">
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden w-full max-w-sm relative traveler-glow">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {isLoading ? (
          <div className="w-full aspect-square bg-surface-container-high animate-pulse" />
        ) : (
          <button
            type="button"
            onClick={handleBannerClick}
            className="block w-full text-left"
            disabled={!banner?.linkUrl}
          >
            <img
              src={banner!.imageUrl}
              alt={banner!.title}
              className="w-full aspect-square object-cover"
            />
          </button>
        )}

        <button
          onClick={onHideToday}
          className="w-full py-3 text-label-md text-on-surface-variant border-t border-outline-variant hover:bg-surface-container-low transition-colors"
        >
          오늘 하루 보지 않기
        </button>
      </div>
    </div>
  );
}
