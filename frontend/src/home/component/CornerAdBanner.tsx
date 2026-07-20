import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "@/home/api/bannerApi";

const HIDE_TODAY_KEY = "dream_collection_hide_corner_banner_until";

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowToday() {
  return localStorage.getItem(HIDE_TODAY_KEY) !== todayString();
}

/**
 * 화면 우측 상단에 작은 광고처럼 떠 있는 코너 배너.
 * banner_type = 'CORNER_AD'인 배너 중 노출 순서가 가장 앞선 1개만 보여준다.
 * 현재는 홍보 영상(대표 홍보 영상) 배너가 여기에 해당한다.
 * ⚠ 영상이 안 나온다면 대부분 DB의 banner.media_type이 아직 'IMAGE'로 남아있는 경우다.
 *   db/update-corner-banner-to-video.sql 을 실행했는지 먼저 확인할 것.
 * 팝업형(AdBannerModal)과는 별도의 localStorage 키로 "오늘 하루 보지 않기"를 기억한다
 * (팝업을 오늘 안 보기로 껐다고 해서 이 코너 배너까지 같이 꺼지면 안 되므로 키를 분리함).
 * 영상/이미지 위에는 banner.title을 그대로 문구로 얹어서 보여준다(별도 캡션 필드 없이 재활용) —
 * 관리자가 실제로 노출하고 싶은 홍보 문구를 title에 넣으면 그게 그대로 배너에 보인다.
 */
export default function CornerAdBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [hiddenToday, setHiddenToday] = useState(() => !shouldShowToday());

  const { data } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.getBanners,
    retry: false,
  });

  const banners = data?.data?.data ?? [];
  const banner = banners.find((b) => b.bannerType === "CORNER_AD");

  if (!banner || dismissed || hiddenToday) return null;

  const handleClick = () => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleHideToday = () => {
    localStorage.setItem(HIDE_TODAY_KEY, todayString());
    setHiddenToday(true);
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
        className="relative block w-full text-left"
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

        {/* 영상/이미지 위에 얹는 홍보 문구 — banner.title을 그대로 씀 (관리자가 문구를 바꾸고 싶으면
            banner.title만 UPDATE하면 됨, 별도 필드 없이 재활용) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-white text-label-md font-bold leading-snug drop-shadow">
          {banner.title}
        </p>
      </button>

      <button
        type="button"
        onClick={handleHideToday}
        className="w-full text-center text-label-sm text-white/70 bg-black/70 py-1.5 hover:text-white transition-colors"
      >
        오늘 하루 보지 않기
      </button>
    </div>
  );
}
