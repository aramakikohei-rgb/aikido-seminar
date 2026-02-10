import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { SeminarLevel } from "@/types/seminar";

export interface Filters {
  country: string;
  instructor: string;
  organization: string;
  level: SeminarLevel | "";
  startDate: string;
  endDate: string;
}

const initialFilters: Filters = {
  country: "",
  instructor: "",
  organization: "",
  level: "",
  startDate: "",
  endDate: "",
};

type Action =
  | { type: "SET_FILTER"; field: keyof Filters; value: string }
  | { type: "RESET" };

function reducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case "SET_FILTER":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialFilters;
  }
}

interface FilterContextValue {
  filters: Filters;
  setFilter: (field: keyof Filters, value: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, dispatch] = useReducer(reducer, initialFilters);

  const setFilter = (field: keyof Filters, value: string) =>
    dispatch({ type: "SET_FILTER", field, value });

  const resetFilters = () => dispatch({ type: "RESET" });

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
