import { useState } from "react";
import AdBannerModal from "@/home/component/AdBannerModal";
import HeroBackground from "@/home/component/HeroBackground";
import TrustStats from "@/home/component/TrustStats";
import ExchangeRateWidget from "@/home/component/ExchangeRateWidget";
import NoticePreview from "@/home/component/NoticePreview";
import SiteIntro from "@/home/component/SiteIntro";
import AiPlannerBanner from "@/home/component/AiPlannerBanner";
import RecentSavedTripsPreview from "@/home/component/RecentSavedTripsPreview";
import ChatbotWidget from "@/home/component/ChatbotWidget";

const HIDE_BANNER_KEY = "dream_collection_hide_banner_until";

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowBannerToday() {
  return localStorage.getItem(HIDE_BANNER_KEY) !== todayString();
}

/**
 * 홈 페이지 구성 (2026-07 리뉴얼 v8 — 서비스 소개를 최상단 히어로 자리로 이동)
 *  1. 진입 시 광고형 배너 팝업 ("오늘 하루 보지 않기" 선택 시 당일 재노출 안 함)
 *  2. 서비스 소개(SiteIntro) — 인기 여행지 사진이 순환되는 풀블리드 배경 + 4개 기능 카드,
 *     페이지 최상단에서 첫인상을 담당
 *  3. 화면 꽉 채운 히어로 배너(HeroBackground) — 여행지별 CTA
 *  3-1. "AI와 함께 여행을 계획해 보세요" 배너(AiPlannerBanner) — 클릭 시 AI 챗봇 패널(ChatbotWidget) 오픈
 *  4. 지금 인기 있는 여행지 (큰 이미지 카드)
 *  5. 내가 저장한 여행 미리보기(RecentSavedTripsPreview) — 이달의 추천 여행지 캐러셀이
 *     위쪽 HeroBackground와 내용 겹쳐서 빠진 자리에 채움 (비로그인이면 안 보임)
 *  6. 오늘의 환율 + 공지사항 미리보기
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

      {/* 서비스 소개: 인기 여행지 사진이 순환되는 풀블리드 히어로 — 페이지 맨 위에서 첫인상 담당 */}
      <div className="-mt-stack-lg">
        <SiteIntro />
      </div>

      <HeroBackground />

      <AiPlannerBanner />

      <TrustStats />

      <RecentSavedTripsPreview />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <ExchangeRateWidget />
        <NoticePreview />
      </section>

      <ChatbotWidget />
    </>
  );
}
