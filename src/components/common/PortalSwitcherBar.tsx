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
      className="bg-zinc-950 text-zinc-200 border-b border-zinc-800 text-xs px-3 sm:px-6 py-2 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-white uppercase text-xs">VOGUE FAST</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400 hidden md:inline">نظام التوصيل السريع للأزياء والذمم المالية</span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
          <button
            onClick={() => setActivePortal('customer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'customer'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>المتجر (/store)</span>
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
            <span>بوابة المحل (/vendor)</span>
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
            <span>تطبيق الكابتن (/driver)</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activePortal === 'admin'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>الإدارة (/admin)</span>
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
            <span>انضمام الشركاء (/join)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
