import { useState } from "react";
import { Link } from "react-router-dom";
import AdBannerModal from "@/home/component/AdBannerModal";
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
import PopularDestinations from "@/home/component/PopularDestinations";
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
 *  1. 진입 시 광고형 배너 팝업 ("오늘 하루 보지 않기" 선택 시 당일 재노출 안 함)
 *  2. 미니 캘린더(MiniCalendar) + 내 프로필 요약(ProfileSummary) — 비로그인 시 프로필 자리에 로그인 유도 카드 노출
 *  3. 서비스 소개(SiteIntro) — 4초 자동 롤링 풀블리드 히어로 + 4개 기능 카드
 *  4. 이달의 추천 여행지 랭킹(MonthlyDestinationHero) — 1~5위/6~10위 페이지네이션
 *     (기존 "오늘은 어디로 떠나볼까요?" 히어로 배너 자리를 대체)
 *  5. 지금 인기 있는 여행지 통계(TrustStats)
 *  6. 내가 저장한 여행 미리보기(RecentSavedTripsPreview) + 여행 준비 체크리스트(TravelChecklist)
 *  7. 게시판 최신글 + 공지사항
 *  8. 오늘의 환율 + 이달의 추천 여행지(작은 위젯 버전)
 *  9. 지금 인기 있는 여행지(PopularDestinations) — city 마스터 데이터, 클릭 시 일정 생성으로 이동
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <MiniCalendar />
        {user ? (
          <ProfileSummary user={user} />
        ) : (
          <section className="card-base p-stack-lg flex flex-col items-center justify-center text-center gap-stack-sm h-full">
            <span className="material-symbols-outlined text-4xl text-primary">
              photo_camera
            </span>
            <h2 className="text-headline-sm font-bold">
              로그인해서 추억을 저장하세요
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              여행 일정, 사진, 뱃지까지 — 로그인하면 다 내 것으로 남아요
            </p>
            <Link to="/login" className="btn-primary mt-2">
              로그인하기
            </Link>
          </section>
        )}
      </section>

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

      <PopularDestinations />

      <ChatbotWidget />
    </>
  );
}