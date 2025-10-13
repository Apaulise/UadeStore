import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/layout/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { products as mockProducts } from '../data/products';

const Catalog = () => {
  // --- ESTADOS ---
  const [allProducts, setAllProducts] = useState([]); // Lista maestra de productos
  const [filteredProducts, setFilteredProducts] = useState([]); // Lista que se muestra al usuario
  const [filters, setFilters] = useState({
    category: null,
    sizes: [],
    colors: [],
    inStockOnly: false,
    maxPrice: 100,
    query: '',
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // carga inicial de datos (reemplazar con fetch real)
  useEffect(() => {
    setAllProducts(mockProducts);
  }, []);

  // sincroniza filtros con la URL (q y categoria)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const categoryFromURL = searchParams.get('categoria') || null;
    setFilters((prev) => ({ ...prev, query: q, category: categoryFromURL }));
  }, [searchParams]);

  // motor de filtrado
  useEffect(() => {
    let products = [...allProducts];

    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters.sizes.length > 0) {
      products = products.filter((p) => p.size && filters.sizes.includes(p.size));
    }
    if (filters.colors.length > 0) {
      products = products.filter((p) => p.color && filters.colors.includes(p.color));
    }
    if (filters.inStockOnly) {
      products = products.filter((p) => p.inStock);
    }
    products = products.filter((p) => p.price <= filters.maxPrice);

    // B�squeda por texto
    if (filters.query && filters.query.trim()) {
      const term = filters.query.toLowerCase();
      products = products.filter((p) => {
        const fields = [p.name, p.category, p.color, p.size]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return fields.includes(term);
      });
    }

    setFilteredProducts(products);
  }, [filters, allProducts]);

  // opciones din�micas
  const availableOptions = useMemo(() => {
    const relevantProducts = filters.category
      ? allProducts.filter((p) => p.category === filters.category)
      : allProducts;

    const sizes = new Set(relevantProducts.map((p) => p.size).filter(Boolean));
    const colors = new Set(relevantProducts.map((p) => p.color).filter(Boolean));
    const categories = new Set(allProducts.map((p) => p.category));

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [allProducts, filters.category]);

  // manejadores
  const handleCategoryChange = (category) => {
    setFilters((prev) => ({ ...prev, category: prev.category === category ? null : category }));
    if (filters.category === category) {
      searchParams.delete('categoria');
    } else {
      searchParams.set('categoria', category);
    }
    setSearchParams(searchParams);
  };

  const handleCheckboxChange = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const handleStockChange = (e) => {
    setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }));
  };

  const handlePriceChange = (e) => {
    setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }));
  };

  const clearFilters = () => {
    setFilters({ category: null, sizes: [], colors: [], inStockOnly: false, maxPrice: 100, query: '' });
    setSearchParams({});
  };

  // vista
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Catalogo</h1>
      <p className="text-gray-600 mb-8">
        Mostrando {filteredProducts.length} de {allProducts.length} productos.
      </p>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* --- Columna de Filtros (Izquierda) --- */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
          <div className="sticky top-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Filtros</h2>
              <button onClick={clearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-800">Limpiar</button>
            </div>

            <div className="space-y-6 border-t pt-6">
              {/* Filtro de Categoria */}
              <div>
                <h3 className="font-semibold mb-2">Categoria</h3>
                <div className="space-y-1">
                  {availableOptions.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`block w-full text-left px-2 py-1 rounded ${filters.category === cat ? 'bg-blue-100 font-semibold' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de Disponibilidad */}
              <div>
                <h3 className="font-semibold mb-2">Disponibilidad</h3>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={filters.inStockOnly} onChange={handleStockChange} className="rounded" />
                  En Stock
                </label>
              </div>

              {/* Filtro de Precio */}
              <div>
                <h3 className="font-semibold mb-2">Precio</h3>
                <input type="range" min="10" max="100" value={filters.maxPrice} onChange={handlePriceChange} className="w-full" />
                <div className="text-sm text-gray-600 text-center">Hasta ${filters.maxPrice}</div>
              </div>

              {/* Filtro de Talle (din�mico) */}
              {availableOptions.sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Talle</h3>
                  <div className="space-y-1">
                    {availableOptions.sizes.map((size) => (
                      <label key={size} className="flex items-center gap-2">
                        <input type="checkbox" value={size} checked={filters.sizes.includes(size)} onChange={() => handleCheckboxChange('sizes', size)} className="rounded" />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro de Color (din�mico) */}
              {availableOptions.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Color</h3>
                  <div className="space-y-1">
                    {availableOptions.colors.map((color) => (
                      <label key={color} className="flex items-center gap-2">
                        <input type="checkbox" value={color} checked={filters.colors.includes(color)} onChange={() => handleCheckboxChange('colors', color)} className="rounded" />
                        {color}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* --- Columna de Productos (Derecha) --- */}
        <main className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant={"catalog"} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold">No se encontraron productos</h3>
              <p className="text-gray-600 mt-2">Intenta ajustar tus filtros o limpiarlos para ver mas resultados.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;

