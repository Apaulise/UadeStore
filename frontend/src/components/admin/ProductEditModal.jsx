import { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import ColorPickerModal from "./ColorPickerModal";

const tabs = [
  { id: "details", label: "Detalles" },
  { id: "stock", label: "Stock" },
];

/** Paleta base con nombres canónicos */
const COLOR_OPTIONS = [
  { label: "Azul",     hex: "#1E3763" },
  { label: "Rojo",     hex: "#E03131" },
  { label: "Verde",    hex: "#2F9E44" },
  { label: "Amarillo", hex: "#F59F00" },
  { label: "Marrón",   hex: "#795548" },
  { label: "Celeste",  hex: "#1C7ED6" },
  { label: "Negro",    hex: "#111111" },
  { label: "Blanco",   hex: "#F8F9FA" },
  { label: "Violeta",  hex: "#7C3AED" },
  { label: "Naranja",  hex: "#F97316" },
  { label: "Gris",     hex: "#6B7280" },
];

/** Sinónimos (normalizados) → nombre canónico */
const COLOR_SYNONYMS = {
  "marron": "Marrón",
  "marrón": "Marrón",
  "castaño": "Marrón",
  "azul claro": "Celeste",
  "celeste": "Celeste",
  "purpura": "Violeta",
  "púrpura": "Violeta",
  "violeta": "Violeta",
  "morado": "Violeta",
  "naranjado": "Naranja",
  "gris": "Gris",
  "plata": "Gris",
  "blanco": "Blanco",
  "negro": "Negro",
  "azul": "Azul",
  "rojo": "Rojo",
  "verde": "Verde",
  "amarillo": "Amarillo",
  "naranja": "Naranja",
};

/* ================= Helpers ================= */
const generateId = () => Math.random().toString(36).substring(2, 9);

const hexToRgb = (hex) => {
  const c = (hex || "#000").replace("#", "").trim();
  const m = c.length === 3 ? c.split("").map(ch => ch + ch).join("") : c.slice(0, 6).padEnd(6, "0");
  return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) };
};
const rgbDist2 = (h1, h2) => {
  const a = hexToRgb(h1), b = hexToRgb(h2);
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
};
const normalize = (s = "") =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const NAME_TO_HEX = (() => {
  const map = new Map();
  for (const { label, hex } of COLOR_OPTIONS) map.set(normalize(label), hex);
  for (const [syn, canonical] of Object.entries(COLOR_SYNONYMS)) {
    const hex = COLOR_OPTIONS.find(c => c.label === canonical)?.hex;
    if (hex) map.set(normalize(syn), hex);
  }
  return map;
})();

const HEX_TO_NAME = (() => {
  const map = new Map();
  for (const { label, hex } of COLOR_OPTIONS) map.set(hex.toLowerCase(), label);
  return map;
})();

/** Encuentra el nombre más cercano para un hex */
const nearestNameForHex = (hex) => {
  const exact = HEX_TO_NAME.get((hex || "").toLowerCase());
  if (exact) return exact;
  let best = COLOR_OPTIONS[0], bestD = Infinity;
  for (const opt of COLOR_OPTIONS) {
    const d = rgbDist2(hex, opt.hex);
    if (d < bestD) { bestD = d; best = opt; }
  }
  return best.label;
};

/** Devuelve el hex para un nombre (exacto/sinónimo/prefijo único). */
const hexForNameFlexible = (name) => {
  const key = normalize(name);
  if (!key) return null;

  // 1) Exacto o sinónimo
  if (NAME_TO_HEX.has(key)) return NAME_TO_HEX.get(key);

  // 2) Prefijo único entre nombres canónicos + sinónimos
  const candidates = [];
  for (const [n, h] of NAME_TO_HEX.entries()) {
    if (n.startsWith(key)) candidates.push({ n, h });
  }
  if (candidates.length === 1) return candidates[0].h;
  return null;
};

/** Nombre canónico para un hex (si exacto) */
const canonicalNameForHex = (hex) => HEX_TO_NAME.get((hex || "").toLowerCase()) || null;
/* =============== /Helpers ================== */

export default function ProductEditModal({ product, onClose, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(() => (product ? { ...product } : null));

  // ✅ SIN FILAS PREDETERMINADAS
  const [stockItems, setStockItems] = useState(() => product?.stockItems ?? []);

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [colorModalRowId, setColorModalRowId] = useState(null);

  useEffect(() => {
    if (!product) return;
    setForm({ ...product });
    // ✅ si no trae stockItems, queda []
    setStockItems(product.stockItems ?? []);
    setActiveTab("details");
    setColorMenuOpen(false);
    setColorModalRowId(null);
  }, [product]);

  if (!product || !form) return null;

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const patchRow = (id, patch) => {
    setStockItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)));
  };

  /** HEX → NOMBRE (modal de colores) */
  const applyHexToRow = (id, hex) => {
    const canonical = canonicalNameForHex(hex) || nearestNameForHex(hex);
    patchRow(id, { hex, color: canonical });
  };

  /** NOMBRE → HEX (input de texto) */
  const applyNameToRow = (id, rawName) => {
    const matchHex = hexForNameFlexible(rawName);
    if (matchHex) {
      const canonical = canonicalNameForHex(matchHex) || nearestNameForHex(matchHex);
      patchRow(id, { color: canonical, hex: matchHex });
    } else {
      patchRow(id, { color: rawName });
    }
  };

  const addStockRow = (opt) => {
    setStockItems(prev => [
      ...prev,
      { id: generateId(), color: opt.label, hex: opt.hex, size: "", stock: "" },
    ]);
    setColorMenuOpen(false);
  };

  const removeStockRow = (id) => {
    setStockItems(prev => prev.filter(it => it.id !== id));
    if (colorModalRowId === id) setColorModalRowId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stock = stockItems.reduce((a, it) => a + (Number(it.stock) || 0), 0);
    onSave?.({ ...form, stockItems, stock });
  };

  const ColorCircleButton = ({ hex, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 focus:scale-110 focus:outline-none 
                  ${hex?.toLowerCase() === "#f8f9fa" ? "ring-1 ring-gray-300" : "ring-1 ring-black/10"}`}
      style={{ backgroundColor: hex || "#1E3763" }}
      title="Elegir color"
      aria-label="Elegir color"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header + Tabs */}
        <div className="flex justify-between border-b px-6 pb-3 pt-5">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setColorMenuOpen(false); setColorModalRowId(null); }}
                className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                  activeTab === tab.id ? "bg-[#1E3763] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M6 14l8-8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === "details" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={form.name ?? ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:ring-2 focus:ring-[#1E3763]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Precio</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.price ?? ""}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:ring-2 focus:ring-[#1E3763]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                <textarea
                  rows={5}
                  value={form.description ?? ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:ring-2 focus:ring-[#1E3763]/30"
                />
              </div>
            </>
          ) : (
            // === TAB STOCK ===
            <div className="space-y-3">
              <div
                className="grid items-center gap-3 text-sm font-semibold text-gray-600"
                style={{ gridTemplateColumns: "40px 1fr 1fr 1fr" }}
              >
                <span />
                <span>Color</span>
                <span>Talle</span>
                <span>Stock Disp.</span>
              </div>

              {stockItems.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                  No hay variantes aún. Usá <span className="font-semibold">“Agregar”</span> para crear la primera.
                </div>
              )}

              {stockItems.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center gap-3"
                  style={{ gridTemplateColumns: "40px 1fr 1fr 1fr" }}
                >
                  <button
                    type="button"
                    onClick={() => removeStockRow(item.id)}
                    className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500"
                    aria-label="Eliminar variante"
                  >
                    <FaTrash size={13} />
                  </button>

                  <div className="flex items-center gap-3">
                    <ColorCircleButton
                      hex={item.hex}
                      onClick={() => setColorModalRowId(item.id)}
                    />
                    <input
                      type="text"
                      value={item.color ?? ""}
                      onChange={(e) => applyNameToRow(item.id, e.target.value)}
                      placeholder="Color"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:ring-2 focus:ring-[#1E3763]/30"
                      onBlur={(e) => {
                        const typed = e.target.value;
                        const matchHex = hexForNameFlexible(typed);
                        if (matchHex) {
                          const canonical = canonicalNameForHex(matchHex) || nearestNameForHex(matchHex);
                          patchRow(item.id, { color: canonical, hex: matchHex });
                        } else {
                          patchRow(item.id, { color: canonicalNameForHex(item.hex) || nearestNameForHex(item.hex) });
                        }
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    value={item.size}
                    onChange={(e) => patchRow(item.id, { size: e.target.value })}
                    placeholder="Talle"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:ring-2 focus:ring-[#1E3763]/30"
                  />

                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => patchRow(item.id, { stock: e.target.value })}
                    placeholder="Cantidad"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:ring-2 focus:ring-[#1E3763]/30"
                  />
                </div>
              ))}

              {/* Fila de Agregar */}
              <div
                className="grid items-center gap-3 pt-2 relative"
                style={{ gridTemplateColumns: "40px 1fr 1fr 1fr" }}
              >
                <button
                  type="button"
                  onClick={() => setColorMenuOpen((p) => !p)}
                  className="flex items-center justify-center h-8 w-8 rounded-full border border-[#1E3763] text-[#1E3763] hover:bg-[#1E3763]/10"
                  aria-label="Agregar variante"
                >
                  <FaPlus size={13} />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setColorMenuOpen((p) => !p)}
                    className="flex items-center justify-between w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-[#1E3763]/10"
                  >
                    Agregar
                    <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="none">
                      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                  </button>

                  {colorMenuOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() =>
                            setStockItems((prev) => [
                              ...prev,
                              { id: generateId(), color: c.label, hex: c.hex, size: "", stock: "" },
                            ])
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[#1E3763]/10"
                        >
                          <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: c.hex }} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-400">Agregar</div>
                <div className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-400">Agregar</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => onDelete?.(form)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Eliminar Producto
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="rounded-lg bg-[#1E3763] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16294a]"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL DE COLORES */}
      <ColorPickerModal
        isOpen={!!colorModalRowId}
        initialHex={stockItems.find((i) => i.id === colorModalRowId)?.hex || "#1E3763"}
        initialOpacity={1}
        onCancel={() => setColorModalRowId(null)}
        onApply={(hex /*, opacity */) => {
          if (!colorModalRowId) return;
          applyHexToRow(colorModalRowId, hex);
          setColorModalRowId(null);
        }}
      />
    </div>
  );
}
