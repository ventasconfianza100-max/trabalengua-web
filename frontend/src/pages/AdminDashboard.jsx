import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatCLP, resolveImage } from "../lib/api";
import {
  LogOut,
  Upload,
  Save,
  Package,
  ClipboardList,
  BarChart3,
  Warehouse,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Filter,
  Store,
  Truck,
  Image as ImageIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STATUS_OPTIONS = [
  { v: "pending", label: "Pendiente" },
  { v: "paid", label: "Pagado" },
  { v: "delivered", label: "Entregado" },
  { v: "cancelled", label: "Cancelado" },
];

const SIZES = ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [garmentFilter, setGarmentFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [settings, setSettings] = useState(null);

  const reloadProducts = async () => {
    try {
      const { data } = await api.get("/admin/products");
      setProducts(data);
    } catch {
      toast.error("No se pudieron recargar los productos");
    }
  };

  const loadAll = async () => {
    try {
      const [p, o, t, s] = await Promise.all([
        api.get("/admin/products"),
        api.get("/admin/orders"),
        api.get("/admin/orders", { params: { trash: true } }),
        api.get("/settings"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
      setTrash(t.data);
      setSettings(s.data);
    } catch {
      localStorage.removeItem("tl_admin_token");
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("tl_admin_token")) {
      navigate("/admin/login");
      return;
    }
    loadAll();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("tl_admin_token");
    navigate("/admin/login");
  };

  const schoolNames = useMemo(() => Array.from(new Set(products.map((p) => p.school_name))).sort(), [products]);

  const garmentOptions = useMemo(() => {
    const m = new Map();
    products.forEach((p) => {
      const key = `${p.school_slug}::${p.type_key}`;
      if (!m.has(key)) {
        m.set(key, { key, label: `${p.school_name} · ${p.name}` });
      }
    });
    return Array.from(m.values()).sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (schoolFilter !== "all" && p.school_name !== schoolFilter) return false;
      if (garmentFilter !== "all" && `${p.school_slug}::${p.type_key}` !== garmentFilter) return false;
      return true;
    });
  }, [products, schoolFilter, garmentFilter]);

  const bySchool = useMemo(() => {
    return filteredProducts.reduce((acc, p) => {
      (acc[p.school_name] = acc[p.school_name] || []).push(p);
      return acc;
    }, {});
  }, [filteredProducts]);

  const stockChartData = useMemo(() => {
    const getStock = (p) => {
      if (sizeFilter === "all") return (p.sizes || []).reduce((s, sz) => s + sz.stock, 0);
      const row = (p.sizes || []).find((x) => x.size === sizeFilter);
      return row ? row.stock : 0;
    };
    return filteredProducts
      .map((p) => ({
        name: `${p.school_name.replace("Colegio ", "").replace("Escuela ", "")} · ${p.name}`,
        stock: getStock(p),
        school: p.school_name,
      }))
      .sort((a, b) => a.stock - b.stock);
  }, [filteredProducts, sizeFilter]);

  const sizeAggregateChartData = useMemo(() => {
    return SIZES.map((sz) => ({
      size: sz,
      stock: filteredProducts.reduce((acc, p) => {
        const row = (p.sizes || []).find((x) => x.size === sz);
        return acc + (row ? row.stock : 0);
      }, 0),
    }));
  }, [filteredProducts]);

  const totals = useMemo(() => {
    const sumFor = (p) => {
      if (sizeFilter === "all") return (p.sizes || []).reduce((a, x) => a + x.stock, 0);
      const row = (p.sizes || []).find((x) => x.size === sizeFilter);
      return row ? row.stock : 0;
    };
    const totalStock = filteredProducts.reduce((s, p) => s + sumFor(p), 0);
    const lowStock = filteredProducts.filter((p) => sumFor(p) > 0 && sumFor(p) < 10).length;
    const outOfStock = filteredProducts.filter((p) => sumFor(p) === 0).length;
    return { totalStock, lowStock, outOfStock, productCount: filteredProducts.length };
  }, [filteredProducts, sizeFilter]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/orders/${id}`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      toast.success("Pedido actualizado");
    } catch {
      toast.error("Error actualizando pedido");
    }
  };

  const softDelete = async (id) => {
    if (!window.confirm("¿Enviar este pedido a la papelera?")) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      const moved = orders.find((o) => o.id === id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (moved) setTrash((prev) => [{ ...moved, is_deleted: true }, ...prev]);
      toast.success("Pedido enviado a la papelera");
    } catch {
      toast.error("Error");
    }
  };

  const restore = async (id) => {
    try {
      await api.post(`/admin/orders/${id}/restore`);
      const moved = trash.find((o) => o.id === id);
      setTrash((prev) => prev.filter((o) => o.id !== id));
      if (moved) setOrders((prev) => [{ ...moved, is_deleted: false }, ...prev]);
      toast.success("Pedido restaurado");
    } catch {
      toast.error("Error");
    }
  };

  const hardDelete = async (id) => {
    if (!window.confirm("Esta acción es DEFINITIVA. ¿Continuar?")) return;
    try {
      await api.delete(`/admin/orders/${id}/permanent`);
      setTrash((prev) => prev.filter((o) => o.id !== id));
      toast.success("Pedido eliminado definitivamente");
    } catch {
      toast.error("Error");
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-gray-500">Cargando panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10" data-testid="admin-dashboard">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow">Panel admin</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-2">Dashboard</h1>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors rounded-sm"
          data-testid="admin-logout"
        >
          <LogOut size={14} /> Salir
        </button>
      </div>

      {/* Filtros: colegio, prenda, talla (afectan inventario, resumen y listado de productos) */}
      <div className="mt-6 flex items-center gap-3 flex-wrap" data-testid="admin-filters-bar">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <Filter size={14} /> Filtros:
        </div>
        <select
          value={schoolFilter}
          onChange={(e) => {
            setSchoolFilter(e.target.value);
            setGarmentFilter("all");
          }}
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black rounded-sm"
          data-testid="school-filter-select"
        >
          <option value="all">Todos los colegios</option>
          {schoolNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select
          value={garmentFilter}
          onChange={(e) => {
            const v = e.target.value;
            setGarmentFilter(v);
            if (v !== "all") {
              const slug = v.split("::")[0];
              const sch = products.find((p) => p.school_slug === slug);
              if (sch) setSchoolFilter(sch.school_name);
            }
          }}
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black rounded-sm max-w-[min(100vw-8rem,22rem)]"
          data-testid="garment-filter-select"
        >
          <option value="all">Todas las prendas</option>
          {garmentOptions.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black rounded-sm"
          data-testid="size-filter-select"
        >
          <option value="all">Todas las tallas</option>
          {SIZES.map((sz) => (
            <option key={sz} value={sz}>Talla {sz}</option>
          ))}
        </select>
        {(schoolFilter !== "all" || garmentFilter !== "all" || sizeFilter !== "all") && (
          <button
            onClick={() => {
              setSchoolFilter("all");
              setGarmentFilter("all");
              setSizeFilter("all");
            }}
            className="text-xs text-gray-500 hover:text-black underline underline-offset-2"
            data-testid="clear-filters-btn"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <Tabs defaultValue="inventory" className="mt-6">
        <TabsList className="bg-gray-100 border border-gray-200 rounded-sm flex-wrap h-auto" data-testid="admin-tabs">
          <TabsTrigger value="inventory" className="rounded-sm gap-2" data-testid="tab-inventory">
            <Warehouse size={14} /> Inventario
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="rounded-sm gap-2" data-testid="tab-dashboard">
            <BarChart3 size={14} /> Resumen
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-sm gap-2" data-testid="tab-products">
            <Package size={14} /> Productos ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-sm gap-2" data-testid="tab-orders">
            <ClipboardList size={14} /> Pedidos ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="trash" className="rounded-sm gap-2" data-testid="tab-trash">
            <Trash2 size={14} /> Papelera ({trash.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-sm gap-2" data-testid="tab-settings">
            <SettingsIcon size={14} /> Ajustes
          </TabsTrigger>
        </TabsList>

        {/* INVENTARIO: filtros + gráficos + edición de stock */}
        <TabsContent value="inventory" className="mt-6 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Productos (filtro)" value={totals.productCount} />
            <StatCard
              label={sizeFilter === "all" ? "Stock total" : `Stock talla ${sizeFilter}`}
              value={totals.totalStock}
            />
            <StatCard
              label={sizeFilter === "all" ? "Stock bajo (<10)" : `Stock bajo talla ${sizeFilter}`}
              value={totals.lowStock}
              accent={totals.lowStock > 0 ? "text-amber-600" : ""}
            />
            <StatCard
              label={sizeFilter === "all" ? "Sin stock" : `Sin stock talla ${sizeFilter}`}
              value={totals.outOfStock}
              accent={totals.outOfStock > 0 ? "text-[#FF4D4D]" : ""}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 p-4 md:p-6 bg-white" data-testid="stock-chart-card">
              <p className="eyebrow">
                {sizeFilter === "all" ? "Stock por prenda" : `Stock talla ${sizeFilter} por prenda`}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Menor a mayor. Rojo = bajo (&lt;10) · Negro = sin stock · Verde = OK
              </p>
              {stockChartData.length === 0 ? (
                <p className="mt-8 text-sm text-gray-500 py-12 text-center border border-dashed border-gray-200">
                  No hay productos con el filtro actual.
                </p>
              ) : (
                <div className="mt-6" style={{ width: "100%", height: Math.max(260, stockChartData.length * 28) }}>
                  <ResponsiveContainer>
                    <BarChart data={stockChartData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" horizontal={false} />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={180}
                        stroke="#6B7280"
                        fontSize={11}
                        tick={{ fontFamily: "Manrope" }}
                      />
                      <Tooltip
                        contentStyle={{ border: "1px solid #E5E7EB", borderRadius: 2, fontSize: 12 }}
                        cursor={{ fill: "rgba(255,77,77,0.06)" }}
                      />
                      <Bar dataKey="stock" radius={[0, 2, 2, 0]}>
                        {stockChartData.map((row, i) => (
                          <Cell key={i} fill={row.stock === 0 ? "#0A0A0A" : row.stock < 10 ? "#FF4D4D" : "#10B981"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="border border-gray-200 p-4 md:p-6 bg-white" data-testid="stock-by-size-chart">
              <p className="eyebrow">Stock sumado por talla</p>
              <p className="mt-1 text-xs text-gray-500">Total de unidades en el conjunto filtrado (todas las tallas del listado).</p>
              <div className="mt-6 h-[280px]">
                <ResponsiveContainer>
                  <BarChart data={sizeAggregateChartData} margin={{ left: 4, right: 8, top: 8, bottom: 28 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="size" stroke="#6B7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #E5E7EB", borderRadius: 2, fontSize: 12 }}
                      formatter={(v) => [`${v} u.`, "Stock"]}
                    />
                    <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                      {sizeAggregateChartData.map((row, i) => (
                        <Cell
                          key={i}
                          fill={sizeFilter === row.size ? "#FF4D4D" : row.stock === 0 ? "#D1D5DB" : "#0A0A0A"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <StockInventoryTable
            products={filteredProducts}
            sizeFilter={sizeFilter}
            onReload={reloadProducts}
          />
        </TabsContent>

        {/* RESUMEN */}
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Productos (filtro)" value={totals.productCount} />
            <StatCard
              label={sizeFilter === "all" ? "Stock total" : `Stock talla ${sizeFilter}`}
              value={totals.totalStock}
            />
            <StatCard
              label={sizeFilter === "all" ? "Stock bajo (<10)" : `Stock bajo talla ${sizeFilter}`}
              value={totals.lowStock}
              accent={totals.lowStock > 0 ? "text-amber-600" : ""}
            />
            <StatCard
              label={sizeFilter === "all" ? "Sin stock" : `Sin stock talla ${sizeFilter}`}
              value={totals.outOfStock}
              accent={totals.outOfStock > 0 ? "text-[#FF4D4D]" : ""}
            />
          </div>

          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Gestión de stock</p>
            <p className="mt-2">
              Usa la pestaña <strong>Inventario</strong> para ver las gráficas, filtrar por colegio, prenda y talla, y
              editar cantidades en la misma vista. Los pedidos se administran en <strong>Pedidos</strong>.
            </p>
          </div>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="mt-6 space-y-10">
          {Object.entries(bySchool).map(([schoolName, list]) => (
            <div key={schoolName}>
              <h2 className="font-display text-xl font-semibold mb-4">{schoolName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onUpdated={() => {
                      void reloadProducts();
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders" className="mt-6">
          <OrdersTable
            orders={orders}
            onStatusChange={updateStatus}
            onDelete={softDelete}
            emptyMsg="Aún no hay pedidos."
            mode="active"
          />
        </TabsContent>

        {/* TRASH TAB */}
        <TabsContent value="trash" className="mt-6">
          <OrdersTable
            orders={trash}
            onRestore={restore}
            onHardDelete={hardDelete}
            emptyMsg="La papelera está vacía."
            mode="trash"
          />
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <SettingsPanel settings={settings} onUpdated={setSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StockInventoryTable = ({ products, sizeFilter, onReload }) => {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500" data-testid="inventory-table-empty">
        No hay productos con el filtro actual.
      </div>
    );
  }
  return (
    <div className="border border-gray-200 bg-white overflow-x-auto" data-testid="inventory-stock-table">
      <div className="p-4 md:p-5 border-b border-gray-100">
        <p className="eyebrow">Editar stock por prenda y talla</p>
        <p className="mt-1 text-xs text-gray-500">
          Modifica los números y pulsa <strong>Guardar</strong> en la fila. Buzo Completo (Talca): el stock se sincroniza
          con pantalón y polerón.
        </p>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-2 text-left font-semibold sticky left-0 bg-gray-50 z-10 min-w-[200px]">Colegio · Prenda</th>
            {SIZES.map((sz) => (
              <th
                key={sz}
                className={`p-2 font-semibold text-center min-w-[52px] ${sizeFilter === sz ? "bg-[#FF4D4D]/10 text-[#FF4D4D]" : ""}`}
              >
                {sz}
              </th>
            ))}
            <th className="p-2 font-semibold text-right bg-gray-50 min-w-[72px]">Total</th>
            <th className="p-2 font-semibold text-center bg-gray-50 min-w-[88px]">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <StockEditorRow key={p.id} product={p} sizeFilter={sizeFilter} onReload={onReload} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StockEditorRow = ({ product, sizeFilter, onReload }) => {
  const [sizes, setSizes] = useState(() => product.sizes || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSizes(product.sizes || []);
  }, [product]);

  const dirty = JSON.stringify(sizes) !== JSON.stringify(product.sizes || []);

  const setStockForSize = (size, raw) => {
    const n = Math.max(0, Math.floor(Number(raw) || 0));
    setSizes((prev) => prev.map((s) => (s.size === size ? { ...s, stock: n } : s)));
  };

  const rowTotal = sizes.reduce((a, s) => a + (Number(s.stock) || 0), 0);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/products/${product.id}`, { sizes });
      toast.success(`${product.name}: stock guardado`);
      await onReload();
    } catch {
      toast.error("No se pudo guardar el stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50/80" data-testid={`inventory-row-${product.id}`}>
      <td className="p-2 align-top sticky left-0 bg-white z-10 border-r border-gray-100">
        <span className="text-gray-500 block truncate max-w-[12rem] sm:max-w-[14rem]">
          {product.school_name.replace("Colegio ", "C. ").replace("Escuela ", "E. ")}
        </span>
        <span className="font-medium text-gray-900">{product.name}</span>
        {product.dynamic_stock && (
          <span className="ml-1.5 inline-block align-middle text-[9px] font-bold uppercase tracking-wider bg-[#FF4D4D]/15 text-[#FF4D4D] px-1.5 py-0.5 rounded-sm">
            Stock combinado
          </span>
        )}
      </td>
      {SIZES.map((sz) => {
        const row = sizes.find((x) => x.size === sz);
        const orig = (product.sizes || []).find((x) => x.size === sz);
        const val = row ? row.stock : 0;
        const changed = orig && row && Number(orig.stock) !== Number(row.stock);
        return (
          <td
            key={sz}
            className={`p-1 align-top ${sizeFilter === sz ? "bg-[#FF4D4D]/5" : ""}`}
          >
            {row ? (
              <input
                type="number"
                min={0}
                value={val}
                onChange={(e) => setStockForSize(sz, e.target.value)}
                className={`w-full min-w-0 border px-1 py-1.5 text-center text-xs focus:outline-none focus:border-black rounded-sm ${
                  changed ? "border-amber-400 bg-amber-50/50" : "border-gray-200"
                }`}
                data-testid={`inv-stock-${product.id}-${sz}`}
              />
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </td>
        );
      })}
      <td className="p-2 text-right font-semibold align-top bg-gray-50/80">{rowTotal}</td>
      <td className="p-2 align-top text-center">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-1 btn-brand px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid={`inv-save-${product.id}`}
        >
          <Save size={11} /> {saving ? "…" : "Guardar"}
        </button>
      </td>
    </tr>
  );
};

const SettingsPanel = ({ settings, onUpdated }) => {
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingBordado, setUploadingBordado] = useState(false);
  const [uploadingBordadosHero, setUploadingBordadosHero] = useState(false);
  const [heroUrl, setHeroUrl] = useState(settings?.hero_image_url || "");
  const [bordadoUrl, setBordadoUrl] = useState(settings?.bordado_image_url || "");
  const [bordadosHeroUrl, setBordadosHeroUrl] = useState(settings?.bordados_hero_image_url || "");

  useEffect(() => {
    setHeroUrl(settings?.hero_image_url || "");
    setBordadoUrl(settings?.bordado_image_url || "");
    setBordadosHeroUrl(settings?.bordados_hero_image_url || "");
  }, [settings]);

  const makeUploader = (endpoint, setLoading, successMsg) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated(data);
      toast.success(successMsg);
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const uploadHero = makeUploader("/admin/settings/hero-image", setUploadingHero, "Imagen de portada actualizada");
  const uploadBordado = makeUploader("/admin/settings/bordado-image", setUploadingBordado, "Imagen de bordados actualizada");
  const uploadBordadosHero = makeUploader("/admin/settings/bordados-hero-image", setUploadingBordadosHero, "Imagen de la página Bordados actualizada");

  const makeUrlSaver = (field, value) => async () => {
    if (!value) return;
    try {
      const { data } = await api.patch("/admin/settings", { [field]: value });
      onUpdated(data);
      toast.success("Imagen actualizada");
    } catch {
      toast.error("Error al guardar");
    }
  };

  const saveHeroUrl = makeUrlSaver("hero_image_url", heroUrl);
  const saveBordadoUrl = makeUrlSaver("bordado_image_url", bordadoUrl);
  const saveBordadosHeroUrl = makeUrlSaver("bordados_hero_image_url", bordadosHeroUrl);

  return (
    <div className="space-y-6" data-testid="settings-panel">
      <ImageSettingCard
        title="Imagen principal de la portada"
        description="Se muestra en el hero del inicio. Recomendado 1200×1500 px (4:5)."
        imageUrl={settings?.hero_image_url}
        onUpload={uploadHero}
        uploading={uploadingHero}
        url={heroUrl}
        setUrl={setHeroUrl}
        onSaveUrl={saveHeroUrl}
        testPrefix="hero"
        aspect="aspect-[4/5]"
      />
      <ImageSettingCard
        title="Imagen del banner de Bordados (portada)"
        description="Se muestra en el banner de la portada que promociona el servicio de bordados. Recomendado 800×600 px (4:3)."
        imageUrl={settings?.bordado_image_url}
        onUpload={uploadBordado}
        uploading={uploadingBordado}
        url={bordadoUrl}
        setUrl={setBordadoUrl}
        onSaveUrl={saveBordadoUrl}
        testPrefix="bordado"
        aspect="aspect-[4/3]"
      />
      <ImageSettingCard
        title="Imagen principal de la página /bordados"
        description="Se muestra como imagen grande en la página dedicada al servicio de bordados. Recomendado 1200×1500 px (4:5)."
        imageUrl={settings?.bordados_hero_image_url}
        onUpload={uploadBordadosHero}
        uploading={uploadingBordadosHero}
        url={bordadosHeroUrl}
        setUrl={setBordadosHeroUrl}
        onSaveUrl={saveBordadosHeroUrl}
        testPrefix="bordados-hero"
        aspect="aspect-[4/5]"
      />
    </div>
  );
};

const ImageSettingCard = ({
  title,
  description,
  imageUrl,
  onUpload,
  uploading,
  url,
  setUrl,
  onSaveUrl,
  testPrefix,
  aspect,
}) => (
  <div className="border border-gray-200 bg-white p-6" data-testid={`${testPrefix}-settings-card`}>
    <p className="eyebrow">{title}</p>
    <p className="mt-1 text-xs text-gray-500">{description} Admite JPG, PNG o WEBP.</p>

    <div className="mt-5 grid md:grid-cols-2 gap-6">
      <div className={`${aspect} bg-gray-50 border border-gray-100 overflow-hidden`} data-testid={`${testPrefix}-preview`}>
        {imageUrl ? (
          <img src={resolveImage(imageUrl)} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <p className="eyebrow">Subir nueva imagen</p>
          <label
            className="mt-2 inline-flex items-center gap-1.5 text-xs border border-gray-300 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-sm"
            data-testid={`${testPrefix}-upload-label`}
          >
            <Upload size={12} />
            {uploading ? "Subiendo..." : "Seleccionar imagen"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
              data-testid={`${testPrefix}-upload-input`}
            />
          </label>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="eyebrow">O usar URL externa</p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2 w-full border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-black rounded-sm"
            placeholder="https://..."
            data-testid={`${testPrefix}-url-input`}
          />
          <button
            onClick={onSaveUrl}
            className="mt-2 inline-flex items-center gap-1.5 btn-brand px-3 py-2 text-xs font-medium rounded-sm"
            data-testid={`${testPrefix}-url-save-btn`}
          >
            <Save size={12} /> Guardar URL
          </button>
        </div>
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-500 flex items-start gap-2">
          <ImageIcon size={14} className="mt-0.5" />
          <p>La imagen se muestra de inmediato en la portada pública tras guardar.</p>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, accent = "" }) => (
  <div className="border border-gray-200 p-4 md:p-5 bg-white">
    <p className="eyebrow">{label}</p>
    <p className={`font-display text-3xl font-semibold mt-2 ${accent}`}>{value}</p>
  </div>
);

const OrdersTable = ({ orders, onStatusChange, onDelete, onRestore, onHardDelete, emptyMsg, mode }) => {
  if (orders.length === 0)
    return <p className="text-gray-500 py-12 text-center border border-dashed border-gray-200" data-testid="no-orders">{emptyMsg}</p>;
  return (
    <div className="border border-gray-200 overflow-x-auto" data-testid={`orders-table-${mode}`}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left">
            <th className="p-3 font-semibold">Fecha</th>
            <th className="p-3 font-semibold">Cliente</th>
            <th className="p-3 font-semibold">Contacto</th>
            <th className="p-3 font-semibold">Productos</th>
            <th className="p-3 font-semibold">Entrega</th>
            <th className="p-3 font-semibold text-right">Total</th>
            <th className="p-3 font-semibold">Estado</th>
            <th className="p-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => (
            <tr key={o.id} data-testid={`order-row-${o.id}`}>
              <td className="p-3 text-xs text-gray-600 whitespace-nowrap align-top">
                {new Date(o.created_at).toLocaleString("es-CL")}
              </td>
              <td className="p-3 align-top">
                <p className="font-medium">{o.customer_name}</p>
                <p className="text-xs text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</p>
              </td>
              <td className="p-3 align-top">
                <p className="text-xs">{o.whatsapp}</p>
                <p className="text-xs text-gray-500">{o.email}</p>
              </td>
              <td className="p-3 align-top">
                <ul className="space-y-1">
                  {o.items.map((it, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="text-gray-500">{it.school_name}</span> · <strong>{it.product_name}</strong> — T.{it.size} × {it.quantity} · {formatCLP(it.unit_price)}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="p-3 align-top text-xs">
                <div className="inline-flex items-center gap-1">
                  {(o.delivery_method || "pickup") === "pickup" ? (
                    <><Store size={12} /> Retiro</>
                  ) : (
                    <><Truck size={12} /> Delivery</>
                  )}
                </div>
                {o.delivery_fee ? <p className="text-gray-500 mt-0.5">+{formatCLP(o.delivery_fee)}</p> : null}
              </td>
              <td className="p-3 text-right font-semibold align-top whitespace-nowrap">{formatCLP(o.total)}</td>
              <td className="p-3 align-top">
                {mode === "active" ? (
                  <select
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    className="border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:border-black rounded-sm"
                    data-testid={`order-status-${o.id}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.v} value={s.v}>{s.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <AlertTriangle size={12} /> En papelera
                  </span>
                )}
              </td>
              <td className="p-3 align-top">
                {mode === "active" ? (
                  <button
                    onClick={() => onDelete(o.id)}
                    className="text-gray-400 hover:text-[#FF4D4D] transition-colors"
                    data-testid={`order-delete-${o.id}`}
                    aria-label="Enviar a papelera"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRestore(o.id)}
                      className="text-xs inline-flex items-center gap-1 border border-gray-300 px-2 py-1 hover:border-black"
                      data-testid={`order-restore-${o.id}`}
                    >
                      <RotateCcw size={12} /> Restaurar
                    </button>
                    <button
                      onClick={() => onHardDelete(o.id)}
                      className="text-xs inline-flex items-center gap-1 bg-[#FF4D4D] text-white px-2 py-1 hover:bg-[#E63E3E]"
                      data-testid={`order-hard-delete-${o.id}`}
                    >
                      <Trash2 size={12} /> Definitivo
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductCard = ({ product, onUpdated }) => {
  const [sizes, setSizes] = useState(product.sizes);
  const [name, setName] = useState(product.name);
  const [basePrice, setBasePrice] = useState(product.base_price || 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setSizes(product.sizes);
    setName(product.name);
    setBasePrice(product.base_price || 0);
  }, [product]);

  const updateSize = (idx, field, val) => {
    setSizes((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: Number(val) || 0 } : s)));
  };

  const isDirty =
    name !== product.name ||
    Number(basePrice) !== Number(product.base_price || 0) ||
    JSON.stringify(sizes) !== JSON.stringify(product.sizes);

  const save = async () => {
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/products/${product.id}`, {
        sizes,
        name: name.trim(),
        base_price: Number(basePrice) || 0,
      });
      onUpdated(data);
      toast.success("Guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post(`/admin/products/${product.id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated(data);
      toast.success("Imagen actualizada");
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const totalStock = sizes.reduce((s, x) => s + x.stock, 0);

  return (
    <div className="border border-gray-200 p-4 bg-white" data-testid={`admin-product-${product.id}`}>
      <div className="flex gap-4">
        <div className="h-24 w-24 bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
          <img src={resolveImage(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">{product.school_name}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-0.5 w-full font-medium text-base border border-transparent hover:border-gray-200 focus:border-black focus:outline-none px-1 py-0.5 -mx-1 rounded-sm bg-transparent"
            data-testid={`name-${product.id}`}
            placeholder="Nombre del producto"
          />
          <p className="text-xs text-gray-500 mt-1">Stock total: <span className="font-semibold text-gray-700">{totalStock}</span></p>
          <label className="mt-2 inline-flex items-center gap-1.5 text-xs border border-gray-300 px-2.5 py-1 cursor-pointer hover:bg-gray-50 rounded-sm">
            <Upload size={12} />
            {uploading ? "Subiendo..." : "Cambiar foto"}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} data-testid={`upload-${product.id}`} />
          </label>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="eyebrow mb-2">Precio principal del catálogo</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">$</span>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-40 border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-black rounded-sm"
            data-testid={`base-price-${product.id}`}
            placeholder="0"
          />
          <span className="text-[11px] text-gray-400">CLP · visible en el catálogo</span>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="eyebrow mb-2">Stock y precio por talla</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {sizes.map((s, idx) => (
            <div key={s.size} className="border border-gray-200 p-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{s.size}</span>
              </div>
              <label className="block mt-1 text-[10px] text-gray-500">Stock</label>
              <input
                type="number"
                value={s.stock}
                onChange={(e) => updateSize(idx, "stock", e.target.value)}
                className="w-full border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-black"
                data-testid={`stock-${product.id}-${s.size}`}
              />
              <label className="block mt-1 text-[10px] text-gray-500">Precio</label>
              <input
                type="number"
                value={s.price}
                onChange={(e) => updateSize(idx, "price", e.target.value)}
                className="w-full border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-black"
                data-testid={`price-${product.id}-${s.size}`}
              />
            </div>
          ))}
        </div>
        <button
          onClick={save}
          disabled={saving || !isDirty}
          className="mt-3 inline-flex items-center gap-1.5 btn-brand px-4 py-2 text-xs font-medium rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid={`save-${product.id}`}
        >
          <Save size={12} /> {saving ? "Guardando..." : isDirty ? "Guardar cambios" : "Sin cambios"}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
