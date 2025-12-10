const VILNIUS_TIMEZONE = 'Europe/Vilnius';

export function toVilnius(ts: string | Date): Date {
  const date = typeof ts === 'string' ? new Date(ts) : ts;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: VILNIUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';

  return new Date(
    parseInt(getValue('year')),
    parseInt(getValue('month')) - 1,
    parseInt(getValue('day')),
    parseInt(getValue('hour')),
    parseInt(getValue('minute')),
    parseInt(getValue('second'))
  );
}

export function toUTC(date: Date): string {
  const vilniusStr = date.toLocaleString('en-US', {
    timeZone: VILNIUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const utcDate = new Date(vilniusStr + ' UTC');
  const offset = date.getTime() - utcDate.getTime();
  const correctedDate = new Date(date.getTime() - offset);

  return correctedDate.toISOString();
}

export function formatVilniusDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('lt-LT', {
    timeZone: VILNIUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatVilniusTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('lt-LT', {
    timeZone: VILNIUS_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatVilniusDateTime(date: Date | string): string {
  return `${formatVilniusDate(date)} ${formatVilniusTime(date)}`;
}
