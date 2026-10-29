import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UserPortal } from '../../types';
import {
  ShieldCheck,
  Store,
  Bike,
  ShoppingBag,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';

export const PortalSwitcherBar: React.FC = () => {
  const {
    activePortal,
    setActivePortal,
    vendors,
    drivers,
    activeVendorId,
    setActiveVendorId,
    activeDriverId,
    setActiveDriverId,
    settlements,
  } = usePlatform();

  const pendingSettlementsCount = settlements.filter((s) => s.status === 'pending').length;
  const pendingVendorsCount = vendors.filter((v) => v.status === 'pending').length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'pending').length;
  const totalAdminAlerts = pendingSettlementsCount + pendingVendorsCount + pendingDriversCount;

  const currentVendor = vendors.find((v) => v.id === activeVendorId);
  const currentDriver = drivers.find((d) => d.id === activeDriverId);

  return (
    <aside aria-label="شريط المعاينة والتبديل بين بوابات النظام" className="bg-zinc-950 text-zinc-200 border-b border-zinc-800 text-xs px-3 sm:px-6 py-2 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Prototype Label */}
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-white uppercase text-xs">VOGUE FAST</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400 hidden md:inline">نظام التوصيل السريع للأزياء والذمم المالية</span>
        </div>

        {/* Portal Switching Segmented Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
          <button
            onClick={() => setActivePortal('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'admin'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة الإدارة العليا</span>
            {totalAdminAlerts > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                {totalAdminAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePortal('vendor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'vendor'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>بوابة المحل (POS)</span>
            {currentVendor?.status === 'frozen' && (
              <span className="bg-red-600 text-white text-[10px] px-1 py-0.2 rounded font-bold">
                مجمد
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePortal('driver')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'driver'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>تطبيق الطيار</span>
            {currentDriver?.status === 'frozen' && (
              <span className="bg-red-600 text-white text-[10px] px-1 py-0.2 rounded font-bold">
                تجاوز الحد
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePortal('customer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'customer'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>واجهة العميل (متجر)</span>
          </button>

          <button
            onClick={() => setActivePortal('onboarding')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'onboarding'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>تسجيل جديد</span>
          </button>
        </div>

        {/* Dynamic Context Selector (Switch which Vendor or Driver to preview) */}
        <div className="flex items-center gap-3">
          {activePortal === 'vendor' && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="hidden sm:inline">المحل النشط:</span>
              <select
                aria-label="المحل النشط للمعاينة"
                value={activeVendorId}
                onChange={(e) => setActiveVendorId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-500"
              >
                {vendors
                  .filter((v) => v.status !== 'pending')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.area}) {v.status === 'frozen' ? '⚠️ مجمد' : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {activePortal === 'driver' && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="hidden sm:inline">الطيار النشط:</span>
              <select
                aria-label="الطيار النشط للمعاينة"
                value={activeDriverId}
                onChange={(e) => setActiveDriverId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-0.5 text-xs focus:outline-none focus:border-zinc-500"
              >
                {drivers
                  .filter((d) => d.status !== 'pending')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.area}) {d.status === 'frozen' ? '⚠️ موقوف' : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
