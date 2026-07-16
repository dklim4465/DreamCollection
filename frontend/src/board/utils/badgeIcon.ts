export function getBadgeFallbackIcon(conditionType: string | null): string {
  switch (conditionType) {
    case "LEVEL_REACHED":
      return "military_tech";
    case "COUNTRY_VISIT":
    case "COUNTRY_COUNT":
      return "public";
    case "TRIP_COUNT":
      return "flight_takeoff";
    case "PAYMENT_COUNT":
      return "payments";
    case "REVIEW_COUNT":
      return "rate_review";
    case "LOG_COUNT":
      return "auto_stories";
    case "MANUAL":
      return "celebration";
    default:
      return "military_tech";
  }
}
