import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Settings,
  Save,
  Calculator,
  Smartphone,
  CreditCard,
  Building,
  RotateCcw,
  Check,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { pricingConfig, updatePricingConfig, calculateDeliveryFee } = usePlatform();

  const [formData, setFormData] = useState({ ...pricingConfig });
  const [simKm, setSimKm] = useState<number>(14);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig(formData);
  };

  // Simulation calculations based on current inputs
  const extraKm = Math.max(0, simKm - formData.baseKm);
  const simDeliveryFee = Math.round(formData.baseFare + extraKm * formData.extraKmRate);
  const simDriverCut = Math.round(simDeliveryFee * (formData.driverCommissionRate / 100));
  const simDriverNetProfit = simDeliveryFee - simDriverCut;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">
            إعدادات التسعير، الخزنة، وحسابات التحصيل (Pricing & Vault Settings)
          </h2>
          <p className="text-xs text-[#898A8B] mt-1">
            ضبط معادلة احتساب مشاوير التوصيل بالكيلومتر وأرقام المحافظ المعتمدة لسداد مديونيات المحلات والطيارين
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Delivery Distance Formula */}
          <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <Calculator className="w-4 h-4 text-white" />
              <h3 className="font-bold text-sm text-white">
                1. معادلة تسعير التوصيل السريع بالكيلومتر (Delivery Fare Formula)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  فتحة العداد (Base Fare ج.م):
                </label>
                <input
                  type="number"
                  name="baseFare"
                  min="0"
                  step="1"
                  value={formData.baseFare}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">السعر المبدئي لأي مشوار</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  المسافة المشمولة بفتحة العداد (كم):
                </label>
                <input
                  type="number"
                  name="baseKm"
                  min="0"
                  step="0.5"
                  value={formData.baseKm}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">أول X كيلومتر مجاناً مع الفتحة</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  سعر الكيلو الإضافي (ج.م / كم):
                </label>
                <input
                  type="number"
                  name="extraKmRate"
                  min="0"
                  step="0.5"
                  value={formData.extraKmRate}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">عن كل كيلو إضافي فوق المشمول</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/[0.03] border border-white/10 rounded text-xs text-white/70">
              <span className="font-bold text-white">المعادلة المبرمجة:</span> سعر التوصيل ={' '}
              {formData.baseFare} ج.م + (المسافة بالكم - {formData.baseKm}) × {formData.extraKmRate} ج.م
            </div>
          </div>

          {/* Section 2: Platform Commission & Default Limits */}
          <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <CreditCard className="w-4 h-4 text-white" />
              <h3 className="font-bold text-sm text-white">
                2. نسب عمولات المنصة وسقوف المديونية الافتراضية
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  عمولة المنصة من سعر التوصيل للطيار (%):
                </label>
                <input
                  type="number"
                  name="driverCommissionRate"
                  min="0"
                  max="50"
                  step="1"
                  value={formData.driverCommissionRate}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">تُسجل كمديونية على الطيار لكل مشوار ناجح</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  سقف مديونية الطيار الافتراضي (ج.م):
                </label>
                <input
                  type="number"
                  name="defaultDriverLimit"
                  min="200"
                  step="100"
                  value={formData.defaultDriverLimit}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">يتوقف حسابه فوراً إذا بلغت مديونيته هذا المبلغ</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  عمولة المنصة الافتراضية للمحلات (%):
                </label>
                <input
                  type="number"
                  name="defaultVendorCommissionRate"
                  min="5"
                  max="40"
                  step="1"
                  value={formData.defaultVendorCommissionRate}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">النسبة المبدئية عند قبول متجر جديد</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  سقف مديونية المحل الافتراضي (Limit ج.م):
                </label>
                <input
                  type="number"
                  name="defaultVendorLimit"
                  min="1000"
                  step="500"
                  value={formData.defaultVendorLimit}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">يُجمد المتجر تلقائياً عند تجاوزه حتى السداد</p>
              </div>
            </div>
          </div>

          {/* Section 3: Official Vault Payment Accounts */}
          <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <Smartphone className="w-4 h-4 text-white" />
              <h3 className="font-bold text-sm text-white">
                3. حسابات التحصيل المعتمدة (التي تظهر للمحلات والطيارين عند السداد)
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  رقم محفظة فودافون كاش الرسمية للإدارة:
                </label>
                <input
                  type="text"
                  name="vodafoneCashNumber"
                  value={formData.vodafoneCashNumber}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  عنوان الدفع اللحظي إنستاباي (InstaPay IPA Handle):
                </label>
                <input
                  type="text"
                  name="instapayHandle"
                  value={formData.instapayHandle}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-mono font-bold text-white/80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  الحساب البنكي / IBAN:
                </label>
                <input
                  type="text"
                  name="bankIban"
                  value={formData.bankIban}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-mono text-white/80"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#D1FE17] text-[#131517] font-bold rounded-md hover:bg-white transition-colors shadow-xs text-xs"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتطبيق الإعدادات على المنصة</span>
            </button>
          </div>
        </div>

        {/* Live Simulator Column (1 Col) */}
        <div className="space-y-6">
          <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <Calculator className="w-4 h-4 text-[#D1FE17]" />
              <h3 className="font-bold text-sm text-white">
                محاكي تسعير المشوار المباشر (Live Route Simulator)
              </h3>
            </div>
            <p className="text-xs text-[#898A8B] mb-4 leading-relaxed">
              جرّب تغيير المسافة لمعاينة كيف تُحسب تكلفة التوصيل للعميل وأرباح الطيار وعمولة الخزنة فورياً.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white/80">مسافة المشوار:</span>
                  <span className="font-bold tabular-nums text-white">{simKm} كم</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  step="1"
                  value={simKm}
                  onChange={(e) => setSimKm(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#898A8B] mt-0.5">
                  <span>1 كم (نفس الحي)</span>
                  <span>45 كم (أطراف القاهرة)</span>
                </div>
              </div>

              {/* Simulation Result Breakdown */}
              <div className="border border-white/10 rounded-md p-3.5 bg-white/[0.03] space-y-2.5">
                <div className="flex justify-between items-center text-white/70">
                  <span>فتحة العداد:</span>
                  <span className="font-bold tabular-nums text-white">{formData.baseFare} ج.م</span>
                </div>

                <div className="flex justify-between items-center text-white/70">
                  <span>كيلومترات إضافية ({extraKm.toFixed(1)} كم × {formData.extraKmRate}):</span>
                  <span className="font-bold tabular-nums text-white">
                    {(extraKm * formData.extraKmRate).toFixed(1)} ج.م
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">إجمالي سعر التوصيل للعميل:</span>
                  <span className="font-bold tabular-nums text-white">{simDeliveryFee} ج.م</span>
                </div>

                <div className="pt-2 border-t border-dashed border-white/10 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-[#D1FE17]">
                    <span>عمولة المنصة من المشوار ({formData.driverCommissionRate}%):</span>
                    <span className="font-bold tabular-nums">+{simDriverCut} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-white/80">
                    <span>صافي ربح الطيار من المشوار:</span>
                    <span className="font-bold tabular-nums text-white">{simDriverNetProfit} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#898A8B] leading-normal">
                ملاحظة: يدفع العميل هذا المبلغ بالإضافة إلى ثمن الملابس كاش عند باب البيت.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
