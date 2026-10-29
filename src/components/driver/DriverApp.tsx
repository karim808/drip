import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Order } from '../../types';
import {
  Bike,
  Navigation,
  Phone,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Upload,
  ArrowRight,
  MapPin,
  Clock,
  ShieldAlert,
  Copy,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DriverDeliveryMap } from '../maps/DriverDeliveryMap';
import { ImageUploadField } from '../common/ImageUploadField';

export const DriverApp: React.FC = () => {
  const {
    activeDriverId,
    drivers,
    vendors,
    orders,
    pricingConfig,
    toggleDriverOnline,
    driverAcceptOrder,
    driverConfirmStorePickup,
    driverCompleteDelivery,
    driverTriggerInstantReturn,
    submitSettlement,
    showToast,
  } = usePlatform();

  const currentDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];

  // Modals
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<string>('');
  const [returnReason, setReturnReason] = useState('العميل طلب مقاس مختلف ورفض الاستلام');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(currentDriver?.currentDebt || 500);
  const [payMethod, setPayMethod] = useState<'instapay' | 'vodafone_cash'>('vodafone_cash');
  const [transRef, setTransRef] = useState(`VF-${Math.floor(100000 + Math.random() * 900000)}`);
  const [payReceiptImage, setPayReceiptImage] = useState<string>('');

  if (!currentDriver) {
    return <div className="p-8 text-center text-zinc-500">لا يوجد طيار محدد</div>;
  }

  const isFrozen = currentDriver.status === 'frozen';
  const usedPercent = Math.min(
    100,
    Math.round((currentDriver.currentDebt / (currentDriver.debtLimit || 1)) * 100)
  );

  // Active trips assigned to this driver
  const myActiveTrip = orders.find(
    (o) =>
      o.driverId === currentDriver.id &&
      (o.status === 'driver_assigned' || o.status === 'picked_up_paid_store')
  );

  // Return trips in progress back to store
  const myReturningTrip = orders.find(
    (o) => o.driverId === currentDriver.id && o.status === 'returning_to_vendor'
  );

  // Available orders for pickup by any online driver (STRICTLY ready_for_driver)
  const availableOrders = orders.filter((o) => o.status === 'ready_for_driver');
  const [previewMapOrderId, setPreviewMapOrderId] = useState<string | null>(null);

  const getOrderLocations = (order: Order) => {
    const vendor = vendors.find((v) => v.id === order.vendorId);
    const originCoords = order.vendorCoordinates || vendor?.coordinates || { lat: 29.9602, lng: 31.2785 };
    const destCoords = order.customerCoordinates || { lat: 30.0131, lng: 31.4289 };
    return {
      origin: {
        lat: originCoords.lat,
        lng: originCoords.lng,
        label: order.vendorName,
        address: `${order.vendorArea} - فرع المتجر`,
      },
      destination: {
        lat: destCoords.lat,
        lng: destCoords.lng,
        label: order.customerName,
        address: `${order.customerArea} · ${order.customerAddress}`,
      },
    };
  };

  // Handle return
  const handleOpenReturn = (orderId: string) => {
    setReturnOrderId(orderId);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!returnOrderId) return;
    driverTriggerInstantReturn(returnOrderId, returnReason);
    setIsReturnModalOpen(false);
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    if (!payReceiptImage) {
      showToast('⚠️ إلزامي: يرجى رفع صورة إشعار التحويل البنكي أو المحفظة لتأكيد السداد', 'error');
      return;
    }

    submitSettlement({
      entityType: 'driver',
      entityId: currentDriver.id,
      amount: payAmount,
      method: payMethod,
      transactionRef: transRef,
      notes: 'سداد عمولات توصيل لإعادة فتح الحساب والعمل',
      customReceiptImage: payReceiptImage,
    });

    setIsPayModalOpen(false);
    setPayReceiptImage('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ الرقم بنجاح', 'success');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-zinc-800">
      {/* Driver High-Contrast Mobile-First App Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/90 sticky top-0 z-30 px-4 py-3 backdrop-blur-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentDriver.avatarPhoto ? (
                <img
                  src={currentDriver.avatarPhoto}
                  alt={currentDriver.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-zinc-700"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <Bike className="w-5 h-5 text-white" />
                </div>
              )}
              {currentDriver.vehiclePhoto && (
                <img
                  src={currentDriver.vehiclePhoto}
                  alt="الدراجة"
                  className="w-5 h-5 rounded-full object-cover border border-zinc-900 absolute -bottom-1 -left-1"
                  title="الدراجة المسجلة"
                />
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>{currentDriver.name}</span>
                {currentDriver.vehicleNumber && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700">
                    {currentDriver.vehicleNumber}
                  </span>
                )}
                {currentDriver.hasPendingSettlement ? (
                  <span className="text-[10px] bg-amber-500 text-zinc-950 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    سداد قيد المراجعة
                  </span>
                ) : isFrozen ? (
                  <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">
                    موقوف
                  </span>
                ) : null}
              </div>
              <div className="text-[11px] text-zinc-400">
                {currentDriver.vehicle} · {currentDriver.area}
              </div>
            </div>
          </div>

          {/* Online Toggle Switch */}
          <button
            onClick={() => toggleDriverOnline(currentDriver.id)}
            disabled={isFrozen || currentDriver.hasPendingSettlement}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isFrozen || currentDriver.hasPendingSettlement
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : currentDriver.isOnline
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentDriver.isOnline ? 'bg-white animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span>{currentDriver.isOnline ? 'متصل ومتاح للطلبات' : 'غير متصل'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Pending Settlement Verification Banner */}
        {currentDriver.hasPendingSettlement ? (
          <div className="bg-amber-600 text-white p-4 rounded-lg space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Clock className="w-4 h-4 text-white" />
                <span>طلب السداد قيد المراجعة من الإدارة</span>
              </div>
              <span className="text-[10px] bg-amber-700 text-white font-mono px-2 py-0.5 rounded font-bold">
                PENDING APPROVAL
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-100">
              تم استلام إيصال التحويل بمبلغ{' '}
              <strong className="underline underline-offset-2 tabular-nums">
                {(currentDriver.pendingSettlementAmount || currentDriver.currentDebt).toLocaleString('ar-EG')} ج.م
              </strong>
              {currentDriver.pendingSettlementRef && (
                <span className="font-mono mr-1"> (مرجع: {currentDriver.pendingSettlementRef})</span>
              )}
              . يظل الحساب معلقاً وموقوفاً عن استقبال المشاوير ولا تتصفر المديونية إلا بعد مراجعة الإيصال واعتماده (Approve) من الإدارة.
            </p>
          </div>
        ) : isFrozen ? (
          <div className="bg-red-950 border border-red-800 text-red-200 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>توقف الحساب لتجاوز سقف المديونية (1,000 ج.م)</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              مديونيتك الحالية لعمولات التوصيل بلغت{' '}
              <strong className="text-white tabular-nums">
                {currentDriver.currentDebt.toLocaleString('ar-EG')} ج.م
              </strong>
              . لا يمكنك استقبال مشاوير جديدة حتى تسدد وتحول المبلغ عبر فودافون كاش أو إنستاباي.
            </p>
            <button
              onClick={() => {
                setPayAmount(currentDriver.currentDebt);
                setIsPayModalOpen(true);
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs transition-colors shadow-xs"
            >
              سداد المديونية ورفع إيصال التحويل لفتح الحساب
            </button>
          </div>
        ) : null}

        {/* Driver Earnings & Debt Meter (Uber Style) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800">
            <div>
              <div className="text-[11px] text-zinc-400">أرباحك الصافية المحققة</div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                {currentDriver.totalDeliveryEarnings.toLocaleString('ar-EG')}{' '}
                <span className="text-xs font-normal text-zinc-400">ج.م</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                من {currentDriver.totalTrips} مشوار مكتمل
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400">مديونية عمولات التوصيل للمنصة</div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {currentDriver.currentDebt.toLocaleString('ar-EG')}{' '}
                <span className="text-xs font-normal text-zinc-400">/ 1,000 ج</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">عمولة 20% لكل مشوار</div>
            </div>
          </div>

          {/* Progress to 1000 Limit */}
          <div className="pt-3">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-zinc-400">استهلاك سقف المديونية (1000 ج):</span>
              <span
                className={`font-mono font-bold ${
                  isFrozen ? 'text-red-400' : usedPercent >= 80 ? 'text-amber-400' : 'text-zinc-300'
                }`}
              >
                {usedPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFrozen ? 'bg-red-500' : usedPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                متبقي لك: {Math.max(0, currentDriver.debtLimit - currentDriver.currentDebt)} ج.م قبل الإيقاف
              </span>
              <button
                onClick={() => {
                  setPayAmount(currentDriver.currentDebt);
                  setIsPayModalOpen(true);
                }}
                className="text-xs text-white underline hover:text-zinc-300 font-medium"
              >
                سداد جزء من المديونية
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE RETURNING TRIP BANNER (IF DRIVER IS RETURNING ITEMS TO VENDOR) */}
        {myReturningTrip && (
          <div className="bg-red-950/40 border-2 border-red-600 rounded-lg p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-red-800/80">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-400 animate-spin-slow" />
                <span className="font-bold text-sm text-red-100">مشوار مرتجع فوري جاري للمحل</span>
              </div>
              <span className="font-mono text-xs text-red-200 font-bold bg-red-900/60 px-2 py-0.5 rounded border border-red-700">
                {myReturningTrip.orderNumber}
              </span>
            </div>

            <div className="bg-zinc-950/80 border border-red-900/60 rounded p-3 text-xs space-y-2">
              <div className="text-zinc-200">
                <strong>المتجر المستلم:</strong> {myReturningTrip.vendorName} ({myReturningTrip.vendorArea})
              </div>
              <div className="text-zinc-300">
                <strong>سبب الإرجاع:</strong> {myReturningTrip.returnReason || 'العميل رفض الاستلام عند الباب'}
              </div>
              {myReturningTrip.returnCode && (
                <div className="font-mono text-amber-300 font-bold bg-zinc-900 p-2 rounded border border-zinc-800 text-center text-xs">
                  كود المرتجع للإبراز للبائع: {myReturningTrip.returnCode}
                </div>
              )}
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs flex justify-between items-center">
              <span className="text-zinc-300 font-bold">المبلغ المستحق استرداده نقداً من المحل:</span>
              <span className="text-lg font-black text-white tabular-nums">
                {myReturningTrip.clothesTotal.toLocaleString('ar-EG')} ج.م كاش
              </span>
            </div>

            <div className="text-[11px] text-zinc-400 bg-zinc-900/90 p-2.5 rounded leading-normal border border-zinc-800">
              💡 توجه إلى المحل فوراً لتسليم القطعة، وسيضغط صاحب المتجر زر "تأكيد استلام المرتجع" في شاشته لإعادة الكاش لك.
            </div>
          </div>
        )}

        {/* ACTIVE TRIP CARD (IF ANY) */}
        {myActiveTrip ? (
          <div className="bg-zinc-900 border-2 border-white rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-sm text-white">مشوارك الحالي قيد التنفيذ</span>
              </div>
              <span className="font-mono font-bold text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-200">
                {myActiveTrip.orderNumber}
              </span>
            </div>

            {/* Interactive Live Delivery Map with Route & Google Maps Navigation (Requirement 2) */}
            <div className="pt-1">
              <DriverDeliveryMap
                origin={getOrderLocations(myActiveTrip).origin}
                destination={getOrderLocations(myActiveTrip).destination}
                distanceKm={myActiveTrip.distanceKm}
                orderNumber={myActiveTrip.orderNumber}
              />
            </div>

            {/* STEP 1: PICKUP & PAY STORE CASH */}
            {myActiveTrip.status === 'driver_assigned' && (
              <div className="space-y-4">
                <div className="border border-zinc-700 rounded-lg p-3.5 bg-zinc-950 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <MapPin className="w-4 h-4" />
                    <span>الخطوة 1: توجه لفرع المتجر واستلم الملابس</span>
                  </div>
                  <div className="text-sm font-bold text-white">{myActiveTrip.vendorName}</div>
                  <div className="text-xs text-zinc-400">{myActiveTrip.vendorArea}</div>
                </div>

                {/* Cash rule alert */}
                <div className="p-3 bg-zinc-800/80 rounded border border-zinc-700 text-xs space-y-1">
                  <div className="text-zinc-300">
                    المطلوب منك دفعه نقداً للمحل الآن:
                  </div>
                  <div className="text-xl font-bold text-white tabular-nums">
                    {myActiveTrip.clothesTotal.toLocaleString('ar-EG')} ج.م كاش
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    (ستسترد هذا المبلغ كاملاً + أجرة التوصيل من العميل عند باب البيت)
                  </div>
                </div>

                <button
                  onClick={() => driverConfirmStorePickup(myActiveTrip.id)}
                  className="w-full py-3 bg-white text-zinc-950 font-black rounded-lg text-sm hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  أكدت دفع {myActiveTrip.clothesTotal} ج.م كاش واستلمت الملابس
                </button>
              </div>
            )}

            {/* STEP 2: ON THE WAY TO CUSTOMER & CASH COLLECTION */}
            {myActiveTrip.status === 'picked_up_paid_store' && (
              <div className="space-y-4">
                <div className="border border-zinc-700 rounded-lg p-3.5 bg-zinc-950 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Navigation className="w-4 h-4" />
                    <span>الخطوة 2: في الطريق لعنوان العميل</span>
                  </div>
                  <div className="text-sm font-bold text-white">{myActiveTrip.customerName}</div>
                  <div className="text-xs text-zinc-300">
                    {myActiveTrip.customerArea} · {myActiveTrip.customerAddress}
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href={`tel:${myActiveTrip.customerPhone}`}
                      className="flex items-center gap-1.5 text-emerald-400 font-bold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال بالعميل ({myActiveTrip.customerPhone})</span>
                    </a>
                  </div>
                </div>

                {/* Big Payment Collection Box based on Customer's Selected Method */}
                {myActiveTrip.paymentMethod === 'vodafone_cash' ? (
                  <div className="bg-red-950/40 border border-red-800 p-4 rounded-lg space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-red-300 font-bold">
                      <span>📱 طريقة الدفع: محفظة إلكترونية / فودافون كاش</span>
                    </div>
                    <div className="text-3xl font-black text-white tabular-nums">
                      {myActiveTrip.totalAmount.toLocaleString('ar-EG')}{' '}
                      <span className="text-xs font-normal text-zinc-400">ج.م</span>
                    </div>
                    <div className="text-xs text-zinc-300 flex items-center justify-center gap-3 pt-1 border-t border-red-900/60">
                      <span>ثمن الملابس: {myActiveTrip.clothesTotal} ج</span>
                      <span>+</span>
                      <span>أجرة التوصيل: {myActiveTrip.deliveryFee} ج</span>
                    </div>
                    <div className="text-[11px] text-red-200 bg-red-950/80 border border-red-800/80 py-2 px-3 rounded font-medium">
                      ⚠️ <strong>تنبيه للكابتن:</strong> العميل سيدفع عبر المحفظة الإلكترونية. اطلب منه تحويل المبلغ لرقمك أو إظهار رسالة الخصم الرسمية قبل تسليم الملابس.
                    </div>
                  </div>
                ) : myActiveTrip.paymentMethod === 'instapay' ? (
                  <div className="bg-purple-950/40 border border-purple-800 p-4 rounded-lg space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-purple-300 font-bold">
                      <span>⚡ طريقة الدفع: تحويل لحظي إنستاباي (IPN)</span>
                    </div>
                    <div className="text-3xl font-black text-white tabular-nums">
                      {myActiveTrip.totalAmount.toLocaleString('ar-EG')}{' '}
                      <span className="text-xs font-normal text-zinc-400">ج.م</span>
                    </div>
                    <div className="text-xs text-zinc-300 flex items-center justify-center gap-3 pt-1 border-t border-purple-900/60">
                      <span>ثمن الملابس: {myActiveTrip.clothesTotal} ج</span>
                      <span>+</span>
                      <span>أجرة التوصيل: {myActiveTrip.deliveryFee} ج</span>
                    </div>
                    <div className="text-[11px] text-purple-200 bg-purple-950/80 border border-purple-800/80 py-2 px-3 rounded font-medium">
                      ⚡ <strong>تنبيه للكابتن:</strong> العميل سيدفع عبر إنستاباي اللحظي. تأكد من ظهور شاشة "تم التحويل بنجاح" ورقم العملية على هاتف العميل قبل تسليم الشحنة.
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                      <span>💵 طريقة الدفع: كاش عند الاستلام (COD)</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 tabular-nums">
                      {myActiveTrip.totalAmount.toLocaleString('ar-EG')}{' '}
                      <span className="text-xs font-normal text-zinc-400">ج.م نقداً</span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center justify-center gap-3 pt-1 border-t border-zinc-800">
                      <span>ثمن الملابس: {myActiveTrip.clothesTotal} ج</span>
                      <span>+</span>
                      <span>أجرة التوصيل: {myActiveTrip.deliveryFee} ج</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 bg-zinc-900 py-1.5 px-2 rounded">
                      حصل المبلغ كاملاً نقداً من العميل عند باب البيت
                    </div>
                  </div>
                )}

                {/* Two Action Buttons: Success OR Instant Return */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => driverCompleteDelivery(myActiveTrip.id)}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-lg text-sm transition-colors shadow-lg"
                  >
                    تم تحصيل {myActiveTrip.totalAmount} ج.م وتسليم الملابس بنجاح ✓
                  </button>

                  <button
                    onClick={() => handleOpenReturn(myActiveTrip.id)}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-900/60 font-bold rounded-lg text-xs transition-colors"
                  >
                    مرتجع فوري (رفض العميل الاستلام أو المقاس غير مطابق)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Available Trips List */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-zinc-200">الطلبات المتاحة للاستلام والتوصيل</span>
              <span className="text-zinc-500">
                {availableOrders.length > 0 ? `${availableOrders.length} طلب جاهز` : 'لا توجد طلبات'}
              </span>
            </div>

            {availableOrders.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <Bike className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-zinc-300">بانتظار طلبات جديدة من المحلات</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  عندما يجهز أي متجر أزياء طلباً سريعاً، سيظهر هنا فوراً لتقبله.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map((order) => {
                  const netProfit = order.deliveryFee - order.driverCommission;
                  return (
                    <div
                      key={order.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{order.vendorName}</span>
                          <span className="text-zinc-500">· {order.vendorArea}</span>
                        </div>
                        <span className="text-emerald-400 font-bold tabular-nums text-sm">
                          +{netProfit.toFixed(1)} ج.م ربحك
                        </span>
                      </div>

                      {/* Payment Method Badge */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">طريقة التحصيل من العميل:</span>
                        {order.paymentMethod === 'vodafone_cash' ? (
                          <span className="bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold">
                            📱 فودافون كاش / محفظة
                          </span>
                        ) : order.paymentMethod === 'instapay' ? (
                          <span className="bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
                            ⚡ تحويل إنستاباي اللحظي
                          </span>
                        ) : (
                          <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded font-medium">
                            💵 كاش عند الاستلام
                          </span>
                        )}
                      </div>

                      {/* Route Info */}
                      <div className="text-xs space-y-1 text-zinc-400">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>الاستلام من: {order.vendorArea}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                          <span>التوصيل إلى: {order.customerArea} ({order.distanceKm} كم)</span>
                        </div>
                      </div>

                      {/* Financial requirements for this trip */}
                      <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500">كاش مطلوب للمحل:</div>
                          <div className="font-bold text-white tabular-nums">
                            {order.clothesTotal.toLocaleString('ar-EG')} ج.م
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500">المطلوب تحصيله من العميل:</div>
                          <div className="font-bold text-emerald-400 tabular-nums">
                            {order.totalAmount.toLocaleString('ar-EG')} ج.م
                          </div>
                        </div>
                      </div>

                      {/* Map Route Preview Toggle for Driver */}
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewMapOrderId((prev) => (prev === order.id ? null : order.id))
                          }
                          className="flex items-center justify-between w-full py-1.5 px-2.5 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-300 hover:text-white transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>معاينة خريطة المسار ونقاط التوصيل</span>
                          </span>
                          {previewMapOrderId === order.id ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {previewMapOrderId === order.id && (
                          <div className="pt-2">
                            <DriverDeliveryMap
                              origin={getOrderLocations(order).origin}
                              destination={getOrderLocations(order).destination}
                              distanceKm={order.distanceKm}
                              orderNumber={order.orderNumber}
                              heightClassName="h-[200px]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Accept Button */}
                      <button
                        onClick={() => driverAcceptOrder(order.id, currentDriver.id)}
                        disabled={isFrozen || currentDriver.hasPendingSettlement || !currentDriver.isOnline}
                        className={`w-full py-2.5 rounded font-bold text-xs transition-colors ${
                          isFrozen || currentDriver.hasPendingSettlement || !currentDriver.isOnline
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-white text-zinc-950 hover:bg-zinc-200'
                        }`}
                      >
                        {currentDriver.hasPendingSettlement
                          ? 'طلب السداد قيد المراجعة من الإدارة'
                          : isFrozen
                          ? 'حسابك موقوف لتجاوز الليميت'
                          : !currentDriver.isOnline
                          ? 'فعّل وضع الاتصال أولاً'
                          : 'قبول المشوار والانطلاق للاستلام'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Instant Return Modal */}
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 text-right">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                <RotateCcw className="w-4 h-4" />
                <span>المرتجع الفوري (رفض العميل الاستلام)</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                عند تأكيد المرتجع، تُلغى مديونية المحل فورياً في النظام، وتعود بالقطعة إلى المحل لتسترد الكاش الذي دفعته بكود تأكيد رسمي.
              </p>

              <div className="space-y-3 text-xs mb-5">
                <label className="block text-zinc-300 font-semibold">سبب المرتجع:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-2 focus:outline-none"
                >
                  <option value="العميل طلب مقاس مختلف ورفض الاستلام">العميل طلب مقاس مختلف ورفض الاستلام</option>
                  <option value="العميل غير متواجد على العنوان المسجل">العميل غير متواجد على العنوان المسجل</option>
                  <option value="العميل ألغى الطلب عند باب البيت">العميل ألغى الطلب عند باب البيت</option>
                  <option value="القطعة بها عيب مصنعي أو غير مطابقة للطلب">القطعة بها عيب مصنعي أو غير مطابقة للطلب</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmReturn}
                  className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-500 shadow-xs"
                >
                  تأكيد المرتجع واسترداد الكاش من المحل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Driver Settle Debt Modal */}
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 text-right">
              <h3 className="font-bold text-sm text-white mb-1">
                سداد عمولات التوصيل لإدارة المنصة
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                مديونيتك الحالية: {currentDriver.currentDebt.toLocaleString('ar-EG')} ج.م
              </p>

              <form onSubmit={handlePayDebtSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 mb-1">طريقة السداد:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod('vodafone_cash')}
                      className={`py-1.5 rounded border text-center font-medium ${
                        payMethod === 'vodafone_cash'
                          ? 'bg-white text-zinc-950 border-white font-bold'
                          : 'border-zinc-800 text-zinc-400'
                      }`}
                    >
                      فودافون كاش
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod('instapay')}
                      className={`py-1.5 rounded border text-center font-medium ${
                        payMethod === 'instapay'
                          ? 'bg-white text-zinc-950 border-white font-bold'
                          : 'border-zinc-800 text-zinc-400'
                      }`}
                    >
                      إنستاباي
                    </button>
                  </div>
                </div>

                {/* Account info */}
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded">
                  <div className="text-[11px] text-zinc-400 mb-1">
                    {payMethod === 'vodafone_cash'
                      ? 'رقم محفظة فودافون كاش الرسمية:'
                      : 'عنوان إنستاباي الرسمي:'}
                  </div>
                  <div className="flex items-center justify-between font-mono font-bold text-white">
                    <span>
                      {payMethod === 'vodafone_cash'
                        ? pricingConfig.vodafoneCashNumber
                        : pricingConfig.instapayHandle}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          payMethod === 'vodafone_cash'
                            ? pricingConfig.vodafoneCashNumber
                            : pricingConfig.instapayHandle
                        )
                      }
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">المبلغ المحول (ج.م):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">رقم المعاملة / المرجع:</label>
                  <input
                    type="text"
                    required
                    value={transRef}
                    onChange={(e) => setTransRef(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white font-mono focus:outline-none"
                  />
                </div>

                {/* REAL MANDATORY SCREENSHOT UPLOAD */}
                <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                  <ImageUploadField
                    label="صورة شاشة التحويل (إيصال السداد):"
                    value={payReceiptImage}
                    onChange={setPayReceiptImage}
                    required={true}
                    placeholderText="اضغط هنا لرفع سكرين شوت الإيصال من الاستوديو أو الكاميرا"
                    helperText="إلزامي: لن يتم قبول السداد ومراجعته من الإدارة إلا بعد إرفاق صورة واضحة للإيصال"
                    enableUrlInput={true}
                  />
                  {!payReceiptImage && (
                    <div className="mt-1 text-[11px] text-red-400 bg-red-950/60 p-2 rounded border border-red-900 font-medium">
                      ⚠️ تنبيه: زر الإرسال معطل حتى تقوم برفع صورة إيصال التحويل الحقيقي.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={!payReceiptImage}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-opacity"
                  >
                    إرسال الإيصال للمراجعة
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
