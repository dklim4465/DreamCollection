export const formatZonedDateTime = (date: string, timeZone: string) =>
  new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
