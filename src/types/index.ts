export type UserPortal = 'customer' | 'vendor' | 'driver' | 'admin' | 'onboarding';

export type OnboardingType = 'vendor' | 'driver';

export type CustomerPaymentMethod = 'cash_on_delivery' | 'vodafone_cash' | 'instapay';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  createdAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  area: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  category: string;
  logo: string;
  commissionRate: number; // percentage e.g. 15
  debtLimit: number; // in EGP e.g. 5000
  currentDebt: number; // in EGP
  totalSales: number; // clothing gross sales in EGP
  status: 'active' | 'frozen' | 'pending' | 'suspended';
  hasPendingSettlement?: boolean; // When receipt is uploaded, account remains locked until Admin approves
  pendingSettlementAmount?: number;
  pendingSettlementRef?: string;
  createdAt: string;
  instagramHandle?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  area: string;
  debtLimit: number; // in EGP e.g. 1000
  currentDebt: number; // in EGP
  totalTrips: number;
  totalDeliveryEarnings: number;
  status: 'active' | 'frozen' | 'pending' | 'suspended';
  isOnline: boolean;
  hasPendingSettlement?: boolean; // When receipt is uploaded, account remains locked until Admin approves
  pendingSettlementAmount?: number;
  pendingSettlementRef?: string;
  nationalId: string;
  nationalIdPhoto: string;
  licensePhoto: string;
  avatarPhoto?: string;
  vehiclePhoto?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  inStock: boolean;
  image: string;
  description: string;
  fabricDetails?: string;
  fitType?: string;
}

export interface OrderItem {
  product: Product;
  size: string;
  quantity: number;
}

export type OrderStatus =
  | 'pending_vendor'
  | 'preparing'
  | 'ready_for_driver'
  | 'driver_assigned'
  | 'picked_up_paid_store'
  | 'delivered'
  | 'returning_to_vendor'
  | 'returned_completed'
  | 'returned_to_store'
  | 'cancelled_by_vendor'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  customerAddress: string;
  customerCoordinates?: { lat: number; lng: number };
  paymentMethod: CustomerPaymentMethod;
  vendorId: string;
  vendorName: string;
  vendorArea: string;
  vendorCoordinates?: { lat: number; lng: number };
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverVehicle?: string;
  driverVehicleNumber?: string;
  driverVehiclePhoto?: string;
  items: OrderItem[];
  clothesTotal: number;
  distanceKm: number;
  deliveryFee: number;
  totalAmount: number; // clothesTotal + deliveryFee
  vendorCommission: number; // platform cut from vendor
  driverCommission: number; // platform cut from delivery fee
  status: OrderStatus;
  returnReason?: string;
  returnCode?: string;
  vendorRejectedReason?: string;
  returnReceivedAt?: string;
  vendorRating?: number; // 1 to 5 stars for store
  vendorReview?: string;
  driverRating?: number; // 1 to 5 stars for driver
  driverReview?: string;
  ratedAt?: string;
  createdAt: string;
  notes?: string;
}

export interface SettlementRequest {
  id: string;
  entityType: 'vendor' | 'driver';
  entityId: string;
  entityName: string;
  entityArea?: string;
  amount: number;
  method: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'cash_office';
  transactionRef: string;
  receiptImageUrl: string;
  receiptNotes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export interface PricingConfig {
  baseFare: number; // e.g. 35 EGP
  baseKm: number; // e.g. 3 KM
  extraKmRate: number; // e.g. 4.5 EGP/KM
  driverCommissionRate: number; // e.g. 20%
  defaultVendorCommissionRate: number; // e.g. 15%
  defaultVendorLimit: number; // e.g. 5000 EGP
  defaultDriverLimit: number; // e.g. 1000 EGP
  vodafoneCashNumber: string;
  instapayHandle: string;
  bankIban: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}
