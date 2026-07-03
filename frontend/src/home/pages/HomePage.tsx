import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";
import AdBannerModal from "@/home/component/AdBannerModal";
import MainMenuGrid from "@/home/component/MainMenuGrid";
import MiniCalendar from "@/home/component/MiniCalendar";
import ProfileSummary from "@/home/component/ProfileSummary";
import MonthlyBest10 from "@/home/component/MonthlyBest10";
import PopularDestinations from "@/home/component/PopularDestinations";
import HeroCarousel from "@/home/component/HeroCarousel";
import TravelChecklist from "@/home/component/TravelChecklist";
import ExchangeRateWidget from "@/home/component/ExchangeRateWidget";
import SiteIntro from "@/home/component/SiteIntro";
import NoticeBoard from "@/home/component/NoticeBoard";

const HIDE_BANNER_KEY = "dream_collection_hide_banner_until";

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowBannerToday() {
  return localStorage.getItem(HIDE_BANNER_KEY) !== todayString();
}

/**
 * 홈 페이지 구성 (2026-07 리뉴얼)
 *  1. 진입 시 광고형 배너 팝업 ("오늘 하루 보지 않기" 선택 시 당일 재노출 안 함)
 *  2. 바로가기 4대 메뉴 (일정 / 나의기록 / 게시판 / 메이트찾기)
 *  3. 캘린더(일정 있는 날짜엔 목적지 썸네일) + 내 프로필 + 이달의 여행지 BEST10
 *  4. 지금 인기 있는 여행지 (city 마스터 데이터, 검색창 자동완성과 같은 소스)
 *  5. 이달의 추천 여행지 캐러셀 ("여기는 어떠세요?")
 *  6. 오늘의 환율
 *  7. 서비스 소개 (사진 보관 · 공유)
 *  8. 공지사항 + 여행 준비 체크리스트
 *
 * 상단 네비게이션(로고 / 검색 / 로그인·마이페이지)은 AppLayout의 <Navbar />가 전 페이지 공통으로 담당.
 *
 * ※ 게시판/메이트찾기/일정/나의기록은 아직 백엔드 API가 없어서(다른 팀원 작업 예정),
 *   여기서는 실제로 동작하는 데이터(도시 마스터, 공지사항)만 노출합니다.
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

      <MainMenuGrid />

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

      <PopularDestinations />

      <HeroCarousel />

      <ExchangeRateWidget />

      <SiteIntro />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
        <NoticeBoard />
        <TravelChecklist />
      </section>
    </>
  );
}
