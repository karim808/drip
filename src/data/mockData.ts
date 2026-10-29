import { CustomerUser, Driver, Order, PricingConfig, Product, SettlementRequest, Vendor } from '../types';

// Helper to generate crisp SVG receipts that look 100% realistic in preview
export function generateReceiptSvg(title: string, amount: number, ref: string, method: string, date: string): string {
  const isInstapay = method.toLowerCase().includes('insta');
  const primaryColor = isInstapay ? '#581C87' : '#DC2626'; // Purple for InstaPay or Red for Vodafone Cash
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%">
    <rect width="400" height="560" fill="#FFFFFF" rx="8" />
    <rect width="400" height="90" fill="${primaryColor}" />
    <circle cx="200" cy="90" r="32" fill="#FFFFFF" />
    <circle cx="200" cy="90" r="26" fill="${primaryColor}" />
    <path d="M192 90 L198 96 L209 84" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    
    <text x="200" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${isInstapay ? 'إيصال تحويل إنستاباي - InstaPay' : 'إيصال فودافون كاش - Vodafone Cash'}
    </text>
    <text x="200" y="68" font-family="sans-serif" font-size="12" fill="#F3E8FF" text-anchor="middle">
      تمت المعاملة بنجاح
    </text>
    
    <text x="200" y="150" font-family="sans-serif" font-size="14" fill="#71717A" text-anchor="middle">المبلغ المحول</text>
    <text x="200" y="195" font-family="sans-serif" font-size="34" font-weight="900" fill="#09090B" text-anchor="middle">${amount.toLocaleString('ar-EG')} ج.م</text>
    
    <line x1="40" y1="225" x2="360" y2="225" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="4" />
    
    <g transform="translate(40, 250)">
      <text x="320" y="15" font-family="sans-serif" font-size="13" fill="#71717A" text-anchor="end">الجهة المستفيدة</text>
      <text x="0" y="15" font-family="sans-serif" font-size="13" font-weight="bold" fill="#09090B" text-anchor="start">إدارة VOGUE FAST للخزينة</text>
      
      <text x="320" y="55" font-family="sans-serif" font-size="13" fill="#71717A" text-anchor="end">المرسل</text>
      <text x="0" y="55" font-family="sans-serif" font-size="13" font-weight="bold" fill="#09090B" text-anchor="start">${title}</text>
      
      <text x="320" y="95" font-family="sans-serif" font-size="13" fill="#71717A" text-anchor="end">رقم العملية المرجعي</text>
      <text x="0" y="95" font-family="monospace" font-size="12" font-weight="bold" fill="#2563EB" text-anchor="start">${ref}</text>
      
      <text x="320" y="135" font-family="sans-serif" font-size="13" fill="#71717A" text-anchor="end">تاريخ وساعة السداد</text>
      <text x="0" y="135" font-family="sans-serif" font-size="12" fill="#09090B" text-anchor="start">${date}</text>
      
      <text x="320" y="175" font-family="sans-serif" font-size="13" fill="#71717A" text-anchor="end">طريقة التحويل</text>
      <text x="0" y="175" font-family="sans-serif" font-size="12" font-weight="bold" fill="#16A34A" text-anchor="start">محفظة إلكترونية مباشرة</text>
    </g>
    
    <rect x="40" y="470" width="320" height="48" rx="6" fill="#F4F4F5" />
    <text x="200" y="500" font-family="sans-serif" font-size="11" fill="#71717A" text-anchor="middle">
      تم التأكيد عبر الشبكة القومية للمدفوعات اللحظية IPN
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Helper to generate National ID / License document mockup
export function generateIdDocSvg(title: string, sub: string, number: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" width="100%" height="100%">
    <rect width="420" height="260" fill="#F8FAFC" rx="10" stroke="#CBD5E1" stroke-width="2" />
    <rect x="0" y="0" width="420" height="42" fill="#0F172A" rx="10 10 0 0" />
    <text x="210" y="26" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">جمهورية مصر العربية - ${title}</text>
    
    <!-- Photo placeholder -->
    <rect x="25" y="65" width="100" height="130" fill="#E2E8F0" rx="6" stroke="#94A3B8" />
    <circle cx="75" cy="115" r="24" fill="#64748B" />
    <path d="M45 180 C45 150 105 150 105 180 Z" fill="#64748B" />
    
    <!-- Info -->
    <g transform="translate(145, 80)">
      <text x="250" y="16" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="end">${sub}</text>
      <text x="250" y="50" font-family="sans-serif" font-size="11" fill="#64748B" text-anchor="end">الرقم القومي / الترخيص:</text>
      <text x="250" y="75" font-family="monospace" font-size="15" font-weight="bold" fill="#0284C7" text-anchor="end">${number}</text>
      <text x="250" y="110" font-family="sans-serif" font-size="11" fill="#16A34A" text-anchor="end">✓ سارية ومفحوصة أمنياً</text>
    </g>
    
    <!-- Hologram strip -->
    <rect x="25" y="215" width="370" height="15" fill="#E0F2FE" rx="2" />
    <text x="210" y="226" font-family="monospace" font-size="9" fill="#0369A1" text-anchor="middle">EGYPTIAN OFFICIAL REGISTRATION DOCUMENT VERIFIED</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Initial Pricing Configuration
export const initialPricingConfig: PricingConfig = {
  baseFare: 35, // 35 EGP for base km
  baseKm: 3, // first 3 KM
  extraKmRate: 4.5, // 4.5 EGP per extra KM
  driverCommissionRate: 20, // 20% platform cut on delivery fee
  defaultVendorCommissionRate: 15, // 15% platform cut on clothing sale
  defaultVendorLimit: 5000, // 5,000 EGP default debt limit
  defaultDriverLimit: 1000, // 1,000 EGP default driver limit
  vodafoneCashNumber: '01099882244',
  instapayHandle: 'voguefast.vault@instapay',
  bankIban: 'EG380002000100000000012345678',
};

// Haversine formula to compute true distance between two coordinates in Kilometers
export function calculateGeoDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export function getCairoAreaName(lat: number, lng: number): string {
  const areas = [
    { name: 'التجمع الخامس (القاهرة الجديدة)', lat: 30.0131, lng: 31.4289 },
    { name: 'المعادي ودجلة', lat: 29.9602, lng: 31.2785 },
    { name: 'الزمالك', lat: 30.0626, lng: 31.2224 },
    { name: 'مصر الجديدة والكوربة', lat: 30.0886, lng: 31.3283 },
    { name: 'مدينة نصر', lat: 30.0561, lng: 31.3301 },
    { name: 'الشيخ زايد وأكتوبر', lat: 30.0221, lng: 30.9833 },
    { name: 'الدقي والمهندسين', lat: 30.0385, lng: 31.2125 },
    { name: 'وسط البلد والتحرير', lat: 30.0444, lng: 31.2357 },
    { name: 'الرحاب ومدينتي', lat: 30.0650, lng: 31.4950 },
    { name: 'الشروق', lat: 30.1250, lng: 31.6250 },
  ];

  let closest = areas[0];
  let minD = Infinity;
  for (const a of areas) {
    const dist = calculateGeoDistanceKm(lat, lng, a.lat, a.lng);
    if (dist < minD) {
      minD = dist;
      closest = a;
    }
  }
  return closest.name;
}

// Initial Customers
export const initialCustomers: CustomerUser[] = [
  {
    id: 'cust-1',
    name: 'كريم مجدي',
    phone: '01018301830',
    password: 'cust#1830',
    area: 'التجمع الخامس',
    address: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    coordinates: { lat: 30.0255, lng: 31.4580 },
    createdAt: '2026-10-15',
  },
  {
    id: 'cust-2',
    name: 'سارة طارق',
    phone: '01155443322',
    password: 'sara#3322',
    area: 'مصر الجديدة',
    address: 'عمارة 8، شارع بيروت، مصر الجديدة',
    coordinates: { lat: 30.0910, lng: 31.3340 },
    createdAt: '2026-10-20',
  },
];

// Initial Vendors (Egyptian Streetwear Brands)
export const initialVendors: Vendor[] = [
  {
    id: 'v-1',
    name: 'UNTITLED CAIRO',
    slug: 'untitled-cairo',
    phone: '01011223344',
    password: 'brand#2026',
    area: 'المعادي - دجلة',
    address: 'شارع 206، متفرع من دجلة المعادي، القاهرة',
    coordinates: { lat: 29.9602, lng: 31.2785 },
    category: 'Heavyweight Streetwear & Hoodies',
    logo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
    commissionRate: 15,
    debtLimit: 6000,
    currentDebt: 4200, // 70% of limit
    totalSales: 88500,
    status: 'active',
    hasPendingSettlement: true, // Has pending 3500 settlement
    pendingSettlementAmount: 3500,
    pendingSettlementRef: 'IPN-2026-993812',
    createdAt: '2026-09-12',
    instagramHandle: '@untitledcairo',
  },
  {
    id: 'v-2',
    name: 'SHABAB CO.',
    slug: 'shabab-co',
    phone: '01122334455',
    password: 'shabab#egypt',
    area: 'الزمالك',
    address: 'شارع حسن مظهر، بجوار كلية التربية النوعية، الزمالك',
    coordinates: { lat: 30.0626, lng: 31.2224 },
    category: 'Urban Cargo & Graphic Tees',
    logo: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=300&auto=format&fit=crop&q=80',
    commissionRate: 14,
    debtLimit: 5000,
    currentDebt: 4950, // 99% - Near limit warning
    totalSales: 64200,
    status: 'active',
    createdAt: '2026-09-18',
    instagramHandle: '@shabab.egypt',
  },
  {
    id: 'v-3',
    name: 'ZAG STORE',
    slug: 'zag-store',
    phone: '01233445566',
    password: 'zag!vault9',
    area: 'التجمع الخامس',
    address: 'شارع التسعين الشمالي، داون تاون مول، التجمع الخامس',
    coordinates: { lat: 30.0131, lng: 31.4289 },
    category: 'Caps, Bombers & Denim',
    logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80',
    commissionRate: 16,
    debtLimit: 5000,
    currentDebt: 5350, // OVER LIMIT -> FROZEN
    totalSales: 94000,
    status: 'frozen',
    hasPendingSettlement: true, // Pending 5350 settlement
    pendingSettlementAmount: 5350,
    pendingSettlementRef: 'VF-CASH-771829',
    createdAt: '2026-08-25',
    instagramHandle: '@zagstore.eg',
  },
  {
    id: 'v-4',
    name: 'OVERSIZED EG',
    slug: 'oversized-eg',
    phone: '01055667788',
    password: 'oversized@eg',
    area: 'مصر الجديدة - الكوربة',
    address: 'شارع بغداد، الكوربة، مصر الجديدة',
    coordinates: { lat: 30.0886, lng: 31.3283 },
    category: 'Boxy Fits & Casual Wear',
    logo: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&auto=format&fit=crop&q=80',
    commissionRate: 15,
    debtLimit: 4500,
    currentDebt: 1120, // 25% of limit
    totalSales: 41800,
    status: 'active',
    createdAt: '2026-10-02',
    instagramHandle: '@oversized.eg',
  },
  {
    id: 'v-5',
    name: 'NOIR ATELIER',
    slug: 'noir-atelier',
    phone: '01511223344',
    password: 'noir#atelier',
    area: 'الشيخ زايد - أركان',
    address: 'أركان بلازا، المحور المركزي، الشيخ زايد',
    coordinates: { lat: 30.0221, lng: 30.9833 },
    category: 'Luxury Minimalist Street Fashion',
    logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&auto=format&fit=crop&q=80',
    commissionRate: 18,
    debtLimit: 8000,
    currentDebt: 2400,
    totalSales: 112000,
    status: 'active',
    createdAt: '2026-07-14',
    instagramHandle: '@noir.atelier.eg',
  },
  {
    id: 'v-6',
    name: 'STREET VIBE CAIRO',
    slug: 'street-vibe-cairo',
    phone: '01099887766',
    password: 'vibe!2026',
    area: 'الدقي والمهندسين',
    address: 'ميدان المساحة، الدقي، الجيزة',
    coordinates: { lat: 30.0385, lng: 31.2125 },
    category: 'Vintage Washed & Skatewear',
    logo: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=300&auto=format&fit=crop&q=80',
    commissionRate: 15,
    debtLimit: 5000,
    currentDebt: 0,
    totalSales: 0,
    status: 'pending', // Pending Admin Onboarding approval
    createdAt: '2026-10-27',
    instagramHandle: '@streetvibe_cairo',
  },
];

// Initial Drivers
export const initialDrivers: Driver[] = [
  {
    id: 'd-1',
    name: 'كابتن أحمد يوسف',
    phone: '01012349876',
    password: 'captain#7419',
    vehicle: 'سكوتر هوندا فورزا 300',
    vehicleNumber: 'ق أ د ٧٤١٩',
    area: 'المعادي والتجمع الخامس',
    debtLimit: 1000,
    currentDebt: 680, // 68% of limit
    totalTrips: 142,
    totalDeliveryEarnings: 7450,
    status: 'active',
    isOnline: true,
    hasPendingSettlement: true, // Pending 600 settlement
    pendingSettlementAmount: 600,
    pendingSettlementRef: 'IPN-2026-441092',
    nationalId: '29604150102431',
    avatarPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    vehiclePhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    coordinates: { lat: 29.9985, lng: 31.3780 }, // Real-time GPS location on Ring Road / Tagamoa
    nationalIdPhoto: generateIdDocSvg('بطاقة رقم قومي', 'أحمد يوسف عبد الله', '29604150102431'),
    licensePhoto: generateIdDocSvg('رخصة قيادة دراجة نارية', 'أحمد يوسف عبد الله', 'LIC-EGY-491823'),
    createdAt: '2026-08-10',
  },
  {
    id: 'd-2',
    name: 'كابتن محمود شريف',
    phone: '01122998877',
    password: 'speed@3682',
    vehicle: 'موتوسيكل بينيلي TNT 150',
    vehicleNumber: 'ج ب ص ٣٦٨٢',
    area: 'الزمالك والدقي والمهندسين',
    debtLimit: 1000,
    currentDebt: 980, // 98% near limit
    totalTrips: 98,
    totalDeliveryEarnings: 5120,
    status: 'active',
    isOnline: true,
    nationalId: '29811020108922',
    avatarPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    vehiclePhoto: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    coordinates: { lat: 30.0512, lng: 31.2185 },
    nationalIdPhoto: generateIdDocSvg('بطاقة رقم قومي', 'محمود شريف سالم', '29811020108922'),
    licensePhoto: generateIdDocSvg('رخصة قيادة دراجة نارية', 'محمود شريف سالم', 'LIC-EGY-781920'),
    createdAt: '2026-09-01',
  },
  {
    id: 'd-3',
    name: 'كابتن حسام عبد الرحمن',
    phone: '01288776655',
    password: 'moto#5201',
    vehicle: 'سكوتر ياماها إن ماكس 155',
    vehicleNumber: 'ع ن ر ٥٢٠١',
    area: 'مصر الجديدة ومدينة نصر',
    debtLimit: 1000,
    currentDebt: 1080, // EXCEEDED LIMIT -> FROZEN
    totalTrips: 115,
    totalDeliveryEarnings: 6200,
    status: 'frozen',
    isOnline: false,
    hasPendingSettlement: true, // Has pending 1080 settlement
    pendingSettlementAmount: 1080,
    pendingSettlementRef: 'VF-CASH-881900',
    nationalId: '29508190103112',
    avatarPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    vehiclePhoto: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=600&auto=format&fit=crop&q=80',
    coordinates: { lat: 30.0895, lng: 31.3250 },
    nationalIdPhoto: generateIdDocSvg('بطاقة رقم قومي', 'حسام عبد الرحمن إبراهيم', '29508190103112'),
    licensePhoto: generateIdDocSvg('رخصة قيادة دراجة نارية', 'حسام عبد الرحمن إبراهيم', 'LIC-EGY-901844'),
    createdAt: '2026-08-18',
  },
  {
    id: 'd-4',
    name: 'كابتن طارق السعيد',
    phone: '01599887711',
    password: 'driver!6194',
    vehicle: 'سكوتر سيم سيمفوني إس آر',
    vehicleNumber: 'ط س و ٦١٩٤',
    area: 'الشيخ زايد ومدينة 6 أكتوبر',
    debtLimit: 1000,
    currentDebt: 0,
    totalTrips: 0,
    totalDeliveryEarnings: 0,
    status: 'pending', // Pending onboarding approval
    isOnline: false,
    nationalId: '29906140107765',
    avatarPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    coordinates: { lat: 30.0150, lng: 30.9810 },
    nationalIdPhoto: generateIdDocSvg('بطاقة رقم قومي', 'طارق السعيد بدر', '29906140107765'),
    licensePhoto: generateIdDocSvg('رخصة قيادة دراجة نارية', 'طارق السعيد بدر', 'LIC-EGY-334190'),
    createdAt: '2026-10-28',
  },
];

// Initial Streetwear Products
export const initialProducts: Product[] = [
  {
    id: 'p-1',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    name: 'هودي أوفرسايز أسود فاحم ثقيل 480 GSM',
    category: 'هوديز وسويت شيرت',
    price: 980,
    originalPrice: 1200,
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80',
    description: 'قطن مصري 100% ثقيل المعالجة 480 جرام، قصة أوفرسايز أوروبية، بطانة صوف ناعمة وجيب أمامي مخفي.',
    fabricDetails: '100% Premium Egyptian Heavyweight Fleece',
    fitType: 'Boxy Relaxed Cut',
  },
  {
    id: 'p-2',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    name: 'جاكيت بومبر باراشوت رمادي ميكروفيبر',
    category: 'جواكت ومعاطف',
    price: 1350,
    originalPrice: 1600,
    sizes: ['M', 'L'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80',
    description: 'خامة ووتربروف خفيفة مقاومة للهواء والماء، سحابات معدنية سوداء فاخرة ولمسة نهائية مطفية.',
    fabricDetails: 'High-Density Matte Tech Nylon',
    fitType: 'Oversized Silhouette',
  },
  {
    id: 'p-3',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    name: 'بنطلون كارجو باراشوت بيج برباط مزدوج',
    category: 'بناطيل كارجو وجينز',
    price: 850,
    originalPrice: 950,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&auto=format&fit=crop&q=80',
    description: '6 جيوب وظيفية مع نظام زم سفلي لضبط وسع الأرجل، قماش كوتون تويل فائق المتانة للمشاوير الحضرية.',
    fabricDetails: 'Heavy Cotton Ripstop Weave',
    fitType: 'Wide-Leg Parachute Fit',
  },
  {
    id: 'p-4',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    name: 'تي شيرت غرافيتي مغسول Vintage Washed',
    category: 'تي شيرتات وبولوهات',
    price: 520,
    originalPrice: 650,
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80',
    description: 'غسيل حمضي يدوي فريد يعطي مظهر الفينتاج الفاخر، طباعة سكرين برنت عالية المقاومة للغسيل المتكرر.',
    fabricDetails: '260 GSM Single Jersey Combed Cotton',
    fitType: 'Drop Shoulder Boxy Fit',
  },
  {
    id: 'p-5',
    vendorId: 'v-3',
    vendorName: 'ZAG STORE',
    name: 'كاب بيسبول فنتدج مطرز بلوجو العاصمة',
    category: 'إكسسوارات وكابات',
    price: 390,
    originalPrice: 480,
    sizes: ['مقاس موحد قابل للتعديل'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&auto=format&fit=crop&q=80',
    description: 'قماش كانفاس قطني معتق بألوان رمادية مطفية، تطريز بارز عالي الدقة وإبزيم معدني عتيق.',
    fabricDetails: 'Washed Cotton Canvas',
    fitType: 'Structured Dad Cap',
  },
  {
    id: 'p-6',
    vendorId: 'v-4',
    vendorName: 'OVERSIZED EG',
    name: 'سويت شيرت كرو نيك رمادي مارل كلاسيك',
    category: 'هوديز وسويت شيرت',
    price: 780,
    sizes: ['S', 'M', 'L'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&auto=format&fit=crop&q=80',
    description: 'رقبة دائرية مريحة، أساور مطاطية عريضة، قماش ناعم الملمس مبطن من الداخل بنسيج فرنش تيري.',
    fabricDetails: '380 GSM French Terry Cotton',
    fitType: 'Minimalist Relaxed Fit',
  },
  {
    id: 'p-7',
    vendorId: 'v-5',
    vendorName: 'NOIR ATELIER',
    name: 'بليزر ستريت وير أسود بتفاصيل تكنيكال',
    category: 'جواكت ومعاطف',
    price: 1850,
    originalPrice: 2200,
    sizes: ['M', 'L'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80',
    description: 'دمج عصري بين تفصيل البدلات الراقية وروح الشارع، حزام داخلي وجيوب سرية للأجهزة الذكية.',
    fabricDetails: 'Fine Wool & Technical Viscose Blend',
    fitType: 'Tailored Street Silhouette',
  },
];

// Initial Pending & Historical Settlement Requests
export const initialSettlements: SettlementRequest[] = [
  {
    id: 'set-1',
    entityType: 'vendor',
    entityId: 'v-1',
    entityName: 'UNTITLED CAIRO',
    entityArea: 'المعادي',
    amount: 3500,
    method: 'instapay',
    transactionRef: 'IPN-2026-993812',
    receiptImageUrl: generateReceiptSvg('UNTITLED CAIRO', 3500, 'IPN-2026-993812', 'instapay', '2026-10-28 18:30'),
    receiptNotes: 'سداد جزئي للمديونية لفتح استقبال طلبات نهاية الأسبوع',
    status: 'pending',
    createdAt: '2026-10-28 18:32',
  },
  {
    id: 'set-2',
    entityType: 'vendor',
    entityId: 'v-3',
    entityName: 'ZAG STORE',
    entityArea: 'التجمع الخامس',
    amount: 5350,
    method: 'vodafone_cash',
    transactionRef: 'VF-CASH-771829',
    receiptImageUrl: generateReceiptSvg('ZAG STORE', 5350, 'VF-CASH-771829', 'vodafone_cash', '2026-10-28 19:45'),
    receiptNotes: 'المحل مجمد لتجاوز الـ 5000 ج.م، تم تحويل كامل المديونية 5350 ج.م لإلغاء التجميد فوراً',
    status: 'pending',
    createdAt: '2026-10-28 19:48',
  },
  {
    id: 'set-3',
    entityType: 'driver',
    entityId: 'd-1',
    entityName: 'كابتن أحمد يوسف',
    entityArea: 'المعادي',
    amount: 600,
    method: 'instapay',
    transactionRef: 'IPN-2026-441092',
    receiptImageUrl: generateReceiptSvg('كابتن أحمد يوسف', 600, 'IPN-2026-441092', 'instapay', '2026-10-28 14:15'),
    receiptNotes: 'سداد عمولات 12 مشوار توصيل مسائية',
    status: 'pending',
    createdAt: '2026-10-28 14:17',
  },
  {
    id: 'set-4',
    entityType: 'driver',
    entityId: 'd-3',
    entityName: 'كابتن حسام عبد الرحمن',
    entityArea: 'مصر الجديدة',
    amount: 1080,
    method: 'vodafone_cash',
    transactionRef: 'VF-CASH-881900',
    receiptImageUrl: generateReceiptSvg('كابتن حسام عبد الرحمن', 1080, 'VF-CASH-881900', 'vodafone_cash', '2026-10-28 17:05'),
    receiptNotes: 'حسابي متوقف لتجاوز ليميت الـ 1000 ج، حولت كامل المبلغ برجاء إعادة التفعيل للعمل الآن',
    status: 'pending',
    createdAt: '2026-10-28 17:10',
  },
  {
    id: 'set-5',
    entityType: 'vendor',
    entityId: 'v-2',
    entityName: 'SHABAB CO.',
    entityArea: 'الزمالك',
    amount: 4000,
    method: 'instapay',
    transactionRef: 'IPN-2026-118274',
    receiptImageUrl: generateReceiptSvg('SHABAB CO.', 4000, 'IPN-2026-118274', 'instapay', '2026-10-25 11:20'),
    status: 'approved',
    createdAt: '2026-10-25 11:22',
    resolvedAt: '2026-10-25 12:00',
    adminNotes: 'تمت مطابقة الكشف البنكي وتصفير المديونية',
  },
];

// Initial Orders
export const initialOrders: Order[] = [
  {
    id: 'ord-104',
    orderNumber: 'VF-9043',
    customerId: 'cust-1',
    customerName: 'كريم مجدي',
    customerPhone: '01018301830',
    customerArea: 'التجمع الخامس',
    customerAddress: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    customerCoordinates: { lat: 30.0255, lng: 31.4580 },
    paymentMethod: 'cash_on_delivery',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    vendorArea: 'المعادي - دجلة',
    vendorCoordinates: { lat: 29.9602, lng: 31.2785 },
    items: [
      {
        product: initialProducts[0], // 980 EGP hoodie
        size: 'XL',
        quantity: 1,
      },
    ],
    clothesTotal: 980,
    distanceKm: 14.5,
    deliveryFee: 85,
    totalAmount: 1065,
    vendorCommission: 147,
    driverCommission: 17,
    status: 'pending_vendor', // New order waiting for store manager to confirm stock
    createdAt: '2026-10-29 11:20',
    notes: 'برجاء التأكد من وجود كيس البراند الأصلي',
  },
  {
    id: 'ord-105',
    orderNumber: 'VF-9039',
    customerId: 'cust-2',
    customerName: 'سارة طارق',
    customerPhone: '01155443322',
    customerArea: 'مصر الجديدة',
    customerAddress: 'عمارة 8، شارع بيروت، مصر الجديدة',
    customerCoordinates: { lat: 30.0910, lng: 31.3340 },
    paymentMethod: 'cash_on_delivery',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    vendorArea: 'المعادي - دجلة',
    vendorCoordinates: { lat: 29.9602, lng: 31.2785 },
    driverId: 'd-1',
    driverName: 'كابتن أحمد يوسف',
    driverPhone: '01012349876',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    driverVehicle: 'سكوتر هوندا فورزا 300',
    driverVehicleNumber: 'ق أ د ٧٤١٩',
    driverVehiclePhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    items: [
      {
        product: initialProducts[0],
        size: 'M',
        quantity: 1,
      },
    ],
    clothesTotal: 980,
    distanceKm: 16.5,
    deliveryFee: 95,
    totalAmount: 1075,
    vendorCommission: 147,
    driverCommission: 19,
    status: 'returning_to_vendor', // Customer rejected delivery -> driver on way back to store
    returnReason: 'العميل عاين المقاس ووجد أنه واسع زيادة عن اللزوم وطلب الإرجاع الفوري',
    returnCode: 'RET-8841',
    createdAt: '2026-10-29 10:15',
    notes: 'القطعة بحالتها الأصلية غير مفتوحة',
  },
  {
    id: 'ord-101',
    orderNumber: 'VF-9041',
    customerId: 'cust-1',
    customerName: 'كريم مجدي',
    customerPhone: '01018301830',
    customerArea: 'التجمع الخامس',
    customerAddress: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    customerCoordinates: { lat: 30.0255, lng: 31.4580 },
    paymentMethod: 'cash_on_delivery',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    vendorArea: 'المعادي',
    vendorCoordinates: { lat: 29.9602, lng: 31.2785 },
    driverId: 'd-1',
    driverName: 'كابتن أحمد يوسف',
    driverPhone: '01012349876',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    driverVehicle: 'سكوتر هوندا فورزا 300',
    driverVehicleNumber: 'ق أ د ٧٤١٩',
    driverVehiclePhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    items: [
      {
        product: initialProducts[0], // 980 EGP
        size: 'L',
        quantity: 1,
      },
    ],
    clothesTotal: 980,
    distanceKm: 14.5,
    deliveryFee: 85, // 35 base + 11.5 * 4.5 ~= 85 EGP
    totalAmount: 1065, // 980 + 85 EGP cash to collect from customer
    vendorCommission: 147, // 15% of 980 EGP
    driverCommission: 17, // 20% of 85 EGP
    status: 'picked_up_paid_store', // Driver paid 980 cash to store, on the way to customer
    createdAt: '2026-10-28 20:30',
    notes: 'الدفع كاش عند الاستلام، برجاء إحضار كيس هدايا إن وجد',
  },
  {
    id: 'ord-102',
    orderNumber: 'VF-9042',
    customerId: 'cust-2',
    customerName: 'سارة طارق',
    customerPhone: '01155443322',
    customerArea: 'مصر الجديدة',
    customerAddress: 'عمارة 8، شارع بيروت، مصر الجديدة',
    customerCoordinates: { lat: 30.0910, lng: 31.3340 },
    paymentMethod: 'instapay',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    vendorArea: 'الزمالك',
    vendorCoordinates: { lat: 30.0626, lng: 31.2224 },
    items: [
      {
        product: initialProducts[2], // 850 EGP cargo
        size: 'M',
        quantity: 1,
      },
    ],
    clothesTotal: 850,
    distanceKm: 18.0,
    deliveryFee: 102,
    totalAmount: 952,
    vendorCommission: 119, // 14% of 850 EGP
    driverCommission: 20.4,
    status: 'ready_for_driver', // Vendor prepared clothes, waiting for driver to accept & pay cash at store
    createdAt: '2026-10-28 21:05',
    notes: 'برجاء الاتصال قبل الوصول بـ 10 دقائق',
  },
  {
    id: 'ord-103',
    orderNumber: 'VF-9040',
    customerId: 'cust-1',
    customerName: 'كريم مجدي',
    customerPhone: '01018301830',
    customerArea: 'التجمع الخامس',
    customerAddress: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    customerCoordinates: { lat: 30.0255, lng: 31.4580 },
    paymentMethod: 'vodafone_cash',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    vendorArea: 'المعادي',
    vendorCoordinates: { lat: 29.9602, lng: 31.2785 },
    driverId: 'd-2',
    driverName: 'كابتن محمود شريف',
    driverPhone: '01122998877',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    driverVehicle: 'موتوسيكل بينيلي TNT 150',
    driverVehicleNumber: 'ج ب ص ٣٦٨٢',
    driverVehiclePhoto: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    items: [
      {
        product: initialProducts[1], // 1350 EGP bomber
        size: 'L',
        quantity: 1,
      },
    ],
    clothesTotal: 1350,
    distanceKm: 12.0,
    deliveryFee: 75,
    totalAmount: 1425,
    vendorCommission: 202.5,
    driverCommission: 15,
    status: 'delivered', // Successfully delivered
    createdAt: '2026-10-28 17:15',
  },
];
