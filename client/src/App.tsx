import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppShell from "@/components/layout/AppShell";
import SeminarTable from "@/components/seminars/SeminarTable";
import SeminarMap from "@/components/seminars/SeminarMap";
import { FilterProvider } from "@/context/FilterContext";

export default function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/list" replace />} />
            <Route path="list" element={<SeminarTable />} />
            <Route path="map" element={<SeminarMap />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  );
}
