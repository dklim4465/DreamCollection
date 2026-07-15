import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerApi } from "@/home/api/bannerApi";
import { couponApi } from "@/profile/api/couponApi";
import { useAuthStore } from "@/auth/store/authStore";

interface Props {
  onClose: () => void;
  onHideToday: () => void;
}

/**
 * 홈페이지 진입 시 노출되는 광고형 배너 팝업 (banner_type = 'POPUP').
 * 관리자가 등록한 팝업 배너 중 노출 순서가 가장 앞선 1개만 보여준다.
 * 배너가 하나도 없으면 아무것도 렌더링하지 않는다 (HomePage에서 처리).
 *
 * 2026-07 신규가입 이벤트 배너(link_url = '/register')는 특별 처리:
 *  - 비로그인 상태 → 회원가입 페이지로 이동 (가입 완료 시 10% 쿠폰 자동 지급)
 *  - 로그인 상태   → 5% 쿠폰을 바로 지급하고 마이페이지 보관함으로 이동
 */
export default function AdBannerModal({ onClose, onHideToday }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [claiming, setClaiming] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.getBanners,
    retry: false,
  });

  const banner = data?.data?.data?.find((b) => b.bannerType === "POPUP");

  // 로딩 중이거나 노출할 팝업 배너가 없으면 팝업 자체를 띄우지 않음
  if (!isLoading && !banner) {
    return null;
  }

  const isSignupEventBanner = banner?.linkUrl === "/register";

  const handleBannerClick = async () => {
    if (!banner?.linkUrl) return;

    if (isSignupEventBanner) {
      if (isAuthenticated) {
        // 이미 회원인 경우: 5% 쿠폰 즉시 지급 후 보관함으로 이동
        try {
          setClaiming(true);
          await couponApi.claimEventCoupon();
          queryClient.invalidateQueries({ queryKey: ["coupons", "me"] });
        } catch {
          // 이미 발급받은 경우 등 — 조용히 무시하고 보관함으로 이동
        } finally {
          setClaiming(false);
          onClose();
          navigate("/profile?tab=coupons");
        }
        return;
      }
      onClose();
      navigate("/register");
      return;
    }

    if (banner.linkUrl.startsWith("/")) {
      onClose();
      navigate(banner.linkUrl);
    } else {
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4">
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden w-full max-w-2xl relative traveler-glow">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {isLoading ? (
          <div className="w-full aspect-video bg-surface-container-high animate-pulse" />
        ) : (
          <button
            type="button"
            onClick={handleBannerClick}
            className="relative block w-full text-left disabled:cursor-wait"
            disabled={!banner?.linkUrl || claiming}
          >
            {isSignupEventBanner ? (
              <div className="w-full aspect-video bg-gradient-to-br from-primary via-primary/90 to-secondary/80 flex flex-col items-center justify-center gap-2 text-white text-center px-6">
                <span className="text-label-md font-semibold tracking-wide bg-white/20 px-3 py-1 rounded-full">
                  7월 한 달 · 신규가입 이벤트
                </span>
                <h3 className="text-headline-md md:text-display-sm font-bold">
                  {isAuthenticated ? "5% 할인 쿠폰을 드려요" : "지금 가입하면 10% 할인!"}
                </h3>
                <p className="text-body-md text-white/85">
                  {isAuthenticated
                    ? "이미 회원이시네요! 감사의 의미로 5% 할인 쿠폰을 드려요."
                    : "회원가입만 해도 전 상품 10% 할인 쿠폰이 보관함에 쏙"}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-label-lg font-bold underline underline-offset-4">
                  {claiming ? "쿠폰 지급 중..." : isAuthenticated ? "쿠폰 받으러 가기 →" : "회원가입 하러 가기 →"}
                </span>
              </div>
            ) : banner!.mediaType === "VIDEO" ? (
              <video
                src={banner!.imageUrl}
                className="w-full aspect-video object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={banner!.imageUrl}
                alt={banner!.title}
                className="w-full aspect-video object-cover"
              />
            )}
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
