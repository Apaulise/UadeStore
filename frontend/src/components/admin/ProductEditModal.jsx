import { useEffect, useMemo, useRef, useState } from "react";

const tabs = [
  { id: "details", label: "Detalles" },
  { id: "stock", label: "Stock" },
];

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const COLOR_OPTIONS = [
  { label: "Azul", hex: "#1E3763" },
  { label: "Rojo", hex: "#E03131" },
  { label: "Verde", hex: "#2F9E44" },
  { label: "Amarillo", hex: "#F59F00" },
  { label: "Marron", hex: "#795548" },
  { label: "Celeste", hex: "#1C7ED6" },
  { label: "Negro", hex: "#111111" },
  { label: "Blanco", hex: "#F8F9FA" },
];

const createEmptyStockEntry = () => ({
  id: generateId(),
  colorName: "",
  colorHex: "#1E3763",
  size: "",
  quantity: "",
});

const mapInitialStockItems = (product) => {
  if (!product) return [createEmptyStockEntry()];
  const items = product.stockItems ?? [];
  if (!items.length) return [createEmptyStockEntry()];
  return items.map((item) => ({
    id: generateId(),
    colorName: item.colorName ?? item.color ?? "",
    colorHex: item.colorHex ?? item.hex ?? "#1E3763",
    size: item.size ?? "",
    quantity:
      item.quantity !== undefined && item.quantity !== null
        ? String(item.quantity)
        : String(item.stock ?? ""),
  }));
};

const ProductEditModal = ({ product, onClose, onSave, onDelete }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(() => (product ? { ...product } : null));
  const [stockItems, setStockItems] = useState(() => mapInitialStockItems(product));
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const addRowRef = useRef(null);
  const usedColorLabels = useMemo(
    () =>
      new Set(
        stockItems
          .map((item) => (item.colorName ?? "").toLowerCase().trim())
          .filter(Boolean)
      ),
    [stockItems]
  );

  useEffect(() => {
    setForm(product ? { ...product } : null);
    setStockItems(mapInitialStockItems(product));
    setColorMenuOpen(false);
    setActiveTab("details");
  }, [product]);

  useEffect(() => {
    if (!colorMenuOpen) return;
    const handler = (event) => {
      if (!addRowRef.current || addRowRef.current.contains(event.target)) return;
      setColorMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [colorMenuOpen]);

  const isOpen = useMemo(() => Boolean(product), [product]);

  if (!isOpen || !form) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStockItemChange = (rowId, field, value) => {
    setStockItems((prev) =>
      prev.map((entry) => {
        if (entry.id !== rowId) return entry;
        if (field === "colorHex") {
          const match = COLOR_OPTIONS.find(
            (option) => option.hex.toLowerCase() === value.toLowerCase()
          );
          return {
            ...entry,
            colorHex: value,
            colorName: match ? match.label : entry.colorName,
          };
        }
        return { ...entry, [field]: value };
      })
    );
  };

  const addStockRow = (colorOption) => {
    const base = createEmptyStockEntry();
    const entry = colorOption
      ? { ...base, colorName: colorOption.label, colorHex: colorOption.hex }
      : base;
    setStockItems((prev) => [...prev, entry]);
  };

  const removeStockRow = (rowId) => {
    setStockItems((prev) => (prev.length === 1 ? prev : prev.filter((entry) => entry.id !== rowId)));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedStock = stockItems.map(({ id, colorName, colorHex, size, quantity }) => ({
      colorName,
      color: colorName,
      colorHex,
      size,
      quantity: quantity === "" ? 0 : Number(quantity),
    }));
    const totalQuantity = normalizedStock.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    onSave?.({
      ...form,
      stock: totalQuantity,
      stockItems: normalizedStock,
    });
  };

  const handleDeleteClick = () => {
    onDelete?.(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex justify-between border-b px-6 pb-3 pt-5">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setColorMenuOpen(false);
                }}
                className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#1E3763] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
              <path
                d="M6 6l8 8M6 14l8-8"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
          {activeTab === "details" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name ?? ""}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price ?? 0}
                  onChange={(event) => handleChange("price", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-3 text-sm font-semibold text-gray-600">
                  <span />
                  <span>Color</span>
                  <span>Talle</span>
                  <span>Stock Disp.</span>
                </div>
                <div className="mt-3 space-y-3">
                  {stockItems.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeStockRow(entry.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
                        aria-label="Eliminar variante"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                          <path d="M5 5l10 10M5 15L15 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                          <input
                            type="color"
                            value={entry.colorHex || "#1E3763"}
                            onChange={(event) =>
                              handleStockItemChange(entry.id, "colorHex", event.target.value)
                            }
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: entry.colorHex || "#1E3763" }}
                          />
                        </label>
                        <input
                          type="text"
                          value={entry.colorName}
                          onChange={(event) =>
                            handleStockItemChange(entry.id, "colorName", event.target.value)
                          }
                          placeholder="Color"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                        />
                      </div>
                      <input
                        type="text"
                        value={entry.size}
                        onChange={(event) => handleStockItemChange(entry.id, "size", event.target.value)}
                        placeholder="Talle"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                      />
                      <input
                        type="number"
                        min="0"
                        value={entry.quantity}
                        onChange={(event) =>
                          handleStockItemChange(entry.id, "quantity", event.target.value)
                        }
                        placeholder="Cantidad"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                      />
                    </div>
                  ))}
                  <div
                    ref={addRowRef}
                    className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-3 pt-2"
                  >
                    <button
                      type="button"
                      onClick={() => setColorMenuOpen((prev) => !prev)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1E3763] text-[#1E3763] transition hover:bg-[#1E3763]/10"
                      aria-label="Agregar variante"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setColorMenuOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-[#1E3763]/10"
                      >
                        Agregar
                        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="none">
                          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                        </svg>
                      </button>
                      {colorMenuOpen && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                          {COLOR_OPTIONS.map((option) => {
                            const isUsed = usedColorLabels.has(option.label.toLowerCase());
                            return (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() => {
                                  addStockRow(option);
                                  setColorMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-[#1E3763]/10"
                              >
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-gray-200"
                                  style={{ backgroundColor: option.hex }}
                                />
                                <span className="flex-1 text-left">{option.label}</span>
                                {isUsed && (
                                  <svg className="h-3.5 w-3.5 text-[#1E3763]" viewBox="0 0 20 20" fill="none">
                                    <path
                                      d="M5 10l3 3 7-7"
                                      stroke="currentColor"
                                      strokeWidth={1.5}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-400">
                      Agregar
                    </div>
                    <div className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-400">
                      Agregar
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={form.sku ?? ""}
                    onChange={(event) => handleChange("sku", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3763] focus:outline-none focus:ring-2 focus:ring-[#1E3763]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">En stock</label>
                  <label className="mt-1 inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(form.inStock)}
                      onChange={(event) => handleChange("inStock", event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1E3763] focus:ring-[#1E3763]"
                    />
                    Disponible
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDeleteClick}
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
                className="rounded-lg bg-[#1E3763] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16294a]"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
