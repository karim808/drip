import React, { useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Store, LocateFixed, ShoppingBag } from 'lucide-react';

interface PartnerStore {
  name: string;
  vendorId?: string;
  location: string;
  time: string;
  image: string;
  code: string;
  slug: string;
}

export const STORE_COORDINATES: Record<string, { lat: number; lng: number; areaAr: string }> = {
  "UNTITLED CAIRO": { lat: 29.9602, lng: 31.2785, areaAr: "المعادي - دجلة" },
  "SHABAB CO.": { lat: 30.0626, lng: 31.2224, areaAr: "الزمالك" },
  "ZAG STORE": { lat: 30.0131, lng: 31.4289, areaAr: "التجمع الخامس" },
  "OVERSIZED EG": { lat: 30.0886, lng: 31.3283, areaAr: "مصر الجديدة والكوربة" },
  "NOIR ATELIER": { lat: 30.0221, lng: 30.9833, areaAr: "الشيخ زايد - أركان" },
};

function CoverageMapPanController({
  target,
  stores,
}: {
  target: { lat: number; lng: number };
  stores: PartnerStore[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      if (typeof google !== 'undefined' && google.maps) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(target);
        // Include all 5 Cairo partner stores to give the perfect city-wide framing
        for (const s of stores) {
          const coord = STORE_COORDINATES[s.name];
          if (coord) bounds.extend(coord);
        }
        map.fitBounds(bounds, { top: 80, bottom: 80, left: 80, right: 80 });
      } else {
        map.panTo({ lat: 30.0444, lng: 31.2357 });
        map.setZoom(11);
      }
    } catch {
      map.panTo(target);
    }
  }, [map, target.lat, target.lng, stores]);

  return null;
}

interface CoverageRadarMapProps {
  stores: PartnerStore[];
  activeCoords: { lat: number; lng: number };
  closestStore: PartnerStore;
  closestDistanceKm: number;
  closestEta: string;
  selectedStore?: PartnerStore | null;
  onSelectStore?: (store: PartnerStore) => void;
  selectedDistanceKm?: number;
  selectedEta?: string;
  locationName: string;
  isArabic: boolean;
  onOpenStore: (store: PartnerStore) => void;
  onAutoDetectGps?: () => void;
  onOpenManualSearch?: () => void;
  isGpsLoading?: boolean;
}

export const CoverageRadarMap: React.FC<CoverageRadarMapProps> = ({
  stores,
  activeCoords,
  closestStore,
  closestDistanceKm,
  closestEta,
  selectedStore,
  onSelectStore,
  selectedDistanceKm,
  selectedEta,
  locationName,
  isArabic,
  onOpenStore,
  onAutoDetectGps,
  onOpenManualSearch,
  isGpsLoading = false,
}) => {
  const displayStore = selectedStore || closestStore;
  const displayDistance = selectedDistanceKm ?? closestDistanceKm;
  const displayEta = selectedEta ?? closestEta;
  const isDisplayClosest = displayStore.name === closestStore.name;

  return (
    <div className="coverage-map-wrapper relative w-full h-[460px] md:h-[580px] overflow-hidden border border-[var(--line)] bg-[#0C0F0E]">
      <Map
        mapId={'FAST_DRIP_COVERAGE_GRID'}
        defaultZoom={11}
        defaultCenter={{ lat: 30.0444, lng: 31.2357 }}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        colorScheme={'DARK'}
        style={{ width: '100%', height: '100%' }}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        <CoverageMapPanController target={activeCoords} stores={stores} />

        {/* 1. All Partner Store Markers */}
        {stores.map((store) => {
          const coord = STORE_COORDINATES[store.name];
          if (!coord) return null;
          const isClosest = store.name === closestStore.name;
          const isSelected = selectedStore ? store.name === selectedStore.name : isClosest;

          return (
            <AdvancedMarker
              key={store.name}
              position={coord}
              title={`${store.name} (${store.location})`}
              onClick={() => {
                if (onSelectStore) {
                  onSelectStore(store);
                } else {
                  onOpenStore(store);
                }
              }}
            >
              <div
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isSelected ? 'z-30 scale-105' : isClosest ? 'z-20' : 'z-10'
                }`}
              >
                {/* Nearest or Selected Store Glow */}
                {(isClosest || isSelected) && (
                  <div className={`absolute -inset-2 rounded-full blur-md pointer-events-none ${
                    isSelected ? 'bg-[#D1FE17]/60 animate-pulse' : 'bg-[#D1FE17]/30'
                  }`} />
                )}

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-xl border transition-all ${
                    isSelected
                      ? 'bg-[#D1FE17] text-[#131517] border-white font-extrabold shadow-[0_0_24px_rgba(209,254,23,0.7)]'
                      : isClosest
                      ? 'bg-[#18201A] text-[#D1FE17] border-[#D1FE17] font-bold shadow-[0_0_15px_rgba(209,254,23,0.3)]'
                      : 'bg-[#151817]/95 text-white border-white/20 hover:border-[#D1FE17]'
                  }`}
                >
                  <Store className={`w-3.5 h-3.5 ${isSelected ? 'text-[#131517]' : 'text-[#D1FE17]'}`} />
                  <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                    {store.name}
                  </span>
                  {isClosest && (
                    <span className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold ${
                      isSelected ? 'bg-[#131517] text-[#D1FE17]' : 'bg-[#D1FE17] text-[#131517]'
                    }`}>
                      {isArabic ? 'الأقرب' : 'NEAREST'}
                    </span>
                  )}
                </div>

                {/* Pin pointer */}
                <div
                  className={`w-2 h-2 rotate-45 -mt-1 ${
                    isSelected ? 'bg-[#D1FE17]' : isClosest ? 'bg-[#18201A] border-r border-b border-[#D1FE17]' : 'bg-[#151817]'
                  }`}
                />
              </div>
            </AdvancedMarker>
          );
        })}

        {/* 2. Customer Location Marker */}
        <AdvancedMarker position={activeCoords} title={locationName}>
          <div className="relative flex flex-col items-center z-40">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131517] text-[#D1FE17] border border-[#D1FE17] rounded shadow-lg text-[10px] font-mono font-bold whitespace-nowrap">
              <LocateFixed className="w-3 h-3 text-[#D1FE17] animate-spin" />
              <span>{isArabic ? 'موقع التوصيل الخاص بك' : 'Your Delivery Location'}</span>
            </div>
            <div className="w-3 h-3 bg-[#D1FE17] rounded-full border-2 border-[#131517] shadow-[0_0_12px_#D1FE17] mt-0.5" />
          </div>
        </AdvancedMarker>
      </Map>

      {/* 3. Floating Tactical Radar HUD - Synchronized with Selected / Nearest Store */}
      <div className="map-closest-hud">
        <div className="hud-badge">
          <span className="hud-pulse" />
          <span>
            {isDisplayClosest
              ? (isArabic ? '⚡ أقرب متجر لموقعك' : '⚡ NEAREST STORE TO YOU')
              : (isArabic ? '📍 المتجر المحدد' : '📍 SELECTED PARTNER STORE')}
          </span>
        </div>

        <div className="hud-title">
          <strong>{displayStore.name}</strong>
          <span>
            {displayDistance} كم • {isArabic ? `توصيل لبابك خلال ${displayEta}` : `Delivery in ${displayEta}`}
          </span>
        </div>

        <div className="hud-btns">
          <button
            type="button"
            className="hud-go-btn"
            onClick={() => onOpenStore(displayStore)}
            title={isArabic ? `تصفح منتجات متجر ${displayStore.name}` : `Browse ${displayStore.name} storefront`}
          >
            <ShoppingBag size={13} className="inline mr-1" />
            <span>
              {isArabic ? `زيارة ستور ${displayStore.name} ➔` : `Visit ${displayStore.name} Store ➔`}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Bottom-Left Current Location Tag */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
        {onAutoDetectGps && (
          <button
            type="button"
            disabled={isGpsLoading}
            onClick={onAutoDetectGps}
            className="map-location"
            style={{ cursor: 'pointer', border: 'none' }}
            title={isArabic ? 'انقر لتحديث موقعك عبر GPS' : 'Click to auto-detect location via GPS'}
          >
            <LocateFixed size={14} className={isGpsLoading ? 'animate-spin' : ''} />
            <span className="truncate max-w-[160px] md:max-w-[220px]">{locationName}</span>
          </button>
        )}
        {onOpenManualSearch && (
          <button
            type="button"
            onClick={onOpenManualSearch}
            className="px-2 py-1.5 bg-[#141816]/90 hover:bg-[#D1FE17] text-[#D1FE17] hover:text-[#0C0F0E] border border-[#232A26] rounded-md text-[10px] font-mono font-bold transition-all shadow-md"
            title={isArabic ? 'تغيير المنطقة يدوياً' : 'Change location manually'}
          >
            {isArabic ? 'تغيير' : 'CHANGE'}
          </button>
        )}
      </div>
    </div>
  );
};
