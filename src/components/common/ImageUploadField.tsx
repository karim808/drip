import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Camera,
  RotateCw,
  Link as LinkIcon,
  FileCheck,
} from 'lucide-react';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label: string;
  helperText?: string;
  required?: boolean;
  accept?: string;
  allowUrlFallback?: boolean;
  enableUrlInput?: boolean;
  className?: string;
  previewHeightClass?: string;
  placeholderText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label,
  helperText,
  required = false,
  accept = 'image/*',
  allowUrlFallback = true,
  enableUrlInput,
  className = '',
  previewHeightClass = 'h-40',
  placeholderText = 'اضغط لاختيار صورة من هاتفك أو جهازك (أو اسحبها هنا)',
}) => {
  const isUrlAllowed = enableUrlInput !== undefined ? enableUrlInput : allowUrlFallback;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('حدث خطأ أثناء قراءة الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 text-right ${className}`}>
      {/* Label and Status */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-white">
          {label}
          {required && <span className="text-red-400 mr-1">*</span>}
        </label>
        {value ? (
          <span className="text-[10px] text-[#D1FE17] font-bold flex items-center gap-1 bg-[#D1FE17]/10 px-2 py-0.5 rounded border border-[#D1FE17]/25">
            <Check className="w-3 h-3" />
            <span>تم رفع الصورة بنجاح</span>
          </span>
        ) : required ? (
          <span className="text-[10px] text-red-400 font-medium">مطلوب</span>
        ) : null}
      </div>

      {helperText && (
        <p className="text-[11px] text-[#898A8B] leading-normal">{helperText}</p>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Container */}
      {value ? (
        /* Image Preview State */
        <div className="relative border border-white/15 rounded-lg overflow-hidden bg-[#131517]/5 group transition-all">
          <div className={`w-full ${previewHeightClass} flex items-center justify-center overflow-hidden bg-white/[0.06]`}>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover transition-transform group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Action overlay bar */}
          <div className="p-2.5 bg-[#1A1C1F] border-t border-white/10 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-white/70 truncate">
              <FileCheck className="w-4 h-4 text-[#D1FE17] shrink-0" />
              <span className="truncate text-[11px] font-mono">
                {value.startsWith('data:') ? 'صورة مرفوعة من الجهاز (Base64)' : value.slice(0, 36) + '...'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/15 text-white/90 rounded font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                <span>تغيير</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                title="حذف الصورة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Upload Prompt State */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#D1FE17] bg-white/[0.06]'
              : 'border-white/15 hover:border-white/10 bg-white/[0.03] hover:bg-white/10'
          }`}
        >
          {isProcessing ? (
            <div className="py-4 space-y-2">
              <div className="w-6 h-6 border-2 border-[#D1FE17] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-bold text-white/80">جاري قراءة وضغط الصورة...</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#1A1C1F] border border-white/10 text-white/80 flex items-center justify-center mx-auto shadow-2xs">
                <Camera className="w-5 h-5 text-white/90" />
              </div>
              <div className="text-xs font-bold text-white">
                {placeholderText}
              </div>
              <div className="text-[11px] text-[#898A8B]">
                يدعم التقاط الكاميرا على الهاتف، ألبوم الصور، وسحب الملفات (JPG, PNG)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alternative URL Fallback toggle */}
      {isUrlAllowed && !value && (
        <div className="pt-1">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-[11px] text-[#898A8B] hover:text-white underline flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              <span>أو إدخال رابط صورة مباشرة من الإنترنت</span>
            </button>
          ) : (
            <div className="flex gap-1.5 mt-1">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                className="flex-1 p-2 text-xs border border-white/15 rounded focus:outline-none focus:border-[#D1FE17] font-mono"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-[#D1FE17] text-[#131517] rounded text-xs font-bold hover:bg-white"
              >
                تطبيق
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-2 py-1.5 text-[#898A8B] hover:text-white/90 text-xs"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
