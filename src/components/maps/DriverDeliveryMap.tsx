import React, { useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { ExternalLink, Navigation, Store, User, Compass, Route } from 'lucide-react';

declare const google: any;

interface DriverDeliveryMapProps {
  origin: {
    lat: number;
    lng: number;
    label: string;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    label: string;
    address: string;
  };
  distanceKm: number;
  orderNumber: string;
  heightClassName?: string;
}

// Sub-component to fit both markers in view automatically
function BoundsFitter({
  origin,
  destination,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    } catch (e) {
      console.warn('Bounds fitting error:', e);
    }
  }, [map, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
}

// Sub-component to draw crisp polyline route connecting pickup & dropoff
function RoutePolyline({
  origin,
  destination,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      const polyline = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: '#09090b',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      });

      return () => {
        polyline.setMap(null);
      };
    } catch (e) {
      console.warn('Polyline error:', e);
    }
  }, [map, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
}

export const DriverDeliveryMap: React.FC<DriverDeliveryMapProps> = ({
  origin,
  destination,
  distanceKm,
  orderNumber,
  heightClassName = 'h-[280px]',
}) => {
  // Estimated driving time: ~2 mins per KM in Cairo urban traffic
  const estimatedMins = Math.round(distanceKm * 2.2);

  // External Google Maps turn-by-turn navigation URL
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;

  const midPoint = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#1A1C1F] shadow-xs">
      {/* Route Header Info */}
      <div className="p-3 bg-[#131517] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-[#D1FE17]" />
          <span className="text-xs font-bold tracking-tight">مسار التوصيل الملاحي الحي ({orderNumber})</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-[#1C1E21] text-white/90 px-2 py-0.5 rounded text-[11px] font-bold">
            {distanceKm} كم
          </span>
          <span className="text-[#D1FE17] font-bold text-[11px]">
            ~{estimatedMins} دقيقة
          </span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className={`relative w-full ${heightClassName} bg-white/[0.06]`}>
        <Map
          mapId={'DEMO_MAP_ID'}
          defaultZoom={12}
          defaultCenter={midPoint}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <BoundsFitter origin={origin} destination={destination} />
          <RoutePolyline origin={origin} destination={destination} />

          {/* Store / Pickup Marker */}
          <AdvancedMarker position={origin} title={`استلام من: ${origin.label}`}>
            <div className="flex items-center gap-1.5 bg-[#D1FE17] text-[#131517] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg border border-white/25">
              <Store className="w-3.5 h-3.5 text-[#D1FE17] shrink-0" />
              <span>استلام: {origin.label}</span>
            </div>
          </AdvancedMarker>

          {/* Customer / Dropoff Marker */}
          <AdvancedMarker position={destination} title={`تسليم لـ: ${destination.label}`}>
            <div className="flex items-center gap-1.5 bg-[#1A1C1F] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg border border-[#D1FE17]">
              <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>تسليم: {destination.label}</span>
            </div>
          </AdvancedMarker>
        </Map>

        {/* Legend Overlay */}
        <div className="absolute top-2 right-2 bg-[#1A1C1F]/95 backdrop-blur-xs px-2.5 py-1 rounded border border-white/10 shadow-sm text-[10px] text-white/80 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D1FE17]"></span>
            <span>نقطة الاستلام</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>نقطة التسليم</span>
          </div>
        </div>
      </div>

      {/* Addresses breakdown and Action to Open External Google Maps Navigation */}
      <div className="p-3 bg-white/[0.03] border-t border-white/10 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#1A1C1F] p-2 rounded border border-white/10">
            <span className="text-[10px] font-mono text-[#898A8B] uppercase block">نقطة الاستلام (المحل)</span>
            <span className="font-bold text-white block truncate">{origin.label}</span>
            <span className="text-[11px] text-white/70 truncate block">{origin.address}</span>
          </div>

          <div className="bg-[#1A1C1F] p-2 rounded border border-white/10">
            <span className="text-[10px] font-mono text-[#898A8B] uppercase block">نقطة التسليم (العميل)</span>
            <span className="font-bold text-white block truncate">{destination.label}</span>
            <span className="text-[11px] text-white/70 truncate block">{destination.address}</span>
          </div>
        </div>

        {/* Primary Navigation Button for the Driver */}
        <a
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#D1FE17] text-[#131517] font-bold py-2.5 px-4 rounded-md text-xs hover:bg-white transition active:scale-[0.99] shadow-sm text-center"
        >
          <Navigation className="w-4 h-4 text-[#D1FE17]" />
          <span>فتح المسار والملاحة الحية في Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </div>
  );
};
