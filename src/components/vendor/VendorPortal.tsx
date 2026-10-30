import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Product } from '../../types';
import {
  Store,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Package,
  Plus,
  Clock,
  ArrowDownLeft,
  Smartphone,
  Copy,
  DollarSign,
  TrendingUp,
  RotateCcw,
  X,
  Phone,
  Edit,
  Trash2,
  LogOut,
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';

export const VendorPortal: React.FC = () => {
  const {
    activeVendorId,
    vendors,
    orders,
    products,
    pricingConfig,
    vendorPrepareOrder,
    vendorConfirmStockAndPrepare,
    vendorCancelOutOfStock,
    vendorConfirmReturnReceived,
    submitSettlement,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    logoutVendor,
    showToast,
  } = usePlatform();

  const currentVendor = vendors.find((v) => v.id === activeVendorId) || vendors[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'wallet'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'in_delivery' | 'returns' | 'completed'>('all');

  // Settlement Upload Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(currentVendor?.currentDebt || 1000);
  const [payMethod, setPayMethod] = useState<'instapay' | 'vodafone_cash'>('instapay');
  const [transRef, setTransRef] = useState(`IPN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [payNotes, setPayNotes] = useState('');
  const [payReceiptImage, setPayReceiptImage] = useState<string>('');

  // Add Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('هوديز وسويت شيرت');
  const [newProdPrice, setNewProdPrice] = useState<number>(850);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdSizes, setNewProdSizes] = useState('S, M, L, XL');
  const [newProdImage, setNewProdImage] = useState('');

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDesc, setEditDesc] = useState('');
  const [editSizes, setEditSizes] = useState('');
  const [editImage, setEditImage] = useState('');

  if (!currentVendor) {
    return <div className="p-8 text-center text-[#898A8B]">لا يوجد متجر محدد</div>;
  }

  const isFrozen = currentVendor.status === 'frozen';
  const usedPercent = Math.min(
    100,
    Math.round((currentVendor.currentDebt / (currentVendor.debtLimit || 1)) * 100)
  );

  // Vendor's orders
  const vendorOrders = orders.filter((o) => o.vendorId === currentVendor.id);
  const returningOrders = vendorOrders.filter((o) => o.status === 'returning_to_vendor');
  const pendingOrders = vendorOrders.filter((o) => o.status === 'pending_vendor');
  const inDeliveryOrders = vendorOrders.filter(
    (o) => o.status === 'ready_for_driver' || o.status === 'driver_assigned' || o.status === 'picked_up_paid_store'
  );
  const returnsAll = vendorOrders.filter(
    (o) => o.status === 'returning_to_vendor' || o.status === 'returned_completed' || o.status === 'returned_to_store'
  );
  const completedOrders = vendorOrders.filter((o) => o.status === 'delivered');
  const activeOrders = vendorOrders.filter(
    (o) =>
      o.status !== 'delivered' &&
      o.status !== 'cancelled' &&
      o.status !== 'cancelled_by_vendor' &&
      o.status !== 'returned_completed'
  );

  // Filtered orders list for the grid
  const displayedOrders = vendorOrders.filter((o) => {
    if (orderFilter === 'pending') return o.status === 'pending_vendor';
    if (orderFilter === 'in_delivery') {
      return (
        o.status === 'ready_for_driver' ||
        o.status === 'driver_assigned' ||
        o.status === 'picked_up_paid_store'
      );
    }
    if (orderFilter === 'returns') {
      return (
        o.status === 'returning_to_vendor' ||
        o.status === 'returned_completed' ||
        o.status === 'returned_to_store'
      );
    }
    if (orderFilter === 'completed') return o.status === 'delivered';
    return true; // 'all'
  });

  // Vendor's products
  const vendorProducts = products.filter((p) => p.vendorId === currentVendor.id);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ الرقم بنجاح', 'success');
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    if (!payReceiptImage) {
      showToast('⚠️ إلزامي: يرجى رفع صورة إشعار التحويل البنكي أو المحفظة لتأكيد السداد', 'error');
      return;
    }

    submitSettlement({
      entityType: 'vendor',
      entityId: currentVendor.id,
      amount: payAmount,
      method: payMethod,
      transactionRef: transRef,
      notes: payNotes,
      customReceiptImage: payReceiptImage,
    });

    setIsPayModalOpen(false);
    setPayReceiptImage('');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice <= 0) return;
    if (!newProdImage) {
      showToast('⚠️ يرجى رفع صورة القطعة من جهازك أو وضع رابط صالح قبل الحفظ', 'error');
      return;
    }

    addProduct({
      vendorId: currentVendor.id,
      name: newProdName.trim(),
      category: newProdCategory,
      price: newProdPrice,
      sizes: newProdSizes.split(',').map((s) => s.trim()).filter(Boolean),
      inStock: true,
      image: newProdImage,
      description: newProdDesc.trim() || 'قطعة أزياء عصرية بجودة تصنيع فائقة.',
      fitType: 'Oversized Boxy Cut',
    });

    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdImage('');
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditPrice(p.price);
    setEditDesc(p.description);
    setEditSizes(p.sizes.join(', '));
    setEditImage(p.image);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || editPrice <= 0) {
      showToast('يرجى ملء اسم القطعة والسعر بشكل صحيح', 'error');
      return;
    }
    updateProduct(editingProduct.id, {
      name: editName.trim(),
      category: editCategory,
      price: editPrice,
      description: editDesc.trim(),
      sizes: editSizes.split(',').map((s) => s.trim()).filter(Boolean),
      image: editImage || editingProduct.image,
    });
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#131517] pb-16">
      {/* Top Banner if Pending Settlement or Frozen */}
      {currentVendor.hasPendingSettlement ? (
        <div className="bg-amber-400 text-[#131517] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-md">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-white shrink-0" />
            <span>
              <strong>طلب السداد قيد المراجعة من الإدارة:</strong> تم رفع إيصال التحويل بمبلغ{' '}
              <strong className="underline underline-offset-2 tabular-nums">
                {(currentVendor.pendingSettlementAmount || currentVendor.currentDebt).toLocaleString('ar-EG')} ج.م
              </strong>
              {currentVendor.pendingSettlementRef && (
                <span className="font-mono mr-1"> (مرجع: {currentVendor.pendingSettlementRef})</span>
              )}
              . يظل المتجر معلقاً ومقفولاً ولا تتصفر المديونية إلا بعد مراجعة وضغط زر الموافقة (Approve) من الإدارة.
            </span>
          </div>

          <span className="text-[11px] bg-amber-400 text-white px-2.5 py-1 rounded font-bold font-mono">
            قيد المراجعة بالخزنة
          </span>
        </div>
      ) : isFrozen ? (
        <div className="bg-red-600 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white shrink-0 animate-bounce" />
            <span>
              <strong>تنبيه مالي عاجل:</strong> تم إيقاف استقبال طلبات جديدة لمتجرك لتجاوز سقف المديونية المسموح به (
              {currentVendor.debtLimit.toLocaleString('ar-EG')} ج.م). مديونيتك الحالية:{' '}
              {currentVendor.currentDebt.toLocaleString('ar-EG')} ج.م.
            </span>
          </div>

          <button
            onClick={() => {
              setPayAmount(currentVendor.currentDebt);
              setIsPayModalOpen(true);
            }}
            className="px-4 py-1.5 bg-[#1A1C1F] text-red-400 font-bold rounded-md hover:bg-white/10 transition-colors shadow-xs"
          >
            سداد المديونية ورفع إيصال السداد فوراً
          </button>
        </div>
      ) : null}

      {/* Main Vendor Header */}
      <header className="bg-[#1A1C1F] border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentVendor.logo}
              alt={currentVendor.name}
              className="w-14 h-14 rounded-lg object-cover border border-white/10 bg-[#1A1C1F] shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentVendor.name}</h1>
                {currentVendor.hasPendingSettlement ? (
                  <span className="text-xs bg-amber-400/15 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/25 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    طلب السداد قيد المراجعة
                  </span>
                ) : isFrozen ? (
                  <span className="text-xs bg-red-500/15 text-red-400 font-bold px-2 py-0.5 rounded border border-red-500/25">
                    مجمد مؤقتاً
                  </span>
                ) : (
                  <span className="text-xs bg-[#D1FE17]/15 text-[#D1FE17] font-bold px-2 py-0.5 rounded">
                    نشط ويستقبل طلبات
                  </span>
                )}
              </div>
              <p className="text-xs text-[#898A8B] mt-1">
                {currentVendor.category} · {currentVendor.area} · عمولة المنصة: {currentVendor.commissionRate}%
              </p>
            </div>
          </div>

          {/* Quick Pay & Logout Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPayAmount(Math.min(currentVendor.currentDebt, currentVendor.debtLimit));
                setIsPayModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>سداد جزء من المديونية / تصفير الحساب</span>
            </button>

            <button
              onClick={logoutVendor}
              title="تبديل المتجر / تسجيل الخروج"
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/15 bg-[#1A1C1F] hover:bg-white/5 text-white/80 rounded-md text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تبديل المتجر / خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#1A1C1F] border-b border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#D1FE17] text-white'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>شاشة الطلبات والـ POS</span>
            {activeOrders.length > 0 && (
              <span className="bg-[#D1FE17] text-[#131517] text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'border-[#D1FE17] text-white'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>محفظة المتجر وسقف المديونية</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-[#D1FE17] text-white'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>كتالوج المنتجات والأسعار ({vendorProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB 1: ORDERS & POS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* 1. PROMINENT RED ALERT BANNER: RETURNS ON THE WAY TO STORE */}
            {returningOrders.length > 0 && (
              <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-500/25 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <RotateCcw className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-red-400 flex items-center gap-2">
                        <span>⚠️ مرتجعات في الطريق إليك لاستلامها من الطيار</span>
                        <span className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded-full font-mono">
                          {returningOrders.length}
                        </span>
                      </h3>
                      <p className="text-xs text-red-400 mt-0.5">
                        سجل الطيار رفض العميل أو عدم مناسبة المقاس وهو في طريقه للفرع الآن لإعادة القطع واسترداد الكاش الذي دفعه مسبقاً.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-red-500/15 text-red-400 border border-red-500/50 font-bold px-3 py-1 rounded">
                    عمولة المنصة أُلغيت فوراً من مديونيتك
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {returningOrders.map((retOrder) => (
                    <div
                      key={retOrder.id}
                      className="bg-[#1A1C1F] border border-red-500/50 rounded-lg p-4 flex flex-col justify-between shadow-xs space-y-3"
                    >
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-mono font-bold text-sm text-white">
                            {retOrder.orderNumber}
                          </span>
                          {retOrder.returnCode && (
                            <span className="bg-red-500/15 text-red-400 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-red-500/25">
                              كود المرتجع: {retOrder.returnCode}
                            </span>
                          )}
                        </div>

                        {/* Driver & Reason Box */}
                        <div className="bg-red-500/10 p-3 rounded border border-red-500/25 space-y-2 text-white/90">
                          <div className="text-xs text-red-400 font-medium">
                            <strong className="text-red-400">سبب الإرجاع:</strong>{' '}
                            {retOrder.returnReason || 'العميل رفض الاستلام عند الباب'}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-red-500/25 text-[11px]">
                            <div>
                              <span className="text-[#898A8B]">الكابتن: </span>
                              <strong className="text-white">{retOrder.driverName || 'طيار المنصة'}</strong>
                            </div>
                            {retOrder.driverPhone && (
                              <a
                                href={`tel:${retOrder.driverPhone}`}
                                className="flex items-center gap-1 text-[#D1FE17] bg-[#1A1C1F] border border-[#D1FE17]/25 px-2.5 py-1 rounded font-bold hover:bg-[#D1FE17]/10 transition-colors shadow-2xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{retOrder.driverPhone}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1 py-1">
                          {retOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] text-white/80">
                              <span>
                                {item.product.name} (مقاس {item.size}) × {item.quantity}
                              </span>
                              <span className="font-bold tabular-nums text-white">
                                {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Cash to refund to captain */}
                        <div className="bg-white/[0.06] p-3 rounded border border-white/10 flex items-center justify-between font-bold text-white">
                          <span className="text-xs">المبلغ المستحق إرجاعه كاش للطيار:</span>
                          <span className="text-base text-red-400 tabular-nums">
                            {retOrder.clothesTotal.toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>

                      {/* Confirmation Button */}
                      <button
                        onClick={() => vendorConfirmReturnReceived(retOrder.id)}
                        className="w-full py-2.5 bg-[#D1FE17] hover:bg-white text-[#131517] rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد استلام القطعة المرتجعة سليمة وإرجاع الكاش للطيار</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick POS Rules banner */}
            <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 text-white/80">
                <span className="w-7 h-7 bg-white/[0.06] rounded-full flex items-center justify-center font-bold text-white">
                  كاش
                </span>
                <div>
                  <strong className="text-white">قاعدة الدفع في الفرع:</strong> يدفع لك الطيار
                  قيمة الملابس 100% نقداً فور استلام القطعة في المحل.
                </div>
              </div>
              <div className="text-[#898A8B] text-[11px]">
                تُقيد عمولة المنصة ({currentVendor.commissionRate}%) في محفظتك تلقائياً لحظة تسليم الملابس للطيار، وتُلغى فوراً في حال المرتجع.
              </div>
            </div>

            {/* Orders Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-white/10 text-xs">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'all'
                    ? 'bg-[#D1FE17] text-[#131517]'
                    : 'bg-white/[0.06] text-white/70 hover:bg-white/15'
                }`}
              >
                <span>جميع الطلبات</span>
                <span className="text-[10px] opacity-80 tabular-nums">({vendorOrders.length})</span>
              </button>

              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'pending'
                    ? 'bg-amber-400 text-[#131517]'
                    : 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/15 border border-amber-400/25'
                }`}
              >
                <span>طلبات جديدة بانتظار التجهيز</span>
                {pendingOrders.length > 0 && (
                  <span className="bg-amber-400 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                    {pendingOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setOrderFilter('in_delivery')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'in_delivery'
                    ? 'bg-[#D1FE17] text-[#131517]'
                    : 'bg-white/10 text-white/80 hover:bg-white/10 border border-white/15'
                }`}
              >
                <span>في التوصيل والطيارين</span>
                <span className="text-[10px] opacity-80 tabular-nums">({inDeliveryOrders.length})</span>
              </button>

              <button
                onClick={() => setOrderFilter('returns')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'returns'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/25'
                }`}
              >
                <span>المرتجعات</span>
                {returningOrders.length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums animate-pulse">
                    {returningOrders.length}
                  </span>
                )}
                {returningOrders.length === 0 && (
                  <span className="text-[10px] opacity-80 tabular-nums">({returnsAll.length})</span>
                )}
              </button>

              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'completed'
                    ? 'bg-[#D1FE17] text-[#131517]'
                    : 'bg-white/[0.06] text-white/70 hover:bg-white/15'
                }`}
              >
                <span>المكتملة</span>
                <span className="text-[10px] opacity-80 tabular-nums">({completedOrders.length})</span>
              </button>
            </div>

            {/* Orders Feed */}
            {displayedOrders.length === 0 ? (
              <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-16 text-center">
                <Package className="w-10 h-10 text-white/80 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-white">لا توجد طلبات في هذا القسم حالياً</h3>
                <p className="text-xs text-[#898A8B] mt-1">
                  الطلبات ستظهر هنا بمجرد تحديث حالتها من العملاء أو الطيارين.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedOrders.map((order) => {
                  const isPendingVendor = order.status === 'pending_vendor';
                  const isReadyForDriver = order.status === 'ready_for_driver';
                  const isDriverAssigned = order.status === 'driver_assigned';
                  const isPickedUp = order.status === 'picked_up_paid_store';
                  const isReturning = order.status === 'returning_to_vendor';
                  const isReturnedCompleted = order.status === 'returned_completed' || order.status === 'returned_to_store';
                  const isCancelledByVendor = order.status === 'cancelled_by_vendor';

                  return (
                    <div
                      key={order.id}
                      className={`bg-[#1A1C1F] border rounded-lg p-5 flex flex-col justify-between transition-colors shadow-2xs ${
                        isPendingVendor
                          ? 'border-amber-400/50 bg-amber-400/10'
                          : isReturning
                          ? 'border-red-500/50 bg-red-500/10'
                          : 'border-white/10 hover:border-white/15'
                      }`}
                    >
                      <div>
                        {/* Top info */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <div>
                            <span className="font-mono font-bold text-sm text-white">
                              {order.orderNumber}
                            </span>
                            <span className="text-[#898A8B] text-xs mr-2">· {order.createdAt}</span>
                          </div>
                          <div>
                            {isPendingVendor && (
                              <span className="text-[11px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/50 px-2.5 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-300" />
                                <span>جديد - مطلوب فحص المخزن</span>
                              </span>
                            )}
                            {isReadyForDriver && (
                              <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded">
                                جاهز - في انتظار قبول طيار
                              </span>
                            )}
                            {isDriverAssigned && (
                              <span className="text-[11px] font-bold text-white/80 bg-white/10 border border-white/15 px-2 py-0.5 rounded">
                                طيار في الطريق للمحل
                              </span>
                            )}
                            {isPickedUp && (
                              <span className="text-[11px] font-bold text-[#D1FE17] bg-[#D1FE17]/10 border border-[#D1FE17]/25 px-2 py-0.5 rounded">
                                استلم الطيار ودفع الكاش ✓
                              </span>
                            )}
                            {isReturning && (
                              <span className="text-[11px] font-bold text-red-400 bg-red-500/15 border border-red-500/50 px-2 py-0.5 rounded flex items-center gap-1">
                                <RotateCcw className="w-3 h-3 text-red-400" />
                                <span>مرتجع في الطريق للفرع</span>
                              </span>
                            )}
                            {isReturnedCompleted && (
                              <span className="text-[11px] font-bold text-white/80 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
                                تم استرجاع القطعة ورد الكاش ✓
                              </span>
                            )}
                            {isCancelledByVendor && (
                              <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                                ملغي لعدم توفر المقاس
                              </span>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-[11px] font-bold text-[#D1FE17] bg-[#D1FE17]/10 border border-[#D1FE17]/25 px-2 py-0.5 rounded">
                                تم التوصيل بنجاح ✓
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer & Area */}
                        <div className="py-3 border-b border-white/10 text-xs space-y-1">
                          <div className="text-white/80">
                            <strong>العميل:</strong> {order.customerName} ({order.customerPhone})
                          </div>
                          <div className="text-[#898A8B]">
                            <strong>التوصيل إلى:</strong> {order.customerArea} · {order.customerAddress}
                          </div>
                          {order.notes && (
                            <div className="text-amber-300 bg-amber-400/10 p-1.5 rounded text-[11px] mt-1">
                              ملاحظة العميل: {order.notes}
                            </div>
                          )}
                          {order.returnReason && (
                            <div className="text-red-400 bg-red-500/10 p-1.5 rounded text-[11px] mt-1 border border-red-500/25 font-medium">
                              سبب المرتجع: {order.returnReason}
                            </div>
                          )}
                          {order.vendorRejectedReason && (
                            <div className="text-red-400 bg-red-500/10 p-1.5 rounded text-[11px] mt-1 border border-red-500/25">
                              سبب الإلغاء: {order.vendorRejectedReason}
                            </div>
                          )}
                        </div>

                        {/* Items */}
                        <div className="py-3 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded object-cover border border-white/10"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="font-bold text-white">{item.product.name}</div>
                                  <div className="text-[11px] text-[#898A8B]">
                                    مقاس: {item.size} · كمية: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="font-bold text-white tabular-nums">
                                {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Breakdown & Status Actions */}
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <div className="bg-white/[0.03] p-3 rounded border border-white/10 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">
                              قيمة الملابس المستحقة كاش:
                            </span>
                            <span className="font-extrabold text-sm text-white tabular-nums">
                              {order.clothesTotal.toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-[#898A8B] pt-1 border-t border-white/10">
                            <span>عمولة المنصة ({currentVendor.commissionRate}%):</span>
                            <span className="font-mono text-white/80">
                              {isReturning || isReturnedCompleted || isCancelledByVendor
                                ? '0.0 ج.م (ملغية)'
                                : `${order.vendorCommission.toFixed(1)} ج.م`}
                            </span>
                          </div>
                        </div>

                        {/* ACTION BUTTONS FOR PENDING VENDOR ORDERS */}
                        {isPendingVendor && (
                          <div className="space-y-2 pt-1">
                            <div className="text-[11px] font-bold text-white/80 bg-amber-400/10 p-2 rounded border border-amber-400/25 text-center">
                              ⚠️ افحص مقاس القطعة بالمخزن قبل إرسال طلب للطيارين:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* GREEN BUTTON: CONFIRM STOCK & SEEK DRIVER */}
                              <button
                                onClick={() => vendorConfirmStockAndPrepare(order.id)}
                                className="py-2.5 px-3 bg-[#D1FE17] hover:bg-white text-[#131517] font-bold rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                              >
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>القطعة متوفرة وتم التجهيز - ابحث عن طيار الآن</span>
                              </button>

                              {/* RED BUTTON: OUT OF STOCK CANCEL */}
                              <button
                                onClick={() => vendorCancelOutOfStock(order.id)}
                                className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                              >
                                <X className="w-4 h-4 shrink-0" />
                                <span>المقاس غير متوفر بالمخزن - اعتذار وإلغاء الطلب</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STATUS FEEDBACK FOR OTHER STATES */}
                        {isReadyForDriver && (
                          <div className="text-xs text-amber-300 bg-amber-400/10 p-2 rounded text-center font-medium border border-amber-400/25">
                            الأوردر معروض حالياً في رادار الطيارين القريبين من فرعك للاستلام ودفع الكاش
                          </div>
                        )}

                        {/* DRIVER VISUAL IDENTITY CARD */}
                        {(isDriverAssigned || isPickedUp || isReturning) && order.driverName && (
                          <div className="bg-[#131517] text-white p-3 rounded-lg border border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={order.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                                  alt={order.driverName}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white/15 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white">{order.driverName}</span>
                                    <span className="text-[10px] bg-[#1C1E21] text-white/80 px-1.5 py-0.5 rounded font-mono border border-white/15">
                                      {order.driverVehicleNumber || 'س ب د ٩٥١'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#898A8B] mt-0.5">
                                    {order.driverVehicle || 'سكوتر / دراجة نارية'} · {isReturning ? 'مرتجع واسترداد كاش' : isPickedUp ? 'في طريقه للعميل' : 'في طريقه للمحل للاستلام ودفع الكاش'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {order.driverVehiclePhoto && (
                                  <img
                                    src={order.driverVehiclePhoto}
                                    alt="صورة الدراجة"
                                    className="w-10 h-10 rounded object-cover border border-white/15 hidden sm:block"
                                    title="دراجة الطيار المسجلة"
                                  />
                                )}
                                {order.driverPhone && (
                                  <a
                                    href={`tel:${order.driverPhone}`}
                                    className="px-2.5 py-1.5 bg-[#D1FE17] hover:bg-white text-[#131517] rounded text-[11px] font-bold flex items-center gap-1 shrink-0"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>اتصال</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {isPickedUp && (
                          <div className="text-xs text-[#D1FE17] bg-[#D1FE17]/10 p-2 rounded text-center font-medium border border-[#D1FE17]/25">
                            ✓ تم تسليم الملابس للطيار واستلام {order.clothesTotal} ج.م كاش كاملاً
                          </div>
                        )}

                        {isReturning && (
                          <div className="space-y-2">
                            <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded font-medium border border-red-500/25">
                              الكابتن ({order.driverName}) في طريقه للمحل لإرجاع القطعة واسترداد الـ {order.clothesTotal} ج.م كاش
                            </div>
                            <button
                              onClick={() => vendorConfirmReturnReceived(order.id)}
                              className="w-full py-2 bg-[#D1FE17] hover:bg-white text-[#131517] rounded font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>تأكيد استلام القطعة المرتجعة سليمة وإرجاع الكاش</span>
                            </button>
                          </div>
                        )}

                        {isReturnedCompleted && (
                          <div className="text-xs text-white/80 bg-white/[0.06] p-2 rounded text-center font-medium border border-white/10">
                            ✓ تم إرجاع الملابس للمخزن واسترد الطيار الكاش
                          </div>
                        )}

                        {isCancelledByVendor && (
                          <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded text-center font-medium border border-red-500/25">
                            تم إلغاء الطلب والاعتذار للعميل لعدم توفر المقاس
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WALLET & DEBT LIMIT */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Wallet Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
                <div className="text-xs text-[#898A8B] mb-1">المديونية الحالية للمنصة</div>
                <div className="text-3xl font-bold text-white tabular-nums">
                  {currentVendor.currentDebt.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-[#898A8B]">ج.م</span>
                </div>
                <div className="text-[11px] text-[#898A8B] mt-2">
                  سقف المديونية المسموح: {currentVendor.debtLimit.toLocaleString('ar-EG')} ج.م
                </div>
              </div>

              <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
                <div className="text-xs text-[#898A8B] mb-1">نسبة استهلاك الحد الائتماني</div>
                <div
                  className={`text-3xl font-bold tabular-nums ${
                    isFrozen ? 'text-red-400' : usedPercent >= 80 ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {usedPercent}%
                </div>
                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mt-3 border border-white/10">
                  <div
                    className={`h-full ${
                      isFrozen ? 'bg-red-600' : usedPercent >= 80 ? 'bg-amber-400' : 'bg-[#131517]'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
                <div className="text-xs text-[#898A8B] mb-1">إجمالي مبيعاتك عبر المنصة</div>
                <div className="text-3xl font-bold text-[#D1FE17] tabular-nums">
                  {currentVendor.totalSales.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-[#898A8B]">ج.م</span>
                </div>
                <div className="text-[11px] text-[#898A8B] mt-2">
                  تم استلامها كاش 100% من الطيارين
                </div>
              </div>
            </div>

            {/* Official Settlement Instructions & Transfer Numbers */}
            <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-6">
              <h3 className="font-bold text-sm text-white mb-4">
                طريقة سداد المديونية وفتح الحساب (إنستاباي / فودافون كاش)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* InstaPay */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">1. الدفع عبر إنستاباي (InstaPay)</span>
                    <span className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded font-bold">
                      الأسرع
                    </span>
                  </div>
                  <p className="text-[#898A8B] mb-3">حوّل إلى المعرف اللحظي التابع لإدارة الخزنة:</p>
                  <div className="flex items-center justify-between bg-[#1A1C1F] border border-white/15 p-2.5 rounded font-mono font-bold text-white">
                    <span>{pricingConfig.instapayHandle}</span>
                    <button
                      onClick={() => handleCopy(pricingConfig.instapayHandle)}
                      className="text-[#898A8B] hover:text-white p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Vodafone Cash */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">2. فودافون كاش (Vodafone Cash)</span>
                    <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-bold">
                      محفظة
                    </span>
                  </div>
                  <p className="text-[#898A8B] mb-3">حوّل عبر محفظة فودافون كاش إلى الرقم:</p>
                  <div className="flex items-center justify-between bg-[#1A1C1F] border border-white/15 p-2.5 rounded font-mono font-bold text-white">
                    <span>{pricingConfig.vodafoneCashNumber}</span>
                    <button
                      onClick={() => handleCopy(pricingConfig.vodafoneCashNumber)}
                      className="text-[#898A8B] hover:text-white p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#898A8B]">
                  بعد التحويل، ارفع صورة شاشة التحويل لتصفير مديونيتك فوراً.
                </span>
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="px-5 py-2 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white shadow-xs"
                >
                  رفع إيصال التحويل الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">منتجات وقطع المتجر</h3>
                <p className="text-xs text-[#898A8B]">المعروضة للعملاء مع خيار التوصيل السريع</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D1FE17] text-[#131517] text-xs font-bold rounded-md hover:bg-white shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قطعة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vendorProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-white/[0.06] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-[#131517]/60 backdrop-blur-2xs flex items-center justify-center text-white font-bold text-xs">
                          غير متوفر حالياً
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-[11px] text-[#898A8B]">{p.category}</div>
                      <h4 className="font-bold text-sm text-white">{p.name}</h4>
                      <p className="text-xs text-[#898A8B] line-clamp-2">{p.description}</p>
                      <div className="text-xs font-bold text-white tabular-nums pt-1">
                        {p.price.toLocaleString('ar-EG')} ج.م
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.sizes.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/[0.06] text-white/80 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="py-1.5 px-2 rounded text-xs font-semibold border border-white/15 text-white/90 hover:bg-white/10 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل القطعة</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف قطعة "${p.name}" نهائياً من الكتالوج؟`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="py-1.5 px-2 rounded text-xs font-semibold border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/15 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                    <button
                      onClick={() => toggleProductStock(p.id)}
                      className={`w-full py-1.5 rounded text-xs font-medium border transition-colors ${
                        p.inStock
                          ? 'border-white/15 text-white/80 hover:bg-white/5'
                          : 'border-[#D1FE17] bg-[#D1FE17]/10 text-[#D1FE17] font-bold'
                      }`}
                    >
                      {p.inStock ? 'تعطيل مؤقت للمخزون' : 'تفعيل المخزون مجدداً'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Settlement Upload Receipt Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-white">
              رفع إيصال تحويل المديونية: {currentVendor.name}
            </h3>
            <p className="text-xs text-[#898A8B] mt-1">
              المديونية الحالية: {currentVendor.currentDebt.toLocaleString('ar-EG')} ج.م
            </p>

            <form onSubmit={handlePaySubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  طريقة السداد:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayMethod('instapay');
                      setTransRef(`IPN-${Math.floor(100000 + Math.random() * 900000)}`);
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                      payMethod === 'instapay'
                        ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17] font-bold'
                        : 'border-white/10 text-white/80 hover:bg-white/5'
                    }`}
                  >
                    إنستاباي (InstaPay)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayMethod('vodafone_cash');
                      setTransRef(`VF-${Math.floor(100000 + Math.random() * 900000)}`);
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                      payMethod === 'vodafone_cash'
                        ? 'bg-[#D1FE17] text-[#131517] border-[#D1FE17] font-bold'
                        : 'border-white/10 text-white/80 hover:bg-white/5'
                    }`}
                  >
                    فودافون كاش
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  المبلغ المحول (ج.م):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  رقم العملية المرجعي (Ref / Transaction ID):
                </label>
                <input
                  type="text"
                  required
                  value={transRef}
                  onChange={(e) => setTransRef(e.target.value)}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-mono"
                />
              </div>

              {/* REAL MANDATORY RECEIPT UPLOAD */}
              <div>
                <ImageUploadField
                  label="صورة شاشة إشعار التحويل (Screenshot الإيصال):"
                  value={payReceiptImage}
                  onChange={setPayReceiptImage}
                  required={true}
                  placeholderText="اضغط هنا لرفع سكرين شوت التحويل من جهازك أو التقاط صورة"
                  helperText="إلزامي: يجب إرفاق صورة واضحة لإشعار التحويل البنكي أو المحفظة لاعتماد الإدارة"
                  enableUrlInput={true}
                />
                {!payReceiptImage && (
                  <div className="mt-1 text-[11px] text-red-400 bg-red-500/10 p-2 rounded border border-red-500/25 font-medium">
                    ⚠️ تنبيه: زر الإرسال معطل حتى يتم رفع صورة إيصال التحويل الحقيقي.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  ملاحظات إضافية للإدارة:
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="سداد لتجاوز الليميت وإعادة التفعيل"
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-3 py-1.5 border border-white/10 text-white/80 rounded-md text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!payReceiptImage}
                  className="px-4 py-2 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-opacity"
                >
                  إرسال الإيصال للمراجعة وتصفير المديونية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-white">إضافة قطعة أزياء جديدة للكتالوج</h3>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">اسم القطعة:</label>
                <input
                  type="text"
                  required
                  placeholder="هودي قطن ثقيل أوفرسايز"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">التصنيف:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md bg-[#1A1C1F] focus:outline-none focus:border-[#D1FE17]"
                  >
                    <option value="هوديز وسويت شيرت">هوديز وسويت شيرت</option>
                    <option value="جواكت ومعاطف">جواكت ومعاطف</option>
                    <option value="بناطيل كارجو وجينز">بناطيل كارجو وجينز</option>
                    <option value="تي شيرتات وبولوهات">تي شيرتات وبولوهات</option>
                    <option value="إكسسوارات وكابات">إكسسوارات وكابات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    السعر للعميل (ج.م):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                  />
                </div>
              </div>

              {/* REAL PRODUCT IMAGE UPLOAD */}
              <ImageUploadField
                label="صورة القطعة (إلزامي):"
                value={newProdImage}
                onChange={setNewProdImage}
                required={true}
                placeholderText="اضغط لرفع صورة فوتوغرافية واضحة للقطعة"
                helperText="يمكنك التقاط صورة بالكاميرا أو اختيارها من الجهاز أو وضع رابط"
                enableUrlInput={true}
              />

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  المقاسات المتوفرة (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={newProdSizes}
                  onChange={(e) => setNewProdSizes(e.target.value)}
                  placeholder="S, M, L, XL, XXL"
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  وصف القطعة والخامة:
                </label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={2}
                  placeholder="قطن مصري 100% معالج ضد الانكماش..."
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3 py-1.5 border border-white/10 text-white/80 rounded-md text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newProdImage}
                  className="px-4 py-1.5 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-opacity"
                >
                  نشر القطعة بالمتجر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-white">تعديل بيانات قطعة: {editingProduct.name}</h3>

            <form onSubmit={handleUpdateProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">اسم القطعة:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">التصنيف:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md bg-[#1A1C1F] focus:outline-none focus:border-[#D1FE17]"
                  >
                    <option value="هوديز وسويت شيرت">هوديز وسويت شيرت</option>
                    <option value="جواكت ومعاطف">جواكت ومعاطف</option>
                    <option value="بناطيل كارجو وجينز">بناطيل كارجو وجينز</option>
                    <option value="تي شيرتات وبولوهات">تي شيرتات وبولوهات</option>
                    <option value="إكسسوارات وكابات">إكسسوارات وكابات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    السعر للعميل (ج.م):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                  />
                </div>
              </div>

              {/* REAL PRODUCT IMAGE UPLOAD / UPDATE */}
              <ImageUploadField
                label="تعديل صورة القطعة:"
                value={editImage}
                onChange={setEditImage}
                required={true}
                placeholderText="اضغط لتغيير صورة القطعة من جهازك"
                enableUrlInput={true}
              />

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  المقاسات المتوفرة (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={editSizes}
                  onChange={(e) => setEditSizes(e.target.value)}
                  placeholder="S, M, L, XL, XXL"
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  وصف القطعة والخامة:
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 border border-white/10 text-white/80 rounded-md text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
