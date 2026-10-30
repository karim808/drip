import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, Check, Store, Info } from 'lucide-react';
import { calculateGeoDistanceKm, getCairoAreaName } from '../../data/mockData';
import { Vendor } from '../../types';

interface LocationPickerMapProps {
  vendor: Vendor;
  initialCoordinates?: { lat: number; lng: number };
  onLocationSelected: (coords: { lat: number; lng: number }, areaName: string, calculatedDistanceKm: number) => void;
  currentAddressDetail: string;
  onAddressDetailChange: (detail: string) => void;
  calculatedFee: number;
}

// Famous Cairo districts for quick one-tap snapping
const CAIRO_PRESETS = [
  { name: 'التجمع الخامس', lat: 30.0131, lng: 31.4289 },
  { name: 'المعادي ودجلة', lat: 29.9602, lng: 31.2785 },
  { name: 'الزمالك', lat: 30.0626, lng: 31.2224 },
  { name: 'مصر الجديدة والكوربة', lat: 30.0886, lng: 31.3283 },
  { name: 'مدينة نصر', lat: 30.0561, lng: 31.3301 },
  { name: 'الشيخ زايد', lat: 30.0221, lng: 30.9833 },
  { name: 'الدقي والمهندسين', lat: 30.0385, lng: 31.2125 },
  { name: 'الرحاب', lat: 30.0650, lng: 31.4950 },
];

// Helper sub-component to pan the map dynamically
function MapPanController({ target }: { target: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(target);
    }
  }, [map, target.lat, target.lng]);
  return null;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  vendor,
  initialCoordinates,
  onLocationSelected,
  currentAddressDetail,
  onAddressDetailChange,
  calculatedFee,
}) => {
  const defaultCoords = initialCoordinates || { lat: 30.0131, lng: 31.4289 }; // Default New Cairo
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(defaultCoords);
  const [selectedArea, setSelectedArea] = useState<string>(getCairoAreaName(defaultCoords.lat, defaultCoords.lng));
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const vendorCoords = vendor.coordinates || { lat: 29.9602, lng: 31.2785 }; // Default Maadi if none
  const directDistanceKm = calculateGeoDistanceKm(
    vendorCoords.lat,
    vendorCoords.lng,
    selectedCoords.lat,
    selectedCoords.lng
  );
  const roadDistanceKm = Math.max(1.5, Math.round(directDistanceKm * 1.25 * 10) / 10);

  const updateLocation = (newCoords: { lat: number; lng: number }) => {
    setSelectedCoords(newCoords);
    const areaName = getCairoAreaName(newCoords.lat, newCoords.lng);
    setSelectedArea(areaName);
    const directDist = calculateGeoDistanceKm(
      vendorCoords.lat,
      vendorCoords.lng,
      newCoords.lat,
      newCoords.lng
    );
    const roadDist = Math.max(1.5, Math.round(directDist * 1.25 * 10) / 10);
    onLocationSelected(newCoords, areaName, roadDist);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('خاصية تحديد الموقع غير مدعومة في متصفحك.');
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        updateLocation(coords);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setGpsError('تعذر الحصول على إحداثيات GPS. يمكنك النقر على الخريطة مباشرة.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      {/* Header bar with GPS button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.03] p-3 rounded-lg border border-white/10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#898A8B] block">
            نظام تحديد موقع التوصيل الحقيقي (GPS / Map)
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-4 h-4 text-white shrink-0" />
            <span className="text-xs font-bold text-white">{selectedArea}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseGps}
          disabled={isLocating}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#D1FE17] text-[#131517] rounded text-xs font-medium hover:bg-white transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'جاري تحديد GPS...' : 'موقعي الحالي عبر GPS'}</span>
        </button>
      </div>

      {gpsError && (
        <div className="text-[11px] text-amber-300 bg-amber-400/10 px-2.5 py-1.5 rounded border border-amber-400/25">
          {gpsError}
        </div>
      )}

      {/* Quick area shortcuts for Cairo */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <span className="text-[#898A8B] whitespace-nowrap text-[10px] uppercase font-mono pl-1">سريع:</span>
        {CAIRO_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => updateLocation({ lat: preset.lat, lng: preset.lng })}
            className={`px-2.5 py-1 rounded border whitespace-nowrap transition text-xs ${
              selectedArea.includes(preset.name.slice(0, 5))
                ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17] font-bold'
                : 'bg-[#1A1C1F] text-white/80 border-white/10 hover:border-white/25'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Interactive Google Map Container */}
      <div className="relative w-full h-[260px] rounded-lg overflow-hidden border border-white/15 shadow-inner bg-white/[0.06]">
        <Map
          mapId={'DEMO_MAP_ID'}
          defaultZoom={13}
          defaultCenter={selectedCoords}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={(e) => {
            if (e.detail?.latLng) {
              updateLocation({
                lat: e.detail.latLng.lat,
                lng: e.detail.latLng.lng,
              });
            }
          }}
        >
          <MapPanController target={selectedCoords} />

          {/* Vendor Shop Marker */}
          <AdvancedMarker position={vendorCoords} title={`متجر ${vendor.name}`}>
            <div className="flex items-center gap-1 bg-[#D1FE17] text-[#131517] text-[10px] font-bold px-2 py-1 rounded shadow-md border border-white">
              <Store className="w-3 h-3 text-[#D1FE17]" />
              <span>{vendor.name}</span>
            </div>
          </AdvancedMarker>

          {/* Customer Dropoff Marker */}
          <AdvancedMarker
            position={selectedCoords}
            title="موقع التوصيل الخاص بك"
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-[#D1FE17] text-[#131517] text-[11px] font-bold px-2.5 py-1 rounded shadow-lg border border-white/25 flex items-center gap-1 animate-bounce">
                <MapPin className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>موقع التوصيل</span>
              </div>
              <div className="w-2 h-2 bg-[#131517] rotate-45 -mt-1" />
            </div>
          </AdvancedMarker>
        </Map>

        {/* Map Overlay helper badge */}
        <div className="absolute bottom-2 right-2 bg-[#1A1C1F]/95 backdrop-blur-xs px-2.5 py-1.5 rounded border border-white/10 shadow-sm text-[10px] text-white/80 pointer-events-none flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-white" />
          <span>انقر في أي مكان على الخريطة لتغيير مكان الاستلام بدقة</span>
        </div>
      </div>

      {/* Live Distance & Calculations Card */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/[0.03] p-2.5 rounded border border-white/10">
          <span className="text-[10px] text-[#898A8B] block">المسافة الحقيقية من المتجر</span>
          <span className="text-sm font-bold tracking-tight text-white font-mono">
            {roadDistanceKm} كم
          </span>
          <span className="text-[10px] text-[#898A8B] block mt-0.5">من {vendor.area}</span>
        </div>

        <div className="bg-white/[0.03] p-2.5 rounded border border-white/10">
          <span className="text-[10px] text-[#898A8B] block">تكلفة الشحن السريع المحسوبة</span>
          <span className="text-sm font-bold tracking-tight text-[#D1FE17] font-mono">
            {calculatedFee.toLocaleString('ar-EG')} ج.م
          </span>
          <span className="text-[10px] text-[#898A8B] block mt-0.5">وصول سريع خلال 30-45 دقيقة</span>
        </div>
      </div>

      {/* Building, Street, and Apartment Details */}
      <div>
        <label className="block text-[11px] font-bold text-white mb-1">
          تفاصيل المبنى / الشارع / رقم الشقة والدور:
        </label>
        <input
          type="text"
          value={currentAddressDetail}
          onChange={(e) => onAddressDetailChange(e.target.value)}
          placeholder="مثال: عمارة 12، شارع 9، الدور الثالث، شقة 5"
          className="w-full bg-[#1A1C1F] border border-white/10 rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#D1FE17] text-white"
          required
        />
        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#898A8B]">
          <Info className="w-3 h-3 text-[#898A8B]" />
          <span>تم تحديد الإحداثيات: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
