import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import DestinationPickerModal from "@/components/home/DestinationPickerModal";
import VisualBanner, { type BannerSlide } from "@/components/home/VisualBanner";
import MainMenuGrid from "@/components/home/MainMenuGrid";
import MiniCalendar from "@/components/home/MiniCalendar";
import ProfileSummary from "@/components/home/ProfileSummary";
import HeroCarousel from "@/components/home/HeroCarousel";
import TravelChecklist from "@/components/home/TravelChecklist";
import ExchangeRateWidget from "@/components/home/ExchangeRateWidget";

// TODO: 실제 운영 시 자체 호스팅 이미지 또는 CMS 이미지로 교체 권장
const BANNER_SLIDES: BannerSlide[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Dream Collection",
    title: "오늘은 어디로 떠나볼까요?",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Your Next Journey",
    title: "당신의 다음 여행을 기록해보세요",
  },
];

/**
 * 홈 페이지
 * 1. 진입 시 "어디로 떠나고 싶나요?" 팝업
 * 2. 팝업이 닫히면 자동 전환 배너 + 4대 메뉴 (일정 / 나의기록 / 게시판 / 메이트찾기) 바로 노출
 * 3. 캘린더 + 내 프로필(여행스타일)
 * 4. 추천 여행지
 * 5. 여행 준비 체크리스트 + 환율 정보
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [showModal, setShowModal] = useState(true);

  const handleCloseModal = (destination?: string) => {
    setShowModal(false);
    // TODO: destination 선택 시 검색 결과 페이지로 이동하거나 추천 로직에 반영
    if (destination) {
      console.log("선택한 여행지:", destination);
    }
  };

  return (
    <>
      {showModal && <DestinationPickerModal onClose={handleCloseModal} />}

      <VisualBanner slides={BANNER_SLIDES} intervalMs={5000} />

      <MainMenuGrid />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <MiniCalendar />

        {isAuthenticated && user ? (
          <ProfileSummary user={user} />
        ) : (
          <div className="card-base p-stack-lg flex flex-col items-center justify-center gap-stack-sm text-center">
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
      </section>

      <HeroCarousel />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <TravelChecklist />
        <ExchangeRateWidget />
      </section>
    </>
  );
}
