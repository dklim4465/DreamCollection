/**
 * badge 테이블의 COUNTRY_VISIT 뱃지(condition_country_code)와 1:1로 매칭되는 국가 목록.
 * 나의기록(여행 기록) 작성 시 국가를 선택하면, 그 나라 뱃지가 자동으로 지급된다.
 * (badge_service.grantCountryBadgeIfEligible 참고)
 */
export interface CountryOption {
  code: string;
  label: string;
}

export const TRIPLOG_COUNTRIES: CountryOption[] = [
  { code: "KR", label: "국내(대한민국)" },
  { code: "JP", label: "일본" },
  { code: "TH", label: "태국" },
  { code: "VN", label: "베트남" },
  { code: "FR", label: "프랑스" },
  { code: "US", label: "미국" },
  { code: "EU", label: "유럽" },
  { code: "GB", label: "영국" },
  { code: "CN", label: "중국" },
  { code: "HK", label: "홍콩" },
  { code: "TW", label: "대만" },
  { code: "PH", label: "필리핀" },
  { code: "SG", label: "싱가포르" },
  { code: "MY", label: "말레이시아" },
  { code: "ID", label: "인도네시아" },
  { code: "IN", label: "인도" },
  { code: "CA", label: "캐나다" },
  { code: "AU", label: "호주" },
  { code: "NZ", label: "뉴질랜드" },
  { code: "CH", label: "스위스" },
  { code: "TR", label: "튀르키예" },
  { code: "AE", label: "아랍에미리트" },
  { code: "SA", label: "사우디아라비아" },
  { code: "IL", label: "이스라엘" },
  { code: "QA", label: "카타르" },
  { code: "GU", label: "괌" },
  { code: "MX", label: "멕시코" },
  { code: "BR", label: "브라질" },
  { code: "AR", label: "아르헨티나" },
  { code: "RU", label: "러시아" },
  { code: "SE", label: "스웨덴" },
  { code: "NO", label: "노르웨이" },
  { code: "DK", label: "덴마크" },
  { code: "PL", label: "폴란드" },
  { code: "CZ", label: "체코" },
  { code: "HU", label: "헝가리" },
  { code: "EG", label: "이집트" },
  { code: "ZA", label: "남아프리카공화국" },
  { code: "MN", label: "몽골" },
  { code: "NP", label: "네팔" },
  { code: "LK", label: "스리랑카" },
  { code: "KH", label: "캄보디아" },
  { code: "LA", label: "라오스" },
  { code: "FJ", label: "피지" },
  { code: "MA", label: "모로코" },
  { code: "KW", label: "쿠웨이트" },
  { code: "JO", label: "요르단" },
];
