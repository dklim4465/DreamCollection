import { useState } from "react";
import AdBannerModal from "@/home/component/AdBannerModal";
import CornerAdBanner from "@/home/component/CornerAdBanner";
import MonthlyDestinationHero from "@/home/component/MonthlyDestinationHero";
import TrustStats from "@/home/component/TrustStats";
import ExchangeRateWidget from "@/home/component/ExchangeRateWidget";
import WorldClockWidget from "@/home/component/WorldClockWidget";
import NoticePreview from "@/home/component/NoticePreview";
import BoardLatestPreview from "@/home/component/BoardLatestPreview";
import SiteIntro from "@/home/component/SiteIntro";
import RecentSavedTripsPreview from "@/home/component/RecentSavedTripsPreview";
import TravelChecklist from "@/home/component/TravelChecklist";
import ChatbotWidget from "@/home/component/ChatbotWidget";
import MiniCalendar from "@/home/component/MiniCalendar";
import ProfileSummary from "@/home/component/ProfileSummary";
import ScrollReveal from "@/home/component/ScrollReveal";
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
 *     (이 데이터를 다르게 보여주기만 하던 하단 위젯 MonthlyBest10과, 인기 도시 카드
 *      PopularDestinations를 둘 다 제거함 — 내용이 겹쳐서 이 랭킹 하나로 충분함)
 *  5. 지금 인기 있는 여행지 통계(TrustStats)
 *  6. 내가 저장한 여행 미리보기(RecentSavedTripsPreview) + 여행 준비 체크리스트(TravelChecklist)
 *  7. 게시판 최신글 + 공지사항 (각각 eyebrow 라벨 추가해서 다른 섹션들과 톤 통일)
 *  8. 오늘의 환율 (폭을 줄여서 혼자 화면 전체를 차지하지 않게 함)
 *
 * AI 챗봇은 화면 우측 고정 탭(ChatbotWidget)으로만 진입.
 * 히어로(SiteIntro)와 팝업/코너 배너를 제외한 나머지 섹션은 ScrollReveal로 감싸서
 * 스크롤해서 화면에 들어올 때 부드럽게 페이드인 + 살짝 위로 올라오는 효과를 준다
 * (prefers-reduced-motion이면 자동으로 애니메이션 없이 바로 보임).
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

      <ScrollReveal>
        <MonthlyDestinationHero />
      </ScrollReveal>

      <ScrollReveal>
        <TrustStats />
      </ScrollReveal>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <ScrollReveal>
          <RecentSavedTripsPreview />
        </ScrollReveal>
        <ScrollReveal delayMs={150}>
          <TravelChecklist />
        </ScrollReveal>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <ScrollReveal>
          <BoardLatestPreview />
        </ScrollReveal>
        <ScrollReveal delayMs={150}>
          <NoticePreview />
        </ScrollReveal>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <ScrollReveal>
          <ExchangeRateWidget />
        </ScrollReveal>
        <ScrollReveal delayMs={150}>
          <WorldClockWidget />
        </ScrollReveal>
      </section>

      <ChatbotWidget />
    </>
  );
}
