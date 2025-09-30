import { toZonedTime } from "date-fns-tz";

export type OpeningWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

function minutesFromTimeString(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesInZone(date: Date, timezone: string) {
  const zoned = toZonedTime(date, timezone);
  return zoned.getHours() * 60 + zoned.getMinutes();
}

function dayInZone(date: Date, timezone: string) {
  const zoned = toZonedTime(date, timezone);
  return zoned.getDay();
}

export function isWithinOpeningWindows(
  openings: OpeningWindow[],
  start: Date,
  end: Date,
  timezone: string,
): boolean {
  if (!openings.length) {
    return true;
  }

  const startDay = dayInZone(start, timezone);
  const endDay = dayInZone(end, timezone);

  if (startDay !== endDay) {
    return false;
  }

  const windowsForDay = openings.filter((window) => window.dayOfWeek === startDay);

  if (!windowsForDay.length) {
    return false;
  }

  const startMinutes = minutesInZone(start, timezone);
  const endMinutes = minutesInZone(end, timezone);

  return windowsForDay.some((window) => {
    const windowStart = minutesFromTimeString(window.startTime);
    const windowEnd = minutesFromTimeString(window.endTime);
    return startMinutes >= windowStart && endMinutes <= windowEnd;
  });
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function assertChronological(start: Date, end: Date) {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    throw new Error("Invalid start date");
  }

  if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid end date");
  }

  if (start >= end) {
    throw new Error("Start time must be before end time");
  }
}
