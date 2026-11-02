import { useEffect, useState } from "react"
// router replaced with standalone state
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
} from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
const fastDripMark = "/brand/fast-drip-mark.webp"

type Product = {
  id: number
  name: string
  brand: string
  price: number
  image: string
  tag?: string
  color: string
  category: "T-Shirts" | "Shirts" | "Hoodies & Sweatshirts" | "Jackets" | "Pants" | "Jeans" | "Shorts" | "Sneakers" | "Accessories"
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
    location: "Maadi, Degla",
    time: "25–35 min",
    image:
      "https://images.unsplash.com/photo-1663577272066-fb0545944591?auto=format&fit=crop&w=1000&q=85",
    code: "FD/01",
    slug: "untitled-cairo",
  },
  {
    name: "SHABAB CO.",
    location: "Zamalek",
    time: "18–25 min",
    image:
      "https://images.unsplash.com/photo-1668419394157-0cd203812c08?auto=format&fit=crop&w=1000&q=85",
    code: "FD/02",
    slug: "shabab-co",
  },
  {
    name: "ZAG STORE",
    location: "New Cairo",
    time: "30–40 min",
    image:
      "https://images.unsplash.com/photo-1664359028938-53a4333efb17?auto=format&fit=crop&w=1000&q=85",
    code: "FD/03",
    slug: "zag-store",
  },
  {
    name: "OVERSIZED EG",
    location: "Heliopolis, Korba",
    time: "25–35 min",
    image:
      "https://images.unsplash.com/photo-1664359028599-c3ac398825e0?auto=format&fit=crop&w=1000&q=85",
    code: "FD/04",
    slug: "oversized-eg",
  },
  {
    name: "NOIR ATELIER",
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
}: {
  product: Product
  onClose: () => void
  onAdd: (product: Product) => void
}) {
  const [size, setSize] = useState("M")
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
          <span className="eyebrow">Sold by / {product.brand}</span>
          <div className="modal-title">
            <h2>{product.name}</h2>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <p>
            Available directly from {product.brand}. One local checkout, with
            pickup from the store and delivery across Cairo in under 45 minutes.
          </p>
          <div className="product-assurance">
            <span>
              <PackageCheck size={15} /> Stock confirmed 2 min ago
            </span>
            <span>
              <Eye size={15} /> Inspect before accepting at your door
            </span>
          </div>
          <div className="sizes" aria-label="Select size">
            {["XS", "S", "M", "L", "XL"].map((item) => (
              <button
                key={item}
                className={size === item ? "selected" : ""}
                onClick={() => setSize(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            className="primary-button wide"
            onClick={() => onAdd(product)}
          >
            Add to bag <span>{formatPrice(product.price)}</span>
          </button>
          <span className="delivery-note">
            <Zap size={15} /> Cairo delivery in 25–35 minutes
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
  onCheckout,
}: {
  cart: Product[]
  onClose: () => void
  onRemove: (productId: number) => void
  onCheckout: () => void
}) {
  const total = cart.reduce((sum, product) => sum + product.price, 0)
  const cartStores = [...new Set(cart.map((product) => product.brand))]
  const selectedCartStore = stores.find((store) => store.name === cartStores[0])
  const deliveryTimes = selectedCartStore?.time.match(/\d+/g)?.map(Number) ?? []
  const deliveryMax = deliveryTimes.length ? Math.max(...deliveryTimes) : 999
  const qualifiesForFastDelivery = deliveryMax <= 60

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
            <span className="eyebrow">Your bag</span>
            <h2>{cart.length} ITEMS</h2>
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
                  <small>{store?.time}</small>
                </header>
                {cart
                  .filter((product) => product.brand === storeName)
                  .map((product, index) => (
                    <article key={`${product.id}-${index}`}>
                      <img src={product.image} alt="" />
                      <div>
                        <small>{product.color}</small>
                        <strong>{product.name}</strong>
                        <span>{formatPrice(product.price)}</span>
                      </div>
                      <IconButton
                        label={`Remove ${product.name}`}
                        onClick={() => onRemove(product.id)}
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
              <p>Your test bag is empty.</p>
              <button className="text-link" onClick={onClose}>
                Start shopping <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-summary">
            {qualifiesForFastDelivery && (
              <span className="cart-fast-delivery">
                <Zap size={15} /> Estimated delivery within 60 minutes
              </span>
            )}
            <p className="inspection-note">
              <Eye size={15} /> Inspect every item before accepting. Return it
              with the rider if it is not right.
            </p>
            <span>
              Order from {cartStores[0]} · total{" "}
              <strong>{formatPrice(total)}</strong>
            </span>
            <button className="primary-button wide" onClick={onCheckout}>
              Demo checkout <ArrowRight size={17} />
            </button>
            <small>No payment will be processed.</small>
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
  storeName,
  destination,
  onClose,
}: {
  storeName: string
  destination: string
  onClose: () => void
}) {
  const [stage, setStage] = useState(1)
  const steps = [
    ["Order placed", "Your demo order is confirmed"],
    ["Store confirmed", "Inventory secured at each partner"],
    ["Rider collecting", "Pickup route is optimized"],
    ["Arriving", "Inspect items before accepting"],
  ]
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
            <span className="eyebrow">Demo order / FD-2030</span>
            <h2>TRACK THE DRIP</h2>
          </div>
          <IconButton label="Close order tracking" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="order-eta">
          <Navigation size={20} />
          <span>
            <small>Estimated arrival</small>
            <strong>{stage === 3 ? "8–12 min" : "24–32 min"}</strong>
          </span>
        </div>
        <div className="order-route">
          <span>
            <Store size={15} /> From <strong>{storeName}</strong>
          </span>
          <ArrowRight size={15} />
          <span>
            <MapPin size={15} /> To <strong>{destination}</strong>
          </span>
        </div>
        <div className="order-steps">
          {steps.map(([title, text], index) => (
            <div key={title} className={index <= stage ? "complete" : ""}>
              <i>{index < stage ? <Check size={14} /> : index + 1}</i>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </div>
        <button
          className="primary-button wide"
          onClick={() => (stage < 3 ? setStage(stage + 1) : onClose())}
        >
          {stage < 3 ? "Advance demo status" : "Finish demo"}{" "}
          <ArrowRight size={17} />
        </button>
      </motion.section>
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

function App() {
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
        allProducts: "١٥ منتجًا تجريبيًا / ٣ لكل متجر",
        catalog: "الكتالوج التجريبي",
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

  const addToCart = (product: Product) => {
    const productStore = stores.find((store) => store.name === product.brand)
    const cartStore = cart[0]?.brand
    if (productStore && cartStore && cartStore !== product.brand) {
      setSelectedProduct(null)
      setPendingSwitch({ store: productStore })
      return
    }

    setCart((items) => [...items, product])
    setSelectedProduct(null)
    setNotice(`${product.name} added to your test bag.`)
    window.setTimeout(() => setNotice(""), 2600)
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
    setCart([])
    setActiveCategory(null)
    setSelectedProduct(null)
    setPendingSwitch(null)
    navigate(`/stores/${nextStore.slug}`)
    notify(
      isArabic
        ? `تم التبديل إلى ${nextStore.name}. السلة فاضية وجاهزة.`
        : `Switched to ${nextStore.name}. Your cart is now empty.`,
    )
  }

  const keepCurrentStoreCart = () => {
    const currentStore = stores.find((store) => store.name === cart[0]?.brand)
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
          onClick={() =>
            setLocation((current) =>
              current === "Zamalek, Cairo" ? "Maadi, Cairo" : "Zamalek, Cairo",
            )
          }
        >
          <LocateFixed size={14} />
          <span>{isArabic ? "التوصيل إلى" : "Delivering to"}</span>
          <strong>{location}</strong>
          <ChevronRight size={14} />
        </button>
        <span className="delivery-time">
          <i /> 24 min
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
          <motion.button
            className="bag-button"
            aria-label={`${cart.length} items in bag`}
            onClick={() => {
              setActiveTab("cart")
              setCartOpen(true)
            }}
            animate={cart.length ? { scale: [1, 1.13, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ShoppingBag size={19} />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={cart.length}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
              >
                {cart.length}
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
        cartCount={cart.length}
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
            cart={cart}
            onClose={() => setCartOpen(false)}
            onRemove={(productId) =>
              setCart((items) => {
                const removeIndex = items.findIndex(
                  (product) => product.id === productId,
                )
                return items.filter((_, index) => index !== removeIndex)
              })
            }
            onCheckout={() => {
              setCartOpen(false)
              setOrderOpen(true)
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
        {orderOpen && cart[0] && (
          <OrderTracker
            storeName={cart[0].brand}
            destination={location}
            onClose={() => setOrderOpen(false)}
          />
        )}
        {pendingSwitch && cart[0] && (
          <StoreSwitchDialog
            currentStore={cart[0].brand}
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
    </div>
  )
}

export default App
