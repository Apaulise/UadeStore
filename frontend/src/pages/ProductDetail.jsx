import React, { useEffect,useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

const ProductDetail = () => {
  const [product, setProduct] = useState(null); // Para el producto actual
  const [allProducts, setAllProducts] = useState([]); // Para la lista de recomendados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las selecciones del usuario
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // --- 2. EFECTOS: Para buscar datos y reaccionar a cambios ---

  // Efecto principal para buscar los datos del producto
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Hacemos las dos llamadas a la API en paralelo para más eficiencia
        const [productData, allProductsData] = await Promise.all([
          ProductsAPI.get(productId),
          ProductsAPI.list()
        ]);
        
        // Guardamos los datos en el estado, lo que provocará un re-renderizado
        setProduct(productData);
        setAllProducts(allProductsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [productId]); // Se ejecuta de nuevo si cambia el ID del producto en la URL

   const availableOptions = useMemo(() => {
  if (!product?.Stock) return { colors: [], sizes: [] };

  const colorMap = new Map();
  const sizeMap = new Map();

  product.Stock.forEach(item => {
    // Colores únicos (usando el objeto Color completo)
    if (item.Color && !colorMap.has(item.Color.id)) {
      colorMap.set(item.Color.id, item.Color);
    }
    // Talles únicos (guardando el label y si está disponible)
    if (item.talle && !sizeMap.has(item.talle)) {
      // Asumimos que un talle está disponible si existe en el stock
      sizeMap.set(item.talle, { label: item.talle, available: true }); 
    }
  });

  return {
    colors: Array.from(colorMap.values()),
    sizes: Array.from(sizeMap.values()),
  };
}, [product]);
  
  // --- 3. MEMOS Y LÓGICA DERIVADA: Cálculos que dependen del estado ---

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const base = product.Imagen?.length ? product.Imagen.map(img => img.imagen) : [];
    console.log("imagen2222", base)
    if (base.length >= 4) return base;
    const replicated = [...base];
    while (replicated.length < 4 && base.length > 0) {
      replicated.push(base[replicated.length % base.length]);
    }
    return replicated;
  }, [product]);

  const recommendedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    // Filtra el producto actual y toma los primeros 4
    return allProducts.filter((item) => item.id !== product.id).slice(0, 4);
  }, [product, allProducts]);

  // El resto de tu lógica derivada...
  const displayedImage = galleryImages[selectedImage] ?? null;
  
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

 
  
  const currentColor = useMemo(() => {
    if (!selectedColor || !availableOptions.colors.length) return null;
    return availableOptions.colors.find(c => c.id === selectedColor) ?? null;
}, [selectedColor, availableOptions.colors]);

const currentStock = useMemo(() => {
  // Si no hay producto, no hay stock, o no se ha seleccionado talle/color (si aplica), stock es 0
  if (!product?.Stock || (availableOptions.sizes.length > 0 && !selectedSize) || (availableOptions.colors.length > 0 && !selectedColor)) {
    return 0; 
  }

  // Buscamos en el array Stock el item que coincida EXACTAMENTE
  const stockItem = product.Stock.find(item => 
    item.talle === selectedSize && item.color_id === selectedColor
  );

  // Devolvemos el stock encontrado, o 0 si no se encontró esa combinación
  return stockItem ? stockItem.stock : 0; 
}, [product, selectedColor, selectedSize, availableOptions]);

const isAddDisabled = currentStock < quantity;
useEffect(() => {
  if (product) { // Only run if we have product data

    // Preselect FIRST available color
    if (availableOptions.colors.length > 0) {
      setSelectedColor(availableOptions.colors[0].id); 
    } else {
      setSelectedColor(null);
    }

    // Preselect FIRST available size
    if (availableOptions.sizes.length > 0) {
      const firstAvailableSize = availableOptions.sizes.find(sizeOption => sizeOption.available);
      setSelectedSize(firstAvailableSize ? firstAvailableSize.label : null); 
    } else {
      setSelectedSize(null);
    }
    
    setQuantity(1); // Reset quantity
  }
}, [product, availableOptions]);
  // --- 4. RENDERIZADO CONDICIONAL: Mostramos la UI según el estado ---

  if (loading) {
    return <div className="text-center py-20">Cargando producto...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Producto no encontrado.</div>;
  }
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

  

  const accentColor = '#1F3B67';

  const handleAddToCart = () => {
    if (isAddDisabled) return;
    addItem({
      id: product.id,
      name: product.Titulo,
      price: product.precio,
      image: product.Imagen[0].imagen,
      color: currentColor.nombre,
      size: selectedSize ?? undefined,
      quantity,
    })
    console.log("PRODUCTO", product)
  };

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const activeImageIndex =
    galleryImages.length > 0
      ? Math.min(selectedImage, galleryImages.length - 1)
      : 0;


  return (
    console.log("el producto", product),
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
                      alt={`${product.Titulo} - vista ${index + 1}`} 
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
                      alt={product.Titulo}
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
                {product.categoria}
              </span>
              <h1 className="mt-2 text-4xl font-extrabold text-brand-text">
                {product.Titulo}
              </h1>
              <p className="mt-3 text-2xl font-semibold text-brand-text">
                {formatPrice(product.precio)}
              </p>
            </header>

            {/* Color */}
            {availableOptions.colors.length > 0 && ( 
            <div>
              <p className="text-sm font-semibold text-brand-text">
                Color:{' '}
                <span className="font-normal">
                  {/* Usamos el nombre del color seleccionado */}
                  {currentColor?.nombre ?? ''} 
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {availableOptions.colors.map((option) => {
                  const isActive = selectedColor === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedColor(option.id)}
                      className="h-9 w-9 rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue hover:shadow"
                      style={{
                        // 👇 CORRECCIÓN: Agregar '#' y usar 'hexa'
                        backgroundColor: `#${option.hexa}`, 
                        borderColor: isActive ? '#1F3B67' : 'transparent', // Usar accentColor si lo tienes definido
                        boxShadow: isActive ? '0 0 0 4px rgba(31,59,103,0.25)' : undefined,
                      }}
                      aria-label={`Seleccionar color ${option.nombre}`}
                      aria-pressed={isActive}
                    />
                  );
                })}
              </div>
            </div>
          )}

            {/* Size */}
            {availableOptions.sizes.length > 0 && ( 
            <div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-brand-text">Talle:</p>
                {/* Botón de tabla de talles (sin cambios) */}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableOptions.sizes.map((option) => {
                  const isActive = selectedSize === option.label;
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
                            ? 'shadow-sm text-white' // Estilos activos (faltaba color de fondo)
                            : 'border-black/15 bg-white text-brand-text hover:border-brand-blue/60'
                          : 'cursor-not-allowed border-black/10 bg-white text-brand-text/40 opacity-60'
                      }`}
                      style={
                        isActive && option.available
                          ? {
                              backgroundColor: '#1F3B67', // Usar accentColor
                              borderColor: '#1F3B67',     // Usar accentColor
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
          )}

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
                {currentStock < quantity && ( // Se muestra si el stock es menor a la cantidad deseada
                    <span className="text-sm font-medium text-red-700">
                      Stock insuficiente ({currentStock} disponibles)
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
              {currentStock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>

            {/* Details list */}
            {product.descripcion? (
              <div>
                <h2 className="text-lg font-semibold text-brand-text">Detalles:</h2>
                <h4 className="text-lg font-semibold text-brand-text">{product.descripcion}</h4>
                
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
              console.log("itemmm", item),
              <Link
                key={item.id}
                to={`/producto/${item.id}`}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-[#EFE7DE]">
                {item.Imagen?.[0]?.imagen ? ( 
                  <img
                    // 👇 And here too, just to be safe
                    src={item.Imagen?.[0]?.imagen} 
                    alt={item.Titulo}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300"></div> 
                )}
              </div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">
                    {item.Titulo}
                  </p>
                  <p className="text-sm font-medium text-brand-blue">
                    {formatPrice(item.precio)}
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
