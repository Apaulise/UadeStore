import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ProductCard from "../components/layout/ProductCard";
import ProductEditModal from "../components/admin/ProductEditModal";
import { ProductsAPI } from "../services/api";

const normalizeHex = (hex) => {
  if (!hex) return null;
  const sanitized = hex.toString().trim();
  return sanitized.startsWith("#") ? sanitized : `#${sanitized}`;
};

const mapProductFromApi = (data) => {
  const variants = (data.Stock ?? []).map((stock) => {
    const colorHex = normalizeHex(stock.Color?.hexa ?? stock.Color?.hex ?? "#1F3B67");
    const availableUnits = Number(stock.stock ?? 0);
    return {
      stockId: stock.id,
      colorName: stock.Color?.nombre ?? "",
      colorHex: colorHex ?? "#1F3B67",
      size: stock.talle ?? "",
      available: availableUnits > 0,
      availableUnits,
    };
  });

  const defaultVariant = variants.find((variant) => variant.available) ?? variants[0] ?? null;

  return {
    id: data.id,
    name: data.Titulo ?? "",
    price: Number(data.precio ?? 0),
    description: data.descripcion ?? "",
    category: data.categoria ?? "",
    image: data.Imagen?.[0]?.imagen ?? null,
    variants,
    defaultVariant,
    stockItems: variants.map((variant) => ({
      id: variant.stockId,
      color: variant.colorName,
      hex: variant.colorHex,
      size: variant.size,
      stock: variant.availableUnits,
    })),
  };
};

const initialFilters = {
  category: null,
  sizes: [],
  colors: [],
  inStockOnly: false,
  maxPrice: 0,
  query: "",
};

const Admin = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [priceCeiling, setPriceCeiling] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [colorsCatalog, setColorsCatalog] = useState([]);
  const [sizesCatalog, setSizesCatalog] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsResponse, colorsResponse, sizesResponse] = await Promise.all([
          ProductsAPI.list(),
          ProductsAPI.colors().catch(() => []),
          ProductsAPI.sizes().catch(() => []),
        ]);

        const mappedProducts = (productsResponse ?? []).map(mapProductFromApi);
        setAllProducts(mappedProducts);

        const maxPrice = mappedProducts.length
          ? Math.max(...mappedProducts.map((product) => product.price))
          : 0;
        setPriceCeiling(maxPrice);
        setFilters((prev) => ({ ...prev, maxPrice: maxPrice || 0 }));

        setColorsCatalog(colorsResponse ?? []);
        setSizesCatalog(sizesResponse ?? []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (
        filters.sizes.length > 0 &&
        !product.variants.some(
          (variant) => variant.size && filters.sizes.includes(variant.size)
        )
      ) {
        return false;
      }

      if (
        filters.colors.length > 0 &&
        !product.variants.some(
          (variant) =>
            variant.colorName && filters.colors.includes(variant.colorName)
        )
      ) {
        return false;
      }

      if (filters.inStockOnly && !product.variants.some((variant) => variant.available)) {
        return false;
      }

      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }

      if (filters.query && filters.query.trim()) {
        const term = filters.query.trim().toLowerCase();
        const haystack = [product.name, product.category, product.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, filters]);

  const availableOptions = useMemo(() => {
    const relevantProducts = filters.category
      ? allProducts.filter((product) => product.category === filters.category)
      : allProducts;

    const sizeSet = new Set();
    const colorSet = new Set();

    relevantProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.size) sizeSet.add(variant.size);
        if (variant.colorName) colorSet.add(variant.colorName);
      });
    });

    const categories = Array.from(
      new Set(allProducts.map((product) => product.category).filter(Boolean))
    ).sort();

    return {
      sizes: Array.from(sizeSet).sort(),
      colors: Array.from(colorSet).sort(),
      categories,
    };
  }, [allProducts, filters.category]);

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };

  const handleCheckboxChange = (type, value) => {
    setFilters((prev) => {
      const current = prev[type];
      const exists = current.includes(value);
      const next = exists ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const handleStockChange = (event) => {
    setFilters((prev) => ({ ...prev, inStockOnly: event.target.checked }));
  };

  const handlePriceChange = (event) => {
    setFilters((prev) => ({ ...prev, maxPrice: Number(event.target.value) }));
  };

  const clearFilters = () => {
    setFilters({ ...initialFilters, maxPrice: priceCeiling });
  };

  const openEditor = (product) => setEditingProduct(product);
  const closeEditor = () => setEditingProduct(null);

  const handleSaveProduct = async (payload) => {
    if (!editingProduct) return;
    try {
      const response = await ProductsAPI.update(editingProduct.id, payload);
      const mapped = mapProductFromApi(response);
      setAllProducts((prev) =>
        prev.map((product) => (product.id === mapped.id ? mapped : product))
      );
      toast.success("Producto actualizado correctamente");
      closeEditor();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleDeleteProduct = async (productToDelete) => {
    if (!productToDelete) return;
    try {
      await ProductsAPI.delete(productToDelete.id);
      setAllProducts((prev) => prev.filter((product) => product.id !== productToDelete.id));
      toast.success("Producto eliminado");
      closeEditor();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el producto");
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Cargando productos...</div>;
  }

  if (error) {
    return (
      <div className="py-16 text-center text-red-500">
        Error al cargar los productos. Intenta nuevamente.
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">
          Administración
        </h1>
        <p className="mb-8 text-gray-600">
          Mostrando {filteredProducts.length} de {allProducts.length} productos.
        </p>

        <div className="flex flex-col gap-8 md:flex-row lg:gap-12">
          <aside className="w-full flex-shrink-0 md:w-64 lg:w-72">
            <div className="sticky top-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-6 border-t pt-6">
                <div>
                  <h3 className="mb-2 font-semibold">Categoría</h3>
                  <div className="space-y-1">
                    {availableOptions.categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryChange(category)}
                        className={`block w-full rounded px-2 py-1 text-left ${
                          filters.category === category ? "bg-blue-100 font-semibold" : ""
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Disponibilidad</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={handleStockChange}
                      className="rounded"
                    />
                    En stock
                  </label>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Precio</h3>
                  <input
                    type="range"
                    min={0}
                    max={priceCeiling || 0}
                    value={filters.maxPrice || 0}
                    onChange={handlePriceChange}
                    className="w-full"
                    disabled={!priceCeiling}
                  />
                  <div className="text-center text-sm text-gray-600">
                    Hasta ${Number(filters.maxPrice || 0).toFixed(2)}
                  </div>
                </div>

                {availableOptions.sizes.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">Talle</h3>
                    <div className="space-y-1">
                      {availableOptions.sizes.map((size) => (
                        <label key={size} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.sizes.includes(size)}
                            onChange={() => handleCheckboxChange("sizes", size)}
                            className="rounded"
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {availableOptions.colors.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">Color</h3>
                    <div className="space-y-1">
                      {availableOptions.colors.map((color) => (
                        <label key={color} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.colors.includes(color)}
                            onChange={() => handleCheckboxChange("colors", color)}
                            className="rounded"
                          />
                          {color}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="admin"
                    onEdit={() => openEditor(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <h3 className="text-xl font-semibold">No se encontraron productos</h3>
                <p className="mt-2 text-gray-600">Ajusta los filtros para ver otros resultados.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <ProductEditModal
        product={editingProduct}
        colorsCatalog={colorsCatalog}
        sizesCatalog={sizesCatalog}
        onClose={closeEditor}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </>
  );
};

export default Admin;
