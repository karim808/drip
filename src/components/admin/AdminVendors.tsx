import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Vendor } from '../../types';
import {
  Store,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sliders,
  Power,
  Search,
  ExternalLink,
  Percent,
  Coins,
  Star,
} from 'lucide-react';

export const AdminVendors: React.FC = () => {
  const {
    vendors,
    orders,
    updateVendorCommissionAndLimit,
    toggleVendorStatus,
    approvePendingVendor,
    rejectPendingVendor,
    addVendorManual,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editModalVendor, setEditModalVendor] = useState<Vendor | null>(null);
  const [editCommission, setEditCommission] = useState<number>(15);
  const [editLimit, setEditLimit] = useState<number>(5000);

  const [approveModalVendor, setApproveModalVendor] = useState<Vendor | null>(null);
  const [approveCommission, setApproveCommission] = useState<number>(15);
  const [approveLimit, setApproveLimit] = useState<number>(5000);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPassword, setNewVendorPassword] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorArea, setNewVendorArea] = useState('المعادي');
  const [newVendorAddress, setNewVendorAddress] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('ملابس ستريت وير وهوديز');
  const [newVendorCommission, setNewVendorCommission] = useState(15);
  const [newVendorLimit, setNewVendorLimit] = useState(5000);

  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const activeVendorsList = vendors.filter((v) => v.status !== 'pending');

  const filteredActiveVendors = activeVendorsList.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (vendor: Vendor) => {
    setEditModalVendor(vendor);
    setEditCommission(vendor.commissionRate);
    setEditLimit(vendor.debtLimit);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalVendor) return;
    updateVendorCommissionAndLimit(editModalVendor.id, editCommission, editLimit);
    setEditModalVendor(null);
  };

  const handleOpenApprove = (vendor: Vendor) => {
    setApproveModalVendor(vendor);
    setApproveCommission(vendor.commissionRate || 15);
    setApproveLimit(vendor.debtLimit || 5000);
  };

  const handleConfirmApprove = () => {
    if (!approveModalVendor) return;
    approvePendingVendor(approveModalVendor.id, approveCommission, approveLimit);
    setApproveModalVendor(null);
  };

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newVendorEmail || !newVendorPhone || !newVendorPassword) return;

    const slug = newVendorName.toLowerCase().replace(/\s+/g, '-');
    addVendorManual({
      name: newVendorName,
      slug,
      email: newVendorEmail.trim().toLowerCase(),
      password: newVendorPassword,
      phone: newVendorPhone,
      area: newVendorArea,
      address: newVendorAddress || `${newVendorArea}، القاهرة`,
      category: newVendorCategory,
      logo: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=300&auto=format&fit=crop&q=80',
      commissionRate: newVendorCommission,
      debtLimit: newVendorLimit,
      status: 'active',
      instagramHandle: `@${newVendorName.toLowerCase().replace(/\s+/g, '')}`,
    });

    setIsAddModalOpen(false);
    setNewVendorName('');
    setNewVendorEmail('');
    setNewVendorPassword('');
    setNewVendorPhone('');
    setNewVendorAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              إدارة البراندات ومحلات الأزياء (Vendors Management)
            </h2>
            <span className="text-[11px] bg-white/[0.06] text-white/90 px-2 py-0.5 rounded font-mono">
              {activeVendorsList.length} متجر مسجل
            </span>
          </div>
          <p className="text-xs text-[#898A8B] mt-1">
            متابعة نسب العمولات، حدود المديونية الائتمانية، والإغلاق الفوري للمتجاوزين للحد
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#D1FE17] text-[#131517] text-xs font-semibold rounded-md hover:bg-white transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة براند جديد يدوياً</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-[#D1FE17] text-white'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>المحلات النشطة ({activeVendorsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-[#D1FE17] text-white'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>طلبات الانضمام الجديدة</span>
            {pendingVendors.length > 0 && (
              <span className="bg-amber-400 text-[#131517] text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingVendors.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'active' && (
          <div className="relative pb-2">
            <input
              type="text"
              placeholder="ابحث بالاسم أو المنطقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-[#1A1C1F] border border-white/10 rounded-md pr-8 pl-3 py-1.5 w-60 focus:outline-none focus:border-[#D1FE17]"
            />
            <Search className="w-3.5 h-3.5 text-[#898A8B] absolute right-2.5 top-3" />
          </div>
        )}
      </div>

      {/* Active Vendors List */}
      {activeTab === 'active' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] text-[#898A8B] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">البراند / المتجر</th>
                  <th className="px-4 py-3 font-medium">المنطقة والفرع</th>
                  <th className="px-4 py-3 font-medium">إجمالي المبيعات</th>
                  <th className="px-4 py-3 font-medium text-center">العمولة %</th>
                  <th className="px-4 py-3 font-medium">سقف المديونية</th>
                  <th className="px-4 py-3 font-medium">المديونية الحالية واستنزاف الليميت</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredActiveVendors.map((vendor) => {
                  const usedPercent = Math.min(
                    100,
                    Math.round((vendor.currentDebt / (vendor.debtLimit || 1)) * 100)
                  );
                  const isNearLimit = usedPercent >= 80 && usedPercent < 100;
                  const isOverLimit = vendor.currentDebt >= vendor.debtLimit;

                  const ratedVendorOrders = orders.filter(
                    (o) => o.vendorId === vendor.id && typeof o.vendorRating === 'number'
                  );
                  const avgVendorRating =
                    ratedVendorOrders.length > 0
                      ? (
                          ratedVendorOrders.reduce((s, o) => s + (o.vendorRating || 5), 0) /
                          ratedVendorOrders.length
                        ).toFixed(1)
                      : '4.9';

                  return (
                    <tr key={vendor.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="w-9 h-9 rounded object-cover border border-white/10 bg-white/[0.06] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{vendor.name}</span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/25 px-1.5 py-0.2 rounded">
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                {avgVendorRating}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#898A8B]">{vendor.category}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-white/80">
                        <div>{vendor.area}</div>
                        <div className="text-[11px] text-[#898A8B] font-mono">{vendor.phone}</div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-white tabular-nums">
                        {vendor.totalSales.toLocaleString('ar-EG')}{' '}
                        <span className="text-[10px] font-normal text-[#898A8B]">ج.م</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block bg-white/[0.06] font-bold px-2 py-0.5 rounded text-white font-mono">
                          {vendor.commissionRate}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold tabular-nums text-white/90">
                        {vendor.debtLimit.toLocaleString('ar-EG')}{' '}
                        <span className="text-[10px] font-normal text-[#898A8B]">ج.م</span>
                      </td>

                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold tabular-nums text-white">
                            {vendor.currentDebt.toLocaleString('ar-EG')} ج.م
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              isOverLimit
                                ? 'text-red-400'
                                : isNearLimit
                                ? 'text-amber-300'
                                : 'text-white/70'
                            }`}
                          >
                            {usedPercent}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden border border-white/10">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isOverLimit
                                ? 'bg-red-600'
                                : isNearLimit
                                ? 'bg-amber-400'
                                : 'bg-[#131517]'
                            }`}
                            style={{ width: `${usedPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {vendor.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D1FE17] bg-[#D1FE17]/10 border border-[#D1FE17]/25 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> نشط
                          </span>
                        )}
                        {vendor.status === 'frozen' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> مجمد (سقف المديونية)
                          </span>
                        )}
                        {vendor.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/70 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
                            موقوف إدارياً
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Commission & Limit */}
                          <button
                            onClick={() => handleOpenEdit(vendor)}
                            title="تعديل النسبة والليميت"
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active/Freeze */}
                          <button
                            onClick={() => toggleVendorStatus(vendor.id)}
                            title={vendor.status === 'active' ? 'إيقاف المتجر' : 'تفعيل المتجر'}
                            className={`p-1.5 rounded transition-colors ${
                              vendor.status === 'active'
                                ? 'text-[#898A8B] hover:text-red-400 hover:bg-red-500/10'
                                : 'text-[#D1FE17] hover:bg-[#D1FE17]/10'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Onboarding Vendors */}
      {activeTab === 'pending' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden">
          {pendingVendors.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CheckCircle2 className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">لا توجد طلبات انضمام جديدة للمحلات</h4>
              <p className="text-xs text-[#898A8B] mt-1">
                تمت مراجعة جميع طلبات التسجيل المقدمة مسبقاً.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-white/10 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 hover:border-white/15 transition-colors bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={vendor.logo}
                      alt={vendor.name}
                      className="w-12 h-12 rounded object-cover border border-white/10 bg-[#1A1C1F]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{vendor.name}</h4>
                      <p className="text-xs text-white/70 mt-0.5">{vendor.category}</p>
                      <div className="text-[11px] text-[#898A8B] mt-1 flex items-center gap-2">
                        <span>المنطقة: {vendor.area}</span>
                        <span>·</span>
                        <span>الهاتف: {vendor.phone}</span>
                        {vendor.instagramHandle && (
                          <>
                            <span>·</span>
                            <span>انستجرام: {vendor.instagramHandle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenApprove(vendor)}
                      className="px-4 py-2 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white transition-colors shadow-xs"
                    >
                      قبول وتحديد النسبة والليميت
                    </button>
                    <button
                      onClick={() => rejectPendingVendor(vendor.id)}
                      className="px-3 py-2 bg-[#1A1C1F] border border-red-500/25 text-red-400 rounded-md text-xs font-medium hover:bg-red-500/10 transition-colors"
                    >
                      رفض الطلب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Commission & Limit Modal */}
      {editModalVendor && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-white">
              تعديل الشروط المالية: {editModalVendor.name}
            </h3>
            <p className="text-xs text-[#898A8B] mt-1">
              المديونية الحالية: {editModalVendor.currentDebt.toLocaleString('ar-EG')} ج.م
            </p>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  نسبة عمولة المنصة من مبيعات الملابس (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    required
                    value={editCommission}
                    onChange={(e) => setEditCommission(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 border border-white/15 rounded-md pr-8 focus:outline-none focus:border-[#D1FE17] font-bold"
                  />
                  <Percent className="w-3.5 h-3.5 text-[#898A8B] absolute right-2.5 top-3.5" />
                </div>
                <p className="text-[11px] text-[#898A8B] mt-1">
                  تُخصم كمديونية على المحل لحظة استلام الطيار للملابس كاش
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  سقف المديونية الائتمانية (Debt Limit ج.م):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="500"
                    step="250"
                    required
                    value={editLimit}
                    onChange={(e) => setEditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 border border-white/15 rounded-md pr-8 focus:outline-none focus:border-[#D1FE17] font-bold"
                  />
                  <Coins className="w-3.5 h-3.5 text-[#898A8B] absolute right-2.5 top-3.5" />
                </div>
                <p className="text-[11px] text-[#898A8B] mt-1">
                  إذا بلغت مديونية المحل هذا السقف، يُغلق المتجر تلقائياً حتى السداد
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditModalVendor(null)}
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

      {/* Approve Pending Vendor Modal */}
      {approveModalVendor && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-white">
              الموافقة وتفعيل متجر: {approveModalVendor.name}
            </h3>
            <p className="text-xs text-[#898A8B] mt-1">
              حدد النسبة المئوية المخصومة وسقف المديونية قبل إتاحة منتجاته للعملاء.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  نسبة العمولة من بيع الملابس (%):
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  step="1"
                  value={approveCommission}
                  onChange={(e) => setApproveCommission(parseFloat(e.target.value) || 15)}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  سقف المديونية الأقصى (Limit ج.م):
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={approveLimit}
                  onChange={(e) => setApproveLimit(parseFloat(e.target.value) || 5000)}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setApproveModalVendor(null)}
                  className="px-3 py-1.5 border border-white/10 text-white/80 rounded-md text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="px-4 py-1.5 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white shadow-xs"
                >
                  تأكيد الاعتماد ونشر المتجر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-white">إضافة براند أزياء جديد يدوياً</h3>
            <p className="text-xs text-[#898A8B] mt-1">
              تسجيل متجر محلي فوراً في قاعدة بيانات المنصة وتحديد حدوده المالية.
            </p>

            <form onSubmit={handleAddVendorSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    اسم البراند / المتجر:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: OVERSIZED CLUB"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    رقم الهاتف / الواتساب:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    البريد الإلكتروني للدخول:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="brand@dripfit.eg"
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md font-mono focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    كلمة المرور الأولية:
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newVendorPassword}
                    onChange={(e) => setNewVendorPassword(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md font-mono focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">المنطقة:</label>
                  <select
                    value={newVendorArea}
                    onChange={(e) => setNewVendorArea(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md bg-[#1A1C1F] focus:outline-none focus:border-[#D1FE17]"
                  >
                    <option value="المعادي">المعادي</option>
                    <option value="الزمالك">الزمالك</option>
                    <option value="التجمع الخامس">التجمع الخامس</option>
                    <option value="مصر الجديدة">مصر الجديدة</option>
                    <option value="الشيخ زايد">الشيخ زايد</option>
                    <option value="الدقي والمهندسين">الدقي والمهندسين</option>
                    <option value="مدينة نصر">مدينة نصر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    التصنيف الرئيسي:
                  </label>
                  <input
                    type="text"
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  العنوان التفصيلي للفرع:
                </label>
                <input
                  type="text"
                  placeholder="شارع 9، المعادي، القاهرة"
                  value={newVendorAddress}
                  onChange={(e) => setNewVendorAddress(e.target.value)}
                  className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    عمولة المتجر (%):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="40"
                    value={newVendorCommission}
                    onChange={(e) => setNewVendorCommission(parseFloat(e.target.value) || 15)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    سقف المديونية (Limit ج.م):
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newVendorLimit}
                    onChange={(e) => setNewVendorLimit(parseFloat(e.target.value) || 5000)}
                    className="w-full text-xs p-2 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-white/10 text-white/80 rounded-md text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white shadow-xs"
                >
                  إضافة وتفعيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
