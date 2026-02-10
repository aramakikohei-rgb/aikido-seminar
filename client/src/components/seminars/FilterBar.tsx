import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/context/FilterContext";
import { fetchCountries } from "@/lib/api";

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
    <div className="grid grid-cols-5 items-end gap-3 mb-4">
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Country</label>
        <Select
          value={filters.country || "_all"}
          onValueChange={(v) => setFilter("country", v === "_all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>
                {c.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Organization</label>
        <Select
          value={filters.organization || "_all"}
          onValueChange={(v) =>
            setFilter("organization", v === "_all" ? "" : v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Instructor</label>
        <Input
          placeholder="Search..."
          value={filters.instructor}
          onChange={(e) => setFilter("instructor", e.target.value)}
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">From</label>
        <Input
          type="date"
          className="w-full"
          value={filters.startDate}
          onChange={(e) => setFilter("startDate", e.target.value)}
        />
      </div>

      <div className="grid gap-1 flex-row">
        <label className="text-xs text-muted-foreground">To</label>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-full"
            value={filters.endDate}
            onChange={(e) => setFilter("endDate", e.target.value)}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
