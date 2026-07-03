import type { FeedItem } from '@/types';
import { Link } from 'react-router-dom';

// 샘플 데이터 — API 연동 시 props로 교체
const SAMPLE_FEED: FeedItem[] = [
  {
    id: 1,
    type: 'tip',
    badge: 'Tip',
    title: '유럽 배낭여행 꿀팁: 짐 줄이는 최고의 방법 10가지',
    excerpt: '가장 중요한 건 다용도 의류입니다. 한 달 여행도 기내용 캐리어 하나로 충분히 가능해요...',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7U7He8Wbx1iIDiNtAlPAQ4O9tWvKwKKRaaHXjd6YSTXhBLRwtY5PvmHckRpzywER1AiZAFN4dVjGu99DN5MKq-0WXNafxiJEsQQv50q7yCVozdse09US4VoiJpi84kHC0u5o6UeOpBW1yZwej4PEBg9Y-W6Ytv1DLjYz37uhrpeznTGkp_dZJ1X8Y2BtiCuTBU-RMJL2VPHWC0YUPa0Y399IFS7fHaJ_nQHwBmo237u6Mdr3jf0x0wKGTR6ZTk3T5NFd-oDn0HuI',
    author: { id: 1, nickname: '김지수', profileImage: undefined },
    likeCount: 128,
    commentCount: 42,
    createdAt: '2024-11-01',
  },
  {
    id: 2,
    type: 'guide',
    badge: 'Foodie Guide',
    title: '서울 숨겨진 맛집 리스트',
    excerpt: '현지인들만 아는 진짜 노포들만 모았습니다...',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPfi2Hqcvd-jr1cqiXpPLZyIcjnxODepHsMYXdnGbOnInmBNsAq2cNhrDH986PXIMdGW8kYYpCofVryrl1Uu-6o23LziDbS4Q35WZIiVYeWtkcXVChiaTl89tFlAnJOBTQKej3x_UashhppROBO2XK-N_4dlgHUCAAUbKbd-xx_4TXqwBtBq1ltMhqFEoMI6zxPzi084rlmbwcA3hn_sXfT7eKt5NdOyxMQDjz-eCLQpDfp5tUUTpT8kGcI21mtbHebE3BueL4onU',
    createdAt: '2024-11-02',
  },
  {
    id: 3,
    type: 'companion',
    title: '동행 구해요!',
    excerpt: '12월 중순 도쿄 3박 4일 일정 같이 하실 분 계신가요?',
    createdAt: '2024-11-03',
  },
  {
    id: 4,
    type: 'spot',
    title: '인기 여행지 실시간 현황',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJOoGhq4Vavw24vHQIfXE0XuZ6FWDkOlSgS9jH2hd4ZXBHFNBT25d8UHWXpxU685H6gFc0C2Oxls5qlDmtLqYU7bbf9cag5f0IcTAHOwWmoKwj8BEg81BOxuVFGtel5WRcD5MDETuxe7-nztvf7rtWOjcldoGEtWjHDOxfqjT-lq5YaU_s6knqVyb49AnmINdXYT_SJRMOOF3wzqXXG8wys68S27rCLZNUsWxJqzROSwaRmlgGCTnrBW9ST9EvpK_OKFDJA6mwXd0',
    isLive: true,
    createdAt: '2024-11-04',
  },
];

interface Props {
  items?: FeedItem[];
}

export default function FeedGrid({ items = SAMPLE_FEED }: Props) {
  const [item1, item2, item3, item4] = items;

  return (
    <section className="mb-stack-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-stack-lg">
        <h2 className="text-headline-md font-bold">여행자 커뮤니티 피드</h2>
        <Link to="/community"
          className="text-primary text-label-md flex items-center gap-1 hover:underline">
          전체보기
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {/* 벤토 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-gutter h-auto md:h-[600px]">

        {/* Item 1 — 대형 (col-span-2, row-span-2) */}
        {item1 && (
          <Link to={`/community/${item1.id}`}
            className="md:col-span-2 md:row-span-2 bg-white rounded-2xl overflow-hidden traveler-glow traveler-glow-hover group flex flex-col cursor-pointer">
            <div className="relative flex-1 min-h-64">
              {item1.imageUrl && (
                <img src={item1.imageUrl} alt={item1.title}
                  className="w-full h-full object-cover" />
              )}
              {item1.badge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {item1.badge}
                  </span>
                </div>
              )}
            </div>
            <div className="p-stack-lg bg-white">
              {item1.author && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <span className="text-label-sm text-on-surface">{item1.author.nickname} 님</span>
                </div>
              )}
              <h4 className="text-headline-sm font-bold mb-2">{item1.title}</h4>
              {item1.excerpt && (
                <p className="text-body-md text-on-surface-variant line-clamp-2">{item1.excerpt}</p>
              )}
              <div className="flex gap-4 mt-4 text-outline">
                <span className="flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  {item1.likeCount}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">chat_bubble</span>
                  {item1.commentCount}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Item 2 — 가로형 카드 */}
        {item2 && (
          <Link to={`/community/${item2.id}`}
            className="md:col-span-2 bg-white rounded-2xl overflow-hidden traveler-glow traveler-glow-hover flex group cursor-pointer">
            {item2.imageUrl && (
              <div className="w-1/3 h-full">
                <img src={item2.imageUrl} alt={item2.title}
                  className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 p-stack-md flex flex-col justify-center">
              {item2.badge && (
                <span className="text-tertiary font-bold text-[10px] uppercase tracking-widest mb-1">
                  {item2.badge}
                </span>
              )}
              <h4 className="text-label-md font-bold mb-1">{item2.title}</h4>
              {item2.excerpt && (
                <p className="text-label-sm text-on-surface-variant line-clamp-1">{item2.excerpt}</p>
              )}
            </div>
          </Link>
        )}

        {/* Item 3 — 동행 카드 */}
        {item3 && (
          <Link to={`/community/${item3.id}`}
            className="md:col-span-1 bg-surface-container-high rounded-2xl p-stack-md traveler-glow-hover cursor-pointer border border-transparent hover:border-primary/20 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-lg">question_answer</span>
              </div>
              <h4 className="text-label-md font-bold">{item3.title}</h4>
              {item3.excerpt && (
                <p className="text-label-sm text-on-surface-variant">{item3.excerpt}</p>
              )}
            </div>
            {/* 아바타 그룹 */}
            <div className="flex -space-x-2 mt-2">
              {[200, 300].map((shade) => (
                <div key={shade}
                  className={`w-6 h-6 rounded-full border-2 border-surface bg-gray-${shade}`} />
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[8px] font-bold">
                +5
              </div>
            </div>
          </Link>
        )}

        {/* Item 4 — 실시간 현황 */}
        {item4 && (
          <Link to={`/community/${item4.id}`}
            className="md:col-span-1 bg-white rounded-2xl overflow-hidden traveler-glow traveler-glow-hover flex flex-col group cursor-pointer">
            {item4.imageUrl && (
              <img src={item4.imageUrl} alt={item4.title}
                className="h-32 w-full object-cover" />
            )}
            <div className="p-stack-sm">
              <h4 className="text-label-md font-bold">{item4.title}</h4>
              {item4.isLive && (
                <div className="flex items-center gap-1 text-[10px] text-primary mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  지금 방문하기 좋아요
                </div>
              )}
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
