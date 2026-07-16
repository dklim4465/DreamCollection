export function getBadgeFallbackIcon(conditionType: string | null): string {
  switch (conditionType) {
    case "LEVEL_REACHED":
      return "military_tech"; // 메달 — 레벨업 마일스톤 뱃지
    case "COUNTRY_VISIT":
    case "COUNTRY_COUNT":
      return "public"; // 지구본 — 국가별/여행 국가 수 뱃지
    case "TRIP_COUNT":
      return "flight_takeoff"; // 비행기 — 여행 횟수 뱃지
    case "PAYMENT_COUNT":
      return "payments"; // 결제 아이콘 — 결제 횟수 뱃지
    case "REVIEW_COUNT":
      return "rate_review"; // 후기 아이콘 — 리뷰 횟수 뱃지
    case "LOG_COUNT":
      return "auto_stories"; // 다이어리 아이콘 — 기록 횟수 뱃지
    case "MANUAL":
      return "celebration"; // 축하 아이콘 — WELCOME 등 수동 지급 뱃지
    default:
      return "military_tech";
  }
}
