import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { findProductById, products } from '../data/products';
import { useCart } from '../context/CartContext';

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = findProductById(productId);
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(() => {
    if (!product?.colorOptions?.length) return null;
    const match = product.colorOptions.find(
      (option) =>
        option.label.toLowerCase() === (product.color || '').toLowerCase()
    );
    return match?.id ?? product.colorOptions[0].id;
  });
  const [selectedSize, setSelectedSize] = useState(() => {
    if (!product?.sizeOptions?.length) return null;
    const firstAvailable = product.sizeOptions.find((option) => option.available);
    if (!firstAvailable) return null;
    if (
      product.size &&
      product.sizeOptions.some(
        (option) =>
          option.label.toLowerCase() === product.size.toLowerCase() && option.available
      )
    ) {
      return product.size;
    }
    return firstAvailable.label;
  });
  const [quantity, setQuantity] = useState(1);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const base = product.images?.length
      ? product.images
      : product?.image
        ? [product.image]
        : [];

    if (base.length === 0) return [];

    if (base.length >= 4) return base;

    const replicated = [...base];
    while (replicated.length < 4) {
      replicated.push(base[replicated.length % base.length]);
      if (replicated.length > 8) break;
    }
    return replicated;
  }, [product]);

  const currentColor = useMemo(() => {
    if (!product?.colorOptions?.length || !selectedColor) return null;
    return product.colorOptions.find((option) => option.id === selectedColor) ?? null;
  }, [product?.colorOptions, selectedColor]);

  const isSizeSelectionRequired = Boolean(product?.sizeOptions?.length);
  const isAddDisabled =
    !product?.inStock || (isSizeSelectionRequired && !selectedSize);

  if (!product) {
    return (
      <div className="bg-brand-cream py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-semibold text-brand-text">
            Producto no encontrado
          </h1>
          <p className="mt-4 text-brand-text/70">
            El producto que intentas ver ya no está disponible o fue movido.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-8 rounded-full bg-brand-blue px-6 py-2 font-semibold text-white transition hover:brightness-110"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const recommendedProducts = useMemo(() => {
    if (!product?.recommended?.length) {
      return products.filter((item) => item.id !== product.id).slice(0, 4);
    }
    return product.recommended
      .map((id) => findProductById(id))
      .filter(Boolean)
      .slice(0, 4);
  }, [product]);

  const accentColor = '#1F3B67';

  const handleAddToCart = () => {
    if (isAddDisabled) {
      const errorMessage = !product.inStock
        ? 'Este producto no tiene stock disponible'
        : 'Selecciona un talle disponible antes de agregar al carrito';
      toast.error(errorMessage);
      return;
    }
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: currentColor?.label ?? product.color ?? 'Sin color',
        size: selectedSize ?? undefined,
        quantity,
      });
      toast.success(`${product.name} agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('No se pudo agregar el producto al carrito');
    }
  };

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const activeImageIndex =
    galleryImages.length > 0
      ? Math.min(selectedImage, galleryImages.length - 1)
      : 0;

  const displayedImage = galleryImages[activeImageIndex] ?? null;

  return (
    <div className="bg-brand-cream pb-16 pt-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Gallery */}
          <section aria-label="Galería de producto" className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              {galleryImages.length > 1 && (
                <div className="order-last flex gap-3 lg:order-first lg:flex-col">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${product.id}-thumb-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                        activeImageIndex === index
                          ? 'border-brand-blue'
                          : 'border-transparent hover:border-brand-blue/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - vista ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex h-full items-center justify-center rounded-2xl bg-[#F1ECE6]">
                  {displayedImage ? (
                    <img
                      src={displayedImage}
                      alt={product.name}
                      className="max-h-[420px] w-full object-contain"
                    />
                  ) : (
                    <div className="h-80 w-full rounded-2xl bg-gray-200" />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section aria-label="Información del producto" className="flex flex-col gap-6">
            <header>
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                {product.category}
              </span>
              <h1 className="mt-2 text-4xl font-extrabold text-brand-text">
                {product.name}
              </h1>
              <p className="mt-3 text-2xl font-semibold text-brand-text">
                {formatPrice(product.price)}
              </p>
            </header>

            {/* Color */}
            {product.colorOptions?.length ? (
              <div>
                <p className="text-sm font-semibold text-brand-text">
                  Color:{' '}
                  <span className="font-normal">
                    {currentColor?.label ?? product.color}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colorOptions.map((option) => {
                    const isActive = selectedColor === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedColor(option.id)}
                        className="h-9 w-9 rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue hover:shadow"
                        style={{
                          backgroundColor: option.hex,
                          borderColor: isActive ? accentColor : 'transparent',
                          boxShadow: isActive
                            ? '0 0 0 4px rgba(31,59,103,0.25)'
                            : undefined,
                        }}
                        aria-label={`Seleccionar color ${option.label}`}
                        aria-pressed={isActive}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Size */}
            {product.sizeOptions?.length ? (
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
                  {product.sizeOptions.map((option) => {
                    const isActive =
                      selectedSize?.toLowerCase() === option.label.toLowerCase();
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          option.available ? setSelectedSize(option.label) : null
                        }
                        disabled={!option.available}
                        className={`min-w-10 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                          option.available
                            ? isActive
                              ? 'shadow-sm text-white'
                              : 'border-black/15 bg-white text-brand-text hover:border-brand-blue/60'
                            : 'cursor-not-allowed border-black/10 bg-white text-brand-text/40 opacity-60'
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: accentColor,
                                borderColor: accentColor,
                                color: '#FFFFFF',
                              }
                            : undefined
                        }
                        aria-pressed={isActive}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-brand-text">Cantidad:</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-black/10 bg-white">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="h-10 w-10 rounded-full text-lg font-bold text-brand-text transition hover:bg-black/5"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="h-10 w-10 rounded-full text-lg font-bold text-brand-text transition hover:bg-black/5"
                    aria-label="Incrementar cantidad"
                  >
                    +
                  </button>
                </div>
                {!product.inStock && (
                  <span className="text-sm font-medium text-red-700">
                    Producto sin stock
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className="w-full rounded-full py-3 text-lg font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isAddDisabled ? '#9AA3B5' : accentColor,
              }}
            >
              {product.inStock ? 'Agregar al carrito' : 'Agotado'}
            </button>

            {/* Summary */}
            {product.summary ? (
              <p className="text-sm leading-relaxed text-brand-text/80">
                {product.summary}
              </p>
            ) : null}

            {/* Details list */}
            {product.details?.length ? (
              <div>
                <h2 className="text-lg font-semibold text-brand-text">Detalles:</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-brand-text/80">
                  {product.details.map((detail, index) => (
                    <li key={`${product.id}-detail-${index}`}>{detail}</li>
                  ))}
                </ul>
              </div>
            ) : null}
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
            {recommendedProducts.map((item) => (
              <Link
                key={item.id}
                to={`/producto/${item.id}`}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-[#EFE7DE]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium text-brand-blue">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
