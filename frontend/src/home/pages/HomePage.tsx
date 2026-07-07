import { useState } from "react";
import AdBannerModal from "@/home/component/AdBannerModal";
import HeroBackground from "@/home/component/HeroBackground";
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
 * 홈 페이지 구성 (2026-07 리뉴얼 v7 — 여행지 이미지 중심, 캘린더/프로필 카드 제거)
 *  1. 진입 시 광고형 배너 팝업 ("오늘 하루 보지 않기" 선택 시 당일 재노출 안 함)
 *  2. 화면 꽉 채운 히어로 배너 — 네비게이션 바로 아래 딱 붙임
 *  3. 지금 인기 있는 여행지 (큰 이미지 카드) — 여행지 비주얼이 홈페이지의 중심이 되도록 배치
 *  4. 이달의 추천 여행지 캐러셀 → 오늘의 환율 + 공지사항 미리보기 → 서비스 소개
 *
 * 캘린더/프로필 요약/이달의 BEST10 카드는 여행지 이미지 중심 레이아웃으로 단순화하며 제거함.
 * (필요하면 마이페이지(/profile)에서 각자 확인 가능)
 * 바로가기 5대 메뉴(일정/나의기록/게시판/메이트찾기/공지사항)는 상단 네비게이션
 * (`Navbar`, id="top-bar")에 통합되어 모든 페이지 공통으로 노출됨.
 */
export default function HomePage() {
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

      {/* 히어로: 여행지 이미지가 네비게이션 바로 아래에서 바로 시선을 잡도록 최상단 배치 */}
      <div className="-mt-stack-lg">
        <HeroBackground />
      </div>

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
