import { useRef } from 'react';
import type { DestinationCard } from '@/types';

// TODO: API 연동 시 props로 받거나 React Query로 교체
const SAMPLE_DESTINATIONS: DestinationCard[] = [
  {
    id: 1,
    country: '대한민국',
    region: '제주도',
    title: '바람과 돌의 섬에서 찾는 진정한 휴식',
    description: '에메랄드빛 바다와 현무암 해안',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC35TVpFbilkxzaf5dhIdHjb1dctmTaqb5DUExKlwa97FQkhWgtacYHVoyqRDyLCkH4hoGv_5DJ2eximPv2NprBDfDuHniqbh1BQVPW1i1Qz-nCXU4kpophIfdFS5QqiUB3D2N9lOGwmXbHcgvyqUyC8p5wdcc81Dcg7C3q041b02BQn_5CDG6mAfJCk4fyrabzDxMCAs-MSHPNi6cGhcskcNMQ_gD_ok01P-FpqwFVNQYK-S0LnfBY-QN6UZBcH2JKlDJZNO5dZw',
    tags: ['자연', '힐링'],
  },
  {
    id: 2,
    country: '일본',
    region: '교토',
    title: '가을 정취 가득한 고즈넉한 사찰 산책',
    description: '단풍으로 물든 천년 고도',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD80JREi61ssiRLQQeIMqbYvZusSuotuIQ4VZoRnfpQdiOGustVuCIQ0Ljs7XbI5yMdUQr1TqaPr7hnbt77liFOwxuuDCfgGwQFZiPDDxonJOxQF3_7NrATLUTUjLLvXcXCFGll7MrEDCoOLw1OzHueuKMqdHLnTXJqlY23cqODlsceiGG-cx8GMwdPizW3g_4r-rHCsW0DXYPWy8vMFNEib7eKSwjeZSwKn_WVHDmOxCunsRRCOxhApPM4ySogUIh7i54iaXLRDYw',
    tags: ['문화', '역사'],
  },
  {
    id: 3,
    country: '스위스',
    region: '인터라켄',
    title: '만년설의 장엄함을 만나는 기차 여행',
    description: '알프스를 가로지르는 환상 여정',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9nWGy22KhEXSh7FfC1mXTGw7mUB7yV7nN5mL3RNvQML-kARh42KeSntVEiPdR25w-jyw9NapCSdDiC4I9tBM3W2u3WGf2vGcgFcuBN8S0sYdrPq1uvjektr3cjlbe8E66pQ43nKgInfTCbmb53Qcl48i0mIrjnI425pcs1r-qA07jDTfFDDe28GpRKCFQ07Okfb7VJfzpZX4cDlcvCK-djwIC08974FcJ1K1YyoKNRv_9LPV3KVAPoiQTf43dkgCuj0k2PVkiwww',
    tags: ['모험', '자연'],
  },
];

interface Props {
  items?: DestinationCard[];
}

export default function HeroCarousel({ items = SAMPLE_DESTINATIONS }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'prev' | 'next') => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.offsetWidth * 0.8;
    carouselRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section>
      {/* 섹션 헤더 */}
      <div className="flex justify-between items-end mb-stack-md">
        <div>
          <span className="chip-tertiary">Editor's Pick</span>
          <h2 className="text-display-lg md:text-display-lg text-[32px] lg:text-display-lg mt-2 font-bold">
            이달의 추천 여행지
          </h2>
        </div>
        <div className="flex gap-2">
          {(['prev', 'next'] as const).map((dir) => (
            <button key={dir} onClick={() => scroll(dir)}
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">
                {dir === 'prev' ? 'chevron_left' : 'chevron_right'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 캐러셀 */}
      <div ref={carouselRef}
        className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-gutter pb-4">
        {items.map((dest) => (
          <div key={dest.id}
            className="snap-start shrink-0 w-full md:w-[600px] group cursor-pointer relative overflow-hidden rounded-2xl aspect-video traveler-glow transition-transform duration-500 hover:scale-[1.01]">
            {/* 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img
              src={dest.imageUrl}
              alt={dest.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* 텍스트 */}
            <div className="absolute bottom-0 left-0 p-stack-lg z-20 text-white">
              <p className="text-label-md mb-1 opacity-80">
                {dest.country}, {dest.region}
              </p>
              <h3 className="text-headline-md font-bold mb-4">{dest.title}</h3>
              <button className="bg-white text-primary px-6 py-2 rounded-full font-bold text-label-md hover:bg-primary-container transition-colors">
                자세히 보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
