import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cityApi } from "@/common/api/cityApi";

export default function SearchBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
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

  // 입력값 300ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const { data } = useQuery({
    queryKey: ["cities", debouncedValue ? "search" : "popular", debouncedValue],
    queryFn: () =>
      debouncedValue ? cityApi.search(debouncedValue) : cityApi.getPopular(),
    retry: false,
  });

  const cities = data?.data?.data ?? [];

  const goToDestination = (nameKo: string) => {
    setOpen(false);
    setValue("");
    navigate(`/trip/new?destination=${encodeURIComponent(nameKo)}`);
  };

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
        search
      </span>
      <input
        type="text"
        placeholder="여행지 검색 또는 AI에게 물어보세요..."
        className="input-search pr-9"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="button"
        title="AI 챗봇 · 음성 검색 (준비 중)"
        disabled
        className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-lg opacity-50 cursor-not-allowed"
      >
        mic
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-surface-container-lowest rounded-xl traveler-glow p-stack-md z-50">
          <p className="text-label-sm text-on-surface-variant mb-2">
            {debouncedValue ? "검색 결과" : "인기 여행지"}
          </p>
          {cities.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant py-2">
              {debouncedValue ? "일치하는 여행지가 없어요." : "불러오는 중..."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => goToDestination(city.nameKo)}
                  className="chip-primary hover:opacity-80 transition-opacity"
                >
                  {city.nameKo}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
