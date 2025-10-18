import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/layout/ProductCard';
import { data, useSearchParams } from 'react-router-dom';
import { ProductsAPI } from '../services/api';
//import { products as mockProducts } from '../data/products';

const categories = [
  { name: "NUESTROS BASICOS",  slug: "nuestros-basicos" },
  { name: "BESTSELLERS",  slug: "bestsellers" },
  { name: "ACCESORIO",  slug: "accesorios" },
  { name: "LIBRERIA",  slug: "libreria" },
];

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  const [searchParams, setSearchParams] = useSearchParams();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Llamada correcta a la función y se espera la data
        const data = await ProductsAPI.list(); 
        // La respuesta de la API se guarda directamente en allProducts
        setAllProducts(data); 
        if (data && data.length > 0) {
        const maxInitialPrice = Math.max(...data.map(p => p.precio));
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
  // sincroniza filtros con la URL (q y categoria)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const categorySlugFromURL = searchParams.get('categoria');

    // Buscamos el objeto de categoría que coincide con el slug
    const foundCategory = categories.find(cat => cat.slug === categorySlugFromURL);

    // Actualizamos el filtro con el NOMBRE COMPLETO de la categoría, o null si no se encuentra
    setFilters((prev) => ({ 
      ...prev, 
      query: q, 
      category: foundCategory ? foundCategory.name : null 
    }));
  }, [searchParams]);

  const normalize = (value = '') =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .toLowerCase();

  const matchesQuery = (product, term) => {
    const normalizedTerm = normalize(term.trim());
    if (!normalizedTerm) return true;

    const termParts = normalizedTerm.split(/\s+/).filter(Boolean);
    if (termParts.length === 0) return true;

    const searchableValues = [
      product.name,
      product.category,
      product.color,
      product.size,
      product.id,
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .map((value) => normalize(String(value)));

    if (searchableValues.length === 0) return false;

    const productWords = searchableValues
      .join(' ')
      .split(/\s+/)
      .filter(Boolean);

    return termParts.every((part) =>
      productWords.some((word) => word.startsWith(part))
    );
  };

  // motor de filtrado
  useEffect(() => {
    let products = [...allProducts];
    console.log("productos motor", products)
    if (filters.category) {
      products = products.filter((p) => 
        p.categoria.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.sizes.length > 0) {
    products = products.filter((p) =>
      p.Stock.some(stockItem => filters.sizes.includes(stockItem.talle))
    );
  }

  if (filters.colors.length > 0) {
    products = products.filter((p) =>
      p.Stock.some(stockItem => filters.colors.includes(stockItem.Color.nombre))
    );
  }

  if (filters.inStockOnly) {
    products = products.filter((p) =>
      // CAMBIO: Usamos la propiedad 'stock' en lugar de 'cantidad'
      p.Stock.some(stockItem => stockItem.stock > 0)
    );
  }

  products = products.filter((p) => p.precio <= filters.maxPrice);

  // Búsqueda por texto
  if (filters.query && filters.query.trim()) {
    const term = filters.query.toLowerCase();
    products = products.filter((p) => {
      // CAMBIO: Usamos 'Titulo' en lugar de 'name' y 'categoria'
      const fields = [p.Titulo, p.categoria]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return fields.includes(term);
    });
  }
  
  console.log("desp filtrado", products);
  setFilteredProducts(products);
}, [filters, allProducts]);

  // opciones dinámicas
  const availableOptions = useMemo(() => {
    const relevantProducts = filters.category
      ? allProducts.filter((p) => p.category === filters.category)
      : allProducts;

    const sizes = new Set(
      relevantProducts.flatMap(p => p.Stock.map(stockItem => stockItem.talle))
    );
    const colors = new Set(
      relevantProducts.flatMap(p => p.Stock.map(stockItem => stockItem.Color.nombre))
    );
    const categories = new Set(allProducts.map((p) => p.categoria));

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [allProducts, filters.category]);

  // manejadores
  const handleCategoryChange = (categoryName) => {
  // --- SOLUCIÓN AL PROBLEMA #2 ---
  const isActive = filters.category?.toLowerCase() === categoryName.toLowerCase();
  const newCategoryName = isActive ? null : categoryName;

  setFilters((prev) => ({ ...prev, category: newCategoryName }));

  if (newCategoryName) {
    // Buscamos el slug que corresponde al nombre de la categoría
    const foundCategory = categories.find(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase());
    if (foundCategory) {
      searchParams.set('categoria', foundCategory.slug);
    }
  } else {
    searchParams.delete('categoria');
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

  if (loading) return <div className="text-center py-16">Cargando productos...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Error: {error}</div>;

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
                console.log("llegue aca2"),
                <ProductCard key={product.id} product={product} variant={"catalog"} />
              ))}
            </div>
          ) : (
            console.log("llegue aca"),
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

