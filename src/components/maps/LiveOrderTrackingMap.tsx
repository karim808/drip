import React, { useEffect, useMemo, useState } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import {
  Bike,
  Navigation,
  Store,
  User,
  ExternalLink,
  Phone,
  Clock,
  Compass,
  Route,
  Zap,
  Play,
  Pause,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Order, Driver } from '../../types';
import { calculateGeoDistanceKm } from '../../data/mockData';

declare const google: any;

interface LiveOrderTrackingMapProps {
  order: Order;
  driver?: Driver;
  heightClassName?: string;
  autoExpand?: boolean;
}

// Sub-component to fit Store, Driver, and Customer in map view
function LiveBoundsFitter({
  origin,
  driverPos,
  destination,
}: {
  origin: { lat: number; lng: number };
  driverPos: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(driverPos);
      bounds.extend(destination);
      map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    } catch (e) {
      console.warn('Map bounds error:', e);
    }
  }, [map, origin.lat, origin.lng, driverPos.lat, driverPos.lng, destination.lat, destination.lng]);

  return null;
}

// Sub-component to draw both the completed route (Store -> Driver) and remaining route (Driver -> Customer)
function LiveRoutePolylines({
  origin,
  driverPos,
  destination,
}: {
  origin: { lat: number; lng: number };
  driverPos: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      // 1. Completed Path: Store to Driver (muted dashed/thin line)
      const completedPath = new google.maps.Polyline({
        path: [origin, driverPos],
        geodesic: true,
        strokeColor: '#71717a', // zinc-500
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map,
      });

      // 2. Active Remaining Path: Driver to Customer (bold dark/emerald line)
      const activePath = new google.maps.Polyline({
        path: [driverPos, destination],
        geodesic: true,
        strokeColor: '#09090b', // zinc-950
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map,
      });

      return () => {
        completedPath.setMap(null);
        activePath.setMap(null);
      };
    } catch (e) {
      console.warn('Live polyline error:', e);
    }
  }, [map, origin.lat, origin.lng, driverPos.lat, driverPos.lng, destination.lat, destination.lng]);

  return null;
}

export const LiveOrderTrackingMap: React.FC<LiveOrderTrackingMapProps> = ({
  order,
  driver,
  heightClassName = 'h-[300px]',
}) => {
  // 1. Resolve Store coordinates
  const origin = useMemo(() => {
    if (order.vendorCoordinates) return order.vendorCoordinates;
    return { lat: 29.9602, lng: 31.2785 }; // Default Cairo / Maadi
  }, [order.vendorCoordinates]);

  // 2. Resolve Customer coordinates
  const destination = useMemo(() => {
    if (order.customerCoordinates) return order.customerCoordinates;
    return { lat: 30.0255, lng: 31.4580 }; // Default Tagamoa
  }, [order.customerCoordinates]);

  // 3. Resolve Real-time Driver GPS position from PlatformContext driver
  const initialDriverPos = useMemo(() => {
    if (driver?.coordinates) return driver.coordinates;
    // Calculate midway point between store and customer if not set
    return {
      lat: origin.lat * 0.45 + destination.lat * 0.55,
      lng: origin.lng * 0.45 + destination.lng * 0.55,
    };
  }, [driver?.coordinates, origin, destination]);

  // Live Driver location state (supports real-time simulated motion)
  const [currentDriverPos, setCurrentDriverPos] = useState(initialDriverPos);
  const [isSimulatingMotion, setIsSimulatingMotion] = useState(true);

  // Sync if driver coordinates in context change
  useEffect(() => {
    if (driver?.coordinates) {
      setCurrentDriverPos(driver.coordinates);
    }
  }, [driver?.coordinates]);

  // Real-time GPS movement simulation: slowly moves the driver along the trajectory toward the customer
  useEffect(() => {
    if (!isSimulatingMotion) return;

    const interval = setInterval(() => {
      setCurrentDriverPos((prev) => {
        // Move 1.5% closer to destination every 3 seconds to demonstrate real-time GPS tracking
        const step = 0.012;
        const newLat = prev.lat + (destination.lat - prev.lat) * step;
        const newLng = prev.lng + (destination.lng - prev.lng) * step;

        // If very close to customer, hold or loop gently
        const dist = Math.hypot(destination.lat - newLat, destination.lng - newLng);
        if (dist < 0.001) {
          return prev;
        }

        return { lat: newLat, lng: newLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulatingMotion, destination.lat, destination.lng]);

  // Calculate live remaining distance from driver to customer
  const remainingDistanceKm = useMemo(() => {
    const raw = calculateGeoDistanceKm(
      currentDriverPos.lat,
      currentDriverPos.lng,
      destination.lat,
      destination.lng
    );
    return Math.max(0.3, parseFloat(raw.toFixed(1)));
  }, [currentDriverPos, destination]);

  // Estimated driving time remaining in minutes (~2 mins per KM in Cairo urban streets)
  const estimatedRemainingMins = Math.max(2, Math.round(remainingDistanceKm * 2.2));

  // External Google Maps navigation URL
  const googleMapsLiveUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentDriverPos.lat},${currentDriverPos.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;

  const driverDisplayName = driver?.name || order.driverName || 'كابتن التوصيل';
  const driverDisplayAvatar =
    driver?.avatarPhoto ||
    order.driverAvatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80';
  const driverVehicleName = driver?.vehicle || order.driverVehicle || 'سكوتر توصيل سريع';
  const driverPlateNumber = driver?.vehicleNumber || order.driverVehicleNumber || 'س ب د ٩٥١';

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#1A1C1F] shadow-xs animate-in fade-in duration-200">
      {/* Live Tracking Header Bar */}
      <div className="bg-[#131517] text-white p-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D1FE17] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D1FE17]"></span>
          </span>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>تتبع الكابتن المباشر على الخريطة (Live GPS)</span>
            </div>
            <div className="text-[10px] text-[#898A8B]">
              الطلب {order.orderNumber} · استلم القطعة وفي الطريق إليك
            </div>
          </div>
        </div>

        {/* Live Metrics: Remaining KM & ETA */}
        <div className="flex items-center gap-2">
          <div className="bg-[#131517] border border-white/10 px-2 py-0.5 rounded text-center">
            <span className="text-[10px] text-[#898A8B] block leading-tight">المسافة المتبقية</span>
            <span className="text-xs font-bold text-[#D1FE17] font-mono tabular-nums">
              {remainingDistanceKm} كم
            </span>
          </div>

          <div className="bg-[#131517] border border-white/10 px-2 py-0.5 rounded text-center">
            <span className="text-[10px] text-[#898A8B] block leading-tight">وقت الوصول التقديري</span>
            <span className="text-xs font-bold text-white font-mono tabular-nums">
              ~{estimatedRemainingMins} دقيقة
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className={`relative w-full ${heightClassName} bg-white/[0.06]`}>
        <Map
          mapId={'DEMO_MAP_ID'}
          defaultZoom={13}
          defaultCenter={currentDriverPos}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <LiveBoundsFitter origin={origin} driverPos={currentDriverPos} destination={destination} />
          <LiveRoutePolylines origin={origin} driverPos={currentDriverPos} destination={destination} />

          {/* 1. Store Marker */}
          <AdvancedMarker position={origin} title={`المتجر: ${order.vendorName}`}>
            <div className="flex items-center gap-1.5 bg-[#D1FE17] text-[#131517] text-[11px] font-bold px-2 py-1 rounded shadow-md border border-white/25">
              <Store className="w-3.5 h-3.5 text-white/80 shrink-0" />
              <span>{order.vendorName}</span>
            </div>
          </AdvancedMarker>

          {/* 2. LIVE DRIVER POSITION MARKER (Pulsing & Interactive) */}
          <AdvancedMarker position={currentDriverPos} title={`موقع الكابتن الحي: ${driverDisplayName}`}>
            <div className="relative group cursor-pointer">
              {/* Radar pulse ring */}
              <div className="absolute -inset-2 bg-[#D1FE17] rounded-full animate-ping pointer-events-none"></div>

              <div className="relative flex items-center gap-1.5 bg-[#D1FE17] text-[#131517] px-2.5 py-1.5 rounded-full border-2 border-[#D1FE17] shadow-xl">
                <img
                  src={driverDisplayAvatar}
                  alt={driverDisplayName}
                  className="w-6 h-6 rounded-full object-cover border border-white/15 shrink-0"
                />
                <div className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-[#D1FE17]" />
                  <span className="text-[11px] font-bold">{driverDisplayName}</span>
                </div>
                <span className="bg-[#D1FE17] text-[#131517] text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  متحرك
                </span>
              </div>
            </div>
          </AdvancedMarker>

          {/* 3. Customer Destination Marker */}
          <AdvancedMarker position={destination} title={`عنوانك: ${order.customerArea}`}>
            <div className="flex items-center gap-1.5 bg-[#1A1C1F] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-lg border border-red-500">
              <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>عنوانك: {order.customerArea}</span>
            </div>
          </AdvancedMarker>
        </Map>

        {/* Floating Top Controls Overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={() => setIsSimulatingMotion(!isSimulatingMotion)}
            title={isSimulatingMotion ? 'إيقاف محاكاة الحركة مؤقتاً' : 'تفعيل محاكاة حركة الطيار الحي'}
            className="bg-[#1A1C1F]/95 backdrop-blur-xs text-white/90 hover:text-white px-2.5 py-1 rounded border border-white/10 text-[10px] font-bold shadow-xs flex items-center gap-1"
          >
            {isSimulatingMotion ? (
              <>
                <Pause className="w-3 h-3 text-amber-300" />
                <span>إيقاف الحركة</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#D1FE17]" />
                <span>محاكاة الحركة</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-2 left-2 bg-[#1A1C1F]/95 backdrop-blur-xs px-2.5 py-1 rounded border border-white/10 shadow-xs text-[10px] text-white/80 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/25"></span>
            <span>المتجر</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D1FE17] animate-pulse"></span>
            <span>الطيار (GPS)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>عنوانك</span>
          </div>
        </div>
      </div>

      {/* Driver Card & Google Maps External Navigation Strip */}
      <div className="p-3 bg-white/[0.03] border-t border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={driverDisplayAvatar}
              alt={driverDisplayName}
              className="w-9 h-9 rounded-full object-cover border border-white/15"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">{driverDisplayName}</span>
                <span className="text-[10px] bg-white/10 text-white/90 font-mono px-1.5 py-0.2 rounded border border-white/15">
                  {driverPlateNumber}
                </span>
              </div>
              <div className="text-[11px] text-[#898A8B]">{driverVehicleName}</div>
            </div>
          </div>

          {order.driverPhone && (
            <a
              href={`tel:${order.driverPhone}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#D1FE17] hover:bg-white text-[#131517] rounded font-bold text-xs shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>اتصال بالكابتن</span>
            </a>
          )}
        </div>

        {/* Direct Google Maps Navigation Button */}
        <a
          href={googleMapsLiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#D1FE17] hover:bg-white text-[#131517] font-bold py-2 px-3 rounded-md text-xs transition active:scale-[0.99] shadow-xs text-center"
        >
          <Navigation className="w-3.5 h-3.5 text-[#D1FE17]" />
          <span>فتح خط السير المباشر في Google Maps</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>
    </div>
  );
};
