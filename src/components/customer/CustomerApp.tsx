import React, { useEffect, useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { CustomerPaymentMethod, Product, Order } from '../../types';
import {
  ShoppingBag,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  ArrowLeft,
  ChevronRight,
  Truck,
  User,
  LogOut,
  ListOrdered,
  Phone,
  CreditCard,
  Smartphone,
  Zap,
  ExternalLink,
  RotateCcw,
  Navigation,
  Star,
  Store,
  Bike,
  MessageSquare,
} from 'lucide-react';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { LiveOrderTrackingMap } from '../maps/LiveOrderTrackingMap';
import { calculateGeoDistanceKm } from '../../data/mockData';

export const CustomerApp: React.FC = () => {
  const {
    products,
    vendors,
    drivers,
    orders,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    calculateDeliveryFee,
    placeOrder,
    currentCustomer,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    submitOrderRating,
    showToast,
  } = usePlatform();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  // Selected product modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Customer Auth Modal (Email + Password, no pre-filled demo credentials)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authArea, setAuthArea] = useState('التجمع الخامس');
  const [authAddress, setAuthAddress] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Customer Orders History Drawer
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);

  // Checkout inputs
  const [custName, setCustName] = useState(currentCustomer?.name || '');
  const [custPhone, setCustPhone] = useState(currentCustomer?.phone || '');
  const [custArea, setCustArea] = useState(currentCustomer?.area || 'التجمع الخامس');
  const [custAddress, setCustAddress] = useState(currentCustomer?.address || '');
  const [custCoordinates, setCustCoordinates] = useState<{ lat: number; lng: number }>(
    currentCustomer?.coordinates || { lat: 30.0131, lng: 31.4289 }
  );
  const [custRoadDistanceKm, setCustRoadDistanceKm] = useState<number>(14.5);
  const [custNotes, setCustNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CustomerPaymentMethod>('cash_on_delivery');
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [openMapOrderIds, setOpenMapOrderIds] = useState<string[]>([]);

  // Post-delivery Store & Driver Rating Modal State
  const [ratingModalOrder, setRatingModalOrder] = useState<Order | null>(null);
  const [vendorRatingVal, setVendorRatingVal] = useState<number>(5);
  const [vendorReviewVal, setVendorReviewVal] = useState<string>('');
  const [driverRatingVal, setDriverRatingVal] = useState<number>(5);
  const [driverReviewVal, setDriverReviewVal] = useState<string>('');

  const handleOpenRatingModal = (ord: Order) => {
    setRatingModalOrder(ord);
    setVendorRatingVal(ord.vendorRating || 5);
    setVendorReviewVal(ord.vendorReview || '');
    setDriverRatingVal(ord.driverRating || 5);
    setDriverReviewVal(ord.driverReview || '');
  };

  const handleSaveOrderRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalOrder) return;
    submitOrderRating(ratingModalOrder.id, {
      vendorRating: vendorRatingVal,
      vendorReview: vendorReviewVal,
      driverRating: driverRatingVal,
      driverReview: driverReviewVal,
    });
    setRatingModalOrder(null);
  };

  // Sync inputs if currentCustomer changes
  React.useEffect(() => {
    if (currentCustomer) {
      setCustName(currentCustomer.name);
      setCustPhone(currentCustomer.phone);
      setCustArea(currentCustomer.area);
      setCustAddress(currentCustomer.address);
      if (currentCustomer.coordinates) {
        setCustCoordinates(currentCustomer.coordinates);
      }
    } else {
      setCustName('');
      setCustPhone('');
      setCustAddress('');
    }
  }, [currentCustomer]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedVendor !== 'all' && p.vendorId !== selectedVendor) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, selectedVendor, searchQuery]);

  const categories = [
    'all',
    'هوديز وسويت شيرت',
    'جواكت ومعاطف',
    'بناطيل كارجو وجينز',
    'تي شيرتات وبولوهات',
    'إكسسوارات وكابات',
  ];

  // Cart summary calculations
  const cartVendorId = cart[0]?.product.vendorId;
  const cartVendor = vendors.find((v) => v.id === cartVendorId);

  // Dynamic distance estimate based on real GPS coordinates
  const estimatedDistance = useMemo(() => {
    if (!cartVendor) return 10;
    if (cartVendor.coordinates && custCoordinates) {
      const realDirectKm = calculateGeoDistanceKm(
        cartVendor.coordinates.lat,
        cartVendor.coordinates.lng,
        custCoordinates.lat,
        custCoordinates.lng
      );
      return Math.max(1.5, Math.round(realDirectKm * 1.25 * 10) / 10);
    }
    if (custArea === cartVendor.area) return 4.5;
    if (
      (custArea.includes('التجمع') && cartVendor.area.includes('المعادي')) ||
      (custArea.includes('المعادي') && cartVendor.area.includes('التجمع'))
    )
      return 15.5;
    if (
      (custArea.includes('زايد') && cartVendor.area.includes('مصر الجديدة')) ||
      (custArea.includes('مصر الجديدة') && cartVendor.area.includes('زايد'))
    )
      return 33.0;
    return 12.0;
  }, [custArea, cartVendor, custCoordinates]);

  const clothesSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = calculateDeliveryFee(estimatedDistance);
  const totalCodAmount = clothesSubtotal + deliveryFee;

  // Customer's order history — strictly scoped to authenticated customer ID
  const customerOrders = useMemo(() => {
    if (!currentCustomer) return [];
    return orders.filter((o) => o.customerId === currentCustomer.id);
  }, [orders, currentCustomer]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!currentCustomer) {
      showToast('يرجى تسجيل الدخول بحسابك أولاً لإتمام طلب التوصيل', 'error');
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    const ord = placeOrder({
      customerId: currentCustomer.id,
      name: custName,
      phone: custPhone,
      area: custArea,
      address: custAddress,
      coordinates: custCoordinates,
      paymentMethod: selectedPaymentMethod,
      notes: custNotes,
    });

    if (ord) {
      setLatestPlacedOrder(ord);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    setIsAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        const success = await loginCustomer(authEmail, authPassword);
        if (success) {
          setIsAuthModalOpen(false);
          setAuthPassword('');
        }
      } else {
        if (!authName || !authEmail || !authPhone || !authPassword) return;
        const created = await registerCustomer({
          name: authName,
          email: authEmail,
          phone: authPhone,
          password: authPassword,
          area: authArea,
          address: authAddress,
        });
        if (created) {
          setIsAuthModalOpen(false);
          setAuthPassword('');
        }
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131517] text-white font-['Readex_Pro',sans-serif] overflow-x-clip">
      {/* Editorial header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl">
        <div dir="ltr" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <button type="button" aria-label="فتح القائمة" aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)} className="flex h-10 w-10 items-center justify-center border border-white/15 text-white transition-colors hover:border-[#D1FE17] hover:text-[#D1FE17] lg:hidden">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16" className="origin-center transition-transform duration-200" />
              <path d="M4 12h16" className="transition-opacity duration-200" />
              <path d="M4 17h16" className="origin-center transition-transform duration-200" />
            </svg>
          </button>
          <span className="font-display text-2xl tracking-tight text-white sm:text-3xl">FAST <span className="text-[#D1FE17]">DRIP</span></span>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <input type="text" placeholder="SEARCH" aria-label="بحث" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-32 border-0 border-b border-white/20 bg-transparent px-1 text-[10px] tracking-[0.2em] text-white placeholder:text-[#898A8B] focus:border-[#D1FE17] focus:outline-none" />
              <Search className="pointer-events-none absolute right-0 top-2.5 h-3.5 w-3.5 text-[#898A8B]" />
            </div>
            <button onClick={() => setIsCartOpen(true)} aria-label="فتح حقيبة التسوق" className="relative flex h-10 w-10 items-center justify-center border border-white/15 text-white transition-colors hover:border-[#D1FE17] hover:text-[#D1FE17]">
              <ShoppingBag className="h-4 w-4" />
              {cart.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D1FE17] px-1 text-[9px] font-bold text-[#080808]">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
            </button>
            <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} aria-label="دخول أو حساب جديد" className="hidden h-10 w-10 items-center justify-center border border-white/15 text-white transition-colors hover:border-[#D1FE17] hover:text-[#D1FE17] sm:flex"><User className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="قائمة FAST DRIP">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside className="relative flex h-full w-[min(88vw,380px)] flex-col overflow-y-auto bg-[#080808] px-5 pb-5 pt-5 shadow-2xl animate-[drawer-in_220ms_ease-out]">
            <div className="flex items-center justify-between border-b border-white/10 pb-5" dir="ltr">
              <span className="font-display text-2xl tracking-tight text-white">FAST <span className="text-[#D1FE17]">DRIP</span></span>
              <button type="button" aria-label="إغلاق القائمة" onClick={() => setIsMobileMenuOpen(false)} className="flex h-10 w-10 items-center justify-center border border-white/15 text-white transition-colors hover:border-[#D1FE17] hover:text-[#D1FE17]"><X className="h-4 w-4" /></button>
            </div>

            <nav className="flex-1 py-7" aria-label="التنقل الرئيسي">
              <div className="mb-7">
                <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.28em] text-[#D1FE17]">SHOP</p>
                <div className="space-y-1">
                  {[
                    ['All Products', 'all'],
                    ['New Arrivals', 'all'],
                    ['Hoodies', 'هوديز وسويت شيرت'],
                    ['T-Shirts', 'تي شيرتات وبولوهات'],
                    ['Shirts', 'قمصان'],
                    ['Jeans', 'جينز'],
                    ['Pants', 'بناطيل كارجو وجينز'],
                    ['Jackets', 'جواكت ومعاطف'],
                    ['Shoes', 'أحذية'],
                    ['Accessories', 'إكسسوارات'],
                  ].map(([label, category]) => {
                    const isSelected = category === selectedCategory && label !== 'New Arrivals';
                    return (
                      <button key={label} type="button" onClick={() => { setSelectedCategory(category); setIsMobileMenuOpen(false); document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' }); }} className={`group flex w-full items-center justify-between border-b border-white/[0.06] py-2.5 text-left text-sm transition-colors ${isSelected ? 'text-[#D1FE17]' : 'text-white/80 hover:text-[#D1FE17]'}`} dir="ltr">
                        <span className="flex items-center gap-3"><span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[#D1FE17]' : 'bg-white/20 group-hover:bg-[#D1FE17]'}`} />{label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-[#D1FE17]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-7">
                <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.28em] text-[#D1FE17]">DISCOVER</p>
                <div className="space-y-1">
                  {['All Stores', 'Nearby Stores', 'Featured Stores'].map((label) => (
                    <button key={label} type="button" onClick={() => { setSelectedVendor('all'); setIsMobileMenuOpen(false); document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' }); }} className="group flex w-full items-center justify-between border-b border-white/[0.06] py-2.5 text-left text-sm text-white/80 transition-colors hover:text-[#D1FE17]" dir="ltr"><span>{label}</span><ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-[#D1FE17]" /></button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.28em] text-[#D1FE17]">MORE</p>
                <div className="space-y-1">
                  {['Offers & Deals', 'About Us', 'Contact Us'].map((label) => (
                    <button key={label} type="button" onClick={() => setIsMobileMenuOpen(false)} className="group flex w-full items-center justify-between border-b border-white/[0.06] py-2.5 text-left text-sm text-white/80 transition-colors hover:text-[#D1FE17]" dir="ltr"><span>{label}</span><ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-[#D1FE17]" /></button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="border-t border-white/10 pt-5">
              <div className="mb-4 flex items-start gap-3 text-left" dir="ltr"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D1FE17]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#898A8B]">DELIVERING TO</p><p className="mt-1 text-sm text-white">{currentCustomer?.area || 'التجمع الخامس'}</p><p className="mt-0.5 truncate text-[11px] text-white/45">{currentCustomer?.address || 'حدد موقع التوصيل عند الدفع'}</p></div></div>
              <button type="button" onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }} className="flex w-full items-center justify-between border border-[#D1FE17] px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-[#D1FE17] transition-colors hover:bg-[#D1FE17] hover:text-[#080808]" dir="ltr"><span>CHANGE LOCATION</span><MapPin className="h-3.5 w-3.5" /></button>
              <p className="mt-4 text-center text-[9px] font-mono tracking-[0.18em] text-white/35" dir="ltr">LOCAL STORES. AT YOUR DOOR IN 45 MINUTES.</p>
            </div>
          </aside>
        </div>
      )}

      {/* Ticker strip */}
      <div className="bg-[#D1FE17] text-[#131517] border-b border-[#131517] overflow-hidden" aria-hidden="true">
        <div className="flex w-max animate-marquee py-2">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center text-xs font-bold whitespace-nowrap">
                  <span className="px-6">توصيل فوري مباشر بالكيلومتر</span>
                  <span className="w-2 h-2 rotate-45 bg-[#131517]" />
                  <span className="px-6">كاش · فودافون كاش · إنستاباي</span>
                  <span className="w-2 h-2 rotate-45 bg-[#131517]" />
                  <span className="px-6">معاينة القطعة واستلام فوري</span>
                  <span className="w-2 h-2 rotate-45 bg-[#131517]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Editorial hero */}
      <section className="relative isolate min-h-[520px] overflow-hidden border-b border-white/10 bg-[#080808] px-5 py-12 sm:min-h-[650px] sm:px-8 sm:py-20">
        <img src="/fashion/fast-drip-hero.png" alt="عارض يرتدي أزياء FAST DRIP streetwear" className="absolute inset-y-0 right-0 -z-10 h-full w-[74%] object-cover object-center opacity-85 sm:w-[58%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/30" aria-hidden="true" />
        <div className="mx-auto flex min-h-[450px] max-w-[1440px] flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.24em] text-[#898A8B]" dir="ltr">
            <span>FAST DRIP / 001</span><span className="text-[#D1FE17]">CAIRO — EGYPT</span>
          </div>
          <div className="max-w-[510px] animate-rise">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.28em] text-[#D1FE17]">FAST DRIP</p>
            <h1 className="font-display text-[4.4rem] leading-[0.82] tracking-tight text-white sm:text-8xl" dir="ltr">DRIP<br /><span className="text-[#D1FE17]">DIFFERENT</span></h1>
            <p className="mt-6 max-w-xs text-xs font-medium uppercase tracking-[0.16em] text-white/65 sm:text-sm" dir="ltr">PREMIUM STREETWEAR FOR REAL ONES.</p>
            <button onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })} className="mt-7 inline-flex items-center gap-3 bg-[#D1FE17] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#080808] transition-transform hover:-translate-y-1" dir="ltr">SHOP NOW <ArrowLeft className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-2" aria-label="شرائح العرض"><span className="h-1 w-10 bg-[#D1FE17]" /><span className="h-1 w-3 bg-white/35" /><span className="h-1 w-3 bg-white/35" /></div>
        </div>
      </section>

      {/* Editorial categories */}
      <section className="border-b border-white/10 bg-[#080808] px-4 py-7 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-5 flex items-end justify-between"><p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#898A8B]">SHOP BY CATEGORY</p><span className="text-[10px] text-[#D1FE17]">04 / 04</span></div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
            {[['HOODIES', '/fashion/category-hoodies.png', 'هوديز وسويت شيرت'], ['JACKETS', '/fashion/category-jackets.png', 'جواكت ومعاطف'], ['T-SHIRTS', '/fashion/category-tees.png', 'تي شيرتات وبولوهات'], ['PANTS', '/fashion/category-pants.png', 'بناطيل كارجو وجينز']].map(([label, image, category]) => (
              <button key={label} onClick={() => setSelectedCategory(category)} className="group relative aspect-[0.78] overflow-hidden rounded-sm bg-[#151515] text-left">
                <img src={image} alt={label} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold tracking-[0.08em] text-white" dir="ltr"><span>{label}</span><ArrowLeft className="h-4 w-4 text-[#D1FE17] transition-transform group-hover:-translate-x-1" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Tabs Bar */}
      <div className="border-b border-white/10 bg-[#131517]/90 backdrop-blur-md px-4 sm:px-6 md:sticky md:top-[68px] z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 py-3">
          {/* Categories Segmented */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#D1FE17] border-[#D1FE17] text-[#131517] font-bold'
                    : 'border-white/15 text-white/80 hover:border-[#D1FE17] hover:text-[#D1FE17]'
                }`}
              >
                {cat === 'all' ? 'جميع التصنيفات' : cat}
              </button>
            ))}
          </div>

          {/* Brand Dropdown Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#898A8B]">تصفح براند محدد:</span>
            <select
              aria-label="تصفح براند محدد"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-[#1A1C1F] border border-white/15 text-white rounded-full px-3.5 py-2 text-xs focus:outline-none focus:border-[#D1FE17] font-medium"
            >
              <option value="all">كل البراندات والمتاجر</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.area})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

          {/* Products Grid */}
      <main id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-[#D1FE17]" dir="ltr">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D1FE17]" />
              FAST DRIP / DROP 01
            </div>
            <h2 className="font-display text-3xl uppercase sm:text-4xl text-white" dir="ltr">NEW ARRIVALS</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#898A8B]">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">{filteredProducts.length} قطعة متاحة</span>
            <button type="button" onClick={() => { setSelectedCategory('all'); setSelectedVendor('all'); setSearchQuery(''); }} className="hidden border-b border-[#D1FE17] pb-1 text-[#D1FE17] sm:inline" dir="ltr">VIEW ALL</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              onClick={() => {
                setActiveProduct(product);
                setSelectedSize(product.sizes[0] || 'L');
              }}
              style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
              className="group cursor-pointer flex flex-col justify-between animate-rise"
            >
              <div>
                {/* 3:4 Aspect Image */}
                <div className="relative aspect-[3/4] bg-[#1A1C1F] rounded-2xl overflow-hidden border border-white/10 mb-3.5 transition-all duration-300 group-hover:border-[#D1FE17] group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_0_#D1FE17] before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(135deg,transparent_0%,transparent_55%,rgba(209,254,23,0.18)_55%,rgba(209,254,23,0.18)_58%,transparent_58%)] before:pointer-events-none">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#131517]/70 to-transparent pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 bg-[#D1FE17] text-[#131517] text-[10px] font-bold px-2.5 py-1 rounded-full">
                    توصيل 45 دقيقة
                  </div>
                  {product.originalPrice && (
                    <div className="absolute bottom-2.5 right-2.5 bg-white text-[#131517] text-[10px] font-bold px-2.5 py-1 rounded-md -rotate-3">
                      خصم خاص
                    </div>
                  )}
                  <div className="absolute bottom-2.5 left-2.5 h-9 w-9 rounded-full bg-[#131517]/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-[#D1FE17] group-hover:text-[#131517] transition-all duration-300" aria-hidden="true">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#898A8B] tracking-wider uppercase">
                    {product.vendorName}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug line-clamp-1 group-hover:text-[#D1FE17] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm sm:text-base text-[#D1FE17] tabular-nums">
                      {product.price.toLocaleString('ar-EG')} ج.م
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-[#898A8B] line-through tabular-nums">
                        {product.originalPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sizes hint */}
              <div className="pt-2.5 text-[11px] text-[#898A8B] flex items-center gap-1">
                <span>المقاسات:</span>
                <span className="text-white/70">{product.sizes.join(' · ')}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 px-4 sm:px-6 py-4 text-xs bg-[#131517]">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
          <span className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-center leading-relaxed text-white/90">
            <Truck className="w-4 h-4 shrink-0 text-[#D1FE17]" /> توصيل فوري مباشر بالكيلومتر
          </span>
          <span className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-center leading-relaxed text-white/90">
            <CreditCard className="w-4 h-4 shrink-0 text-[#D1FE17]" /> كاش · فودافون كاش · إنستاباي
          </span>
          <span className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-center leading-relaxed text-white/90">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#D1FE17]" /> معاينة القطعة واستلام فوري
          </span>
        </div>
      </div>

      {/* Partner stores */}
      <section className="border-b border-white/10 bg-[#1A1C1F] px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D1FE17] shadow-[0_0_14px_rgba(209,254,23,0.8)]" aria-hidden="true" />
              <h2 className="text-sm sm:text-base font-bold text-white">البراندات الشريكة في التوصيل اللحظي</h2>
            </div>
            <span className="hidden sm:inline text-[10px] font-mono tracking-[0.18em] text-[#898A8B]" dir="ltr">LOCAL DROPS / 05</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
            {vendors.slice(0, 5).map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVendor(v.id)}
                className={`group shrink-0 snap-start min-w-[176px] sm:min-w-0 sm:flex-1 rounded-xl border px-3 py-2.5 text-right transition-all hover:-translate-y-0.5 ${
                  selectedVendor === v.id
                    ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17]'
                    : 'bg-white/[0.04] border-white/10 text-white hover:border-[#D1FE17]'
                }`}
              >
                <span className="block text-xs font-bold leading-tight">{v.name}</span>
                <span className={`mt-1 block text-[10px] ${selectedVendor === v.id ? 'text-[#131517]/70' : 'text-[#898A8B] group-hover:text-[#D1FE17]'}`}>{v.area}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {activeProduct && (
<div className="fixed inset-0 z-50 bg-[#131517]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain">
  <div className="bg-[#1A1C1F] rounded-2xl border border-white/10 max-w-2xl w-[92vw] max-h-[75dvh] overflow-hidden shadow-2xl animate-in zoom-in-95 grid grid-cols-1 sm:grid-cols-2">
  {/* Image */}
  <div className="h-[150px] max-[380px]:h-[135px] sm:h-auto sm:min-h-[460px] bg-white/[0.06] shrink-0">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Details */}
            <div className="min-h-0 overflow-y-auto p-3 sm:p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[10px] font-mono text-[#898A8B] uppercase">
                    {activeProduct.vendorName}
                  </span>
                  <button
                    onClick={() => setActiveProduct(null)}
                    aria-label="إغلاق تفاصيل المنتج"
                    className="-mt-1 -mr-1 p-2 rounded-full text-[#898A8B] hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-sm sm:text-lg font-bold text-white mb-0.5 leading-snug">
                  {activeProduct.name}
                </h2>

                <div className="text-base sm:text-xl font-bold text-[#D1FE17] tabular-nums mb-1.5">
                  {activeProduct.price.toLocaleString('ar-EG')}{' '}
                  <span className="text-[10px] font-normal text-[#898A8B]">ج.م</span>
                </div>

                <p className="text-[10px] sm:text-xs text-white/70 leading-snug mb-1.5">
                  {activeProduct.description}
                </p>

                {activeProduct.fabricDetails && (
                  <div className="mb-1.5 p-2 bg-white/[0.03] rounded-lg border border-white/10 text-[10px] text-white/70 space-y-0.5">
                    <div>
                      <strong>الخامة:</strong> {activeProduct.fabricDetails}
                    </div>
                    <div>
                      <strong>القصة:</strong> {activeProduct.fitType}
                    </div>
                  </div>
                )}

                {/* Sizing options */}
                <div className="space-y-1 mb-2.5">
                  <label className="block text-[11px] font-bold text-white">
                    اختر المقاس:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          selectedSize === s
                            ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17] shadow-xs'
                            : 'bg-[#1A1C1F] text-white/90 border-white/10 hover:border-white/25'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add To Bag CTA */}
              <button
                onClick={() => {
                  addToCart(activeProduct, selectedSize || activeProduct.sizes[0]);
                  setActiveProduct(null);
                }}
                className="w-full shrink-0 py-2.5 bg-[#D1FE17] text-[#131517] font-bold rounded-lg hover:bg-white transition-colors shadow-xs text-[11px] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>إضافة إلى حقيبة التسوق والطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Immediate Multi-Payment Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/60 backdrop-blur-xs flex justify-end">
          <div className="bg-[#1A1C1F] w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm text-white">حقيبة التسوق والتوصيل السريع</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-md text-[#898A8B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items & Form */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-white/80 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-white">حقيبة التسوق فارغة</h4>
                  <p className="text-xs text-[#898A8B] mt-1">تصفح القطع وأضف ملابسك المفضلة.</p>
                </div>
              ) : (
                <>
                  {/* Items list */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-white flex justify-between">
                      <span>المتجر المصدر: {cartVendor?.name}</span>
                      <span className="text-[#898A8B] font-normal">{cartVendor?.area}</span>
                    </div>

                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-md"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-16 rounded object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-[#898A8B]">
                            مقاس: <strong className="text-white/90">{item.size}</strong>
                          </div>
                          <div className="font-bold text-xs text-white tabular-nums mt-1">
                            {item.product.price.toLocaleString('ar-EG')} ج.م
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1 bg-[#1A1C1F] border border-white/10 rounded p-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Minus className="w-3 h-3 text-white/70" />
                          </button>
                          <span className="px-1.5 text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Plus className="w-3 h-3 text-white/70" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information & Delivery Address Form */}
                  <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                    <div className="font-bold text-white">بيانات التوصيل للعميل:</div>

                    <div>
                      <label className="block text-white/70 mb-1">الاسم الكامل:</label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full p-2 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 mb-1">رقم الهاتف:</label>
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full p-2 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs font-mono"
                      />
                    </div>

                    {/* Interactive Google Map Location Picker & GPS (Requirement 1) */}
                    {cartVendor ? (
                      <div className="pt-1">
                        <LocationPickerMap
                          vendor={cartVendor}
                          initialCoordinates={custCoordinates}
                          onLocationSelected={(coords, areaName, roadDist) => {
                            setCustCoordinates(coords);
                            setCustArea(areaName);
                            setCustRoadDistanceKm(roadDist);
                          }}
                          currentAddressDetail={custAddress}
                          onAddressDetailChange={(detail) => setCustAddress(detail)}
                          calculatedFee={deliveryFee}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-white/70 mb-1">العنوان بالتفصيل:</label>
                        <input
                          type="text"
                          required
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                          className="w-full p-2 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-white/70 mb-1">ملاحظات للطيار (اختياري):</label>
                      <input
                        type="text"
                        value={custNotes}
                        onChange={(e) => setCustNotes(e.target.value)}
                        className="w-full p-2 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs"
                      />
                    </div>
                  </div>

                  {/* Payment Methods Selection (Requirement 3) */}
                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                    <div className="font-bold text-white mb-2">
                      اختر طريقة الدفع (تظهر للطيار بوضوح):
                    </div>

                    {/* Method 1: Cash on Delivery */}
                    <label
                      onClick={() => setSelectedPaymentMethod('cash_on_delivery')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'cash_on_delivery'
                          ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17] shadow-sm'
                          : 'bg-[#1A1C1F] border-white/10 text-white/90 hover:border-white/15'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selectedPaymentMethod === 'cash_on_delivery'}
                        onChange={() => setSelectedPaymentMethod('cash_on_delivery')}
                        className="mt-0.5 accent-white"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>كاش عند الاستلام (COD)</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${selectedPaymentMethod === 'cash_on_delivery' ? 'bg-[#1C1E21] text-white/90' : 'bg-white/[0.06] text-white/70'}`}>
                            نقداً
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${selectedPaymentMethod === 'cash_on_delivery' ? 'text-white/80' : 'text-[#898A8B]'}`}>
                          الدفع نقداً للكابتن عند باب البيت بعد معاينة القطعة واستلامها.
                        </p>
                      </div>
                    </label>

                    {/* Method 2: Vodafone Cash / E-Wallet */}
                    <label
                      onClick={() => setSelectedPaymentMethod('vodafone_cash')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'vodafone_cash'
                          ? 'bg-red-500/15 text-white border-red-500/30 shadow-sm'
                          : 'bg-[#1A1C1F] border-white/10 text-white/90 hover:border-white/15'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selectedPaymentMethod === 'vodafone_cash'}
                        onChange={() => setSelectedPaymentMethod('vodafone_cash')}
                        className="mt-0.5 accent-red-400"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>محفظة إلكترونية / فودافون كاش</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${selectedPaymentMethod === 'vodafone_cash' ? 'bg-red-500/15 text-white' : 'bg-red-500/10 text-red-400'}`}>
                            محفظة
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${selectedPaymentMethod === 'vodafone_cash' ? 'text-red-300' : 'text-[#898A8B]'}`}>
                          تحويل المبلغ لمحفظة الطيار الإلكترونية أو فودافون كاش عند الوصول.
                        </p>
                      </div>
                    </label>

                    {/* Method 3: InstaPay */}
                    <label
                      onClick={() => setSelectedPaymentMethod('instapay')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'instapay'
                          ? 'bg-white/10 text-white border-white/15 shadow-sm'
                          : 'bg-[#1A1C1F] border-white/10 text-white/90 hover:border-white/15'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selectedPaymentMethod === 'instapay'}
                        onChange={() => setSelectedPaymentMethod('instapay')}
                        className="mt-0.5 accent-white/80"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>إنستاباي (InstaPay IPN)</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${selectedPaymentMethod === 'instapay' ? 'bg-white/10 text-white' : 'bg-white/10 text-white/80'}`}>
                            لحظي
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${selectedPaymentMethod === 'instapay' ? 'text-white/80' : 'text-[#898A8B]'}`}>
                          تحويل بنكي لحظي عبر تطبيق إنستاباي أو تطبيق بنكك وإظهار الإشعار للطيار.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-white/70">
                      <span>ثمن الملابس ({cart.reduce((s, i) => s + i.quantity, 0)} قطع):</span>
                      <span className="font-bold tabular-nums text-white">
                        {clothesSubtotal.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="flex justify-between text-white/70">
                      <span>
                        رسوم التوصيل السريع ({estimatedDistance} كم من فرع {cartVendor?.area}):
                      </span>
                      <span className="font-bold tabular-nums text-white">
                        {deliveryFee.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm">
                      <span className="font-extrabold text-white">
                        الإجمالي المطلوب دفعه:
                      </span>
                      <span className="font-extrabold text-base text-white tabular-nums">
                        {totalCodAmount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="text-[11px] text-[#898A8B] pt-1 border-t border-white/10 flex items-center justify-between">
                      <span>طريقة الدفع:</span>
                      <strong className="text-white">
                        {selectedPaymentMethod === 'vodafone_cash'
                          ? 'فودافون كاش'
                          : selectedPaymentMethod === 'instapay'
                          ? 'إنستاباي لحظي'
                          : 'كاش عند الاستلام'}
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout Action Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-[#1A1C1F]">
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full py-3.5 bg-[#D1FE17] text-[#131517] font-bold rounded-md hover:bg-white transition-colors shadow-lg text-xs"
                >
                  تأكيد وإرسال طلب التوصيل السريع ({totalCodAmount.toLocaleString('ar-EG')} ج.م)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Orders History Drawer (Requirement 2) */}
      {isOrdersDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/60 backdrop-blur-xs flex justify-end">
          <div className="bg-[#1A1C1F] w-full max-w-lg h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  <span>سجل طلباتي وتتبع التوصيل</span>
                </h3>
                {currentCustomer && (
                  <p className="text-xs text-[#898A8B] mt-0.5">
                    العميل: {currentCustomer.name} ({currentCustomer.phone})
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOrdersDrawerOpen(false)}
                className="p-1 rounded-md text-[#898A8B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orders Feed */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {customerOrders.length === 0 ? (
                <div className="py-20 text-center">
                  <ListOrdered className="w-12 h-12 text-white/80 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-white">لا توجد طلبات سابقة مسجلة</h4>
                  <p className="text-xs text-[#898A8B] mt-1">
                    طلبك القادم سيظهر هنا فور إرساله لتتبعه خطوة بخطوة.
                  </p>
                </div>
              ) : (
                customerOrders.map((ord) => {
                  const isPending = ord.status === 'pending_vendor';
                  const isReady = ord.status === 'ready_for_driver';
                  const isAssigned = ord.status === 'driver_assigned';
                  const isPickedUp = ord.status === 'picked_up_paid_store';
                  const isDelivered = ord.status === 'delivered';
                  const isReturning = ord.status === 'returning_to_vendor';
                  const isReturned = ord.status === 'returned_to_store' || ord.status === 'returned_completed';
                  const isCancelled = ord.status === 'cancelled_by_vendor' || ord.status === 'cancelled';

                  return (
                    <div
                      key={ord.id}
                      className="border border-white/10 rounded-lg p-4 bg-white/[0.03] space-y-3"
                    >
                      {/* Top Order bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                        <div>
                          <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                          <span className="text-[#898A8B] mr-2">· {ord.createdAt}</span>
                        </div>
                        <div>
                          {isPending && (
                            <span className="bg-amber-400/15 text-amber-300 border border-amber-400/50 text-[11px] font-bold px-2 py-0.5 rounded">
                              بانتظار فحص المخزن
                            </span>
                          )}
                          {isReady && (
                            <span className="bg-white/10 text-white/90 text-[11px] font-bold px-2 py-0.5 rounded">
                              تم التجهيز · يبحث عن طيار
                            </span>
                          )}
                          {isAssigned && (
                            <span className="bg-white/10 text-white/80 text-[11px] font-bold px-2 py-0.5 rounded">
                              الطيار في المتجر للاستلام
                            </span>
                          )}
                          {isPickedUp && (
                            <span className="bg-[#D1FE17]/15 text-[#D1FE17] text-[11px] font-bold px-2 py-0.5 rounded animate-pulse">
                              الطيار في الطريق إليك 🛵
                            </span>
                          )}
                          {isDelivered && (
                            <span className="bg-[#D1FE17]/15 text-[#D1FE17] text-[11px] font-bold px-2 py-0.5 rounded">
                              تم التوصيل بنجاح ✓
                            </span>
                          )}
                          {isReturning && (
                            <span className="bg-red-500/15 text-red-400 text-[11px] font-bold px-2 py-0.5 rounded">
                              مرتجع في الطريق للمحل ↩
                            </span>
                          )}
                          {isReturned && (
                            <span className="bg-white/10 text-white/80 text-[11px] font-bold px-2 py-0.5 rounded">
                              تم إرجاع الطلب للمحل
                            </span>
                          )}
                          {isCancelled && (
                            <span className="bg-red-500/15 text-red-400 text-[11px] font-bold px-2 py-0.5 rounded">
                              المقاس غير متوفر (ملغي)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Store & Route */}
                      <div className="text-xs text-white/70 flex justify-between">
                        <div>
                          <strong>المتجر:</strong> {ord.vendorName} ({ord.vendorArea})
                        </div>
                        <div>
                          <strong>إلى:</strong> {ord.customerArea}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 py-1">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-white/90 font-medium">
                              {item.product.name} (مقاس {item.size}) × {item.quantity}
                            </span>
                            <span className="font-bold tabular-nums text-white">
                              {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Driver visual identity card (Uber Style) */}
                      {ord.driverName && (
                        <div className="bg-[#131517] text-white rounded-lg p-3 space-y-2 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={ord.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                                alt={ord.driverName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/15 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-white">كابتن: {ord.driverName}</span>
                                  <span className="text-[10px] bg-[#1C1E21] text-white/80 font-mono px-1.5 py-0.5 rounded border border-white/15">
                                    {ord.driverVehicleNumber || 'س ب د ٩٥١'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#898A8B] mt-0.5">
                                  {ord.status === 'picked_up_paid_store'
                                    ? 'استلم القطعة وفي طريقه لعنوانك'
                                    : ord.status === 'returning_to_vendor'
                                    ? 'في طريق العودة للمتجر'
                                    : 'في طريقه للمحل للاستلام'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {ord.driverVehiclePhoto && (
                                <img
                                  src={ord.driverVehiclePhoto}
                                  alt="الدراجة"
                                  className="w-10 h-10 rounded object-cover border border-white/15 hidden sm:block"
                                  title="دراجة الكابتن"
                                />
                              )}
                              {ord.driverPhone && (
                                <a
                                  href={`tel:${ord.driverPhone}`}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#D1FE17] hover:bg-white text-[#131517] rounded-md font-bold text-xs shadow-xs"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>اتصال</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* LIVE MAP TRACKING (FOR 'picked_up_paid_store' ORDERS) */}
                      {isPickedUp && (
                        <div className="space-y-2 pt-1 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMapOrderIds((prev) =>
                                  prev.includes(ord.id)
                                    ? prev.filter((id) => id !== ord.id)
                                    : [...prev, ord.id]
                                );
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-[#D1FE17]/10 hover:bg-[#D1FE17]/15 border border-[#D1FE17]/25 text-white transition-colors shadow-2xs"
                            >
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D1FE17] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D1FE17]"></span>
                              </span>
                              <Navigation className="w-3.5 h-3.5 text-[#D1FE17]" />
                              <span>
                                {openMapOrderIds.includes(ord.id)
                                  ? 'إخفاء الخريطة الحية'
                                  : 'تتبع الكابتن المباشر على الخريطة (Live GPS Map)'}
                              </span>
                            </button>

                            <span className="text-[10px] font-mono font-bold text-[#D1FE17] bg-[#D1FE17]/15 px-2 py-0.5 rounded border border-[#D1FE17]/25">
                              LIVE GPS
                            </span>
                          </div>

                          {/* Interactive Google Map with real-time driver coordinates */}
                          {openMapOrderIds.includes(ord.id) && (
                            <LiveOrderTrackingMap
                              order={ord}
                              driver={drivers.find(
                                (d) => d.id === ord.driverId || d.name === ord.driverName
                              )}
                              heightClassName="h-[280px]"
                            />
                          )}
                        </div>
                      )}

                      {/* Payment Method Badge */}
                      <div className="bg-white/[0.06] p-2.5 rounded text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <span>طريقة الدفع:</span>
                          <span className="font-bold">
                            {ord.paymentMethod === 'vodafone_cash'
                              ? 'محفظة فودافون كاش'
                              : ord.paymentMethod === 'instapay'
                              ? 'إنستاباي لحظي (IPN)'
                              : 'كاش عند الاستلام (COD)'}
                          </span>
                        </div>
                        <div className="font-extrabold text-white tabular-nums">
                          الإجمالي: {ord.totalAmount.toLocaleString('ar-EG')} ج.م
                        </div>
                      </div>

                      {/* POST-DELIVERY STORE & DRIVER RATING SECTION */}
                      {(isDelivered || isPickedUp) && (
                        <div className="pt-2 border-t border-white/10">
                          {ord.vendorRating || ord.driverRating ? (
                            <div className="bg-amber-400/10 border border-amber-400/25 rounded-lg p-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                                  <span>تقييمك المسجل للطلب</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRatingModal(ord)}
                                  className="text-[11px] font-bold text-white/80 hover:text-white underline cursor-pointer"
                                >
                                  تعديل التقييم
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div className="bg-[#1A1C1F] p-2.5 rounded border border-amber-400/25 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white/90 flex items-center gap-1">
                                      <Store className="w-3.5 h-3.5 text-white/70" />
                                      <span>المحل: {ord.vendorName}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 font-mono font-bold text-amber-300">
                                      {ord.vendorRating || 5}/5 ★
                                    </span>
                                  </div>
                                  {ord.vendorReview && (
                                    <p className="text-[11px] text-white/70 leading-normal">
                                      "{ord.vendorReview}"
                                    </p>
                                  )}
                                </div>

                                <div className="bg-[#1A1C1F] p-2.5 rounded border border-amber-400/25 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white/90 flex items-center gap-1">
                                      <Bike className="w-3.5 h-3.5 text-[#D1FE17]" />
                                      <span>الكابتن: {ord.driverName || 'كابتن التوصيل'}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 font-mono font-bold text-amber-300">
                                      {ord.driverRating || 5}/5 ★
                                    </span>
                                  </div>
                                  {ord.driverReview && (
                                    <p className="text-[11px] text-white/70 leading-normal">
                                      "{ord.driverReview}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenRatingModal(ord)}
                              className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-400 text-white font-black rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                            >
                              <Star className="w-4 h-4 fill-white text-white" />
                              <span>
                                {isDelivered
                                  ? 'قيّم تجربتك مع المحل وكابتن التوصيل بعد الاستلام'
                                  : 'تأكيد استلام الطلب وتقييم المحل والكابتن الآن'}
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#1A1C1F]">
              <button
                onClick={() => setIsOrdersDrawerOpen(false)}
                className="w-full py-2.5 bg-[#D1FE17] text-[#131517] font-bold rounded-md text-xs hover:bg-white transition-colors"
              >
                إغلاق سجل الطلبات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login / Register Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">
                {authMode === 'login' ? 'تسجيل دخول العميل' : 'إنشاء حساب عميل جديد'}
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded text-[#898A8B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block text-white/80 font-semibold mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: يوسف إبراهيم"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full p-2.5 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-white/80 font-semibold mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-2.5 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs font-mono"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-white/80 font-semibold mb-1">رقم الهاتف:</label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full p-2.5 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-semibold mb-1">المنطقة:</label>
                    <select
                      value={authArea}
                      onChange={(e) => setAuthArea(e.target.value)}
                      className="w-full p-2.5 border border-white/15 rounded bg-[#1A1C1F] focus:outline-none focus:border-[#D1FE17] text-xs font-medium"
                    >
                      <option value="التجمع الخامس">التجمع الخامس</option>
                      <option value="المعادي">المعادي</option>
                      <option value="الزمالك">الزمالك</option>
                      <option value="مصر الجديدة">مصر الجديدة</option>
                      <option value="الشيخ زايد">الشيخ زايد</option>
                      <option value="الدقي والمهندسين">الدقي والمهندسين</option>
                      <option value="مدينة نصر">مدينة نصر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 font-semibold mb-1">العنوان التفصيلي:</label>
                    <input
                      type="text"
                      required
                      placeholder="شارع 9، المعادي، القاهرة"
                      value={authAddress}
                      onChange={(e) => setAuthAddress(e.target.value)}
                      className="w-full p-2.5 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-white/80 font-semibold mb-1">كلمة المرور:</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-2.5 border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-white/70 underline hover:text-white font-medium"
                >
                  {authMode === 'login'
                    ? 'ليس لديك حساب؟ أنشئ حساباً جديداً'
                    : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                </button>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-3 py-2 border border-white/15 rounded text-white/80 text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="px-5 py-2 bg-[#D1FE17] text-[#131517] rounded text-xs font-bold hover:bg-white disabled:opacity-50 transition-colors"
                >
                  {isAuthSubmitting
                    ? 'جاري التحقق...'
                    : authMode === 'login'
                    ? 'تسجيل الدخول'
                    : 'تأكيد التسجيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed / Live Tracking Modal */}
      {latestPlacedOrder && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#D1FE17]/15 text-[#D1FE17] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-white">
                تم إرسال طلبك للتوصيل السريع بنجاح!
              </h3>
              <p className="text-xs text-[#898A8B] font-mono">
                رقم الطلب: {latestPlacedOrder.orderNumber}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-white/80">
                <span>المتجر المصدر:</span>
                <strong>{latestPlacedOrder.vendorName}</strong>
              </div>
              <div className="flex justify-between text-white/80">
                <span>طريقة الدفع المختارة:</span>
                <span className="font-bold text-white">
                  {latestPlacedOrder.paymentMethod === 'vodafone_cash'
                    ? 'فودافون كاش'
                    : latestPlacedOrder.paymentMethod === 'instapay'
                    ? 'إنستاباي لحظي'
                    : 'كاش عند الاستلام'}
                </span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>عنوان التوصيل:</span>
                <span>{latestPlacedOrder.customerArea}</span>
              </div>
              <div className="flex justify-between text-white/80 pt-1 border-t border-white/10">
                <span>المبلغ الإجمالي للدفع:</span>
                <strong className="text-white tabular-nums">
                  {latestPlacedOrder.totalAmount.toLocaleString('ar-EG')} ج.م
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-[#898A8B] text-center leading-normal">
              يقوم المتجر الآن بتجهيز القطعة وسيتوجه أقرب طيار لدفع ثمنها كاش وإحضارها إليك فوراً.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLatestPlacedOrder(null);
                  setIsOrdersDrawerOpen(true);
                }}
                className="flex-1 py-2.5 bg-white/[0.06] text-white border border-white/10 rounded-md text-xs font-bold hover:bg-white/15 transition-colors"
              >
                تتبع الطلب في سجل طلباتي
              </button>
              <button
                onClick={() => setLatestPlacedOrder(null)}
                className="flex-1 py-2.5 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white transition-colors"
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Delivery Store & Driver Rating Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#131517]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-xl border border-white/10 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>تقييم المحل وكابتن التوصيل بعد الاستلام</span>
                </h3>
                <p className="text-[11px] text-[#898A8B] mt-0.5">
                  الطلب رقم <span className="font-mono font-bold text-white/90">{ratingModalOrder.orderNumber}</span> · يظهر تقييمك مباشرة في لوحة تحكم الإدارة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingModalOrder(null)}
                className="p-1 rounded text-[#898A8B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderRating} className="space-y-4 text-xs">
              {/* 1. Store / Vendor Rating Section */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-white/80" />
                    <span>1. تقييم المتجر والملابس: {ratingModalOrder.vendorName}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
                    {vendorRatingVal} / 5 نجوم
                  </span>
                </div>

                {/* Interactive 5-Star Selector for Store */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setVendorRatingVal(star)}
                      className="p-1.5 rounded-full hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} نجوم للمتجر`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= vendorRatingVal
                            ? 'fill-amber-300 text-amber-300'
                            : 'text-white/80 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Quick Chips for Store */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'خامة ممتازة ومقاس مظبوط',
                    'تغليف شيك وأصلي',
                    'نفس الصورة بالظبط',
                    'المقاس يحتاج ضبط بسيط',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setVendorReviewVal((prev) =>
                          prev.includes(chip) ? prev : prev ? `${prev}، ${chip}` : chip
                        )
                      }
                      className="text-[11px] bg-[#1A1C1F] hover:bg-white/10 hover:text-white text-white/80 border border-white/15 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-medium">
                    ملاحظاتك على المتجر وجودة القطعة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={vendorReviewVal}
                    onChange={(e) => setVendorReviewVal(e.target.value)}
                    placeholder="اكتب رأيك في جودة القماش والمقاس والتغليف..."
                    className="w-full p-2.5 bg-[#1A1C1F] border border-white/15 rounded-md text-xs focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
              </div>

              {/* 2. Driver Rating Section */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-[#D1FE17]" />
                    <span>
                      2. تقييم كابتن التوصيل: {ratingModalOrder.driverName || 'كابتن التوصيل'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
                    {driverRatingVal} / 5 نجوم
                  </span>
                </div>

                {/* Interactive 5-Star Selector for Driver */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDriverRatingVal(star)}
                      className="p-1.5 rounded-full hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} نجوم للكابتن`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= driverRatingVal
                            ? 'fill-amber-300 text-amber-300'
                            : 'text-white/80 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Quick Chips for Driver */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'وصل في الموعد بسرعة',
                    'كابتن محترم ولبق جداً',
                    'انتظرني أعاين القطعة بهدوء',
                    'حافظ على نظافة الشحنة',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setDriverReviewVal((prev) =>
                          prev.includes(chip) ? prev : prev ? `${prev}، ${chip}` : chip
                        )
                      }
                      className="text-[11px] bg-[#1A1C1F] hover:bg-white/10 hover:text-white text-white/80 border border-white/15 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-medium">
                    ملاحظاتك على الكابتن وسرعة التوصيل (اختياري):
                  </label>
                  <input
                    type="text"
                    value={driverReviewVal}
                    onChange={(e) => setDriverReviewVal(e.target.value)}
                    placeholder="اكتب رأيك في تعامل الكابتن وسرعة الوصول..."
                    className="w-full p-2.5 bg-[#1A1C1F] border border-white/15 rounded-md text-xs focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="px-4 py-2 border border-white/15 rounded-md text-white/80 font-medium hover:bg-white/10 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D1FE17] hover:bg-white text-[#131517] font-bold rounded-md shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  <span>اعتماد وإرسال التقييم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
