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
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-zinc-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-zinc-50">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">{previewImage.title}</h3>
            {previewImage.subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5">{previewImage.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Content Container */}
        <div className="p-4 bg-zinc-100 flex items-center justify-center min-h-[360px] max-h-[75vh] overflow-y-auto">
          <div className="max-w-md w-full rounded-md shadow-md border border-zinc-300 overflow-hidden bg-white">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="w-full h-auto max-h-[65vh] object-contain block mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 bg-white flex items-center justify-between text-xs">
          <span className="text-zinc-500">تم الفحص عبر خوادم التدقيق المالي</span>
          <button
            onClick={() => setPreviewImage(null)}
            className="px-4 py-1.5 bg-zinc-950 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};
