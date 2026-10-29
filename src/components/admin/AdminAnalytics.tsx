import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  TrendingUp,
  DollarSign,
  Bike,
  Building2,
  AlertCircle,
  Calendar,
  Filter,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { vendors, drivers, orders, settlements } = usePlatform();

  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (vendorFilter !== 'all' && order.vendorId !== vendorFilter) return false;
      // In this demo, all mock dates are recent. Filtering logic:
      if (timeFilter === 'today') return order.createdAt.startsWith('2026-10-28');
      return true;
    });
  }, [orders, vendorFilter, timeFilter]);

  // Financial Calculations
  const grossClothingSales = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'returned_to_store')
      .reduce((sum, o) => sum + o.clothesTotal, 0);
  }, [filteredOrders]);

  const platformVendorCommission = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'returned_to_store')
      .reduce((sum, o) => sum + o.vendorCommission, 0);
  }, [filteredOrders]);

  const platformDeliveryCommission = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.driverCommission, 0);
  }, [filteredOrders]);

  const settledCashInVault = useMemo(() => {
    return settlements
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.amount, 0);
  }, [settlements]);

  const outstandingVendorDebt = useMemo(() => {
    return vendors
      .filter((v) => vendorFilter === 'all' || v.id === vendorFilter)
      .reduce((sum, v) => sum + v.currentDebt, 0);
  }, [vendors, vendorFilter]);

  const outstandingDriverDebt = useMemo(() => {
    if (vendorFilter !== 'all') return 0; // Driver debt is platform-wide
    return drivers.reduce((sum, d) => sum + d.currentDebt, 0);
  }, [drivers, vendorFilter]);

  const totalOutstandingMarketDebt = outstandingVendorDebt + outstandingDriverDebt;
  const netPlatformProfits = platformVendorCommission + platformDeliveryCommission;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-950">النظرة العامة والمؤشرات المالية</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            تحديث فوري لتدفقات الكاش، عمولات الملابس، وعوائد أسطول التوصيل
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Vendor Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> المتجر:
            </span>
            <select
              aria-label="تصفية حسب المتجر"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-zinc-900"
            >
              <option value="all">جميع البراندات والمحلات ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.area})
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs border border-zinc-200">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                timeFilter === 'today'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                timeFilter === 'week'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              هذا الأسبوع
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                timeFilter === 'month'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              كل الأوقات
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Financial Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Gross Clothing Sales */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">إجمالي مبيعات الملابس</span>
            <Building2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight tabular-nums text-zinc-950">
            {grossClothingSales.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-normal text-zinc-500">ج.م</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
            <span>القيمة السوقية للقطع المطلوبة</span>
          </div>
        </div>

        {/* 2. Platform Cut from Vendors */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">أرباح عمولات المحلات</span>
            <span className="text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-mono">
              ~15%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-700">
            {platformVendorCommission.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-normal text-zinc-500">ج.م</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            عمولة مخصومة من ثمن بيع الملابس
          </div>
        </div>

        {/* 3. Platform Cut from Delivery */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">أرباح عمولة التوصيل</span>
            <Bike className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-700">
            {platformDeliveryCommission.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-normal text-zinc-500">ج.م</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            20% من إجمالي رسوم مشاوير الطيارين
          </div>
        </div>

        {/* 4. Total Cash Settled in Vault */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 bg-gradient-to-b from-white to-zinc-50/50">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">الكاش المحصل بالخزنة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight tabular-nums text-zinc-950">
            {settledCashInVault.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-normal text-zinc-500">ج.م</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 font-medium">
            مستلم ومطابق بكشوفات إنستاباي وفودافون
          </div>
        </div>

        {/* 5. Total Outstanding Market Debt */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">المديونيات المعلقة بالسوق</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight tabular-nums text-amber-700">
            {totalOutstandingMarketDebt.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-normal text-zinc-500">ج.م</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center justify-between">
            <span>محلات: {outstandingVendorDebt.toLocaleString('ar-EG')}</span>
            <span>·</span>
            <span>طيارين: {outstandingDriverDebt.toLocaleString('ar-EG')}</span>
          </div>
        </div>
      </div>

      {/* Financial Breakdown & Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Model Visual */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-zinc-950">
              دورة الكاش والذمم المالية في النظام (Cash Flow Architecture)
            </h3>
            <span className="text-xs text-zinc-500">تصفية فورية 100% كاش</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-zinc-200 rounded-md p-3.5 bg-zinc-50">
              <div className="font-bold text-zinc-900 mb-1">1. عند المتجر (المحل)</div>
              <p className="text-zinc-600 leading-relaxed">
                الطيار يدفع للمحل <strong className="text-zinc-950">100% من ثمن الملابس كاش</strong> فوراً. يتسجل على المحل مديونية للمنصة بنسبة العمولة ({vendors[0]?.commissionRate || 15}%).
              </p>
            </div>

            <div className="border border-zinc-200 rounded-md p-3.5 bg-zinc-50">
              <div className="font-bold text-zinc-900 mb-1">2. عند باب العميل</div>
              <p className="text-zinc-600 leading-relaxed">
                الطيار يستلم من العميل <strong className="text-zinc-950">(ثمن الملابس + التوصيل)</strong>. يسترد كاش الملابس، ويتسجل عليه عمولة التوصيل (20%).
              </p>
            </div>

            <div className="border border-zinc-200 rounded-md p-3.5 bg-zinc-50">
              <div className="font-bold text-zinc-900 mb-1">3. في خزنة المنصة</div>
              <p className="text-zinc-600 leading-relaxed">
                المحلات والطيارون يسددون عند بلوغ سقف المديونية عبر <strong className="text-zinc-950">إنستاباي / فودافون كاش</strong> وتُفحص الإيصالات في لوحة الموافقات.
              </p>
            </div>
          </div>

          {/* Quick Ledger Stats */}
          <div className="mt-5 pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-zinc-500">إجمالي الطلبات المدارة: </span>
                <span className="font-bold text-zinc-900 tabular-nums">{orders.length} طلب</span>
              </div>
              <div>
                <span className="text-zinc-500">صافي أرباح المنصة المكتسبة: </span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {netPlatformProfits.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>
            <div className="text-zinc-400">
              محدث وفق التوقيت المحلي لمدينة القاهرة
            </div>
          </div>
        </div>

        {/* Market Risk & Freeze Status */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950 mb-3">
              حالة استقرار السيولة والمخاطر
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-zinc-50 border border-zinc-200">
                <span className="text-zinc-600">المحلات المجمدة لتجاوز الليميت:</span>
                <span className="font-bold text-red-600 tabular-nums">
                  {vendors.filter((v) => v.status === 'frozen').length} محل
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-zinc-50 border border-zinc-200">
                <span className="text-zinc-600">الطيارون الموقوفون لتجاوز الـ 1000 ج:</span>
                <span className="font-bold text-red-600 tabular-nums">
                  {drivers.filter((d) => d.status === 'frozen').length} طيار
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-zinc-50 border border-zinc-200">
                <span className="text-zinc-600">إيصالات تحويل بانتظار الاعتماد:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {settlements.filter((s) => s.status === 'pending').length} إيصال
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 leading-normal">
            تنبيه النظام: الإغلاق التلقائي للمتاجر المتجاوزة للحد يضمن عدم تراكم ذمم معدومة في السوق.
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-950">أحدث العمليات والطلبات في النظام</h3>
          <span className="text-xs text-zinc-500 font-mono">LIVE FEED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">رقم الطلب</th>
                <th className="px-4 py-2.5 font-medium">المحل</th>
                <th className="px-4 py-2.5 font-medium">العميل / المنطقة</th>
                <th className="px-4 py-2.5 font-medium">الطيار</th>
                <th className="px-4 py-2.5 font-medium text-left">قيمة الملابس</th>
                <th className="px-4 py-2.5 font-medium text-left">التوصيل</th>
                <th className="px-4 py-2.5 font-medium text-left">عمولة المنصة</th>
                <th className="px-4 py-2.5 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOrders.slice(0, 6).map((order) => {
                const totalComm = order.vendorCommission + (order.status === 'delivered' ? order.driverCommission : 0);
                return (
                  <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {order.vendorName}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {order.customerName} · {order.customerArea}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {order.driverName || <span className="text-zinc-400">بانتظار طيار</span>}
                    </td>
                    <td className="px-4 py-3 text-left font-bold tabular-nums text-zinc-900">
                      {order.clothesTotal.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="px-4 py-3 text-left tabular-nums text-zinc-600">
                      {order.deliveryFee} ج.م
                    </td>
                    <td className="px-4 py-3 text-left font-bold tabular-nums text-emerald-700">
                      +{totalComm.toFixed(1)} ج.م
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'delivered' && (
                        <span className="text-emerald-700 font-medium">✓ تم التوصيل</span>
                      )}
                      {order.status === 'picked_up_paid_store' && (
                        <span className="text-blue-700 font-medium">● في الطريق للعميل</span>
                      )}
                      {order.status === 'ready_for_driver' && (
                        <span className="text-amber-700 font-medium">جاهز للاستلام</span>
                      )}
                      {order.status === 'returned_to_store' && (
                        <span className="text-red-600 font-medium">مرتجع للمحل</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
