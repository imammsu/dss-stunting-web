import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { Village } from "../data/villages";
import { getStatusColor, getStatusLabel } from "../data/villages";

interface MapViewProps {
  villages: Village[];
  selectedVillage: Village | null;
  onVillageSelect: (village: Village) => void;
  isCalculated: boolean;
}

// Sub-component to fly to a selected village
function FlyToVillage({ village }: { village: Village | null }) {
  const map = useMap();
  const prevVillageRef = useRef<Village | null>(null);

  useEffect(() => {
    if (village && village.id !== prevVillageRef.current?.id) {
      map.flyTo([village.lat, village.lng], 13, { duration: 0.8 });
      prevVillageRef.current = village;
    }
  }, [village, map]);

  return null;
}

export default function MapView({
  villages,
  selectedVillage,
  onVillageSelect,
  isCalculated,
}: MapViewProps) {
  const jemberCenter: [number, number] = [-8.185, 113.668];

  return (
    <div className="relative z-0 w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={jemberCenter}
        zoom={11}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <FlyToVillage village={selectedVillage} />

        {isCalculated &&
          villages.map((village) => {
            const isSelected = selectedVillage?.id === village.id;
            const color = getStatusColor(village.vScore);

            return (
              <CircleMarker
                key={village.id}
                center={[village.lat, village.lng]}
                radius={isSelected ? 12 : 8}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.8,
                  color: isSelected ? "#0D47A1" : "#ffffff",
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => onVillageSelect(village),
                }}
              >
                <Popup className="custom-popup">
                  <div className="min-w-[160px] p-1 bg-white text-slate-700 rounded-lg">
                    <h3 className="font-bold text-sm text-slate-900 mb-0.5">{village.name}</h3>
                    <p className="text-xs text-slate-500 mb-1.5">Kec. {village.district}</p>
                    <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-1.5">
                      <span className="text-slate-400">V-Score:</span>
                      <span className="font-bold" style={{ color }}>{village.vScore.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-semibold" style={{ color }}>{getStatusLabel(village.vScore)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-400">Ranking:</span>
                      <span className="font-bold text-slate-900">#{village.ranking}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      {/* Map overlay legend */}
      {isCalculated && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 px-3 py-2.5 z-[30]">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Legenda</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-[11px] text-slate-600">Sangat Prioritas (&gt;0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-[11px] text-slate-600">Prioritas Sedang (0.4–0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="text-[11px] text-slate-600">Prioritas Rendah (&lt;0.4)</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when not calculated */}
      {!isCalculated && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-[30]">
          <div className="text-center p-6 bg-white/80 border border-slate-200 rounded-2xl shadow-xl backdrop-blur-md">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            <p className="text-sm text-slate-800 font-medium">Peta Kabupaten Jember</p>
            <p className="text-xs text-slate-500 mt-1">Klik "Hitung Prioritas" untuk memulai simulasi</p>
          </div>
        </div>
      )}
    </div>
  );
}
