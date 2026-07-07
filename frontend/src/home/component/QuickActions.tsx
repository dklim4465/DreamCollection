import type { QuickAction } from '@/types';

// TODO: API 또는 CMS에서 받아오도록 교체 가능
const DEFAULT_ACTIONS: QuickAction[] = [
  { id: 'flight',   icon: 'flight',          title: '항공편 등록',  description: '여정의 시작을 기록하세요',    href: '/travel/flight' },
  { id: 'hotel',    icon: 'hotel',           title: '숙소 예약',    description: '편안한 휴식을 예약하세요',    href: '/travel/hotel' },
  { id: 'companion',icon: 'group',           title: '여행 동행',    description: '새로운 인연과 함께하세요',    href: '/matching' },
];

interface Props {
  actions?: QuickAction[];
}

export default function QuickActions({ actions = DEFAULT_ACTIONS }: Props) {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {actions.map((action) => (
          <a key={action.id} href={action.href}
            className="bg-surface-container-low p-stack-lg rounded-2xl border border-transparent hover:border-primary-container transition-all cursor-pointer traveler-glow-hover flex items-center gap-stack-md group">
            {/* 아이콘 */}
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
              <span className="material-symbols-outlined text-3xl">{action.icon}</span>
            </div>
            {/* 텍스트 */}
            <div>
              <h4 className="text-headline-sm font-bold">{action.title}</h4>
              <p className="text-body-md text-on-surface-variant">{action.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
