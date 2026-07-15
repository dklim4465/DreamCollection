import { useState } from "react";
import AdBannerModal from "@/home/component/AdBannerModal";
import CornerAdBanner from "@/home/component/CornerAdBanner";
import MonthlyDestinationHero from "@/home/component/MonthlyDestinationHero";
import TrustStats from "@/home/component/TrustStats";
import ExchangeRateWidget from "@/home/component/ExchangeRateWidget";
import MonthlyBest10 from "@/home/component/MonthlyBest10";
import NoticePreview from "@/home/component/NoticePreview";
import BoardLatestPreview from "@/home/component/BoardLatestPreview";
import SiteIntro from "@/home/component/SiteIntro";
import RecentSavedTripsPreview from "@/home/component/RecentSavedTripsPreview";
import TravelChecklist from "@/home/component/TravelChecklist";
import ChatbotWidget from "@/home/component/ChatbotWidget";
import MiniCalendar from "@/home/component/MiniCalendar";
import ProfileSummary from "@/home/component/ProfileSummary";
import { useAuthStore } from "@/auth/store/authStore";

const HIDE_BANNER_KEY = "dream_collection_hide_banner_until";

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowBannerToday() {
  return localStorage.getItem(HIDE_BANNER_KEY) !== todayString();
}

/**
 * 홈 페이지 구성
 *  1. 진입 시 광고형 배너 팝업 ("오늘 하루 보지 않기" 선택 시 당일 재노출 안 함) + 우측 상단 코너 광고
 *  2. 로그인 시에만: 미니 캘린더(MiniCalendar, D-day 뱃지 포함) + 내 프로필 요약(ProfileSummary, 레벨/뱃지/해시태그)
 *     (예전엔 비로그인 시 로그인 유도 카드가 따로 있었으나, 바로 아래 SiteIntro 히어로와 내용이 중복돼서 제거함)
 *  3. 서비스 소개(SiteIntro) — 4초 자동 롤링 풀블리드 히어로 + 4개 기능 카드
 *  4. 이달의 추천 여행지 랭킹(MonthlyDestinationHero) — 1~5위/6~10위 페이지네이션
 *  5. 지금 인기 있는 여행지 통계(TrustStats)
 *  6. 내가 저장한 여행 미리보기(RecentSavedTripsPreview) + 여행 준비 체크리스트(TravelChecklist)
 *  7. 게시판 최신글 + 공지사항
 *  8. 오늘의 환율 + 이달의 추천 여행지(작은 위젯 버전)
 *
 * AI 챗봇은 화면 우측 고정 탭(ChatbotWidget)으로만 진입.
 */
export default function HomePage() {
  const [showModal, setShowModal] = useState(shouldShowBannerToday);
  const user = useAuthStore((state) => state.user);

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

      <CornerAdBanner />

      {user && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
          <MiniCalendar />
          <ProfileSummary user={user} />
        </section>
      )}

      {/* 서비스 소개: 4초 자동 롤링 풀블리드 히어로 — 페이지 맨 위에서 첫인상 담당 */}
      <div className="-mt-stack-lg">
        <SiteIntro />
      </div>

      <MonthlyDestinationHero />

      <TrustStats />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <RecentSavedTripsPreview />
        <TravelChecklist />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <BoardLatestPreview />
        <NoticePreview />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <ExchangeRateWidget />
        <MonthlyBest10 />
      </section>

      <ChatbotWidget />
    </>
  );
}