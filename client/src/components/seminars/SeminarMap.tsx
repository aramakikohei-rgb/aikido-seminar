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
import { ChevronDown, ChevronUp } from "lucide-react";

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
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gray-50">
        Loading map...
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
                <div className="min-w-[220px] p-1">
                  <h3 className="font-bold text-sm mb-1 leading-tight">
                    {seminar.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {seminar.instructor}
                    {seminar.instructorRank && ` (${seminar.instructorRank})`}
                  </p>
                  <p className="text-xs mb-1">
                    {format(new Date(seminar.startDate), "MMM d")} —{" "}
                    {format(new Date(seminar.endDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {seminar.venue && `${seminar.venue}, `}
                    {seminar.city}, {seminar.country}
                  </p>
                  {seminar.fee && (
                    <p className="text-xs mt-1 font-medium">{seminar.fee}</p>
                  )}
                  {(seminar.registrationUrl || seminar.sourceUrl) && (
                    <a
                      href={seminar.registrationUrl || seminar.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline mt-1 inline-block"
                    >
                      More info
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Floating filter panel */}
      <div className="absolute top-3 left-3 z-[1000]">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="bg-white shadow-lg rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200"
        >
          Filters
          {hasActiveFilters && (
            <span className="bg-foreground text-background text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
          {filtersOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {filtersOpen && (
          <div className="mt-2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-[90vw]">
            <FilterBar organizations={organizations} />
          </div>
        )}
      </div>

      {/* Seminar count badge */}
      <div className="absolute bottom-4 left-3 z-[1000] bg-white/90 backdrop-blur-sm shadow-md rounded-lg px-3 py-1.5 text-xs text-muted-foreground border border-gray-200">
        {filtered.length} of {seminars.length} seminars
      </div>
    </div>
  );
}
