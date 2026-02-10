import { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { fetchSeminars } from "@/lib/api";
import type { Seminar } from "@/types/seminar";
import { useFilters } from "@/context/FilterContext";
import { applyFilters } from "@/lib/filters";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const styleColors: Record<string, string> = {
  Aikikai: "#2563eb",
  Yoshinkan: "#dc2626",
  Shodokan: "#059669",
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Seminar;
}

export default function SeminarCalendar() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters } = useFilters();

  useEffect(() => {
    fetchSeminars()
      .then(setSeminars)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = applyFilters(seminars, filters);

  const events: CalendarEvent[] = useMemo(
    () =>
      filtered.map((s) => ({
        id: s.id,
        title: `${s.title} — ${s.instructor}`,
        start: new Date(s.startDate),
        // endDate is inclusive, so add 1 day for calendar display
        end: addDays(new Date(s.endDate), 1),
        resource: s,
      })),
    [filtered]
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = event.resource.style;
    const bg = (style && styleColors[style]) || "#6b7280";
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4 bg-white" style={{ height: "75vh" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "agenda"]}
        defaultView="month"
        defaultDate={new Date(2026, 2, 1)}
        popup
        tooltipAccessor={(event) => {
          const s = event.resource;
          return `${s.instructor}${s.instructorRank ? ` (${s.instructorRank})` : ""}\n${s.city}, ${s.country}`;
        }}
        style={{ height: "100%" }}
      />
    </div>
  );
}
