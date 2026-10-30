import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Driver } from '../../types';
import {
  Bike,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Power,
  Search,
  Eye,
  ShieldAlert,
  Flame,
  Star,
} from 'lucide-react';
import { AdminOrderDensityHeatmap } from '../maps/AdminOrderDensityHeatmap';

export const AdminDrivers: React.FC = () => {
  const {
    drivers,
    orders,
    vendors,
    updateDriverLimit,
    toggleDriverStatus,
    approvePendingDriver,
    rejectPendingDriver,
    setPreviewImage,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'heatmap'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const [editLimitDriver, setEditLimitDriver] = useState<Driver | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<number>(1000);

  const pendingDrivers = drivers.filter((d) => d.status === 'pending');
  const activeDriversList = drivers.filter((d) => d.status !== 'pending');

  const filteredActiveDrivers = activeDriversList.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (driver: Driver) => {
    setEditLimitDriver(driver);
    setEditLimitVal(driver.debtLimit);
  };

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLimitDriver) return;
    updateDriverLimit(editLimitDriver.id, editLimitVal);
    setEditLimitDriver(null);
  };

  const previewDoc = (title: string, subtitle: string, url: string) => {
    setPreviewImage({
      title,
      subtitle,
      url,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              إدارة أسطول كباتن التوصيل (Drivers & Fleet Management)
            </h2>
            <span className="text-[11px] bg-white/[0.06] text-white/90 px-2 py-0.5 rounded font-mono">
              {activeDriversList.length} كابتن نشط
            </span>
          </div>
          <p className="text-xs text-[#898A8B] mt-1">
            متابعة رصيد مديونية عمولات التوصيل (سقف 1,000 ج.م)، فحص الرخص والبطاقات، وتفعيل الطيارين
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#898A8B]">
            الطيارون المتصلون الآن:{' '}
            <strong className="text-[#D1FE17]">
              {activeDriversList.filter((d) => d.isOnline).length} متصل
            </strong>
          </div>
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
            <Bike className="w-3.5 h-3.5" />
            <span>كباتن الأسطول النشط ({activeDriversList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-[#D1FE17] text-white'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>طلبات انضمام كباتن جدد (فحص الأوراق)</span>
            {pendingDrivers.length > 0 && (
              <span className="bg-amber-400 text-[#131517] text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingDrivers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'heatmap'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-[#898A8B] hover:text-white/90'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>خريطة الكثافة الحرارية ومناطق التوظيف (Heatmap)</span>
          </button>
        </div>

        {activeTab === 'active' && (
          <div className="relative pb-2">
            <input
              type="text"
              placeholder="ابحث باسم الكابتن أو المنطقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-[#1A1C1F] border border-white/10 rounded-md pr-8 pl-3 py-1.5 w-60 focus:outline-none focus:border-[#D1FE17]"
            />
            <Search className="w-3.5 h-3.5 text-[#898A8B] absolute right-2.5 top-3" />
          </div>
        )}
      </div>

      {/* Active Drivers Table */}
      {activeTab === 'active' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] text-[#898A8B] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">الكابتن</th>
                  <th className="px-4 py-3 font-medium">المركبة ولوحة الأرقام</th>
                  <th className="px-4 py-3 font-medium">نطاق التغطية</th>
                  <th className="px-4 py-3 font-medium">المشاوير المكتملة</th>
                  <th className="px-4 py-3 font-medium">أرباح الكابتن الصافية</th>
                  <th className="px-4 py-3 font-medium">مديونية المنصة (سقف 1000 ج)</th>
                  <th className="px-4 py-3 font-medium">مستندات الهوية</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredActiveDrivers.map((driver) => {
                  const usedPercent = Math.min(
                    100,
                    Math.round((driver.currentDebt / (driver.debtLimit || 1)) * 100)
                  );
                  const isOverLimit = driver.currentDebt >= driver.debtLimit;
                  const isNearLimit = usedPercent >= 80 && usedPercent < 100;

                  const ratedDriverOrders = orders.filter(
                    (o) => o.driverId === driver.id && typeof o.driverRating === 'number'
                  );
                  const avgDriverRating =
                    ratedDriverOrders.length > 0
                      ? (
                          ratedDriverOrders.reduce((s, o) => s + (o.driverRating || 5), 0) /
                          ratedDriverOrders.length
                        ).toFixed(1)
                      : '4.9';

                  return (
                    <tr key={driver.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              driver.isOnline ? 'bg-[#D1FE17]' : 'bg-white/20'
                            }`}
                            title={driver.isOnline ? 'متصل' : 'غير متصل'}
                          />
                          {driver.avatarPhoto ? (
                            <img
                              src={driver.avatarPhoto}
                              alt={driver.name}
                              onClick={() => previewDoc(`الصورة الشخصية: ${driver.name}`, driver.phone, driver.avatarPhoto || '')}
                              className="w-8 h-8 rounded-full object-cover border border-white/10 cursor-pointer shrink-0 hover:opacity-80"
                              title="اضغط لمعاينة الصورة"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[#898A8B] shrink-0 text-xs font-bold">
                              {driver.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{driver.name}</span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/25 px-1.5 py-0.2 rounded">
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                {avgDriverRating}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#898A8B] font-mono">{driver.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-white/80">
                        <div>{driver.vehicle}</div>
                        <div className="text-[11px] text-[#898A8B] font-mono">{driver.vehicleNumber}</div>
                      </td>

                      <td className="px-4 py-3.5 text-white/80">{driver.area}</td>

                      <td className="px-4 py-3.5 font-bold text-white tabular-nums">
                        {driver.totalTrips} مشوار
                      </td>

                      <td className="px-4 py-3.5 font-bold text-[#D1FE17] tabular-nums">
                        {driver.totalDeliveryEarnings.toLocaleString('ar-EG')}{' '}
                        <span className="text-[10px] font-normal text-[#898A8B]">ج.م</span>
                      </td>

                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold tabular-nums text-white">
                            {driver.currentDebt.toLocaleString('ar-EG')} / {driver.debtLimit.toLocaleString('ar-EG')} ج.م
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
                        <div className="flex flex-wrap items-center gap-1">
                          {driver.avatarPhoto && (
                            <button
                              onClick={() => previewDoc(`الصورة الشخصية (السيلفي): ${driver.name}`, driver.phone, driver.avatarPhoto || '')}
                              className="text-[10px] bg-white/[0.06] hover:bg-white/15 text-white/90 px-1.5 py-0.5 rounded font-medium"
                            >
                              السيلفي
                            </button>
                          )}
                          {driver.vehiclePhoto && (
                            <button
                              onClick={() => previewDoc(`صورة دراجة الكابتن واللوحة: ${driver.name}`, `مركبة: ${driver.vehicle} (${driver.vehicleNumber})`, driver.vehiclePhoto || '')}
                              className="text-[10px] bg-white/[0.06] hover:bg-white/15 text-white/90 px-1.5 py-0.5 rounded font-medium"
                            >
                              الدراجة
                            </button>
                          )}
                          <button
                            onClick={() =>
                              previewDoc(
                                `بطاقة الرقم القومي: ${driver.name}`,
                                `الرقم: ${driver.nationalId}`,
                                driver.nationalIdPhoto
                              )
                            }
                            className="text-[10px] bg-white/[0.06] hover:bg-white/15 text-white/90 px-1.5 py-0.5 rounded font-medium"
                          >
                            البطاقة
                          </button>
                          <button
                            onClick={() =>
                              previewDoc(
                                `رخصة القيادة: ${driver.name}`,
                                `المركبة: ${driver.vehicle}`,
                                driver.licensePhoto
                              )
                            }
                            className="text-[10px] bg-white/[0.06] hover:bg-white/15 text-white/90 px-1.5 py-0.5 rounded font-medium"
                          >
                            الرخصة
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {driver.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D1FE17] bg-[#D1FE17]/10 border border-[#D1FE17]/25 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> متاح للعمل
                          </span>
                        )}
                        {driver.status === 'frozen' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> موقوف لتجاوز الـ 1000 ج
                          </span>
                        )}
                        {driver.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/70 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
                            موقوف إدارياً
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(driver)}
                            title="تعديل سقف المديونية"
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleDriverStatus(driver.id)}
                            title={driver.status === 'active' ? 'إيقاف الطيار' : 'تفعيل الطيار'}
                            className={`p-1.5 rounded transition-colors ${
                              driver.status === 'active'
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

      {/* Pending Drivers Onboarding Tab */}
      {activeTab === 'pending' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden">
          {pendingDrivers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CheckCircle2 className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">لا توجد طلبات كباتن بانتظار الفحص</h4>
              <p className="text-xs text-[#898A8B] mt-1">
                جميع أوراق المتقدمين تم فحصها والموافقة عليها.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {pendingDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="border border-white/10 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 hover:border-white/15 transition-colors bg-white/[0.03]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{driver.name}</h4>
                      <span className="text-[10px] bg-white/10 text-white/90 px-2 py-0.5 rounded font-mono">
                        {driver.vehicle} · {driver.vehicleNumber}
                      </span>
                    </div>
                    <div className="text-xs text-white/70">
                      الهاتف: <span className="font-mono">{driver.phone}</span> · المنطقة: {driver.area}
                    </div>
                    <div className="text-[11px] text-[#898A8B]">
                      الرقم القومي: <span className="font-mono">{driver.nationalId}</span>
                    </div>

                    {/* 4 Inspection buttons for KYC */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {driver.avatarPhoto && (
                        <button
                          onClick={() =>
                            previewDoc(
                              `معاينة سيلفي الكابتن: ${driver.name}`,
                              `الهاتف: ${driver.phone}`,
                              driver.avatarPhoto || ''
                            )
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-[#1A1C1F] border border-white/10 px-3 py-1 rounded hover:bg-white/10"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#898A8B]" />
                          <span>صورة السيلفي</span>
                        </button>
                      )}

                      {driver.vehiclePhoto && (
                        <button
                          onClick={() =>
                            previewDoc(
                              `معاينة دراجة الكابتن واللوحة: ${driver.name}`,
                              `لوحة: ${driver.vehicleNumber}`,
                              driver.vehiclePhoto || ''
                            )
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-[#1A1C1F] border border-white/10 px-3 py-1 rounded hover:bg-white/10"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#898A8B]" />
                          <span>صورة الدراجة واللوحة</span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          previewDoc(
                            `معاينة بطاقة الرقم القومي: ${driver.name}`,
                            `الرقم القومي: ${driver.nationalId}`,
                            driver.nationalIdPhoto
                          )
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-[#1A1C1F] border border-white/10 px-3 py-1 rounded hover:bg-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#898A8B]" />
                        <span>صورة البطاقة</span>
                      </button>

                      <button
                        onClick={() =>
                          previewDoc(
                            `معاينة رخصة القيادة: ${driver.name}`,
                            `مركبة: ${driver.vehicle} (${driver.vehicleNumber})`,
                            driver.licensePhoto
                          )
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-[#1A1C1F] border border-white/10 px-3 py-1 rounded hover:bg-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#898A8B]" />
                        <span>صورة الرخصة</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approvePendingDriver(driver.id, 1000)}
                      className="px-4 py-2 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white transition-colors shadow-xs"
                    >
                      اعتماد الأوراق وتفعيل الحساب (ليميت 1000 ج)
                    </button>
                    <button
                      onClick={() => rejectPendingDriver(driver.id)}
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

      {/* Order Density & Driver Recruitment Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <AdminOrderDensityHeatmap
          orders={orders}
          drivers={drivers}
          vendors={vendors}
          onSwitchToDriversSection={() => setActiveTab('pending')}
        />
      )}

      {/* Edit Limit Modal */}
      {editLimitDriver && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-white">
              تعديل سقف مديونية الكابتن: {editLimitDriver.name}
            </h3>
            <p className="text-xs text-[#898A8B] mt-1">
              المديونية الحالية: {editLimitDriver.currentDebt.toLocaleString('ar-EG')} ج.م
            </p>

            <form onSubmit={handleSaveLimit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  سقف المديونية الأقصى (Limit ج.م):
                </label>
                <input
                  type="number"
                  min="200"
                  max="10000"
                  step="100"
                  required
                  value={editLimitVal}
                  onChange={(e) => setEditLimitVal(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-white/15 rounded-md focus:outline-none focus:border-[#D1FE17] font-bold"
                />
                <p className="text-[11px] text-[#898A8B] mt-1">
                  إذا وصل الطيار لهذا المبلغ يتوقف عن استقبال المشاوير حتى يرفع إيصال سداد
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditLimitDriver(null)}
                  className="px-3 py-1.5 border border-white/10 text-white/80 rounded-md text-xs font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#D1FE17] text-[#131517] rounded-md text-xs font-bold hover:bg-white shadow-xs"
                >
                  حفظ السقف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
