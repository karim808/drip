import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import {
  Flame,
  Bike,
  Store,
  UserPlus,
  Sparkles,
  ExternalLink,
  Navigation,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Compass,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { Driver, Order, Vendor } from '../../types';
import { calculateGeoDistanceKm } from '../../data/mockData';

declare const google: any;

export interface CairoHotspotZone {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  baselineWeeklyOrders: number;
  liveOrderCount: number;
  totalOrderDensity: number;
  activeDriversInZone: number;
  storesInZone: number;
  orderToDriverRatio: number;
  recommendedNewDrivers: number;
  priorityLevel: 'critical' | 'moderate' | 'balanced';
  peakHours: string;
  subPoints: Array<{ lat: number; lng: number; weight: number }>;
}

interface GroundedPlace {
  title: string;
  uri: string;
  snippet?: string;
}

interface GroundingResponse {
  zoneName: string;
  coordinates: { lat: number; lng: number };
  analysis: string;
  places: GroundedPlace[];
  model: string;
  grounded: boolean;
  notice?: string;
}

const CAIRO_BASE_ZONES: Array<{
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  baselineWeeklyOrders: number;
  peakHours: string;
  spreadOffsets: Array<{ dLat: number; dLng: number; weight: number }>;
}> = [
  {
    id: 'tagamoa',
    name: 'التجمع الخامس (القاهرة الجديدة)',
    shortName: 'التجمع الخامس',
    lat: 30.0155,
    lng: 31.4385,
    baselineWeeklyOrders: 42,
    peakHours: '6:00 م – 11:30 م',
    spreadOffsets: [
      { dLat: 0.008, dLng: 0.012, weight: 0.95 },
      { dLat: -0.006, dLng: 0.009, weight: 0.85 },
      { dLat: 0.004, dLng: -0.011, weight: 0.8 },
      { dLat: -0.009, dLng: -0.007, weight: 0.75 },
    ],
  },
  {
    id: 'maadi',
    name: 'المعادي ودجلة',
    shortName: 'المعادي',
    lat: 29.9602,
    lng: 31.2785,
    baselineWeeklyOrders: 38,
    peakHours: '5:00 م – 11:00 م',
    spreadOffsets: [
      { dLat: 0.005, dLng: -0.008, weight: 0.92 },
      { dLat: -0.004, dLng: 0.006, weight: 0.85 },
      { dLat: 0.007, dLng: 0.004, weight: 0.78 },
    ],
  },
  {
    id: 'zamalek',
    name: 'الزمالك وشارع 26 يوليو',
    shortName: 'الزمالك',
    lat: 30.0626,
    lng: 31.2224,
    baselineWeeklyOrders: 31,
    peakHours: '4:00 م – 10:30 م',
    spreadOffsets: [
      { dLat: 0.004, dLng: -0.003, weight: 0.9 },
      { dLat: -0.005, dLng: 0.002, weight: 0.82 },
    ],
  },
  {
    id: 'heliopolis',
    name: 'مصر الجديدة والكوربة',
    shortName: 'مصر الجديدة',
    lat: 30.0886,
    lng: 31.3283,
    baselineWeeklyOrders: 34,
    peakHours: '6:30 م – 11:30 م',
    spreadOffsets: [
      { dLat: 0.005, dLng: 0.006, weight: 0.88 },
      { dLat: -0.004, dLng: -0.005, weight: 0.8 },
      { dLat: 0.003, dLng: -0.007, weight: 0.75 },
    ],
  },
  {
    id: 'nasr_city',
    name: 'مدينة نصر (عباس العقاد ومكرم عبيد)',
    shortName: 'مدينة نصر',
    lat: 30.0561,
    lng: 31.3301,
    baselineWeeklyOrders: 29,
    peakHours: '5:30 م – 11:00 م',
    spreadOffsets: [
      { dLat: 0.006, dLng: 0.008, weight: 0.84 },
      { dLat: -0.005, dLng: 0.004, weight: 0.76 },
    ],
  },
  {
    id: 'zayed',
    name: 'الشيخ زايد وأركان',
    shortName: 'الشيخ زايد',
    lat: 30.0221,
    lng: 30.9833,
    baselineWeeklyOrders: 35,
    peakHours: '7:00 م – 12:00 ص',
    spreadOffsets: [
      { dLat: 0.007, dLng: 0.009, weight: 0.9 },
      { dLat: -0.006, dLng: -0.008, weight: 0.82 },
      { dLat: 0.004, dLng: -0.006, weight: 0.78 },
    ],
  },
  {
    id: 'dokki',
    name: 'الدقي والمهندسين',
    shortName: 'المهندسين',
    lat: 30.0445,
    lng: 31.2065,
    baselineWeeklyOrders: 22,
    peakHours: '4:30 م – 10:00 م',
    spreadOffsets: [
      { dLat: 0.005, dLng: -0.004, weight: 0.72 },
      { dLat: -0.004, dLng: 0.005, weight: 0.68 },
    ],
  },
];

// Synchronized Canvas2D Thermal Heatmap Layer rendered over the Google Map
function ThermalHeatmapOverlay({
  zones,
  visible,
  radiusScale,
  filterMode,
}: {
  zones: CairoHotspotZone[];
  visible: boolean;
  radiusScale: number;
  filterMode: 'all' | 'deficit_only';
}) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!map) return;

    const mapDiv = map.getDiv() as HTMLElement;
    if (!mapDiv) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    mapDiv.appendChild(canvas);
    canvasRef.current = canvas;

    const renderHeatmap = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const rect = mapDiv.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      if (!visible) return;

      const bounds = map.getBounds();
      const zoom = map.getZoom() || 11;
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const latSpan = ne.lat() - sw.lat();
      const lngSpan = ne.lng() - sw.lng();
      if (latSpan <= 0 || lngSpan <= 0) return;

      const zoomFactor = Math.pow(1.22, zoom - 11);
      const basePixelRadius = Math.max(32, Math.min(140, 56 * zoomFactor * radiusScale));

      const maxDensity = Math.max(...zones.map((z) => z.totalOrderDensity), 1);

      const activeZones =
        filterMode === 'deficit_only'
          ? zones.filter((z) => z.priorityLevel !== 'balanced')
          : zones;

      for (const zone of activeZones) {
        const normalizedIntensity = Math.min(1, Math.max(0.35, zone.totalOrderDensity / maxDensity));

        const allPoints = [
          { lat: zone.lat, lng: zone.lng, weight: normalizedIntensity },
          ...zone.subPoints.map((sp) => ({
            lat: sp.lat,
            lng: sp.lng,
            weight: normalizedIntensity * sp.weight * 0.78,
          })),
        ];

        for (const pt of allPoints) {
          const x = ((pt.lng - sw.lng()) / lngSpan) * width;
          const y = ((ne.lat() - pt.lat) / latSpan) * height;

          if (x < -basePixelRadius || x > width + basePixelRadius || y < -basePixelRadius || y > height + basePixelRadius) {
            continue;
          }

          const r = basePixelRadius * (0.75 + pt.weight * 0.45);
          const grad = ctx.createRadialGradient(x, y, r * 0.06, x, y, r);

          if (zone.priorityLevel === 'critical') {
            grad.addColorStop(0, `rgba(185, 28, 28, ${0.68 * pt.weight})`);
            grad.addColorStop(0.35, `rgba(239, 68, 68, ${0.52 * pt.weight})`);
            grad.addColorStop(0.68, `rgba(249, 115, 22, ${0.32 * pt.weight})`);
            grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
          } else if (zone.priorityLevel === 'moderate') {
            grad.addColorStop(0, `rgba(234, 88, 12, ${0.62 * pt.weight})`);
            grad.addColorStop(0.4, `rgba(245, 158, 11, ${0.45 * pt.weight})`);
            grad.addColorStop(0.75, `rgba(250, 204, 21, ${0.25 * pt.weight})`);
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          } else {
            grad.addColorStop(0, `rgba(16, 185, 129, ${0.55 * pt.weight})`);
            grad.addColorStop(0.5, `rgba(52, 211, 153, ${0.32 * pt.weight})`);
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    renderHeatmap();

    const listeners = [
      map.addListener('bounds_changed', renderHeatmap),
      map.addListener('zoom_changed', renderHeatmap),
      map.addListener('center_changed', renderHeatmap),
      map.addListener('idle', renderHeatmap),
    ];

    window.addEventListener('resize', renderHeatmap);

    return () => {
      for (const l of listeners) {
        if (l && typeof l.remove === 'function') l.remove();
      }
      window.removeEventListener('resize', renderHeatmap);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, zones, visible, radiusScale, filterMode]);

  return null;
}

// Helper to pan/zoom map when admin selects a hotspot zone
function MapZoneFocuser({ target }: { target: { lat: number; lng: number; zoom?: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    try {
      map.panTo({ lat: target.lat, lng: target.lng });
      if (target.zoom) {
        map.setZoom(target.zoom);
      }
    } catch (err) {
      console.warn('Pan error:', err);
    }
  }, [map, target]);

  return null;
}

interface AdminOrderDensityHeatmapProps {
  orders: Order[];
  drivers: Driver[];
  vendors: Vendor[];
  onSwitchToDriversSection?: () => void;
}

export const AdminOrderDensityHeatmap: React.FC<AdminOrderDensityHeatmapProps> = ({
  orders,
  drivers,
  vendors,
  onSwitchToDriversSection,
}) => {
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(true);
  const [showDriversMarkers, setShowDriversMarkers] = useState(true);
  const [showVendorsMarkers, setShowVendorsMarkers] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'deficit_only'>('all');
  const [radiusScale, setRadiusScale] = useState<number>(1.15);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('tagamoa');
  const [mapFocusTarget, setMapFocusTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Gemini Maps Grounding state
  const [groundingLoading, setGroundingLoading] = useState(false);
  const [groundingData, setGroundingData] = useState<GroundingResponse | null>(null);
  const [customGroundingQuery, setCustomGroundingQuery] = useState('');

  // Compute Cairo Order Density + Driver Supply/Deficit per Zone
  const hotspotZones = useMemo<CairoHotspotZone[]>(() => {
    const activeDriversList = drivers.filter((d) => d.status === 'active');

    return CAIRO_BASE_ZONES.map((base) => {
      // Count live orders associated with this zone (by customer coordinates, vendor coordinates, or area name)
      let liveCount = 0;
      const dynamicSubPoints = base.spreadOffsets.map((off) => ({
        lat: base.lat + off.dLat,
        lng: base.lng + off.dLng,
        weight: off.weight,
      }));

      for (const ord of orders) {
        if (ord.status === 'cancelled' || ord.status === 'cancelled_by_vendor') continue;
        const custCoord = ord.customerCoordinates;
        const vendCoord = ord.vendorCoordinates;

        const nearCust =
          custCoord && calculateGeoDistanceKm(base.lat, base.lng, custCoord.lat, custCoord.lng) <= 5.5;
        const nearVend =
          vendCoord && calculateGeoDistanceKm(base.lat, base.lng, vendCoord.lat, vendCoord.lng) <= 5.5;
        const matchName =
          ord.customerArea.includes(base.shortName) ||
          base.name.includes(ord.customerArea);

        if (nearCust || nearVend || matchName) {
          liveCount += 1;
          if (custCoord && nearCust) {
            dynamicSubPoints.push({ lat: custCoord.lat, lng: custCoord.lng, weight: 0.95 });
          }
        }
      }

      // Count active drivers within 6.5 km of this zone center
      const driversInZone = activeDriversList.filter((drv) => {
        if (!drv.coordinates) return false;
        return calculateGeoDistanceKm(base.lat, base.lng, drv.coordinates.lat, drv.coordinates.lng) <= 6.5;
      }).length;

      // Count active stores within 6.5 km of this zone center
      const storesInZone = vendors.filter((v) => {
        if (!v.coordinates) return v.area.includes(base.shortName);
        return calculateGeoDistanceKm(base.lat, base.lng, v.coordinates.lat, v.coordinates.lng) <= 6.5;
      }).length;

      const totalOrderDensity = base.baselineWeeklyOrders + liveCount * 4;
      const effectiveDrivers = Math.max(0, driversInZone);
      // Ideal ratio: 1 active driver per ~10 weekly hotspot order units
      const idealDrivers = Math.max(2, Math.ceil(totalOrderDensity / 10));
      const deficit = Math.max(0, idealDrivers - effectiveDrivers);
      const ratio = effectiveDrivers > 0 ? Math.round(totalOrderDensity / effectiveDrivers) : totalOrderDensity;

      let priorityLevel: 'critical' | 'moderate' | 'balanced' = 'balanced';
      if (deficit >= 3 || (effectiveDrivers === 0 && totalOrderDensity >= 25)) {
        priorityLevel = 'critical';
      } else if (deficit >= 1) {
        priorityLevel = 'moderate';
      }

      return {
        id: base.id,
        name: base.name,
        shortName: base.shortName,
        lat: base.lat,
        lng: base.lng,
        baselineWeeklyOrders: base.baselineWeeklyOrders,
        liveOrderCount: liveCount,
        totalOrderDensity,
        activeDriversInZone: effectiveDrivers,
        storesInZone,
        orderToDriverRatio: ratio,
        recommendedNewDrivers: deficit,
        priorityLevel,
        peakHours: base.peakHours,
        subPoints: dynamicSubPoints,
      };
    }).sort((a, b) => b.recommendedNewDrivers - a.recommendedNewDrivers || b.totalOrderDensity - a.totalOrderDensity);
  }, [orders, drivers, vendors]);

  const selectedZone = useMemo(
    () => hotspotZones.find((z) => z.id === selectedZoneId) || hotspotZones[0],
    [hotspotZones, selectedZoneId]
  );

  const totalRecommendedHires = useMemo(
    () => hotspotZones.reduce((acc, z) => acc + z.recommendedNewDrivers, 0),
    [hotspotZones]
  );

  const criticalZonesCount = useMemo(
    () => hotspotZones.filter((z) => z.priorityLevel === 'critical').length,
    [hotspotZones]
  );

  const handleSelectZone = (zone: CairoHotspotZone) => {
    setSelectedZoneId(zone.id);
    setMapFocusTarget({ lat: zone.lat, lng: zone.lng, zoom: 13 });
  };

  const fetchMapsGroundingForZone = async (zone: CairoHotspotZone, customPrompt?: string) => {
    setGroundingLoading(true);
    try {
      const response = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: zone.name,
          lat: zone.lat,
          lng: zone.lng,
          orderVolume: zone.totalOrderDensity,
          activeDrivers: zone.activeDriversInZone,
          neededDrivers: zone.recommendedNewDrivers,
          customQuery: customPrompt?.trim() || '',
        }),
      });
      const data = await response.json();
      setGroundingData(data);
    } catch (error) {
      console.error('Maps grounding request failed:', error);
    } finally {
      setGroundingLoading(false);
    }
  };

  // Automatically load grounded recruitment intelligence for top critical zone on mount
  useEffect(() => {
    if (selectedZone && !groundingData && !groundingLoading) {
      fetchMapsGroundingForZone(selectedZone);
    }
  }, [selectedZone?.id]);

  return (
    <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden shadow-xs">
      {/* Header Banner */}
      <div className="bg-[#131517] text-white p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-red-600 border border-red-500 text-red-400">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              خريطة الكثافة الحرارية للطلبات وتوجيه توظيف الطيارين (Order Density Heatmap)
            </h3>
            <span className="text-[10px] font-mono bg-[#D1FE17]/10 text-[#D1FE17] border border-[#D1FE17]/40 px-2 py-0.5 rounded">
              Google Maps + Gemini 3.8 Grounding
            </span>
          </div>
          <p className="text-xs text-[#898A8B]">
            تحليل مكاني فوري لمناطق تركز الطلبات مقارنة بتواجد الطيارين النشطين لتحديد الأحياء ذات الأولوية القصوى لتعيين كباتن جدد
          </p>
        </div>

        {/* Top KPI Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#131517] border border-white/10 px-3 py-1.5 rounded-md text-right">
            <span className="text-[10px] text-[#898A8B] block">مناطق عجز حاد بالأسطول</span>
            <span className="text-sm font-bold text-red-400 tabular-nums">
              {criticalZonesCount} مناطق ساخنة
            </span>
          </div>
          <div className="bg-[#131517] border border-white/10 px-3 py-1.5 rounded-md text-right">
            <span className="text-[10px] text-[#898A8B] block">إجمالي التوظيف المقترح فوراً</span>
            <span className="text-sm font-bold text-[#D1FE17] tabular-nums">
              +{totalRecommendedHires} طيار جديد
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="bg-white/[0.03] border-b border-white/10 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Heatmap Layer */}
          <button
            type="button"
            onClick={() => setShowHeatmapLayer(!showHeatmapLayer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold border transition-colors ${
              showHeatmapLayer
                ? 'bg-red-600 text-white border-red-500 shadow-xs'
                : 'bg-[#1A1C1F] text-white/80 border-white/15 hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{showHeatmapLayer ? 'طبقة الكثافة الحرارية: مفعّلة' : 'تفعيل طبقة الكثافة الحرارية'}</span>
          </button>

          {/* Filter Mode: All vs High Recruitment Deficit */}
          <div className="flex items-center bg-[#1A1C1F] border border-white/15 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#D1FE17] text-[#131517] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              جميع المناطق ({hotspotZones.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('deficit_only')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterMode === 'deficit_only'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              مناطق عجز الطيارين فقط
            </button>
          </div>

          {/* Toggle Active Drivers Pins */}
          <button
            type="button"
            onClick={() => setShowDriversMarkers(!showDriversMarkers)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
              showDriversMarkers
                ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17]'
                : 'bg-[#1A1C1F] text-white/70 border-white/15 hover:bg-white/10'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-[#D1FE17]" />
            <span>الطيارون النشطون ({drivers.filter((d) => d.status === 'active').length})</span>
          </button>

          {/* Toggle Stores Pins */}
          <button
            type="button"
            onClick={() => setShowVendorsMarkers(!showVendorsMarkers)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
              showVendorsMarkers
                ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17]'
                : 'bg-[#1A1C1F] text-white/70 border-white/15 hover:bg-white/10'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-300" />
            <span>البراندات ({vendors.length})</span>
          </button>
        </div>

        {/* Heatmap Radius Slider */}
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#898A8B]" />
          <label htmlFor="heatmap-radius-range" className="text-[11px] text-white/70 font-medium">
            نطاق التوهج الحراري:
          </label>
          <input
            id="heatmap-radius-range"
            type="range"
            min="0.7"
            max="1.6"
            step="0.15"
            value={radiusScale}
            onChange={(e) => setRadiusScale(parseFloat(e.target.value))}
            className="w-24 accent-red-400 cursor-pointer"
          />
          <button
            type="button"
            onClick={() => setMapFocusTarget({ lat: 30.0444, lng: 31.2857, zoom: 11 })}
            className="text-[11px] bg-[#1A1C1F] hover:bg-white/10 text-white/80 border border-white/15 px-2.5 py-1 rounded font-medium flex items-center gap-1"
          >
            <Compass className="w-3 h-3" />
            <span>عرض القاهرة بالكامل</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Map Canvas (Left/Center) + Recruitment Priority & Grounding Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Interactive Google Map with Thermal Heatmap Overlay */}
        <div className="lg:col-span-7 relative h-[460px] lg:h-[560px] bg-white/[0.06] border-b lg:border-b-0 lg:border-l border-white/10">
          <Map
            mapId={'DEMO_MAP_ID'}
            defaultZoom={11}
            defaultCenter={{ lat: 30.038, lng: 31.305 }}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <MapZoneFocuser target={mapFocusTarget} />
            <ThermalHeatmapOverlay
              zones={hotspotZones}
              visible={showHeatmapLayer}
              radiusScale={radiusScale}
              filterMode={filterMode}
            />

            {/* Hotspot Zone Badges (Interactive AdvancedMarkers) */}
            {hotspotZones
              .filter((z) => (filterMode === 'deficit_only' ? z.priorityLevel !== 'balanced' : true))
              .map((zone) => {
                const isSelected = zone.id === selectedZone?.id;
                const badgeBg =
                  zone.priorityLevel === 'critical'
                    ? 'bg-red-600 border-red-500/50 text-white'
                    : zone.priorityLevel === 'moderate'
                    ? 'bg-amber-400 border-amber-400/25 text-white'
                    : 'bg-[#D1FE17] border-[#D1FE17]/25 text-[#131517]';

                return (
                  <AdvancedMarker
                    key={zone.id}
                    position={{ lat: zone.lat, lng: zone.lng }}
                    title={`${zone.name} - كثافة: ${zone.totalOrderDensity} طلب`}
                    onClick={() => handleSelectZone(zone)}
                  >
                    <div
                      onClick={() => handleSelectZone(zone)}
                      className={`cursor-pointer transition-transform ${
                        isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                      }`}
                    >
                      <div
                        className={`px-2.5 py-1 rounded-full border-2 shadow-lg flex items-center gap-1.5 text-[11px] font-bold ${badgeBg} ${
                          isSelected ? 'ring-4 ring-[#D1FE17]' : ''
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 shrink-0" />
                        <span>{zone.shortName}</span>
                        <span className="font-mono bg-black/25 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                          {zone.totalOrderDensity} طلب
                        </span>
                        {zone.recommendedNewDrivers > 0 && (
                          <span className="bg-[#1A1C1F] text-red-400 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                            وظّف +{zone.recommendedNewDrivers}
                          </span>
                        )}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Active Driver Markers */}
            {showDriversMarkers &&
              drivers
                .filter((d) => d.status === 'active' && d.coordinates)
                .map((drv) => (
                  <AdvancedMarker
                    key={drv.id}
                    position={drv.coordinates!}
                    title={`الطيار: ${drv.name} (${drv.vehicle})`}
                  >
                    <div className="flex items-center gap-1 bg-[#D1FE17] text-[#131517] px-2 py-0.5 rounded-full border border-[#D1FE17] shadow-md text-[10px] font-bold">
                      <Bike className="w-3 h-3 text-[#D1FE17] shrink-0" />
                      <span>{drv.name.split(' ')[0]}</span>
                    </div>
                  </AdvancedMarker>
                ))}

            {/* Vendor Store Markers */}
            {showVendorsMarkers &&
              vendors
                .filter((v) => v.coordinates)
                .map((vendor) => (
                  <AdvancedMarker
                    key={vendor.id}
                    position={vendor.coordinates!}
                    title={`متجر: ${vendor.name} (${vendor.area})`}
                  >
                    <div className="flex items-center gap-1 bg-[#1A1C1F] text-white px-2 py-0.5 rounded border border-white/25 shadow-sm text-[10px] font-bold">
                      <Store className="w-3 h-3 text-white/80 shrink-0" />
                      <span>{vendor.name}</span>
                    </div>
                  </AdvancedMarker>
                ))}
          </Map>

          {/* Thermal Gradient Legend Overlay */}
          <div className="absolute bottom-3 right-3 z-10 bg-[#1A1C1F]/95 backdrop-blur-xs border border-white/10 rounded-lg p-2.5 shadow-md text-[11px] space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-400" />
              <span>مؤشر الكثافة الحرارية واحتياج التوظيف</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#898A8B]">منخفض</span>
              <div
                className="h-2.5 w-36 rounded-full"
                style={{
                  background:
                    'linear-gradient(to left, #991b1b, #ef4444, #f97316, #facc15, #10b981)',
                }}
              />
              <span className="text-[10px] font-bold text-red-400">ذروة حرجة (عجز طيارين)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recruitment Priority Ranking + Gemini Maps Grounding */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#1A1C1F]">
          {/* Zone Priority List */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-red-400" />
                <span>ترتيب المناطق حسب أولوية توظيف الطيارين</span>
              </h4>
              <span className="text-[11px] text-[#898A8B]">انقر على أي منطقة لتحليلها</span>
            </div>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-0.5">
              {hotspotZones.map((zone) => {
                const isSelected = zone.id === selectedZone?.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      handleSelectZone(zone);
                      fetchMapsGroundingForZone(zone);
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                      isSelected
                        ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17] shadow-xs'
                        : 'bg-white/[0.03] hover:bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{zone.name}</span>
                        {zone.priorityLevel === 'critical' && (
                          <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                            أولوية قصوى
                          </span>
                        )}
                        {zone.priorityLevel === 'moderate' && (
                          <span className="bg-amber-400 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                            أولوية متوسطة
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] flex items-center gap-2 ${
                          isSelected ? 'text-white/80' : 'text-[#898A8B]'
                        }`}
                      >
                        <span>الكثافة: {zone.totalOrderDensity} طلب</span>
                        <span>·</span>
                        <span>الطيارون الحاليون: {zone.activeDriversInZone}</span>
                        <span>·</span>
                        <span>الذروة: {zone.peakHours}</span>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      {zone.recommendedNewDrivers > 0 ? (
                        <div className="inline-flex items-center gap-1 bg-red-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-md">
                          <UserPlus className="w-3 h-3" />
                          <span>وظّف +{zone.recommendedNewDrivers} طيار</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 bg-[#D1FE17] text-[#131517] font-bold text-[11px] px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تغطية مكتملة</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gemini 3.8 Flash + Google Maps Grounding Recruitment Advisor */}
          <div className="p-4 bg-white/[0.03] flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D1FE17]" />
                  <h4 className="font-bold text-xs text-white">
                    مستشار التمركز والتوظيف الميداني (Google Maps Grounding)
                  </h4>
                </div>
                <button
                  type="button"
                  disabled={groundingLoading || !selectedZone}
                  onClick={() => selectedZone && fetchMapsGroundingForZone(selectedZone, customGroundingQuery)}
                  className="text-[11px] bg-[#D1FE17] hover:bg-white disabled:opacity-50 text-[#131517] px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${groundingLoading ? 'animate-spin' : ''}`} />
                  <span>تحديث من خرائط جوجل</span>
                </button>
              </div>

              {/* Custom Admin Grounding Query Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customGroundingQuery}
                  onChange={(e) => setCustomGroundingQuery(e.target.value)}
                  placeholder={`اسأل خرائط جوجل عن ${selectedZone?.shortName || 'المنطقة'} (مثال: أفضل شوارع تمركز الطيارين)...`}
                  className="flex-1 bg-[#1A1C1F] border border-white/15 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D1FE17]"
                />
                <button
                  type="button"
                  disabled={groundingLoading || !selectedZone}
                  onClick={() => selectedZone && fetchMapsGroundingForZone(selectedZone, customGroundingQuery)}
                  className="bg-[#D1FE17] hover:bg-white disabled:opacity-50 text-[#131517] font-bold px-3 py-1.5 rounded-md text-xs shrink-0 cursor-pointer"
                >
                  بحث مكاني
                </button>
              </div>

              {/* Grounding Output Box */}
              <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-3 text-xs space-y-2.5 max-h-[210px] overflow-y-auto">
                {groundingLoading ? (
                  <div className="py-6 text-center text-[#898A8B] space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#D1FE17]" />
                    <div>جاري استعلام Google Maps Grounding عبر gemini-3.8-flash لمنطقة {selectedZone?.name}...</div>
                  </div>
                ) : groundingData ? (
                  <>
                    <div className="flex items-center justify-between text-[11px] text-[#898A8B] border-b border-white/10 pb-1.5">
                      <span className="font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {groundingData.zoneName}
                      </span>
                      <span className="font-mono text-[10px] text-[#D1FE17] bg-[#D1FE17]/10 px-1.5 py-0.5 rounded">
                        {groundingData.model}
                      </span>
                    </div>

                    <div className="text-white/80 leading-relaxed whitespace-pre-line text-[11px]">
                      {groundingData.analysis}
                    </div>

                    {/* Grounded Google Maps Place Links */}
                    {groundingData.places && groundingData.places.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="text-[10px] font-bold text-[#898A8B]">
                          روابط ومواقع مرجعية من خرائط جوجل (Google Maps Sources):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {groundingData.places.map((place, idx) => (
                            <a
                              key={idx}
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-white/[0.06] hover:bg-white/10 hover:text-white text-white/90 border border-white/15 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                            >
                              <Navigation className="w-3 h-3 text-[#D1FE17] shrink-0" />
                              <span>{place.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
              <div className="text-white/70 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>
                  المنطقة الأعلى عجزاً الآن: <strong className="text-white">{hotspotZones[0]?.name}</strong> (+{hotspotZones[0]?.recommendedNewDrivers} طيار)
                </span>
              </div>
              {onSwitchToDriversSection && (
                <button
                  type="button"
                  onClick={onSwitchToDriversSection}
                  className="text-[#D1FE17] hover:text-[#D1FE17] font-bold underline cursor-pointer shrink-0"
                >
                  إدارة وتفعيل الطيارين ←
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
