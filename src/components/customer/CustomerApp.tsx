import { usePlatform } from '../../context/PlatformContext';
import React from "react"
import { useEffect, useState } from "react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Eye,
  Globe2,
  Heart,
  Home,
  LocateFixed,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Trash2,
  Truck,
  X,
  Zap,
  User,
  LogOut,
  Star,
  Phone,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Package,
  ListOrdered,
} from "lucide-react"
import { CustomerPaymentMethod, CustomerUser, Order, OrderStatus, Product as BackendProduct, Vendor } from '../../types';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { calculateGeoDistanceKm, getCairoAreaName } from '../../data/mockData';
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
const fastDripMark = "/brand/fast-drip-mark.webp"

type Product = {
  id: string | number
  name: string
  brand: string
  vendorId?: string
  price: number
  originalPrice?: number
  image: string
  tag?: string
  color: string
  category: string
  sizes?: string[]
  inStock?: boolean
  description?: string
  fabricDetails?: string
  fitType?: string
}

const images = {
  hero: "https://images.unsplash.com/photo-1645564978060-96bbbcd2194f?auto=format&fit=crop&w=1800&q=88",
  campaign:
    "https://images.unsplash.com/photo-1615222443417-6d76586644a9?auto=format&fit=crop&w=1400&q=85",
}

const products: Product[] = [
  {
    id: 1,
    name: "Heavyweight Oversized Hoodie",
    brand: "UNTITLED CAIRO",
    price: 980,
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=85",
    tag: "Just dropped",
    color: "Carbon",
    category: "Hoodies & Sweatshirts",
  },
  {
    id: 2,
    name: "Parachute Bomber Jacket",
    brand: "SHABAB CO.",
    price: 1350,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    tag: "Fast delivery",
    color: "Graphite",
    category: "Jackets",
  },
  {
    id: 3,
    name: "Double Cord Cargo",
    brand: "ZAG STORE",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=85",
    color: "Sand",
    category: "Pants",
  },
  {
    id: 4,
    name: "Washed Graphic Tee",
    brand: "OVERSIZED EG",
    price: 520,
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85",
    tag: "Trending",
    color: "Concrete",
    category: "T-Shirts",
  },
  {
    id: 5,
    name: "Mono Street Runner",
    brand: "NOIR ATELIER",
    price: 1850,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
    color: "Sand / Black",
    category: "Sneakers",
  },
  {
    id: 6,
    name: "Technical Transit Vest",
    brand: "UNTITLED CAIRO",
    price: 1100,
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=85",
    tag: "Low stock",
    color: "Black",
    category: "Jackets",
  },
  {
    id: 7,
    name: "Studio Wide-Leg Trouser",
    brand: "UNTITLED CAIRO",
    price: 890,
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=85",
    color: "Ink",
    category: "Pants",
  },
  {
    id: 8,
    name: "Zamalek Club Jersey",
    brand: "SHABAB CO.",
    price: 640,
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
    tag: "New",
    color: "Off White",
    category: "T-Shirts",
  },
  {
    id: 9,
    name: "Court Low 01",
    brand: "SHABAB CO.",
    price: 1650,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    color: "Red / Bone",
    category: "Sneakers",
  },
  {
    id: 10,
    name: "Utility Shell Jacket",
    brand: "ZAG STORE",
    price: 1490,
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
    tag: "Weather ready",
    color: "Olive",
    category: "Jackets",
  },
  {
    id: 11,
    name: "New Cairo Runner",
    brand: "ZAG STORE",
    price: 1780,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
    color: "Cream",
    category: "Sneakers",
  },
  {
    id: 12,
    name: "Boxy Zip Sweatshirt",
    brand: "OVERSIZED EG",
    price: 920,
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
    color: "Marl Grey",
    category: "Hoodies & Sweatshirts",
  },
  {
    id: 13,
    name: "Korba Relaxed Denim",
    brand: "OVERSIZED EG",
    price: 1050,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    tag: "Best seller",
    color: "Vintage Blue",
    category: "Jeans",
  },
  {
    id: 14,
    name: "Arkan Technical Blazer",
    brand: "NOIR ATELIER",
    price: 2200,
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
    tag: "Noir exclusive",
    color: "Deep Black",
    category: "Jackets",
  },
  {
    id: 15,
    name: "Pleated Night Trouser",
    brand: "NOIR ATELIER",
    price: 1280,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    color: "Night",
    category: "Pants",
  },
]

const categories = [
  { name: "Sneakers", count: "Multi-store edit", image: products[4].image },
  { name: "Jackets", count: "Multi-store edit", image: products[1].image },
  { name: "Pants", count: "Multi-store edit", image: products[2].image },
  { name: "T-Shirts", count: "Multi-store edit", image: products[3].image },
]

const storefrontCategories = [
  "All Products",
  "New Arrivals",
  "T-Shirts",
  "Shirts",
  "Hoodies & Sweatshirts",
  "Jackets",
  "Pants",
  "Jeans",
  "Shorts",
  "Sneakers",
  "Accessories",
] as const

const existingSizes = ["XS", "S", "M", "L", "XL"]

const stores = [
  {
    name: "UNTITLED CAIRO",
    vendorId: "v-1",
    location: "Maadi, Degla",
    time: "25–35 min",
    image:
      "https://images.unsplash.com/photo-1663577272066-fb0545944591?auto=format&fit=crop&w=1000&q=85",
    code: "FD/01",
    slug: "untitled-cairo",
  },
  {
    name: "SHABAB CO.",
    vendorId: "v-2",
    location: "Zamalek",
    time: "18–25 min",
    image:
      "https://images.unsplash.com/photo-1668419394157-0cd203812c08?auto=format&fit=crop&w=1000&q=85",
    code: "FD/02",
    slug: "shabab-co",
  },
  {
    name: "ZAG STORE",
    vendorId: "v-3",
    location: "New Cairo",
    time: "30–40 min",
    image:
      "https://images.unsplash.com/photo-1664359028938-53a4333efb17?auto=format&fit=crop&w=1000&q=85",
    code: "FD/03",
    slug: "zag-store",
  },
  {
    name: "OVERSIZED EG",
    vendorId: "v-4",
    location: "Heliopolis, Korba",
    time: "25–35 min",
    image:
      "https://images.unsplash.com/photo-1664359028599-c3ac398825e0?auto=format&fit=crop&w=1000&q=85",
    code: "FD/04",
    slug: "oversized-eg",
  },
  {
    name: "NOIR ATELIER",
    vendorId: "v-5",
    location: "Sheikh Zayed, Arkan",
    time: "35–45 min",
    image:
      "https://images.unsplash.com/photo-1615222443417-6d76586644a9?auto=format&fit=crop&w=1000&q=85",
    code: "FD/05",
    slug: "noir-atelier",
  },
]

type PartnerStore = typeof stores[number]
type PendingStoreSwitch = {
  store: PartnerStore
  pendingProduct?: Product
  pendingSize?: string
  pendingQuantity?: number
}

const ease = [0.22, 1, 0.36, 1] as const
const formatPrice = (price: number) => `EGP ${price.toLocaleString("en-EG")}`

function IconButton({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`icon-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  index,
  action = "View all",
  onAction,
}: {
  eyebrow: string
  title: string
  index: string
  action?: string
  onAction?: () => void
}) {
  return (
    <Reveal className="section-head">
      <div>
        <span className="eyebrow">
          {index} / {eyebrow}
        </span>
        <h2>{title}</h2>
      </div>
      <button className="text-link" onClick={onAction}>
        {action} <ArrowUpRight size={16} />
      </button>
    </Reveal>
  )
}

function ProductCard({
  product,
  index,
  favorites,
  onFavorite,
  onSelect,
}: {
  product: Product
  index: number
  favorites: number[]
  onFavorite: (id: number) => void
  onSelect: (product: Product) => void
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <Reveal className="product-card" delay={(index % 2) * 0.08}>
      <motion.div
        className="product-visual"
        onClick={() => onSelect(product)}
        whileTap={{ scale: 0.985 }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onSelect(product)
        }}
        aria-label={`View ${product.name}`}
      >
        {!loaded && <span className="skeleton" />}
        <motion.img
          layoutId={`product-${product.id}`}
          src={product.image}
          alt={product.name}
          onLoad={() => setLoaded(true)}
          className={loaded ? "is-loaded" : ""}
          whileHover={{ scale: 1.035 }}
          transition={{ duration: 0.5, ease }}
        />
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <IconButton
          label={`Save ${product.name}`}
          className={favorites.includes(product.id) ? "is-active" : ""}
          onClick={(event) => {
            event.stopPropagation()
            onFavorite(product.id)
          }}
        >
          <Heart
            size={17}
            fill={favorites.includes(product.id) ? "currentColor" : "none"}
          />
        </IconButton>
      </motion.div>
      <button className="product-info" onClick={() => onSelect(product)}>
        <span>
          <small>{product.brand}</small>
          <strong>{product.name}</strong>
        </span>
        <span className="price">{formatPrice(product.price)}</span>
      </button>
    </Reveal>
  )
}

function ProductModal({
  product,
  onClose,
  onAdd,
  isArabic = false,
}: {
  product: Product
  onClose: () => void
  onAdd: (product: Product, size: string, quantity: number) => void
  isArabic?: boolean
}) {
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL"]
  const [size, setSize] = useState(availableSizes[0] || "M")
  const [quantity, setQuantity] = useState(1)
  const isOutOfStock = product.inStock === false

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        className="product-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.5, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-image">
          <motion.img
            layoutId={`product-${product.id}`}
            src={product.image}
            alt={product.name}
          />
          <IconButton label="Close product details" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="modal-content">
          <span className="eyebrow">{isArabic ? "المتجر الرسمي" : "Sold by"} / {product.brand}</span>
          <div className="modal-title">
            <h2>{product.name}</h2>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <p>
            {product.description || (isArabic
              ? `متوفر مباشرة وحصرياً من متجر ${product.brand}. استلام وتجهيز فوري مع توصيل مباشر في القاهرة خلال أقل من 45 دقيقة.`
              : `Available directly from ${product.brand}. One local checkout, with pickup from the store and delivery across Cairo in under 45 minutes.`)}
          </p>
          <div className="product-assurance">
            <span>
              <PackageCheck size={15} /> {isArabic ? "المخزون مؤكد وفحص فوري" : "Stock confirmed 2 min ago"}
            </span>
            <span>
              <Eye size={15} /> {isArabic ? "عاين القطع قبل الاستلام عند بابك" : "Inspect before accepting at your door"}
            </span>
          </div>
          <div className="sizes" aria-label="Select size">
            {availableSizes.map((item) => (
              <button
                key={item}
                className={size === item ? "selected" : ""}
                onClick={() => setSize(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
              {isArabic ? "الكمية المطلوبة" : "Quantity"}
            </span>
            <div className="cart-qty-controls">
              <button
                type="button"
                className="cart-qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <strong style={{ minWidth: '24px', textAlign: 'center', fontSize: '14px' }}>{quantity}</strong>
              <button
                type="button"
                className="cart-qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="primary-button wide"
            disabled={isOutOfStock}
            onClick={() => onAdd(product, size, quantity)}
            style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {isOutOfStock
              ? (isArabic ? "نفذت الكمية حالياً" : "Out of stock")
              : (
                <>
                  {isArabic ? "أضف إلى السلة" : "Add to bag"} <span>{formatPrice(product.price * quantity)}</span>
                </>
              )}
          </button>
          <span className="delivery-note">
            <Zap size={15} /> {isArabic ? "توصيل القاهرة خلال 25–35 دقيقة" : "Cairo delivery in 25–35 minutes"}
          </span>
        </div>
      </motion.article>
    </motion.div>
  )
}

function SearchPanel({
  query,
  storeName,
  onQueryChange,
  onClose,
  onSelect,
}: {
  query: string
  storeName: string | null
  onQueryChange: (value: string) => void
  onClose: () => void
  onSelect: (product: Product) => void
}) {
  const matches = products.filter(
    (product) =>
      (!storeName || product.brand === storeName) &&
      `${product.name} ${product.brand} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )

  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="search-panel"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.35, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-head">
          <span className="eyebrow">
            {storeName ? `Search / ${storeName}` : "Search all partner stores"}
          </span>
          <IconButton label="Close search" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <label className="search-field">
          <Search size={19} />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={
              storeName
                ? `Search inside ${storeName}`
                : "Search products, stores or categories"
            }
          />
        </label>
        <div className="search-results">
          {matches.slice(0, 8).map((product) => (
            <button key={product.id} onClick={() => onSelect(product)}>
              <img src={product.image} alt="" />
              <span>
                <small>{product.brand}</small>
                <strong>{product.name}</strong>
              </span>
              <span>{formatPrice(product.price)}</span>
            </button>
          ))}
          {matches.length === 0 && (
            <p className="empty-state">No products match this search yet.</p>
          )}
        </div>
      </motion.section>
    </motion.div>
  )
}

function CartPanel({
  cart,
  onClose,
  onRemove,
  onUpdateQuantity,
  onCheckout,
  currentCustomer,
  location,
  deliveryFee: baseDeliveryFee,
  isArabic,
  onRequestAuth,
}: {
  cart: { product: BackendProduct; size: string; quantity: number }[]
  onClose: () => void
  onRemove: (productId: string, size: string) => void
  onUpdateQuantity: (productId: string, size: string, qty: number) => void
  onCheckout: (details: {
    address: string
    phone: string
    paymentMethod: CustomerPaymentMethod
    notes: string
    coordinates?: { lat: number; lng: number }
  }) => void
  currentCustomer: CustomerUser | null
  location: string
  deliveryFee: number
  isArabic: boolean
  onRequestAuth: () => void
}) {
  const { vendors, calculateDeliveryFee, showToast } = usePlatform();
  const clothesTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const cartStores = [...new Set(cart.map((item) => item.product.vendorName))]
  const cartVendor = vendors.find((v) => v.name === cartStores[0]) || vendors[0];
  const vendorCoords = cartVendor?.coordinates || { lat: 29.9602, lng: 31.2785 }; // Default Maadi

  const selectedCartStore = stores.find((store) => store.name === cartStores[0])
  const deliveryTimes = selectedCartStore?.time.match(/\d+/g)?.map(Number) ?? []
  const deliveryMax = deliveryTimes.length ? Math.max(...deliveryTimes) : 999
  const qualifiesForFastDelivery = deliveryMax <= 60

  const [deliveryAddress, setDeliveryAddress] = useState(
    currentCustomer?.address || location || "Zamalek, Cairo",
  )
  const [customerPhone, setCustomerPhone] = useState(
    currentCustomer?.phone || "",
  )
  const [paymentMethod, setPaymentMethod] =
    useState<CustomerPaymentMethod>("cash_on_delivery")
  const [orderNotes, setOrderNotes] = useState("")

  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(
    currentCustomer?.coordinates || null
  );
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (currentCustomer?.address) setDeliveryAddress(currentCustomer.address)
    if (currentCustomer?.phone) setCustomerPhone(currentCustomer.phone)
    if (currentCustomer?.coordinates) setCustomerCoords(currentCustomer.coordinates)
  }, [currentCustomer])

  // Real-time Road Distance & Dynamic Fee
  const directKm = customerCoords
    ? calculateGeoDistanceKm(vendorCoords.lat, vendorCoords.lng, customerCoords.lat, customerCoords.lng)
    : (deliveryAddress.includes('زايد') || deliveryAddress.includes('Zayed')
        ? (cartVendor?.area.includes('زايد') ? 4.5 : 28.0)
        : deliveryAddress.includes('المعادي') || deliveryAddress.includes('Maadi')
          ? (cartVendor?.area.includes('المعادي') ? 3.5 : 16.0)
          : deliveryAddress.includes('التجمع') || deliveryAddress.includes('New Cairo')
            ? (cartVendor?.area.includes('التجمع') ? 4.0 : 18.5)
            : 8.5);

  const roadDistanceKm = Math.max(1.5, Math.round(directKm * 1.25 * 10) / 10);
  const dynamicDeliveryFee = calculateDeliveryFee(roadDistanceKm);
  const total = clothesTotal + dynamicDeliveryFee;

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      showToast(isArabic ? 'متصفحك لا يدعم قراءة الـ GPS' : 'Geolocation is not supported', 'error');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGps(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCustomerCoords(coords);
        const detectedArea = getCairoAreaName(coords.lat, coords.lng);
        setDeliveryAddress(`${detectedArea} (موقع GPS محدد)`);
        showToast(
          isArabic
            ? `📍 تم التقاط موقعك (${detectedArea}) وتحديث المسافة وتكلفة الشحن!`
            : `📍 GPS detected: ${detectedArea}`,
          'success'
        );
      },
      (err) => {
        setIsLocatingGps(false);
        console.warn('Geolocation error:', err);
        showToast(
          isArabic
            ? 'يرجى السماح بصلاحية الموقع في المتصفح، أو انقر على الخريطة لتحديده مباشرة'
            : 'Please allow location permission or pick on the map',
          'error'
        );
        setIsMapModalOpen(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="cart-panel"
        initial={{ x: isArabic ? "-100%" : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: isArabic ? "-100%" : "100%" }}
        transition={{ duration: 0.4, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <span className="eyebrow">{isArabic ? "حقيبة التسوق" : "Your bag"}</span>
            <h2>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              {isArabic ? "قطعة" : "ITEMS"}
            </h2>
          </div>
          <IconButton label="Close bag" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>

        <div className="cart-items">
          {cartStores.map((storeName) => {
            const store = stores.find((item) => item.name === storeName)
            return (
              <section className="cart-store-group" key={storeName}>
                <header>
                  <span>
                    <Store size={13} /> {storeName}
                  </span>
                  <small>{store?.time || "25–35 min"}</small>
                </header>
                {cart
                  .filter((item) => item.product.vendorName === storeName)
                  .map((item, index) => (
                    <article key={`${item.product.id}-${item.size}-${index}`}>
                      <img src={item.product.image} alt={item.product.name} />
                      <div>
                        <small>
                          {item.product.color || "Standard"} ·{" "}
                          <span style={{ color: "var(--lime)", fontWeight: 700 }}>
                            {isArabic ? "مقاس" : "Size"} {item.size}
                          </span>
                        </small>
                        <strong>{item.product.name}</strong>
                        <span>{formatPrice(item.product.price)}</span>
                        <div className="cart-qty-controls">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                          >
                            -
                          </button>
                          <span style={{ fontSize: "12px", minWidth: "16px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <IconButton
                        label={`Remove ${item.product.name}`}
                        onClick={() => onRemove(item.product.id, item.size)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </article>
                  ))}
              </section>
            )
          })}

          {cart.length === 0 && (
            <div className="empty-state">
              <ShoppingBag size={30} />
              <p>{isArabic ? "حقيبة التسوق فارغة حالياً." : "Your shopping bag is empty."}</p>
              <button className="text-link" onClick={onClose}>
                {isArabic ? "ابدأ التسوق الآن" : "Start shopping"}{" "}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-summary">
            {qualifiesForFastDelivery && (
              <span className="cart-fast-delivery">
                <Zap size={15} />{" "}
                {isArabic
                  ? "توصيل سريع مباشر من المتجر خلال 45 دقيقة"
                  : "Direct boutique delivery within 45 minutes"}
              </span>
            )}
            <p className="inspection-note">
              <Eye size={15} />{" "}
              {isArabic
                ? "افحص كافة القطع وجرب المقاس عند بابك قبل الدفع والاستلام."
                : "Inspect every item before accepting. Return with courier if not right."}
            </p>

            <div className="checkout-address-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>
                  {isArabic ? "عنوان وموقع التوصيل في القاهرة:" : "Cairo Delivery Address & GPS:"}
                </label>
                {customerCoords && (
                  <span style={{ fontSize: '10px', color: 'var(--lime)', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                    GPS: {customerCoords.lat.toFixed(3)}, {customerCoords.lng.toFixed(3)}
                  </span>
                )}
              </div>

              {/* Interactive GPS & Google Map trigger buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={isLocatingGps}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    background: 'rgba(209, 254, 23, 0.12)',
                    border: '1px solid var(--lime)',
                    borderRadius: '8px',
                    color: 'var(--lime)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Navigation size={13} className={isLocatingGps ? 'animate-spin' : ''} />
                  <span>{isLocatingGps ? (isArabic ? 'جاري تحديد GPS...' : 'Locating...') : (isArabic ? '📍 موقعي الحالي (GPS)' : '📍 Current GPS')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'var(--white)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <MapPin size={13} style={{ color: 'var(--lime)' }} />
                  <span>{isArabic ? '🗺️ تحديد على الخريطة' : '🗺️ Open Map'}</span>
                </button>
              </div>

              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={isArabic ? "مثال: الزمالك، شارع حسن مظهر، عمارة 12" : "e.g. Zamalek, Hassan Mazhar St, Bldg 12"}
              />

              {/* Dynamic Distance & Route Calculation Badge */}
              <div style={{
                marginTop: '8px',
                padding: '9px 11px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)' }}>
                    {isArabic ? `متجر الشحن: ${cartVendor.name} (${cartVendor.area})` : `Boutique: ${cartVendor.name} (${cartVendor.area})`}
                  </span>
                  <span style={{ color: 'var(--lime)', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                    {roadDistanceKm} {isArabic ? "كم" : "km"}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255, 255, 255, 0.75)' }}>
                  <span>{isArabic ? "وقت وصول الطيار المقدر:" : "Estimated Courier ETA:"}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--white)' }}>
                    {roadDistanceKm <= 5 ? "18–25 min" : roadDistanceKm <= 15 ? "25–35 min" : "35–45 min"}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: 'var(--muted)' }}>{isArabic ? "تكلفة الشحن حسب المسافة:" : "Distance-based Fee:"}</span>
                  <strong style={{ color: 'var(--lime)', fontFamily: "'DM Mono', monospace" }}>{formatPrice(dynamicDeliveryFee)}</strong>
                </div>
              </div>
            </div>

            <div className="checkout-address-box">
              <label>
                {isArabic ? "رقم الهاتف للتواصل:" : "Contact Phone Number:"}
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="010XXXXXXXX"
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                {isArabic ? "طريقة الدفع:" : "Payment Method:"}
              </span>
              <div className="checkout-payment-methods">
                <button
                  type="button"
                  className={`payment-method-chip ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                >
                  <Wallet size={16} />
                  <span>{isArabic ? "كاش عند الاستلام" : "Cash on Delivery"}</span>
                </button>
                <button
                  type="button"
                  className={`payment-method-chip ${paymentMethod === 'instapay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('instapay')}
                >
                  <Zap size={16} />
                  <span>{isArabic ? "إنستاباي IPN" : "InstaPay IPN"}</span>
                </button>
                <button
                  type="button"
                  className={`payment-method-chip ${paymentMethod === 'vodafone_cash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('vodafone_cash')}
                >
                  <CreditCard size={16} />
                  <span>{isArabic ? "فودافون كاش" : "Vodafone Cash"}</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '10px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', margin: '12px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>{isArabic ? "سعر القطع:" : "Items Subtotal:"}</span>
                <span>{formatPrice(clothesTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>{isArabic ? "خدمة التوصيل السريع:" : "Express Courier Fee:"}</span>
                <span style={{ color: 'var(--lime)', fontWeight: 600 }}>{formatPrice(dynamicDeliveryFee)} ({roadDistanceKm} km)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', color: 'var(--white)', paddingTop: '4px' }}>
                <span>{isArabic ? "الإجمالي المستحق:" : "Total Amount:"}</span>
                <strong style={{ color: 'var(--lime)' }}>{formatPrice(total)}</strong>
              </div>
            </div>

            {!currentCustomer ? (
              <div>
                <p style={{ fontSize: '11px', color: '#ffb347', marginBottom: '8px', textAlign: 'center' }}>
                  {isArabic
                    ? "🔐 يرجى تسجيل الدخول أو إنشاء حساب لإتمام الطلب"
                    : "🔐 Please sign in or create an account to complete your order"}
                </p>
                <button className="primary-button wide" onClick={onRequestAuth}>
                  {isArabic ? "تسجيل الدخول لإتمام الطلب" : "Sign in to Checkout"}{" "}
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <button
                className="primary-button wide"
                onClick={() =>
                  onCheckout({
                    address: deliveryAddress,
                    phone: customerPhone,
                    paymentMethod,
                    notes: orderNotes,
                    coordinates: customerCoords || undefined,
                  })
                }
              >
                {isArabic ? "تأكيد وإرسال الطلب" : "Confirm & Place Order"} · {formatPrice(total)}{" "}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        )}

        {/* Full Google Maps Location Picker Modal */}
        {isMapModalOpen && (
          <div
            className="modal-backdrop panel-backdrop"
            style={{ zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={() => setIsMapModalOpen(false)}
          >
            <div
              className="order-panel"
              style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-head" style={{ marginBottom: '12px' }}>
                <div>
                  <span className="eyebrow">{isArabic ? "خريطة Google التفاعلية" : "Interactive Google Map"}</span>
                  <h2>{isArabic ? "حدد موقعك بدقة على الخريطة" : "PINPOINT YOUR LOCATION"}</h2>
                </div>
                <IconButton label="Close map" onClick={() => setIsMapModalOpen(false)}>
                  <X size={20} />
                </IconButton>
              </div>

              <LocationPickerMap
                vendor={cartVendor}
                initialCoordinates={customerCoords || vendorCoords}
                onLocationSelected={(coords, areaName, roadDist) => {
                  setCustomerCoords(coords);
                  setDeliveryAddress(areaName);
                }}
                currentAddressDetail={deliveryAddress}
                onAddressDetailChange={(detail) => setDeliveryAddress(detail)}
                calculatedFee={dynamicDeliveryFee}
              />

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="primary-button wide"
                  onClick={() => setIsMapModalOpen(false)}
                >
                  {isArabic ? "✅ تأكيد الموقع وحساب التكلفة" : "✅ Confirm Location & Fee"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </motion.div>
  )
}

function WishlistPanel({
  favorites,
  onClose,
  onSelect,
  onRemove,
}: {
  favorites: number[]
  onClose: () => void
  onSelect: (product: Product) => void
  onRemove: (id: number) => void
}) {
  const saved = products.filter((product) => favorites.includes(product.id))
  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="cart-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <span className="eyebrow">Saved locally</span>
            <h2>WISHLIST / {saved.length}</h2>
          </div>
          <IconButton label="Close wishlist" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="wishlist-grid">
          {saved.map((product) => (
            <article key={product.id}>
              <button onClick={() => onSelect(product)}>
                <img src={product.image} alt={product.name} />
                <small>{product.brand}</small>
                <strong>{product.name}</strong>
                <span>{formatPrice(product.price)}</span>
              </button>
              <IconButton
                label={`Remove ${product.name} from wishlist`}
                onClick={() => onRemove(product.id)}
              >
                <X size={15} />
              </IconButton>
            </article>
          ))}
          {saved.length === 0 && (
            <div className="empty-state wishlist-empty">
              <Heart size={30} />
              <p>Save products to build your Fast Drip edit.</p>
              <button className="text-link" onClick={onClose}>
                Explore products <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  )
}

function StorePanel({
  store,
  onClose,
  onSelect,
  onShop,
}: {
  store: PartnerStore
  onClose: () => void
  onSelect: (product: Product) => void
  onShop: () => void
}) {
  const storeProducts = products.filter(
    (product) => product.brand === store.name,
  )
  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        className="store-panel"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.45, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="store-panel-hero">
          <img src={store.image} alt={`Inside ${store.name}`} />
          <div className="store-panel-shade" />
          <IconButton label="Close store" onClick={onClose}>
            <X size={20} />
          </IconButton>
          <div>
            <span>{store.code} / VERIFIED PARTNER</span>
            <h2>{store.name}</h2>
            <p>
              <MapPin size={14} /> {store.location} · delivery {store.time}
            </p>
          </div>
        </div>
        <div className="store-panel-content">
          <div className="stock-sync">
            <PackageCheck size={17} />
            <span>
              <strong>Live rack sync</strong>
              Inventory confirmed by the store 2 minutes ago
            </span>
          </div>
          <p>
            Independent Cairo streetwear selected directly from the store rack,
            collected by a Fast Drip rider and delivered in one local checkout.
          </p>
          <div className="store-product-row">
            {storeProducts.map((product) => (
              <button key={product.id} onClick={() => onSelect(product)}>
                <img src={product.image} alt={product.name} />
                <strong>{product.name}</strong>
                <span>{formatPrice(product.price)}</span>
              </button>
            ))}
          </div>
          <button className="primary-button wide" onClick={onShop}>
            Shop all from {store.name} <ArrowRight size={17} />
          </button>
        </div>
      </motion.article>
    </motion.div>
  )
}

function StoreDirectoryPage({
  isArabic,
  onOpenStore,
}: {
  isArabic: boolean
  onOpenStore: (store: PartnerStore) => void
}) {
  return (
    <main className="route-page stores-directory-page">
      <section className="route-hero">
        <span className="eyebrow">
          {isArabic
            ? "دليل المتاجر / ٠٥ شركاء"
            : "Store directory / 05 partners"}
        </span>
        <h1>{isArabic ? "اختار متجرك." : "CHOOSE YOUR STORE."}</h1>
        <p>
          {isArabic
            ? "كل متجر له واجهة مستقلة وسلة خاصة. اختار متجرًا لتصفح منتجاته فقط."
            : "Every partner has a dedicated storefront and its own cart. Choose one store to browse its products."}
        </p>
      </section>
      <section className="directory-grid">
        {stores.map((store, index) => (
          <motion.button
            key={store.slug}
            className="directory-card"
            onClick={() => onOpenStore(store)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, ease }}
          >
            <img src={store.image} alt={`${store.name} storefront`} />
            <span className="directory-card-shade" />
            <span className="directory-card-code">{store.code}</span>
            <span className="directory-card-content">
              <small>
                <MapPin size={13} /> {store.location}
              </small>
              <strong>{store.name}</strong>
              <span>
                {
                  products.filter((product) => product.brand === store.name)
                    .length
                }{" "}
                products · {store.time}
              </span>
            </span>
            <i>
              <ArrowUpRight size={19} />
            </i>
          </motion.button>
        ))}
      </section>
    </main>
  )
}

function GlobalDiscoverPage({
  favorites,
  onFavorite,
  onSelect,
}: {
  favorites: number[]
  onFavorite: (id: number) => void
  onSelect: (product: Product) => void
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] =
    useState<typeof storefrontCategories[number]>("All Products")
  const filtered = products.filter(
    (product) =>
      `${product.name} ${product.brand} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "All Products" ||
        (category === "New Arrivals"
          ? ["New", "Just dropped"].includes(product.tag ?? "")
          : product.category === category)),
  )

  return (
    <main className="route-page discover-page">
      <section className="route-hero">
        <span className="eyebrow">Marketplace-wide discovery / 05 stores</span>
        <h1>DISCOVER ALL DROPS.</h1>
        <p>
          Browse every partner freely. Your first add assigns the cart to that
          product's store; checkout remains one store per order.
        </p>
      </section>
      <nav className="storefront-categories" aria-label="Global categories">
        {storefrontCategories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="global-discovery-catalog">
        <label className="storefront-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all products and stores"
          />
        </label>
        <div className="storefront-results-head">
          <span>{filtered.length} products across all stores</span>
          <strong>{category}</strong>
        </div>
        {filtered.length ? (
          <div className="product-grid global-product-grid">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                favorites={favorites}
                onFavorite={onFavorite}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="store-required compact">
            <Search size={26} />
            <p>No products match this search and category.</p>
          </div>
        )}
      </section>
    </main>
  )
}

function StorefrontProductCard({
  product,
  onView,
  onAdd,
}: {
  product: Product
  onView: (product: Product) => void
  onAdd: (product: Product) => void
}) {
  return (
    <article className="storefront-product-card">
      <button
        className="storefront-product-image"
        onClick={() => onView(product)}
      >
        <img src={product.image} alt={product.name} />
        {product.tag && <span>{product.tag}</span>}
      </button>
      <div className="storefront-product-info">
        <small>{product.category}</small>
        <button onClick={() => onView(product)}>
          <strong>{product.name}</strong>
        </button>
        <span className="storefront-product-meta">
          <span>{product.color}</span>
          <b>{formatPrice(product.price)}</b>
        </span>
        <span className="storefront-sizes">{existingSizes.join(" · ")}</span>
        <div>
          <button className="secondary-button" onClick={() => onView(product)}>
            Quick view
          </button>
          <button className="primary-button" onClick={() => onAdd(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}

function DedicatedStorefrontPage({
  store,
  isArabic,
  onBack,
  onViewProduct,
  onAddProduct,
}: {
  store: PartnerStore
  isArabic: boolean
  onBack: () => void
  onViewProduct: (product: Product) => void
  onAddProduct: (product: Product) => void
}) {
  const storeProducts = products.filter(
    (product) => product.brand === store.name,
  )
  const colors = [...new Set(storeProducts.map((product) => product.color))]
  const storeMax = Math.max(...storeProducts.map((product) => product.price))
  const [query, setQuery] = useState("")
  const [category, setCategory] =
    useState<typeof storefrontCategories[number]>("All Products")
  const [size, setSize] = useState("All")
  const [color, setColor] = useState("All")
  const [availability, setAvailability] = useState("All")
  const [maxPrice, setMaxPrice] = useState(storeMax)
  const [sort, setSort] = useState("Newest")

  useEffect(() => {
    setQuery("")
    setCategory("All Products")
    setSize("All")
    setColor("All")
    setAvailability("All")
    setMaxPrice(storeMax)
    setSort("Newest")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [store.name, storeMax])

  const filtered = storeProducts
    .filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) &&
        (category === "All Products" ||
          (category === "New Arrivals"
            ? ["New", "Just dropped"].includes(product.tag ?? "")
            : product.category === category)) &&
        (size === "All" || existingSizes.includes(size)) &&
        (color === "All" || product.color === color) &&
        product.price <= maxPrice &&
        (availability === "All" ||
          (availability === "Low stock"
            ? product.tag === "Low stock"
            : product.tag !== "Low stock")),
    )
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price
      if (sort === "Price: High to Low") return b.price - a.price
      if (sort === "Popularity") {
        const score = (product: Product) =>
          ["Trending", "Best seller"].includes(product.tag ?? "") ? 1 : 0
        return score(b) - score(a)
      }
      return b.id - a.id
    })

  return (
    <main className="route-page storefront-page">
      <section className="storefront-cover">
        <img src={store.image} alt={`${store.name} editorial cover`} />
        <span className="storefront-cover-shade" />
        <button className="storefront-back" onClick={onBack}>
          <ArrowLeft size={17} />{" "}
          {isArabic ? "الرجوع للماركت بليس" : "Back to marketplace"}
        </button>
        <div className="storefront-heading">
          <span>{store.code} / FAST DRIP PARTNER</span>
          <h1>{store.name}</h1>
          <p>
            <MapPin size={15} /> {store.location}
          </p>
          <p>
            {isArabic
              ? `الطلب بيتجهز من ${store.name} ويوصل خلال ${store.time} حسب التغطية.`
              : `Fulfilled directly from ${store.name} with delivery in ${store.time} where available.`}
          </p>
        </div>
      </section>

      <nav className="storefront-categories" aria-label="Product categories">
        {storefrontCategories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <section className="storefront-catalog">
        <div className="storefront-tools">
          <label className="storefront-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${store.name}`}
            />
          </label>
          <label>
            <SlidersHorizontal size={16} />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Popularity</option>
            </select>
          </label>
        </div>

        <div className="storefront-layout">
          <aside className="storefront-filters">
            <div>
              <span>Size</span>
              <select
                value={size}
                onChange={(event) => setSize(event.target.value)}
              >
                <option>All</option>
                {existingSizes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <span>Color</span>
              <select
                value={color}
                onChange={(event) => setColor(event.target.value)}
              >
                <option>All</option>
                {colors.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <span>Availability</span>
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
              >
                <option>All</option>
                <option>Available now</option>
                <option>Low stock</option>
              </select>
            </div>
            <div>
              <span>Price up to {formatPrice(maxPrice)}</span>
              <input
                type="range"
                min={Math.min(...storeProducts.map((product) => product.price))}
                max={storeMax}
                step="50"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
            </div>
            <button
              className="text-link"
              onClick={() => {
                setSize("All")
                setColor("All")
                setAvailability("All")
                setMaxPrice(storeMax)
              }}
            >
              Reset filters <X size={14} />
            </button>
          </aside>

          <div>
            <div className="storefront-results-head">
              <span>{filtered.length} products</span>
              <strong>{category}</strong>
            </div>
            {filtered.length ? (
              <motion.div
                key={`${store.slug}-${category}-${query}-${sort}`}
                className="storefront-products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
              >
                {filtered.map((product) => (
                  <StorefrontProductCard
                    key={product.id}
                    product={product}
                    onView={onViewProduct}
                    onAdd={onAddProduct}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="store-required compact">
                <Search size={26} />
                <p>No products match the selected filters in this store.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function OrderTracker({
  order,
  onClose,
  onSubmitRating,
  isArabic = false,
}: {
  order: Order | null
  onClose: () => void
  onSubmitRating?: (
    orderId: string,
    ratingData: {
      vendorRating: number
      driverRating?: number
      vendorReview?: string
      driverReview?: string
    },
  ) => void
  isArabic?: boolean
}) {
  if (!order) return null

  const [vendorStars, setVendorStars] = useState(5)
  const [driverStars, setDriverStars] = useState(5)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  const getStageInfo = (status: OrderStatus) => {
    switch (status) {
      case "pending_vendor":
        return {
          stage: 0,
          eta: isArabic ? "٢٨–٣٥ دقيقة" : "28–35 min",
          title: isArabic
            ? "تم إرسال الطلب للمتجر · جاري فحص المقاس"
            : "Order confirmed · Boutique checking stock",
          desc: isArabic
            ? "يقوم المتجر الآن بمراجعة القطعة وتغليفها بختم FAST DRIP الأمني."
            : "The partner store is preparing your items and checking physical inventory.",
        }
      case "ready_for_driver":
        return {
          stage: 1,
          eta: isArabic ? "٢٠–٢٨ دقيقة" : "20–28 min",
          title: isArabic
            ? "تم تأكيد وتغليف الطلب · جاري تعيين كابتن"
            : "Order packaged · Searching for nearest courier",
          desc: isArabic
            ? "الطلب جاهز للاستلام الفوري وجاري توجيه كابتن التوصيل للمتجر."
            : "Pieces verified with security tag. Locating nearest courier.",
        }
      case "driver_assigned":
        return {
          stage: 2,
          eta: isArabic ? "١٥–٢٢ دقيقة" : "15–22 min",
          title: isArabic
            ? `الكابتن ${order.driverName || ""} في الطريق للمتجر`
            : `${order.driverName || "Courier"} heading to store`,
          desc: isArabic
            ? `الكابتن يتحرك الآن لاستلام قطعك من متجر ${order.vendorName}.`
            : `Courier assigned and en route to ${order.vendorName}.`,
        }
      case "picked_up_paid_store":
        return {
          stage: 2,
          eta: isArabic ? "٨–١٤ دقيقة" : "8–14 min",
          title: isArabic
            ? "الكابتن استلم الطلب وفي طريقه لعنوانك"
            : `${order.driverName || "Courier"} picked up order · Out for delivery`,
          desc: isArabic
            ? "الطلب في الطريق إليك الآن. جهز نفسك لمعاينة القطع عند الباب."
            : "Courier is heading directly to your destination.",
        }
      case "delivered":
        return {
          stage: 3,
          eta: isArabic ? "تم التسليم بنجاح ✓" : "Delivered · Drip in hand ✓",
          title: isArabic
            ? "تم تسليم وفحص الطلب بنجاح"
            : "Delivered & Inspected",
          desc: isArabic
            ? "استمتع بستايلك الجديد! نسعد بتقييم تجربتك مع المتجر والكابتن."
            : "Enjoy your new drip! Please rate your experience below.",
        }
      case "cancelled_by_vendor":
        return {
          stage: -1,
          eta: isArabic ? "طلب ملغي" : "Cancelled",
          title: isArabic
            ? "اعتذر المتجر لعدم توفر المقاس بالمخزن"
            : "Cancelled: boutique out of stock",
          desc: isArabic
            ? "تم إلغاء الطلب نظراً لعدم توفر المقاس بالمتجر الفيزيائي. لم يتم خصم أي مبالغ."
            : "Item was sold out in physical store. No payment charged.",
        }
      default:
        return {
          stage: 1,
          eta: "20–30 min",
          title: "Processing order",
          desc: "FAST DRIP courier network active",
        }
    }
  }

  const stageInfo = getStageInfo(order.status)
  const isDelivered = order.status === "delivered"
  const isCancelled = order.status === "cancelled_by_vendor"

  const steps = [
    [
      isArabic ? "تم تقديم الطلب" : "Order placed",
      isArabic ? "تم تأكيد طلبك وإرساله للمتجر" : "Your order is confirmed and sent to store",
    ],
    [
      isArabic ? "المتجر أكد التوفر" : "Store confirmed",
      order.status === "pending_vendor"
        ? isArabic ? "المتجر يفحص المقاس في البوتيك" : "Boutique verifying physical size"
        : isArabic ? "تم فحص المقاس وتغليفه بالختم الأمني" : "Inventory secured at partner store",
    ],
    [
      isArabic ? "الكابتن استلم وفي الطريق" : "Rider collecting & en route",
      order.driverName
        ? isArabic
          ? `${order.driverName} على الطريق (${order.driverVehicle || "دراجة نارية"})`
          : `${order.driverName} on the way (${order.driverVehicle || "Motorcycle"})`
        : isArabic ? "جاري تحسين مسار الكابتن الأقرب" : "Pickup route is optimized",
    ],
    [
      isArabic ? "الوصول والفحص عند الباب" : "Arrived & Inspected",
      isArabic ? "افحص القطع قبل الاستلام والدفع" : "Inspect items before accepting",
    ],
  ]

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmitRating) {
      onSubmitRating(order.id, {
        vendorRating: vendorStars,
        driverRating: driverStars,
      })
    }
    setRatingSubmitted(true)
  }

  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="order-panel"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.45, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <span className="eyebrow">
              {isArabic ? "طلب مباشر" : "Live Order"} / {order.orderNumber}
            </span>
            <h2>{isArabic ? "تتبع الستايل" : "TRACK THE DRIP"}</h2>
          </div>
          <IconButton label="Close order tracking" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>

        <div className="order-eta" style={isDelivered ? { background: '#22c55e', color: '#fff' } : isCancelled ? { background: '#ef4444', color: '#fff' } : {}}>
          <Navigation size={20} />
          <span>
            <small>{isArabic ? "الوقت المتوقع للوصول" : "Estimated arrival"}</small>
            <strong>{stageInfo.eta}</strong>
          </span>
        </div>

        <div className="order-route">
          <span>
            <Store size={15} /> {isArabic ? "من" : "From"} <strong>{order.vendorName}</strong>
          </span>
          <ArrowRight size={15} />
          <span>
            <MapPin size={15} /> {isArabic ? "إلى" : "To"}{" "}
            <strong>{order.customerAddress || order.customerArea || "Cairo"}</strong>
          </span>
        </div>

        {!isDelivered && !isCancelled && (
          <div className="live-pulse-badge">
            <span className="pulse-dot" />
            <span>
              {isArabic
                ? "تتبع مباشر وتحديث لحظي من النظام"
                : "Live dispatch & GPS status active"}
            </span>
          </div>
        )}

        {/* Real Dynamic Steps */}
        <div className="order-steps">
          {steps.map(([title, text], index) => {
            const isComplete = !isCancelled && (index <= stageInfo.stage || (index === 0))
            const isCurrent = !isCancelled && index === stageInfo.stage
            return (
              <div
                key={title}
                className={isComplete ? "complete" : ""}
                style={isCurrent ? { opacity: 1 } : {}}
              >
                <i>{isComplete ? <Check size={14} /> : index + 1}</i>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </div>
            )
          })}
        </div>

        {/* Courier Info Card */}
        {order.driverName && (
          <div className="order-driver-card">
            <div className="order-driver-info">
              <div className="order-driver-avatar">
                <Truck size={18} />
              </div>
              <div className="order-driver-details">
                <strong>{order.driverName}</strong>
                <small>
                  {order.driverVehicle || "سكوتر"} ·{" "}
                  {order.driverVehicleNumber || "مرخص رسمي"}
                </small>
              </div>
            </div>
            {order.driverPhone && (
              <a
                href={`tel:${order.driverPhone}`}
                className="order-driver-call"
              >
                <Phone size={13} />
                <span>{isArabic ? "اتصال بالكابتن" : "Call Courier"}</span>
              </a>
            )}
          </div>
        )}

        {/* Order Items Preview */}
        <div className="order-items-preview">
          <span className="order-items-title">
            {isArabic ? "محتويات الطلب" : "ORDER ITEMS"} ({order.items.length})
          </span>
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item-row">
              <div className="order-item-meta">
                <img src={item.product.image} alt={item.product.name} />
                <span>
                  <strong>{item.product.name}</strong>
                  <small>
                    {isArabic ? "مقاس" : "Size"} {item.size} × {item.quantity}
                  </small>
                </span>
              </div>
              <strong>{formatPrice(item.product.price * item.quantity)}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px' }}>
            <span style={{ color: 'var(--muted)' }}>
              {isArabic ? "إجمالي الطلب مع التوصيل:" : "Total with Delivery:"}
            </span>
            <strong style={{ color: 'var(--lime)', fontSize: '13px' }}>
              {formatPrice(order.totalAmount)}
            </strong>
          </div>
        </div>

        {/* Interactive Rating upon delivery */}
        {isDelivered && (
          <div className="order-rating-box">
            {ratingSubmitted || order.ratedAt ? (
              <div style={{ color: 'var(--lime)', fontSize: '13px', fontWeight: 700 }}>
                ✓ {isArabic ? "تم تسجيل تقييمك بنجاح! شكراً لك." : "Thank you for rating your FAST DRIP experience!"}
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit}>
                <span style={{ font: "11px 'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lime)' }}>
                  {isArabic ? "قيّم تجربتك مع المتجر والكابتن" : "RATE YOUR EXPERIENCE"}
                </span>
                <div style={{ marginTop: '10px' }}>
                  <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
                    {isArabic ? `تقييم متجر ${order.vendorName}:` : `Store rating (${order.vendorName}):`}
                  </small>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`rating-star-btn ${vendorStars >= s ? "active" : ""}`}
                        onClick={() => setVendorStars(s)}
                      >
                        <Star size={18} fill={vendorStars >= s ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
                    {isArabic ? `تقييم الكابتن ${order.driverName || ''}:` : `Courier rating (${order.driverName || 'Rider'}):`}
                  </small>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`rating-star-btn ${driverStars >= s ? "active" : ""}`}
                        onClick={() => setDriverStars(s)}
                      >
                        <Star size={18} fill={driverStars >= s ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  style={{ width: '100%', marginTop: '12px', padding: '10px', fontSize: '12px' }}
                >
                  {isArabic ? "إرسال التقييم" : "Submit Rating"}
                </button>
              </form>
            )}
          </div>
        )}

        <button className="primary-button wide" onClick={onClose} style={{ marginTop: '16px' }}>
          {isDelivered
            ? isArabic ? "إغلاق ومتابعة التسوق" : "Finish & Keep Shopping"
            : isCancelled
            ? isArabic ? "إغلاق وتصفح قطع أخرى" : "Close & Browse Drops"
            : isArabic ? "متابعة التسوق أثناء التوصيل" : "Keep Shopping While In Progress"}{" "}
          <ArrowRight size={17} />
        </button>
      </motion.section>
    </motion.div>
  )
}

function LocationPickerModal({
  currentLocation,
  onSelectLocation,
  onClose,
  isArabic,
}: {
  currentLocation: string
  onSelectLocation: (areaName: string) => void
  onClose: () => void
  isArabic: boolean
}) {
  const cairoAreas = [
    { nameEn: "Zamalek, Cairo", nameAr: "الزمالك، القاهرة", time: "18–25 min" },
    { nameEn: "Maadi, Degla", nameAr: "المعادي ودجلة", time: "25–35 min" },
    { nameEn: "New Cairo (5th Settlement)", nameAr: "التجمع الخامس والقاهرة الجديدة", time: "25–35 min" },
    { nameEn: "Heliopolis, Korba", nameAr: "مصر الجديدة والكوربة", time: "25–35 min" },
    { nameEn: "Sheikh Zayed, Arkan", nameAr: "الشيخ زايد وأكتوبر", time: "35–45 min" },
    { nameEn: "Dokki & Mohandessin", nameAr: "الدقي والمهندسين", time: "20–30 min" },
    { nameEn: "Nasr City", nameAr: "مدينة نصر", time: "25–35 min" },
    { nameEn: "Downtown Cairo", nameAr: "وسط البلد والتحرير", time: "20–30 min" },
  ]

  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="order-panel"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.45, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <span className="eyebrow">{isArabic ? "مناطق التوصيل السريع" : "Express Delivery Zones"}</span>
            <h2>{isArabic ? "اختر منطقتك بالقاهرة" : "SELECT CAIRO AREA"}</h2>
          </div>
          <IconButton label="Close location picker" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
          {isArabic
            ? "يتم احتساب وقت ومسار التوصيل بناءً على قربك من متاجر الستريت وير الشريكة."
            : "Courier ETA and delivery rates are dynamically optimized based on partner boutiques near your zone."}
        </p>
        <div className="location-picker-grid">
          {cairoAreas.map((area) => (
            <button
              key={area.nameEn}
              className={`location-option-btn ${currentLocation.includes(area.nameEn.split(',')[0]) ? "selected" : ""}`}
              onClick={() => {
                onSelectLocation(isArabic ? area.nameAr : area.nameEn)
                onClose()
              }}
            >
              <div>
                <strong>{isArabic ? area.nameAr : area.nameEn}</strong>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', marginTop: '3px' }}>
                  <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {isArabic ? "تغطية توصيل فوري" : "Instant rider dispatch coverage"}
                </small>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--lime)', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                {area.time}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function AccountDrawer({
  customer,
  orders,
  onClose,
  onLogout,
  onTrackOrder,
  onRequestAuth,
  isArabic,
}: {
  customer: CustomerUser | null
  orders: Order[]
  onClose: () => void
  onLogout: () => void
  onTrackOrder: (order: Order) => void
  onRequestAuth: () => void
  isArabic: boolean
}) {
  const customerOrders = customer
    ? orders.filter((o) => o.customerId === customer.id || o.customerPhone === customer.phone)
    : []

  return (
    <motion.div
      className="modal-backdrop panel-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="cart-panel"
        initial={{ x: isArabic ? "-100%" : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: isArabic ? "-100%" : "100%" }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <span className="eyebrow">{isArabic ? "الملف الشخصي والطلبات" : "Profile & Orders"}</span>
            <h2>{isArabic ? "حساب العميل" : "CUSTOMER ACCOUNT"}</h2>
          </div>
          <IconButton label="Close account panel" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>

        {customer ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)', justifyContent: 'space-between' }}>
            <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
              <div className="account-profile-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '18px' }}>
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{customer.name}</h3>
                    <small style={{ color: 'var(--muted)', fontSize: '12px', fontFamily: 'monospace' }}>{customer.email}</small>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                  <span><Phone size={12} style={{ display: 'inline', marginRight: '6px' }} /> {customer.phone || '010XXXXXXXX'}</span>
                  <span><MapPin size={12} style={{ display: 'inline', marginRight: '6px' }} /> {customer.address || customer.area || 'Cairo'}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ font: "11px 'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lime)', display: 'block', marginBottom: '12px' }}>
                  {isArabic ? "سجل طلباتك" : "YOUR ORDERS"} ({customerOrders.length})
                </span>

                {customerOrders.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--charcoal)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <PackageCheck size={28} style={{ margin: '0 auto 8px', color: 'var(--muted)' }} />
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                      {isArabic ? "لم تقم بإنشاء أي طلبات حتى الآن." : "You haven't placed any orders yet."}
                    </p>
                  </div>
                ) : (
                  customerOrders.map((ord) => (
                    <article key={ord.id} className="account-order-card">
                      <div className="account-order-head">
                        <div>
                          <strong style={{ fontSize: '13px' }}>{ord.orderNumber}</strong>
                          <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>
                            {ord.vendorName} · {ord.createdAt.slice(0, 16)}
                          </small>
                        </div>
                        <span className={`status-chip ${ord.status}`}>
                          {ord.status === 'pending_vendor' ? (isArabic ? 'في انتظار المتجر' : 'Pending store')
                            : ord.status === 'ready_for_driver' ? (isArabic ? 'جاهز للاستلام' : 'Ready for pickup')
                            : ord.status === 'driver_assigned' ? (isArabic ? 'مع الكابتن' : 'Driver assigned')
                            : ord.status === 'picked_up_paid_store' ? (isArabic ? 'في الطريق إليك' : 'Out for delivery')
                            : ord.status === 'delivered' ? (isArabic ? 'تم التسليم ✓' : 'Delivered ✓')
                            : (isArabic ? 'طلب ملغي' : 'Cancelled')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--lime)' }}>
                          {formatPrice(ord.totalAmount)}
                        </span>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                          onClick={() => {
                            onClose()
                            onTrackOrder(ord)
                          }}
                        >
                          <Navigation size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {isArabic ? "تتبع مباشر" : "Track live"}
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              className="secondary-button wide"
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px' }}
            >
              <LogOut size={16} />
              {isArabic ? "تسجيل الخروج" : "Sign Out"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(209, 254, 23, 0.1)', color: 'var(--lime)', display: 'grid', placeItems: 'center' }}>
              <User size={30} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>
                {isArabic ? "تصفح كزائر" : "Browsing as Guest"}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '280px', margin: 0 }}>
                {isArabic
                  ? "سجل دخولك لمتابعة طلباتك، حفظ عناوين التوصيل، وتأكيد طلباتك بضغطة واحدة."
                  : "Sign in to track real-time drops, save delivery addresses, and checkout instantly."}
              </p>
            </div>
            <button
              type="button"
              className="primary-button wide"
              onClick={() => {
                onClose()
                onRequestAuth()
              }}
              style={{ marginTop: '12px' }}
            >
              {isArabic ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Register"} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  )
}

function StoreSwitchDialog({
  currentStore,
  nextStore,
  isArabic,
  onKeep,
  onConfirm,
}: {
  currentStore: string
  nextStore: string
  isArabic: boolean
  onKeep: () => void
  onConfirm: () => void
}) {
  return (
    <motion.div
      className="modal-backdrop switch-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onKeep}
    >
      <motion.section
        className="switch-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="switch-store-title"
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.3, ease }}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="switch-icon">
          <Store size={20} />
        </span>
        <span className="eyebrow">
          {isArabic ? "متجر واحد لكل طلب" : "One store per order"}
        </span>
        <h2 id="switch-store-title">
          {isArabic ? "تبدّل المتجر؟" : "SWITCH STORES?"}
        </h2>
        <p>
          {isArabic ? "سلتك تابعة لمتجر" : "Your cart belongs to"}{" "}
          <strong>{currentStore}</strong>.
        </p>
        <p>
          {isArabic ? "المنتج ده من" : "This product is from"}{" "}
          <strong>{nextStore}</strong>.{" "}
          {isArabic
            ? "عشان تتسوق من المتجر ده، لازم تمسح السلة الحالية."
            : "To shop from this store, you need to clear your current cart."}
        </p>
        <div className="switch-actions">
          <button className="primary-button" onClick={onConfirm}>
            {isArabic ? `بدّل إلى ${nextStore}` : `Switch to ${nextStore}`}
          </button>
          <button className="secondary-button" onClick={onKeep}>
            {isArabic
              ? `كمّل التسوق في ${currentStore}`
              : `Keep Shopping at ${currentStore}`}
          </button>
        </div>
      </motion.section>
    </motion.div>
  )
}

type MobileTab = "home" | "stores" | "discover" | "wishlist" | "cart"

function BottomNavigation({
  active,
  favoritesCount,
  cartCount,
  language,
  onNavigate,
}: {
  active: MobileTab
  favoritesCount: number
  cartCount: number
  language: "en" | "ar"
  onNavigate: (tab: MobileTab) => void
}) {
  const labels =
    language === "ar"
      ? ["الرئيسية", "المتاجر", "اكتشف", "المفضلة", "السلة"]
      : ["Home", "Stores", "Discover", "Wishlist", "Cart"]
  const items: {
    id: MobileTab
    label: string
    icon: React.ReactNode
    count?: number
  }[] = [
    { id: "home", label: labels[0], icon: <Home size={19} /> },
    { id: "stores", label: labels[1], icon: <Store size={19} /> },
    { id: "discover", label: labels[2], icon: <Compass size={19} /> },
    {
      id: "wishlist",
      label: labels[3],
      icon: <Heart size={19} />,
      count: favoritesCount,
    },
    {
      id: "cart",
      label: labels[4],
      icon: <ShoppingBag size={19} />,
      count: cartCount,
    },
  ]
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? "active" : ""}
          onClick={() => onNavigate(item.id)}
          aria-current={active === item.id ? "page" : undefined}
        >
          {active === item.id && (
            <motion.i
              className="bottom-nav-indicator"
              layoutId="bottom-navigation-active"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="bottom-nav-icon">
            {item.icon}
            {!!item.count && <b>{item.count}</b>}
          </span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  )
}

export function CustomerApp() {
  const {
    currentCustomer,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    placeOrder,
    showToast,
    cart: platformCart,
    addToCart: platformAddToCart,
    removeFromCart: platformRemoveFromCart,
    updateCartQuantity: platformUpdateCartQuantity,
    clearCart: platformClearCart,
    orders,
    vendors,
    products: platformProducts,
    submitOrderRating,
    calculateDeliveryFee,
  } = usePlatform();

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const activeOrder = orders.find((o) => o.id === activeTrackingOrderId) || null;
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isPendingCheckoutAfterAuth, setIsPendingCheckoutAfterAuth] = useState(false);

  // Customer Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authArea, setAuthArea] = useState('التجمع الخامس');
  const [authAddress, setAuthAddress] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    setIsAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        const ok = await loginCustomer(authEmail, authPassword);
        if (ok) {
          setIsAuthModalOpen(false);
          setAuthPassword('');
          showToast(isArabic ? 'تم تسجيل الدخول بنجاح! يمكنك الآن إتمام الطلب.' : 'Logged in successfully! You can now complete your order.', 'success');
          if (isPendingCheckoutAfterAuth && platformCart.length > 0) {
            setIsPendingCheckoutAfterAuth(false);
            setCartOpen(true);
          }
        }
      } else {
        if (!authName || !authEmail || !authPhone || !authPassword) return;
        const created = await registerCustomer({
          name: authName,
          email: authEmail,
          phone: authPhone,
          password: authPassword,
          area: authArea,
          address: authAddress || authArea,
        });
        if (created) {
          setIsAuthModalOpen(false);
          setAuthPassword('');
          showToast(isArabic ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!', 'success');
          if (isPendingCheckoutAfterAuth && platformCart.length > 0) {
            setIsPendingCheckoutAfterAuth(false);
            setCartOpen(true);
          }
        }
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };
// hooks injected below
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [pendingSwitch, setPendingSwitch] = useState<PendingStoreSwitch | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState<MobileTab>("home")
  const [language, setLanguage] = useState<"en" | "ar">(() => {
    const saved = window.localStorage.getItem("fast-drip-language")
    if (saved === "ar" || saved === "en") return saved
    return window.navigator.language.toLowerCase().startsWith("ar")
      ? "ar"
      : "en"
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [location, setLocation] = useState("Zamalek, Cairo")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [notice, setNotice] = useState("")
  const [currentPath, setCurrentPath] = useState("/")
  const routeLocation = { pathname: currentPath }
  const navigate = (to: string) => {
    setCurrentPath(to)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const reduced = useReducedMotion()
  const isArabic = language === "ar"
  const normalizedPath =
    routeLocation.pathname.length > 1
      ? routeLocation.pathname.replace(/\/+$/, "")
      : routeLocation.pathname
  const routeStore = stores.find(
    (store) => normalizedPath === `/stores/${store.slug}`,
  )
  const isHomeRoute = normalizedPath === "/"
  const isDiscoverRoute = normalizedPath === "/discover"
  const isStoresRoute = normalizedPath === "/stores"
  const copy = isArabic
    ? {
        menu: ["وصل حديثًا", "الأكثر طلبًا", "المتاجر المحلية", "اكتشف المنتجات"],
        menuFooter: "الستايل سريع. وإحنا أسرع.",
        heroMeta: "٥ متاجر / ماركت بليس واحد",
        heroTime: "القاهرة / أقل من ٤٥ دقيقة",
        heroKicker: "متاجر القاهرة المستقلة",
        heroCheckout: "تصفح الكل / متجر واحد للطلب",
        heroLines: ["٥ متاجر.", "دروب واحد سريع."],
        heroAria: "خمسة متاجر، دروب واحد سريع",
        heroBody:
          "اكتشف منتجات كل شركائنا بحرية. أول منتج تضيفه يحدد متجر السلة، وكل طلب يطلع من متجر واحد.",
        shopDrop: "اكتشف المنتجات",
        partners: "شركاء التوصيل الرسميون / ٠٥",
        categories: "تسوق كل المتاجر حسب التصنيف",
        swipe: "اسحب للاستكشاف",
        allProducts: "أزياء حصرية جاهزة للتوصيل الفوري",
        catalog: "كتالوج الأزياء الفورية",
        clear: "مسح الفلتر",
        viewAll: "عرض الكل",
        shown: "منتجات ظاهرة",
        reset: "إعادة ضبط",
        campaignEyebrow: "اختيارات الشركاء / القاهرة ٠٥",
        campaignLines: ["خمسة متاجر.", "مدينة واحدة."],
        campaignBody:
          "اختار متجر واحد لكل طلب، وإحنا نستلم منتجاتك منه ونوصلها لبابك.",
        explore: "استكشف الاختيارات",
        trendingEyebrow: "الأكثر طلبًا",
        trending: "ترند دلوقتي",
        storesEyebrow: "شبكة الشركاء الكاملة",
        storesTitle: "٥ متاجر شريكة",
        openMap: "افتح الخريطة",
        promise: "وعد فاست دريب",
        promiseTitle: ["ستايل محلي.", "يوصلك بسرعة."],
        newsletter: "خليك أول واحد يعرف الدروب الجديد.",
        email: "البريد الإلكتروني",
        backTop: "الرجوع للأعلى",
      }
    : {
        menu: [
          "New arrivals",
          "Trending now",
          "Local stores",
          "Discover products",
        ],
        menuFooter: "Style moves fast. So do we.",
        heroMeta: "5 stores / 1 marketplace",
        heroTime: "Cairo / under 45 min",
        heroKicker: "Independent Cairo stores",
        heroCheckout: "Browse all / one-store checkout",
        heroLines: ["FIVE STORES.", "ONE FAST DROP."],
        heroAria: "Five stores, one fast drop",
        heroBody:
          "Discover products from every partner freely. Your first add assigns the cart to one store, and every order stays single-store.",
        shopDrop: "Discover products",
        partners: "Official delivery partners / 05",
        categories: "Shop all stores by category",
        swipe: "Swipe to explore",
        allProducts: "15 demo products / 3 per store",
        catalog: "TEST CATALOG",
        clear: "Clear filter",
        viewAll: "View all",
        shown: "products shown",
        reset: "Reset",
        campaignEyebrow: "Partner edit / Cairo 05",
        campaignLines: ["FIVE STORES.", "ONE CITY."],
        campaignBody:
          "Choose one store per order. We collect its products and deliver them straight to your door.",
        explore: "Explore the edit",
        trendingEyebrow: "Community heat",
        trending: "TRENDING NOW",
        storesEyebrow: "The complete network",
        storesTitle: "5 PARTNER STORES",
        openMap: "Open map",
        promise: "The Fast Drip promise",
        promiseTitle: ["LOCAL STYLE.", "DELIVERED FAST."],
        newsletter: "Get the next drop first.",
        email: "Email address",
        backTop: "Back to top",
      }

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = "ltr"
    document.title = routeStore
      ? `${routeStore.name} | FAST DRIP`
      : isDiscoverRoute
        ? "Discover All Products | FAST DRIP"
        : isStoresRoute
          ? isArabic
            ? "متاجر فاست دريب | القاهرة"
            : "FAST DRIP Stores | Cairo"
          : isArabic
            ? "فاست دريب | ستريت وير القاهرة في أقل من 45 دقيقة"
            : "FAST DRIP | Cairo Streetwear in Under 45 Minutes"
    window.localStorage.setItem("fast-drip-language", language)
    return () => {
      document.documentElement.dir = "ltr"
    }
  }, [isArabic, isDiscoverRoute, isStoresRoute, language, routeStore])

  useEffect(() => {
    if (normalizedPath.startsWith("/stores")) setActiveTab("stores")
    else if (normalizedPath === "/discover") setActiveTab("discover")
    else if (normalizedPath === "/") setActiveTab("home")
  }, [normalizedPath])

  const cartCount = platformCart.reduce((sum, item) => sum + item.quantity, 0)

  // Distance / delivery fee calculation based on chosen Cairo location
  const deliveryFee = location.includes("Zamalek") || location.includes("الزمالك")
    ? 45
    : location.includes("Maadi") || location.includes("المعادي")
    ? 55
    : location.includes("New Cairo") || location.includes("التجمع")
    ? 75
    : location.includes("Zayed") || location.includes("زايد")
    ? 95
    : 55

  const addToCart = (product: Product, size?: string, quantity: number = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || "M"
    const productStore = stores.find((store) => store.name === product.brand)
    const cartStoreName = platformCart[0]?.product.vendorName

    if (platformCart.length > 0 && cartStoreName && productStore && cartStoreName !== productStore.name) {
      setSelectedProduct(null)
      setPendingSwitch({
        store: productStore,
        pendingProduct: product,
        pendingSize: chosenSize,
        pendingQuantity: quantity,
      })
      return
    }

    const backendProduct: BackendProduct = platformProducts.find(
      (p) => p.id === String(product.id) || p.name === product.name
    ) || {
      id: String(product.id),
      vendorId: productStore?.vendorId || 'v-1',
      vendorName: product.brand,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
      inStock: product.inStock !== false,
      image: product.image,
      description: product.description || '',
      color: product.color,
      tag: product.tag,
    }

    for (let i = 0; i < quantity; i++) {
      platformAddToCart(backendProduct, chosenSize, true)
    }

    setSelectedProduct(null)
    notify(
      isArabic
        ? `تمت إضافة ${product.name} إلى حقيبة التسوق (${product.brand}).`
        : `${product.name} added to your bag (${product.brand}).`
    )
  }

  const handleCheckout = (details: {
    address: string
    phone: string
    paymentMethod: CustomerPaymentMethod
    notes: string
    coordinates?: { lat: number; lng: number }
  }) => {
    if (!currentCustomer) {
      setCartOpen(false)
      setIsPendingCheckoutAfterAuth(true)
      setAuthMode('login')
      setIsAuthModalOpen(true)
      showToast(
        isArabic
          ? 'يجب تسجيل الدخول أو إنشاء حساب أولاً لإتمام الطلب'
          : 'Please sign in or create an account to complete your order',
        'info'
      )
      return
    }

    if (platformCart.length === 0) {
      showToast(isArabic ? 'حقيبة التسوق فارغة' : 'Your bag is empty', 'error')
      return
    }

    const detectedArea = details.coordinates
      ? getCairoAreaName(details.coordinates.lat, details.coordinates.lng)
      : (currentCustomer.area || location);

    const createdOrder = placeOrder({
      customerId: currentCustomer.id,
      name: currentCustomer.name,
      phone: details.phone || currentCustomer.phone,
      area: detectedArea,
      address: details.address || currentCustomer.address || location,
      coordinates: details.coordinates,
      paymentMethod: details.paymentMethod,
      notes: details.notes || 'Order placed via Futuristic Storefront',
    })

    if (createdOrder) {
      setCartOpen(false)
      setActiveTrackingOrderId(createdOrder.id)
      setOrderOpen(true)
      showToast(
        isArabic
          ? `تم إرسال الطلب ${createdOrder.orderNumber} بنجاح إلى متجر ${createdOrder.vendorName}!`
          : `Order ${createdOrder.orderNumber} successfully sent to ${createdOrder.vendorName}!`,
        'success'
      )
    }
  }

  const notify = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }

  const showCatalog = ({ category = null }: { category?: string | null }) => {
    setActiveCategory(category)
    window.setTimeout(
      () =>
        document.querySelector("#new")?.scrollIntoView({ behavior: "smooth" }),
      50,
    )
  }

  const filteredProducts = products.filter(
    (product) => !activeCategory || product.category === activeCategory,
  )

  const goToStorePage = (store: PartnerStore) => {
    setActiveCategory(null)
    navigate(`/stores/${store.slug}`)
  }

  const confirmStoreSwitch = () => {
    if (!pendingSwitch) return
    const nextStore = pendingSwitch.store
    platformClearCart()

    if (pendingSwitch.pendingProduct) {
      const p = pendingSwitch.pendingProduct
      const backendProduct: BackendProduct = platformProducts.find(
        (bp) => bp.id === String(p.id) || bp.name === p.name
      ) || {
        id: String(p.id),
        vendorId: nextStore.vendorId || 'v-1',
        vendorName: nextStore.name,
        name: p.name,
        category: p.category,
        price: p.price,
        sizes: p.sizes || ["XS", "S", "M", "L", "XL"],
        inStock: true,
        image: p.image,
        description: p.description || '',
      }
      for (let i = 0; i < (pendingSwitch.pendingQuantity || 1); i++) {
        platformAddToCart(backendProduct, pendingSwitch.pendingSize || 'M', true)
      }
    }

    setActiveCategory(null)
    setSelectedProduct(null)
    setPendingSwitch(null)
    navigate(`/stores/${nextStore.slug}`)
    notify(
      isArabic
        ? `تم التبديل إلى متجر ${nextStore.name}. السلة مخصصة لهذا المتجر الآن.`
        : `Switched to ${nextStore.name}. Bag is now assigned to this store.`
    )
  }

  const keepCurrentStoreCart = () => {
    const currentStore = stores.find((store) => store.name === platformCart[0]?.product.vendorName)
    setPendingSwitch(null)
    if (currentStore) navigate(`/stores/${currentStore.slug}`)
  }

  const navigateMobile = (tab: MobileTab) => {
    setActiveTab(tab)
    if (tab === "wishlist") {
      setWishlistOpen(true)
      return
    }
    if (tab === "cart") {
      setCartOpen(true)
      return
    }
    if (tab === "stores") {
      navigate("/stores")
      return
    }
    if (tab === "discover") {
      navigate("/discover")
      return
    }
    if (!isHomeRoute) {
      navigate("/")
      window.setTimeout(
        () => document.querySelector("#home")?.scrollIntoView(),
        50,
      )
      return
    }
    document.querySelector("#home")?.scrollIntoView({
      behavior: "smooth",
    })
  }

  return (
    <div className={`app-shell ${isArabic ? "is-arabic" : ""}`}>
      <header className="delivery-bar">
        <button
          type="button"
          onClick={() => setIsLocationPickerOpen(true)}
        >
          <LocateFixed size={14} />
          <span>{isArabic ? "التوصيل إلى" : "Delivering to"}</span>
          <strong>{location}</strong>
          <ChevronRight size={14} />
        </button>
        <span className="delivery-time">
          <i /> {location.includes("Zamalek") || location.includes("الزمالك") ? "18–25 min" : location.includes("Zayed") || location.includes("زايد") ? "35–45 min" : "25–35 min"}
        </span>
      </header>

      <nav className="floating-nav" aria-label="Main navigation">
        <button className="brand" onClick={() => navigate("/")}>
          <img src={fastDripMark} alt="" />
          <span className="brand-word">
            FAST<strong>DRIP</strong>
          </span>
        </button>
        <div className="desktop-links">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/stores")}>Stores</button>
          <button onClick={() => navigate("/discover")}>Discover</button>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className="language-toggle"
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            aria-pressed={isArabic}
            onClick={() =>
              setLanguage((current) => {
                const next = current === "en" ? "ar" : "en"
                window.setTimeout(
                  () =>
                    notify(
                      next === "ar"
                        ? "تم تغيير اللغة إلى العربية"
                        : "Language changed to English",
                    ),
                  0,
                )
                return next
              })
            }
          >
            <Globe2 size={16} />
            <span className={!isArabic ? "active" : ""}>EN</span>
            <i />
            <span className={isArabic ? "active" : ""}>عربي</span>
          </button>
          <IconButton label="Search" onClick={() => setSearchOpen(true)}>
            <Search size={19} />
          </IconButton>
          <IconButton
            label="Customer Account"
            onClick={() => setIsAccountOpen(true)}
            className={currentCustomer ? "has-user" : ""}
          >
            <User size={19} />
            {currentCustomer && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--lime)",
                  boxShadow: "0 0 6px var(--lime)",
                }}
              />
            )}
          </IconButton>
          <motion.button
            className="bag-button"
            aria-label={`${cartCount} items in bag`}
            onClick={() => {
              setActiveTab("cart")
              setCartOpen(true)
            }}
            animate={cartCount ? { scale: [1, 1.13, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ShoppingBag size={19} />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={cartCount}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
              >
                {cartCount}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <IconButton
            label="Open menu"
            className="menu-button"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </IconButton>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            className="menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease }}
          >
            <div className="menu-top">
              <span>Navigation / 01</span>
              <IconButton label="Close menu" onClick={() => setMenuOpen(false)}>
                <X size={21} />
              </IconButton>
            </div>
            {copy.menu.map((item, index) => {
              const target = ["new", "trending", "stores", "discover"][index]
              return (
                <button
                  key={item}
                  onClick={() => {
                    setMenuOpen(false)
                    if (target === "stores" || target === "discover") {
                      navigate(`/${target}`)
                      return
                    }
                    navigate("/")
                    window.setTimeout(
                      () =>
                        document
                          .querySelector(`#${target}`)
                          ?.scrollIntoView({ behavior: "smooth" }),
                      50,
                    )
                  }}
                >
                  <span>0{index + 1}</span> {item} <ArrowUpRight />
                </button>
              )
            })}
            <button
              type="button"
              className="menu-location-button"
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--white)',
                fontSize: '13px',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => {
                setMenuOpen(false);
                setIsLocationPickerOpen(true);
              }}
            >
              <LocateFixed size={16} style={{ color: 'var(--lime)' }} />
              <span>{isArabic ? `التوصيل إلى: ${location}` : `Delivering to: ${location}`}</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </button>
            <p>{copy.menuFooter}</p>
          </motion.aside>
        )}
      </AnimatePresence>

      {isHomeRoute ? (
        <main>
          <section className="hero" id="home">
            <motion.img
              src={images.hero}
              alt="Streetwear model moving through the city at night"
              initial={reduced ? false : { scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease }}
            />
            <div className="hero-shade" />
            <div className="hero-meta">
              <span>{copy.heroMeta}</span>
              <span>{copy.heroTime}</span>
            </div>
            <motion.div
              className="hero-mark"
              initial={reduced ? false : { opacity: 0, rotate: -5, scale: 0.9 }}
              animate={{ opacity: 0.12, rotate: 0, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.4, ease }}
              aria-hidden="true"
            >
              <img src={fastDripMark} alt="" />
            </motion.div>
            <div className="hero-copy">
              <div className="hero-kicker">
                <span>{copy.heroKicker}</span>
                <span className="hero-line" />
                <span>{copy.heroCheckout}</span>
              </div>
              <h1 aria-label={copy.heroAria}>
                {copy.heroLines.map((line, lineIndex) => (
                  <span key={line} className={lineIndex ? "outline" : ""}>
                    {isArabic ? (
                      <motion.i
                        initial={reduced ? false : { y: "110%" }}
                        animate={{ y: 0 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.35 + lineIndex * 0.12,
                          ease,
                        }}
                      >
                        {line}
                      </motion.i>
                    ) : (
                      line.split("").map((letter, index) => (
                        <motion.i
                          key={`${letter}-${index}`}
                          initial={reduced ? false : { y: "110%" }}
                          animate={{ y: 0 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.35 + lineIndex * 0.12 + index * 0.025,
                            ease,
                          }}
                        >
                          {letter === " " ? "\u00A0" : letter}
                        </motion.i>
                      ))
                    )}
                  </span>
                ))}
              </h1>
              <div className="hero-bottom">
                <p>{copy.heroBody}</p>
                <a className="primary-button" href="#new">
                  {copy.shopDrop} <ArrowDown size={18} />
                </a>
              </div>
            </div>
            <span className="vertical-stamp">
              CAIRO FAST DELIVERY / CURATED LOCALLY / EST. 2025
            </span>
          </section>

          <section
            className="partner-strip"
            aria-label="Fast Drip partner stores"
          >
            <span className="partner-label">{copy.partners}</span>
            <div className="partner-list">
              {stores.map((store, index) => (
                <button
                  type="button"
                  key={store.name}
                  onClick={() => goToStorePage(store)}
                >
                  <span>0{index + 1}</span>
                  {store.name}
                </button>
              ))}
            </div>
          </section>

          <section className="stores-section store-gateway" id="stores">
            <SectionHeader
              eyebrow={copy.storesEyebrow}
              title={copy.storesTitle}
              index="01"
              action={copy.openMap}
              onAction={() =>
                window.open(
                  "https://www.google.com/maps/search/streetwear+stores+Cairo",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            />
            <p className="store-gateway-intro">
              {isArabic
                ? "ادخل أي واجهة متجر في أي وقت. التصفح مفتوح، والسلة فقط هي اللي تلتزم بمتجر واحد."
                : "Visit any dedicated storefront at any time. Browsing stays open; only the cart is limited to one store."}
            </p>
            <div className="store-rail">
              {stores.map((store, index) => (
                <Reveal
                  className="store-card"
                  key={store.name}
                  delay={index * 0.08}
                >
                  <button onClick={() => goToStorePage(store)}>
                    <img
                      src={store.image}
                      alt={`Editorial from ${store.name}`}
                    />
                    <div className="store-topline">
                      <span>{store.code}</span>
                      <span className="open-pill">
                        <i /> Open now
                      </span>
                    </div>
                    <div className="store-info">
                      <div>
                        <h3>{store.name}</h3>
                        <span>
                          <MapPin size={13} /> {store.location}
                        </span>
                      </div>
                      <i>
                        <ArrowUpRight size={19} />
                      </i>
                    </div>
                    <span className="store-time">
                      <Clock3 size={14} /> Delivery {store.time}
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </section>

          <section className="category-section">
            <div className="mini-head">
              <span>{copy.categories}</span>
              <span>
                {copy.swipe} <ArrowRight size={14} />
              </span>
            </div>
            <motion.div className="category-rail">
              {categories.map((category, index) => (
                <motion.button
                  className="category-card"
                  key={category.name}
                  onClick={() => showCatalog({ category: category.name })}
                  initial={reduced ? false : { opacity: 0, x: 30 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img src={category.image} alt="" />
                  <span className="category-number">0{index + 1}</span>
                  <span className="category-name">
                    <strong>{category.name}</strong>
                    <small>{category.count}</small>
                  </span>
                  <i>
                    <ArrowUpRight size={18} />
                  </i>
                </motion.button>
              ))}
            </motion.div>
          </section>

          <section className="content-section" id="new">
            <SectionHeader
              eyebrow={
                activeCategory
                  ? `Category / ${activeCategory}`
                  : isArabic
                    ? "كل المتاجر / كل المنتجات"
                    : "All stores / All products"
              }
              title={isArabic ? "اكتشف كل الدروبات" : "DISCOVER ALL DROPS"}
              index="02"
              action={activeCategory ? copy.clear : copy.viewAll}
              onAction={() => showCatalog({})}
            />
            {activeCategory && (
              <div className="filter-status">
                <span>
                  {filteredProducts.length} {copy.shown}
                </span>
                <button onClick={() => showCatalog({})}>
                  {copy.reset} <X size={14} />
                </button>
              </div>
            )}
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  favorites={favorites}
                  onFavorite={(id) =>
                    setFavorites((items) =>
                      items.includes(id)
                        ? items.filter((item) => item !== id)
                        : [...items, id],
                    )
                  }
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          </section>

          <section className="campaign-break">
            <img
              src={images.campaign}
              alt="Model in a minimalist white streetwear look"
            />
            <div className="campaign-overlay" />
            <Reveal className="campaign-content">
              <span className="eyebrow">{copy.campaignEyebrow}</span>
              <h2>
                {copy.campaignLines[0]}
                <br />
                {copy.campaignLines[1]}
              </h2>
              <p>{copy.campaignBody}</p>
              <button
                className="light-button"
                onClick={() => showCatalog({ category: "Jackets" })}
              >
                {copy.explore} <ArrowUpRight size={18} />
              </button>
            </Reveal>
            <span className="campaign-code">FD® / 2030</span>
          </section>

          <section className="content-section" id="trending">
            <SectionHeader
              eyebrow={copy.trendingEyebrow}
              title={copy.trending}
              index="02"
              onAction={() => showCatalog({})}
            />
            <div className="product-grid">
              {[products[4], products[12], products[0], products[7]].map(
                (product, index) => (
                  <ProductCard
                    key={`${product.id}-${index}`}
                    product={product}
                    index={index}
                    favorites={favorites}
                    onFavorite={(id) =>
                      setFavorites((items) =>
                        items.includes(id)
                          ? items.filter((item) => item !== id)
                          : [...items, id],
                      )
                    }
                    onSelect={setSelectedProduct}
                  />
                ),
              )}
            </div>
          </section>

          <section className="coverage-section" id="coverage">
            <Reveal className="coverage-copy">
              <span className="eyebrow">
                {isArabic
                  ? "تغطية القاهرة المباشرة / ٠٥ مناطق"
                  : "Live Cairo coverage / 05 zones"}
              </span>
              <h2>
                {isArabic ? "مدينتك." : "YOUR CITY."}
                <br />
                {isArabic ? "على الخريطة." : "ON THE GRID."}
              </h2>
              <p>
                {isArabic
                  ? "اختار منطقة التوصيل عشان تشوف أقرب شبكة شركاء ووقت الوصول المتوقع."
                  : "Select a delivery zone to preview the closest partner network and estimated arrival window."}
              </p>
              <div className="coverage-zones">
                {[
                  ["Zamalek, Cairo", "18–25 min"],
                  ["Maadi, Cairo", "25–35 min"],
                  ["New Cairo", "30–40 min"],
                  ["Heliopolis", "25–35 min"],
                  ["Sheikh Zayed", "35–45 min"],
                ].map(([zone, time]) => (
                  <button
                    key={zone}
                    className={location === zone ? "active" : ""}
                    onClick={() => {
                      setLocation(zone)
                      notify(`Delivery estimate updated to ${time}.`)
                    }}
                  >
                    <span>{zone}</span>
                    <strong>{time}</strong>
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal className="coverage-map" delay={0.1}>
              <div className="map-grid" />
              {stores.map((store, index) => (
                <button
                  key={store.name}
                  className={`map-node map-node-${index + 1}`}
                  onClick={() => goToStorePage(store)}
                  aria-label={`Open ${store.name}`}
                >
                  <i />
                  <span>{store.name}</span>
                </button>
              ))}
              <span className="map-location">
                <LocateFixed size={15} /> {location}
              </span>
              <span className="map-ring" />
            </Reveal>
          </section>

          <section className="promise-section">
            <Reveal className="promise-title">
              <span>
                <Zap size={16} /> {copy.promise}
              </span>
              <h2>
                {copy.promiseTitle[0]}
                <br />
                <em>{copy.promiseTitle[1]}</em>
              </h2>
            </Reveal>
            <div className="promise-grid">
              {[
                {
                  icon: <Store />,
                  num: "01",
                  title: isArabic ? "تسوق محلي" : "Shop local",
                  text: isArabic
                    ? "متاجر مستقلة في ماركت بليس واحد."
                    : "Independent stores, one seamless marketplace.",
                },
                {
                  icon: <Truck />,
                  num: "02",
                  title: isArabic ? "أقل من ٤٥ دقيقة" : "Under 45 min",
                  text: isArabic
                    ? "توصيل مباشر داخل القاهرة من المتجر لبابك."
                    : "Real-time Cairo delivery from their rack to your door.",
                },
                {
                  icon: <ShieldCheck />,
                  num: "03",
                  title: isArabic ? "أصلي دائمًا" : "Always authentic",
                  text: isArabic
                    ? "كل قطعة موثقة مباشرة من المتجر."
                    : "Every piece verified directly by the retailer.",
                },
                {
                  icon: <Eye />,
                  num: "04",
                  title: isArabic ? "عاين عند الباب" : "Inspect at the door",
                  text: isArabic
                    ? "راجع كل قطعة قبل استلامها من المندوب."
                    : "Check every item before accepting it from the rider.",
                },
              ].map((item, index) => (
                <Reveal
                  className="promise-card"
                  key={item.title}
                  delay={index * 0.08}
                >
                  <span>{item.num}</span>
                  {item.icon}
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </section>
        </main>
      ) : isStoresRoute ? (
        <StoreDirectoryPage isArabic={isArabic} onOpenStore={goToStorePage} />
      ) : isDiscoverRoute ? (
        <GlobalDiscoverPage
          favorites={favorites}
          onFavorite={(id) =>
            setFavorites((items) =>
              items.includes(id)
                ? items.filter((item) => item !== id)
                : [...items, id],
            )
          }
          onSelect={setSelectedProduct}
        />
      ) : routeStore ? (
        <DedicatedStorefrontPage
          store={routeStore}
          isArabic={isArabic}
          onBack={() => navigate("/discover")}
          onViewProduct={setSelectedProduct}
          onAddProduct={addToCart}
        />
      ) : (
        <main className="route-page not-found-page">
          <span className="eyebrow">404 / FAST DRIP</span>
          <h1>PAGE NOT FOUND</h1>
          <button className="primary-button" onClick={() => navigate("/")}>
            Back home <ArrowRight size={17} />
          </button>
        </main>
      )}

      <footer>
        <div className="footer-main">
          <div>
            <div className="footer-brand">
              <img src={fastDripMark} alt="FAST DRIP" />
              <span>
                FAST<strong>DRIP</strong>
              </span>
            </div>
            <p>
              YOUR CITY. YOUR STYLE.
              <br />
              DELIVERED FAST.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <span>Explore</span>
              <button onClick={() => navigate("/")}>New arrivals</button>
              <button onClick={() => navigate("/")}>Trending</button>
              <button onClick={() => navigate("/stores")}>Local stores</button>
            </div>
            <div>
              <span>Company</span>
              <button onClick={() => navigate("/stores")}>Our partners</button>
              <button
                onClick={() => {
                  navigate("/")
                  window.setTimeout(
                    () =>
                      document
                        .querySelector("#coverage")
                        ?.scrollIntoView({ behavior: "smooth" }),
                    50,
                  )
                }}
              >
                How it works
              </button>
              <a href="mailto:hello@fastdrip.example">Contact</a>
            </div>
          </div>
        </div>
        <form
          className="newsletter"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.trim()) return
            notify("You're on the test drop list.")
            setEmail("")
          }}
        >
          <span>{copy.newsletter}</span>
          <label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.email}
              aria-label={copy.email}
            />
            <button type="submit" aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </label>
        </form>
        <div className="footer-bottom">
          <span>© 2030 FAST DRIP</span>
          <span>Cairo / 30.0444° N</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {copy.backTop} <ArrowUpRight size={14} />
          </button>
        </div>
      </footer>

      <BottomNavigation
        active={activeTab}
        favoritesCount={favorites.length}
        cartCount={cartCount}
        language={language}
        onNavigate={navigateMobile}
      />

      <AnimatePresence>
        {searchOpen && (
          <SearchPanel
            query={searchQuery}
            storeName={null}
            onQueryChange={setSearchQuery}
            onClose={() => setSearchOpen(false)}
            onSelect={(product) => {
              setSearchOpen(false)
              setSelectedProduct(product)
            }}
          />
        )}
        {cartOpen && (
          <CartPanel
            cart={platformCart}
            onClose={() => setCartOpen(false)}
            onRemove={(productId, size) => platformRemoveFromCart(productId, size)}
            onUpdateQuantity={(productId, size, qty) =>
              platformUpdateCartQuantity(productId, size, qty)
            }
            onCheckout={handleCheckout}
            currentCustomer={currentCustomer}
            location={location}
            deliveryFee={deliveryFee}
            isArabic={isArabic}
            onRequestAuth={() => {
              setCartOpen(false)
              setIsPendingCheckoutAfterAuth(true)
              setAuthMode('login')
              setIsAuthModalOpen(true)
            }}
          />
        )}
        {wishlistOpen && (
          <WishlistPanel
            favorites={favorites}
            onClose={() => setWishlistOpen(false)}
            onSelect={(product) => {
              setWishlistOpen(false)
              setSelectedProduct(product)
            }}
            onRemove={(id) =>
              setFavorites((items) => items.filter((item) => item !== id))
            }
          />
        )}
        {orderOpen && (activeOrder || orders[0]) && (
          <OrderTracker
            order={activeOrder || orders[0]}
            onClose={() => setOrderOpen(false)}
            onSubmitRating={submitOrderRating}
            isArabic={isArabic}
          />
        )}
        {isLocationPickerOpen && (
          <LocationPickerModal
            currentLocation={location}
            onSelectLocation={(newLoc) => {
              setLocation(newLoc)
              notify(isArabic ? `تم تحديث العنوان إلى: ${newLoc}` : `Delivery updated to: ${newLoc}`)
            }}
            onClose={() => setIsLocationPickerOpen(false)}
            isArabic={isArabic}
          />
        )}
        {isAccountOpen && (
          <AccountDrawer
            customer={currentCustomer}
            orders={orders}
            onClose={() => setIsAccountOpen(false)}
            onLogout={() => {
              logoutCustomer()
              setIsAccountOpen(false)
            }}
            onTrackOrder={(ord) => {
              setActiveTrackingOrderId(ord.id)
              setOrderOpen(true)
            }}
            onRequestAuth={() => {
              setIsAccountOpen(false)
              setAuthMode('login')
              setIsAuthModalOpen(true)
            }}
            isArabic={isArabic}
          />
        )}
        {pendingSwitch && (
          <StoreSwitchDialog
            currentStore={platformCart[0]?.product.vendorName || pendingSwitch.store.name}
            nextStore={pendingSwitch.store.name}
            isArabic={isArabic}
            onKeep={keepCurrentStoreCart}
            onConfirm={confirmStoreSwitch}
          />
        )}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={addToCart}
            isArabic={isArabic}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {notice && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Check size={16} /> {notice}
          </motion.div>
        )}
      </AnimatePresence>
    
      {/* Real Customer Authentication Gate Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            className="modal-backdrop panel-backdrop"
            style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAuthModalOpen(false)}
          >
            <motion.div
              style={{
                background: '#131517',
                border: '1px solid rgba(209, 254, 23, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                color: '#fff',
                fontFamily: isArabic ? "'Noto Sans Arabic', sans-serif" : "'Space Grotesk', sans-serif",
                direction: isArabic ? 'rtl' : 'ltr',
              }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D1FE17', fontWeight: 600 }}>
                    FAST DRIP // SECURE CHECKOUT
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0', color: '#fff' }}>
                    {authMode === 'login' ? (isArabic ? 'تسجيل الدخول لإتمام الطلب' : 'Sign in to Checkout') : (isArabic ? 'إنشاء حساب عميل جديد' : 'Create Customer Account')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#898A8B', cursor: 'pointer', padding: '6px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCustomerAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                {authMode === 'register' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      {isArabic ? 'الاسم الكامل:' : 'Full Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? 'مثال: يوسف إبراهيم' : 'e.g. Youssef Ibrahim'}
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1c1e21', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    {isArabic ? 'البريد الإلكتروني:' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1c1e21', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                        {isArabic ? 'رقم الهاتف:' : 'Phone Number:'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010XXXXXXXX"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1c1e21', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                        {isArabic ? 'المنطقة:' : 'Delivery Area:'}
                      </label>
                      <select
                        value={authArea}
                        onChange={(e) => setAuthArea(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1c1e21', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
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
                      <label style={{ display: 'block', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                        {isArabic ? 'العنوان بالتفصيل:' : 'Detailed Address:'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isArabic ? 'شارع 9، المعادي، القاهرة' : 'Street 9, Maadi, Cairo'}
                        value={authAddress}
                        onChange={(e) => setAuthAddress(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1c1e21', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    {isArabic ? 'كلمة المرور:' : 'Password:'}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1c1e21', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    style={{ background: 'transparent', border: 'none', color: '#D1FE17', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    {authMode === 'login'
                      ? (isArabic ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'Need an account? Register now')
                      : (isArabic ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign in')}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: '#D1FE17', border: 'none', color: '#131517', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {isAuthSubmitting
                      ? (isArabic ? 'جاري التحقق...' : 'Verifying...')
                      : (authMode === 'login' ? (isArabic ? 'تسجيل الدخول والمتابعة' : 'Sign In & Continue') : (isArabic ? 'إنشاء الحساب والمتابعة' : 'Register & Continue'))}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  )
}

export default CustomerApp
