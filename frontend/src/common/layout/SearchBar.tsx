import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cityApi, type CityItem } from "@/common/api/cityApi";

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

  const { data: popularData } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
  });
  const popularCities = popularData?.data?.data ?? [];

  const { data: searchData } = useQuery({
    queryKey: ["cities", "search", debouncedValue],
    queryFn: () => cityApi.search(debouncedValue),
    enabled: !!debouncedValue,
    retry: false,
  });
  const searchCities = searchData?.data?.data ?? [];

  // 인기 여행지를 권역(countryName)별로 묶음.
  // countryName은 동남아시아/유럽 같은 권역 라벨이라, ISO countryCode로 묶으면
  // 같은 라벨이 여러 줄로 중복 표시된다.
  const groupedByRegion = useMemo(() => {
    const groups = new Map<string, { countryName: string; cities: CityItem[] }>();
    for (const city of popularCities) {
      const regionKey = city.countryName || "기타";
      const group = groups.get(regionKey);
      if (group) {
        group.cities.push(city);
      } else {
        groups.set(regionKey, {
          countryName: regionKey,
          cities: [city],
        });
      }
    }
    // Map 삽입 순서 = API에서 처음 등장한 권역 순서
    return Array.from(groups.values());
  }, [popularCities]);

  // 권역을 클릭(또는 권역 이름 입력 후 엔터)하면, 그 권역의 대표 도시(가장 먼저 등록된
  // 도시) 상세페이지로 바로 이동한다.
  const goToCountryPage = (countryName: string) => {
    setOpen(false);
    setValue("");
    const group = groupedByRegion.find((g) => g.countryName === countryName);
    const representative = group?.cities[0];
    if (representative) {
      navigate(`/destinations/${representative.id}`);
    }
  };

  const matchCountryFromText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    return groupedByRegion.find((g) => g.countryName.includes(trimmed)) ?? null;
  };

  const handleEnter = () => {
    const matched = matchCountryFromText(value);
    if (matched) goToCountryPage(matched.countryName);
  };

  // 검색 결과에서 도시를 클릭하면, 그 도시가 미리 채워진 상태로
  // 일정 만들기 페이지(TravelPlanPage)로 바로 이동한다.
  const goPlanTrip = (city: CityItem) => {
    setOpen(false);
    setValue("");
    const params = new URLSearchParams({
      destination: city.nameKo,
      region: city.countryName,
    });
    navigate(`/trip/new?${params.toString()}`);
  };

  const [listening, setListening] = useState(false);

  const showSearchResults = !!debouncedValue && !matchCountryFromText(debouncedValue);

  // 음성 검색 (데모용) — 브라우저 내장 Web Speech API 사용.
  // "한 개만 되면 된다"는 요청에 맞춰, 인식된 말이 인기 도시/나라 이름과 매칭되면
  // 사용자가 더 아무것도 안 눌러도 자동으로 그 여행지 페이지로 이동한다.
  const handleMicClick = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("이 브라우저는 음성 인식을 지원하지 않아요. Chrome에서 시도해주세요.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript.trim();
      setValue(transcript);
      setOpen(true);

      // 도시 이름과 매칭되면 그 도시로, 권역 이름과 매칭되면 그 권역 대표 도시로 자동 이동
      const matchedCity = popularCities.find(
        (c) => transcript.includes(c.nameKo) || c.nameKo.includes(transcript)
      );
      if (matchedCity) {
        setOpen(false);
        setValue("");
        navigate(`/destinations/${matchedCity.id}`);
        return;
      }

      const matchedRegion = matchCountryFromText(transcript);
      if (matchedRegion) {
        goToCountryPage(matchedRegion.countryName);
      }
    };

    recognition.start();
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
        onKeyDown={(e) => {
          if (e.key === "Enter") handleEnter();
        }}
      />
      <button
        type="button"
        title="음성으로 여행지 검색하기"
        onClick={handleMicClick}
        className={
          listening
            ? "material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-error text-lg animate-pulse"
            : "material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-lg hover:text-primary transition-colors"
        }
      >
        mic
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-surface-container-lowest rounded-xl traveler-glow p-stack-md z-50">
          {showSearchResults ? (
            // 나라 이름이 아닌 일반 검색어 → 도시 칩 목록
            <>
              <p className="text-label-sm text-on-surface-variant mb-2">검색 결과</p>
              {searchCities.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant py-2">
                  일치하는 여행지가 없어요.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {searchCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => goPlanTrip(city)}
                      className="chip-primary hover:opacity-80 transition-opacity"
                    >
                      {city.nameKo}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // 권역 목록 (일본 / 동남아시아 / 유럽 …) — 클릭하면 해당 권역 대표 도시로 이동
            <>
              <p className="text-label-sm text-on-surface-variant mb-2">인기 여행지</p>
              {groupedByRegion.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant py-2">불러오는 중...</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {groupedByRegion.map((group) => (
                    <button
                      key={group.countryName}
                      type="button"
                      onClick={() => goToCountryPage(group.countryName)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <span className="text-body-md font-bold">{group.countryName}</span>
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
