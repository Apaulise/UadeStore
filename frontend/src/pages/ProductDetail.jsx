import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProductsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/layout/ProductCard";
import { resolveCategory } from "../data/products";

const placeholderImage = "https://via.placeholder.com/600x600.png?text=UADE+Store";

const normalizeProductCard = (product) => {
  const variants = (product.Stock ?? []).map((stock) => ({
    stockId: stock.id,
    size: stock.talle,
    available: (stock.stock ?? 0) > 0,
    colorId: stock.Color?.id ?? null,
    colorName: stock.Color?.nombre ?? null,
    colorHex: stock.Color?.hexa ?? null,
  }));

  const firstImage = product.Imagen?.[0]?.imagen ?? null;
  const defaultVariant = variants.find((variant) => variant.available) ?? variants[0] ?? null;

  return {
    id: product.id,
    name: product.Titulo,
    price: Number(product.precio ?? 0),
    category: resolveCategory(product.categoria),
    image: firstImage,
    variants,
    defaultVariant,
    hasStock: variants.some((variant) => variant.available),
  };
};

const mapDetailProduct = (product) => {
  const variants = (product.Stock ?? []).map((stock) => ({
    stockId: stock.id,
    size: stock.talle ?? null,
    colorId: stock.Color?.id ?? null,
    colorName: stock.Color?.nombre ?? "Único",
    colorHex: stock.Color?.hexa ?? null,
    availableUnits: stock.stock ?? 0,
    available: (stock.stock ?? 0) > 0,
  }));

  return {
    id: product.id,
    name: product.Titulo,
    description: product.descripcion ?? "",
    category: resolveCategory(product.categoria),
    price: Number(product.precio ?? 0),
    images: (product.Imagen ?? []).map((img) => img.imagen).filter(Boolean),
    variants,
  };
};

const ensureHex = (value) => {
  if (!value) return "#1F3B67";
  return value.startsWith("#") ? value : `#${value}`;
};

const SIZE_GUIDE_HEADERS = ["Medida", "XS", "S", "M", "L", "XL"];
const SIZE_GUIDE_ROWS = [
  { label: "Cintura", values: ["60", "65", "70", "75", "80"] },
  { label: "Torso", values: ["85", "90", "95", "100", "105"] },
  { label: "Largo de Piernas", values: ["100", "105", "110", "115", "120"] },
  { label: "Largo de Brazos", values: ["47", "50", "55", "60", "65"] },
  { label: "Cadera", values: ["90", "95", "100", "105", "110"] },
  { label: "Pecho", values: ["85", "90", "95", "100", "105"] },
];

const SizeGuideModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-brand-text">Tabla de Medidas de Talles</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100"
            aria-label="Cerrar tabla de talles"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-brand-text">
              <thead>
                <tr className="bg-[#E9EDF7] text-center text-xs font-semibold uppercase text-brand-blue">
                  {SIZE_GUIDE_HEADERS.map((header) => (
                    <th key={header} className="border border-[#C5D1E8] px-3 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE_ROWS.map((row) => (
                  <tr key={row.label} className="text-center">
                    <th className="border border-[#E1E7F2] px-3 py-2 text-left font-semibold">{row.label}</th>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`} className="border border-[#E1E7F2] px-3 py-2">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS', 
  minimumFractionDigits: 2,
});

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const showSizeFeatures = product?.category === "NUESTROS BASICOS";

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ProductsAPI.get(productId);
        const mapped = mapDetailProduct(data);
        setProduct(mapped);

        const showSize = mapped.category === "NUESTROS BASICOS";
        const defaultVariant = mapped.variants.find((variant) => variant.available) ?? mapped.variants[0] ?? null;
        const defaultSize = showSize
          ? defaultVariant?.size ?? mapped.variants.find((v) => v.size !== null && v.size !== undefined)?.size ?? null
          : null;

        setSelectedColor(defaultVariant?.colorId ?? null);
        setSelectedSize(defaultSize);
        setQuantity(1);
        setSelectedImage(0);
      } catch (err) {
        console.error("Error al cargar el producto", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const data = await ProductsAPI.list();
        const normalized = data
          .filter((item) => item.id !== Number(productId))
          .map(normalizeProductCard)
          .slice(0, 4);
        setRecommended(normalized);
      } catch (err) {
        console.error("No se pudieron cargar las recomendaciones", err);
      }
    };

    fetchRecommended();
  }, [productId]);

  const colorOptions = useMemo(() => {
    if (!product) return [];
    const map = new Map();

    // 1. Obtenemos todos los colores únicos primero
    product.variants.forEach((variant) => {
      const key = variant.colorId ?? "default";
      if (!map.has(key)) {
        map.set(key, {
          id: key === "default" ? null : key,
          label: variant.colorName ?? "Único",
          hex: variant.colorHex ?? "#1F3B67",
          available: false, // Empezamos asumiendo que no está disponible
        });
      }
    });

    // 2. Determinamos la disponibilidad basados en el talle seleccionado
    product.variants
      .filter((variant) =>
        // Filtramos por el talle seleccionado (si hay uno)
        selectedSize === null || selectedSize === undefined
          ? variant.available // Si no hay talle, solo chequeamos si la variante tiene stock
          : (variant.size ?? null) === (selectedSize ?? null) && variant.available,
      )
      .forEach((availableVariant) => {
        // Marcamos el color de esta variante disponible como 'available'
        const key = availableVariant.colorId ?? "default";
        if (map.has(key)) {
          map.get(key).available = true;
        }
      });

    return Array.from(map.values());
  }, [product, selectedSize]); 

const sizeOptions = useMemo(() => {
    if (!product || !showSizeFeatures) return [];
    const map = new Map();

    // 1. Obtenemos TODOS los talles únicos primero, sin importar el stock o color
    product.variants.forEach((variant) => {
      const label = variant.size ?? "Único";
      if (!map.has(label)) {
        map.set(label, {
          label,
          value: variant.size ?? null,
          available: false, // Empezamos asumiendo que NO está disponible
        });
      }
    });

    // 2. Ahora, en una segunda pasada, determinamos la disponibilidad
    // basándonos en el color seleccionado
    product.variants
      .filter((variant) =>
        // Filtramos las variantes que SÍ tienen stock para el color seleccionado
        selectedColor === null || selectedColor === undefined
          ? variant.available // Si no hay color seleccionado, chequeamos que la variante tenga stock
          : variant.colorId === selectedColor && variant.available, // Si hay color, chequeamos color Y stock
      )
      .forEach((availableVariant) => {
        // Marcamos el talle de esta variante disponible como 'available: true'
        const label = availableVariant.size ?? "Único";
        if (map.has(label)) {
          map.get(label).available = true;
        }
      });

    // 6. Devolvemos el array COMPLETO (ej: [S, M, L]) donde cada item
    // tiene su 'available' correcto.
    return Array.from(map.values());
  }, [product, selectedColor, showSizeFeatures]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) => {
        const colorMatch =
          selectedColor === null || selectedColor === undefined
            ? variant.colorId === null || variant.colorId === undefined
            : variant.colorId === selectedColor;
        const sizeMatch =
          (variant.size ?? null) === (selectedSize ?? null);
        return colorMatch && sizeMatch;
      }) ?? null
    );
  }, [product, selectedColor, selectedSize]);

  const galleryImages = useMemo(() => {
    if (!product) return [placeholderImage];
    const base = product.images ?? [];
    if (base.length === 0) return [placeholderImage];
    if (base.length >= 4) return base;
    const repeated = [...base];
    while (repeated.length < 4) {
      repeated.push(base[repeated.length % base.length]);
    }
    return repeated;
  }, [product]);

  const availableUnits = selectedVariant?.availableUnits ?? 0;
  const isAddDisabled = !selectedVariant?.available || availableUnits === 0;

  useEffect(() => {
    if (availableUnits > 0 && quantity > availableUnits) {
      setQuantity(availableUnits);
    }
  }, [availableUnits, quantity]);
  
  const increaseQuantity = () => {
    // Solo aumenta si la cantidad actual es menor al stock disponible
    if (quantity < availableUnits) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant?.stockId) {
      toast.error("Seleccioná una combinación disponible");
      return;
    }

    try {
      await addItem({ stockId: selectedVariant.stockId, quantity });
      toast.success("Producto agregado al carrito");
    } catch (err) {
      toast.error("No se pudo agregar al carrito");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-brand-cream py-20 text-center text-brand-text/70">
        Cargando producto...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] bg-brand-cream py-20 text-center text-brand-text/70">
        <p className="text-lg font-semibold">No pudimos encontrar este producto.</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-brand-blue px-6 py-2 text-white"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream pb-16 pt-10 text-brand-text">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-label="Galería de producto" className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              {galleryImages.length > 1 && (
                <div className="order-last flex gap-3 lg:order-first lg:flex-col">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`thumb-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                        selectedImage === index
                          ? "border-brand-blue"
                          : "border-transparent hover:border-brand-blue/50"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} vista ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex h-full items-center justify-center rounded-2xl bg-[#F1ECE6]">
                  <img
                    src={galleryImages[selectedImage]}
                    alt={product.name}
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Información del producto" className="flex flex-col gap-6">
            <header>
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                {product.category}
              </span>
              <h1 className="mt-2 text-4xl font-extrabold text-brand-text">{product.name}</h1>
              <p className="mt-3 text-2xl font-semibold text-brand-text">
                {currencyFormatter.format(product.price)}
              </p>
            </header>

            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-brand-text">
                  Color:{" "}
                  <span className="font-normal">
                    {
                      colorOptions.find((color) => color.id === selectedColor)?.label ??
                      colorOptions[0]?.label ??
                      "Único"
                    }
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {/* --- INICIO DE JSX DE COLOR CORREGIDO --- */}
                  {colorOptions.map((option) => (
                    <button
                      key={option.id ?? "default"}
                      type="button"
                      onClick={() => setSelectedColor(option.id ?? null)}
                      className="h-9 w-9 rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue hover:shadow"
                      style={{
                        backgroundColor: ensureHex(option.hex),
                        borderColor:
                          (selectedColor ?? null) === (option.id ?? null)
                            ? "#1F3B67" // Borde seleccionado
                            : "rgba(0, 0, 0, 0.1)", // Borde por defecto
                        boxShadow:
                          (selectedColor ?? null) === (option.id ?? null)
                            ? "0 0 0 4px rgba(31,59,103,0.25)"
                            : undefined,
                      }}
                      aria-label={`Seleccionar color ${option.label}${option.available ? "" : " (sin stock)"}`}
                    />
                  ))}
                  {/* --- FIN DE JSX DE COLOR CORREGIDO --- */}
                </div>
              </div>
            )}

            {showSizeFeatures && sizeOptions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-brand-text">Talle:</p>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-sm font-medium text-brand-blue underline-offset-2 hover:underline"
                  >
                    Tabla de talles
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSelectedSize(option.value)}
                      className={`relative min-w-10 overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                        (selectedSize ?? null) === (option.value ?? null)
                          ? "border-[#1F3B67] bg-white text-brand-text"
                          : "border-black/15 bg-white text-brand-text hover:border-[#1F3B67]"
                      } ${option.available ? "" : "border-red-200 bg-gray-100 text-gray-500 opacity-100 cursor-not-allowed"}`}
                      aria-label={option.available ? `Talle ${option.label}` : `Talle ${option.label} sin stock`}
                      disabled={!option.available}
                    >
                      {!option.available && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 opacity-70"
                          style={{
                            backgroundImage:
                              "linear-gradient(135deg, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%)",
                          }}
                        />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
  <p className="text-sm font-semibold text-brand-text">Cantidad:</p>
  <div className="mt-3 flex items-center gap-4">
    <div className="flex items-center rounded-full border border-black/10 bg-white">
      
      {/* Botón MENOS */}
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={quantity <= 1} // Deshabilitar si es 1
        className="h-10 w-10 rounded-full text-lg font-bold text-brand-text transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        -
      </button>

      <span className="w-12 text-center text-lg font-semibold">{quantity}</span>

      {/* Botón MAS (Modificado) */}
      <button
        type="button"
        onClick={increaseQuantity}
        disabled={quantity >= availableUnits} // ✨ Se deshabilita si llegamos al tope
        className="h-10 w-10 rounded-full text-lg font-bold text-brand-text transition hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        +
      </button>

    </div>
    
    {/* Texto de disponibilidad */}
    <span className={`text-sm ${quantity >= availableUnits ? 'text-red-500 font-medium' : 'text-brand-text/60'}`}>
      {quantity >= availableUnits && availableUnits > 0
        ? "¡Stock máximo alcanzado!" 
        : `Disponible: ${availableUnits} unidades`}
    </span>
  </div>
</div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className={`w-full rounded-full border-2 py-3 text-lg font-semibold transition disabled:cursor-not-allowed ${
                isAddDisabled
                  ? "border-gray-300 bg-gray-200 text-gray-500"
                  : "border-[#1F3B67] bg-[#1F3B67] text-white hover:bg-transparent hover:text-[#1F3B67]"
              }`}
            >
              {isAddDisabled ? "Sin stock" : "Agregar al carrito"}
            </button>

            {product.description && (
              <p className="text-sm leading-relaxed text-brand-text/80">
                {product.description}
              </p>
            )}

            <div>
              <h2 className="text-lg font-semibold text-brand-text">Detalles:</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-brand-text/80">
                <li>Categoría: {product.category}</li>
                {selectedVariant && (
                  <li>
                    Variante seleccionada: {selectedVariant.colorName}
                    {selectedVariant.size ? ` · Talle ${selectedVariant.size}` : ""}
                  </li>
                )}
                <li>Precio unitario: ${product.price.toFixed(2)}</li>
              </ul>
            </div>
          </section>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-brand-text">
            También te podría gustar
          </h2>
          <p className="mt-1 text-sm text-brand-text/70">
            Combina tu estilo con estos productos:
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recommended.map((item) => (
              <ProductCard key={item.id} product={item} variant="catalog" />
            ))}
            {recommended.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white p-6 text-center text-sm text-brand-text/60">
                Aún no tenemos recomendaciones. Explora el catálogo para descubrir más productos.
              </div>
            )}
          </div>
        </section>

        <div className="mt-10 text-sm text-brand-text/70">
          <Link to="/catalogo" className="text-brand-blue underline-offset-2 hover:underline">
            ← Volver al catálogo
          </Link>
        </div>
      </div>

      <SizeGuideModal open={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductDetail;
