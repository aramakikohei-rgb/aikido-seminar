import type { Seminar } from "@/types/seminar";
import type { Filters } from "@/context/FilterContext";

export function applyFilters(seminars: Seminar[], filters: Filters): Seminar[] {
  return seminars.filter((s) => {
    if (filters.country && s.countryCode !== filters.country) return false;
    if (
      filters.instructor &&
      !s.instructor.toLowerCase().includes(filters.instructor.toLowerCase())
    )
      return false;
    if (filters.organization && s.organization !== filters.organization)
      return false;
    if (filters.level && s.level !== filters.level) return false;
    if (filters.startDate && s.endDate < filters.startDate) return false;
    if (filters.endDate && s.startDate > filters.endDate) return false;
    return true;
  });
}
