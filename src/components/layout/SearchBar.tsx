import { useState, useRef, useEffect } from "react";

// TODO: API 연동 시 사용자별 최근/자주 검색한 여행지로 교체
const FREQUENT_SEARCHES = [
  "제주도",
  "도쿄",
  "오사카",
  "파리",
  "방콕",
  "부산",
  "다낭",
  "뉴욕",
];

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
        search
      </span>
      <input
        type="text"
        placeholder="여행지 검색..."
        className="input-search"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => setValue(e.target.value)}
      />

      {open && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-surface-container-lowest rounded-xl traveler-glow p-stack-md z-50">
          <p className="text-label-sm text-on-surface-variant mb-2">
            자주 검색한 여행지
          </p>
          <div className="flex flex-wrap gap-2">
            {FREQUENT_SEARCHES.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => {
                  setValue(dest);
                  setOpen(false);
                }}
                className="chip-primary hover:opacity-80 transition-opacity"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
