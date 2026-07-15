import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "@/home/api/bannerApi";

/**
 * 화면 우측 상단에 작은 광고처럼 떠 있는 코너 배너.
 * banner_type = 'CORNER_AD'인 배너 중 노출 순서가 가장 앞선 1개만 보여준다.
 * 현재는 홍보 영상(대표 홍보 영상) 배너가 여기에 해당한다.
 * 팝업형(AdBannerModal)과 달리 "오늘 하루 보지 않기"는 없고, 세션 동안만 닫기 상태를 기억한다.
 */
export default function CornerAdBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.getBanners,
    retry: false,
  });

  const banners = data?.data?.data ?? [];
  const banner = banners.find((b) => b.bannerType === "CORNER_AD");

  if (!banner || dismissed) return null;

  const handleClick = () => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 w-[220px] rounded-2xl overflow-hidden shadow-xl border border-outline-variant bg-surface-container-lowest animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-black/70">
        <span className="text-label-sm text-white/90">AD</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="광고 닫기"
          className="w-5 h-5 flex items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="block w-full text-left"
        disabled={!banner.linkUrl}
      >
        {banner.mediaType === "VIDEO" ? (
          <video
            src={banner.imageUrl}
            className="w-full aspect-[9/16] object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full aspect-[9/16] object-cover"
          />
        )}
      </button>
    </div>
  );
}
