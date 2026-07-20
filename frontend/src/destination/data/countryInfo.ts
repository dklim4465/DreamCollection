/**
 * CountryDestinationsPage용 나라 단위 큐레이션 정보.
 * city 테이블에는 나라 이름/코드만 있고 통화/언어/비자 같은 정보가 없어서
 * destinationInfo.ts(도시 단위)와 같은 방식으로 나라 단위 정보를 여기 큐레이션해둔다.
 * country_code를 키로 매칭한다.
 */
export interface CountryInfo {
  tagline: string;
  currency: string;
  language: string;
  visa: string;
  bestSeason: string;
  accentClass: "primary" | "secondary" | "tertiary";
}

export const countryInfoMap: Record<string, CountryInfo> = {
  JP: {
    tagline: "가깝고도 다채로운 일본, 도시마다 완전히 다른 얼굴을 만나보세요",
    currency: "일본 엔 (JPY)",
    language: "일본어",
    visa: "관광 목적 90일 이내 무비자",
    bestSeason: "3~4월 벚꽃, 10~11월 단풍 시즌 추천",
    accentClass: "primary",
  },
  TH: {
    tagline: "사원과 해변, 야시장까지 — 이국적인 매력이 가득한 태국",
    currency: "태국 바트 (THB)",
    language: "태국어",
    visa: "관광 목적 90일 이내 무비자",
    bestSeason: "11~2월 건기 시즌이 여행하기 가장 쾌적해요",
    accentClass: "tertiary",
  },
  US: {
    tagline: "도시부터 사막, 해변까지 — 지역마다 완전히 다른 미국을 경험하세요",
    currency: "미국 달러 (USD)",
    language: "영어",
    visa: "ESTA(전자여행허가) 사전 승인 필요, 최대 90일 체류",
    bestSeason: "지역마다 다르지만 봄(4~5월)·가을(9~10월)이 무난해요",
    accentClass: "secondary",
  },
};
