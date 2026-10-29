import React, { useState, useMemo } from 'react';
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
    customers,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    showToast,
  } = usePlatform();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected product modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Customer Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authPhone, setAuthPhone] = useState('01018301830');
  const [authName, setAuthName] = useState('كريم مجدي');
  const [authArea, setAuthArea] = useState('التجمع الخامس');
  const [authAddress, setAuthAddress] = useState('شارع التسعين، فيلا 14، التجمع الخامس');

  // Customer Orders History Drawer
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);

  // Checkout inputs
  const [custName, setCustName] = useState(currentCustomer?.name || 'كريم مجدي');
  const [custPhone, setCustPhone] = useState(currentCustomer?.phone || '01018301830');
  const [custArea, setCustArea] = useState(currentCustomer?.area || 'التجمع الخامس');
  const [custAddress, setCustAddress] = useState(currentCustomer?.address || 'شارع التسعين، فيلا 14، التجمع الخامس');
  const [custCoordinates, setCustCoordinates] = useState<{ lat: number; lng: number }>(
    currentCustomer?.coordinates || { lat: 30.0131, lng: 31.4289 }
  );
  const [custRoadDistanceKm, setCustRoadDistanceKm] = useState<number>(14.5);
  const [custNotes, setCustNotes] = useState('برجاء الاتصال قبل الوصول لباب العمارة بـ 5 دقائق');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CustomerPaymentMethod>('cash_on_delivery');
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [openMapOrderIds, setOpenMapOrderIds] = useState<string[]>(['ord-101']);

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

  // Customer's order history
  const customerOrders = useMemo(() => {
    if (!currentCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerId === currentCustomer.id ||
        o.customerPhone.trim() === currentCustomer.phone.trim()
    );
  }, [orders, currentCustomer]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const ord = placeOrder({
      customerId: currentCustomer?.id,
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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      const success = loginCustomer(authPhone);
      if (!success) {
        showToast('لم يتم العثور على حساب بهذا الرقم. يرجى إنشاء حساب جديد.', 'error');
        setAuthMode('register');
      } else {
        setIsAuthModalOpen(false);
      }
    } else {
      if (!authName || !authPhone) return;
      registerCustomer({
        name: authName,
        phone: authPhone,
        area: authArea,
        address: authAddress,
      });
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-['Readex_Pro',sans-serif]">
      {/* Top Bar (Zara / Farfetch Clean Contract) */}
      <header className="border-b border-zinc-200 sticky top-0 bg-white/95 backdrop-blur-xs z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-bold tracking-widest text-lg uppercase text-zinc-950">
              VOGUE FAST
            </span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              تسوق براندات الشارع الحصرية مع توصيل سريع في القاهرة
            </span>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full hidden md:block">
            <input
              type="text"
              placeholder="ابحث عن هودي، كارجو، أو براند..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-md pr-8 pl-3 py-2 focus:outline-none focus:border-zinc-900"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5" />
          </div>

          {/* Right Action Icons: Customer Account, My Orders, Shopping Bag */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Customer Account Button */}
            {currentCustomer ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOrdersDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md text-xs font-semibold text-zinc-900 transition-colors"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>سجل طلباتي</span>
                  {customerOrders.length > 0 && (
                    <span className="bg-zinc-900 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                      {customerOrders.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5 pl-2 border-r border-zinc-200">
                  <div className="text-right hidden sm:block">
                    <div className="font-bold text-xs text-zinc-900 leading-none">
                      {currentCustomer.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {currentCustomer.phone}
                    </div>
                  </div>
                  <button
                    onClick={logoutCustomer}
                    title="تسجيل الخروج"
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 rounded-md text-xs font-semibold hover:border-zinc-900 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>دخول / حساب جديد</span>
              </button>
            )}

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-950 text-white rounded-md text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">حقيبة التسوق</span>
              {cart.length > 0 && (
                <span className="bg-white text-zinc-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Editorial Banner (Zara Lookbook Style) */}
      <section className="bg-zinc-950 text-white border-b border-zinc-800 px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
              QUICK COMMERCE STREETWEAR // CAIRO
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
              قطع الشارع الأصلية تصل باب بيتك خلال 45 دقيقة.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
              اختر قطعتك من أفضل براندات الشارع المصرية، والطيار يدفع ثمنها كاش للمحل ويوصلها لك فوراً، مع إمكانية الدفع كاش عند الاستلام أو بمحفظة فودافون كاش أو إنستاباي.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" /> توصيل فوري مباشر بالكيلومتر
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" /> كاش · فودافون كاش · إنستاباي
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> معاينة القطعة واستلام فوري
              </span>
            </div>
          </div>

          {/* Quick stats / brand selector strip */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
            <div className="text-xs font-bold text-zinc-200">البراندات الشريكة في التوصيل اللحظي:</div>
            <div className="flex flex-wrap gap-2">
              {vendors.slice(0, 5).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVendor(v.id)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    selectedVendor === v.id
                      ? 'bg-white text-zinc-950 border-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {v.name} ({v.area})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs Bar */}
      <div className="border-b border-zinc-200 bg-zinc-50 px-6 sticky top-[65px] z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 py-3">
          {/* Categories Segmented */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-zinc-950 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                {cat === 'all' ? 'جميع التصنيفات' : cat}
              </button>
            ))}
          </div>

          {/* Brand Dropdown Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">تصفح براند محدد:</span>
            <select
              aria-label="تصفح براند محدد"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-zinc-900 font-medium"
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

      {/* Products Grid (Zara / ASOS 3/4 aspect ratio) */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                setActiveProduct(product);
                setSelectedSize(product.sizes[0] || 'L');
              }}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* 3:4 Aspect Image */}
                <div className="relative aspect-[3/4] bg-zinc-100 rounded-md overflow-hidden border border-zinc-200 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-zinc-950/80 backdrop-blur-2xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    توصيل 45 دقيقة
                  </div>
                  {product.originalPrice && (
                    <div className="absolute bottom-2.5 right-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      خصم خاص
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
                    {product.vendorName}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 leading-snug line-clamp-1 group-hover:text-zinc-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm text-zinc-950 tabular-nums">
                      {product.price.toLocaleString('ar-EG')} ج.م
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-zinc-400 line-through tabular-nums">
                        {product.originalPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sizes hint */}
              <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-1">
                <span>المقاسات:</span>
                <span>{product.sizes.join(' · ')}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 grid grid-cols-1 sm:grid-cols-2">
            {/* Image */}
            <div className="aspect-[3/4] sm:aspect-auto bg-zinc-100">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    {activeProduct.vendorName}
                  </span>
                  <button
                    onClick={() => setActiveProduct(null)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-zinc-950 mb-2">
                  {activeProduct.name}
                </h2>

                <div className="text-xl font-bold text-zinc-950 tabular-nums mb-4">
                  {activeProduct.price.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-zinc-500">ج.م</span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  {activeProduct.description}
                </p>

                {activeProduct.fabricDetails && (
                  <div className="mb-4 p-2.5 bg-zinc-50 rounded border border-zinc-200 text-xs text-zinc-600 space-y-1">
                    <div>
                      <strong>الخامة:</strong> {activeProduct.fabricDetails}
                    </div>
                    <div>
                      <strong>القصة:</strong> {activeProduct.fitType}
                    </div>
                  </div>
                )}

                {/* Sizing options */}
                <div className="space-y-1.5 mb-6">
                  <label className="block text-xs font-bold text-zinc-900">
                    اختر المقاس:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                          selectedSize === s
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
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
                className="w-full py-3 bg-zinc-950 text-white font-bold rounded-md hover:bg-zinc-800 transition-colors shadow-xs text-xs flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-950" />
                <h3 className="font-bold text-sm text-zinc-950">حقيبة التسوق والتوصيل السريع</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items & Form */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-zinc-900">حقيبة التسوق فارغة</h4>
                  <p className="text-xs text-zinc-500 mt-1">تصفح القطع وأضف ملابسك المفضلة.</p>
                </div>
              ) : (
                <>
                  {/* Items list */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-zinc-900 flex justify-between">
                      <span>المتجر المصدر: {cartVendor?.name}</span>
                      <span className="text-zinc-500 font-normal">{cartVendor?.area}</span>
                    </div>

                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-16 rounded object-cover border border-zinc-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-zinc-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-zinc-500">
                            مقاس: <strong className="text-zinc-800">{item.size}</strong>
                          </div>
                          <div className="font-bold text-xs text-zinc-950 tabular-nums mt-1">
                            {item.product.price.toLocaleString('ar-EG')} ج.م
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded p-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                            className="p-1 hover:bg-zinc-100 rounded"
                          >
                            <Minus className="w-3 h-3 text-zinc-600" />
                          </button>
                          <span className="px-1.5 text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                            className="p-1 hover:bg-zinc-100 rounded"
                          >
                            <Plus className="w-3 h-3 text-zinc-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information & Delivery Address Form */}
                  <div className="space-y-3 pt-3 border-t border-zinc-200 text-xs">
                    <div className="font-bold text-zinc-900">بيانات التوصيل للعميل:</div>

                    <div>
                      <label className="block text-zinc-600 mb-1">الاسم الكامل:</label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 mb-1">رقم الهاتف:</label>
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs font-mono"
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
                        <label className="block text-zinc-600 mb-1">العنوان بالتفصيل:</label>
                        <input
                          type="text"
                          required
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                          className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-zinc-600 mb-1">ملاحظات للطيار (اختياري):</label>
                      <input
                        type="text"
                        value={custNotes}
                        onChange={(e) => setCustNotes(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs"
                      />
                    </div>
                  </div>

                  {/* Payment Methods Selection (Requirement 3) */}
                  <div className="space-y-2 pt-3 border-t border-zinc-200 text-xs">
                    <div className="font-bold text-zinc-900 mb-2">
                      اختر طريقة الدفع (تظهر للطيار بوضوح):
                    </div>

                    {/* Method 1: Cash on Delivery */}
                    <label
                      onClick={() => setSelectedPaymentMethod('cash_on_delivery')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'cash_on_delivery'
                          ? 'bg-zinc-900 text-white border-zinc-950 shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selectedPaymentMethod === 'cash_on_delivery'}
                        onChange={() => setSelectedPaymentMethod('cash_on_delivery')}
                        className="mt-0.5 accent-zinc-950"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>كاش عند الاستلام (COD)</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${selectedPaymentMethod === 'cash_on_delivery' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'}`}>
                            نقداً
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${selectedPaymentMethod === 'cash_on_delivery' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          الدفع نقداً للكابتن عند باب البيت بعد معاينة القطعة واستلامها.
                        </p>
                      </div>
                    </label>

                    {/* Method 2: Vodafone Cash / E-Wallet */}
                    <label
                      onClick={() => setSelectedPaymentMethod('vodafone_cash')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'vodafone_cash'
                          ? 'bg-red-950 text-white border-red-800 shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selectedPaymentMethod === 'vodafone_cash'}
                        onChange={() => setSelectedPaymentMethod('vodafone_cash')}
                        className="mt-0.5 accent-red-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>محفظة إلكترونية / فودافون كاش</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${selectedPaymentMethod === 'vodafone_cash' ? 'bg-red-800 text-white' : 'bg-red-50 text-red-700'}`}>
                            محفظة
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${selectedPaymentMethod === 'vodafone_cash' ? 'text-red-200' : 'text-zinc-500'}`}>
                          تحويل المبلغ لمحفظة الطيار الإلكترونية أو فودافون كاش عند الوصول.
                        </p>
                      </div>
                    </label>

                    {/* Method 3: InstaPay */}
                    <label
                      onClick={() => setSelectedPaymentMethod('instapay')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'instapay'
                          ? 'bg-purple-950 text-white border-purple-800 shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selectedPaymentMethod === 'instapay'}
                        onChange={() => setSelectedPaymentMethod('instapay')}
                        className="mt-0.5 accent-purple-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>إنستاباي (InstaPay IPN)</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${selectedPaymentMethod === 'instapay' ? 'bg-purple-800 text-white' : 'bg-purple-50 text-purple-700'}`}>
                            لحظي
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-normal ${selectedPaymentMethod === 'instapay' ? 'text-purple-200' : 'text-zinc-500'}`}>
                          تحويل بنكي لحظي عبر تطبيق إنستاباي أو تطبيق بنكك وإظهار الإشعار للطيار.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>ثمن الملابس ({cart.reduce((s, i) => s + i.quantity, 0)} قطع):</span>
                      <span className="font-bold tabular-nums text-zinc-900">
                        {clothesSubtotal.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-600">
                      <span>
                        رسوم التوصيل السريع ({estimatedDistance} كم من فرع {cartVendor?.area}):
                      </span>
                      <span className="font-bold tabular-nums text-zinc-900">
                        {deliveryFee.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-sm">
                      <span className="font-extrabold text-zinc-950">
                        الإجمالي المطلوب دفعه:
                      </span>
                      <span className="font-extrabold text-base text-zinc-950 tabular-nums">
                        {totalCodAmount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200 flex items-center justify-between">
                      <span>طريقة الدفع:</span>
                      <strong className="text-zinc-900">
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
              <div className="p-5 border-t border-zinc-200 bg-white">
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full py-3.5 bg-zinc-950 text-white font-bold rounded-md hover:bg-zinc-800 transition-colors shadow-lg text-xs"
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
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  <span>سجل طلباتي وتتبع التوصيل</span>
                </h3>
                {currentCustomer && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    العميل: {currentCustomer.name} ({currentCustomer.phone})
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOrdersDrawerOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orders Feed */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {customerOrders.length === 0 ? (
                <div className="py-20 text-center">
                  <ListOrdered className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-zinc-900">لا توجد طلبات سابقة مسجلة</h4>
                  <p className="text-xs text-zinc-500 mt-1">
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
                      className="border border-zinc-200 rounded-lg p-4 bg-zinc-50/50 space-y-3"
                    >
                      {/* Top Order bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 text-xs">
                        <div>
                          <span className="font-mono font-bold text-zinc-950">{ord.orderNumber}</span>
                          <span className="text-zinc-400 mr-2">· {ord.createdAt}</span>
                        </div>
                        <div>
                          {isPending && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded">
                              بانتظار فحص المخزن
                            </span>
                          )}
                          {isReady && (
                            <span className="bg-zinc-200 text-zinc-800 text-[11px] font-bold px-2 py-0.5 rounded">
                              تم التجهيز · يبحث عن طيار
                            </span>
                          )}
                          {isAssigned && (
                            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded">
                              الطيار في المتجر للاستلام
                            </span>
                          )}
                          {isPickedUp && (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded animate-pulse">
                              الطيار في الطريق إليك 🛵
                            </span>
                          )}
                          {isDelivered && (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                              تم التوصيل بنجاح ✓
                            </span>
                          )}
                          {isReturning && (
                            <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded">
                              مرتجع في الطريق للمحل ↩
                            </span>
                          )}
                          {isReturned && (
                            <span className="bg-zinc-200 text-zinc-700 text-[11px] font-bold px-2 py-0.5 rounded">
                              تم إرجاع الطلب للمحل
                            </span>
                          )}
                          {isCancelled && (
                            <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded">
                              المقاس غير متوفر (ملغي)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Store & Route */}
                      <div className="text-xs text-zinc-600 flex justify-between">
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
                            <span className="text-zinc-800 font-medium">
                              {item.product.name} (مقاس {item.size}) × {item.quantity}
                            </span>
                            <span className="font-bold tabular-nums text-zinc-950">
                              {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Driver visual identity card (Uber Style) */}
                      {ord.driverName && (
                        <div className="bg-zinc-950 text-white rounded-lg p-3 space-y-2 border border-zinc-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={ord.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                                alt={ord.driverName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-white">كابتن: {ord.driverName}</span>
                                  <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700">
                                    {ord.driverVehicleNumber || 'س ب د ٩٥١'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-zinc-400 mt-0.5">
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
                                  className="w-10 h-10 rounded object-cover border border-zinc-700 hidden sm:block"
                                  title="دراجة الكابتن"
                                />
                              )}
                              {ord.driverPhone && (
                                <a
                                  href={`tel:${ord.driverPhone}`}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs shadow-xs"
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
                        <div className="space-y-2 pt-1 border-t border-zinc-200">
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
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-zinc-950 transition-colors shadow-2xs"
                            >
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                              <span>
                                {openMapOrderIds.includes(ord.id)
                                  ? 'إخفاء الخريطة الحية'
                                  : 'تتبع الكابتن المباشر على الخريطة (Live GPS Map)'}
                              </span>
                            </button>

                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
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
                      <div className="bg-zinc-100/70 p-2.5 rounded text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-zinc-700">
                          <span>طريقة الدفع:</span>
                          <span className="font-bold">
                            {ord.paymentMethod === 'vodafone_cash'
                              ? 'محفظة فودافون كاش'
                              : ord.paymentMethod === 'instapay'
                              ? 'إنستاباي لحظي (IPN)'
                              : 'كاش عند الاستلام (COD)'}
                          </span>
                        </div>
                        <div className="font-extrabold text-zinc-950 tabular-nums">
                          الإجمالي: {ord.totalAmount.toLocaleString('ar-EG')} ج.م
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 bg-white">
              <button
                onClick={() => setIsOrdersDrawerOpen(false)}
                className="w-full py-2.5 bg-zinc-950 text-white font-bold rounded-md text-xs hover:bg-zinc-800 transition-colors"
              >
                إغلاق سجل الطلبات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login / Register Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-sm text-zinc-950">
                {authMode === 'login' ? 'تسجيل دخول العميل' : 'إنشاء حساب عميل جديد'}
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Switcher */}
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1.5">
              <span className="text-zinc-500 font-semibold block text-[11px]">
                أو اختر حساب عميل تجريبي فوراً:
              </span>
              <div className="flex gap-2">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      loginCustomer(c.phone);
                      setIsAuthModalOpen(false);
                    }}
                    className="flex-1 py-1 px-2 border border-zinc-300 rounded text-center text-xs font-bold hover:bg-white hover:border-zinc-900 transition-all"
                  >
                    {c.name} ({c.area})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: يوسف إبراهيم"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">رقم الهاتف:</label>
                <input
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs font-mono"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">المنطقة:</label>
                    <select
                      value={authArea}
                      onChange={(e) => setAuthArea(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white focus:outline-none focus:border-zinc-900 text-xs font-medium"
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
                    <label className="block text-zinc-700 font-semibold mb-1">العنوان التفصيلي:</label>
                    <input
                      type="text"
                      required
                      placeholder="شارع 9، المعادي، القاهرة"
                      value={authAddress}
                      onChange={(e) => setAuthAddress(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">كلمة المرور:</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  defaultValue="123456"
                  className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-zinc-600 underline hover:text-zinc-950 font-medium"
                >
                  {authMode === 'login'
                    ? 'ليس لديك حساب؟ أنشئ حساباً جديداً'
                    : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-3 py-2 border border-zinc-300 rounded text-zinc-700 text-xs font-medium hover:bg-zinc-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 text-white rounded text-xs font-bold hover:bg-zinc-800 transition-colors"
                >
                  {authMode === 'login' ? 'تسجيل الدخول' : 'تأكيد التسجيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed / Live Tracking Modal */}
      {latestPlacedOrder && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-950">
                تم إرسال طلبك للتوصيل السريع بنجاح!
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                رقم الطلب: {latestPlacedOrder.orderNumber}
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-700">
                <span>المتجر المصدر:</span>
                <strong>{latestPlacedOrder.vendorName}</strong>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>طريقة الدفع المختارة:</span>
                <span className="font-bold text-zinc-950">
                  {latestPlacedOrder.paymentMethod === 'vodafone_cash'
                    ? 'فودافون كاش'
                    : latestPlacedOrder.paymentMethod === 'instapay'
                    ? 'إنستاباي لحظي'
                    : 'كاش عند الاستلام'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>عنوان التوصيل:</span>
                <span>{latestPlacedOrder.customerArea}</span>
              </div>
              <div className="flex justify-between text-zinc-700 pt-1 border-t border-zinc-200">
                <span>المبلغ الإجمالي للدفع:</span>
                <strong className="text-zinc-950 tabular-nums">
                  {latestPlacedOrder.totalAmount.toLocaleString('ar-EG')} ج.م
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center leading-normal">
              يقوم المتجر الآن بتجهيز القطعة وسيتوجه أقرب طيار لدفع ثمنها كاش وإحضارها إليك فوراً.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLatestPlacedOrder(null);
                  setIsOrdersDrawerOpen(true);
                }}
                className="flex-1 py-2.5 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-md text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                تتبع الطلب في سجل طلباتي
              </button>
              <button
                onClick={() => setLatestPlacedOrder(null)}
                className="flex-1 py-2.5 bg-zinc-950 text-white rounded-md text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
