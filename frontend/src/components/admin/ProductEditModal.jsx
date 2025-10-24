import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import ColorPickerModal from "./ColorPickerModal";

const tabs = [
  { id: "details", label: "Detalles" },
  { id: "stock", label: "Stock" },
];

const DEFAULT_COLORS = [
  { label: "Negro", hex: "#000000" },
  { label: "Azul", hex: "#1E3763" },
  { label: "Amarillo", hex: "#F59F00" },
  { label: "Rojo", hex: "#E03131" },
  { label: "Verde", hex: "#2F9E44" },
  { label: "Celeste", hex: "#1C7ED6" },
  { label: "Blanco", hex: "#F8F9FA" },
  { label: "Naranja", hex: "#F97316" },
  { label: "Violeta", hex: "#7C3AED" },
  { label: "Gris", hex: "#6B7280" },
];

const ensureHex = (value, fallback = "#1F3B67") => {
  if (!value) return fallback;
  const normalized = value.toString().trim();
  const sanitized = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return /^#[0-9a-fA-F]{6}$/.test(sanitized)
    ? sanitized.toUpperCase()
    : fallback;
};

const createKey = () => Math.random().toString(36).slice(2, 9);

const createVariant = (initial = {}) => ({
  key: initial.key ?? createKey(),
  id: initial.id ?? null,
  colorName: initial.color ?? initial.colorName ?? "",
  hex: ensureHex(initial.hex),
  size: initial.size ?? "",
  stock: Number(initial.stock ?? 0),
});

const formatColorOption = (color) => ({
  id: color.id ?? null,
  label: color.nombre ?? color.label ?? "",
  hex: ensureHex(color.hexa ?? color.hex ?? "#1F3B67"),
});

export default function ProductEditModal({ product, colorsCatalog = [], sizesCatalog = [], onClose, onSave, onDelete }) {
  const colorOptions = useMemo(() => {
    const list = colorsCatalog.length ? colorsCatalog.map(formatColorOption) : DEFAULT_COLORS;
    const unique = new Map();
    list.forEach((opt) => {
      const key = opt.label.trim().toLowerCase();
      if (!unique.has(key)) unique.set(key, opt);
    });
    return Array.from(unique.values());
  }, [colorsCatalog]);

  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(null);
  const [variants, setVariants] = useState([]);
  const [colorPickerRow, setColorPickerRow] = useState(null);

  useEffect(() => {
    if (!product) return;
    setForm({
      id: product.id,
      name: product.name ?? "",
      price: Number(product.price ?? 0),
      description: product.description ?? "",
    });

    const mappedVariants = (product.stockItems ?? []).map((item) =>
      createVariant({
        id: item.id ?? null,
        color: item.color ?? "",
        hex: item.hex,
        size: item.size ?? "",
        stock: Number(item.stock ?? 0),
      })
    );

    setVariants(mappedVariants.length ? mappedVariants : [createVariant()]);
    setActiveTab("details");
  }, [product]);

  if (!product || !form) return null;

  const updateVariant = (key, patch) => {
    setVariants((prev) =>
      prev.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant))
    );
  };

  const removeVariant = (key) => {
    setVariants((prev) => {
      const next = prev.filter((variant) => variant.key !== key);
      return next.length ? next : [createVariant()];
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const stockItems = variants
      .map((variant) => ({
        id: variant.id,
        colorName: variant.colorName || "",
        colorHex: variant.hex,
        size: variant.size || null,
        stock: Number.isFinite(Number(variant.stock)) ? Number(variant.stock) : 0,
      }))
      .filter((variant) =>
        variant.colorName || variant.size || Number(variant.stock) > 0 || variant.id
      );

    onSave?.({
      ...form,
      price: Number.isFinite(Number(form.price)) ? Number(form.price) : 0,
      stockItems,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4 flex-none">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#1F3B67] text-white"
                    : "bg-[#E9EDF7] text-[#1F3B67] hover:bg-[#D9E3FF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {activeTab === "details" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-brand-text">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1F3B67] focus:ring-2 focus:ring-[#1F3B67]/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-text">Precio</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1F3B67] focus:ring-2 focus:ring-[#1F3B67]/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-text">Descripción</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1F3B67] focus:ring-2 focus:ring-[#1F3B67]/30"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <header className="flex items-center justify-between text-xs font-semibold uppercase text-gray-500">
                <span className="w-1/3">Color</span>
                <span className="w-1/4">Talle</span>
                <span className="w-1/4">Stock Disp.</span>
                <span className="w-10" />
              </header>

              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.key}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2"
                  >
                    <div className="flex w-1/3 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setColorPickerRow(variant.key)}
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: variant.hex }}
                        aria-label="Cambiar color"
                        title="Cambiar color manualmente"
                      />
                      <select
                        value={variant.colorName || ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          const option = colorOptions.find(
                            (opt) => opt.label.toLowerCase() === value.toLowerCase()
                          );
                          updateVariant(variant.key, {
                            colorName: value,
                            hex: option ? option.hex : variant.hex,
                          });
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1F3B67] focus:ring-2 focus:ring-[#1F3B67]/30"
                      >
                        <option value="">Color</option>
                        {colorOptions.map((option) => (
                          <option key={option.label} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <select
                      value={variant.size || ""}
                      onChange={(event) => updateVariant(variant.key, { size: event.target.value })}
                      className="w-1/4 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1F3B67] focus:ring-2 focus:ring-[#1F3B67]/30"
                    >
                      <option value="">Talle</option>
                      {sizesCatalog.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(event) => updateVariant(variant.key, { stock: event.target.value })}
                      placeholder="Cantidad"
                      className="w-1/4 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1F3B67] focus:ring-2 focus:ring-[#1F3B67]/30"
                    />

                    <button
                      type="button"
                      onClick={() => removeVariant(variant.key)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                      aria-label="Eliminar variante"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setVariants((prev) => [...prev, createVariant()])}
                className="flex items-center gap-2 rounded-full border border-[#1F3B67] px-4 py-2 text-sm font-semibold text-[#1F3B67] transition hover:bg-[#1F3B67]/10"
              >
                <FaPlus size={12} /> Agregar variante
              </button>
            </div>
          )}
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4 bg-white flex-none">
            <button
              type="button"
              onClick={() => onDelete?.(product)}
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
                className="rounded-lg bg-[#1F3B67] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16294A]"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>

      <ColorPickerModal
        isOpen={Boolean(colorPickerRow)}
        initialHex={ensureHex(variants.find((variant) => variant.key === colorPickerRow)?.hex)}
        initialOpacity={1}
        onCancel={() => setColorPickerRow(null)}
        onApply={(hex) => {
          if (!colorPickerRow) return;
          updateVariant(colorPickerRow, { hex: ensureHex(hex) });
          setColorPickerRow(null);
        }}
      />
    </div>
  );
}
