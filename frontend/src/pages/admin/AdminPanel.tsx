import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import UserManagement from './UserManagement';

// ============ Types ============
interface VariantOption {
  name: string;
  nameEn: string;
  values: string[];
}

interface Product {
  id: number;
  name: string;
  name_en?: string;
  category?: string;
  price: number;
  description?: string;
  image?: string;
  images?: string[];
  variant_options?: VariantOption[];
  box_qty?: number;
  created_at?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  item_count: number;
  created_at: string;
}

type Tab = 'products' | 'orders' | 'dashboard' | 'settings';

// ============ Default variant options ============
const DEFAULT_VARIANT_OPTIONS: VariantOption[] = [
  { name: '颜色', nameEn: 'Color', values: [] },
  { name: '规格', nameEn: 'Specification', values: [] },
  { name: '材质', nameEn: 'Material', values: [] },
  { name: '型号', nameEn: 'Model', values: [] },
  { name: '其他', nameEn: 'Other', values: [] },
];

// ============ Admin API helper ============
function adminFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const isFormData = options.body instanceof FormData;
  return fetch(path, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// ============ Variant Options Editor ============
function VariantOptionsEditor({ options, onChange }: { options: VariantOption[]; onChange: (opts: VariantOption[]) => void }) {
  const addOption = () => {
    onChange([...options, { name: '', nameEn: '', values: [] }]);
  };

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, field: keyof VariantOption, value: any) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const addValue = (idx: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const updated = [...options];
    const current = updated[idx].values;
    if (current.includes(trimmed)) return; // no duplicates
    updated[idx] = { ...updated[idx], values: [...current, trimmed] };
    onChange(updated);
  };

  const removeValue = (idx: number, valueIdx: number) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], values: updated[idx].values.filter((_, i) => i !== valueIdx) };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {options.map((opt, idx) => (
        <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Option {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeOption(idx)}
              className="text-red-400 hover:text-red-300 text-xs transition"
            >
              ✕ Remove
            </button>
          </div>
          <div className="flex gap-3 mb-3">
            <input
              value={opt.name}
              onChange={e => updateOption(idx, 'name', e.target.value)}
              placeholder="属性名 (中文)"
              className="w-28 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              value={opt.nameEn}
              onChange={e => updateOption(idx, 'nameEn', e.target.value)}
              placeholder="Name (English)"
              className="w-28 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {/* Value input + Add button */}
          <div className="flex gap-2 mb-2">
            <input
              id={`value-input-${idx}`}
              placeholder="输入可选值"
              className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  addValue(idx, input.value);
                  input.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(`value-input-${idx}`) as HTMLInputElement;
                if (input) {
                  addValue(idx, input.value);
                  input.value = '';
                  input.focus();
                }
              }}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition flex items-center justify-center"
              title="添加 / Add"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          {/* Added values as removable tags */}
          {opt.values.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {opt.values.map((v, vi) => (
                <span key={vi} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs">
                  {v}
                  <button
                    type="button"
                    onClick={() => removeValue(idx, vi)}
                    className="text-amber-400 hover:text-red-400 transition ml-0.5"
                    title="删除 / Remove"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="w-full py-2.5 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-amber-500 hover:text-amber-400 text-sm transition flex items-center justify-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        添加属性选项 / Add Option
      </button>
    </div>
  );
}

// ============ Dashboard Tab ============
function DashboardTab({ products, orders }: { products: Product[]; orders: Order[] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const categories = [...new Set(products.map(p => p.category).filter(Boolean) as string[])];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Products</p>
          <p className="text-3xl font-bold text-white mt-1">{products.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-white mt-1">{orders.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Pending Orders</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400 mt-1">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.slice(0, 10).map(cat => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-gray-300">{cat}</span>
                <span className="text-gray-500">{products.filter(p => p.category === cat).length} items</span>
              </div>
            ))}
            {categories.length === 0 && <p className="text-gray-500 text-sm">No products yet</p>}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-3">Recent Orders</h3>
          <div className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{order.order_number}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-600 text-gray-300'
                }`}>{order.status}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-gray-500 text-sm">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Products Tab ============
function ProductsTab({ onRefresh }: { onRefresh: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', name_en: '', category: '', price: '', description: '', images: [] as string[],
    variant_options: [] as VariantOption[],
    box_qty: '1',
  });

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个产品吗？`)) return;
    await adminFetch('/api/products/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    setSelectedIds(new Set());
    load();
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await adminFetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
    onRefresh();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    const existingImages = (p as any).images 
      ? (Array.isArray((p as any).images) ? (p as any).images : JSON.parse((p as any).images || '[]'))
      : (p.image ? [p.image] : []);
    const existingOptions = p.variant_options || [];
    setForm({
      name: p.name, name_en: p.name_en || '', category: p.category || '',
      price: String(p.price), description: p.description || '', images: existingImages,
      variant_options: existingOptions,
      box_qty: String(p.box_qty || 1),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form, price: Number(form.price),
      images: form.images,
      variant_options: form.variant_options,
      box_qty: Number(form.box_qty) || 1,
    };
    if (editing) {
      await adminFetch(`/api/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await adminFetch('/api/products', { method: 'POST', body: JSON.stringify(body) });
    }
    setShowForm(false);
    setEditing(null);
    setForm({
      name: '', name_en: '', category: '', price: '', description: '', images: [],
      variant_options: DEFAULT_VARIANT_OPTIONS.map(o => ({ ...o, values: [] })),
      box_qty: '1',
    });
    load();
    onRefresh();
  };

  const allSelected = products.length > 0 && selectedIds.size === products.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Products ({products.length})</h2>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Selected ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', name_en: '', category: '', price: '', description: '', images: [], variant_options: DEFAULT_VARIANT_OPTIONS.map(o => ({ ...o, values: [] })), box_qty: '1' }); }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col max-h-[85vh]">
          <h3 className="text-white font-semibold p-6 pb-0 mb-4">{editing ? 'Edit Product' : 'New Product'}</h3>
          <div className="overflow-y-auto px-6 pb-24">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product Name (English) *" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} placeholder="Product Name (Chinese)" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price *" type="number" step="0.01" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              <div>
                <label className="block text-gray-400 text-xs mb-1">Box Qty (每箱数量) *</label>
                <input value={form.box_qty} onChange={e => setForm({ ...form, box_qty: e.target.value })} placeholder="每箱装多少件，如：50" type="number" min="1" step="1" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs mb-1">Product Images</label>
                <div className="flex flex-wrap items-start gap-3">
                  <label className={`flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-gray-700/50 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="text-center">
                      <span className="text-2xl">📷</span>
                      <p className="text-gray-500 text-[10px] mt-1">{uploading ? 'Uploading...' : 'Add'}</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setUploading(true);
                        try {
                          const newUrls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const formData = new FormData();
                            formData.append('image', files[i]);
                            const res = await adminFetch('/api/upload/image', { method: 'POST', body: formData });
                            if (!res.ok) throw new Error('Upload failed');
                            const data = await res.json();
                            newUrls.push(data.url);
                          }
                          setForm({ ...form, images: [...form.images, ...newUrls] });
                        } catch (err) {
                          alert('图片上传失败，请重试');
                        } finally {
                          setUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  {form.images.map((url, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-600">
                      <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >✕</button>
                      {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white text-[9px] text-center py-0.5">主图</span>}
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-[10px] mt-1">第一张为主图，支持多选上传</p>
              </div>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 md:col-span-2" />
            </div>

            {/* Variant Options */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-400 text-sm font-medium">属性选项 / Variant Options</h4>
                <span className="text-gray-500 text-xs">客户在选购时需要选择的选项</span>
              </div>
              <VariantOptionsEditor
                options={form.variant_options}
                onChange={(opts) => setForm({ ...form, variant_options: opts })}
              />
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t border-gray-700 bg-gray-800 shrink-0">
            <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition">{editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-750">
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-gray-400 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Image</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Category</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Options</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Price</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Box Qty</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const opts = p.variant_options || [];
                return (
                  <tr key={p.id} className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${selectedIds.has(p.id) ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500">#{p.id}</td>
                    <td className="px-4 py-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover border border-gray-600" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white">{p.name}{p.name_en ? ` / ${p.name_en}` : ''}</td>
                    <td className="px-4 py-3 text-gray-400">{p.category || '-'}</td>
                    <td className="px-4 py-3">
                      {opts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {opts.map((o, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                              {o.nameEn || o.name}({o.values.length})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-green-400 text-right">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">{p.box_qty || 1} pcs</span></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleEdit(p)} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition">Delete</button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No products yet. Click "Add Product" to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ Orders Tab ============
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewDetail = async (id: number) => {
    try {
      const res = await adminFetch(`/api/orders/${id}`);
      if (res.ok) {
        setDetail(await res.json());
        setSelected(id);
      }
    } catch { /* ignore */ }
  };

  const updateStatus = async (id: number, status: string) => {
    await adminFetch(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
    if (selected === id) viewDetail(id);
  };

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const stats = {
    total: orders.length,
    revenue: orders.reduce((s, o) => s + (o.total_amount || 0), 0),
    avgOrder: orders.length > 0 ? orders.reduce((s, o) => s + (o.total_amount || 0), 0) / orders.length : 0,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchTerm ||
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesDate = dateFilter === 'all' || isInDateRange(o.created_at, dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const isInDateRange = (dateStr: string, range: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    if (range === 'today') {
      return date.toDateString() === now.toDateString();
    } else if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    } else if (range === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= monthAgo;
    }
    return true;
  };

  const exportCSV = () => {
    const headers = ['Order #', 'Customer', 'Phone', 'Address', 'Amount', 'Status', 'Date'];
    const rows = filteredOrders.map(o => [
      o.order_number,
      o.customer_name,
      o.customer_phone || '',
      o.customer_address,
      o.total_amount.toFixed(2),
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'processing': return 'bg-purple-500/20 text-purple-400';
      case 'shipped': return 'bg-cyan-500/20 text-cyan-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Orders ({filteredOrders.length})</h2>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-gray-400 text-xs mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">${stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-gray-400 text-xs mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-blue-400">${stats.avgOrder.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-gray-400 text-xs mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pending', count: stats.pending, color: 'border-amber-500' },
          { label: 'Shipped', count: stats.shipped, color: 'border-cyan-500' },
          { label: 'Delivered', count: stats.delivered, color: 'border-green-500' },
        ].map(s => (
          <div key={s.label} className={`bg-gray-800 rounded-lg border-l-4 ${s.color} px-4 py-2`}>
            <p className="text-gray-400 text-xs">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Order #</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Customer</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Amount</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => viewDetail(o.id)}
                    className={`border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer ${selected === o.id ? 'bg-gray-700/50' : ''}`}
                  >
                    <td className="px-4 py-3 text-white font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <div>{o.customer_name}</div>
                      <div className="text-gray-500 text-xs">{o.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-green-400 text-right font-medium">${o.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-white font-semibold mb-4">Order Detail</h3>
          {detail ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs">Order Number</p>
                <p className="text-white font-mono text-sm">{detail.order_number}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Status</p>
                <select
                  value={detail.status}
                  onChange={e => updateStatus(detail.id, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Customer</p>
                <p className="text-white text-sm">{detail.customer_name}</p>
                <p className="text-gray-400 text-xs">{detail.customer_phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Address</p>
                <p className="text-white text-sm">{detail.customer_address}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">Items ({detail.items?.length || 0})</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {detail.items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-3">
                      <p className="text-white text-sm">{item.product_name}</p>
                      {item.variant_info && <p className="text-gray-500 text-xs">{item.variant_info}</p>}
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</span>
                        <span className="text-green-400">${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-green-400 font-bold">${detail.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Select an order to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Settings Tab ============
function SettingsTab() {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState({
    company_name: '',
    company_name_zh: '',
    whatsapp: '',
    email: '',
    address: '',
    phone: '',
    feishu_app_id: '',
    feishu_app_secret: '',
    feishu_chat_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        console.log('🔧 Admin settings loaded:', data);
        setSettings(data);
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        refreshSettings(); // 刷新全局设置
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.newPass.length < 4) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters' });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await adminFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ current: '', newPass: '', confirm: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Company Settings</h2>
          <p className="text-gray-500 text-sm">Manage your company information displayed to customers</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Company Name (EN)</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={e => setSettings(s => ({ ...s, company_name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">公司名称 (中文)</label>
            <input
              type="text"
              value={settings.company_name_zh}
              onChange={e => setSettings(s => ({ ...s, company_name_zh: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
          <input
            type="text"
            value={settings.whatsapp}
            onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={e => setSettings(s => ({ ...s, email: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
            <input
              type="text"
              value={settings.phone}
              onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={e => setSettings(s => ({ ...s, address: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5 mt-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Feishu Integration</h3>
          <p className="text-gray-500 text-sm">Configure Feishu notification for new orders</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">App ID</label>
          <input
            type="text"
            value={settings.feishu_app_id}
            onChange={e => setSettings(s => ({ ...s, feishu_app_id: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            placeholder="feishu app id"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">App Secret</label>
          <input
            type="text"
            value={settings.feishu_app_secret}
            onChange={e => setSettings(s => ({ ...s, feishu_app_secret: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            placeholder="feishu app secret"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Chat ID</label>
          <input
            type="text"
            value={settings.feishu_chat_id}
            onChange={e => setSettings(s => ({ ...s, feishu_chat_id: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            placeholder="feishu chat/group id"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Feishu Settings'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5 mt-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Change Password</h3>
          <p className="text-gray-500 text-sm">Update your admin login password</p>
        </div>

        {passwordMsg && (
          <div className={`p-3 rounded-lg text-sm ${passwordMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {passwordMsg.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
          <input
            type="password"
            value={passwordForm.current}
            onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
          <input
            type="password"
            value={passwordForm.newPass}
            onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirm}
            onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Main Admin Panel ============
const AdminPanel: React.FC = () => {
  const { logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        adminFetch('/api/products'),
        adminFetch('/api/orders'),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (oRes.ok) setOrders(await oRes.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'products', label: 'Products', icon: '📦' },
    { key: 'orders', label: 'Orders', icon: '🛒' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    ...(isAdmin ? [{ key: 'users' as Tab, label: 'User Management', icon: '👥' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-sm">🔥</span>
            Smoke Shop
          </h1>
          <p className="text-gray-500 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out ({user?.username})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardTab products={products} orders={orders} />}
          {activeTab === 'products' && <ProductsTab onRefresh={handleRefresh} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
