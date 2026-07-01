import { useState } from 'react';
import type { TravelPhase } from '@/types';

const NAV_ITEMS: { phase: TravelPhase; icon: string; label: string }[] = [
  { phase: 'pre',  icon: 'flight_takeoff', label: 'Pre-travel'  },
  { phase: 'on',   icon: 'explore',        label: 'On-travel'   },
  { phase: 'post', icon: 'history',        label: 'Post-travel' },
];

export default function Sidebar() {
  const [active, setActive] = useState<TravelPhase>('pre');

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-28 h-[calc(100vh-140px)] bg-surface-container-low rounded-xl p-stack-md gap-stack-lg transition-all">

      {/* 타이틀 */}
      <div className="flex flex-col gap-1 px-2 py-4">
        <h2 className="text-headline-sm font-bold text-primary mb-1">나의 여행 도우미</h2>
        <p className="text-label-sm text-on-surface-variant">여정의 모든 단계를 함께합니다</p>
      </div>

      {/* 네비 아이템 */}
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map(({ phase, icon, label }) => (
          <button
            key={phase}
            onClick={() => setActive(phase)}
            className={active === phase ? 'nav-item-active' : 'nav-item'}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* 사진 업로드 버튼 */}
      <div className="mt-auto">
        <button className="btn-primary w-full flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add_a_photo</span>
          사진 업로드
        </button>
      </div>
    </aside>
  );
}
