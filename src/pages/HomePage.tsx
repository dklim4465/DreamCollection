import HeroCarousel from '@/components/home/HeroCarousel';
import QuickActions from '@/components/home/QuickActions';
import FeedGrid     from '@/components/community/FeedGrid';

/**
 * 홈 페이지
 * 담당: A
 * 구성: HeroCarousel → QuickActions → FeedGrid
 * API 연동: useQuery로 각 컴포넌트에 data 전달
 */
export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <QuickActions />
      <FeedGrid />
    </>
  );
}
