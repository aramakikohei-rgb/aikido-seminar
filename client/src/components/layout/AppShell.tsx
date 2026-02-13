import { NavLink, Outlet, useLocation } from "react-router";
import FilterBar from "@/components/seminars/FilterBar";
import { organizations } from "@/lib/constants";
import { Map, List } from "lucide-react";

const tabs = [
  { label: "List", to: "/list", icon: List },
  { label: "Map", to: "/map", icon: Map },
];

export default function AppShell() {
  const location = useLocation();
  const isMapView = location.pathname === "/map";

  return (
    <div className="h-screen flex flex-col overflow-x-hidden bg-[#0f0f14]">
      {/* Header */}
      <header className="border-b border-[#2a2a35] bg-[#0f0f14]/95 backdrop-blur-md shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            {/* Enso circle mark */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  stroke="#c73e1d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="85 10"
                  opacity="0.9"
                />
              </svg>
            </div>
            <div>
              <h1
                className="text-xl tracking-tight text-[#f5f0e8]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Aikido Seminar Tracker
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8578] mt-[-2px]"
                 style={{ fontFamily: "var(--font-body)" }}>
                Global Events Directory
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 bg-[#16161e] rounded-lg p-1 border border-[#2a2a35]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "bg-[#c73e1d] text-[#f5f0e8] shadow-lg shadow-[#c73e1d]/20"
                        : "text-[#8a8578] hover:text-[#d4c8b8] hover:bg-[#1c1c24]"
                    }`
                  }
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Decorative accent line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#c73e1d]/30 to-transparent" />
      </header>

      {isMapView ? (
        <main className="flex-1 min-h-0 relative">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-fade-up">
          <FilterBar organizations={organizations} />
          <Outlet />
        </main>
      )}
    </div>
  );
}
