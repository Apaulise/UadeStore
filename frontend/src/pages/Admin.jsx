import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/layout/ProductCard'; // Asegúrate que la ruta sea correcta
import ProductEditModal from '../components/admin/ProductEditModal'; // Asumo que tienes este componente
import { ProductsAPI } from '../services/api'; // Asegúrate que la ruta sea correcta

// Mantené la lista de categorías consistente con la API si es posible, o usa los datos de la API
const categories = [
  { name: "ROPA", slug: "nuestros-basicos" }, // Asumiendo que ambos mapean a ROPA
  { name: "ROPA", slug: "bestsellers" },
  { name: "ACCESORIO", slug: "accesorios" },
  { name: "LIBRERIA", slug: "libreria" },
];

const Admin = () => {
  // --- ESTADOS ---
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: null,
    sizes: [],
    colors: [],
    inStockOnly: false,
    maxPrice: 1000, // Empezar con un precio máximo alto
    query: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- EFECTO: CARGA INICIAL DE DATOS ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await ProductsAPI.list();
        setAllProducts(data);
        // Ajustar precio máximo inicial si hay productos
        if (data && data.length > 0) {
          const maxInitialPrice = Math.max(...data.map(p => p.precio), 0); // Agregamos 0 por si acaso
          setFilters(prev => ({ ...prev, maxPrice: maxInitialPrice }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- EFECTO: SINCRONIZAR FILTROS CON URL ---
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const categorySlugFromURL = searchParams.get('categoria');
    // Traducir slug a nombre de categoría (case-insensitive find)
    const foundCategory = categories.find(cat => cat.slug.toLowerCase() === categorySlugFromURL?.toLowerCase());
    setFilters((prev) => ({
      ...prev,
      query: q,
      // Usamos el NOMBRE de la categoría para el estado interno
      category: foundCategory ? foundCategory.name : null
    }));
  }, [searchParams]);

  // --- EFECTO: MOTOR DE FILTRADO (CORREGIDO) ---
  useEffect(() => {
    let products = [...allProducts];

    // Filtro de Categoría (Case-insensitive)
    if (filters.category) {
      products = products.filter((p) =>
        p.categoria?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    // Filtro de Talle (usando Stock)
    if (filters.sizes.length > 0) {
      products = products.filter((p) =>
        p.Stock?.some(stockItem => filters.sizes.includes(stockItem.talle))
      );
    }
    // Filtro de Color (usando Stock y Color anidado)
    if (filters.colors.length > 0) {
      products = products.filter((p) =>
        p.Stock?.some(stockItem => stockItem.Color && filters.colors.includes(stockItem.Color.nombre))
      );
    }
    // Filtro de Stock Disponible (usando Stock)
    if (filters.inStockOnly) {
      products = products.filter((p) =>
        p.Stock?.some(stockItem => stockItem.stock > 0)
      );
    }
    // Filtro de Precio
    products = products.filter((p) => p.precio <= filters.maxPrice);

    // Filtro de Búsqueda (usando Titulo y categoria)
    if (filters.query && filters.query.trim()) {
      const term = filters.query.toLowerCase();
      products = products.filter((p) => {
        const fields = [p.Titulo, p.categoria] // Usar Titulo y categoria
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return fields.includes(term);
      });
    }

    setFilteredProducts(products);
  }, [filters, allProducts]);

  // --- CÁLCULO DE OPCIONES DINÁMICAS (CORREGIDO) ---
  const availableOptions = useMemo(() => {
    // Usamos allProducts para calcular opciones, no filteredProducts
    const relevantProducts = filters.category
      ? allProducts.filter((p) => p.categoria?.toLowerCase() === filters.category.toLowerCase())
      : allProducts;

    // Extraer talles únicos del array Stock
    const sizes = new Set(
      relevantProducts.flatMap(p => p.Stock?.map(s => s.talle) ?? []).filter(Boolean)
    );
    // Extraer colores únicos del array Stock (nombre del color)
    const colors = new Set(
      relevantProducts.flatMap(p => p.Stock?.map(s => s.Color?.nombre) ?? []).filter(Boolean)
    );
    // Extraer categorías únicas de allProducts
    const categories = new Set(allProducts.map((p) => p.categoria).filter(Boolean));

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      // Devolvemos las categorías en el formato de la API (MAYÚSCULAS)
      categories: Array.from(categories).sort(),
    };
  }, [allProducts, filters.category]);

  // --- MANEJADORES DE EVENTOS (handleCategoryChange CORREGIDO) ---
  const handleCategoryChange = (categoryName) => { // Recibe el nombre (ej: "ROPA")
    const isActive = filters.category?.toLowerCase() === categoryName.toLowerCase();
    const newCategoryName = isActive ? null : categoryName;

    setFilters((prev) => ({ ...prev, category: newCategoryName }));

    // Buscamos el slug correspondiente para poner en la URL
    if (newCategoryName) {
      const foundCategory = categories.find(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase());
      if (foundCategory) {
        searchParams.set('categoria', foundCategory.slug);
      } else {
         searchParams.delete('categoria'); // Si no se encuentra slug, limpiar URL
      }
    } else {
      searchParams.delete('categoria');
    }
    setSearchParams(searchParams);
  };

  // Otros manejadores (sin cambios mayores, asumiendo que funcionan)
   const handleCheckboxChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };
   const handleStockChange = (e) => {
    setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }));
  };
   const handlePriceChange = (e) => {
    setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }));
  };
   const clearFilters = () => {
    // Resetear al maxPrice inicial calculado
    const maxInitialPrice = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.precio), 0) : 1000;
    setFilters({ category: null, sizes: [], colors: [], inStockOnly: false, maxPrice: maxInitialPrice, query: '' });
    setSearchParams({});
  };

   // Funciones para el modal de edición (asumiendo que existen y funcionan)
  const openEditor = (product) => setEditingProduct(product);
  const closeEditor = () => setEditingProduct(null);
  const handleSaveProduct = (updatedProduct) => { /* Tu lógica de guardado */ closeEditor(); };
  const handleDeleteProduct = (productToDelete) => { /* Tu lógica de borrado */ closeEditor(); };

  // --- RENDERIZADO ---
  if (loading) return <div className="text-center py-16">Cargando productos...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Administración</h1>
        <p className="text-gray-600 mb-8">
          Mostrando {filteredProducts.length} de {allProducts.length} productos.
        </p>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Columna de Filtros */}
          <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
            <div className="sticky top-8">
              {/* Encabezado Filtros */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Filtros</h2>
                <button onClick={clearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-800">Limpiar</button>
              </div>
              {/* Contenido Filtros */}
              <div className="space-y-6 border-t pt-6">
                {/* Filtro Categoría (CORREGIDO: Comparación case-insensitive para estilo) */}
                <div>
                  <h3 className="font-semibold mb-2">Categoría</h3>
                  <div className="space-y-1">
                    {availableOptions.categories.map(cat => (
                      <button key={cat} onClick={() => handleCategoryChange(cat)}
                        className={`block w-full text-left px-2 py-1 rounded ${
                          // Comparación case-insensitive para el estilo
                          filters.category?.toLowerCase() === cat.toLowerCase() ? 'bg-blue-100 font-semibold' : ''
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Otros filtros (Disponibilidad, Precio, Talle, Color - sin cambios visuales mayores) */}
                 <div>
                   <h3 className="font-semibold mb-2">Disponibilidad</h3>
                   <label className="flex items-center gap-2">
                     <input type="checkbox" checked={filters.inStockOnly} onChange={handleStockChange} className="rounded" />
                     En Stock
                   </label>
                 </div>
                 <div>
                   <h3 className="font-semibold mb-2">Precio</h3>
                   <input type="range" min="0" max={Math.max(...allProducts.map(p => p.precio), 1000)} value={filters.maxPrice} onChange={handlePriceChange} className="w-full" />
                   <div className="text-sm text-gray-600 text-center">Hasta ${filters.maxPrice}</div>
                 </div>
                 {availableOptions.sizes.length > 0 && (
                   <div>
                     <h3 className="font-semibold mb-2">Talle</h3>
                     <div className="space-y-1">
                       {availableOptions.sizes.map(size => (
                         <label key={size} className="flex items-center gap-2">
                           <input type="checkbox" value={size} checked={filters.sizes.includes(size)} onChange={() => handleCheckboxChange('sizes', size)} className="rounded" />
                           {size}
                         </label>
                       ))}
                     </div>
                   </div>
                 )}
                 {availableOptions.colors.length > 0 && (
                   <div>
                     <h3 className="font-semibold mb-2">Color</h3>
                     <div className="space-y-1">
                       {availableOptions.colors.map(color => (
                         <label key={color} className="flex items-center gap-2">
                           <input type="checkbox" value={color} checked={filters.colors.includes(color)} onChange={() => handleCheckboxChange('colors', color)} className="rounded" />
                           {color} {/* Mostramos el nombre del color */}
                         </label>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </aside>

          {/* Columna de Productos */}
          <main className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  // Pasamos la función openEditor al ProductCard
                  <ProductCard key={product.id} product={product} variant={"admin"} onEdit={() => openEditor(product)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold">No se encontraron productos</h3>
                <p className="text-gray-600 mt-2">Intenta ajustar tus filtros o limpiarlos.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de Edición */}
      <ProductEditModal
        product={editingProduct}
        onClose={closeEditor}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </>
  );
};

export default Admin;
