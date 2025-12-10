import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/lt";
import { fromZonedTime } from "date-fns-tz";
import {
  Calendar as RBCalendar,
  momentLocalizer,
  View,
  DateLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { Clock, Briefcase, User, Trash2, CreditCard as Edit2, XCircle, Settings2, CheckCircle2, ChevronLeft, ChevronRight, CalendarDays, Phone } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { AppShell, useTheme } from "../../admin/ui/AppShell";
import { Button } from "../../admin/ui/primitives/Button";
import { Sheet } from "../../admin/ui/primitives/Sheet";
import { ConfirmModal } from "../../admin/ui/primitives/Modal";
import { showToast } from "../../admin/ui/primitives/Toast";
import { SkeletonCard } from "../../admin/ui/primitives/Skeleton";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

/* ===========================
   Helpers & Types
=========================== */
// Configure moment globally for Lithuanian with Monday as first day of week
moment.locale('lt');
moment.updateLocale('lt', {
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4
  }
});

// Create a moment factory that ALWAYS uses Lithuanian locale
// This ensures no other code can accidentally reset the locale
const momentLT = (date?: any) => {
  const m = moment(date);
  m.locale('lt');
  return m;
};

// Create localizer that uses Lithuanian moment
// We wrap momentLocalizer to ensure it always gets Lithuanian formatting
const createLithuanianLocalizer = () => {
  // Force moment to use Lithuanian locale before creating localizer
  moment.locale('lt');
  const localizer = momentLocalizer(moment);

  // Override the format function to always use Lithuanian locale
  const originalFormat = localizer.format;
  localizer.format = (value: any, format: any, culture?: string) => {
    // Always use Lithuanian culture
    return originalFormat(value, format, 'lt');
  };

  return localizer;
};

const localizer: DateLocalizer = createLithuanianLocalizer();
const DnDCalendar = withDragAndDrop(RBCalendar);

const lithuanianMessages = {
  date: 'Data',
  time: 'Laikas',
  event: 'Įvykis',
  allDay: 'Visa diena',
  week: 'Savaitė',
  work_week: 'Darbo savaitė',
  day: 'Diena',
  month: 'Mėnuo',
  previous: 'Atgal',
  next: 'Pirmyn',
  yesterday: 'Vakar',
  tomorrow: 'Rytoj',
  today: 'Šiandien',
  agenda: 'Darbotvarkė',
  noEventsInRange: 'Nėra įvykių šiame periode',
  showMore: (total: number) => `+ Dar ${total}`,
};

const DAY_NAMES_LT = ['sekmadienis', 'pirmadienis', 'antradienis', 'trečiadienis', 'ketvirtadienis', 'penktadienis', 'šeštadienis'];
const MONTH_NAMES_LT = ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'];
const MONTH_NAMES_NOMINATIVE_LT = ['sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis', 'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis'];

function formatLT(date: Date | string, format: string): string {
  return moment(date).locale('lt').format(format);
}

function formatLTDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = MONTH_NAMES_LT[d.getMonth()];
  const day = d.getDate();
  const dayName = DAY_NAMES_LT[d.getDay()];
  return `${year} m. ${month} ${day} d., ${dayName}`;
}

function formatMonthYear(date: Date): string {
  const year = date.getFullYear();
  const month = MONTH_NAMES_NOMINATIVE_LT[date.getMonth()];
  return `${month} ${year}`;
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const startMonth = MONTH_NAMES_LT[startDate.getMonth()];
  const endMonth = MONTH_NAMES_LT[endDate.getMonth()];
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: "confirmed" | "cancelled";
  notes?: string;
  service: { id: string; name: string; duration_min?: number | null };
  customer: { id: string; name: string };
}

interface WorkingHours {
  start: string;
  end: string;
  closed: boolean;
  source: "default" | "exception";
}

const fmt = (d: Date, f: string) => moment(d).format(f);
const lt = (d: string) => moment(d).format("YYYY-MM-DD");

function applyTime(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v));
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function isOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function timeInRange(d: Date, start: Date, end: Date) {
  return d >= start && d <= end;
}

/* ===========================
   Main Component
=========================== */
export function CalendarPage() {
  useDocumentTitle('Admin');
  const theme = useTheme();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{
    id: string;
    newStart: Date;
    newEnd: Date;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newDate, setNewDate] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: Make entire week view scrollable as one unit
  useEffect(() => {
    if (typeof window === 'undefined' || view !== 'week') return;

    const setupMobileScroll = () => {
      const timeView = document.querySelector('.rbc-time-view') as HTMLElement;
      if (!timeView) return;

      // On mobile, make the time-view itself scrollable
      if (window.innerWidth < 640) {
        timeView.style.overflowX = 'auto';
        timeView.style.webkitOverflowScrolling = 'touch';
      }
    };

    const timeouts = [100, 300, 500].map(delay =>
      window.setTimeout(setupMobileScroll, delay)
    );

    return () => {
      timeouts.forEach(id => clearTimeout(id));
    };
  }, [view, date, events, loading]);

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: "08:00",
    end: "20:00",
    closed: false,
    source: "default",
  });
  const [dateOverrideId, setDateOverrideId] = useState<string | null>(null);
  const [dateOverrides, setDateOverrides] = useState<Record<string, { kind: string; start_time?: string; end_time?: string }>>({});

  /* ===========================
     Load Bookings & Overrides
  ============================ */
  useEffect(() => {
    loadBookings();
    loadDateOverrides();
  }, []);


  async function loadDateOverrides() {
    const { data } = await supabase
      .from("date_overrides")
      .select("*")
      .gte("date", moment().subtract(2, "months").format("YYYY-MM-DD"))
      .lte("date", moment().add(2, "months").format("YYYY-MM-DD"));

    if (data) {
      const map: Record<string, { kind: string; start_time?: string; end_time?: string }> = {};
      data.forEach((override: any) => {
        map[override.date] = {
          kind: override.kind,
          start_time: override.start_time,
          end_time: override.end_time,
        };
      });
      setDateOverrides(map);
    }
  }

  async function loadBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        start_time_utc,
        end_time_utc,
        status,
        notes,
        service:services(id, name, duration_min),
        customer:customers(id, name, phone_e164)
      `
      )
      .eq("status", "confirmed")
      .gte("start_time_utc", moment().subtract(2, "months").toISOString())
      .lte("start_time_utc", moment().add(2, "months").toISOString());

    if (error) {
      showToast("error", "Nepavyko įkelti rezervacijų");
      setLoading(false);
      return;
    }

    const list: BookingEvent[] =
      (data || []).map((b: any) => ({
        id: b.id,
        title: `${b.customer?.name ?? "Klientas"} • ${b.service?.name ?? ""}`,
        start: new Date(b.start_time_utc),
        end: new Date(b.end_time_utc),
        status: b.status ?? "confirmed",
        notes: b.notes ?? undefined,
        service: {
          id: b.service?.id,
          name: b.service?.name,
          duration_min: b.service?.duration_min,
        },
        customer: {
          id: b.customer?.id,
          name: b.customer?.name ?? "Klientas",
          phone_e164: b.customer?.phone_e164
        },
      })) || [];

    setEvents(list);
    setLoading(false);
  }

  /* ===========================
     Booking Counts per Day
  ============================ */
  const bookingsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach((e) => {
      const key = moment(e.start).format("YYYY-MM-DD");
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [events]);

  /* ===========================
     Calculate Dynamic Calendar Range (Unified with Working Hours)
  ============================ */
  const calendarTimeRange = useMemo(() => {
    let minHour = 8;
    let maxHour = 20;

    // Get working hours for the current view
    if (view === 'week' || view === 'day') {
      const startOfWeek = moment(date).startOf('week');
      const endOfWeek = moment(date).endOf('week');

      // Check date overrides for visible days
      const visibleDays: string[] = [];
      for (let d = startOfWeek.clone(); d.isSameOrBefore(endOfWeek); d.add(1, 'day')) {
        visibleDays.push(d.format('YYYY-MM-DD'));
      }

      // Find earliest start and latest end from working hours
      visibleDays.forEach(dayStr => {
        const override = dateOverrides[dayStr];
        if (override && override.kind === 'custom_hours') {
          const startHour = parseInt(override.start_time?.split(':')[0] || '8');
          const endHour = parseInt(override.end_time?.split(':')[0] || '20');
          if (startHour < minHour) minHour = startHour;
          if (endHour > maxHour) maxHour = endHour;
        }
      });
    }

    // Also consider events
    if (events.length > 0) {
      events.forEach((event) => {
        const startHour = event.start.getHours();
        const endHour = event.end.getHours();
        const endMinutes = event.end.getMinutes();

        if (startHour < minHour) minHour = startHour;
        if (endHour > maxHour || (endHour === maxHour && endMinutes > 0)) {
          maxHour = endMinutes > 0 ? endHour + 1 : endHour;
        }
      });
    }

    // Ensure safe boundaries (0-24)
    minHour = Math.max(0, Math.min(23, minHour));
    maxHour = Math.max(1, Math.min(24, maxHour));

    // Ensure reasonable range (at least 8 hours visible)
    if (maxHour - minHour < 8) {
      maxHour = Math.min(24, minHour + 8);
    }

    // Ensure maxHour is always greater than minHour
    if (maxHour <= minHour) {
      maxHour = minHour + 8;
    }

    return {
      min: applyTime(new Date(), `${minHour.toString().padStart(2, '0')}:00`),
      max: applyTime(new Date(), `${maxHour.toString().padStart(2, '0')}:00`)
    };
  }, [events, dateOverrides, date, view]);

  /* ===========================
     Calculate Dynamic Height
  ============================ */
  const maxBookingsPerDay = useMemo(() => {
    const values = Object.values(bookingsByDay);
    if (values.length === 0) return 0;
    return values.reduce((max, val) => Math.max(max, val), 0);
  }, [bookingsByDay]);

  const dynamicCalendarHeight = useMemo(() => {
    if (view === 'month') {
      return 'calc(100vh - 20rem)';
    }
    // For week/day views, increase height based on number of bookings
    const baseHeight = 600;
    const additionalHeight = maxBookingsPerDay > 5 ? (maxBookingsPerDay - 5) * 40 : 0;
    return `${Math.min(baseHeight + additionalHeight, 1200)}px`;
  }, [view, maxBookingsPerDay]);

  /* ===========================
     Event Styles
  ============================ */
  const eventPropGetter = (event: BookingEvent) => {
    const bg =
      event.status === "cancelled"
        ? "rgba(185, 28, 28, 0.3)"
        : "rgba(147, 51, 234, 0.16)";
    return {
      style: {
        backgroundColor: bg,
        borderLeft: "3px solid #9333EA",
        borderRadius: 10,
        padding: "6px 10px",
        color: "#fff",
        fontWeight: 600,
        fontSize: 13,
        display: view === "month" ? "none" : "block",
      },
    };
  };

  /* ===========================
     Month View: Custom Header
  ============================ */
  const MonthDateHeader = ({ date: cellDate }: { date: Date }) => {
    const key = moment(cellDate).format("YYYY-MM-DD");
    const count = bookingsByDay[key] || 0;
    const isToday = moment(cellDate).isSame(new Date(), "day");
    const isOffRange = moment(cellDate).month() !== moment(date).month();
    const override = dateOverrides[key];

    const isClosed = override?.kind === "closed";
    const hasCustomHours = override?.kind === "custom_hours";

    return (
      <div className={`flex flex-col items-center justify-center h-full py-2 transition-all relative ${isOffRange ? "opacity-30" : ""}`}>
        {isClosed && (
          <div className="absolute top-1 right-1">
            <XCircle size={14} className="text-red-400" />
          </div>
        )}
        {hasCustomHours && (
          <div className="absolute top-1 right-1">
            <Clock size={14} className="text-cyan-400" />
          </div>
        )}
        <span
          className={`text-[13px] ${
            isToday ? "text-[#9333EA] font-semibold" : isClosed ? "text-red-400/80 line-through" : hasCustomHours ? "text-cyan-400" : "text-white/80"
          }`}
        >
          {moment(cellDate).date()}
        </span>
        {count > 0 && (
          <span className="mt-1 text-[11px] font-semibold bg-[#9333EA]/20 border border-[#9333EA]/40 text-[#E9B8FF] rounded-full px-2 py-[1px]">
            {count}
          </span>
        )}
        {hasCustomHours && override && (
          <span className="mt-1 text-[10px] font-medium text-cyan-300">
            {override.start_time?.slice(0, 5)}-{override.end_time?.slice(0, 5)}
          </span>
        )}
      </div>
    );
  };

  const MonthDateCell = ({ value, children }: { value: Date; children: React.ReactNode }) => {
    const key = moment(value).format("YYYY-MM-DD");
    const override = dateOverrides[key];
    const isClosed = override?.kind === "closed";
    const hasCustomHours = override?.kind === "custom_hours";

    const bgClass = isClosed ? "day-closed" : hasCustomHours ? "day-custom-hours" : "";

    const handleCellClick = (e: React.MouseEvent | React.TouchEvent) => {
      if (view === "month") {
        e.preventDefault();
        e.stopPropagation();
        openDayDrawer(value);
      }
    };

    return (
      <div
        className={`rbc-day-bg ${bgClass}`}
        onClick={handleCellClick}
        onTouchEnd={handleCellClick}
        style={{ cursor: view === "month" ? "pointer" : "default" }}
      >
        {children}
      </div>
    );
  };

  const WeekdayHeader = ({ date }: { date: Date }) => {
    // Use momentLT to ensure Lithuanian locale is always applied
    const m = momentLT(date);
    const dayName = m.format('ddd').toUpperCase();
    const dateStr = m.format('YYYY-MM-DD');
    const override = dateOverrides[dateStr];

    return (
      <div className="flex flex-col items-center gap-1">
        <span>{dayName}</span>
        {override && override.kind === 'custom_hours' && (
          <span className="text-[10px] text-cyan-400 font-medium">
            {override.start_time?.slice(0, 5)}-{override.end_time?.slice(0, 5)}
          </span>
        )}
        {override && override.kind === 'closed' && (
          <span className="text-[10px] text-red-400 font-medium">UŽDARYTA</span>
        )}
      </div>
    );
  };

  // Unified Day-Time Slot Wrapper - makes working hours visible
  const TimeSlotWrapper = ({ value, children }: { value: Date; children?: React.ReactNode }) => {
    const dateStr = moment(value).format('YYYY-MM-DD');
    const hour = value.getHours();
    const override = dateOverrides[dateStr];

    let isWorkingHour = true;

    if (override) {
      if (override.kind === 'closed') {
        isWorkingHour = false;
      } else if (override.kind === 'custom_hours' && override.start_time && override.end_time) {
        const startHour = parseInt(override.start_time.split(':')[0]);
        const endHour = parseInt(override.end_time.split(':')[0]);
        isWorkingHour = hour >= startHour && hour < endHour;
      }
    }

    return (
      <div className={`rbc-time-slot ${isWorkingHour ? 'working-hours' : 'non-working-hours'}`}>
        {children}
      </div>
    );
  };

  const DaySlotWrapper = ({ children }: { children: React.ReactNode }) => {
    return <div className="rbc-day-slot unified-day-block">{children}</div>;
  };

  const components = {
    month: {
      dateHeader: MonthDateHeader,
      dateCellWrapper: MonthDateCell,
      event: () => null,
      header: WeekdayHeader,
    },
    week: {
      header: WeekdayHeader,
      timeSlotWrapper: TimeSlotWrapper as any,
    },
    day: {
      header: WeekdayHeader,
      timeSlotWrapper: TimeSlotWrapper as any,
    },
  };

  const messages = {
    allDay: "Visa diena",
    previous: "Atgal",
    next: "Pirmyn",
    today: "Šiandien",
    month: "Mėnuo",
    week: "Savaitė",
    day: "Diena",
    agenda: "Darbotvarkė",
    noEventsInRange: "Nėra rezervacijų",
  };

  const formats = {
    weekdayFormat: (date: Date) => momentLT(date).format('ddd').toUpperCase(),
    dayFormat: (date: Date) => momentLT(date).format('DD ddd'),
    dayHeaderFormat: (date: Date) => momentLT(date).format('ddd').toUpperCase(),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${momentLT(start).format('MMMM DD')} - ${momentLT(end).format('MMMM DD, YYYY')}`,
    monthHeaderFormat: (date: Date) => momentLT(date).format('MMMM YYYY'),
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${momentLT(start).format('MMMM DD')} - ${momentLT(end).format('MMMM DD, YYYY')}`,
  };

  /* ===========================
     Openers
  ============================ */
  function openEventDrawer(e: BookingEvent) {
    setSelectedEvent(e);
    setSelectedDay(null);
    setDrawerOpen(true);
  }

  async function openDayDrawer(day: Date) {
    setSelectedEvent(null);
    setSelectedDay(day);
    setDrawerOpen(true);

    // Load working hours for this day
    await loadDayWorkingHours(day);
  }

  async function loadDayWorkingHours(day: Date) {
    const dateStr = moment(day).format("YYYY-MM-DD");
    const weekday = moment(day).day();

    // Check for date override first
    const { data: override } = await supabase
      .from("date_overrides")
      .select("*")
      .eq("date", dateStr)
      .maybeSingle();

    if (override) {
      setDateOverrideId(override.id);
      if (override.kind === "closed") {
        setWorkingHours({
          start: "08:00",
          end: "20:00",
          closed: true,
          source: "exception",
        });
      } else {
        setWorkingHours({
          start: override.start_time || "08:00",
          end: override.end_time || "20:00",
          closed: false,
          source: "exception",
        });
      }
    } else {
      // Load default working hours for this weekday
      const { data: defaultHours } = await supabase
        .from("working_hours")
        .select("*")
        .eq("weekday", weekday)
        .eq("is_active", true)
        .maybeSingle();

      if (defaultHours) {
        setWorkingHours({
          start: defaultHours.start_time,
          end: defaultHours.end_time,
          closed: false,
          source: "default",
        });
      } else {
        setWorkingHours({
          start: "08:00",
          end: "20:00",
          closed: false,
          source: "default",
        });
      }
      setDateOverrideId(null);
    }
  }

  async function saveWorkingHours() {
    if (!selectedDay) return;

    const dateStr = moment(selectedDay).format("YYYY-MM-DD");

    if (dateOverrideId) {
      // Update existing override
      const { error } = await supabase
        .from("date_overrides")
        .update({
          kind: "custom_hours",
          start_time: workingHours.start,
          end_time: workingHours.end,
        })
        .eq("id", dateOverrideId);

      if (error) {
        showToast("error", "Nepavyko išsaugoti laiko");
      } else {
        showToast("success", "✨ Darbo laikas atnaujintas - kalendorius perskaičiuotas");
        await loadDayWorkingHours(selectedDay);
        await loadDateOverrides(); // Refresh to update unified day-time blocks
      }
    } else {
      // Create new override
      const { error } = await supabase.from("date_overrides").insert({
        date: dateStr,
        kind: "custom_hours",
        start_time: workingHours.start,
        end_time: workingHours.end,
      });

      if (error) {
        showToast("error", "Nepavyko išsaugoti laiko");
      } else {
        showToast("success", "✨ Darbo laikas nustatytas - kalendorius perskaičiuotas");
        await loadDayWorkingHours(selectedDay);
        await loadDateOverrides(); // Refresh to update unified day-time blocks
      }
    }
  }

  async function markAsFreeDay() {
    if (!selectedDay) return;

    const dateStr = moment(selectedDay).format("YYYY-MM-DD");

    // DEMO MODE: Webhook disabled - no external connections
    const sendFreeDayWebhook = async () => {
      console.log("[DEMO] Webhook disabled in demo mode, date:", dateStr);
    };

    // Step 1: Cancel all confirmed bookings for this date
    const startOfDay = fromZonedTime(`${dateStr} 00:00:00`, "Europe/Vilnius").toISOString();
    const endOfDay = fromZonedTime(`${dateStr} 23:59:59`, "Europe/Vilnius").toISOString();

    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .gte("start_time_utc", startOfDay)
      .lt("start_time_utc", endOfDay)
      .eq("status", "confirmed");

    if (bookingError) {
      console.error("Error cancelling bookings:", bookingError);
      showToast("error", "Nepavyko atšaukti rezervacijų");
      return;
    }

    // Step 2: Create/update date override to mark day as closed (blocks new bookings from "/" page)
    const { error: overrideError } = await supabase
      .from("date_overrides")
      .upsert(
        {
          date: dateStr,
          kind: "closed",
          start_time: null,
          end_time: null,
        },
        {
          onConflict: "date",
        }
      );

    if (overrideError) {
      console.error("Error creating date override:", overrideError);
      showToast("error", "Nepavyko užblokuoti dienos kalendoriuje");
      return;
    }

    showToast("success", "🚫 Diena pažymėta kaip laisvadienis - rezervacijos atšauktos");
    await sendFreeDayWebhook();
    await loadBookings();
    await loadDateOverrides();
  }

  async function removeException() {
    if (!dateOverrideId || !selectedDay) return;

    const { error } = await supabase
      .from("date_overrides")
      .delete()
      .eq("id", dateOverrideId);

    if (error) {
      showToast("error", "Nepavyko atstatyti dienos");
    } else {
      showToast("success", "✅ Diena atstatyta - dabar galima priimti naujus bookings");
      await loadDayWorkingHours(selectedDay);
      await loadDateOverrides();
    }
  }

  async function cancelBooking() {
    if (!selectedEvent || isProcessing) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('admin_session_token');
      if (!token) {
        showToast("error", "Sesija negaliojanti");
        return;
      }

      const { data, error } = await supabase.rpc('admin_cancel_booking', {
        p_token: token,
        p_booking_id: selectedEvent.id
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Klaida atšaukiant rezervaciją');
      }

      showToast("success", "Rezervacija sėkmingai ištrinta");
      setDeleteModalOpen(false);
      setDrawerOpen(false);
      setSelectedEvent(null);
      await loadBookings();
    } catch (error: any) {
      showToast("error", error.message || "Nepavyko atšaukti rezervacijos");
    } finally {
      setIsProcessing(false);
    }
  }

  async function rescheduleBooking() {
    if (!rescheduleData || !newDate || !newTime || isProcessing) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('admin_session_token');
      if (!token) {
        showToast("error", "Sesija negaliojanti");
        return;
      }

      const [hours, minutes] = newTime.split(":").map(Number);
      const newStartDate = new Date(newDate);
      newStartDate.setHours(hours, minutes, 0, 0);

      const service = selectedEvent?.service;
      if (!service?.duration_min) throw new Error("Paslauga nerasta");

      const newEndDate = new Date(newStartDate);
      newEndDate.setMinutes(newEndDate.getMinutes() + service.duration_min);

      const { data, error } = await supabase.rpc('admin_reschedule_booking', {
        p_token: token,
        p_booking_id: rescheduleData.id,
        p_new_start_time: newStartDate.toISOString(),
        p_new_end_time: newEndDate.toISOString()
      });

      if (error || !data?.success) {
        if (data?.error === 'Time slot conflict') {
          throw new Error('Šis laikas jau užimtas. Pasirinkite kitą.');
        }
        throw new Error(data?.error || 'Klaida perkeliant rezervaciją');
      }

      showToast("success", "Rezervacija sėkmingai perkelta");
      setRescheduleModalOpen(false);
      setDrawerOpen(false);
      setSelectedEvent(null);
      setRescheduleData(null);
      setNewDate("");
      setNewTime("");
      await loadBookings();
    } catch (error: any) {
      showToast("error", error.message || "Nepavyko perkelti rezervacijos");
    } finally {
      setIsProcessing(false);
    }
  }

  /* ===========================
     UI
  ============================ */
  return (
    <AppShell>
      <AppShell.Page
        title="Kalendorius"
        subtitle="Tvarkykite rezervacijas ir prieinamumą"
      >
        <div className="space-y-3 sm:space-y-6">
          {/* Navigation Bar - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* View Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-[14px] p-1 sm:p-1.5 border border-white/10">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-[10px] text-xs sm:text-sm font-medium transition touch-manipulation min-h-[44px] sm:min-h-0 ${
                  view === v
                    ? "bg-[#9333EA] text-white shadow-[0_0_20px_rgba(147,51,234,.35)]"
                    : "text-white/70 hover:text-white active:bg-white/10 hover:bg-white/5"
                }`}
              >
                {v === "month"
                  ? "Mėnuo"
                  : v === "week"
                  ? "Savaitė"
                  : "Diena"}
              </button>
            ))}
            </div>

            {/* Week/Date Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else if (view === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setDate(newDate);
                }}
                className="p-2.5 sm:p-2 rounded-lg sm:rounded-[10px] bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/[0.15] transition text-white/70 hover:text-white touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Ankstesnis"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>

              <div className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-[14px] border border-white/10 sm:min-w-[280px] text-center">
                <p className="text-white font-semibold text-xs sm:text-sm truncate">
                  {view === 'month' && formatMonthYear(date)}
                  {view === 'week' && formatDateRange(
                    moment(date).startOf('week').toDate(),
                    moment(date).endOf('week').toDate()
                  )}
                  {view === 'day' && formatLTDate(date)}
                  {view === 'agenda' && formatMonthYear(date)}
                </p>
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else if (view === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setDate(newDate);
                }}
                className="p-2.5 sm:p-2 rounded-lg sm:rounded-[10px] bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/[0.15] transition text-white/70 hover:text-white touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Kitas"
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => setDate(new Date())}
                className={`hidden sm:flex px-4 py-2 rounded-[10px] transition font-medium text-sm items-center gap-2 touch-manipulation shadow-sm ${
                  theme === 'dark'
                    ? 'bg-[#9333EA] hover:bg-[#7C3AED] text-white'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200'
                }`}
                title="Šiandien"
              >
                <CalendarDays size={16} />
                Šiandien
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-[#0C0F15] rounded-xl sm:rounded-[20px] shadow-lg overflow-hidden border border-white/[0.06]">
            {loading ? (
              <div className="p-6 sm:p-12">
                <SkeletonCard />
              </div>
            ) : (
              <div className="p-3 sm:p-6 calendar-wrapper-mobile" style={{ height: dynamicCalendarHeight, minHeight: '500px' }}>
                <style>{`
                  /* Mobile: Week view horizontal scroll wrapper */
                  @media (max-width: 639px) {
                    .calendar-wrapper-mobile .rbc-time-view {
                      overflow-x: auto !important;
                      overflow-y: hidden !important;
                      -webkit-overflow-scrolling: touch;
                    }

                    .calendar-wrapper-mobile .rbc-time-header,
                    .calendar-wrapper-mobile .rbc-time-content {
                      min-width: max-content !important;
                      overflow-x: visible !important;
                    }

                    .calendar-wrapper-mobile .rbc-time-header-content {
                      overflow-x: visible !important;
                      overflow-y: hidden !important;
                    }

                    .calendar-wrapper-mobile .rbc-time-content {
                      overflow-x: visible !important;
                      overflow-y: auto !important;
                    }
                  }

                  .rbc-calendar {
                    color: #fff;
                    font-family: inherit;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                  }

                  /* Headers */
                  .rbc-header {
                    border-bottom: 1px solid rgba(255,255,255,.06);
                    color: rgba(255,255,255,.6);
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 8px 4px;
                  }

                  /* Base views */
                  .rbc-time-view, .rbc-month-view {
                    background: rgba(255,255,255,.02);
                    border: none;
                    border-radius: 12px;
                  }
                  .rbc-day-bg, .rbc-time-slot, .rbc-month-row {
                    border-color: rgba(255,255,255,.06) !important;
                  }
                  .rbc-day-bg {
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                  }
                  .rbc-day-bg:active {
                    background-color: rgba(147,51,234,.1) !important;
                  }
                  .rbc-today { background: rgba(147,51,234,.06); }
                  .rbc-off-range-bg { background: transparent !important; }
                  .rbc-off-range { color: rgba(255,255,255,.25); }
                  .rbc-event:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 24px rgba(147,51,234,.25);
                  }
                  .rbc-toolbar { display: none; }

                  /* Month view */
                  .rbc-month-view .rbc-event,
                  .rbc-month-view .rbc-row-segment,
                  .rbc-month-view .rbc-event-allday { display: none !important; }
                  .rbc-day-bg.day-closed { background: rgba(239, 68, 68, 0.12) !important; }
                  .rbc-day-bg.day-custom-hours { background: rgba(34, 211, 238, 0.15) !important; }

                  /* Time slots - Unified Day-Time Blocks */
                  .rbc-time-slot {
                    min-height: 48px !important;
                    position: relative;
                  }
                  .rbc-timeslot-group {
                    min-height: 96px !important;
                  }

                  /* Working hours highlighting */
                  .rbc-time-slot.working-hours {
                    background: rgba(147, 51, 234, 0.03) !important;
                    border-left: 2px solid rgba(147, 51, 234, 0.2) !important;
                  }

                  .rbc-time-slot.non-working-hours {
                    background: rgba(0, 0, 0, 0.3) !important;
                    pointer-events: none;
                    opacity: 0.4;
                  }

                  /* Day column unified styling */
                  .rbc-day-slot.unified-day-block {
                    border: 2px solid rgba(147, 51, 234, 0.15) !important;
                    border-radius: 12px;
                    overflow: hidden;
                    margin: 0 2px;
                  }

                  .rbc-day-slot.closed-day {
                    background: repeating-linear-gradient(
                      45deg,
                      rgba(239, 68, 68, 0.05),
                      rgba(239, 68, 68, 0.05) 10px,
                      rgba(0, 0, 0, 0.1) 10px,
                      rgba(0, 0, 0, 0.1) 20px
                    ) !important;
                    pointer-events: none;
                    opacity: 0.5;
                  }

                  /* Events */
                  .rbc-event {
                    min-height: 42px !important;
                    overflow: visible !important;
                    white-space: normal !important;
                    line-height: 1.4;
                  }
                  .rbc-event-content {
                    overflow: visible !important;
                    text-overflow: clip !important;
                    white-space: normal !important;
                  }
                  .rbc-event-label {
                    display: block;
                    margin-bottom: 2px;
                    font-size: 11px;
                    opacity: 0.8;
                  }
                  .rbc-time-content {
                    overflow-y: auto !important;
                  }

                  /* Desktop: Week view adjustments */
                  @media (min-width: 640px) {
                    .rbc-time-view .rbc-time-column {
                      min-width: 120px;
                    }
                  }

                  /* ===== MOBILE OPTIMIZATIONS ===== */
                  @media (max-width: 639px) {
                    /* Time gutter (left side with hours) */
                    .rbc-time-gutter {
                      width: 48px !important;
                      min-width: 48px !important;
                    }

                    .rbc-time-gutter .rbc-timeslot-group {
                      font-size: 10px !important;
                      padding: 2px !important;
                    }

                    /* Week/Day view columns */
                    .rbc-time-view .rbc-time-column {
                      min-width: 80px !important;
                      flex: 1;
                    }

                    /* Mobile: Adjust minimum widths for day columns */
                    .rbc-time-view .rbc-day-slot {
                      min-width: 100px !important;
                    }

                    .rbc-header {
                      min-width: 100px !important;
                      padding: 6px 2px !important;
                      font-size: 0 !important;
                    }

                    .rbc-header:nth-child(1)::after,
                    .rbc-header:nth-child(2)::after,
                    .rbc-header:nth-child(3)::after,
                    .rbc-header:nth-child(4)::after,
                    .rbc-header:nth-child(5)::after,
                    .rbc-header:nth-child(6)::after,
                    .rbc-header:nth-child(7)::after {
                      font-size: 10px !important;
                    }

                    /* Day header format */
                    .rbc-header + .rbc-header {
                      border-left: 1px solid rgba(255,255,255,.06);
                    }

                    /* Events on mobile */
                    .rbc-event {
                      font-size: 10px !important;
                      padding: 4px 6px !important;
                      border-radius: 6px !important;
                      min-height: 36px !important;
                    }

                    .rbc-event-content {
                      font-size: 10px !important;
                      line-height: 1.3 !important;
                    }

                    /* Time slots on mobile */
                    .rbc-time-slot {
                      min-height: 40px !important;
                    }

                    .rbc-timeslot-group {
                      min-height: 80px !important;
                    }

                    /* Month view cells */
                    .rbc-month-view .rbc-date-cell {
                      padding: 4px !important;
                    }

                    .rbc-date-cell {
                      font-size: 11px !important;
                    }

                    /* Allday row */
                    .rbc-allday-cell {
                      display: none;
                    }

                    /* Current time indicator */
                    .rbc-current-time-indicator {
                      height: 2px !important;
                    }
                  }

                  /* Extra small mobile devices */
                  @media (max-width: 374px) {
                    .rbc-time-gutter {
                      width: 40px !important;
                      min-width: 40px !important;
                    }

                    .rbc-time-view .rbc-time-column,
                    .rbc-time-view .rbc-day-slot,
                    .rbc-header {
                      min-width: 70px !important;
                    }

                    .rbc-event {
                      font-size: 9px !important;
                      padding: 3px 4px !important;
                    }
                  }
                `}</style>

                <DnDCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  date={date}
                  onNavigate={setDate}
                  view={view}
                  onView={setView}
                  culture="lt"
                  components={components as any}
                  messages={lithuanianMessages}
                  formats={formats}
                  eventPropGetter={eventPropGetter}
                  selectable={true}
                  onSelectEvent={(e) => openEventDrawer(e as BookingEvent)}
                  onSelectSlot={(slot) => {
                    if (view === "month") {
                      openDayDrawer(slot.start);
                    }
                  }}
                  step={30}
                  timeslots={2}
                  min={calendarTimeRange.min}
                  max={calendarTimeRange.max}
                  longPressThreshold={250}
                />
              </div>
            )}
          </div>
        </div>
      </AppShell.Page>

      {/* Solid Drawer */}
<Sheet
  isOpen={drawerOpen}
  onClose={() => {
    setDrawerOpen(false);
    setSelectedEvent(null);
    setSelectedDay(null);
  }}
  title={
    selectedEvent
      ? "Rezervacijos detalės"
      : selectedDay
      ? `${formatLTDate(selectedDay)} • Darbo laikas`
      : ""
  }
  side={isMobile ? "bottom" : "right"}
>
  <div className="min-h-full space-y-6">
    {/* EVENT DETAILS */}
    {selectedEvent && (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <User className="text-[#9333EA]" />
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>Klientas</p>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEvent.customer.name}</p>
          </div>
        </div>

        {selectedEvent.customer.phone_e164 && (
          <div className="flex items-center gap-3">
            <Phone className="text-[#9333EA]" />
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>Telefonas</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEvent.customer.phone_e164}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Briefcase className="text-[#9333EA]" />
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>Paslauga</p>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEvent.service.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="text-[#9333EA]" />
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>Laikas</p>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {moment(selectedEvent.start).format("YYYY-MM-DD HH:mm")} –{" "}
              {moment(selectedEvent.end).format("HH:mm")}
            </p>
          </div>
        </div>

        {selectedEvent.notes && (
          <div className={`${theme === 'dark' ? 'bg-white/5 text-white/90' : 'bg-slate-50 text-slate-800'} rounded-lg p-3 text-sm leading-relaxed`}>
            {selectedEvent.notes}
          </div>
        )}

        <div className={`flex gap-2 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              if (selectedEvent) {
                const startMoment = moment(selectedEvent.start);
                setNewDate(startMoment.format("YYYY-MM-DD"));
                setNewTime(startMoment.format("HH:mm"));
                setRescheduleData({
                  id: selectedEvent.id,
                  newStart: selectedEvent.start,
                  newEnd: selectedEvent.end,
                });
                setDrawerOpen(false);
                setTimeout(() => setRescheduleModalOpen(true), 100);
              }
            }}
          >
            <Edit2 size={16} />
            Perkelti
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              setDrawerOpen(false);
              setTimeout(() => setDeleteModalOpen(true), 100);
            }}
          >
            <Trash2 size={16} />
            Atšaukti
          </Button>
        </div>
      </div>
    )}

    {/* DAY SETTINGS */}
    {selectedDay && !selectedEvent && (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Settings2 className="text-[#9333EA]" />
          <div>
            <p className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569' }}>Diena</p>
            <p className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#0F172A' }}>
              {formatLTDate(selectedDay)}
            </p>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-xl p-5 space-y-3 border shadow-inner`}>
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}
            >
              Šaltinis
            </span>
            <span className="text-sm font-semibold text-[#9333EA]">
              {workingHours.source === "exception" ? "Išimtis" : "Numatytasis"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label
              className="text-sm font-medium w-24"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}
            >
              Pradžia
            </label>
            <input
              type="time"
              className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-300'} border rounded-md px-3 py-2 text-sm`}
              style={{ color: theme === 'dark' ? '#ffffff' : '#0F172A' }}
              value={workingHours.start}
              onChange={(e) =>
                setWorkingHours((w) => ({
                  ...w,
                  start: e.target.value,
                  closed: false,
                }))
              }
              disabled={workingHours.closed}
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              className="text-sm font-medium w-24"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}
            >
              Pabaiga
            </label>
            <input
              type="time"
              className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-300'} border rounded-md px-3 py-2 text-sm`}
              style={{ color: theme === 'dark' ? '#ffffff' : '#0F172A' }}
              value={workingHours.end}
              onChange={(e) =>
                setWorkingHours((w) => ({
                  ...w,
                  end: e.target.value,
                  closed: false,
                }))
              }
              disabled={workingHours.closed}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" onClick={saveWorkingHours} disabled={workingHours.closed}>
              <CheckCircle2 size={16} />
              Išsaugoti laiką
            </Button>
            <Button variant="danger" onClick={markAsFreeDay}>
              <XCircle size={16} />
              Pažymėti laisva diena
            </Button>
            {workingHours.source === "exception" && (
              <Button variant="success" onClick={removeException}>
                <CheckCircle2 size={16} />
                Atstatyti dieną
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#475569' }}>
          Pastaba: čia pakeistos valandos galioja tik pasirinktai dienai. Numatytąsias savaitės
          valandas koreguosite „Nustatymai → Darbo laikas" (vėliau).
        </p>
      </div>
    )}
  </div>
</Sheet>


      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTimeout(() => setDrawerOpen(true), 100);
        }}
        onConfirm={cancelBooking}
        title="Ištrinti rezervaciją"
        message="Ar tikrai norite ištrinti šią rezervaciją? Šio veiksmo negalima atšaukti."
        confirmText={isProcessing ? "Trinama..." : "Taip, ištrinti"}
        cancelText="Ne"
        variant="danger"
      />

      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setRescheduleModalOpen(false);
              setTimeout(() => setDrawerOpen(true), 100);
            }}
          />
          <div className={`relative ${theme === 'dark' ? 'bg-[#0B0F16] border-white/10' : 'bg-white border-slate-200'} rounded-[20px] shadow-2xl w-full max-w-md border p-6 space-y-4 z-[61]`}>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Perkelti rezervaciją</h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} mb-2`}>Nauja data</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={`w-full ${theme === 'dark' ? 'bg-[#141820] border-[#1E232D] text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-lg px-3 py-2`}
                  min={moment().format("YYYY-MM-DD")}
                />
              </div>

              <div>
                <label className={`block text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} mb-2`}>Naujas laikas</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className={`w-full ${theme === 'dark' ? 'bg-[#141820] border-[#1E232D] text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-lg px-3 py-2`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="subtle"
                fullWidth
                onClick={() => {
                  setRescheduleModalOpen(false);
                  setTimeout(() => setDrawerOpen(true), 100);
                }}
                disabled={isProcessing}
              >
                Atšaukti
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={rescheduleBooking}
                disabled={isProcessing || !newDate || !newTime}
              >
                {isProcessing ? "Perkeliama..." : "Perkelti"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
