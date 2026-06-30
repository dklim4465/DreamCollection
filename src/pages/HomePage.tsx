import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import DestinationPickerModal from "@/components/home/DestinationPickerModal";
import MainMenuGrid from "@/components/home/MainMenuGrid";
import MiniCalendar from "@/components/home/MiniCalendar";
import ProfileSummary from "@/components/home/ProfileSummary";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeedGrid from "@/components/community/FeedGrid";

/**
 * 홈 페이지
 * 1. 진입 시 "어디로 떠나고 싶나요?" 팝업
 * 2. 4대 메뉴 (일정 / 나의기록 / 게시판 / 메이트찾기)
 * 3. 캘린더 + 내 프로필(여행스타일)
 * 4. 추천 여행지
 * 5. 커뮤니티 피드
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
      <FeedGrid />
    </>
  );
}
