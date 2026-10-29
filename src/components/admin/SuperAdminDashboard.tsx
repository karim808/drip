import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  TrendingUp,
  Landmark,
  Store,
  Bike,
  Settings,
  ShieldCheck,
  Bell,
  ChevronLeft,
  KeyRound,
} from 'lucide-react';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettlements } from './AdminSettlements';
import { AdminVendors } from './AdminVendors';
import { AdminDrivers } from './AdminDrivers';
import { AdminSettings } from './AdminSettings';
import { AdminCredentials } from './AdminCredentials';

type AdminSection = 'analytics' | 'settlements' | 'vendors' | 'drivers' | 'credentials' | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const { settlements, vendors, drivers, customers } = usePlatform();
  const [activeSection, setActiveSection] = useState<AdminSection>('analytics');

  const pendingSettlementsCount = settlements.filter((s) => s.status === 'pending').length;
  const pendingVendorsCount = vendors.filter((v) => v.status === 'pending').length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'pending').length;

  const sectionTitles: Record<AdminSection, string> = {
    analytics: 'النظرة العامة والإحصائيات المالية',
    settlements: 'خزنة التحصيل واعتماد السدادات',
    vendors: 'إدارة البراندات ومحلات الأزياء',
    drivers: 'إدارة أسطول كباتن التوصيل',
    credentials: 'سجل الحسابات وكلمات المرور (Users & Passwords)',
    settings: 'إعدادات التسعير والخزنة والمحافظ',
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Right Sidebar (Zinc-950 Monochrome Stripe/Shopify Admin) */}
      <aside className="w-full md:w-64 bg-zinc-950 text-zinc-300 md:min-h-screen flex flex-col justify-between border-l border-zinc-800 shrink-0">
        <div>
          {/* Admin Wordmark / Logo */}
          <div className="p-5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 text-white font-bold tracking-tight text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>VOGUE FAST</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">
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
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>النظرة العامة والإحصائيات</span>
              </div>
            </button>

            {/* 2. Settlements Vault (Most Important) */}
            <button
              onClick={() => setActiveSection('settlements')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'settlements'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>خزنة التحصيل والموافقات</span>
              </div>
              {pendingSettlementsCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingSettlementsCount}
                </span>
              )}
            </button>

            {/* 3. Vendors */}
            <button
              onClick={() => setActiveSection('vendors')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'vendors'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4" />
                <span>إدارة البراندات والمحلات</span>
              </div>
              {pendingVendorsCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingVendorsCount}
                </span>
              )}
            </button>

            {/* 4. Drivers */}
            <button
              onClick={() => setActiveSection('drivers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'drivers'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bike className="w-4 h-4" />
                <span>إدارة أسطول الطيارين</span>
              </div>
              {pendingDriversCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingDriversCount}
                </span>
              )}
            </button>

            {/* 5. Users & Passwords (Directory & Quick Impersonate) */}
            <button
              onClick={() => setActiveSection('credentials')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'credentials'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>الحسابات وكلمات المرور</span>
              </div>
              <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {vendors.length + drivers.length + customers.length}
              </span>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeSection === 'settings'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>إعدادات التسعير والخزنة</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Admin User Footer Card */}
        <div className="p-4 border-t border-zinc-900 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div>
              <div className="font-bold text-zinc-200">المدير العام المالي</div>
              <div className="text-[10px] text-zinc-500 font-mono">admin@voguefast.eg</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Workspace Sub-header */}
        <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">لوحة الإدارة</span>
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">
              {sectionTitles[activeSection]}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded font-mono">
              النظام المالي: نشط ولحظي
            </span>
          </div>
        </header>

        {/* Active Section Content */}
        <div className="p-6">
          {activeSection === 'analytics' && <AdminAnalytics />}
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
