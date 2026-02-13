import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/context/FilterContext";
import { fetchCountries } from "@/lib/api";
import { X, Search } from "lucide-react";

export default function FilterBar({
  organizations,
}: {
  organizations: string[];
}) {
  const { filters, setFilter, resetFilters } = useFilters();
  const [countries, setCountries] = useState<
    { country: string; countryCode: string }[]
  >([]);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="mb-8 animate-fade-in">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs uppercase tracking-[0.15em] text-[#7a7468] font-semibold"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Filters
        </span>
        <div className="flex-1 h-[1px] bg-[#e0dbd3]" />
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-[#b83518] hover:text-[#d44a28] transition-colors font-medium"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-5 items-end gap-3">
        <div className="grid gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.12em] text-[#7a7468]" style={{ fontFamily: "var(--font-body)" }}>
            Country
          </label>
          <Select
            value={filters.country || "_all"}
            onValueChange={(v) => setFilter("country", v === "_all" ? "" : v)}
          >
            <SelectTrigger className="w-full bg-white border-[#e0dbd3] text-[#1a1a2e] hover:border-[#c8c2b8] transition-colors focus:ring-[#b83518]/20">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e0dbd3] text-[#1a1a2e]">
              <SelectItem value="_all">All</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.countryCode} value={c.countryCode}>
                  {c.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.12em] text-[#7a7468]" style={{ fontFamily: "var(--font-body)" }}>
            Organization
          </label>
          <Select
            value={filters.organization || "_all"}
            onValueChange={(v) => setFilter("organization", v === "_all" ? "" : v)}
          >
            <SelectTrigger className="w-full bg-white border-[#e0dbd3] text-[#1a1a2e] hover:border-[#c8c2b8] transition-colors focus:ring-[#b83518]/20">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e0dbd3] text-[#1a1a2e]">
              <SelectItem value="_all">All</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org} value={org}>
                  {org}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.12em] text-[#7a7468]" style={{ fontFamily: "var(--font-body)" }}>
            Instructor
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7a7468]" />
            <Input
              placeholder="Search..."
              value={filters.instructor}
              onChange={(e) => setFilter("instructor", e.target.value)}
              className="pl-9 bg-white border-[#e0dbd3] text-[#1a1a2e] placeholder:text-[#b8b2a8] hover:border-[#c8c2b8] transition-colors focus:ring-[#b83518]/20"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.12em] text-[#7a7468]" style={{ fontFamily: "var(--font-body)" }}>
            From
          </label>
          <Input
            type="date"
            className="w-full bg-white border-[#e0dbd3] text-[#1a1a2e] hover:border-[#c8c2b8] transition-colors focus:ring-[#b83518]/20"
            value={filters.startDate}
            onChange={(e) => setFilter("startDate", e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.12em] text-[#7a7468]" style={{ fontFamily: "var(--font-body)" }}>
            To
          </label>
          <Input
            type="date"
            className="w-full bg-white border-[#e0dbd3] text-[#1a1a2e] hover:border-[#c8c2b8] transition-colors focus:ring-[#b83518]/20"
            value={filters.endDate}
            onChange={(e) => setFilter("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
