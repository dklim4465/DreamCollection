import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";
import AdBannerModal from "@/home/component/AdBannerModal";
import HeroBackground from "@/home/component/HeroBackground";
import QuickLinksBar from "@/home/component/QuickLinksBar";
import MiniCalendar from "@/home/component/MiniCalendar";
import ProfileSummary from "@/home/component/ProfileSummary";
import MonthlyBest10 from "@/home/component/MonthlyBest10";
import PopularDestinations from "@/home/component/PopularDestinations";
import HeroCarousel from "@/home/component/HeroCarousel";
import ExchangeRateWidget from "@/home/component/ExchangeRateWidget";
import NoticePreview from "@/home/component/NoticePreview";
import SiteIntro from "@/home/component/SiteIntro";

const HIDE_BANNER_KEY = "dream_collection_hide_banner_until";

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowBannerToday() {
  return localStorage.getItem(HIDE_BANNER_KEY) !== todayString();
}

/**
 * 홈 페이지 구성 (2026-07 리뉴얼 v3 — 레이아웃 재배치)
 *  1. 진입 시 광고형 배너 팝업 ("오늘 하루 보지 않기" 선택 시 당일 재노출 안 함)
 *  2. 바로가기 4대 메뉴 + 공지사항 + 캘린더/프로필/이달의 여행지 BEST10
 *     (로그인 상태와 무관하게 항상 먼저 보이는 핵심 정보 영역)
 *  3. 화면 꽉 채운 히어로 배너 (이달의 여행지가 5초 간격으로 랜덤 순환, 로그인 시 다가오는 일정 자동 노출)
 *  4. 지금 인기 있는 여행지 → 이달의 추천 여행지 캐러셀 → 오늘의 환율 → 서비스 소개
 *
 * 상단 네비게이션(로고 / 검색 / 로그인·마이페이지)은 AppLayout의 <Navbar />가 전 페이지 공통으로 담당.
 * ※ 여행 준비 체크리스트 섹션은 제거함 (2026-07 요청).
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [showModal, setShowModal] = useState(shouldShowBannerToday);

  const handleHideToday = () => {
    localStorage.setItem(HIDE_BANNER_KEY, todayString());
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <AdBannerModal
          onClose={() => setShowModal(false)}
          onHideToday={handleHideToday}
        />
      )}

      <QuickLinksBar />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
        <MiniCalendar />

        {isAuthenticated && user ? (
          <ProfileSummary user={user} />
        ) : (
          <div className="card-base p-stack-lg flex flex-col items-center justify-center gap-stack-sm text-center h-full">
            <span className="material-symbols-outlined text-primary text-4xl">
              person
            </span>
            <p className="text-headline-sm font-bold">
              로그인하고 내 프로필을 확인하세요
            </p>
            <p className="text-body-md text-on-surface-variant">
              내 여행스타일에 맞는 추천을 받아보세요
            </p>
            <Link to="/login" className="btn-primary mt-2">
              로그인하기
            </Link>
          </div>
        )}

        <MonthlyBest10 />
      </section>

      <HeroBackground />

      <PopularDestinations />

      <HeroCarousel />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <ExchangeRateWidget />
        <NoticePreview />
      </section>

      <SiteIntro />
    </>
  );
}
