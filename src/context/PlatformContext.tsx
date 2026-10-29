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

  // Customer Authentication & Management
  customers: CustomerUser[];
  currentCustomer: CustomerUser | null;
  loginCustomer: (phone: string, name?: string) => boolean;
  registerCustomer: (data: { name: string; phone: string; area: string; address: string }) => CustomerUser;
  logoutCustomer: () => void;
  setCurrentCustomer: (customer: CustomerUser | null) => void;

  // Selected Entities
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
  updateUserPassword: (type: 'vendor' | 'driver' | 'customer', id: string, newPass: string) => void;
  quickImpersonate: (type: 'vendor' | 'driver' | 'customer', id: string) => void;

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
  addVendorManual: (vendor: Omit<Vendor, 'id' | 'currentDebt' | 'totalSales' | 'createdAt'>) => void;

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
    phone: string;
    password?: string;
    area: string;
    address: string;
    category: string;
    logoUrl?: string;
    instagram?: string;
  }) => void;
  registerDriverApplication: (data: {
    name: string;
    phone: string;
    password?: string;
    vehicle: string;
    vehicleNumber: string;
    area: string;
    nationalId: string;
    avatarPhoto?: string;
    vehiclePhoto?: string;
    nationalIdPhoto?: string;
    licensePhoto?: string;
  }) => void;

  // Modal Image Preview
  previewImage: { url: string; title: string; subtitle?: string } | null;
  setPreviewImage: (data: { url: string; title: string; subtitle?: string } | null) => void;

  // Notification Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePortal, setActivePortal] = useState<UserPortal>('admin');
  const [onboardingType, setOnboardingType] = useState<OnboardingType>('vendor');

  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(initialPricingConfig);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [settlements, setSettlements] = useState<SettlementRequest[]>(initialSettlements);

  // Customer Management
  const [customers, setCustomers] = useState<CustomerUser[]>(initialCustomers);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(initialCustomers[0]);

  const loginCustomer = (phone: string, name?: string): boolean => {
    const existing = customers.find((c) => c.phone.trim() === phone.trim());
    if (existing) {
      setCurrentCustomer(existing);
      showToast(`مرحباً بعودتك، ${existing.name}!`, 'success');
      return true;
    }
    if (name) {
      const newCust: CustomerUser = {
        id: `cust-${Date.now().toString().slice(-4)}`,
        name,
        phone,
        area: 'التجمع الخامس',
        address: 'القاهرة',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCustomers((prev) => [...prev, newCust]);
      setCurrentCustomer(newCust);
      showToast(`أهلاً بك في VOGUE FAST، ${newCust.name}! تم إنشاء حسابك بنجاح.`, 'success');
      return true;
    }
    return false;
  };

  const registerCustomer = (data: { name: string; phone: string; area: string; address: string }): CustomerUser => {
    const newCust: CustomerUser = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: data.name,
      phone: data.phone,
      area: data.area,
      address: data.address,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [...prev, newCust]);
    setCurrentCustomer(newCust);
    showToast(`تم إنشاء حسابك بنجاح! مرحباً بك ${newCust.name}`, 'success');
    return newCust;
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    showToast('تم تسجيل الخروج من حساب العميل', 'info');
  };

  const [activeVendorId, setActiveVendorId] = useState<string>('v-1');
  const [activeDriverId, setActiveDriverId] = useState<string>('d-1');

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
    // If cart has items from another vendor, warn or replace
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

    // Precise distance calculation: using real GPS/map coordinates if available, otherwise area heuristic
    let estimatedDistance = 11.5;
    if (customerInfo.coordinates && vendor.coordinates) {
      const realKm = calculateGeoDistanceKm(
        vendor.coordinates.lat,
        vendor.coordinates.lng,
        customerInfo.coordinates.lat,
        customerInfo.coordinates.lng
      );
      // Delivery route driving distance is typically ~1.25x haversine direct line in urban Cairo
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
      customerId: customerInfo.customerId || currentCustomer?.id,
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
  const vendorConfirmStockAndPrepare = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'ready_for_driver' } : ord))
    );
    showToast('✓ القطعة متوفرة وتم التجهيز! الأوردر الآن متاح في رادار الطيارين للاستلام الفوري.', 'success');
  };

  // Vendor rejects order because size is out of stock -> cancelled_by_vendor
  const vendorCancelOutOfStock = (orderId: string, reason?: string) => {
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

  // Vendor marks order ready (alias for backward compatibility)
  const vendorPrepareOrder = (orderId: string) => {
    vendorConfirmStockAndPrepare(orderId);
  };

  // Driver accepts order
  const driverAcceptOrder = (orderId: string, driverId: string) => {
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
  const driverConfirmStorePickup = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // 1. Update order status
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'picked_up_paid_store' } : ord))
    );

    // 2. Add vendor commission debt & increase total sales
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
  const driverCompleteDelivery = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // 1. Update order status
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'delivered' } : ord))
    );

    // 2. Driver records delivery commission debt, trip count & earnings
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

  // Driver Instant Return (مرتجع فوري نفس اليوم) -> status becomes returning_to_vendor
  const driverTriggerInstantReturn = (orderId: string, reason: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const returnCode = `RET-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update order status to returning_to_vendor so the store sees it coming
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

    // Annul the vendor's commission debt for this order immediately since the sale failed!
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
  const vendorConfirmReturnReceived = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

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

  // Update account password (Super Admin or Profile)
  const updateUserPassword = (type: 'vendor' | 'driver' | 'customer', id: string, newPass: string) => {
    if (!newPass.trim()) return;
    const trimmed = newPass.trim();

    if (type === 'vendor') {
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, password: trimmed } : v)));
    } else if (type === 'driver') {
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, password: trimmed } : d)));
    } else if (type === 'customer') {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, password: trimmed } : c)));
      if (currentCustomer && currentCustomer.id === id) {
        setCurrentCustomer({ ...currentCustomer, password: trimmed });
      }
    }
    showToast('تم تحديث كلمة المرور للحساب بنجاح', 'success');
  };

  // Quick Impersonate (Admin switcher)
  const quickImpersonate = (type: 'vendor' | 'driver' | 'customer', id: string) => {
    if (type === 'vendor') {
      const v = vendors.find((vend) => vend.id === id);
      if (v) {
        setActiveVendorId(v.id);
        setActivePortal('vendor');
        showToast(`تم تسجيل الدخول السريع كمتجر: ${v.name}`, 'success');
      }
    } else if (type === 'driver') {
      const d = drivers.find((drv) => drv.id === id);
      if (d) {
        setActiveDriverId(d.id);
        setActivePortal('driver');
        showToast(`تم تسجيل الدخول السريع كطيار: ${d.name}`, 'success');
      }
    } else if (type === 'customer') {
      const c = customers.find((cust) => cust.id === id);
      if (c) {
        setCurrentCustomer(c);
        setActivePortal('customer');
        showToast(`تم تسجيل الدخول السريع كعميل: ${c.name}`, 'success');
      }
    }
  };

  // Submit settlement request (from Vendor or Driver)
  const submitSettlement = ({
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

    // Rule 1: Accounts remain locked/frozen with pending settlement banner until Admin approves
    if (entityType === 'vendor') {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === entityId
            ? {
                ...v,
                status: 'frozen', // Remains or becomes locked
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
                status: 'frozen', // Remains or becomes locked
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
  const approveSettlement = (settlementId: string, adminNotes?: string) => {
    const target = settlements.find((s) => s.id === settlementId);
    if (!target) return;

    // 1. Update settlement
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

    // 2. Reduce entity debt & unfreeze if below limit & clear pending flags
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
  const rejectSettlement = (settlementId: string, reason: string) => {
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

    // Clear pending flag, keep status as frozen
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
  const recordManualCashSettlement = (
    entityType: 'vendor' | 'driver',
    entityId: string,
    amount: number,
    adminNotes?: string
  ) => {
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
  const updatePricingConfig = (newConfig: Partial<PricingConfig>) => {
    setPricingConfig((prev) => ({ ...prev, ...newConfig }));
    showToast('تم حفظ إعدادات التسعير والخزنة وتطبيقها لحظياً على المنصة', 'success');
  };

  // Vendor administration
  const updateVendorCommissionAndLimit = (
    vendorId: string,
    commissionRate: number,
    debtLimit: number
  ) => {
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

  const toggleVendorStatus = (vendorId: string) => {
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

  const approvePendingVendor = (
    vendorId: string,
    commissionRate: number,
    debtLimit: number
  ) => {
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

  const rejectPendingVendor = (vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast('تم رفض طلب انضمام المحل', 'info');
  };

  const addVendorManual = (vendorData: Omit<Vendor, 'id' | 'currentDebt' | 'totalSales' | 'createdAt'>) => {
    const newV: Vendor = {
      ...vendorData,
      id: `v-${Date.now().toString().slice(-4)}`,
      currentDebt: 0,
      totalSales: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setVendors((prev) => [...prev, newV]);
    showToast(`تمت إضافة براند ${newV.name} بنجاح`, 'success');
  };

  // Driver administration
  const updateDriverLimit = (driverId: string, debtLimit: number) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, debtLimit } : d))
    );
    showToast('تم تحديث سقف مديونية الطيار', 'success');
  };

  const toggleDriverStatus = (driverId: string) => {
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

  const toggleDriverOnline = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isOnline: !d.isOnline } : d))
    );
  };

  const approvePendingDriver = (driverId: string, debtLimit: number) => {
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

  const rejectPendingDriver = (driverId: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    showToast('تم رفض طلب تسجيل الطيار', 'info');
  };

  const updateDriverCoordinates = (driverId: string, coordinates: { lat: number; lng: number }) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, coordinates } : d))
    );
  };

  // Product management
  const addProduct = (pData: Omit<Product, 'id' | 'vendorName'>) => {
    const vendor = vendors.find((v) => v.id === pData.vendorId);
    const newProduct: Product = {
      ...pData,
      id: `p-${Date.now().toString().slice(-4)}`,
      vendorName: vendor?.name || 'محل أزياء',
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`تم نشر قطعة ${newProduct.name} في الكتالوج بنجاح`, 'success');
  };

  const updateProduct = (productId: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updated } : p))
    );
    showToast('تم حفظ تعديلات المنتج وتحديث الكتالوج بنجاح', 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('تم حذف القطعة من الكتالوج نهائياً', 'info');
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Onboarding submissions
  const registerVendorApplication = ({
    name,
    phone,
    password,
    area,
    address,
    category,
    logoUrl,
    instagram,
  }: {
    name: string;
    phone: string;
    password?: string;
    area: string;
    address: string;
    category: string;
    logoUrl?: string;
    instagram?: string;
  }) => {
    const newVendor: Vendor = {
      id: `v-pending-${Date.now().toString().slice(-4)}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      phone,
      password: password || 'vendor123',
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
  };

  const registerDriverApplication = ({
    name,
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
    phone: string;
    password?: string;
    vehicle: string;
    vehicleNumber: string;
    area: string;
    nationalId: string;
    avatarPhoto?: string;
    vehiclePhoto?: string;
    nationalIdPhoto?: string;
    licensePhoto?: string;
  }) => {
    const newDriver: Driver = {
      id: `d-pending-${Date.now().toString().slice(-4)}`,
      name,
      phone,
      password: password || 'driver123',
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
      licensePhoto: licensePhoto || generateIdDocSvg('رخصة قيادة دراجة نارية', name, `LIC-${Math.floor(100000 + Math.random() * 900000)}`),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDrivers((prev) => [...prev, newDriver]);
    showToast(
      'تم تسجيل طلبك ككابتن توصيل ورفع المستندات الرسمية بنجاح! سيتم فحص الأوراق والاعتماد خلال 24 ساعة.',
      'success'
    );
  };

  return (
    <PlatformContext.Provider
      value={{
        activePortal,
        setActivePortal,
        onboardingType,
        setOnboardingType,
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
        updateUserPassword,
        quickImpersonate,
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
