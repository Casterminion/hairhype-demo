import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export const VILNIUS_TZ = 'Europe/Vilnius';

export function toUTCFromVilnius(date: Date): Date {
  return fromZonedTime(date, VILNIUS_TZ);
}

export function fromUTCToVilnius(date: Date): Date {
  return toZonedTime(date, VILNIUS_TZ);
}

export function formatVilnius(date: Date, formatStr: string): string {
  return formatInTimeZone(date, VILNIUS_TZ, formatStr);
}

export function formatVilniusDate(date: Date): string {
  return formatInTimeZone(date, VILNIUS_TZ, 'yyyy-MM-dd');
}

export function formatVilniusTime(date: Date): string {
  return formatInTimeZone(date, VILNIUS_TZ, 'HH:mm');
}

export function startOfDayVilnius(date: Date): Date {
  const dateStr = formatVilniusDate(date);
  const vilniusDate = new Date(`${dateStr}T00:00:00`);
  return fromZonedTime(vilniusDate, VILNIUS_TZ);
}

export function endOfDayVilnius(date: Date): Date {
  const dateStr = formatVilniusDate(date);
  const vilniusDate = new Date(`${dateStr}T23:59:59`);
  return fromZonedTime(vilniusDate, VILNIUS_TZ);
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function createVilniusDateTime(dateStr: string, timeStr: string): Date {
  const vilniusDateTimeStr = `${dateStr}T${timeStr}:00`;
  const localDate = parseISO(vilniusDateTimeStr);
  return fromZonedTime(localDate, VILNIUS_TZ);
}

export function getWeekdayIndex(date: Date): number {
  const vilniusDate = fromUTCToVilnius(date);
  const day = vilniusDate.getDay();
  return day === 0 ? 6 : day - 1;
}
