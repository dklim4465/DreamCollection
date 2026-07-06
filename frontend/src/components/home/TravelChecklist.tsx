import { useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  icon: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "passport", label: "여권 유효기간 확인", icon: "badge" },
  { id: "visa", label: "비자/입국 서류 준비", icon: "description" },
  { id: "exchange", label: "환전하기", icon: "currency_exchange" },
  { id: "sim", label: "유심/로밍 신청", icon: "sim_card" },
  { id: "insurance", label: "여행자 보험 가입", icon: "health_and_safety" },
  { id: "packing", label: "짐 싸기", icon: "luggage" },
];

/**
 * 출발 전 체크리스트 위젯
 * TODO: 여행 일정(TravelPlan)별로 체크리스트를 분리 저장하도록 API 연동
 */
export default function TravelChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const doneCount = checked.size;

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">여행 준비 체크리스트</h2>
        <span className="chip-primary">
          {doneCount}/{DEFAULT_ITEMS.length}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {DEFAULT_ITEMS.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition-colors text-left"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isChecked ? "check" : item.icon}
                  </span>
                </span>
                <span
                  className={`text-body-md ${isChecked ? "line-through text-on-surface-variant" : ""}`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
