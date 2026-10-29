import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { SettlementRequest } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Eye,
  DollarSign,
  PlusCircle,
  Search,
  Filter,
  ArrowDownLeft,
  Store,
  Bike,
  Clock,
  FileCheck,
} from 'lucide-react';

export const AdminSettlements: React.FC = () => {
  const {
    settlements,
    vendors,
    drivers,
    approveSettlement,
    rejectSettlement,
    recordManualCashSettlement,
    setPreviewImage,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'vendors' | 'drivers' | 'history'>('vendors');
  const [rejectModalData, setRejectModalData] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualType, setManualType] = useState<'vendor' | 'driver'>('vendor');
  const [manualEntityId, setManualEntityId] = useState<string>('');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Filter requests by tab
  const pendingVendorSettlements = settlements.filter(
    (s) => s.entityType === 'vendor' && s.status === 'pending'
  );
  const pendingDriverSettlements = settlements.filter(
    (s) => s.entityType === 'driver' && s.status === 'pending'
  );
  const settledHistory = settlements.filter((s) => s.status !== 'pending');

  const displayedList =
    activeTab === 'vendors'
      ? pendingVendorSettlements
      : activeTab === 'drivers'
      ? pendingDriverSettlements
      : settledHistory;

  const handleOpenReject = (s: SettlementRequest) => {
    setRejectModalData({ id: s.id, name: s.entityName });
    setRejectReason('رقم العملية غير مطابق في كشف الحساب البنكي الرسمي');
  };

  const handleConfirmReject = () => {
    if (!rejectModalData) return;
    rejectSettlement(rejectModalData.id, rejectReason || 'تم الرفض لعدم ثبوت وصول التحويل');
    setRejectModalData(null);
    setRejectReason('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(manualAmount);
    if (!manualEntityId || isNaN(amountNum) || amountNum <= 0) return;

    recordManualCashSettlement(manualType, manualEntityId, amountNum, manualNotes);
    setIsManualModalOpen(false);
    setManualAmount('');
    setManualNotes('');
  };

  const openReceiptPreview = (s: SettlementRequest) => {
    setPreviewImage({
      url: s.receiptImageUrl,
      title: `إيصال تحويل: ${s.entityName}`,
      subtitle: `المبلغ: ${s.amount.toLocaleString('ar-EG')} ج.م · مرجع: ${s.transactionRef} · ${s.method}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Manual Cash Action */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-950">
              خزنة التحصيل واعتماد السدادات (Settlements Vault)
            </h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              معاينة الإيصالات وتصفير المديونيات
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            فحص صور التحويلات البنكية ومطابقتها مع كشف إنستاباي وفودافون كاش لفتح الحسابات المجمدة
          </p>
        </div>

        <button
          onClick={() => {
            setManualEntityId(manualType === 'vendor' ? vendors[0]?.id : drivers[0]?.id);
            setIsManualModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-md hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تسديد نقدي يدوي بالخزنة</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'vendors'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>تحويلات المحلات المعلقة</span>
          {pendingVendorSettlements.length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
              {pendingVendorSettlements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'drivers'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>تحويلات الطيارين المعلقة</span>
          {pendingDriverSettlements.length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
              {pendingDriverSettlements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>سجل التسويات المعتمدة والمدفوعات ({settledHistory.length})</span>
        </button>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        {displayedList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CheckCircle2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-900">لا توجد طلبات تسوية معلقة في هذا القسم</h4>
            <p className="text-xs text-zinc-500 mt-1">
              جميع المحلات والطيارين قاموا بتسوية الذمم أو ليس لديهم إيصالات تنتظر المراجعة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-medium">الجهة / الطرف</th>
                  <th className="px-4 py-3 font-medium">المبلغ المسدد</th>
                  <th className="px-4 py-3 font-medium">طريقة الدفع</th>
                  <th className="px-4 py-3 font-medium">رقم المعاملة / المرجع</th>
                  <th className="px-4 py-3 font-medium">تاريخ ووقت التحويل</th>
                  <th className="px-4 py-3 font-medium">صورة الإيصال</th>
                  <th className="px-4 py-3 font-medium">الحالة الحالية</th>
                  <th className="px-4 py-3 font-medium text-center">الإجراء المالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {displayedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-950">{item.entityName}</div>
                        <div className="text-[11px] text-zinc-500">
                          {item.entityType === 'vendor' ? 'براند أزياء' : 'كابتن توصيل'} · {item.entityArea || 'القاهرة'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-sm text-zinc-950 tabular-nums">
                        {item.amount.toLocaleString('ar-EG')}{' '}
                        <span className="text-[11px] font-normal text-zinc-500">ج.م</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-800">
                          {item.method === 'instapay'
                            ? 'إنستاباي (IPN)'
                            : item.method === 'vodafone_cash'
                            ? 'فودافون كاش'
                            : item.method === 'cash_office'
                            ? 'كاش بخزنة الإدارة'
                            : 'تحويل بنكي'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-700">
                        {item.transactionRef}
                      </td>

                      <td className="px-4 py-3.5 text-zinc-600 text-[11px]">
                        {item.createdAt}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => openReceiptPreview(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-600" />
                          <span>معاينة الإيصال</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        {item.status === 'pending' && (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            بانتظار الفحص
                          </span>
                        )}
                        {item.status === 'approved' && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            معتمد ومصفّر
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <div>
                            <span className="text-red-600 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              مرفوض
                            </span>
                            {item.rejectionReason && (
                              <div className="text-[10px] text-red-500 mt-0.5 max-w-[150px] truncate">
                                {item.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            {/* Approve button */}
                            <button
                              onClick={() => approveSettlement(item.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-semibold text-[11px] transition-colors shadow-xs"
                            >
                              تأكيد الاستلام وفتح الحساب
                            </button>

                            {/* Reject button */}
                            <button
                              onClick={() => handleOpenReject(item)}
                              className="px-2.5 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 font-medium text-[11px] transition-colors"
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">
                            {item.resolvedAt || 'تم الإجراء'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal with Reason */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-zinc-950">
              رفض إيصال التحويل: {rejectModalData.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              سيتم إشعار الطرف بسبب الرفض ولن يتم خصم المديونية حتى يقدم إيصالاً صحيحاً.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                سبب الرفض:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 border border-zinc-300 rounded-md focus:outline-none focus:border-red-600"
                placeholder="اكتب سبب الرفض هنا..."
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalData(null)}
                className="px-3 py-1.5 border border-zinc-200 text-zinc-700 rounded-md text-xs font-medium hover:bg-zinc-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 text-white rounded-md text-xs font-bold hover:bg-red-700 shadow-xs"
              >
                تأكيد الرفض والإشعار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Cash Office Settlement Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-zinc-950">
              تسجيل توريد نقدي يدوي بالخزنة (Manual Cash Settlement)
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              استلام نقدية كاش مباشرة من مندوب المحل أو الطيار في مقر الشركة وتصفير مديونيته فورياً.
            </p>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">نوع الطرف:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualType('vendor');
                      setManualEntityId(vendors[0]?.id || '');
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                      manualType === 'vendor'
                        ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    محل أزياء / براند
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualType('driver');
                      setManualEntityId(drivers[0]?.id || '');
                    }}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                      manualType === 'driver'
                        ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    كابتن توصيل (طيار)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  اختر الطرف:
                </label>
                <select
                  value={manualEntityId}
                  onChange={(e) => setManualEntityId(e.target.value)}
                  className="w-full text-xs p-2 border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-zinc-900"
                >
                  {manualType === 'vendor'
                    ? vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (المديونية: {v.currentDebt.toLocaleString('ar-EG')} ج.م)
                        </option>
                      ))
                    : drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (المديونية: {d.currentDebt.toLocaleString('ar-EG')} ج.م)
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  المبلغ المسدد نقداً (ج.م):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="مثال: 2500"
                  className="w-full text-xs p-2 border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  ملاحظات أمين الخزنة:
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="تم الاستلام كاش يد بيد في مقر التجمع"
                  className="w-full text-xs p-2 border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-200 text-zinc-700 rounded-md text-xs font-medium hover:bg-zinc-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 shadow-xs"
                >
                  تأكيد التوريد وتصفير المديونية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
