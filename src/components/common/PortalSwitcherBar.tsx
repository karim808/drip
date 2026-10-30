import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ShieldCheck,
  Store,
  Bike,
  ShoppingBag,
  UserPlus,
} from 'lucide-react';

export const PortalSwitcherBar: React.FC = () => {
  const {
    activePortal,
    setActivePortal,
  } = usePlatform();

  return (
    <aside
      aria-label="شريط التنقل بين بوابات النظام"
      className="bg-[#131517] text-[#f5f6f2] border-b border-[#303338] text-xs px-3 sm:px-6 py-2.5 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
              <span className="font-bold tracking-[0.2em] text-[#d1fe17] uppercase text-xs">DRIP FIT</span>
          </div>
          <span className="text-[#898A8B]">|</span>
          <span className="text-[#898A8B] hidden md:inline">نظام التوصيل السريع للأزياء والذمم المالية</span>
        </div>

        <div className="flex items-center gap-1 bg-[#1c1e21] p-1 rounded-lg border border-[#303338]">
          <button
            onClick={() => setActivePortal('customer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'customer'
                ? 'bg-[#d1fe17] text-[#131517] font-bold shadow-sm'
                : 'text-[#898A8B] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>المتجر (/store)</span>
          </button>

          <button
            onClick={() => setActivePortal('vendor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'vendor'
                ? 'bg-[#d1fe17] text-[#131517] font-bold shadow-sm'
                : 'text-[#898A8B] hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>بوابة المحل (/vendor)</span>
          </button>

          <button
            onClick={() => setActivePortal('driver')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'driver'
                ? 'bg-[#d1fe17] text-[#131517] font-bold shadow-sm'
                : 'text-[#898A8B] hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>تطبيق الكابتن (/driver)</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'admin'
                ? 'bg-[#d1fe17] text-[#131517] font-bold shadow-sm'
                : 'text-[#898A8B] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>الإدارة (/admin)</span>
          </button>

          <button
            onClick={() => setActivePortal('onboarding')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'onboarding'
                ? 'bg-[#d1fe17] text-[#131517] font-bold shadow-sm'
                : 'text-[#898A8B] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>انضمام الشركاء (/join)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
