import { NavLink, Outlet, useLocation } from "react-router";
import FilterBar from "@/components/seminars/FilterBar";
import { organizations } from "@/lib/constants";

const tabs = [
  { label: "List", to: "/list" },
  { label: "Map", to: "/map" },
];

export default function AppShell() {
  const location = useLocation();
  const isMapView = location.pathname === "/map";

  return (
    <div className="h-screen flex flex-col overflow-x-hidden">
      <header className="border-b border-border bg-white shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Aikido Seminar Tracker
          </h1>
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {isMapView ? (
        <main className="flex-1 min-h-0 relative">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <FilterBar organizations={organizations} />
          <Outlet />
        </main>
      )}
    </div>
  );
}
