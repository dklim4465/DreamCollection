// 국가 코드(ISO 3166-1 alpha-2) → 한글 국가명 매핑 (뱃지 도감에서 사용)
// city 테이블에 등록된 국가 기준. 새 국가 뱃지를 추가하면 여기에도 추가해줘야 이름이 제대로 보임.
const COUNTRY_NAME_KO: Record<string, string> = {
  JP: "일본",
  TH: "태국",
  VN: "베트남",
  FR: "프랑스",
  KR: "대한민국",
  US: "미국",
};

export function countryNameKo(countryCode: string | null | undefined): string {
  if (!countryCode) return "";
  return COUNTRY_NAME_KO[countryCode] ?? countryCode;
}

/** ISO 국가 코드를 국기 이모지로 변환 (예: "JP" → 🇯🇵). 별도 이미지 없이 어떤 국가 코드든 바로 렌더링 가능 */
export function countryFlagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = [...countryCode.toUpperCase()].map(
    (ch) => 0x1f1e6 + (ch.charCodeAt(0) - "A".charCodeAt(0))
  );
  return String.fromCodePoint(...codePoints);
}
