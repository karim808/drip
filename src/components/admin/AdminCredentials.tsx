import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Store,
  Bike,
  User,
  LogIn,
  Edit3,
  Lock,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminCredentials: React.FC = () => {
  const {
    vendors,
    drivers,
    customers,
    updateUserPassword,
    quickImpersonate,
    showToast,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'vendors' | 'drivers' | 'customers'>('vendors');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit password modal state
  const [editingUser, setEditingUser] = useState<{
    type: 'vendor' | 'driver' | 'customer';
    id: string;
    name: string;
    currentPassword?: string;
  } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyPassword = (id: string, pass: string, name: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    showToast(`تم نسخ كلمة مرور حساب (${name}) بنجاح`, 'success');
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const openEditModal = (
    type: 'vendor' | 'driver' | 'customer',
    id: string,
    name: string,
    currentPass?: string
  ) => {
    setEditingUser({ type, id, name, currentPassword: currentPass });
    setNewPasswordValue(currentPass || '');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !newPasswordValue.trim()) return;

    updateUserPassword(editingUser.type, editingUser.id, newPasswordValue.trim());
    setEditingUser(null);
    setNewPasswordValue('');
  };

  // Filtered lists
  const query = searchQuery.toLowerCase().trim();

  const filteredVendors = vendors.filter(
    (v) =>
      !query ||
      v.name.toLowerCase().includes(query) ||
      v.phone.includes(query) ||
      v.area.toLowerCase().includes(query) ||
      v.id.toLowerCase().includes(query)
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      !query ||
      d.name.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      d.area.toLowerCase().includes(query) ||
      d.vehicle.toLowerCase().includes(query) ||
      d.id.toLowerCase().includes(query)
  );

  const filteredCustomers = customers.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.area.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                سجل الحسابات وكلمات المرور (Users & Passwords Directory)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                إدارة كاملة لبيانات تسجيل الدخول وكلمات المرور لجميع المتاجر، الكباتن، والعملاء، مع إمكانية التبديل والدخول السريع.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-zinc-100 text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-md">
              إجمالي الحسابات: {vendors.length + drivers.length + customers.length}
            </span>
          </div>
        </div>

        {/* Super Admin Root Credentials Quick Note */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/70 p-3 rounded-md text-xs">
          <div className="flex items-center gap-2 text-zinc-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>حساب السوبر أدمن الرئيسي:</strong> البريد:{' '}
              <span className="font-mono font-bold text-zinc-950">admin@voguefast.eg</span> · كلمة المرور:{' '}
              <span className="font-mono font-bold text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-200">
                vogue#admin2026
              </span>
            </span>
          </div>
          <button
            onClick={() => handleCopyPassword('admin-root', 'vogue#admin2026', 'المدير العام')}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-950"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ كلمة مرور الأدمن</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg text-xs font-bold border border-zinc-200">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'vendors'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>المتاجر والبراندات</span>
            <span className="text-[10px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded-full tabular-nums">
              {vendors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'drivers'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>كباتن التوصيل والأسطول</span>
            <span className="text-[10px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded-full tabular-nums">
              {drivers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'customers'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <User className="w-4 h-4" />
            <span>حسابات العملاء</span>
            <span className="text-[10px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded-full tabular-nums">
              {customers.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الهاتف، أو المنطقة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-white border border-zinc-200 rounded-md text-xs focus:outline-none focus:border-zinc-950 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: VENDORS TABLE */}
      {activeTab === 'vendors' && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold">
                <tr>
                  <th className="py-3 px-4">المتجر / البراند</th>
                  <th className="py-3 px-4">رقم الهاتف والمنطقة</th>
                  <th className="py-3 px-4">كلمة المرور الحالية</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">الإجراءات والولوج السريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400">
                      لا توجد متاجر مطابقة لبحثك
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => {
                    const pass = vendor.password || 'brand@2026';
                    const isRevealed = !!revealedPasswords[vendor.id];
                    const isCopied = copiedId === vendor.id;

                    return (
                      <tr key={vendor.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Vendor Name & Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className="w-9 h-9 rounded object-cover border border-zinc-200 bg-white"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-bold text-zinc-950 text-xs">{vendor.name}</div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                {vendor.id} · {vendor.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone & Area */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-zinc-900 font-bold">{vendor.phone}</div>
                          <div className="text-[11px] text-zinc-500">{vendor.area}</div>
                        </td>

                        {/* Password with Eye & Copy */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="font-mono bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 text-xs text-zinc-900 select-all min-w-[110px]">
                              {isRevealed ? pass : '••••••••'}
                            </div>

                            {/* Eye toggle */}
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(vendor.id)}
                              title={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Copy button */}
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(vendor.id, pass, vendor.name)}
                              title="نسخ كلمة المرور"
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {vendor.status === 'active' && (
                            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                              نشط
                            </span>
                          )}
                          {vendor.status === 'frozen' && (
                            <span className="text-[11px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-bold">
                              مجمد لتجاوز الليميت
                            </span>
                          )}
                          {vendor.status === 'pending' && (
                            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                              قيد المراجعة
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Password Button */}
                            <button
                              type="button"
                              onClick={() => openEditModal('vendor', vendor.id, vendor.name, pass)}
                              className="px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>

                            {/* Quick Impersonate Button */}
                            <button
                              type="button"
                              onClick={() => quickImpersonate('vendor', vendor.id)}
                              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تسجيل دخول سريع</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVERS TABLE */}
      {activeTab === 'drivers' && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold">
                <tr>
                  <th className="py-3 px-4">الكابتن / الطيار</th>
                  <th className="py-3 px-4">رقم الهاتف والمركبة</th>
                  <th className="py-3 px-4">كلمة المرور الحالية</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">الإجراءات والولوج السريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400">
                      لا يوجد طيارين مطابقين لبحثك
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => {
                    const pass = driver.password || 'captain#99';
                    const isRevealed = !!revealedPasswords[driver.id];
                    const isCopied = copiedId === driver.id;

                    return (
                      <tr key={driver.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Driver info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              <Bike className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-bold text-zinc-950 text-xs">{driver.name}</div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                {driver.id} · {driver.vehicleNumber}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Vehicle */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-zinc-900 font-bold">{driver.phone}</div>
                          <div className="text-[11px] text-zinc-500">
                            {driver.vehicle} ({driver.area})
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="font-mono bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 text-xs text-zinc-900 select-all min-w-[110px]">
                              {isRevealed ? pass : '••••••••'}
                            </div>

                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(driver.id)}
                              title={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyPassword(driver.id, pass, driver.name)}
                              title="نسخ كلمة المرور"
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {driver.status === 'active' && (
                            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                              نشط {driver.isOnline ? '(أونلاين)' : '(أوفلاين)'}
                            </span>
                          )}
                          {driver.status === 'frozen' && (
                            <span className="text-[11px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-bold">
                              مجمد لتجاوز الليميت
                            </span>
                          )}
                          {driver.status === 'pending' && (
                            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                              قيد المراجعة
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal('driver', driver.id, driver.name, pass)}
                              className="px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => quickImpersonate('driver', driver.id)}
                              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تسجيل دخول سريع</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMERS TABLE */}
      {activeTab === 'customers' && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold">
                <tr>
                  <th className="py-3 px-4">اسم العميل</th>
                  <th className="py-3 px-4">رقم الهاتف والمنطقة</th>
                  <th className="py-3 px-4">كلمة المرور الحالية</th>
                  <th className="py-3 px-4">حالة الحساب</th>
                  <th className="py-3 px-4 text-left">الإجراءات والولوج السريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400">
                      لا يوجد عملاء مطابقين لبحثك
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const pass = customer.password || 'cust#1830';
                    const isRevealed = !!revealedPasswords[customer.id];
                    const isCopied = copiedId === customer.id;

                    return (
                      <tr key={customer.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-xs shrink-0">
                              <User className="w-4 h-4 text-zinc-700" />
                            </div>
                            <div>
                              <div className="font-bold text-zinc-950 text-xs">{customer.name}</div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                {customer.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone & Address */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-zinc-900 font-bold">{customer.phone}</div>
                          <div className="text-[11px] text-zinc-500">
                            {customer.area} · {customer.address}
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="font-mono bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 text-xs text-zinc-900 select-all min-w-[110px]">
                              {isRevealed ? pass : '••••••••'}
                            </div>

                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(customer.id)}
                              title={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyPassword(customer.id, pass, customer.name)}
                              title="نسخ كلمة المرور"
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            نشط ومسجل
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal('customer', customer.id, customer.name, pass)}
                              className="px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => quickImpersonate('customer', customer.id)}
                              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تسجيل دخول سريع</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PASSWORD MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-200 max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-900" />
                <h3 className="font-bold text-sm text-zinc-950">تغيير كلمة المرور</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-600">
              أنت الآن تقوم بتعيين كلمة مرور جديدة للحساب:{' '}
              <strong className="text-zinc-950 block mt-1">{editingUser.name}</strong>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">
                  كلمة المرور الجديدة:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="أدخل كلمة المرور الجديدة..."
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded font-mono text-xs focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 border border-zinc-300 rounded text-zinc-700 font-medium hover:bg-zinc-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded shadow-xs"
                >
                  حفظ كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
