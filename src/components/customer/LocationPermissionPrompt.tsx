import React from 'react';
import { Navigation, MapPin, AlertCircle, Compass, Loader2 } from 'lucide-react';

interface LocationPermissionPromptProps {
  state: 'prompt' | 'locating' | 'denied';
  onUseGps: () => void;
  onEnterManually: () => void;
  onDismiss: () => void;
  errorMessage?: string;
  isArabic: boolean;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  state,
  onUseGps,
  onEnterManually,
  onDismiss,
  errorMessage,
  isArabic,
}) => {
  return (
    <div
      className="location-permission-card relative overflow-hidden rounded-2xl border border-[#232A26] bg-[#0E1110] p-6 shadow-2xl transition-all"
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #121614 0%, #0A0D0C 100%)',
      }}
    >
      {/* Decorative neon accent strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D1FE17] to-transparent opacity-80" />

      {state === 'locating' ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-full bg-[#D1FE17]/10 border border-[#D1FE17]/30 flex items-center justify-center animate-pulse">
              <Loader2 className="w-7 h-7 text-[#D1FE17] animate-spin" />
            </div>
            <span className="absolute -inset-1 rounded-full bg-[#D1FE17]/20 blur-sm animate-ping pointer-events-none" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#D1FE17] font-mono">
            {isArabic ? 'جاري تحديد موقعك...' : 'LOCATING YOU...'}
          </h3>
          <p className="text-xs text-[#8E9B93] mt-1.5 max-w-sm">
            {isArabic
              ? 'نتصل بالأقمار الصناعية وشبكة المحمول لحساب أقرب فرع ووقت التوصيل الفعلي.'
              : 'Connecting to satellite and cell network to match your nearest partner boutique.'}
          </p>
        </div>
      ) : state === 'denied' ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block mb-0.5">
                {isArabic ? 'إذن الموقع غير متاح' : 'LOCATION ACCESS DISABLED'}
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-white font-sans">
                {isArabic ? 'لم نتمكن من الوصول لموقعك' : 'COULD NOT DETECT GPS'}
              </h3>
              <p className="text-xs text-[#8E9B93] mt-1 leading-relaxed">
                {errorMessage ||
                  (isArabic
                    ? 'تم رفض إذن الوصول إلى الموقع في المتصفح. يمكنك اختيار حيك السكني يدوياً لاكتشاف أقرب متجر.'
                    : 'Location access was disabled in browser settings. You can enter your neighborhood manually to discover nearest stores.')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onEnterManually}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D1FE17] hover:bg-[#bce414] text-[#0C0F0E] font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(209,254,23,0.3)] active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>{isArabic ? 'إدخال الموقع يدوياً' : 'ENTER LOCATION MANUALLY'}</span>
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-3 rounded-xl bg-[#181D1A] hover:bg-[#202723] text-white/70 hover:text-white border border-[#262F29] text-xs font-mono font-bold uppercase tracking-wider transition-all"
            >
              {isArabic ? 'متابعة التصفح' : 'CONTINUE BROWSING'}
            </button>
          </div>
        </div>
      ) : (
        /* Default 'prompt' state */
        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#D1FE17]/10 border border-[#D1FE17]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(209,254,23,0.15)]">
              <Compass className="w-5 h-5 text-[#D1FE17]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1FE17] font-bold block mb-0.5">
                {isArabic ? 'رادار فروع فاست دريب' : 'FAST DRIP RADAR NETWORK'}
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-white font-sans">
                {isArabic ? 'اكتشف أقرب ستور لك' : 'FIND YOUR FAST DRIP'}
              </h3>
              <p className="text-xs text-[#8E9B93] mt-1 leading-relaxed">
                {isArabic
                  ? 'اسمح بالوصول إلى موقعك لعرض أقرب فروع الشركاء وحساب وقت التوصيل الفعلي لبابك.'
                  : 'Allow location access to discover the closest partner stores and get accurate delivery estimates.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onUseGps}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D1FE17] hover:bg-[#bce414] text-[#0C0F0E] font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(209,254,23,0.35)] active:scale-95"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>{isArabic ? 'استخدام موقعي الحالي' : 'USE MY CURRENT LOCATION'}</span>
            </button>
            <button
              type="button"
              onClick={onEnterManually}
              className="px-4 py-3 rounded-xl bg-[#181D1A] hover:bg-[#202723] text-white/90 hover:text-white border border-[#262F29] hover:border-[#D1FE17]/40 text-xs font-mono font-bold uppercase tracking-wider transition-all"
            >
              {isArabic ? 'إدخال الموقع يدوياً' : 'ENTER LOCATION MANUALLY'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
