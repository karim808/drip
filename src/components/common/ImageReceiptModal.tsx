import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { X, Check, Copy } from 'lucide-react';

export const ImageReceiptModal: React.FC = () => {
  const { previewImage, setPreviewImage, showToast } = usePlatform();

  if (!previewImage) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ المعرف بنجاح', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#131517]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div>
            <h3 className="font-bold text-white text-sm">{previewImage.title}</h3>
            {previewImage.subtitle && (
              <p className="text-xs text-[#898A8B] mt-0.5">{previewImage.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className="p-1 rounded-md text-[#898A8B] hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Content Container */}
        <div className="p-4 bg-white/[0.06] flex items-center justify-center min-h-[360px] max-h-[75vh] overflow-y-auto">
          <div className="max-w-md w-full rounded-md shadow-md border border-white/15 overflow-hidden bg-[#1A1C1F]">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="w-full h-auto max-h-[65vh] object-contain block mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#1A1C1F] flex items-center justify-between text-xs">
          <span className="text-[#898A8B]">تم الفحص عبر خوادم التدقيق المالي</span>
          <button
            onClick={() => setPreviewImage(null)}
            className="px-4 py-1.5 bg-[#D1FE17] text-[#131517] font-medium rounded-md hover:bg-white transition-colors"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};
