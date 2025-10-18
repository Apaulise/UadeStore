import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/layout/ProductCard';
import ProductEditModal from '../components/admin/ProductEditModal';

// --- DATOS DE MUESTRA (Reemplazar con tu llamada a la API) ---
const mockProducts = [
  {
    id: 1,
    name: 'Buzo UADE',
    category: 'Bestsellers',
    price: 54,
    inStock: true,
    size: 'M',
    color: 'Gris',
    stock: 26,
    sku: 'UADE-BZ-001',
    description: 'Buzo de frisa premium con logo bordado UADE. Ideal para acompanarte en el campus o las reuniones informales.',
    stockItems: [
      { colorName: 'Azul', colorHex: '#1E3763', size: 'M', quantity: 12 },
      { colorName: 'Gris', colorHex: '#6C757D', size: 'L', quantity: 14 },
    ],
  },
  {
    id: 2,
    name: 'Remera UADE',
    category: 'Nuestros Basicos',
    price: 39,
    inStock: true,
    size: 'S',
    color: 'Blanco',
    stock: 44,
    sku: 'UADE-RM-101',
    description: 'Remera de algodon peinado, corte unisex y confortable. El logo frontal celebra el espiritu UADE.',
    stockItems: [
      { colorName: 'Blanco', colorHex: '#FFFFFF', size: 'S', quantity: 20 },
      { colorName: 'Azul', colorHex: '#1E3763', size: 'M', quantity: 24 },
    ],
  },
  {
    id: 3,
    name: 'Cuaderno Rayado',
    category: 'Libreria',
    price: 12,
    inStock: true,
    size: null,
    color: 'Negro',
    stock: 78,
    sku: 'UADE-CU-305',
    description: 'Encuadernado cosido 17x24cm con 120 hojas rayadas y papel reforzado de 80gr. Listo para tus apuntes.',
    stockItems: [
      { colorName: 'Negro', colorHex: '#1F1F1F', size: 'Único', quantity: 40 },
      { colorName: 'Azul', colorHex: '#1C7ED6', size: 'Único', quantity: 38 },
    ],
  },
  {
    id: 4,
    name: 'Botella Termica',
    category: 'Accesorios',
    price: 25,
    inStock: false,
    size: null,
    color: 'Plata',
    stock: 0,
    sku: 'UADE-BO-210',
    description: 'Botella doble capa de acero inoxidable, mantiene tu bebida fria o caliente hasta por 12 horas.',
    stockItems: [
      { colorName: 'Plata', colorHex: '#ADB5BD', size: '500ml', quantity: 0 },
    ],
  },
  {
    id: 5,
    name: 'Remera UADE Negra',
    category: 'Nuestros Basicos',
    price: 39,
    inStock: true,
    size: 'L',
    color: 'Negro',
    stock: 33,
    sku: 'UADE-RM-205',
    description: 'Remera UADE color negro con serigrafia blanca. Perfecta para combinar con tu outfit urbano.',
    stockItems: [
      { colorName: 'Negro', colorHex: '#111111', size: 'M', quantity: 12 },
      { colorName: 'Negro', colorHex: '#111111', size: 'L', quantity: 21 },
    ],
  },
  {
    id: 6,
    name: 'Buzo UADE Azul',
    category: 'Bestsellers',
    price: 54,
    inStock: true,
    size: 'L',
    color: 'Azul',
    stock: 18,
    sku: 'UADE-BZ-112',
    description: 'Buzo frisa color azul con detalles bordados en blanco. Capucha forrada y bolsillos frontales.',
    stockItems: [
      { colorName: 'Azul', colorHex: '#1E3763', size: 'L', quantity: 10 },
      { colorName: 'Azul', colorHex: '#1E3763', size: 'M', quantity: 8 },
    ],
  },
  {
    id: 7,
    name: 'Gorra UADE',
    category: 'Accesorios',
    price: 18,
    inStock: true,
    size: null,
    color: 'Negro',
    stock: 52,
    sku: 'UADE-GR-001',
    description: 'Gorra snapback con visera curva y ajuste trasero. Logo bordado para los hinchas de la universidad.',
    stockItems: [
      { colorName: 'Negro', colorHex: '#111111', size: 'Único', quantity: 30 },
      { colorName: 'Azul', colorHex: '#1E3763', size: 'Único', quantity: 22 },
    ],
  },
  {
    id: 8,
    name: 'Remera UADE Roja',
    category: 'Nuestros Basicos',
    price: 39,
    inStock: true,
    size: 'M',
    color: 'Rojo',
    stock: 29,
    sku: 'UADE-RM-307',
    description: 'Remera de algodon rojo carmesi. Ideal para destacar en los eventos del campus.',
    stockItems: [
      { colorName: 'Rojo', colorHex: '#E03131', size: 'S', quantity: 10 },
      { colorName: 'Rojo', colorHex: '#E03131', size: 'M', quantity: 19 },
    ],
  },
  {
    id: 9,
    name: 'Taza UADE',
    category: 'Accesorios',
    price: 15,
    inStock: true,
    size: null,
    color: 'Blanco',
    stock: 65,
    sku: 'UADE-TZ-010',
    description: 'Taza ceramica esmaltada de 350ml. Perfecta para tus desayunos antes de clase.',
    stockItems: [
      { colorName: 'Blanco', colorHex: '#FFFFFF', size: '350ml', quantity: 35 },
      { colorName: 'Azul', colorHex: '#1E3763', size: '350ml', quantity: 30 },
    ],
  },
  {
    id: 10,
    name: 'Buzo UADE',
    category: 'Bestsellers',
    price: 54,
    inStock: false,
    size: 'S',
    color: 'Gris',
    stock: 0,
    sku: 'UADE-BZ-220',
    description: 'Version gris jaspeado del clasico buzo UADE. Actualmente sin stock.',
    stockItems: [
      { colorName: 'Gris', colorHex: '#6C757D', size: 'S', quantity: 0 },
    ],
  },
];


// --- PÁGINA PRINCIPAL DEL CATÁLOGO ---

const Admin = () => {
  // --- ESTADOS ---
  const [allProducts, setAllProducts] = useState([]); // Lista maestra de productos
  const [filteredProducts, setFilteredProducts] = useState([]); // Lista que se muestra al usuario
  const [filters, setFilters] = useState({
    category: null,
    sizes: [],
    colors: [],
    inStockOnly: false,
    maxPrice: 100,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const openEditor = (product) => {
    if (!product) return;
    setEditingProduct({
      ...product,
      description: product.description ?? '',
      stock: product.stock ?? 0,
      sku: product.sku ?? '',
      price: product.price ?? 0,
    });
  };

  const closeEditor = () => setEditingProduct(null);

  const handleSaveProduct = (updatedProduct) => {
    setAllProducts((prev) =>
      prev.map((item) =>
        item.id === updatedProduct.id
          ? {
              ...item,
              ...updatedProduct,
              price: Number(updatedProduct.price) || 0,
              stock: Number(updatedProduct.stock) || 0,
              inStock: Boolean(updatedProduct.inStock),
            }
          : item
      )
    );
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productToDelete) => {
    setAllProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
    setEditingProduct(null);
  };

  // --- EFECTOS (LÓGICA) ---

  // 1. Simula la carga inicial de datos (reemplazar con fetch real)
  useEffect(() => {
    // Aquí harías tu llamada a la API: fetch('/api/products').then(...)
    setAllProducts(mockProducts);
  }, []);

  // 2. Sincroniza el parámetro 'categoria' de la URL con el estado de los filtros
  useEffect(() => {
    const categoryFromURL = searchParams.get('categoria');
    if (categoryFromURL) {
      setFilters(prev => ({ ...prev, category: categoryFromURL }));
    }
  }, [searchParams]);

  // 3. El "MOTOR" de filtrado: se ejecuta cada vez que cambian los filtros o la lista de productos
  useEffect(() => {
    let products = [...allProducts];

    // Filtrado por categoría
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    // Filtrado por Talle (si se seleccionó al menos uno)
    if (filters.sizes.length > 0) {
      products = products.filter(p => p.size && filters.sizes.includes(p.size));
    }
    // Filtrado por Color (si se seleccionó al menos uno)
    if (filters.colors.length > 0) {
      products = products.filter(p => p.color && filters.colors.includes(p.color));
    }
    // Filtrado por Stock
    if (filters.inStockOnly) {
      products = products.filter(p => p.inStock);
    }
    // Filtrado por Precio
    products = products.filter(p => p.price <= filters.maxPrice);

    setFilteredProducts(products);

  }, [filters, allProducts]);


  // --- CÁLCULO DE FILTROS DINÁMICOS ---

  const availableOptions = useMemo(() => {
    const relevantProducts = filters.category
      ? allProducts.filter(p => p.category === filters.category)
      : allProducts;

    const sizes = new Set(relevantProducts.map(p => p.size).filter(Boolean));
    const colors = new Set(relevantProducts.map(p => p.color).filter(Boolean));
    const categories = new Set(allProducts.map(p => p.category));

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [allProducts, filters.category]);


  // --- MANEJADORES DE EVENTOS ---

  const handleCategoryChange = (category) => {
    setFilters(prev => ({...prev, category: prev.category === category ? null : category }));
    // Actualiza la URL
    if (filters.category === category) {
      searchParams.delete('categoria');
    } else {
      searchParams.set('categoria', category);
    }
    setSearchParams(searchParams);
  };

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
  }

  const clearFilters = () => {
    setFilters({ category: null, sizes: [], colors: [], inStockOnly: false, maxPrice: 100 });
    setSearchParams({});
  };

  // --- RENDERIZADO (VISTA) ---

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Administración</h1>
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
              {/* Filtro de Categoría */}
              <div>
                <h3 className="font-semibold mb-2">Categoría</h3>
                <div className="space-y-1">
                  {availableOptions.categories.map(cat => (
                    <button key={cat} onClick={() => handleCategoryChange(cat)} 
                      className={`block w-full text-left px-2 py-1 rounded ${filters.category === cat ? 'bg-blue-100 font-semibold' : ''}`}>
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

              {/* Filtro de Talle (dinámico) */}
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

              {/* Filtro de Color (dinámico) */}
              {availableOptions.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Color</h3>
                  <div className="space-y-1">
                    {availableOptions.colors.map(color => (
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
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} variant={"admin"} onEdit={openEditor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold">No se encontraron productos</h3>
              <p className="text-gray-600 mt-2">Intenta ajustar tus filtros o limpiarlos para ver más resultados.</p>
            </div>
          )}
        </main>
      </div>
      </div>
      <ProductEditModal
        product={editingProduct}
        onClose={closeEditor}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </>
  );
}

export default Admin;
