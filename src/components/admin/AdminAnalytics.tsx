import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Bike,
  Building2,
  AlertCircle,
  Filter,
  CheckCircle2,
  BarChart3,
  Search,
  RotateCw,
  Star,
} from 'lucide-react';
import { OrderStatus } from '../../types';
import { AdminOrderDensityHeatmap } from '../maps/AdminOrderDensityHeatmap';
import {
  ORDER_STATUS_META,
  OrderCategoryFilter,
  matchesOrderCategoryFilter,
} from './AdminOrders';

interface DailyAnalyticsPoint {
  date: string;
  label: string;
  orderVolume: number;
  totalRevenue: number;
  platformCommission: number;
}

// Baseline daily history (Oct 23 – Oct 27) per vendor so the 7-day / 14-day line chart has rich multi-day continuity alongside live orders on Oct 28–29+
const HISTORICAL_DAILY_BASELINE: Array<{
  date: string;
  label: string;
  vendorId: string;
  orderVolume: number;
  totalRevenue: number;
  platformCommission: number;
}> = [
  { date: '2026-10-23', label: '23 أكتوبر', vendorId: 'v-1', orderVolume: 4, totalRevenue: 4120, platformCommission: 618 },
  { date: '2026-10-23', label: '23 أكتوبر', vendorId: 'v-2', orderVolume: 3, totalRevenue: 2790, platformCommission: 390 },
  { date: '2026-10-23', label: '23 أكتوبر', vendorId: 'v-4', orderVolume: 2, totalRevenue: 1720, platformCommission: 258 },
  { date: '2026-10-24', label: '24 أكتوبر', vendorId: 'v-1', orderVolume: 6, totalRevenue: 6340, platformCommission: 951 },
  { date: '2026-10-24', label: '24 أكتوبر', vendorId: 'v-2', orderVolume: 4, totalRevenue: 3680, platformCommission: 515 },
  { date: '2026-10-24', label: '24 أكتوبر', vendorId: 'v-5', orderVolume: 2, totalRevenue: 3880, platformCommission: 698 },
  { date: '2026-10-25', label: '25 أكتوبر', vendorId: 'v-1', orderVolume: 5, totalRevenue: 5290, platformCommission: 793 },
  { date: '2026-10-25', label: '25 أكتوبر', vendorId: 'v-3', orderVolume: 4, totalRevenue: 3120, platformCommission: 499 },
  { date: '2026-10-25', label: '25 أكتوبر', vendorId: 'v-4', orderVolume: 3, totalRevenue: 2540, platformCommission: 381 },
  { date: '2026-10-26', label: '26 أكتوبر', vendorId: 'v-1', orderVolume: 7, totalRevenue: 7450, platformCommission: 1117 },
  { date: '2026-10-26', label: '26 أكتوبر', vendorId: 'v-2', orderVolume: 5, totalRevenue: 4620, platformCommission: 646 },
  { date: '2026-10-26', label: '26 أكتوبر', vendorId: 'v-5', orderVolume: 3, totalRevenue: 5790, platformCommission: 1042 },
  { date: '2026-10-27', label: '27 أكتوبر', vendorId: 'v-1', orderVolume: 6, totalRevenue: 6180, platformCommission: 927 },
  { date: '2026-10-27', label: '27 أكتوبر', vendorId: 'v-2', orderVolume: 6, totalRevenue: 5490, platformCommission: 768 },
  { date: '2026-10-27', label: '27 أكتوبر', vendorId: 'v-4', orderVolume: 4, totalRevenue: 3380, platformCommission: 507 },
];

function formatArabicDateLabel(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const day = parseInt(parts[2], 10);
  const monthNames: Record<string, string> = {
    '01': 'يناير',
    '02': 'فبراير',
    '03': 'مارس',
    '04': 'أبريل',
    '05': 'مايو',
    '06': 'يونيو',
    '07': 'يوليو',
    '08': 'أغسطس',
    '09': 'سبتمبر',
    '10': 'أكتوبر',
    '11': 'نوفمبر',
    '12': 'ديسمبر',
  };
  return `${day} ${monthNames[parts[1]] || parts[1]}`;
}

export const AdminAnalytics: React.FC<{ onNavigateToOrders?: () => void }> = ({
  onNavigateToOrders,
}) => {
  const { vendors, drivers, orders, settlements } = usePlatform();

  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [chartViewMode, setChartViewMode] = useState<'combined' | 'revenue' | 'volume'>('combined');
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<OrderCategoryFilter>('all');
  const [exactOrderStatus, setExactOrderStatus] = useState<OrderStatus | 'all'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Latest date in orders (defaults to 2026-10-29)
  const latestOrderDate = useMemo(() => {
    const dates = orders
      .map((o) => o.createdAt.slice(0, 10))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort();
    return dates[dates.length - 1] || '2026-10-29';
  }, [orders]);

  // Filtered live orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (vendorFilter !== 'all' && order.vendorId !== vendorFilter) return false;
      const orderDate = order.createdAt.slice(0, 10);
      if (timeFilter === 'today') return orderDate === latestOrderDate;
      return true;
    });
  }, [orders, vendorFilter, timeFilter, latestOrderDate]);

  // Daily Order Volume & Total Revenue Time-Series for Recharts LineChart
  const dailyChartData = useMemo<DailyAnalyticsPoint[]>(() => {
    const map = new Map<string, DailyAnalyticsPoint>();

    // 1. Seed historical baseline days (when not filtered strictly to 'today')
    if (timeFilter !== 'today') {
      for (const row of HISTORICAL_DAILY_BASELINE) {
        if (vendorFilter !== 'all' && row.vendorId !== vendorFilter) continue;
        const existing = map.get(row.date) || {
          date: row.date,
          label: row.label,
          orderVolume: 0,
          totalRevenue: 0,
          platformCommission: 0,
        };
        existing.orderVolume += row.orderVolume;
        existing.totalRevenue += row.totalRevenue;
        existing.platformCommission += row.platformCommission;
        map.set(row.date, existing);
      }
    }

    // 2. Aggregate live orders from PlatformContext by date (YYYY-MM-DD)
    for (const ord of filteredOrders) {
      if (ord.status === 'cancelled' || ord.status === 'cancelled_by_vendor') continue;
      const dateKey = ord.createdAt.slice(0, 10);
      const existing = map.get(dateKey) || {
        date: dateKey,
        label: formatArabicDateLabel(dateKey),
        orderVolume: 0,
        totalRevenue: 0,
        platformCommission: 0,
      };
      existing.orderVolume += 1;
      existing.totalRevenue += ord.totalAmount;
      existing.platformCommission += Math.round(
        ord.vendorCommission + (ord.status === 'delivered' ? ord.driverCommission : 0)
      );
      map.set(dateKey, existing);
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders, vendorFilter, timeFilter]);

  const chartSummary = useMemo(() => {
    const totalVol = dailyChartData.reduce((acc, d) => acc + d.orderVolume, 0);
    const totalRev = dailyChartData.reduce((acc, d) => acc + d.totalRevenue, 0);
    const avgOrderValue = totalVol > 0 ? Math.round(totalRev / totalVol) : 0;
    const peakDay =
      dailyChartData.reduce<DailyAnalyticsPoint | null>(
        (best, cur) => (!best || cur.totalRevenue > best.totalRevenue ? cur : best),
        null
      )?.label || '—';
    return { totalVol, totalRev, avgOrderValue, peakDay };
  }, [dailyChartData]);

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
    if (vendorFilter !== 'all') return 0;
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
            تحليل بياني لحجم الطلبات اليومية، إجمالي الإيرادات، وتدفقات الخزنة والذمم
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
          <div className="text-[11px] text-zinc-500 mt-2">
            القيمة السوقية للقطع المطلوبة
          </div>
        </div>

        {/* 2. Platform Cut from Vendors */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">أرباح عمولات المحلات</span>
            <span className="text-xs font-mono text-zinc-500">~15%</span>
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
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
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

      {/* RECHARTS LINE CHART: DAILY ORDER VOLUME & TOTAL REVENUE */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-zinc-950">
                منحنى حجم الطلبات اليومية وإجمالي الإيرادات (Daily Order Volume & Total Revenue)
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
              <span>إجمالي طلبات الفترة: <strong className="text-zinc-900 tabular-nums">{chartSummary.totalVol} طلب</strong></span>
              <span aria-hidden="true">·</span>
              <span>إجمالي الإيرادات: <strong className="text-emerald-700 tabular-nums">{chartSummary.totalRev.toLocaleString('ar-EG')} ج.م</strong></span>
              <span aria-hidden="true">·</span>
              <span>متوسط قيمة الطلب: <strong className="text-zinc-900 tabular-nums">{chartSummary.avgOrderValue.toLocaleString('ar-EG')} ج.م</strong></span>
              <span aria-hidden="true">·</span>
              <span>أعلى ذروة يومية: <strong className="text-zinc-900">{chartSummary.peakDay}</strong></span>
            </div>
          </div>

          {/* Interactive Chart Metric Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs border border-zinc-200">
            <button
              type="button"
              onClick={() => setChartViewMode('combined')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                chartViewMode === 'combined'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              الإيرادات + حجم الطلبات
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('revenue')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                chartViewMode === 'revenue'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              إجمالي الإيرادات (ج.م)
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('volume')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                chartViewMode === 'volume'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              عدد الطلبات اليومية
            </button>
          </div>
        </div>

        {/* Recharts LineChart Container */}
        <div className="w-full h-[320px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyChartData}
              margin={{ top: 10, right: 24, left: 12, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#52525b', fontSize: 12 }}
                axisLine={{ stroke: '#e4e4e7' }}
                tickLine={false}
              />
              {(chartViewMode === 'combined' || chartViewMode === 'revenue') && (
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tick={{ fill: '#047857', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val: number) => `${(val / 1000).toFixed(1)}k`}
                />
              )}
              {(chartViewMode === 'combined' || chartViewMode === 'volume') && (
                <YAxis
                  yAxisId="volume"
                  orientation={chartViewMode === 'volume' ? 'left' : 'right'}
                  allowDecimals={false}
                  tick={{ fill: '#18181b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val: number) => `${val}`}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#fafafa',
                  fontSize: '12px',
                  direction: 'rtl',
                  textAlign: 'right',
                }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 700, marginBottom: '6px' }}
                formatter={(value: any, name: any) => {
                  const num = Number(value) || 0;
                  if (name === 'إجمالي الإيرادات (ج.م)') {
                    return [`${num.toLocaleString('ar-EG')} ج.م`, name];
                  }
                  if (name === 'حجم الطلبات اليومية') {
                    return [`${num} طلب`, name];
                  }
                  return [`${num.toLocaleString('ar-EG')} ج.م`, name];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              {(chartViewMode === 'combined' || chartViewMode === 'revenue') && (
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="totalRevenue"
                  name="إجمالي الإيرادات (ج.م)"
                  stroke="#10b981"
                  strokeWidth={2.75}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#059669' }}
                />
              )}
              {(chartViewMode === 'combined' || chartViewMode === 'volume') && (
                <Line
                  yAxisId="volume"
                  type="monotone"
                  dataKey="orderVolume"
                  name="حجم الطلبات اليومية"
                  stroke="#09090b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#09090b', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#27272a' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ORDER DENSITY HEATMAP & DRIVER RECRUITMENT ADVISOR (GOOGLE MAPS + GEMINI GROUNDING) */}
      <AdminOrderDensityHeatmap
        orders={filteredOrders}
        drivers={drivers}
        vendors={vendors}
      />

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

      {/* Customer Ratings & Reviews for Stores & Drivers */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>تقييمات العملاء للمحلات وكباتن التوصيل (Customer Ratings & Reviews)</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              تظهر هنا التقييمات والملاحظات التي يسجلها العميل بعد استلام الطلب لكل من المتجر والطيار
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md">
              <span className="text-zinc-600">الطلبات المقيّمة: </span>
              <strong className="text-amber-900 font-mono tabular-nums">
                {orders.filter((o) => o.vendorRating || o.driverRating).length} طلب
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders
            .filter((o) => o.vendorRating || o.driverRating)
            .map((ord) => (
              <div
                key={ord.id}
                className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/70 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                  <div>
                    <span className="font-mono font-bold text-zinc-950">{ord.orderNumber}</span>
                    <span className="text-zinc-500 mr-2">· العميل: {ord.customerName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {ord.ratedAt || ord.createdAt}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-white p-2.5 rounded border border-zinc-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span>المحل: {ord.vendorName}</span>
                      <span className="text-amber-600 font-mono">{ord.vendorRating || 5}/5 ★</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-normal">
                      {ord.vendorReview || 'تقييم بدون تعليق نصي'}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-zinc-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span>الكابتن: {ord.driverName || 'الطيار'}</span>
                      <span className="text-amber-600 font-mono">{ord.driverRating || 5}/5 ★</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-normal">
                      {ord.driverReview || 'تقييم بدون تعليق نصي'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Admin Orders Stream with Status Filtering System */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-950">
                سجل وإدارة الطلبات (Admin Orders Status Filtering)
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                تصفية فورية للطلبات حسب حالتها التشغيلية (Pending, In Transit, Delivered, Returning, Cancelled)
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToOrders && (
                <button
                  type="button"
                  onClick={onNavigateToOrders}
                  className="px-3 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  فتح شاشة إدارة الطلبات الكاملة ←
                </button>
              )}
            </div>
          </div>

          {/* Status Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'all', label: 'الكل (All)', count: filteredOrders.length },
                  {
                    id: 'pending',
                    label: 'قيد الانتظار والتجهيز (Pending)',
                    count: filteredOrders.filter((o) =>
                      matchesOrderCategoryFilter(o.status, 'pending')
                    ).length,
                  },
                  {
                    id: 'in_transit',
                    label: 'جاري التوصيل (In Transit)',
                    count: filteredOrders.filter((o) =>
                      matchesOrderCategoryFilter(o.status, 'in_transit')
                    ).length,
                  },
                  {
                    id: 'delivered',
                    label: 'تم التوصيل (Delivered)',
                    count: filteredOrders.filter((o) =>
                      matchesOrderCategoryFilter(o.status, 'delivered')
                    ).length,
                  },
                  {
                    id: 'returning',
                    label: 'مرتجع (Returning)',
                    count: filteredOrders.filter((o) =>
                      matchesOrderCategoryFilter(o.status, 'returning')
                    ).length,
                  },
                  {
                    id: 'cancelled',
                    label: 'ملغي (Cancelled)',
                    count: filteredOrders.filter((o) =>
                      matchesOrderCategoryFilter(o.status, 'cancelled')
                    ).length,
                  },
                ] as Array<{ id: OrderCategoryFilter; label: string; count: number }>
              ).map((pill) => {
                const active = orderCategoryFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setOrderCategoryFilter(pill.id);
                      setExactOrderStatus('all');
                    }}
                    className={`px-3 py-1.5 rounded-md font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                        active ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Exact Status Selector */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="بحث برقم الطلب أو العميل..."
                  className="bg-zinc-50 border border-zinc-200 rounded-md pr-7 pl-2.5 py-1.5 text-xs text-zinc-900 w-48 focus:outline-none focus:border-zinc-900"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-2" />
              </div>

              <select
                aria-label="تصفية حسب الحالة الفرعية الدقيقة"
                value={exactOrderStatus}
                onChange={(e) => setExactOrderStatus(e.target.value as OrderStatus | 'all')}
                className="bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-zinc-900"
              >
                <option value="all">كل الحالات الفرعية</option>
                <option value="pending_vendor">بانتظار تأكيد المحل (Pending Vendor)</option>
                <option value="preparing">جاري التجهيز (Preparing)</option>
                <option value="ready_for_driver">جاهز للاستلام (Ready for Driver)</option>
                <option value="driver_assigned">تم تعيين طيار (Driver Assigned)</option>
                <option value="picked_up_paid_store">في الطريق للعميل (Out for Delivery)</option>
                <option value="delivered">تم التوصيل (Delivered)</option>
                <option value="returning_to_vendor">مرتجع في الطريق للمحل (Returning)</option>
                <option value="returned_to_store">مرتجع وصل المحل (Returned to Store)</option>
                <option value="returned_completed">مرتجع مكتمل (Return Completed)</option>
                <option value="cancelled_by_vendor">ملغي من المحل (Cancelled by Vendor)</option>
                <option value="cancelled">ملغي (Cancelled)</option>
              </select>

              {(orderCategoryFilter !== 'all' ||
                exactOrderStatus !== 'all' ||
                orderSearchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderCategoryFilter('all');
                    setExactOrderStatus('all');
                    setOrderSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-md font-bold cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>مسح</span>
                </button>
              )}
            </div>
          </div>
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
                <th className="px-4 py-2.5 font-medium">تقييم المحل / الكابتن</th>
                <th className="px-4 py-2.5 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOrders
                .filter((ord) => {
                  if (!matchesOrderCategoryFilter(ord.status, orderCategoryFilter)) return false;
                  if (exactOrderStatus !== 'all' && ord.status !== exactOrderStatus) return false;
                  if (orderSearchQuery.trim()) {
                    const q = orderSearchQuery.trim().toLowerCase();
                    const hay = `${ord.orderNumber} ${ord.customerName} ${ord.customerArea} ${ord.vendorName} ${ord.driverName || ''}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                  }
                  return true;
                })
                .map((order) => {
                  const meta = ORDER_STATUS_META[order.status];
                  const totalComm =
                    order.status !== 'cancelled' && order.status !== 'cancelled_by_vendor'
                      ? order.vendorCommission +
                        (order.status === 'delivered' ? order.driverCommission : 0)
                      : 0;
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
                        {totalComm > 0 ? `+${totalComm.toFixed(1)} ج.م` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {order.vendorRating || order.driverRating ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono">
                              محل: {order.vendorRating || 5}★
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                              طيار: {order.driverRating || 5}★
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            meta?.badgeClass || 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {meta?.label || order.status}
                        </span>
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
