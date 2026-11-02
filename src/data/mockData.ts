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
      <text x="0" y="15" font-family="sans-serif" font-size="13" font-weight="bold" fill="#09090B" text-anchor="start">إدارة FAST DRIP للخزينة</text>
      
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
  instapayHandle: 'dripfit.vault@instapay',
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
    email: 'karim@dripfit.eg',
    phone: '01018301830',
    area: 'التجمع الخامس',
    address: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    coordinates: { lat: 30.0255, lng: 31.4580 },
    createdAt: '2026-10-15',
  },
  {
    id: 'cust-2',
    name: 'سارة طارق',
    email: 'sara@dripfit.eg',
    phone: '01155443322',
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
    email: 'untitled@dripfit.eg',
    phone: '01011223344',
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
    email: 'shabab@dripfit.eg',
    phone: '01122334455',
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
    email: 'zag@dripfit.eg',
    phone: '01233445566',
    area: 'التجمع الخامس',
    address: 'شارع التسعين الشمالي، داون تاون مول، التجمع الخامس',
    coordinates: { lat: 30.0131, lng: 31.4289 },
    category: 'Caps, Bombers & Denim',
    logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80',
    commissionRate: 16,
    debtLimit: 5000,
    currentDebt: 3200,
    totalSales: 94000,
    status: 'active',
    hasPendingSettlement: false,
    pendingSettlementAmount: 5350,
    pendingSettlementRef: 'VF-CASH-771829',
    createdAt: '2026-08-25',
    instagramHandle: '@zagstore.eg',
  },
  {
    id: 'v-4',
    name: 'OVERSIZED EG',
    slug: 'oversized-eg',
    email: 'oversized@dripfit.eg',
    phone: '01055667788',
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
    email: 'noir@dripfit.eg',
    phone: '01511223344',
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
    email: 'streetvibe@dripfit.eg',
    phone: '01099887766',
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
    email: 'ahmed.driver@dripfit.eg',
    phone: '01012349876',
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
    email: 'mahmoud.driver@dripfit.eg',
    phone: '01122998877',
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
    email: 'hossam.driver@dripfit.eg',
    phone: '01288776655',
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
    email: 'tarek.driver@dripfit.eg',
    phone: '01599887711',
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

// Initial Streetwear Products (15 Products across 5 Partner Stores)
export const initialProducts: Product[] = [
  // UNTITLED CAIRO (v-1)
  {
    id: 'p-1',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    name: 'Heavyweight Oversized Hoodie',
    category: 'Hoodies & Sweatshirts',
    price: 980,
    originalPrice: 1200,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=85',
    tag: 'Just dropped',
    color: 'Carbon',
    description: 'قطن مصري 100% ثقيل المعالجة 480 جرام، قصة أوفرسايز أوروبية، بطانة صوف ناعمة وجيب أمامي مخفي.',
    fabricDetails: '100% Premium Egyptian Heavyweight Fleece 480 GSM',
    fitType: 'Boxy Relaxed Cut',
  },
  {
    id: 'p-6',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    name: 'Technical Transit Vest',
    category: 'Jackets',
    price: 1100,
    originalPrice: 1300,
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=85',
    tag: 'Low stock',
    color: 'Black',
    description: 'فيست تكتيكي متعدد الجيوب للأغراض اليومية مع سحابات ووتربروف ولمسات عاكسة للضوء.',
    fabricDetails: 'Cordura Reinforcement Weave',
    fitType: 'Adjustable Utility Fit',
  },
  {
    id: 'p-7',
    vendorId: 'v-1',
    vendorName: 'UNTITLED CAIRO',
    name: 'Studio Wide-Leg Trouser',
    category: 'Pants',
    price: 890,
    originalPrice: 1050,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=85',
    color: 'Ink',
    description: 'بنطلون قماش بقصة واسعة درابيه مريحة للغاية وأزرار داخلية خفية.',
    fabricDetails: 'Drapey Cotton Lyocell Blend',
    fitType: 'Relaxed Wide Leg',
  },

  // SHABAB CO. (v-2)
  {
    id: 'p-2',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    name: 'Parachute Bomber Jacket',
    category: 'Jackets',
    price: 1350,
    originalPrice: 1600,
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
    tag: 'Fast delivery',
    color: 'Graphite',
    description: 'خامة ووتربروف خفيفة مقاومة للهواء والماء، سحابات معدنية سوداء فاخرة ولمسة نهائية مطفية.',
    fabricDetails: 'High-Density Matte Tech Nylon',
    fitType: 'Oversized Silhouette',
  },
  {
    id: 'p-8',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    name: 'Zamalek Club Jersey',
    category: 'T-Shirts',
    price: 640,
    originalPrice: 750,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85',
    tag: 'New',
    color: 'Off White',
    description: 'تيشيرت جيرسي مستوحى من طراز كرة القدم الكلاسيكي في شوارع الزمالك.',
    fabricDetails: 'Lightweight Retro Polyester Pique',
    fitType: 'Athletic Casual Fit',
  },
  {
    id: 'p-9',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    name: 'Court Low 01',
    category: 'Sneakers',
    price: 1650,
    originalPrice: 1900,
    sizes: ['41', '42', '43', '44', '45'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    color: 'Red / Bone',
    description: 'سنيكرز منخفض الكاحل بجلد طبيعي وتطعيمات عاجية وحمراء جريئة لأسلوب يومي مميز.',
    fabricDetails: 'Full-Grain Leather Upper & Vulcanized Rubber',
    fitType: 'Classic Court Cupsole',
  },

  // ZAG STORE (v-3)
  {
    id: 'p-3',
    vendorId: 'v-3',
    vendorName: 'ZAG STORE',
    name: 'Double Cord Cargo',
    category: 'Pants',
    price: 850,
    originalPrice: 950,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=85',
    color: 'Sand',
    description: '6 جيوب وظيفية مع نظام زم سفلي لضبط وسع الأرجل، قماش كوتون تويل فائق المتانة للمشاوير الحضرية.',
    fabricDetails: 'Heavy Cotton Ripstop Weave',
    fitType: 'Wide-Leg Parachute Fit',
  },
  {
    id: 'p-10',
    vendorId: 'v-3',
    vendorName: 'ZAG STORE',
    name: 'Utility Shell Jacket',
    category: 'Jackets',
    price: 1490,
    originalPrice: 1750,
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85',
    tag: 'Weather ready',
    color: 'Olive',
    description: 'جاكيت خفيف مقاوم للتقلبات الجوية مع كابيشون قابل للطي وياقة عالية.',
    fabricDetails: 'Ripstop 3-Layer Shell',
    fitType: 'Modern Storm Fit',
  },
  {
    id: 'p-11',
    vendorId: 'v-3',
    vendorName: 'ZAG STORE',
    name: 'New Cairo Runner',
    category: 'Sneakers',
    price: 1780,
    originalPrice: 2050,
    sizes: ['41', '42', '43', '44', '45'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85',
    color: 'Cream',
    description: 'حذاء ركض كاجوال مريح جداً بألوان حيادية كريمية ونعل داعم ومقاوم للانزلاق.',
    fabricDetails: 'Engineered Knit & EVA Midsole',
    fitType: 'All-Day Performance Fit',
  },

  // OVERSIZED EG (v-4)
  {
    id: 'p-4',
    vendorId: 'v-4',
    vendorName: 'OVERSIZED EG',
    name: 'Washed Graphic Tee',
    category: 'T-Shirts',
    price: 520,
    originalPrice: 650,
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85',
    tag: 'Trending',
    color: 'Concrete',
    description: 'غسيل حمضي يدوي فريد يعطي مظهر الفينتاج الفاخر، طباعة سكرين برنت عالية المقاومة للغسيل المتكرر.',
    fabricDetails: '260 GSM Single Jersey Combed Cotton',
    fitType: 'Drop Shoulder Boxy Fit',
  },
  {
    id: 'p-12',
    vendorId: 'v-4',
    vendorName: 'OVERSIZED EG',
    name: 'Boxy Zip Sweatshirt',
    category: 'Hoodies & Sweatshirts',
    price: 920,
    originalPrice: 1100,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
    color: 'Marl Grey',
    description: 'سويت شيرت بنصف سحاب معدني وأكتاف ساقطة وقماش قطني ناعم الملمس.',
    fabricDetails: '360 GSM Combed French Terry',
    fitType: 'Boxy Quarter-Zip Cut',
  },
  {
    id: 'p-13',
    vendorId: 'v-4',
    vendorName: 'OVERSIZED EG',
    name: 'Korba Relaxed Denim',
    category: 'Jeans',
    price: 1050,
    originalPrice: 1250,
    sizes: ['30', '32', '34', '36'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85',
    tag: 'Best seller',
    color: 'Vintage Blue',
    description: 'جينز قطني ثقيل بتأثير بهتان طبيعي وقصة مستقيمة ومريحة مستوحاة من التسعينات.',
    fabricDetails: '14 oz 100% Selvedge Denim',
    fitType: 'Straight Relaxed Fit',
  },

  // NOIR ATELIER (v-5)
  {
    id: 'p-5',
    vendorId: 'v-5',
    vendorName: 'NOIR ATELIER',
    name: 'Mono Street Runner',
    category: 'Sneakers',
    price: 1850,
    originalPrice: 2100,
    sizes: ['41', '42', '43', '44', '45'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85',
    color: 'Sand / Black',
    description: 'حذاء سنيكرز ستريت وير مبطن بنعل هيدروليكي مرن وخامات شبكية مسامية عالية الجودة.',
    fabricDetails: 'Breathable Mesh & Technical Suede',
    fitType: 'Chunky Cushion Sole',
  },
  {
    id: 'p-14',
    vendorId: 'v-5',
    vendorName: 'NOIR ATELIER',
    name: 'Arkan Technical Blazer',
    category: 'Jackets',
    price: 2200,
    originalPrice: 2600,
    sizes: ['48', '50', '52'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85',
    tag: 'Noir exclusive',
    color: 'Deep Black',
    description: 'بليزر ستريت وير أسود بقصة حادة وتفاصيل تكنولوجية دقيقة تعكس فخامة المينيماليزم.',
    fabricDetails: 'Fine Wool & Technical Viscose Blend',
    fitType: 'Tailored Street Silhouette',
  },
  {
    id: 'p-15',
    vendorId: 'v-5',
    vendorName: 'NOIR ATELIER',
    name: 'Pleated Night Trouser',
    category: 'Pants',
    price: 1280,
    originalPrice: 1500,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85',
    color: 'Night',
    description: 'بنطلون بطيات أمامية مزدوجة وخامة فاخرة تنسدل بنعومة مع كل حركة ليلية.',
    fabricDetails: 'Wrinkle-Resistant Crepe Gabardine',
    fitType: 'Pleated Tapered Cut',
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
    status: 'delivered', // Successfully delivered (ready to rate or view)
    createdAt: '2026-10-28 17:15',
  },
  {
    id: 'ord-106',
    orderNumber: 'VF-9038',
    customerId: 'cust-1',
    customerName: 'كريم مجدي',
    customerPhone: '01018301830',
    customerArea: 'التجمع الخامس',
    customerAddress: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    customerCoordinates: { lat: 30.0255, lng: 31.4580 },
    paymentMethod: 'cash_on_delivery',
    vendorId: 'v-2',
    vendorName: 'SHABAB CO.',
    vendorArea: 'الزمالك',
    vendorCoordinates: { lat: 30.0626, lng: 31.2224 },
    driverId: 'd-1',
    driverName: 'كابتن أحمد يوسف',
    driverPhone: '01012349876',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    driverVehicle: 'سكوتر هوندا فورزا 300',
    driverVehicleNumber: 'ق أ د ٧٤١٩',
    driverVehiclePhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    items: [
      {
        product: initialProducts[2],
        size: 'L',
        quantity: 1,
      },
    ],
    clothesTotal: 850,
    distanceKm: 17.5,
    deliveryFee: 100,
    totalAmount: 950,
    vendorCommission: 119,
    driverCommission: 20,
    status: 'delivered',
    vendorRating: 5,
    vendorReview: 'خامة البنطلون الكارجو ممتازة جداً والمقاس مظبوط بالمللي والتغليف شيك.',
    driverRating: 5,
    driverReview: 'كابتن أحمد محترم جداً ووصل في أقل من 40 دقيقة وانتظرني أعاين القطعة.',
    ratedAt: '2026-10-28 15:40',
    createdAt: '2026-10-28 14:50',
  },
];
