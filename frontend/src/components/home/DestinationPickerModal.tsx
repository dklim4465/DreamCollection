import { useState } from "react";

// TODO: API 연동 시 실제 인기 여행지 데이터로 교체
const POPULAR_DESTINATIONS = [
  { name: "제주도", icon: "🏝️" },
  { name: "도쿄", icon: "🗼" },
  { name: "파리", icon: "🥐" },
  { name: "방콕", icon: "🛕" },
  { name: "오사카", icon: "🍜" },
  { name: "뉴욕", icon: "🗽" },
];

interface Props {
  onClose: (destination?: string) => void;
}

/**
 * 홈페이지 진입 시 노출되는 "어디로 떠나고 싶나요?" 팝업
 * 여행지를 선택하거나 직접 입력 후 닫을 수 있음
 */
export default function DestinationPickerModal({ onClose }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4">
      <div className="bg-surface-container-lowest rounded-3xl p-stack-xl w-full max-w-lg relative traveler-glow">
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 text-on-surface-variant hover:opacity-70"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-headline-md font-bold text-center mb-1">
          어디로 떠나고 싶나요?
        </h2>
        <p className="text-body-md text-on-surface-variant text-center mb-6">
          가고 싶은 여행지를 검색하거나 골라보세요
        </p>

        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onClose(value);
            }}
            placeholder="여행지를 입력해보세요 (예: 제주도)"
            className="input-base pl-12"
          />
        </div>

        <div className="grid grid-cols-3 gap-stack-sm">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              onClick={() => onClose(dest.name)}
              className="flex flex-col items-center gap-1 p-stack-md rounded-2xl bg-surface-container-low hover:bg-primary-container transition-colors"
            >
              <span className="text-2xl">{dest.icon}</span>
              <span className="text-label-md font-semibold">{dest.name}</span>
            </button>
          ))}
        </div>

        <button onClick={() => onClose()} className="btn-ghost w-full mt-6">
          나중에 정할게요
        </button>
      </div>
    </div>
  );
}
