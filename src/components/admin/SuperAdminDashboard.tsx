import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  TrendingUp,
  Landmark,
  Store,
  Bike,
  Settings,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
  LogOut,
  ExternalLink,
  Package,
} from 'lucide-react';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminOrders } from './AdminOrders';
import { AdminSettlements } from './AdminSettlements';
import { AdminVendors } from './AdminVendors';
import { AdminDrivers } from './AdminDrivers';
import { AdminSettings } from './AdminSettings';
import { AdminCredentials } from './AdminCredentials';

type AdminSection = 'analytics' | 'orders' | 'settlements' | 'vendors' | 'drivers' | 'credentials' | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const { settlements, vendors, drivers, customers, orders, logoutAdmin } = usePlatform();
  const [activeSection, setActiveSection] = useState<AdminSection>('analytics');

  const pendingSettlementsCount = settlements.filter((s) => s.status === 'pending').length;
  const pendingVendorsCount = vendors.filter((v) => v.status === 'pending').length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'pending').length;
  const activeOrdersCount = orders.filter(
    (o) =>
      o.status !== 'delivered' &&
      o.status !== 'returned_completed' &&
      o.status !== 'cancelled' &&
      o.status !== 'cancelled_by_vendor'
  ).length;

  const sectionTitles: Record<AdminSection, string> = {
    analytics: 'النظرة العامة والإحصائيات المالية',
    orders: 'إدارة ومتابعة الطلبات وتصفية الحالات',
    settlements: 'خزنة التحصيل واعتماد السدادات',
    vendors: 'إدارة البراندات ومحلات الأزياء',
    drivers: 'إدارة أسطول كباتن التوصيل',
    credentials: 'سجل الحسابات وكلمات المرور والروابط المستقلة',
    settings: 'إعدادات التسعير والخزنة والمحافظ',
  };

  return (
    <div className="min-h-screen bg-[#131517] flex flex-col md:flex-row">
      {/* Right Sidebar (Zinc-950 Monochrome Stripe/Shopify Admin) */}
      <aside className="w-full md:w-64 bg-[#131517] text-white/75 md:min-h-screen flex flex-col justify-between border-l border-white/10 shrink-0">
        <div>
          {/* Admin Wordmark / Logo */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-2 text-white font-bold tracking-tight text-base">
                <span className="font-display text-xl text-[#D1FE17]">DRIP FIT</span>
            </div>
            <div className="text-[11px] text-[#898A8B] mt-1 font-mono">
              FINANCIAL VAULT & OS
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-xs">
            {/* 1. Analytics */}
            <button
              onClick={() => setActiveSection('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'analytics'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>النظرة العامة والإحصائيات</span>
              </div>
            </button>

            {/* 1.5 Orders Management & Status Filtering */}
            <button
              onClick={() => setActiveSection('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'orders'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-white/80" />
                <span>إدارة ومتابعة الطلبات</span>
              </div>
              <span className="bg-[#D1FE17] text-[#131517] text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {activeOrdersCount > 0 ? activeOrdersCount : orders.length}
              </span>
            </button>

            {/* 2. Settlements Vault (Most Important) */}
            <button
              onClick={() => setActiveSection('settlements')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'settlements'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-[#D1FE17]" />
                <span>خزنة التحصيل والموافقات</span>
              </div>
              {pendingSettlementsCount > 0 && (
                <span className="bg-[#D1FE17] text-[#131517] text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingSettlementsCount}
                </span>
              )}
            </button>

            {/* 3. Vendors */}
            <button
              onClick={() => setActiveSection('vendors')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'vendors'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4" />
                <span>إدارة البراندات والمحلات</span>
              </div>
              {pendingVendorsCount > 0 && (
                <span className="bg-amber-400 text-[#131517] text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingVendorsCount}
                </span>
              )}
            </button>

            {/* 4. Drivers */}
            <button
              onClick={() => setActiveSection('drivers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'drivers'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bike className="w-4 h-4" />
                <span>إدارة أسطول الطيارين</span>
              </div>
              {pendingDriversCount > 0 && (
                <span className="bg-amber-400 text-[#131517] text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingDriversCount}
                </span>
              )}
            </button>

            {/* 5. Users & Passwords (Directory & Quick Impersonate) */}
            <button
              onClick={() => setActiveSection('credentials')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'credentials'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>الحسابات والروابط المستقلة</span>
              </div>
              <span className="bg-[#1C1E21] text-white/75 border border-white/15 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {vendors.length + drivers.length + customers.length}
              </span>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'settings'
                  ? 'bg-[#1C1E21] text-white font-bold'
                  : 'text-[#898A8B] hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>إعدادات التسعير والخزنة</span>
              </div>
            </button>
          </nav>

          {/* Unified Single-Domain Portal Routes Box */}
          <div className="mx-3 mt-4 p-3 rounded-lg bg-[#1A1C1F]/90 border border-white/10 space-y-2 text-[11px]">
            <div className="font-bold text-white/75">مسارات المنصة الموحدة:</div>
            <div className="space-y-1">
              <a
                href="/store"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-[#898A8B] hover:text-white py-1 px-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span>متجر العملاء (/store)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/vendor"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-[#898A8B] hover:text-white py-1 px-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span>بوابة التاجر (/vendor)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/driver"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-[#898A8B] hover:text-white py-1 px-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span>تطبيق الكابتن (/driver)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/join"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-[#898A8B] hover:text-white py-1 px-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span>انضمام الشركاء (/join)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/join/vendor"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-[#898A8B] hover:text-white py-1 px-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span>تسجيل متجر (/join/vendor)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/join/driver"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-[#898A8B] hover:text-white py-1 px-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span>تسجيل كابتن (/join/driver)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Admin User Footer Card */}
        <div className="p-4 border-t border-white/10 text-xs text-[#898A8B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1C1E21] flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div>
              <div className="font-bold text-white/90">المدير العام المالي</div>
              <div className="text-[10px] text-[#898A8B] font-mono">admin@voguefast.eg</div>
            </div>
          </div>
          <button
            onClick={logoutAdmin}
            title="تسجيل الخروج"
            className="p-1.5 rounded hover:bg-white/10 text-[#898A8B] hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Workspace Sub-header */}
        <header className="h-14 border-b border-white/10 bg-[#1A1C1F] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#898A8B]">لوحة الإدارة</span>
            <ChevronLeft className="w-3.5 h-3.5 text-[#898A8B]" />
            <span className="font-bold text-white">
              {sectionTitles[activeSection]}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/[0.06] text-white/90 px-2.5 py-1 rounded font-mono">
              النظام المالي: نشط ولحظي
            </span>
          </div>
        </header>

        {/* Active Section Content */}
        <div className="p-6">
          {activeSection === 'analytics' && (
            <AdminAnalytics onNavigateToOrders={() => setActiveSection('orders')} />
          )}
          {activeSection === 'orders' && <AdminOrders />}
          {activeSection === 'settlements' && <AdminSettlements />}
          {activeSection === 'vendors' && <AdminVendors />}
          {activeSection === 'drivers' && <AdminDrivers />}
          {activeSection === 'credentials' && <AdminCredentials />}
          {activeSection === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};
