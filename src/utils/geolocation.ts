/**
 * Fast & Bulletproof Geolocation & Reverse Geocoding Utility
 * Supports GPS with automatic IP Geolocation fallback & Nominatim reverse geocoding
 */

export interface ResolvedLocation {
  coords: { lat: number; lng: number };
  address: string;
  areaName: string;
  source: 'gps' | 'network' | 'ip' | 'preset';
}

// Comprehensive Egyptian locations database (Cairo, Giza, Alexandria, Delta, Canal)
const EGYPT_PRESETS = [
  // Cairo
  { nameAr: 'الزمالك، القاهرة', nameEn: 'Zamalek, Cairo', lat: 30.0626, lng: 31.2224 },
  { nameAr: 'المعادي ودجلة، القاهرة', nameEn: 'Maadi & Degla, Cairo', lat: 29.9602, lng: 31.2785 },
  { nameAr: 'التجمع الخامس، القاهرة الجديدة', nameEn: 'New Cairo, 5th Settlement', lat: 30.0131, lng: 31.4289 },
  { nameAr: 'مصر الجديدة والكوربة، القاهرة', nameEn: 'Heliopolis & Korba, Cairo', lat: 30.0886, lng: 31.3283 },
  { nameAr: 'مدينة نصر، القاهرة', nameEn: 'Nasr City, Cairo', lat: 30.0561, lng: 31.3301 },
  { nameAr: 'وسط البلد والتحرير، القاهرة', nameEn: 'Downtown Cairo, Tahrir', lat: 30.0444, lng: 31.2357 },
  { nameAr: 'الرحاب ومدينتي، القاهرة', nameEn: 'Rehab & Madinaty, Cairo', lat: 30.0650, lng: 31.4950 },
  { nameAr: 'الشروق وبدر، القاهرة', nameEn: 'Shorouk & Badr, Cairo', lat: 30.1250, lng: 31.6250 },
  { nameAr: 'شبرا والمظلات، القاهرة', nameEn: 'Shubra, Cairo', lat: 30.1022, lng: 31.2483 },

  // Giza
  { nameAr: 'الدقي والمهندسين، الجيزة', nameEn: 'Dokki & Mohandessin, Giza', lat: 30.0385, lng: 31.2125 },
  { nameAr: 'الشيخ زايد وأكتوبر، الجيزة', nameEn: 'Sheikh Zayed & 6th October', lat: 30.0221, lng: 30.9833 },
  { nameAr: 'الهرم وفيصل، الجيزة', nameEn: 'Haram & Faisal, Giza', lat: 29.9982, lng: 31.1856 },
  { nameAr: 'العجوزة وإمبابة، الجيزة', nameEn: 'Agouza & Imbaba, Giza', lat: 30.0575, lng: 31.2136 },

  // Alexandria
  { nameAr: 'الشاطبي وسيدي جابر، الإسكندرية', nameEn: 'Shatby & Sidi Gaber, Alexandria', lat: 31.2089, lng: 29.9234 },
  { nameAr: 'سموحة ومحرم بك، الإسكندرية', nameEn: 'Smouha & Moharam Bek, Alexandria', lat: 31.2001, lng: 29.9492 },
  { nameAr: 'لوران وجليم، الإسكندرية', nameEn: 'Loran & Glim, Alexandria', lat: 31.2460, lng: 29.9720 },
  { nameAr: 'المنشية وبحري، الإسكندرية', nameEn: 'Mansheya & Bahary, Alexandria', lat: 31.1990, lng: 29.8960 },
  { nameAr: 'ميامي والمندرة، الإسكندرية', nameEn: 'Miami & Mandara, Alexandria', lat: 31.2720, lng: 30.0080 },
  { nameAr: 'العجمي والبيطاش، الإسكندرية', nameEn: 'Agami & Bitash, Alexandria', lat: 31.1150, lng: 29.7650 },

  // Other Governorates
  { nameAr: 'طنطا، الغربية', nameEn: 'Tanta, Gharbia', lat: 30.7865, lng: 31.0004 },
  { nameAr: 'المنصورة، الدقهلية', nameEn: 'Mansoura, Dakahlia', lat: 31.0409, lng: 31.3785 },
  { nameAr: 'الزقازيق، الشرقية', nameEn: 'Zagazig, Sharqia', lat: 30.5877, lng: 31.5020 },
  { nameAr: 'بنها، القليوبية', nameEn: 'Banha, Qalyubia', lat: 30.4660, lng: 31.1850 },
  { nameAr: 'بورسعيد', nameEn: 'Port Said', lat: 31.2653, lng: 32.3019 },
  { nameAr: 'السويس', nameEn: 'Suez', lat: 29.9668, lng: 32.5498 },
  { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', lat: 30.5965, lng: 32.2715 },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function findClosestPreset(lat: number, lng: number, isArabic: boolean = true) {
  let closest = EGYPT_PRESETS[0];
  let minDistance = Infinity;

  for (const preset of EGYPT_PRESETS) {
    const dist = calculateDistanceKm(lat, lng, preset.lat, preset.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = preset;
    }
  }

  return {
    name: isArabic ? closest.nameAr : closest.nameEn,
    distanceKm: minDistance,
  };
}

/**
 * Reverse Geocodes coordinates using OpenStreetMap Nominatim with BigDataCloud and Offline fallback
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
  isArabic: boolean = true
): Promise<{ address: string; areaName: string }> {
  const lang = isArabic ? 'ar' : 'en';

  // 1. Try Nominatim OpenStreetMap
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`,
      {
        headers: { 'User-Agent': 'FastDripECommerce/2.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.footway || '';
      const district =
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.hamlet ||
        addr.village ||
        '';
      const city = addr.city || addr.town || addr.municipality || addr.state || '';

      const parts = [road, district, city].filter(Boolean);
      // Remove duplicate names if district and city are the same
      const uniqueParts = parts.filter((v, i, a) => a.indexOf(v) === i);

      if (uniqueParts.length > 0) {
        const areaName = [district, city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join('، ') || uniqueParts[0];
        return {
          address: uniqueParts.join('، '),
          areaName: areaName || uniqueParts[0],
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocoding skipped:', err);
  }

  // 2. Try BigDataCloud
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const locality = bdcData.locality || bdcData.city || '';
      const state = bdcData.principalSubdivision || '';
      const parts = [locality, state].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

      if (parts.length > 0) {
        return {
          address: parts.join('، '),
          areaName: locality || state,
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocoding skipped:', err);
  }

  // 3. Fallback to closest known Egyptian district
  const preset = findClosestPreset(lat, lng, isArabic);
  return {
    address: `${preset.name} (إحداثيات ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    areaName: preset.name,
  };
}

/**
 * Fetch approximate location from IP
 */
async function fetchIpLocation(): Promise<{ lat: number; lng: number; city: string; region: string } | null> {
  // Provider 1: ipwho.is
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || '',
          region: data.region || '',
        };
      }
    }
  } catch (err) {
    console.warn('ipwho.is lookup failed:', err);
  }

  // Provider 2: freeipapi.com
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          city: data.cityName || '',
          region: data.regionName || '',
        };
      }
    }
  } catch (err) {
    console.warn('freeipapi lookup failed:', err);
  }

  return null;
}

/**
 * Primary user location resolver
 * 1. Tries Browser Geolocation (with fast timeout to avoid freezing)
 * 2. If blocked, unavailable, or times out -> Automatically falls back to IP Geolocation
 * 3. Reverse geocodes to accurate Arabic street/district name
 */
export async function resolveUserLocation(isArabic: boolean = true): Promise<ResolvedLocation> {
  // Step 1: Try Browser Geolocation
  let browserCoords: { lat: number; lng: number } | null = null;
  let source: 'gps' | 'network' | 'ip' | 'preset' = 'gps';

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      browserCoords = await new Promise((resolve) => {
        // Fast timeout of 4000ms: if device has no GPS satellite fix, immediately fallback without hanging!
        const timer = setTimeout(() => {
          resolve(null);
        }, 4500);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timer);
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => {
            clearTimeout(timer);
            console.warn('Browser geolocation denied or error:', err.message);
            resolve(null);
          },
          // Important: enableHighAccuracy: false is much faster and works on desktop / Wi-Fi without GPS satellite locks!
          { enableHighAccuracy: false, timeout: 4000, maximumAge: 300000 }
        );
      });
    } catch {
      browserCoords = null;
    }
  }

  let finalCoords: { lat: number; lng: number };

  if (browserCoords) {
    finalCoords = browserCoords;
    source = 'gps';
  } else {
    // Step 2: Fallback to IP Geolocation
    const ipData = await fetchIpLocation();
    if (ipData && ipData.lat && ipData.lng) {
      finalCoords = { lat: ipData.lat, lng: ipData.lng };
      source = 'ip';
    } else {
      // Step 3: Default fallback to Zamalek, Cairo
      finalCoords = { lat: 30.0626, lng: 31.2224 };
      source = 'preset';
    }
  }

  // Step 3: Reverse geocode to exact human-readable address
  const geoResult = await reverseGeocodeLocation(finalCoords.lat, finalCoords.lng, isArabic);

  return {
    coords: finalCoords,
    address: geoResult.address,
    areaName: geoResult.areaName,
    source,
  };
}
