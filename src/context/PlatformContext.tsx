import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CartItem,
  CustomerPaymentMethod,
  CustomerUser,
  Driver,
  OnboardingType,
  Order,
  PricingConfig,
  Product,
  SettlementRequest,
  UserPortal,
  Vendor,
} from '../types';
import {
  calculateGeoDistanceKm,
  generateIdDocSvg,
  generateReceiptSvg,
  initialCustomers,
  initialDrivers,
  initialOrders,
  initialPricingConfig,
  initialProducts,
  initialSettlements,
  initialVendors,
} from '../data/mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface PlatformContextType {
  // Navigation & Portals
  activePortal: UserPortal;
  setActivePortal: (portal: UserPortal) => void;
  onboardingType: OnboardingType;
  setOnboardingType: (type: OnboardingType) => void;

  // Portal Authentication (Server-verified RBAC)
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  isVendorAuthenticated: boolean;
  loginVendor: (email: string, password: string) => Promise<boolean>;
  logoutVendor: () => void;
  isDriverAuthenticated: boolean;
  loginDriver: (email: string, password: string) => Promise<boolean>;
  logoutDriver: () => void;

  // Customer Authentication & Management
  customers: CustomerUser[];
  currentCustomer: CustomerUser | null;
  loginCustomer: (email: string, password: string) => Promise<boolean>;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    area: string;
    address: string;
  }) => Promise<CustomerUser | null>;
  logoutCustomer: () => void;
  setCurrentCustomer: (customer: CustomerUser | null) => void;

  // Selected Entities (Locked to authenticated session)
  activeVendorId: string;
  setActiveVendorId: (id: string) => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;

  // State Lists
  vendors: Vendor[];
  drivers: Driver[];
  products: Product[];
  orders: Order[];
  settlements: SettlementRequest[];
  pricingConfig: PricingConfig;

  // Cart (Customer Portal)
  cart: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Financial Calculations
  calculateDeliveryFee: (distanceKm: number) => number;

  // Orders Actions
  placeOrder: (customerInfo: {
    customerId?: string;
    name: string;
    phone: string;
    area: string;
    address: string;
    coordinates?: { lat: number; lng: number };
    paymentMethod: CustomerPaymentMethod;
    notes?: string;
  }) => Order | null;
  vendorPrepareOrder: (orderId: string) => void;
  vendorConfirmStockAndPrepare: (orderId: string) => void;
  vendorCancelOutOfStock: (orderId: string, reason?: string) => void;
  vendorConfirmReturnReceived: (orderId: string) => void;
  driverAcceptOrder: (orderId: string, driverId: string) => void;
  driverConfirmStorePickup: (orderId: string) => void;
  driverCompleteDelivery: (orderId: string) => void;
  driverTriggerInstantReturn: (orderId: string, reason: string) => void;
  submitOrderRating: (
    orderId: string,
    ratingData: {
      vendorRating: number;
      vendorReview?: string;
      driverRating?: number;
      driverReview?: string;
    }
  ) => void;
  updateUserPassword: (
    type: 'vendor' | 'driver' | 'customer',
    id: string,
    newPass: string
  ) => Promise<boolean>;

  // Settlements Actions
  submitSettlement: (data: {
    entityType: 'vendor' | 'driver';
    entityId: string;
    amount: number;
    method: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'cash_office';
    transactionRef: string;
    notes?: string;
    customReceiptImage?: string;
  }) => void;
  approveSettlement: (settlementId: string, adminNotes?: string) => void;
  rejectSettlement: (settlementId: string, reason: string) => void;
  recordManualCashSettlement: (
    entityType: 'vendor' | 'driver',
    entityId: string,
    amount: number,
    adminNotes?: string
  ) => void;

  // Admin Configuration & Fleet/Vendor Management
  updatePricingConfig: (newConfig: Partial<PricingConfig>) => void;
  updateVendorCommissionAndLimit: (
    vendorId: string,
    commissionRate: number,
    debtLimit: number
  ) => void;
  toggleVendorStatus: (vendorId: string) => void;
  approvePendingVendor: (
    vendorId: string,
    commissionRate: number,
    debtLimit: number
  ) => void;
  rejectPendingVendor: (vendorId: string) => void;
  addVendorManual: (
    vendor: Omit<Vendor, 'id' | 'currentDebt' | 'totalSales' | 'createdAt'> & {
      password?: string;
    }
  ) => void;

  updateDriverLimit: (driverId: string, debtLimit: number) => void;
  toggleDriverStatus: (driverId: string) => void;
  toggleDriverOnline: (driverId: string) => void;
  approvePendingDriver: (driverId: string, debtLimit: number) => void;
  rejectPendingDriver: (driverId: string) => void;
  updateDriverCoordinates: (driverId: string, coordinates: { lat: number; lng: number }) => void;

  // Product Management (Vendor Portal)
  addProduct: (product: Omit<Product, 'id' | 'vendorName'>) => void;
  updateProduct: (productId: string, updated: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;

  // Onboarding submissions
  registerVendorApplication: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    area: string;
    address: string;
    category: string;
    logoUrl?: string;
    instagram?: string;
  }) => Promise<boolean>;
  registerDriverApplication: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicle: string;
    vehicleNumber: string;
    area: string;
    nationalId: string;
    avatarPhoto?: string;
    vehiclePhoto?: string;
    nationalIdPhoto?: string;
    licensePhoto?: string;
  }) => Promise<boolean>;

  // Modal Image Preview
  previewImage: { url: string; title: string; subtitle?: string } | null;
  setPreviewImage: (data: { url: string; title: string; subtitle?: string } | null) => void;

  // Notification Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

function detectPortalFromUrl(): { portal: UserPortal; onboarding?: OnboardingType } {
  if (typeof window === 'undefined') return { portal: 'customer' };

  const pathname = window.location.pathname.toLowerCase();

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return { portal: 'admin' };
  }
  if (pathname === '/vendor' || pathname.startsWith('/vendor/')) {
    return { portal: 'vendor' };
  }
  if (pathname === '/driver' || pathname.startsWith('/driver/')) {
    return { portal: 'driver' };
  }
  if (pathname === '/join/driver' || pathname.startsWith('/join/driver/')) {
    return { portal: 'onboarding', onboarding: 'driver' };
  }
  if (pathname === '/join/vendor' || pathname.startsWith('/join/vendor/')) {
    return { portal: 'onboarding', onboarding: 'vendor' };
  }
  if (pathname === '/join' || pathname.startsWith('/join/')) {
    return { portal: 'onboarding' };
  }
  if (pathname === '/store' || pathname.startsWith('/store/')) {
    return { portal: 'customer' };
  }

  return { portal: 'customer' };
}

function sanitizeStoredEntities<T extends { id: string; email: string }>(
  items: T[],
  defaults: T[]
): T[] {
  return items.map((item) => {
    const copy = { ...item } as T & { password?: string };
    delete copy.password;
    if (!copy.email) {
      const def = defaults.find((d) => d.id === copy.id);
      if (def?.email) copy.email = def.email;
    }
    return copy;
  });
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = detectPortalFromUrl();
  const [activePortalState, setActivePortalState] = useState<UserPortal>(initialRoute.portal);
  const [onboardingTypeState, setOnboardingTypeState] = useState<OnboardingType>(
    initialRoute.onboarding || 'vendor'
  );

  const setOnboardingType = (type: OnboardingType) => {
    setOnboardingTypeState(type);
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/join')) {
      const targetPath = type === 'driver' ? '/join/driver' : '/join/vendor';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ portal: 'onboarding', onboarding: type }, '', targetPath);
      }
    }
  };

  const setActivePortal = (portal: UserPortal) => {
    setActivePortalState(portal);
    if (typeof window !== 'undefined') {
      const pathMap: Record<UserPortal, string> = {
        customer: '/store',
        vendor: '/vendor',
        driver: '/driver',
        admin: '/admin',
        onboarding:
          onboardingTypeState === 'driver'
            ? '/join/driver'
            : onboardingTypeState === 'vendor'
            ? '/join/vendor'
            : '/join',
      };
      const targetPath = pathMap[portal] || '/store';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ portal }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const detected = detectPortalFromUrl();
      setActivePortalState(detected.portal);
      if (detected.onboarding) setOnboardingTypeState(detected.onboarding);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() =>
    loadFromStorage('vf_pricing_v1', initialPricingConfig)
  );
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    sanitizeStoredEntities(loadFromStorage('vf_vendors_v1', initialVendors), initialVendors)
  );
  const [drivers, setDrivers] = useState<Driver[]>(() =>
    sanitizeStoredEntities(loadFromStorage('vf_drivers_v1', initialDrivers), initialDrivers)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('vf_products_v1', initialProducts)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('vf_orders_v1', initialOrders)
  );
  const [settlements, setSettlements] = useState<SettlementRequest[]>(() =>
    loadFromStorage('vf_settlements_v1', initialSettlements)
  );

  // Customer Management — NO auto-login of demo customer
  const [customers, setCustomers] = useState<CustomerUser[]>(() =>
    sanitizeStoredEntities(loadFromStorage('vf_customers_v1', initialCustomers), initialCustomers)
  );
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(null);

  const [activeVendorId, setActiveVendorIdState] = useState<string>('');
  const [activeDriverId, setActiveDriverIdState] = useState<string>('');

  // Portal Auth States — strictly derived from server-side /api/auth session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isVendorAuthenticated, setIsVendorAuthenticated] = useState<boolean>(false);
  const [isDriverAuthenticated, setIsDriverAuthenticated] = useState<boolean>(false);

  // Prevent cross-account switching by non-admins
  const setActiveVendorId = (id: string) => {
    if (isVendorAuthenticated && !isAdminAuthenticated && activeVendorId && id !== activeVendorId) {
      showToast('غير مصرح: لا يمكنك الوصول إلى بيانات متجر آخر', 'error');
      return;
    }
    setActiveVendorIdState(id);
  };

  const setActiveDriverId = (id: string) => {
    if (isDriverAuthenticated && !isAdminAuthenticated && activeDriverId && id !== activeDriverId) {
      showToast('غير مصرح: لا يمكنك الوصول إلى حساب كابتن آخر', 'error');
      return;
    }
    setActiveDriverIdState(id);
  };

  // Helper to verify server-side authorization before sensitive mutations
  const authorizeServerMutation = async (
    requiredRole: 'admin' | 'vendor' | 'driver' | 'customer',
    mutation: string,
    targetEntityId?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'authorize-mutation',
          requiredRole,
          targetEntityId,
          mutation,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'غير مصرح لك بتنفيذ هذا الإجراء', 'error');
        return false;
      }
      return true;
    } catch {
      showToast('تعذر التحقق من الصلاحية الأمنية من الخادم', 'error');
      return false;
    }
  };

  // Server-side RBAC session verification on mount and portal switch
  useEffect(() => {
    let cancelled = false;
    async function verifyServerSession() {
      try {
        const res = await fetch('/api/auth?action=session', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;

        const session = data?.session;
        if (!session) {
          setIsAdminAuthenticated(false);
          setIsVendorAuthenticated(false);
          setIsDriverAuthenticated(false);
          setCurrentCustomer(null);
          return;
        }

        // Strict single-role session enforcement
        setIsAdminAuthenticated(session.role === 'admin');
        setIsVendorAuthenticated(session.role === 'vendor');
        setIsDriverAuthenticated(session.role === 'driver');

        if (session.role === 'vendor' && session.entityId) {
          setActiveVendorIdState(session.entityId);
        } else if (session.role !== 'vendor') {
          setActiveVendorIdState('');
        }

        if (session.role === 'driver' && session.entityId) {
          setActiveDriverIdState(session.entityId);
        } else if (session.role !== 'driver') {
          setActiveDriverIdState('');
        }

        if (session.role === 'customer' && session.entityId) {
          const foundCust = customers.find((c) => c.id === session.entityId);
          if (foundCust) {
            setCurrentCustomer(foundCust);
          } else {
            setCurrentCustomer({
              id: session.entityId,
              name: session.name,
              email: session.email,
              phone: session.phone || '',
              area: 'القاهرة',
              address: 'القاهرة',
              createdAt: new Date().toISOString().slice(0, 10),
            });
          }
        } else if (session.role !== 'customer') {
          setCurrentCustomer(null);
        }
      } catch {
        // If server unreachable, default to unauthenticated
        setIsAdminAuthenticated(false);
        setIsVendorAuthenticated(false);
        setIsDriverAuthenticated(false);
        setCurrentCustomer(null);
      }
    }
    verifyServerSession();
    return () => {
      cancelled = true;
    };
  }, [activePortalState]);

  // Persist non-sensitive operational data to localStorage (never store passwords or auth tokens)
  useEffect(() => {
    try {
      window.localStorage.setItem('vf_pricing_v1', JSON.stringify(pricingConfig));
      window.localStorage.setItem('vf_vendors_v1', JSON.stringify(vendors));
      window.localStorage.setItem('vf_drivers_v1', JSON.stringify(drivers));
      window.localStorage.setItem('vf_products_v1', JSON.stringify(products));
      window.localStorage.setItem('vf_orders_v1', JSON.stringify(orders));
      window.localStorage.setItem('vf_settlements_v1', JSON.stringify(settlements));
      window.localStorage.setItem('vf_customers_v1', JSON.stringify(customers));
      // Clean up legacy insecure auth keys if present
      window.localStorage.removeItem('vf_current_customer_v1');
      window.localStorage.removeItem('vf_auth_admin_v1');
      window.localStorage.removeItem('vf_auth_vendor_v1');
      window.localStorage.removeItem('vf_auth_driver_v1');
    } catch {
      // ignore storage quota errors
    }
  }, [pricingConfig, vendors, drivers, products, orders, settlements, customers]);

  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (e.key === 'vf_pricing_v1') setPricingConfig(parsed);
        if (e.key === 'vf_vendors_v1') setVendors(sanitizeStoredEntities(parsed, initialVendors));
        if (e.key === 'vf_drivers_v1') setDrivers(sanitizeStoredEntities(parsed, initialDrivers));
        if (e.key === 'vf_products_v1') setProducts(parsed);
        if (e.key === 'vf_orders_v1') setOrders(parsed);
        if (e.key === 'vf_settlements_v1') setSettlements(parsed);
        if (e.key === 'vf_customers_v1') setCustomers(sanitizeStoredEntities(parsed, initialCustomers));
      } catch {
        // ignore parse errors
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  // ============================================================================
  // STRICT EMAIL + PASSWORD AUTHENTICATION HANDLERS
  // ============================================================================

  const loginCustomer = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          role: 'customer',
          email: cleanEmail,
          password: cleanPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok || data?.session?.role !== 'customer') {
        showToast(data?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
      }

      const session = data.session;
      const existing = customers.find(
        (c) => c.id === session.entityId || c.email.toLowerCase() === cleanEmail
      );
      const custRecord: CustomerUser = existing || {
        id: session.entityId,
        name: session.name,
        email: session.email,
        phone: session.phone || '',
        area: 'التجمع الخامس',
        address: 'القاهرة',
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setIsAdminAuthenticated(false);
      setIsVendorAuthenticated(false);
      setIsDriverAuthenticated(false);
      setCurrentCustomer(custRecord);
      showToast(`مرحباً بعودتك، ${custRecord.name}!`, 'success');
      return true;
    } catch {
      showToast('خطأ في الاتصال بخادم المصادقة', 'error');
      return false;
    }
  };

  const registerCustomer = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    area: string;
    address: string;
  }): Promise<CustomerUser | null> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password.trim();
    if (!cleanEmail || !cleanPass || !data.name.trim() || !data.phone.trim()) {
      showToast('يرجى استكمال كافة البيانات المطلوبة', 'error');
      return null;
    }

    const newId = `cust-${Date.now().toString().slice(-4)}`;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'register',
          role: 'customer',
          entityId: newId,
          name: data.name.trim(),
          email: cleanEmail,
          phone: data.phone.trim(),
          password: cleanPass,
        }),
      });
      const respData = await res.json().catch(() => ({}));
      if (!res.ok || !respData?.ok) {
        showToast(respData?.error || 'تعذر إنشاء الحساب', 'error');
        return null;
      }

      const newCust: CustomerUser = {
        id: respData.session?.entityId || newId,
        name: data.name.trim(),
        email: cleanEmail,
        phone: data.phone.trim(),
        area: data.area,
        address: data.address,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCustomers((prev) => [...prev, newCust]);
      setCurrentCustomer(newCust);
      showToast(`تم إنشاء حسابك بنجاح! مرحباً بك ${newCust.name}`, 'success');
      return newCust;
    } catch {
      showToast('خطأ في الاتصال بالخادم أثناء إنشاء الحساب', 'error');
      return null;
    }
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    showToast('تم تسجيل الخروج من حساب العميل', 'info');
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    if (!cleanEmail || !cleanPass) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          role: 'admin',
          email: cleanEmail,
          password: cleanPass,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok || data?.session?.role !== 'admin') {
        setIsAdminAuthenticated(false);
        showToast(data?.error || 'بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.', 'error');
        return false;
      }

      setIsVendorAuthenticated(false);
      setIsDriverAuthenticated(false);
      setCurrentCustomer(null);
      setIsAdminAuthenticated(true);
      showToast('مرحباً بك في لوحة الإدارة العليا والخزنة المالية', 'success');
      return true;
    } catch {
      setIsAdminAuthenticated(false);
      showToast('تعذر الاتصال بخادم التحقق الأمني', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    showToast('تم تسجيل الخروج من لوحة الإدارة العليا', 'info');
  };

  const loginVendor = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    if (!cleanEmail || !cleanPass) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور للمتجر', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          role: 'vendor',
          email: cleanEmail,
          password: cleanPass,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok || data?.session?.role !== 'vendor') {
        setIsVendorAuthenticated(false);
        showToast(data?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
      }

      const entityId = data.session.entityId;
      const matched = vendors.find((v) => v.id === entityId || v.email.toLowerCase() === cleanEmail);
      if (matched && matched.status === 'pending') {
        showToast('حساب المتجر لا يزال قيد المراجعة من الإدارة العليا', 'error');
        return false;
      }

      setIsAdminAuthenticated(false);
      setIsDriverAuthenticated(false);
      setCurrentCustomer(null);
      setActiveVendorIdState(entityId);
      setIsVendorAuthenticated(true);
      showToast(`تم تسجيل الدخول إلى بوابة متجر: ${matched?.name || data.session.name}`, 'success');
      return true;
    } catch {
      setIsVendorAuthenticated(false);
      showToast('تعذر الاتصال بخادم التحقق الأمني', 'error');
      return false;
    }
  };

  const logoutVendor = () => {
    setIsVendorAuthenticated(false);
    setActiveVendorIdState('');
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    showToast('تم تسجيل الخروج من بوابة المتجر', 'info');
  };

  const loginDriver = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    if (!cleanEmail || !cleanPass) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور للكابتن', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          role: 'driver',
          email: cleanEmail,
          password: cleanPass,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok || data?.session?.role !== 'driver') {
        setIsDriverAuthenticated(false);
        showToast(data?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
      }

      const entityId = data.session.entityId;
      const matched = drivers.find((d) => d.id === entityId || d.email.toLowerCase() === cleanEmail);
      if (matched && matched.status === 'pending') {
        showToast('حساب الكابتن لا يزال قيد فحص الأوراق من الإدارة', 'error');
        return false;
      }

      setIsAdminAuthenticated(false);
      setIsVendorAuthenticated(false);
      setCurrentCustomer(null);
      setActiveDriverIdState(entityId);
      setIsDriverAuthenticated(true);
      showToast(`أهلاً بك يا ${matched?.name || data.session.name}!`, 'success');
      return true;
    } catch {
      setIsDriverAuthenticated(false);
      showToast('تعذر الاتصال بخادم التحقق الأمني', 'error');
      return false;
    }
  };

  const logoutDriver = () => {
    setIsDriverAuthenticated(false);
    setActiveDriverIdState('');
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    showToast('تم تسجيل الخروج من تطبيق الكابتن', 'info');
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Distance to delivery fee calculator
  const calculateDeliveryFee = (distanceKm: number): number => {
    const extraKm = Math.max(0, distanceKm - pricingConfig.baseKm);
    return Math.round(pricingConfig.baseFare + extraKm * pricingConfig.extraKmRate);
  };

  // Cart operations
  const addToCart = (product: Product, size: string) => {
    const hasOtherVendor = cart.some((c) => c.product.vendorId !== product.vendorId);
    if (hasOtherVendor) {
      if (
        !window.confirm(
          'سلة المشتريات تحتوي على قطع من براند آخر. نظراً لأن التوصيل مباشر وفوري من نفس المحل، هل تود إفراغ السلة وبدء طلب من ' +
            product.vendorName +
            '؟'
        )
      ) {
        return;
      }
      setCart([{ product, size, quantity: 1 }]);
      setIsCartOpen(true);
      showToast(`تمت إضافة ${product.name} إلى السلة`, 'success');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
    showToast(`تمت إضافة ${product.name} إلى السلة`, 'success');
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateCartQuantity = (productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Place customer order
  const placeOrder = (customerInfo: {
    customerId?: string;
    name: string;
    phone: string;
    area: string;
    address: string;
    coordinates?: { lat: number; lng: number };
    paymentMethod: CustomerPaymentMethod;
    notes?: string;
  }): Order | null => {
    if (cart.length === 0) return null;

    if (!currentCustomer) {
      showToast('يرجى تسجيل الدخول بحساب العميل أولاً لإتمام الطلب', 'error');
      return null;
    }

    const vendorId = cart[0].product.vendorId;
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return null;

    if (vendor.status === 'frozen') {
      showToast(
        `عذراً، متجر ${vendor.name} مجمد حالياً لتجاوز سقف المديونية، لا يمكن تقديم طلبات جديدة منه حالياً.`,
        'error'
      );
      return null;
    }

    const clothesTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    let estimatedDistance = 11.5;
    if (customerInfo.coordinates && vendor.coordinates) {
      const realKm = calculateGeoDistanceKm(
        vendor.coordinates.lat,
        vendor.coordinates.lng,
        customerInfo.coordinates.lat,
        customerInfo.coordinates.lng
      );
      estimatedDistance = Math.max(1.5, Math.round(realKm * 1.25 * 10) / 10);
    } else if (customerInfo.area === vendor.area) {
      estimatedDistance = 4.2;
    } else if (
      (customerInfo.area.includes('التجمع') && vendor.area.includes('المعادي')) ||
      (customerInfo.area.includes('المعادي') && vendor.area.includes('التجمع'))
    ) {
      estimatedDistance = 16.0;
    } else if (
      (customerInfo.area.includes('زايد') && vendor.area.includes('مصر الجديدة')) ||
      (customerInfo.area.includes('مصر الجديدة') && vendor.area.includes('زايد'))
    ) {
      estimatedDistance = 34.0;
    } else {
      estimatedDistance = 13.5;
    }

    const deliveryFee = calculateDeliveryFee(estimatedDistance);
    const vendorCommission = (clothesTotal * vendor.commissionRate) / 100;
    const driverCommission = (deliveryFee * pricingConfig.driverCommissionRate) / 100;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `VF-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: currentCustomer.id,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerArea: customerInfo.area,
      customerAddress: customerInfo.address,
      customerCoordinates: customerInfo.coordinates,
      paymentMethod: customerInfo.paymentMethod,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorArea: vendor.area,
      vendorCoordinates: vendor.coordinates,
      items: [...cart],
      clothesTotal,
      distanceKm: estimatedDistance,
      deliveryFee,
      totalAmount: clothesTotal + deliveryFee,
      vendorCommission,
      driverCommission,
      status: 'pending_vendor',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: customerInfo.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    showToast(
      `تم إرسال طلبك رقم ${newOrder.orderNumber} بنجاح إلى متجر ${vendor.name}! في انتظار تأكيد توفر القطعة بالمخزن.`,
      'success'
    );
    return newOrder;
  };

  // Vendor confirms stock is available and prepares order -> becomes visible in Driver radar
  const vendorConfirmStockAndPrepare = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    if (target.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: هذا الطلب يخص متجراً آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'confirm-stock', target.vendorId);
    if (!allowed) return;

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'ready_for_driver' } : ord))
    );
    showToast('✓ القطعة متوفرة وتم التجهيز! الأوردر الآن متاح في رادار الطيارين للاستلام الفوري.', 'success');
  };

  // Vendor rejects order because size is out of stock -> cancelled_by_vendor
  const vendorCancelOutOfStock = async (orderId: string, reason?: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    if (target.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: هذا الطلب يخص متجراً آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'cancel-out-of-stock', target.vendorId);
    if (!allowed) return;

    const cancelReason = reason || 'المقاس غير متوفر بالمخزن - اعتذار وإلغاء الطلب';
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'cancelled_by_vendor', vendorRejectedReason: cancelReason }
          : ord
      )
    );
    showToast('تم إلغاء الطلب والاعتذار للعميل لعدم توفر المقاس بالمخزن.', 'error');
  };

  const vendorPrepareOrder = (orderId: string) => {
    vendorConfirmStockAndPrepare(orderId);
  };

  // Driver accepts order
  const driverAcceptOrder = async (orderId: string, driverId: string) => {
    if (driverId !== activeDriverId && !isAdminAuthenticated) {
      showToast('غير مصرح: لا يمكنك قبول طلب باسم كابتن آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('driver', 'accept-order', driverId);
    if (!allowed) return;

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    if (driver.status === 'frozen') {
      showToast(
        'حسابك مجمد حالياً لتجاوز سقف المديونية. يجب سداد المستحقات لإعادة التفعيل واستقبال الطلبات.',
        'error'
      );
      return;
    }

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              driverId: driver.id,
              driverName: driver.name,
              driverPhone: driver.phone,
              driverAvatar: driver.avatarPhoto,
              driverVehicle: driver.vehicle,
              driverVehicleNumber: driver.vehicleNumber,
              driverVehiclePhoto: driver.vehiclePhoto,
              status: 'driver_assigned',
            }
          : ord
      )
    );
    showToast(
      `تم قبول الطلب. توجه الآن إلى المحل (${orders.find((o) => o.id === orderId)?.vendorName}) لدفع الكاش واستلام الملابس`,
      'info'
    );
  };

  // Driver pays store 100% cash & confirms pickup
  const driverConfirmStorePickup = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.driverId && targetOrder.driverId !== activeDriverId && !isAdminAuthenticated) {
      showToast('غير مصرح: هذا الطلب مسند لكابتن آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation(
      'driver',
      'confirm-pickup',
      targetOrder.driverId || activeDriverId
    );
    if (!allowed) return;

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'picked_up_paid_store' } : ord))
    );

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === targetOrder.vendorId) {
          const newDebt = v.currentDebt + targetOrder.vendorCommission;
          const newSales = v.totalSales + targetOrder.clothesTotal;
          const isFrozen = newDebt >= v.debtLimit;
          return {
            ...v,
            currentDebt: newDebt,
            totalSales: newSales,
            status: isFrozen ? 'frozen' : v.status,
          };
        }
        return v;
      })
    );

    showToast(
      `تم تأكيد دفع ${targetOrder.clothesTotal} ج.م كاش للمحل واستلام الملابس! انطلق نحو العميل.`,
      'success'
    );
  };

  // Driver collects from customer & completes delivery
  const driverCompleteDelivery = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.driverId && targetOrder.driverId !== activeDriverId && !isAdminAuthenticated) {
      showToast('غير مصرح: هذا الطلب مسند لكابتن آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation(
      'driver',
      'complete-delivery',
      targetOrder.driverId || activeDriverId
    );
    if (!allowed) return;

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'delivered' } : ord))
    );

    if (targetOrder.driverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === targetOrder.driverId) {
            const newDebt = d.currentDebt + targetOrder.driverCommission;
            const newTrips = d.totalTrips + 1;
            const netTripProfit = targetOrder.deliveryFee - targetOrder.driverCommission;
            const newEarnings = d.totalDeliveryEarnings + netTripProfit;
            const isFrozen = newDebt >= d.debtLimit;
            return {
              ...d,
              currentDebt: newDebt,
              totalTrips: newTrips,
              totalDeliveryEarnings: newEarnings,
              status: isFrozen ? 'frozen' : d.status,
            };
          }
          return d;
        })
      );
    }

    showToast(
      `تم تحصيل ${targetOrder.totalAmount} ج.م كاش من العميل بنجاح وتم إنهاء المشوار!`,
      'success'
    );
  };

  // Customer submits rating & review for Vendor (Store) and Driver after receiving order
  const submitOrderRating = (
    orderId: string,
    ratingData: {
      vendorRating: number;
      vendorReview?: string;
      driverRating?: number;
      driverReview?: string;
    }
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const cleanVendorRating = Math.min(5, Math.max(1, Math.round(ratingData.vendorRating || 5)));
    const cleanDriverRating = ratingData.driverRating
      ? Math.min(5, Math.max(1, Math.round(ratingData.driverRating)))
      : 5;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const wasNotDeliveredYet = targetOrder.status === 'picked_up_paid_store';

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'delivered',
              vendorRating: cleanVendorRating,
              vendorReview: ratingData.vendorReview?.trim() || undefined,
              driverRating: cleanDriverRating,
              driverReview: ratingData.driverReview?.trim() || undefined,
              ratedAt: nowStr,
            }
          : ord
      )
    );

    if (wasNotDeliveredYet && targetOrder.driverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === targetOrder.driverId) {
            const newDebt = d.currentDebt + targetOrder.driverCommission;
            const newTrips = d.totalTrips + 1;
            const netTripProfit = targetOrder.deliveryFee - targetOrder.driverCommission;
            const newEarnings = d.totalDeliveryEarnings + netTripProfit;
            const isFrozen = newDebt >= d.debtLimit;
            return {
              ...d,
              currentDebt: newDebt,
              totalTrips: newTrips,
              totalDeliveryEarnings: newEarnings,
              status: isFrozen ? 'frozen' : d.status,
            };
          }
          return d;
        })
      );
    }

    showToast(
      `شكراً لك! تم حفظ تقييمك للمحل (${cleanVendorRating}/5 ⭐) وللكابتن (${cleanDriverRating}/5 ⭐) وظهوره في لوحة التحكم.`,
      'success'
    );
  };

  // Driver Instant Return (مرتجع فوري نفس اليوم) -> status becomes returning_to_vendor
  const driverTriggerInstantReturn = async (orderId: string, reason: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.driverId && targetOrder.driverId !== activeDriverId && !isAdminAuthenticated) {
      showToast('غير مصرح: هذا الطلب مسند لكابتن آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation(
      'driver',
      'instant-return',
      targetOrder.driverId || activeDriverId
    );
    if (!allowed) return;

    const returnCode = `RET-${Math.floor(1000 + Math.random() * 9000)}`;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'returning_to_vendor',
              returnReason: reason,
              returnCode,
            }
          : ord
      )
    );

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === targetOrder.vendorId) {
          const reversedDebt = Math.max(0, v.currentDebt - targetOrder.vendorCommission);
          const reversedSales = Math.max(0, v.totalSales - targetOrder.clothesTotal);
          const isStillFrozen = reversedDebt >= v.debtLimit;
          return {
            ...v,
            currentDebt: reversedDebt,
            totalSales: reversedSales,
            status: isStillFrozen ? v.status : 'active',
          };
        }
        return v;
      })
    );

    showToast(
      `تم تسجيل المرتجع فوراً وإلغاء عمولة المنصة عن المتجر. توجه للمحل بكود التأكيد [${returnCode}] لاسترداد الـ ${targetOrder.clothesTotal.toLocaleString('ar-EG')} ج.م كاش.`,
      'info'
    );
  };

  // Vendor confirms receipt of returned item and refunds cash to driver
  const vendorConfirmReturnReceived = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: هذا الطلب يخص متجراً آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'confirm-return', targetOrder.vendorId);
    if (!allowed) return;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'returned_completed',
              returnReceivedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : ord
      )
    );

    showToast(
      `✓ تم استلام القطعة المرتجعة وإعادة ${targetOrder.clothesTotal.toLocaleString('ar-EG')} ج.م كاش للطيار بنجاح.`,
      'success'
    );
  };

  // Update account password via server-side scrypt hashing (Super Admin or Owner only)
  const updateUserPassword = async (
    type: 'vendor' | 'driver' | 'customer',
    id: string,
    newPass: string
  ): Promise<boolean> => {
    const trimmed = newPass.trim();
    if (!trimmed || trimmed.length < 6) {
      showToast('كلمة المرور الجديدة يجب أن تتكون من 6 أحرف على الأقل', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update-password',
          targetRole: type,
          targetEntityId: id,
          newPassword: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        showToast(data?.error || 'غير مصرح لك بتغيير كلمة المرور', 'error');
        return false;
      }
      showToast('تم تشفير وتحديث كلمة المرور للحساب بنجاح', 'success');
      return true;
    } catch {
      showToast('تعذر تحديث كلمة المرور على الخادم', 'error');
      return false;
    }
  };

  // Submit settlement request (from Vendor or Driver — ownership verified)
  const submitSettlement = async ({
    entityType,
    entityId,
    amount,
    method,
    transactionRef,
    notes,
    customReceiptImage,
  }: {
    entityType: 'vendor' | 'driver';
    entityId: string;
    amount: number;
    method: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'cash_office';
    transactionRef: string;
    notes?: string;
    customReceiptImage?: string;
  }) => {
    const allowed = await authorizeServerMutation(entityType, 'submit-settlement', entityId);
    if (!allowed) return;

    let entityName = '';
    let entityArea = '';
    if (entityType === 'vendor') {
      const v = vendors.find((vend) => vend.id === entityId);
      entityName = v?.name || 'محل أزياء';
      entityArea = v?.area || '';
    } else {
      const d = drivers.find((drv) => drv.id === entityId);
      entityName = d?.name || 'كابتن توصيل';
      entityArea = d?.area || '';
    }

    const receiptImg =
      customReceiptImage ||
      generateReceiptSvg(
        entityName,
        amount,
        transactionRef,
        method,
        new Date().toISOString().replace('T', ' ').slice(0, 16)
      );

    const newSettlement: SettlementRequest = {
      id: `set-${Date.now().toString().slice(-4)}`,
      entityType,
      entityId,
      entityName,
      entityArea,
      amount,
      method,
      transactionRef,
      receiptImageUrl: receiptImg,
      receiptNotes: notes,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    if (entityType === 'vendor') {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === entityId
            ? {
                ...v,
                status: 'frozen',
                hasPendingSettlement: true,
                pendingSettlementAmount: amount,
                pendingSettlementRef: transactionRef,
              }
            : v
        )
      );
    } else {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === entityId
            ? {
                ...d,
                status: 'frozen',
                isOnline: false,
                hasPendingSettlement: true,
                pendingSettlementAmount: amount,
                pendingSettlementRef: transactionRef,
              }
            : d
        )
      );
    }

    showToast(
      'تم إرسال إيصال التحويل إلى خزنة الإدارة. يظل الحساب معلقاً قيد المراجعة حتى تأكيد واعتماد الإيصال من الإدارة.',
      'info'
    );
  };

  // Super Admin: Approve Settlement & Reset Debt & Unfreeze
  const approveSettlement = async (settlementId: string, adminNotes?: string) => {
    const allowed = await authorizeServerMutation('admin', 'approve-settlement');
    if (!allowed) return;

    const target = settlements.find((s) => s.id === settlementId);
    if (!target) return;

    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlementId
          ? {
              ...s,
              status: 'approved',
              resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              adminNotes: adminNotes || 'تمت مطابقة المعاملة البنكية واعتماد السداد وتصفير المديونية',
            }
          : s
      )
    );

    if (target.entityType === 'vendor') {
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === target.entityId) {
            const updatedDebt = Math.max(0, v.currentDebt - target.amount);
            const shouldUnfreeze = updatedDebt < v.debtLimit;
            return {
              ...v,
              currentDebt: updatedDebt,
              hasPendingSettlement: false,
              pendingSettlementAmount: undefined,
              pendingSettlementRef: undefined,
              status: shouldUnfreeze ? 'active' : 'frozen',
            };
          }
          return v;
        })
      );
    } else {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === target.entityId) {
            const updatedDebt = Math.max(0, d.currentDebt - target.amount);
            const shouldUnfreeze = updatedDebt < d.debtLimit;
            return {
              ...d,
              currentDebt: updatedDebt,
              hasPendingSettlement: false,
              pendingSettlementAmount: undefined,
              pendingSettlementRef: undefined,
              status: shouldUnfreeze ? 'active' : 'frozen',
            };
          }
          return d;
        })
      );
    }

    showToast(
      `تم تأكيد الاستلام بنجاح، وخصم ${target.amount.toLocaleString('ar-EG')} ج.م من مديونية ${target.entityName} وفتح الحساب.`,
      'success'
    );
  };

  // Super Admin: Reject Settlement with Reason
  const rejectSettlement = async (settlementId: string, reason: string) => {
    const allowed = await authorizeServerMutation('admin', 'reject-settlement');
    if (!allowed) return;

    const target = settlements.find((s) => s.id === settlementId);
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlementId
          ? {
              ...s,
              status: 'rejected',
              rejectionReason: reason,
              resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : s
      )
    );

    if (target) {
      if (target.entityType === 'vendor') {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === target.entityId
              ? {
                   ...v,
                  status: 'frozen',
                  hasPendingSettlement: false,
                  pendingSettlementAmount: undefined,
                  pendingSettlementRef: undefined,
                }
              : v
          )
        );
      } else {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === target.entityId
              ? {
                  ...d,
                  status: 'frozen',
                  isOnline: false,
                  hasPendingSettlement: false,
                  pendingSettlementAmount: undefined,
                  pendingSettlementRef: undefined,
                }
              : d
          )
        );
      }
    }

    showToast(`تم رفض طلب التسوية مع إخطار الطرف بالسبب: "${reason}"`, 'error');
  };

  // Super Admin: Manual Cash Office Settlement
  const recordManualCashSettlement = async (
    entityType: 'vendor' | 'driver',
    entityId: string,
    amount: number,
    adminNotes?: string
  ) => {
    const allowed = await authorizeServerMutation('admin', 'manual-cash-settlement');
    if (!allowed) return;

    let entityName = '';
    if (entityType === 'vendor') {
      const v = vendors.find((vend) => vend.id === entityId);
      entityName = v?.name || 'محل';
      setVendors((prev) =>
        prev.map((vend) => {
          if (vend.id === entityId) {
            const updatedDebt = Math.max(0, vend.currentDebt - amount);
            return {
              ...vend,
              currentDebt: updatedDebt,
              status: updatedDebt < vend.debtLimit && vend.status === 'frozen' ? 'active' : vend.status,
            };
          }
          return vend;
        })
      );
    } else {
      const d = drivers.find((drv) => drv.id === entityId);
      entityName = d?.name || 'طيار';
      setDrivers((prev) =>
        prev.map((drv) => {
          if (drv.id === entityId) {
            const updatedDebt = Math.max(0, drv.currentDebt - amount);
            return {
              ...drv,
              currentDebt: updatedDebt,
              status: updatedDebt < drv.debtLimit && drv.status === 'frozen' ? 'active' : drv.status,
            };
          }
          return drv;
        })
      );
    }

    const ref = `CASH-${Date.now().toString().slice(-6)}`;
    const newSettlement: SettlementRequest = {
      id: `set-cash-${Date.now().toString().slice(-4)}`,
      entityType,
      entityId,
      entityName,
      amount,
      method: 'cash_office',
      transactionRef: ref,
      receiptImageUrl: generateReceiptSvg(
        entityName,
        amount,
        ref,
        'cash_office',
        new Date().toISOString().replace('T', ' ').slice(0, 16)
      ),
      status: 'approved',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      adminNotes: adminNotes || 'تم توريد كاش يدوياً في خزنة الإدارة',
    };

    setSettlements((prev) => [newSettlement, ...prev]);
    showToast(
      `تم تسجيل توريد كاش يدوي بقيمة ${amount.toLocaleString('ar-EG')} ج.م وتصفير جزء من مديونية ${entityName}`,
      'success'
    );
  };

  // Pricing settings update
  const updatePricingConfig = async (newConfig: Partial<PricingConfig>) => {
    const allowed = await authorizeServerMutation('admin', 'update-pricing-config');
    if (!allowed) return;
    setPricingConfig((prev) => ({ ...prev, ...newConfig }));
    showToast('تم حفظ إعدادات التسعير والخزنة وتطبيقها لحظياً على المنصة', 'success');
  };

  // Vendor administration
  const updateVendorCommissionAndLimit = async (
    vendorId: string,
    commissionRate: number,
    debtLimit: number
  ) => {
    const allowed = await authorizeServerMutation('admin', 'update-vendor-limit');
    if (!allowed) return;
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const isFrozen = v.currentDebt >= debtLimit;
          return {
            ...v,
            commissionRate,
            debtLimit,
            status: isFrozen ? 'frozen' : v.status === 'frozen' ? 'active' : v.status,
          };
        }
        return v;
      })
    );
    showToast('تم تحديث نسبة العمولة والحد الائتماني للمحل بنجاح', 'success');
  };

  const toggleVendorStatus = async (vendorId: string) => {
    const allowed = await authorizeServerMutation('admin', 'toggle-vendor-status');
    if (!allowed) return;
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const nextStatus = v.status === 'active' ? 'suspended' : 'active';
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
    showToast('تم تغيير حالة تشغيل المحل', 'info');
  };

  const approvePendingVendor = async (
    vendorId: string,
    commissionRate: number,
    debtLimit: number
  ) => {
    const allowed = await authorizeServerMutation('admin', 'approve-pending-vendor');
    if (!allowed) return;
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              commissionRate,
              debtLimit,
              status: 'active',
            }
          : v
      )
    );
    showToast('تمت الموافقة على انضمام البراند وتفعيله على التطبيق فوراً', 'success');
  };

  const rejectPendingVendor = async (vendorId: string) => {
    const allowed = await authorizeServerMutation('admin', 'reject-pending-vendor');
    if (!allowed) return;
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast('تم رفض طلب انضمام المحل', 'info');
  };

  const addVendorManual = async (
    vendorData: Omit<Vendor, 'id' | 'currentDebt' | 'totalSales' | 'createdAt'> & {
      password?: string;
    }
  ) => {
    const allowed = await authorizeServerMutation('admin', 'add-vendor-manual');
    if (!allowed) return;

    const newId = `v-${Date.now().toString().slice(-4)}`;
    const cleanEmail = (vendorData.email || `${vendorData.slug}@dripfit.eg`).trim().toLowerCase();
    const initialPass = (vendorData.password || 'Brand#2026!').trim();

    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'register',
        role: 'vendor',
        entityId: newId,
        name: vendorData.name,
        email: cleanEmail,
        phone: vendorData.phone,
        password: initialPass,
        status: 'active',
      }),
    }).catch(() => {});

    const { password: _omitted, ...cleanVendorData } = vendorData;
    const newV: Vendor = {
      ...cleanVendorData,
      email: cleanEmail,
      id: newId,
      currentDebt: 0,
      totalSales: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setVendors((prev) => [...prev, newV]);
    showToast(`تمت إضافة براند ${newV.name} بنجاح`, 'success');
  };

  // Driver administration
  const updateDriverLimit = async (driverId: string, debtLimit: number) => {
    const allowed = await authorizeServerMutation('admin', 'update-driver-limit');
    if (!allowed) return;
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, debtLimit } : d))
    );
    showToast('تم تحديث سقف مديونية الطيار', 'success');
  };

  const toggleDriverStatus = async (driverId: string) => {
    const allowed = await authorizeServerMutation('admin', 'toggle-driver-status');
    if (!allowed) return;
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const nextStatus = d.status === 'active' ? 'suspended' : 'active';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
    showToast('تم تعديل حالة تشغيل الطيار', 'info');
  };

  const toggleDriverOnline = async (driverId: string) => {
    if (driverId !== activeDriverId && !isAdminAuthenticated) {
      showToast('غير مصرح: لا يمكنك تغيير حالة اتصال كابتن آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('driver', 'toggle-online', driverId);
    if (!allowed) return;
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isOnline: !d.isOnline } : d))
    );
  };

  const approvePendingDriver = async (driverId: string, debtLimit: number) => {
    const allowed = await authorizeServerMutation('admin', 'approve-pending-driver');
    if (!allowed) return;
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              debtLimit,
              status: 'active',
              isOnline: true,
            }
          : d
      )
    );
    showToast('تم اعتماد أوراق الطيار وإضافته إلى الأسطول النشط بنجاح', 'success');
  };

  const rejectPendingDriver = async (driverId: string) => {
    const allowed = await authorizeServerMutation('admin', 'reject-pending-driver');
    if (!allowed) return;
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    showToast('تم رفض طلب تسجيل الطيار', 'info');
  };

  const updateDriverCoordinates = (driverId: string, coordinates: { lat: number; lng: number }) => {
    if (driverId !== activeDriverId && !isAdminAuthenticated) return;
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, coordinates } : d))
    );
  };

  // Product management (Vendor ownership enforced)
  const addProduct = async (pData: Omit<Product, 'id' | 'vendorName'>) => {
    if (pData.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: لا يمكنك إضافة منتجات لمتجر آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'add-product', pData.vendorId);
    if (!allowed) return;

    const vendor = vendors.find((v) => v.id === pData.vendorId);
    const newProduct: Product = {
      ...pData,
      id: `p-${Date.now().toString().slice(-4)}`,
      vendorName: vendor?.name || 'محل أزياء',
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`تم نشر قطعة ${newProduct.name} في الكتالوج بنجاح`, 'success');
  };

  const updateProduct = async (productId: string, updated: Partial<Product>) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    if (target.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: لا يمكنك تعديل منتجات متجر آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'update-product', target.vendorId);
    if (!allowed) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updated } : p))
    );
    showToast('تم حفظ تعديلات المنتج وتحديث الكتالوج بنجاح', 'success');
  };

  const deleteProduct = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    if (target.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: لا يمكنك حذف منتجات متجر آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'delete-product', target.vendorId);
    if (!allowed) return;

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('تم حذف القطعة من الكتالوج نهائياً', 'info');
  };

  const toggleProductStock = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    if (target.vendorId !== activeVendorId && !isAdminAuthenticated) {
      showToast('غير مصرح: لا يمكنك تعديل مخزون متجر آخر', 'error');
      return;
    }
    const allowed = await authorizeServerMutation('vendor', 'toggle-stock', target.vendorId);
    if (!allowed) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Onboarding submissions
  const registerVendorApplication = async ({
    name,
    email,
    phone,
    password,
    area,
    address,
    category,
    logoUrl,
    instagram,
  }: {
    name: string;
    email: string;
    phone: string;
    password: string;
    area: string;
    address: string;
    category: string;
    logoUrl?: string;
    instagram?: string;
  }): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const newId = `v-pending-${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'register',
          role: 'vendor',
          entityId: newId,
          name,
          email: cleanEmail,
          phone,
          password: cleanPass,
          status: 'pending',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        showToast(data?.error || 'تعذر تسجيل طلب المتجر', 'error');
        return false;
      }

      const newVendor: Vendor = {
        id: newId,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        email: cleanEmail,
        phone,
        area,
        address,
        category,
        logo:
          logoUrl ||
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
        commissionRate: pricingConfig.defaultVendorCommissionRate,
        debtLimit: pricingConfig.defaultVendorLimit,
        currentDebt: 0,
        totalSales: 0,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        instagramHandle: instagram,
      };
      setVendors((prev) => [...prev, newVendor]);
      showToast(
        'تم إرسال طلب انضمام المتجر بنجاح! سيقوم فريق الإدارة بمراجعة الطلب وتحديد النسبة والحد الائتماني.',
        'success'
      );
      return true;
    } catch {
      showToast('تعذر الاتصال بالخادم لتسجيل الطلب', 'error');
      return false;
    }
  };

  const registerDriverApplication = async ({
    name,
    email,
    phone,
    password,
    vehicle,
    vehicleNumber,
    area,
    nationalId,
    avatarPhoto,
    vehiclePhoto,
    nationalIdPhoto,
    licensePhoto,
  }: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicle: string;
    vehicleNumber: string;
    area: string;
    nationalId: string;
    avatarPhoto?: string;
    vehiclePhoto?: string;
    nationalIdPhoto?: string;
    licensePhoto?: string;
  }): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const newId = `d-pending-${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'register',
          role: 'driver',
          entityId: newId,
          name,
          email: cleanEmail,
          phone,
          password: cleanPass,
          status: 'pending',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        showToast(data?.error || 'تعذر تسجيل طلب الكابتن', 'error');
        return false;
      }

      const newDriver: Driver = {
        id: newId,
        name,
        email: cleanEmail,
        phone,
        vehicle,
        vehicleNumber,
        area,
        avatarPhoto:
          avatarPhoto ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        vehiclePhoto:
          vehiclePhoto ||
          'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80',
        debtLimit: pricingConfig.defaultDriverLimit,
        currentDebt: 0,
        totalTrips: 0,
        totalDeliveryEarnings: 0,
        status: 'pending',
        isOnline: false,
        nationalId,
        nationalIdPhoto: nationalIdPhoto || generateIdDocSvg('بطاقة رقم قومي', name, nationalId),
        licensePhoto:
          licensePhoto ||
          generateIdDocSvg(
            'رخصة قيادة دراجة نارية',
            name,
            `LIC-${Math.floor(100000 + Math.random() * 900000)}`
          ),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setDrivers((prev) => [...prev, newDriver]);
      showToast(
        'تم تسجيل طلبك ككابتن توصيل ورفع المستندات الرسمية بنجاح! سيتم فحص الأوراق والاعتماد خلال 24 ساعة.',
        'success'
      );
      return true;
    } catch {
      showToast('تعذر الاتصال بالخادم لتسجيل الطلب', 'error');
      return false;
    }
  };

  return (
    <PlatformContext.Provider
      value={{
        activePortal: activePortalState,
        setActivePortal,
        onboardingType: onboardingTypeState,
        setOnboardingType,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        isVendorAuthenticated,
        loginVendor,
        logoutVendor,
        isDriverAuthenticated,
        loginDriver,
        logoutDriver,
        activeVendorId,
        setActiveVendorId,
        activeDriverId,
        setActiveDriverId,
        customers,
        currentCustomer,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        setCurrentCustomer,
        vendors,
        drivers,
        products,
        orders,
        settlements,
        pricingConfig,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        calculateDeliveryFee,
        placeOrder,
        vendorPrepareOrder,
        vendorConfirmStockAndPrepare,
        vendorCancelOutOfStock,
        vendorConfirmReturnReceived,
        driverAcceptOrder,
        driverConfirmStorePickup,
        driverCompleteDelivery,
        driverTriggerInstantReturn,
        submitOrderRating,
        updateUserPassword,
        submitSettlement,
        approveSettlement,
        rejectSettlement,
        recordManualCashSettlement,
        updatePricingConfig,
        updateVendorCommissionAndLimit,
        toggleVendorStatus,
        approvePendingVendor,
        rejectPendingVendor,
        addVendorManual,
        updateDriverLimit,
        toggleDriverStatus,
        toggleDriverOnline,
        approvePendingDriver,
        rejectPendingDriver,
        updateDriverCoordinates,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        registerVendorApplication,
        registerDriverApplication,
        previewImage,
        setPreviewImage,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
