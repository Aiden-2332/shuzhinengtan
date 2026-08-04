export const CAMPUS_TIME_ZONE = "Asia/Shanghai";

const CAMPUS_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface CampusDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
}

export function getCampusDateParts(date: Date): CampusDateParts {
  const shifted = new Date(date.getTime() + CAMPUS_UTC_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    weekday: shifted.getUTCDay(),
  };
}

export function formatCampusDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: CAMPUS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatCampusDateKey(date: Date): string {
  const { year, month, day } = getCampusDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatCampusTime(date: Date, includeSeconds = false): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: CAMPUS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: false,
  }).format(date);
}

export function formatCampusDateTime(date: Date): string {
  return `${formatCampusDate(date)} ${formatCampusTime(date, true)}`;
}

export function getCampusMonthDays(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getCampusDateAt(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

export function startOfCampusHour(date: Date): Date {
  return new Date(Math.floor(date.getTime() / HOUR_MS) * HOUR_MS);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * HOUR_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function minutesAgo(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

export function deterministicNoise(seed: number, salt = 0): number {
  const value = Math.sin(seed * 0.00000073 + salt * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

export function getCampusLoadKw(date: Date, salt = 0): number {
  const parts = getCampusDateParts(date);
  const hour = parts.hour + parts.minute / 60;
  const isWeekend = parts.weekday === 0 || parts.weekday === 6;
  const daytime = Math.max(0, Math.sin(((hour - 6) / 15) * Math.PI));
  const evening = Math.exp(-Math.pow((hour - 20) / 2.8, 2));
  const summerCooling = [6, 7, 8, 9].includes(parts.month) ? 1.18 : 1;
  const winterHeating = [11, 12, 1, 2, 3].includes(parts.month) ? 1.1 : 1;
  const occupancy = isWeekend ? 0.72 : 1;
  const noise = deterministicNoise(startOfCampusHour(date).getTime(), salt) * 140;
  return Math.round(Math.max(1550, (1900 + daytime * 4300 + evening * 850) * occupancy * summerCooling * winterHeating + noise));
}
