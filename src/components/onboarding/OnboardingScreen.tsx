import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { OnboardingType } from '../../types';
import {
  Store,
  Bike,
  Upload,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Building2,
  Lock,
  Phone,
  User,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';

export const OnboardingScreen: React.FC = () => {
  const {
    onboardingType,
    setOnboardingType,
    registerVendorApplication,
    registerDriverApplication,
    setActivePortal,
    showToast,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<OnboardingType>(onboardingType);

  React.useEffect(() => {
    setActiveTab(onboardingType);
  }, [onboardingType]);

  // Vendor Form
  const [vendorName, setVendorName] = useState('');
  const [vendorOwner, setVendorOwner] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorArea, setVendorArea] = useState('المعادي');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorCategory, setVendorCategory] = useState('ملابس ستريت وير وهوديز قطن ثقيل');
  const [vendorInstagram, setVendorInstagram] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorLogo, setVendorLogo] = useState('');
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

  // Driver Form & KYC
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverNationalId, setDriverNationalId] = useState('');
  const [driverVehicle, setDriverVehicle] = useState('سكوتر هوندا فورزا 300');
  const [driverPlate, setDriverPlate] = useState('ق د س ٩١٨٢');
  const [driverArea, setDriverArea] = useState('المعادي والتجمع الخامس');
  const [driverPassword, setDriverPassword] = useState('');

  // 4 Mandatory KYC Photos
  const [driverAvatarPhoto, setDriverAvatarPhoto] = useState('');
  const [driverVehiclePhoto, setDriverVehiclePhoto] = useState('');
  const [driverNationalIdPhoto, setDriverNationalIdPhoto] = useState('');
  const [driverLicensePhoto, setDriverLicensePhoto] = useState('');

  const [driverSubmitted, setDriverSubmitted] = useState(false);

  const areAllKycUploaded = !!(
    driverAvatarPhoto &&
    driverVehiclePhoto &&
    driverNationalIdPhoto &&
    driverLicensePhoto
  );

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vendorEmail || !vendorPhone || !vendorPassword) return;

    const ok = await registerVendorApplication({
      name: vendorName,
      email: vendorEmail,
      phone: vendorPhone,
      password: vendorPassword,
      area: vendorArea,
      address: vendorAddress || `${vendorArea}، القاهرة`,
      category: vendorCategory,
      logoUrl: vendorLogo,
      instagram: vendorInstagram,
    });
    if (ok) {
      setVendorSubmitted(true);
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !driverEmail || !driverPhone || !driverNationalId || !driverPassword) return;

    if (!areAllKycUploaded) {
      showToast('⚠️ إلزامي: يجب رفع الصور والمستندات الـ 4 الرسمية كاملة قبل المتابعة', 'error');
      return;
    }

    const ok = await registerDriverApplication({
      name: driverName,
      email: driverEmail,
      phone: driverPhone,
      password: driverPassword,
      vehicle: driverVehicle,
      vehicleNumber: driverPlate,
      area: driverArea,
      nationalId: driverNationalId,
      avatarPhoto: driverAvatarPhoto,
      vehiclePhoto: driverVehiclePhoto,
      nationalIdPhoto: driverNationalIdPhoto,
      licensePhoto: driverLicensePhoto,
    });
    if (ok) {
      setDriverSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Editorial Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            JOIN VOGUE FAST NETWORK // CAIRO
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            انضم لمنظومة التوصيل السريع للملابس
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            سواء كنت براند أزياء تبحث عن توصيل فوري لمبيعاتك كاش، أو كابتن توصيل يرغب في دخل فوري وأعلى تسعيرة للمشاوير الحضرية.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/80 rounded-lg mb-8 max-w-md mx-auto text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('vendor');
              setOnboardingType('vendor');
              setVendorSubmitted(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md transition-all ${
              activeTab === 'vendor'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>انضمام براند / متجر أزياء</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('driver');
              setOnboardingType('driver');
              setDriverSubmitted(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md transition-all ${
              activeTab === 'driver'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>انضمام كابتن توصيل (طيار)</span>
          </button>
        </div>

        {/* VENDOR ONBOARDING */}
        {activeTab === 'vendor' && (
          <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 shadow-xs">
            {vendorSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950">
                  تم استلام طلب انضمام متجرك بنجاح!
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  طلبك الآن بحالة <strong className="text-zinc-900">Pending (قيد الفحص)</strong> في لوحة الإدارة العليا. سيقوم الفريق بتحديد نسبة العمولة وسقف المديونية الائتمانية وتفعيل المتجر.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setActivePortal('admin')}
                    className="px-5 py-2.5 bg-zinc-950 text-white rounded-md text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    معاينة الطلب في لوحة الإدارة (Admin)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs">
                <div className="border-b border-zinc-100 pb-3 mb-2">
                  <h3 className="font-bold text-sm text-zinc-950">بيانات البراند والفرع</h3>
                  <p className="text-zinc-400 text-[11px]">
                    الطيارون سيتوجهون لهذا العنوان لاستلام الملابس ودفع ثمنها كاش.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      اسم البراند / المتجر:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: BLACKOUT CAIRO"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      اسم المالك / المدير المسؤول:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="أحمد ممدوح"
                      value={vendorOwner}
                      onChange={(e) => setVendorOwner(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      البريد الإلكتروني الرسمي للمتجر:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="brand@voguefast.eg"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      رقم الهاتف / واتساب المحل:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    المنطقة والحي:
                  </label>
                  <select
                    value={vendorArea}
                    onChange={(e) => setVendorArea(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded bg-white focus:outline-none focus:border-zinc-900 font-medium"
                  >
                    <option value="المعادي">المعادي (دجلة والشارع 9)</option>
                    <option value="الزمالك">الزمالك</option>
                    <option value="التجمع الخامس">التجمع الخامس (التسعين)</option>
                    <option value="مصر الجديدة">مصر الجديدة (الكوربة)</option>
                    <option value="الشيخ زايد">الشيخ زايد (أركان وكابيتال)</option>
                    <option value="الدقي والمهندسين">الدقي والمهندسين</option>
                    <option value="مدينة نصر">مدينة نصر</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    العنوان التفصيلي للفرع لاستلام الملابس:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="شارع 206، بجوار بنك مصر، دجلة المعادي"
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      نوع الأزياء والتصنيف:
                    </label>
                    <input
                      type="text"
                      value={vendorCategory}
                      onChange={(e) => setVendorCategory(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      حساب إنستاجرام البراند:
                    </label>
                    <input
                      type="text"
                      placeholder="@brandname.eg"
                      value={vendorInstagram}
                      onChange={(e) => setVendorInstagram(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    كلمة المرور لبوابة المحل (POS):
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                  />
                </div>

                {/* Upload Logo / Facade */}
                <ImageUploadField
                  label="لوجو البراند / صورة واجهة الفرع:"
                  value={vendorLogo}
                  onChange={setVendorLogo}
                  placeholderText="اضغط لرفع لوجو المتجر أو صورة الفرع من جهازك"
                  helperText="صيغ مدعومة: JPG, PNG, WebP"
                  enableUrlInput={true}
                />

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    بإرسال الطلب أنت توافق على شروط عمولات التوصيل السريع.
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-950 text-white font-bold rounded-md hover:bg-zinc-800 transition-colors shadow-xs"
                  >
                    إرسال طلب الانضمام
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* DRIVER ONBOARDING */}
        {activeTab === 'driver' && (
          <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 shadow-xs">
            {driverSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950">
                  تم استلام طلب تسجيل الكابتن بنجاح!
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  طلبك الآن بحالة <strong className="text-zinc-900">Pending (فحص الأوراق)</strong> في لوحة أسطول الإدارة. سيتم فحص صورة البطاقة والرخصة وتفعيل حسابك بسقف مديونية 1,000 ج.م للبدء فوراً.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setActivePortal('admin')}
                    className="px-5 py-2.5 bg-zinc-950 text-white rounded-md text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    معاينة أوراق الكابتن في لوحة الإدارة (Admin)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs">
                <div className="border-b border-zinc-100 pb-3 mb-2">
                  <h3 className="font-bold text-sm text-zinc-950">بيانات الكابتن والمركبة</h3>
                  <p className="text-zinc-400 text-[11px]">
                    ارفع أوراقك الرسمية للبدء في استلام مشاوير توصيل الأزياء في أحيائك المفضلة.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      اسم الكابتن كاملاً (رباعي):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="طارق السعيد بدر الدين"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      البريد الإلكتروني للكابتن:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="captain@voguefast.eg"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    رقم الهاتف (المسجل بفودافون كاش أو إنستاباي):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      الرقم القومي (14 رقم):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      placeholder="29906140107765"
                      value={driverNationalId}
                      onChange={(e) => setDriverNationalId(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      نطاق التغطية المفضل:
                    </label>
                    <select
                      value={driverArea}
                      onChange={(e) => setDriverArea(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white focus:outline-none focus:border-zinc-900 font-medium"
                    >
                      <option value="المعادي والتجمع الخامس">المعادي والتجمع الخامس</option>
                      <option value="الزمالك والدقي والمهندسين">الزمالك والدقي والمهندسين</option>
                      <option value="مصر الجديدة ومدينة نصر">مصر الجديدة ومدينة نصر</option>
                      <option value="الشيخ زايد ومدينة 6 أكتوبر">الشيخ زايد ومدينة 6 أكتوبر</option>
                      <option value="وسط البلد والقاهرة الكبرى">وسط البلد والقاهرة الكبرى</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      نوع المركبة والموديل:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="سكوتر هوندا فورزا 300"
                      value={driverVehicle}
                      onChange={(e) => setDriverVehicle(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      رقم لوحة المركبة:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ق أ د ٧٤١٩"
                      value={driverPlate}
                      onChange={(e) => setDriverPlate(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    كلمة المرور لتطبيق الطيار:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={driverPassword}
                    onChange={(e) => setDriverPassword(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                  />
                </div>

                {/* 4 MANDATORY KYC DOCUMENT UPLOADS */}
                <div className="space-y-4 pt-2">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                      <span>اكتمال مستندات الهوية والتحقق (KYC):</span>
                      <span className="font-mono tabular-nums px-2 py-0.5 rounded bg-white border border-zinc-200">
                        {[driverAvatarPhoto, driverVehiclePhoto, driverNationalIdPhoto, driverLicensePhoto].filter(Boolean).length} / 4 مكتمل
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${driverAvatarPhoto ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${driverAvatarPhoto ? 'text-emerald-600' : 'text-zinc-300'}`} />
                        <span>الصورة الشخصية (سيلفي)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${driverVehiclePhoto ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${driverVehiclePhoto ? 'text-emerald-600' : 'text-zinc-300'}`} />
                        <span>صورة الدراجة مع اللوحة</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${driverNationalIdPhoto ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${driverNationalIdPhoto ? 'text-emerald-600' : 'text-zinc-300'}`} />
                        <span>بطاقة الرقم القومي</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${driverLicensePhoto ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${driverLicensePhoto ? 'text-emerald-600' : 'text-zinc-300'}`} />
                        <span>رخصة القيادة السارية</span>
                      </div>
                    </div>

                    {!areAllKycUploaded && (
                      <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-200 font-medium">
                        ⚠️ إلزامي: يجب رفع الصور والمستندات الـ 4 كاملة لتفعيل زر إرسال الطلب.
                      </div>
                    )}
                  </div>

                  {/* 1 & 2: Face Selfie and Motorcycle Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploadField
                      label="1. صورة شخصية واضحة للوجه (Selfie):"
                      value={driverAvatarPhoto}
                      onChange={setDriverAvatarPhoto}
                      required={true}
                      placeholderText="التقط سيلفي أو اختر صورة شخصية واضحة"
                      helperText="تظهر للعملاء والمحلات عند تعيينك للمشوار"
                      enableUrlInput={true}
                    />

                    <ImageUploadField
                      label="2. صورة الدراجة النارية / السكوتر مع اللوحة:"
                      value={driverVehiclePhoto}
                      onChange={setDriverVehiclePhoto}
                      required={true}
                      placeholderText="صورة دراجتك وتظهر أرقام اللوحة بوضوح"
                      helperText="لتأكيد المركبة واللوحات عند استلام الملابس"
                      enableUrlInput={true}
                    />
                  </div>

                  {/* 3 & 4: National ID & Driving License */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploadField
                      label="3. صورة بطاقة الرقم القومي (سارية):"
                      value={driverNationalIdPhoto}
                      onChange={setDriverNationalIdPhoto}
                      required={true}
                      placeholderText="اضغط لرفع صورة البطاقة من جهازك"
                      helperText="للتدقيق الأمني والتحقق من الهوية الرسمية"
                      enableUrlInput={true}
                    />

                    <ImageUploadField
                      label="4. صورة رخصة قيادة الدراجة النارية:"
                      value={driverLicensePhoto}
                      onChange={setDriverLicensePhoto}
                      required={true}
                      placeholderText="اضغط لرفع صورة رخصة القيادة السارية"
                      helperText="يجب أن تكون الرخصة غير منتهية"
                      enableUrlInput={true}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    سقف المديونية الأولي عند القبول: 1,000 ج.م
                  </span>
                  <button
                    type="submit"
                    disabled={!areAllKycUploaded}
                    className="px-6 py-2.5 bg-zinc-950 text-white font-bold rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                  >
                    تسجيل الكابتن وإرسال المستندات للفحص
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
