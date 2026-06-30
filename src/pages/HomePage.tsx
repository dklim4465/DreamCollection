import { useAuthStore } from "@/store/authStore";
import ProfileSummary from "@/components/home/ProfileSummary";
import MainMenuGrid from "@/components/home/MainMenuGrid";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeedGrid from "@/components/community/FeedGrid";

/**
 * 홈 페이지
 * - 로그인 시: 내 프로필(+여행스타일) 카드를 최상단에 노출
 * - 공통: 4대 메뉴(일정 / 나의기록 / 게시판 / 메이트찾기) → 추천 여행지 → 피드
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      {isAuthenticated && user && <ProfileSummary user={user} />}
      <MainMenuGrid />
      <HeroCarousel />
      <FeedGrid />
    </>
  );
}
