import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ShieldCheck,
  Store,
  Bike,
  Lock,
  Mail,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';

interface PortalAuthGateProps {
  portal: 'admin' | 'vendor' | 'driver';
  children: React.ReactNode;
}

export const PortalAuthGate: React.FC<PortalAuthGateProps> = ({ portal, children }) => {
  const {
    isAdminAuthenticated,
    loginAdmin,
    isVendorAuthenticated,
    loginVendor,
    isDriverAuthenticated,
    loginDriver,
    setActivePortal,
    setOnboardingType,
  } = usePlatform();

  // Admin Login Inputs (No pre-filled credentials or quick-login shortcuts)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vendor Login Inputs
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');

  // Driver Login Inputs
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPassword, setDriverPassword] = useState('');

  if (portal === 'admin' && isAdminAuthenticated) return <>{children}</>;
  if (portal === 'vendor' && isVendorAuthenticated) return <>{children}</>;
  if (portal === 'driver' && isDriverAuthenticated) return <>{children}</>;

  // 1. ADMIN LOGIN SCREEN
  if (portal === 'admin') {
    const handleAdminSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      await loginAdmin(adminEmail, adminPassword);
      setIsSubmitting(false);
    };

    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  VOGUE FAST // ADMIN
                </h1>
                <p className="text-xs text-zinc-400">بوابة الإدارة العليا والخزنة المالية</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
              /admin
            </span>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">
                البريد الإلكتروني للإدارة:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="name@voguefast.eg"
                  className="w-full pr-9 pl-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">كلمة المرور:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pr-9 pl-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <span>{isSubmitting ? 'جاري التحقق من الصلاحية...' : 'تسجيل الدخول للخزنة والإدارة'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. VENDOR POS LOGIN SCREEN
  if (portal === 'vendor') {
    const handleVendorSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      await loginVendor(vendorEmail, vendorPassword);
      setIsSubmitting(false);
    };

    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-zinc-950">بوابة المتجر والبراند (POS)</h1>
                <p className="text-xs text-zinc-500">إدارة الطلبات، الكتالوج، والمحفظة المالية</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-1 rounded border border-zinc-200">
              /vendor
            </span>
          </div>

          <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1.5">
                البريد الإلكتروني للمتجر:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  placeholder="store@voguefast.eg"
                  className="w-full pr-9 pl-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-950 font-mono focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1.5">كلمة المرور:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={vendorPassword}
                  onChange={(e) => setVendorPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-950 font-mono focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول لبوابة المتجر'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">براند أزياء جديد؟</span>
            <button
              type="button"
              onClick={() => {
                setOnboardingType('vendor');
                setActivePortal('onboarding');
              }}
              className="font-bold text-zinc-950 hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>قدم طلب انضمام متجر</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. DRIVER APP LOGIN SCREEN
  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    await loginDriver(driverEmail, driverPassword);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bike className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">تطبيق كباتن VOGUE FAST</h1>
              <p className="text-xs text-zinc-400">رادار التوصيل السريع والمحفظة النقدية</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
            /driver
          </span>
        </div>

        <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1.5">البريد الإلكتروني للكابتن:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={driverEmail}
                onChange={(e) => setDriverEmail(e.target.value)}
                placeholder="captain@voguefast.eg"
                className="w-full pr-9 pl-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1.5">كلمة المرور:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-9 pl-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'جاري التحقق...' : 'تشغيل رادار الكابتن'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">ترغب بالانضمام ككابتن توصيل؟</span>
          <button
            type="button"
            onClick={() => {
              setOnboardingType('driver');
              setActivePortal('onboarding');
            }}
            className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>سجل بياناتك وأوراقك الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
