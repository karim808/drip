import React, { useState, useMemo } from 'react';
import { Search, MapPin, X, Navigation, Building2, Check, Loader2 } from 'lucide-react';
import { EGYPT_PRESETS, EgyptPreset } from '../../utils/geolocation';

interface ManualLocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: {
    coords: { lat: number; lng: number };
    address: string;
    areaName: string;
  }) => void;
  currentAddress?: string;
  isArabic: boolean;
}

export const ManualLocationSearchModal: React.FC<ManualLocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentAddress = '',
  isArabic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<
    Array<{ name: string; lat: number; lng: number }>
  >([]);

  // Filter preset locations
  const filteredPresets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return EGYPT_PRESETS;

    return EGYPT_PRESETS.filter((p) => {
      const arMatch = p.nameAr.toLowerCase().includes(term);
      const enMatch = p.nameEn.toLowerCase().includes(term);
      const landmarkMatch = p.landmark ? p.landmark.toLowerCase().includes(term) : false;
      return arMatch || enMatch || landmarkMatch;
    });
  }, [searchTerm]);

  // Online geocoding search for unlisted streets or specific compounds
  const handleOnlineSearch = async (query: string) => {
    if (!query || query.length < 3) return;
    setIsSearchingOnline(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query + ', Egypt'
        )}&format=json&limit=5&accept-language=${isArabic ? 'ar' : 'en'}`
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
        setOnlineResults(mapped);
      }
    } catch {
      setOnlineResults([]);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0E1110] border border-[#232A26] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2521] bg-[#141816]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D1FE17]/10 border border-[#D1FE17]/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#D1FE17]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {isArabic ? 'اختر موقع التوصيل' : 'CHOOSE DELIVERY LOCATION'}
              </h3>
              <p className="text-[11px] text-[#8E9B93]">
                {isArabic
                  ? 'ابحث عن منطقتك لاكتشاف أقرب متجر وحساب وقت التوصيل بدقة'
                  : 'Search your neighborhood to find closest store and precise ETA'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#1E2521] bg-[#0A0D0C]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8E9B93] absolute left-3.5 rtl:left-auto rtl:right-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 2) {
                  // Debounce online search
                  const q = e.target.value;
                  setTimeout(() => handleOnlineSearch(q), 500);
                } else {
                  setOnlineResults([]);
                }
              }}
              placeholder={
                isArabic
                  ? 'ابحث بالحي أو المعلم (مثلاً: الكوربة، دجلة، أركان، التجمع)...'
                  : 'Search district or landmark (e.g. Korba, Degla, Arkan, New Cairo)...'
              }
              autoFocus
              className="w-full bg-[#141816] border border-[#232A26] focus:border-[#D1FE17] rounded-xl px-10 py-3 text-xs text-white placeholder-[#5E6D64] outline-none transition-all font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setOnlineResults([]);
                }}
                className="absolute right-3.5 rtl:right-auto rtl:left-3.5 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isSearchingOnline && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#8E9B93]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D1FE17]" />
              <span>{isArabic ? 'جاري البحث في خريطة مصر...' : 'Searching Egyptian locations...'}</span>
            </div>
          )}

          {/* Online Geocoding Results (if any) */}
          {onlineResults.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1FE17] px-2 mb-1 block">
                {isArabic ? 'نتائج البحث الدقيق' : 'SPECIFIC ADDRESS MATCHES'}
              </span>
              <div className="space-y-1">
                {onlineResults.map((res, i) => (
                  <button
                    key={`online-${i}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        coords: { lat: res.lat, lng: res.lng },
                        address: res.name,
                        areaName: res.name.split(',')[0] || res.name,
                      });
                      onClose();
                    }}
                    className="w-full text-start flex items-center justify-between p-3 rounded-xl bg-[#141816] hover:bg-[#1C221F] border border-[#232A26] hover:border-[#D1FE17]/60 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Navigation className="w-4 h-4 text-[#D1FE17] shrink-0" />
                      <span className="text-xs text-white truncate font-medium">{res.name}</span>
                    </div>
                    <span className="text-[10px] text-[#D1FE17] opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0">
                      {isArabic ? 'اختيار ➔' : 'SELECT ➔'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Districts List */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E9B93] px-2 mb-1.5 block">
              {isArabic ? 'المناطق والأحياء المدعومة' : 'SUPPORTED DISTRICTS & HUBS'}
            </span>
            <div className="space-y-1.5">
              {filteredPresets.map((preset: EgyptPreset, idx: number) => {
                const isSelected =
                  currentAddress.includes(preset.nameEn) ||
                  currentAddress.includes(preset.nameAr);

                return (
                  <button
                    key={`preset-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        coords: { lat: preset.lat, lng: preset.lng },
                        address: isArabic ? preset.nameAr : preset.nameEn,
                        areaName: isArabic ? preset.nameAr : preset.nameEn,
                      });
                      onClose();
                    }}
                    className={`w-full text-start flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#D1FE17]/10 border-[#D1FE17] text-white shadow-[0_0_15px_rgba(209,254,23,0.15)]'
                        : 'bg-[#121614] hover:bg-[#181D1A] border-[#1E2521] hover:border-[#D1FE17]/50 text-white/90'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <Building2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? 'text-[#D1FE17]' : 'text-[#8E9B93]'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {isArabic ? preset.nameAr : preset.nameEn}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#D1FE17] text-[#0C0F0E] rounded font-mono font-black">
                              {isArabic ? 'الحالي' : 'ACTIVE'}
                            </span>
                          )}
                        </div>
                        {preset.landmark && (
                          <p className="text-[10px] text-[#7E8B83] mt-0.5">
                            {isArabic ? `معالم: ${preset.landmark}` : `Landmarks: ${preset.landmark}`}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-[#D1FE17] shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono text-[#8E9B93] group-hover:text-[#D1FE17] shrink-0">
                        {isArabic ? 'تحديد' : 'SELECT'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E2521] bg-[#0A0D0C] flex items-center justify-between text-[11px] text-[#8E9B93]">
          <span>{isArabic ? 'شحن فوري لبابك داخل القاهرة والجيزة' : 'Direct courier dispatch across Cairo & Giza'}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/70 hover:text-white px-3 py-1 rounded bg-[#181D1A] border border-[#232A26]"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
