import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { format } from "date-fns";
import { fetchSeminars } from "@/lib/api";
import type { Seminar } from "@/types/seminar";
import { useFilters } from "@/context/FilterContext";
import { applyFilters } from "@/lib/filters";
import FilterBar from "./FilterBar";
import { organizations } from "@/lib/constants";
import { ChevronDown, ChevronUp, SlidersHorizontal, ExternalLink } from "lucide-react";

// Custom dot marker icon (no image dependencies)
const dotIcon = L.divIcon({
  className: "seminar-marker",
  html: '<div class="seminar-marker-dot"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

/** Forces Leaflet to recalculate container size after mount */
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function SeminarMap() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { filters } = useFilters();

  useEffect(() => {
    fetchSeminars()
      .then(setSeminars)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = applyFilters(seminars, filters);
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c73e1d] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#8a8578]">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[30, 0]}
        zoom={3}
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ResizeHandler />
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
          {filtered.map((seminar) => (
            <Marker
              key={seminar.id}
              position={[seminar.latitude, seminar.longitude]}
              icon={dotIcon}
            >
              <Popup>
                <div className="min-w-[240px] p-1">
                  <h3
                    className="font-bold text-sm mb-1.5 leading-tight text-[#f5f0e8]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {seminar.title}
                  </h3>
                  <p className="text-xs text-[#8a8578] mb-1">
                    {seminar.instructor}
                    {seminar.instructorRank && (
                      <span className="text-[#b8960b]"> ({seminar.instructorRank})</span>
                    )}
                  </p>
                  <div className="h-[1px] bg-[#2a2a35] my-2" />
                  <p className="text-xs text-[#d4c8b8] mb-1">
                    {format(new Date(seminar.startDate), "MMM d")} —{" "}
                    {format(new Date(seminar.endDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-[#8a8578]">
                    {seminar.venue && `${seminar.venue}, `}
                    {seminar.city}, {seminar.country}
                  </p>
                  {seminar.fee && (
                    <p className="text-xs mt-1.5 font-medium text-[#b8960b]">{seminar.fee}</p>
                  )}
                  {(seminar.registrationUrl || seminar.sourceUrl) && (
                    <a
                      href={seminar.registrationUrl || seminar.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#c73e1d] hover:text-[#e04a2a] mt-2 inline-flex items-center gap-1 transition-colors"
                    >
                      More info
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Floating filter panel */}
      <div className="absolute top-3 left-3 z-[1000] animate-slide-in-left">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="bg-[#16161e]/95 backdrop-blur-md shadow-xl rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-[#1c1c24] transition-all duration-200 border border-[#2a2a35] text-[#d4c8b8]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <SlidersHorizontal className="h-4 w-4 text-[#8a8578]" />
          Filters
          {hasActiveFilters && (
            <span className="bg-[#c73e1d] text-[#f5f0e8] text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              !
            </span>
          )}
          {filtersOpen ? (
            <ChevronUp className="h-4 w-4 text-[#8a8578]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#8a8578]" />
          )}
        </button>
        {filtersOpen && (
          <div className="mt-2 bg-[#16161e]/95 backdrop-blur-md shadow-xl rounded-lg p-5 border border-[#2a2a35] max-w-[90vw] animate-fade-up">
            <FilterBar organizations={organizations} />
          </div>
        )}
      </div>

      {/* Seminar count badge */}
      <div
        className="absolute bottom-4 left-3 z-[1000] bg-[#16161e]/90 backdrop-blur-md shadow-lg rounded-lg px-4 py-2 text-xs border border-[#2a2a35] flex items-center gap-2"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="w-2 h-2 rounded-full bg-[#c73e1d] animate-pulse" />
        <span className="text-[#8a8578]">
          <span className="text-[#d4c8b8] font-medium">{filtered.length}</span> of {seminars.length} seminars
        </span>
      </div>
    </div>
  );
}
