import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bike,
  Store,
  User,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCw,
  AlertCircle,
  CreditCard,
  FileText,
  Star,
} from 'lucide-react';
import { LiveOrderTrackingMap } from '../maps/LiveOrderTrackingMap';

export type OrderCategoryFilter =
  | 'all'
  | 'pending'
  | 'in_transit'
  | 'delivered'
  | 'returning'
  | 'cancelled';

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    englishLabel: string;
    category: Exclude<OrderCategoryFilter, 'all'>;
    badgeClass: string;
  }
> = {
  pending_vendor: {
    label: 'بانتظار تأكيد المحل',
    englishLabel: 'Pending Vendor',
    category: 'pending',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  },
  preparing: {
    label: 'جاري تجهيز القطع',
    englishLabel: 'Preparing',
    category: 'pending',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  },
  ready_for_driver: {
    label: 'جاهز لاستلام الطيار',
    englishLabel: 'Ready for Pickup',
    category: 'pending',
    badgeClass: 'bg-white/10 text-white/80 border-white/15',
  },
  driver_assigned: {
    label: 'تم تعيين طيار (في الطريق للمحل)',
    englishLabel: 'Driver Assigned',
    category: 'in_transit',
    badgeClass: 'bg-white/10 text-white/80 border-white/15',
  },
  picked_up_paid_store: {
    label: 'في الطريق للعميل (تم دفع الكاش للمحل)',
    englishLabel: 'Out for Delivery',
    category: 'in_transit',
    badgeClass: 'bg-white/10 text-white/80 border-white/15',
  },
  delivered: {
    label: 'تم التوصيل والتحصيل',
    englishLabel: 'Delivered',
    category: 'delivered',
    badgeClass: 'bg-[#D1FE17]/10 text-[#D1FE17] border-[#D1FE17]/25',
  },
  returning_to_vendor: {
    label: 'مرتجع في الطريق للمحل',
    englishLabel: 'Returning to Vendor',
    category: 'returning',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  },
  returned_to_store: {
    label: 'مرتجع وصل المحل',
    englishLabel: 'Returned to Store',
    category: 'returning',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  },
  returned_completed: {
    label: 'مرتجع مكتمل ومغلق مالياً',
    englishLabel: 'Return Completed',
    category: 'returning',
    badgeClass: 'bg-white/10 text-white/80 border-white/15',
  },
  cancelled_by_vendor: {
    label: 'ملغي من المحل (نفاد مقاس/كمية)',
    englishLabel: 'Cancelled by Vendor',
    category: 'cancelled',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/25',
  },
  cancelled: {
    label: 'ملغي',
    englishLabel: 'Cancelled',
    category: 'cancelled',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/25',
  },
};

export function matchesOrderCategoryFilter(
  status: OrderStatus,
  categoryFilter: OrderCategoryFilter
): boolean {
  if (categoryFilter === 'all') return true;
  return ORDER_STATUS_META[status]?.category === categoryFilter;
}

export const AdminOrders: React.FC = () => {
  const {
    orders,
    vendors,
    drivers,
    vendorConfirmStockAndPrepare,
    vendorPrepareOrder,
    vendorCancelOutOfStock,
    driverCompleteDelivery,
    vendorConfirmReturnReceived,
  } = usePlatform();

  const [categoryFilter, setCategoryFilter] = useState<OrderCategoryFilter>('all');
  const [exactStatusFilter, setExactStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Category counts across all orders (respecting vendor/driver/search filters so admin sees accurate counts)
  const baseFilteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((ord) => {
      if (vendorFilter !== 'all' && ord.vendorId !== vendorFilter) return false;
      if (driverFilter !== 'all') {
        if (driverFilter === 'unassigned' && ord.driverId) return false;
        if (driverFilter !== 'unassigned' && ord.driverId !== driverFilter) return false;
      }
      if (q) {
        const hay = `${ord.orderNumber} ${ord.customerName} ${ord.customerPhone} ${ord.customerArea} ${ord.vendorName} ${ord.driverName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, vendorFilter, driverFilter, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<OrderCategoryFilter, number> = {
      all: baseFilteredOrders.length,
      pending: 0,
      in_transit: 0,
      delivered: 0,
      returning: 0,
      cancelled: 0,
    };
    for (const ord of baseFilteredOrders) {
      const cat = ORDER_STATUS_META[ord.status]?.category;
      if (cat) counts[cat] += 1;
    }
    return counts;
  }, [baseFilteredOrders]);

  // Final filtered orders applying both Category and Exact Status filters
  const filteredOrders = useMemo(() => {
    return baseFilteredOrders.filter((ord) => {
      if (!matchesOrderCategoryFilter(ord.status, categoryFilter)) return false;
      if (exactStatusFilter !== 'all' && ord.status !== exactStatusFilter) return false;
      return true;
    });
  }, [baseFilteredOrders, categoryFilter, exactStatusFilter]);

  const summaryMetrics = useMemo(() => {
    const totalValue = filteredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalCommission = filteredOrders.reduce(
      (acc, o) =>
        acc +
        (o.status !== 'cancelled' && o.status !== 'cancelled_by_vendor'
          ? o.vendorCommission + (o.status === 'delivered' ? o.driverCommission : 0)
          : 0),
      0
    );
    return { totalValue, totalCommission };
  }, [filteredOrders]);

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setExactStatusFilter('all');
    setVendorFilter('all');
    setDriverFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    categoryFilter !== 'all' ||
    exactStatusFilter !== 'all' ||
    vendorFilter !== 'all' ||
    driverFilter !== 'all' ||
    searchQuery.trim() !== '';

  const categoryTabs: Array<{
    id: OrderCategoryFilter;
    label: string;
    englishSub: string;
    icon: React.ReactNode;
    activeClass: string;
  }> = [
    {
      id: 'all',
      label: 'جميع الطلبات',
      englishSub: 'All',
      icon: <Package className="w-3.5 h-3.5" />,
      activeClass: 'bg-[#D1FE17] text-[#131517] border-[#D1FE17]',
    },
    {
      id: 'pending',
      label: 'قيد الانتظار والتجهيز',
      englishSub: 'Pending',
      icon: <Clock className="w-3.5 h-3.5 text-amber-300" />,
      activeClass: 'bg-amber-400 text-[#131517] border-amber-400',
    },
    {
      id: 'in_transit',
      label: 'جاري التوصيل',
      englishSub: 'In Transit',
      icon: <Bike className="w-3.5 h-3.5 text-white/80" />,
      activeClass: 'bg-[#D1FE17] text-[#131517] border-white/30',
    },
    {
      id: 'delivered',
      label: 'تم التوصيل',
      englishSub: 'Delivered',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#D1FE17]" />,
      activeClass: 'bg-[#D1FE17] text-[#131517] border-[#D1FE17]',
    },
    {
      id: 'returning',
      label: 'المرتجعات',
      englishSub: 'Returning',
      icon: <RotateCcw className="w-3.5 h-3.5 text-amber-300" />,
      activeClass: 'bg-amber-400 text-[#131517] border-amber-400',
    },
    {
      id: 'cancelled',
      label: 'الملغاة',
      englishSub: 'Cancelled',
      icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
      activeClass: 'bg-red-600 text-white border-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Summary Strip */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              إدارة ومتابعة الطلبات (Admin Orders Workflow Management)
            </h2>
            <span className="text-[11px] bg-white/[0.06] text-white/90 px-2.5 py-0.5 rounded font-mono font-bold">
              {filteredOrders.length} / {orders.length} طلب
            </span>
          </div>
          <p className="text-xs text-[#898A8B] mt-1">
            نظام تصفية متقدم حسب حالة الطلب (قيد الانتظار، جاري التوصيل، تم التوصيل، المرتجعات، الملغاة) لإدارة العمليات اللحظية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-md">
            <span className="text-[#898A8B]">إجمالي قيمة الطلبات المعروضة: </span>
            <strong className="text-white font-mono tabular-nums">
              {summaryMetrics.totalValue.toLocaleString('ar-EG')} ج.م
            </strong>
          </div>
          <div className="bg-[#D1FE17]/10 border border-[#D1FE17]/25 px-3 py-1.5 rounded-md">
            <span className="text-[#D1FE17]">صافي عمولة المنصة منها: </span>
            <strong className="text-[#D1FE17] font-mono tabular-nums">
              +{Math.round(summaryMetrics.totalCommission).toLocaleString('ar-EG')} ج.م
            </strong>
          </div>
        </div>
      </div>

      {/* Status Category Filter Pills + Multi-Filter Controls */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-4 space-y-4">
        {/* Primary Status Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categoryTabs.map((tab) => {
            const isActive = categoryFilter === tab.id;
            const count = categoryCounts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setExactStatusFilter('all');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isActive
                    ? `${tab.activeClass} shadow-xs`
                    : 'bg-white/[0.03] hover:bg-white/10 text-white/80 border-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.englishSub})</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                    isActive ? 'bg-[#1A1C1F]/20 text-white' : 'bg-white/10 text-white/90'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Granular Filters Bar (Search, Exact Sub-Status, Vendor, Driver, Reset) */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Box */}
            <div className="relative min-w-[230px] flex-1 max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الطلب (#VF)، اسم العميل، الهاتف، أو الحي..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-md pr-8 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D1FE17]"
              />
              <Search className="w-3.5 h-3.5 text-[#898A8B] absolute right-2.5 top-2.5" />
            </div>

            {/* Exact Granular Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#898A8B] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> الحالة الدقيقة:
              </span>
              <select
                aria-label="تصفية حسب الحالة الدقيقة للطلب"
                value={exactStatusFilter}
                onChange={(e) => setExactStatusFilter(e.target.value as OrderStatus | 'all')}
                className="bg-white/[0.03] border border-white/10 text-white rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#D1FE17]"
              >
                <option value="all">كل الحالات الفرعية</option>
                <optgroup label="Pending (قيد الانتظار والتجهيز)">
                  <option value="pending_vendor">بانتظار تأكيد المحل (Pending Vendor)</option>
                  <option value="preparing">جاري التجهيز (Preparing)</option>
                  <option value="ready_for_driver">جاهز لاستلام الطيار (Ready for Driver)</option>
                </optgroup>
                <optgroup label="In Transit (جاري التوصيل)">
                  <option value="driver_assigned">تم تعيين طيار (Driver Assigned)</option>
                  <option value="picked_up_paid_store">في الطريق للعميل (Out for Delivery)</option>
                </optgroup>
                <optgroup label="Delivered (مكتمل)">
                  <option value="delivered">تم التوصيل (Delivered)</option>
                </optgroup>
                <optgroup label="Returning (المرتجعات)">
                  <option value="returning_to_vendor">مرتجع في الطريق للمحل (Returning)</option>
                  <option value="returned_to_store">مرتجع وصل المحل (Returned to Store)</option>
                  <option value="returned_completed">مرتجع مكتمل (Return Completed)</option>
                </optgroup>
                <optgroup label="Cancelled (الملغاة)">
                  <option value="cancelled_by_vendor">ملغي من المحل (Cancelled by Vendor)</option>
                  <option value="cancelled">ملغي (Cancelled)</option>
                </optgroup>
              </select>
            </div>

            {/* Vendor Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#898A8B]">المتجر:</span>
              <select
                aria-label="تصفية الطلبات حسب المتجر"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/10 text-white rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#D1FE17]"
              >
                <option value="all">كل المحلات ({vendors.length})</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#898A8B]">الطيار:</span>
              <select
                aria-label="تصفية الطلبات حسب الطيار"
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/10 text-white rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#D1FE17]"
              >
                <option value="all">كل الطيارين</option>
                <option value="unassigned">بدون طيار (بانتظار التعيين)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] text-[#898A8B] flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white">
              لا توجد طلبات مطابقة لمعايير التصفية الحالية
            </div>
            <p className="text-xs text-[#898A8B]">
              جرب تغيير فلتر الحالة أو مسح كلمة البحث لعرض كافة الطلبات المسجلة.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 bg-[#D1FE17] text-[#131517] text-xs font-bold px-4 py-2 rounded-md hover:bg-white cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>عرض جميع الطلبات ({orders.length})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] text-[#898A8B] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">رقم الطلب والتاريخ</th>
                  <th className="px-4 py-3 font-medium">المتجر (البراند)</th>
                  <th className="px-4 py-3 font-medium">العميل والمنطقة</th>
                  <th className="px-4 py-3 font-medium">الطيار المكلّف</th>
                  <th className="px-4 py-3 font-medium text-left">ثمن الملابس</th>
                  <th className="px-4 py-3 font-medium text-left">رسوم التوصيل</th>
                  <th className="px-4 py-3 font-medium text-left">عمولة المنصة</th>
                  <th className="px-4 py-3 font-medium">حالة الطلب (Status)</th>
                  <th className="px-4 py-3 font-medium">تقييم العميل (المحل / الكابتن)</th>
                  <th className="px-4 py-3 font-medium text-center">التفاصيل / الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => {
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    englishLabel: order.status,
                    category: 'pending',
                    badgeClass: 'bg-white/[0.06] text-white/80 border-white/10',
                  };
                  const isExpanded = expandedOrderId === order.id;
                  const totalComm =
                    order.status !== 'cancelled' && order.status !== 'cancelled_by_vendor'
                      ? order.vendorCommission +
                        (order.status === 'delivered' ? order.driverCommission : 0)
                      : 0;
                  const assignedDriver = drivers.find((d) => d.id === order.driverId);

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`hover:bg-white/5 transition-colors ${
                          isExpanded ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-white">
                            {order.orderNumber}
                          </div>
                          <div className="text-[10px] text-[#898A8B] font-mono mt-0.5">
                            {order.createdAt}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-[#898A8B] shrink-0" />
                            <span>{order.vendorName}</span>
                          </div>
                          <div className="text-[11px] text-[#898A8B]">{order.vendorArea}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#898A8B] shrink-0" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="text-[11px] text-[#898A8B] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#898A8B] shrink-0" />
                            <span>{order.customerArea}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {order.driverName ? (
                            <div>
                              <div className="font-bold text-white flex items-center gap-1">
                                <Bike className="w-3.5 h-3.5 text-[#D1FE17] shrink-0" />
                                <span>{order.driverName}</span>
                              </div>
                              <div className="text-[10px] text-[#898A8B] font-mono">
                                {order.driverPhone}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#898A8B] text-[11px]">بانتظار تعيين طيار</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-left font-bold tabular-nums text-white">
                          {order.clothesTotal.toLocaleString('ar-EG')} ج.م
                        </td>

                        <td className="px-4 py-3 text-left tabular-nums text-white/70">
                          {order.deliveryFee} ج.م
                          <div className="text-[10px] text-[#898A8B] font-mono">
                            {order.distanceKm} كم
                          </div>
                        </td>

                        <td className="px-4 py-3 text-left font-bold tabular-nums text-[#D1FE17]">
                          {totalComm > 0 ? `+${totalComm.toFixed(1)} ج.م` : '—'}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.badgeClass}`}
                          >
                            <span>{meta.label}</span>
                          </span>
                          <div className="text-[10px] text-[#898A8B] font-mono mt-0.5">
                            {meta.englishLabel}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {order.vendorRating || order.driverRating ? (
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center gap-1 font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded">
                                <Store className="w-3 h-3 text-white/70 shrink-0" />
                                <span>المحل: {order.vendorRating || 5}/5</span>
                                <Star className="w-3 h-3 fill-amber-300 text-amber-300 shrink-0" />
                              </div>
                              <div className="flex items-center gap-1 font-bold text-[#D1FE17] bg-[#D1FE17]/10 border border-[#D1FE17]/25 px-2 py-0.5 rounded">
                                <Bike className="w-3 h-3 text-[#D1FE17] shrink-0" />
                                <span>الكابتن: {order.driverRating || 5}/5</span>
                                <Star className="w-3 h-3 fill-amber-300 text-amber-300 shrink-0" />
                              </div>
                            </div>
                          ) : order.status === 'delivered' ? (
                            <span className="text-[11px] text-[#898A8B]">بانتظار تقييم العميل</span>
                          ) : (
                            <span className="text-[11px] text-white/80">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-white/10 bg-[#1A1C1F] hover:bg-white/10 text-white/90 font-bold text-[11px] cursor-pointer"
                          >
                            <span>{isExpanded ? 'إخفاء' : 'إدارة / تفاصيل'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Order Details & Admin Workflow Controls */}
                      {isExpanded && (
                        <tr className="bg-white/[0.03] border-b border-white/10">
                          <td colSpan={10} className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                              {/* Order Items & Financial Breakdown */}
                              <div className="lg:col-span-7 space-y-3 bg-[#1A1C1F] p-4 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-white/80" />
                                    <span>تفاصيل القطع والبيانات المالية للطلب {order.orderNumber}</span>
                                  </div>
                                  <span className="text-[11px] text-[#898A8B] flex items-center gap-1">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    طريقة الدفع: {order.paymentMethod === 'cash_on_delivery' ? 'كاش عند الاستلام' : order.paymentMethod === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}
                                  </span>
                                </div>

                                <div className="divide-y divide-white/10">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="py-2 flex items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <img
                                          src={item.product.image}
                                          alt={item.product.name}
                                          className="w-10 h-10 rounded object-cover border border-white/10"
                                        />
                                        <div>
                                          <div className="font-bold text-white">
                                            {item.product.name}
                                          </div>
                                          <div className="text-[11px] text-[#898A8B]">
                                            المقاس: <strong className="text-white/90">{item.size}</strong> · الكمية: <strong className="text-white/90">{item.quantity}</strong>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="font-bold tabular-nums text-white">
                                        {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                  <div className="bg-white/[0.03] p-2 rounded border border-white/10">
                                    <span className="text-[#898A8B] block">عنوان التسليم</span>
                                    <strong className="text-white">{order.customerAddress}</strong>
                                  </div>
                                  <div className="bg-white/[0.03] p-2 rounded border border-white/10">
                                    <span className="text-[#898A8B] block">عمولة المنصة من المحل</span>
                                    <strong className="text-[#D1FE17] tabular-nums">
                                      {order.vendorCommission.toLocaleString('ar-EG')} ج.م
                                    </strong>
                                  </div>
                                  <div className="bg-white/[0.03] p-2 rounded border border-white/10">
                                    <span className="text-[#898A8B] block">عمولة المنصة من التوصيل</span>
                                    <strong className="text-[#D1FE17] tabular-nums">
                                      {order.driverCommission.toLocaleString('ar-EG')} ج.م
                                    </strong>
                                  </div>
                                  <div className="bg-white/[0.03] p-2 rounded border border-white/10">
                                    <span className="text-[#898A8B] block">إجمالي التحصيل من العميل</span>
                                    <strong className="text-white tabular-nums">
                                      {order.totalAmount.toLocaleString('ar-EG')} ج.م
                                    </strong>
                                  </div>
                                </div>

                                {/* Return / Rejection Notice if applicable */}
                                {(order.returnReason || order.vendorRejectedReason) && (
                                  <div className="p-2.5 rounded bg-red-500/10 border border-red-500/25 text-red-400 text-[11px]">
                                    <strong>سبب الإلغاء / المرتجع: </strong>
                                    {order.returnReason || order.vendorRejectedReason}
                                    {order.returnCode && (
                                      <span className="mr-2 font-mono bg-[#1A1C1F] px-1.5 py-0.5 rounded border border-red-500/25">
                                        كود المرتجع: {order.returnCode}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Customer Ratings & Reviews Card */}
                                {(order.vendorRating || order.driverRating) && (
                                  <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/25 space-y-2 text-xs">
                                    <div className="flex items-center justify-between font-bold text-amber-300">
                                      <span className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                                        <span>تقييم ومراجعة العميل بعد الاستلام</span>
                                      </span>
                                      {order.ratedAt && (
                                        <span className="text-[10px] font-mono text-[#898A8B]">
                                          {order.ratedAt}
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div className="bg-[#1A1C1F] p-2.5 rounded border border-amber-400/25">
                                        <div className="flex items-center justify-between font-bold text-white">
                                          <span>تقييم المحل ({order.vendorName}):</span>
                                          <span className="text-amber-300 font-mono">
                                            {order.vendorRating || 5} / 5 ★
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-white/70 mt-1">
                                          {order.vendorReview || 'بدون تعليق نصي'}
                                        </p>
                                      </div>
                                      <div className="bg-[#1A1C1F] p-2.5 rounded border border-amber-400/25">
                                        <div className="flex items-center justify-between font-bold text-white">
                                          <span>تقييم الكابتن ({order.driverName || 'الطيار'}):</span>
                                          <span className="text-amber-300 font-mono">
                                            {order.driverRating || 5} / 5 ★
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-white/70 mt-1">
                                          {order.driverReview || 'بدون تعليق نصي'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Admin Workflow Action Buttons */}
                                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[11px] font-bold text-white/70">
                                    إجراءات التحكم الإداري بالطلب:
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {order.status === 'pending_vendor' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => vendorConfirmStockAndPrepare(order.id)}
                                          className="px-3 py-1.5 rounded bg-[#D1FE17] hover:bg-white text-[#131517] text-xs font-bold cursor-pointer"
                                        >
                                          تأكيد توفر القطع وتجهيز الطلب
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            vendorCancelOutOfStock(
                                              order.id,
                                              'تم إلغاء الطلب من لوحة الإدارة العامة'
                                            )
                                          }
                                          className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                                        >
                                          إلغاء الطلب
                                        </button>
                                      </>
                                    )}
                                    {order.status === 'preparing' && (
                                      <button
                                        type="button"
                                        onClick={() => vendorPrepareOrder(order.id)}
                                        className="px-3 py-1.5 rounded bg-[#D1FE17] hover:bg-white/25 text-[#131517] text-xs font-bold cursor-pointer"
                                      >
                                        تحويل إلى جاهز لاستلام الطيار
                                      </button>
                                    )}
                                    {order.status === 'picked_up_paid_store' && (
                                      <button
                                        type="button"
                                        onClick={() => driverCompleteDelivery(order.id)}
                                        className="px-3 py-1.5 rounded bg-[#D1FE17] hover:bg-white text-[#131517] text-xs font-bold cursor-pointer"
                                      >
                                        تأكيد إتمام التوصيل للعميل
                                      </button>
                                    )}
                                    {(order.status === 'returning_to_vendor' ||
                                      order.status === 'returned_to_store') && (
                                      <button
                                        type="button"
                                        onClick={() => vendorConfirmReturnReceived(order.id)}
                                        className="px-3 py-1.5 rounded bg-[#D1FE17] hover:bg-white/25 text-[#131517] text-xs font-bold cursor-pointer"
                                      >
                                        تأكيد استلام المحل للمرتجع وإغلاق الذمة
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Live GPS Order Map Preview */}
                              <div className="lg:col-span-5">
                                <LiveOrderTrackingMap
                                  order={order}
                                  driver={assignedDriver}
                                  heightClassName="h-[220px]"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
