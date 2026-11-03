import React, { useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Store, LocateFixed, Navigation, ShoppingBag, ArrowRight } from 'lucide-react';

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
  closestCoord,
}: {
  target: { lat: number; lng: number };
  closestCoord?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      if (typeof google !== 'undefined' && google.maps && closestCoord) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(target);
        bounds.extend(closestCoord);
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      } else {
        map.panTo(target);
        map.setZoom(12);
      }
    } catch {
      map.panTo(target);
    }
  }, [map, target.lat, target.lng, closestCoord?.lat, closestCoord?.lng]);

  return null;
}

interface CoverageRadarMapProps {
  stores: PartnerStore[];
  activeCoords: { lat: number; lng: number };
  closestStore: PartnerStore;
  closestDistanceKm: number;
  closestEta: string;
  locationName: string;
  isArabic: boolean;
  onOpenStore: (store: PartnerStore) => void;
  onAutoDetectGps?: () => void;
  isGpsLoading?: boolean;
}

export const CoverageRadarMap: React.FC<CoverageRadarMapProps> = ({
  stores,
  activeCoords,
  closestStore,
  closestDistanceKm,
  closestEta,
  locationName,
  isArabic,
  onOpenStore,
  onAutoDetectGps,
  isGpsLoading = false,
}) => {
  const closestCoord = STORE_COORDINATES[closestStore.name];

  return (
    <div className="coverage-map-wrapper relative w-full h-[460px] md:h-[580px] overflow-hidden border border-[var(--line)] bg-[#0C0F0E]">
      <Map
        mapId={'FAST_DRIP_COVERAGE_GRID'}
        defaultZoom={12}
        defaultCenter={activeCoords}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        colorScheme={'DARK'}
        style={{ width: '100%', height: '100%' }}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        <CoverageMapPanController target={activeCoords} closestCoord={closestCoord} />

        {/* 1. All Partner Store Markers */}
        {stores.map((store) => {
          const coord = STORE_COORDINATES[store.name];
          if (!coord) return null;
          const isClosest = store.name === closestStore.name;

          return (
            <AdvancedMarker
              key={store.name}
              position={coord}
              title={`${store.name} (${store.location})`}
              onClick={() => onOpenStore(store)}
            >
              <div
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isClosest ? 'z-20' : 'z-10'
                }`}
              >
                {/* Nearest Store Beacon Glow */}
                {isClosest && (
                  <div className="absolute -inset-2 rounded-full bg-[#D1FE17]/30 blur-md animate-pulse pointer-events-none" />
                )}

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-xl border transition-all ${
                    isClosest
                      ? 'bg-[#D1FE17] text-[#131517] border-white font-extrabold shadow-[0_0_20px_rgba(209,254,23,0.5)]'
                      : 'bg-[#151817]/90 text-white border-white/20 hover:border-[#D1FE17]'
                  }`}
                >
                  <Store className={`w-3.5 h-3.5 ${isClosest ? 'text-[#131517]' : 'text-[#D1FE17]'}`} />
                  <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                    {store.name}
                  </span>
                  {isClosest && (
                    <span className="text-[9px] px-1 py-0.5 bg-[#131517] text-[#D1FE17] rounded font-mono font-bold">
                      {isArabic ? 'الأقرب' : 'CLOSEST'}
                    </span>
                  )}
                </div>

                {/* Pin pointer */}
                <div
                  className={`w-2 h-2 rotate-45 -mt-1 ${
                    isClosest ? 'bg-[#D1FE17]' : 'bg-[#151817]'
                  }`}
                />
              </div>
            </AdvancedMarker>
          );
        })}

        {/* 2. Customer Location Marker */}
        <AdvancedMarker position={activeCoords} title={locationName}>
          <div className="relative flex flex-col items-center z-30">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131517] text-[#D1FE17] border border-[#D1FE17] rounded shadow-lg text-[10px] font-mono font-bold whitespace-nowrap">
              <LocateFixed className="w-3 h-3 text-[#D1FE17] animate-spin" />
              <span>{isArabic ? 'موقعك للتوصيل' : 'Your Delivery Drop'}</span>
            </div>
            <div className="w-2.5 h-2.5 bg-[#D1FE17] rounded-full border-2 border-[#131517] shadow-[0_0_10px_#D1FE17] mt-0.5" />
          </div>
        </AdvancedMarker>
      </Map>

      {/* 3. Floating Tactical Radar HUD - Strictly Directing to the Online Store Only */}
      <div className="map-closest-hud">
        <div className="hud-badge">
          <span className="hud-pulse" />
          <span>{isArabic ? '⚡ أقرب متجر لموقعك' : '⚡ NEAREST STORE TO YOU'}</span>
        </div>

        <div className="hud-title">
          <strong>{closestStore.name}</strong>
          <span>
            {closestDistanceKm} كم • {isArabic ? `توصيل خلال ${closestEta}` : `Delivery in ${closestEta}`}
          </span>
        </div>

        <div className="hud-btns">
          <button
            type="button"
            className="hud-go-btn"
            onClick={() => onOpenStore(closestStore)}
            title={isArabic ? `تصفح منتجات متجر ${closestStore.name}` : `Browse ${closestStore.name} store`}
          >
            <ShoppingBag size={12} className="inline mr-1" />
            <span>
              {isArabic ? `زيارة ستور ${closestStore.name} ➔` : `Visit ${closestStore.name} Store ➔`}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Bottom-Left Current Location Tag */}
      {onAutoDetectGps ? (
        <button
          type="button"
          disabled={isGpsLoading}
          onClick={onAutoDetectGps}
          className="map-location"
          style={{ cursor: 'pointer', border: 'none' }}
          title={isArabic ? 'انقر لتحديد موقعك الحقيقي عبر GPS' : 'Click to auto-detect your location'}
        >
          <LocateFixed size={14} className={isGpsLoading ? 'animate-spin' : ''} />
          <span>{locationName}</span>
        </button>
      ) : (
        <span className="map-location">
          <LocateFixed size={14} /> {locationName}
        </span>
      )}
    </div>
  );
};
