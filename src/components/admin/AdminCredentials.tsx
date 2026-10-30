import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  KeyRound,
  Search,
  ShieldCheck,
  Store,
  Bike,
  User,
  Edit3,
  Lock,
  X,
  Mail,
} from 'lucide-react';

export const AdminCredentials: React.FC = () => {
  const {
    vendors,
    drivers,
    customers,
    updateUserPassword,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'vendors' | 'drivers' | 'customers'>('vendors');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset password modal state (passwords are hashed server-side; never displayed in plaintext)
  const [editingUser, setEditingUser] = useState<{
    type: 'vendor' | 'driver' | 'customer';
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (
    type: 'vendor' | 'driver' | 'customer',
    id: string,
    name: string,
    email: string
  ) => {
    setEditingUser({ type, id, name, email });
    setNewPasswordValue('');
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !newPasswordValue.trim() || isSaving) return;
    setIsSaving(true);
    const ok = await updateUserPassword(editingUser.type, editingUser.id, newPasswordValue.trim());
    setIsSaving(false);
    if (ok) {
      setEditingUser(null);
      setNewPasswordValue('');
    }
  };

  // Filtered lists
  const query = searchQuery.toLowerCase().trim();

  const filteredVendors = vendors.filter(
    (v) =>
      !query ||
      v.name.toLowerCase().includes(query) ||
      v.email.toLowerCase().includes(query) ||
      v.phone.includes(query) ||
      v.area.toLowerCase().includes(query) ||
      v.id.toLowerCase().includes(query)
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      !query ||
      d.name.toLowerCase().includes(query) ||
      d.email.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      d.area.toLowerCase().includes(query) ||
      d.vehicle.toLowerCase().includes(query) ||
      d.id.toLowerCase().includes(query)
  );

  const filteredCustomers = customers.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.area.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#1A1C1F] border border-white/10 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D1FE17] text-[#131517] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                دليل الحسابات وإدارة الصلاحيات (Accounts & Security Directory)
              </h2>
              <p className="text-xs text-[#898A8B] mt-0.5">
                إدارة حسابات البريد الإلكتروني للمتاجر، الكباتن، والعملاء، مع إمكانية إعادة تعيين كلمات المرور المشفرة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white/[0.06] text-white/90 border border-white/10 px-3 py-1.5 rounded-md">
              إجمالي الحسابات: {vendors.length + drivers.length + customers.length}
            </span>
          </div>
        </div>

        {/* Security Policy Notice */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-md text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-4 h-4 text-[#D1FE17] shrink-0" />
            <span>
              <strong>حماية كلمات المرور والوصول:</strong> يتم تخزين جميع كلمات المرور بتشفير خادم أحادي الاتجاه (Salted Scrypt Hash) ولا يمكن عرضها كنص صريح أو الدخول لحساب مستخدم بدون مصادقة البريد وكلمة المرور.
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-2 bg-white/[0.06] p-1 rounded-lg text-xs font-bold border border-white/10">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'vendors'
                ? 'bg-[#1A1C1F] text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>المتاجر والبراندات</span>
            <span className="text-[10px] bg-white/10 text-white/90 px-1.5 py-0.2 rounded-full tabular-nums">
              {vendors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'drivers'
                ? 'bg-[#1A1C1F] text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>كباتن التوصيل والأسطول</span>
            <span className="text-[10px] bg-white/10 text-white/90 px-1.5 py-0.2 rounded-full tabular-nums">
              {drivers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'customers'
                ? 'bg-[#1A1C1F] text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>حسابات العملاء</span>
            <span className="text-[10px] bg-white/10 text-white/90 px-1.5 py-0.2 rounded-full tabular-nums">
              {customers.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#898A8B] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، الهاتف، أو المنطقة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-[#1A1C1F] border border-white/10 rounded-md text-xs focus:outline-none focus:border-[#D1FE17] shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#898A8B] hover:text-white/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: VENDORS TABLE */}
      {activeTab === 'vendors' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-[#898A8B] font-bold">
                <tr>
                  <th className="py-3 px-4">المتجر / البراند</th>
                  <th className="py-3 px-4">البريد الإلكتروني للدخول</th>
                  <th className="py-3 px-4">رقم الهاتف والمنطقة</th>
                  <th className="py-3 px-4">حالة التشفير والحساب</th>
                  <th className="py-3 px-4 text-left">إدارة الأمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/90">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#898A8B]">
                      لا توجد متاجر مطابقة لبحثك
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-white/5 transition-colors">
                      {/* Vendor Name & Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="w-9 h-9 rounded object-cover border border-white/10 bg-[#1A1C1F]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{vendor.name}</div>
                            <div className="text-[11px] text-[#898A8B] font-mono">
                              {vendor.id} · {vendor.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-white font-bold">
                          <Mail className="w-3.5 h-3.5 text-[#898A8B]" />
                          <span>{vendor.email}</span>
                        </div>
                        <div className="text-[10px] text-[#898A8B]">الدور: vendor</div>
                      </td>

                      {/* Phone & Area */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white font-bold">{vendor.phone}</div>
                        <div className="text-[11px] text-[#898A8B]">{vendor.area}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-white/[0.06] text-white/70 px-2 py-0.5 rounded border border-white/10">
                            Scrypt Hashed
                          </span>
                          {vendor.status === 'active' && (
                            <span className="text-[11px] bg-[#D1FE17]/10 text-[#D1FE17] border border-[#D1FE17]/25 px-2 py-0.5 rounded font-bold">
                              نشط
                            </span>
                          )}
                          {vendor.status === 'frozen' && (
                            <span className="text-[11px] bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded font-bold">
                              مجمد لتجاوز الليميت
                            </span>
                          )}
                          {vendor.status === 'pending' && (
                            <span className="text-[11px] bg-amber-400/10 text-amber-300 border border-amber-400/25 px-2 py-0.5 rounded font-bold">
                              قيد المراجعة
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal('vendor', vendor.id, vendor.name, vendor.email)}
                            className="px-3 py-1.5 border border-white/15 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>إعادة تعيين كلمة المرور</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVERS TABLE */}
      {activeTab === 'drivers' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-[#898A8B] font-bold">
                <tr>
                  <th className="py-3 px-4">الكابتن / الطيار</th>
                  <th className="py-3 px-4">البريد الإلكتروني للدخول</th>
                  <th className="py-3 px-4">رقم الهاتف والمركبة</th>
                  <th className="py-3 px-4">حالة التشفير والحساب</th>
                  <th className="py-3 px-4 text-left">إدارة الأمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/90">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#898A8B]">
                      لا يوجد طيارين مطابقين لبحثك
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-white/5 transition-colors">
                      {/* Driver info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#D1FE17] text-[#131517] flex items-center justify-center font-bold text-xs shrink-0">
                            <Bike className="w-4 h-4 text-[#D1FE17]" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{driver.name}</div>
                            <div className="text-[11px] text-[#898A8B] font-mono">
                              {driver.id} · {driver.vehicleNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-white font-bold">
                          <Mail className="w-3.5 h-3.5 text-[#898A8B]" />
                          <span>{driver.email}</span>
                        </div>
                        <div className="text-[10px] text-[#898A8B]">الدور: driver</div>
                      </td>

                      {/* Contact & Vehicle */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white font-bold">{driver.phone}</div>
                        <div className="text-[11px] text-[#898A8B]">
                          {driver.vehicle} ({driver.area})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-white/[0.06] text-white/70 px-2 py-0.5 rounded border border-white/10">
                            Scrypt Hashed
                          </span>
                          {driver.status === 'active' && (
                            <span className="text-[11px] bg-[#D1FE17]/10 text-[#D1FE17] border border-[#D1FE17]/25 px-2 py-0.5 rounded font-bold">
                              نشط {driver.isOnline ? '(أونلاين)' : '(أوفلاين)'}
                            </span>
                          )}
                          {driver.status === 'frozen' && (
                            <span className="text-[11px] bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded font-bold">
                              مجمد لتجاوز الليميت
                            </span>
                          )}
                          {driver.status === 'pending' && (
                            <span className="text-[11px] bg-amber-400/10 text-amber-300 border border-amber-400/25 px-2 py-0.5 rounded font-bold">
                              قيد المراجعة
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal('driver', driver.id, driver.name, driver.email)}
                            className="px-3 py-1.5 border border-white/15 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>إعادة تعيين كلمة المرور</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMERS TABLE */}
      {activeTab === 'customers' && (
        <div className="bg-[#1A1C1F] border border-white/10 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-[#898A8B] font-bold">
                <tr>
                  <th className="py-3 px-4">اسم العميل</th>
                  <th className="py-3 px-4">البريد الإلكتروني للدخول</th>
                  <th className="py-3 px-4">رقم الهاتف والمنطقة</th>
                  <th className="py-3 px-4">حالة التشفير والحساب</th>
                  <th className="py-3 px-4 text-left">إدارة الأمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/90">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#898A8B]">
                      لا يوجد عملاء مطابقين لبحثك
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/10 text-white/90 flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4 text-white/80" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{customer.name}</div>
                            <div className="text-[11px] text-[#898A8B] font-mono">
                              {customer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-white font-bold">
                          <Mail className="w-3.5 h-3.5 text-[#898A8B]" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="text-[10px] text-[#898A8B]">الدور: customer</div>
                      </td>

                      {/* Phone & Address */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white font-bold">{customer.phone}</div>
                        <div className="text-[11px] text-[#898A8B]">
                          {customer.area} · {customer.address}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-white/[0.06] text-white/70 px-2 py-0.5 rounded border border-white/10">
                            Scrypt Hashed
                          </span>
                          <span className="text-[11px] bg-[#D1FE17]/10 text-[#D1FE17] border border-[#D1FE17]/25 px-2 py-0.5 rounded font-bold">
                            نشط ومسجل
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal('customer', customer.id, customer.name, customer.email)}
                            className="px-3 py-1.5 border border-white/15 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>إعادة تعيين كلمة المرور</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-[#131517]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1C1F] rounded-lg border border-white/10 max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">إعادة تعيين كلمة المرور المشفرة</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-[#898A8B] hover:text-white/80 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-white/70 space-y-1">
              <div>
                الحساب: <strong className="text-white">{editingUser.name}</strong>
              </div>
              <div className="font-mono text-[11px] text-[#898A8B]">{editingUser.email}</div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-white/80 font-semibold mb-1">
                  كلمة المرور الجديدة (6 أحرف على الأقل):
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  placeholder="أدخل كلمة المرور الجديدة..."
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full p-2.5 border border-white/15 rounded font-mono text-xs focus:outline-none focus:border-[#D1FE17]"
                />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 border border-white/15 rounded text-white/80 font-medium hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#D1FE17] hover:bg-white disabled:opacity-50 text-[#131517] font-bold rounded shadow-xs"
                >
                  {isSaving ? 'جاري التشفير والحفظ...' : 'تشفير وحفظ كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
