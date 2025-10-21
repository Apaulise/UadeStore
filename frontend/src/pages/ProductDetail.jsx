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

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ProductsAPI.get(productId);
        const mapped = mapDetailProduct(data);
        setProduct(mapped);

        const defaultVariant = mapped.variants.find((variant) => variant.available) ?? mapped.variants[0] ?? null;
        setSelectedColor(defaultVariant?.colorId ?? null);
        setSelectedSize(defaultVariant?.size ?? null);
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
    product.variants.forEach((variant) => {
      const key = variant.colorId ?? "default";
      if (!map.has(key)) {
        map.set(key, {
          id: key === "default" ? null : key,
          label: variant.colorName ?? "Único",
          hex: variant.colorHex ?? "#1F3B67",
        });
      }
    });
    return Array.from(map.values());
  }, [product]);

  const sizeOptions = useMemo(() => {
    if (!product) return [];
    const variants = product.variants.filter((variant) =>
      selectedColor === null || selectedColor === undefined
        ? true
        : variant.colorId === selectedColor,
    );

    const map = new Map();
    variants.forEach((variant) => {
      const label = variant.size ?? "Único";
      if (!map.has(label)) {
        map.set(label, {
          label,
          value: variant.size ?? null,
          available: variant.available,
        });
      }
    });

    return Array.from(map.values());
  }, [product, selectedColor]);

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

  const increaseQuantity = () => {
    setQuantity((prev) => {
      const max = availableUnits || prev + 1;
      return Math.min(prev + 1, max);
    });
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
                ${product.price.toFixed(2)}
              </p>
            </header>

            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-brand-text">
                  Color: {" "}
                  <span className="font-normal">
                    {
                      colorOptions.find((color) => color.id === selectedColor)?.label ??
                      colorOptions[0]?.label ??
                      "Único"
                    }
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
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
                            ? "#1F3B67"
                            : "transparent",
                        boxShadow:
                          (selectedColor ?? null) === (option.id ?? null)
                            ? "0 0 0 4px rgba(31,59,103,0.25)"
                            : undefined,
                      }}
                      aria-label={`Seleccionar color ${option.label}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {sizeOptions.length > 0 && (
              <div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-brand-text">Talle:</p>
                  <button
                    type="button"
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
                      className={`min-w-10 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                        (selectedSize ?? null) === (option.value ?? null)
                          ? "border-brand-blue bg-brand-blue text-white"
                          : "border-black/15 bg-white text-brand-text hover:border-brand-blue/60"
                      } ${option.available ? "" : "cursor-not-allowed opacity-50"}`}
                      disabled={!option.available}
                    >
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
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="h-10 w-10 rounded-full text-lg font-bold text-brand-text transition hover:bg-black/5"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="h-10 w-10 rounded-full text-lg font-bold text-brand-text transition hover:bg-black/5"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-brand-text/60">
                  Disponible: {availableUnits} unidades
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className="w-full rounded-full py-3 text-lg font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isAddDisabled ? "#9AA3B5" : "#1F3B67",
              }}
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
    </div>
  );
};

export default ProductDetail;
