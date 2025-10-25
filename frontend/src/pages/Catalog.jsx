import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/layout/ProductCard";
import { ProductsAPI } from "../services/api";
import { resolveCategory, categoryToSlug } from "../data/products";

const ensureHex = (value) => {
  if (!value) return null;
  const sanitized = value.toString().trim();
  return sanitized.startsWith("#") ? sanitized : `#${sanitized}`;
};

const normalizeProduct = (product) => {
  const variants = (product.Stock ?? []).map((stock) => ({
    stockId: stock.id,
    size: stock.talle,
    available: (stock.stock ?? 0) > 0,
    availableUnits: stock.stock ?? 0,
    colorId: stock.Color?.id ?? null,
    colorName: stock.Color?.nombre ?? null,
    colorHex: ensureHex(stock.Color?.hexa ?? stock.Color?.hex ?? null),
  }));

  const firstImage = product.Imagen?.[0]?.imagen ?? null;
  const category = resolveCategory(product.categoria);

  const defaultVariant = variants.find((variant) => variant.available) ?? variants[0] ?? null;

  return {
    id: product.id,
    name: product.Titulo,
    price: Number(product.precio ?? 0),
    description: product.descripcion ?? "",
    category,
    image: firstImage,
    variants,
    defaultVariant,
    hasStock: variants.some((variant) => variant.available),
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

const Catalog = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [priceCeiling, setPriceCeiling] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await ProductsAPI.list();
        const normalized = data.map(normalizeProduct);
        setAllProducts(normalized);
        const maxPrice = normalized.reduce(
          (max, product) => Math.max(max, Number(product.price) || 0),
          0,
        );
        setPriceCeiling(maxPrice || 0);
        setFilters((prev) => ({ ...prev, maxPrice: maxPrice || 0 }));
        setError(null);
      } catch (err) {
        console.error("Error al cargar productos", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const categoryParam = searchParams.get("categoria");
    const normalizedCategory = resolveCategory(categoryParam);

    setFilters((prev) => ({
      ...prev,
      query: q,
      category: normalizedCategory,
      colors: prev.category === normalizedCategory ? prev.colors : [],
      sizes: prev.category === normalizedCategory ? prev.sizes : [],
    }));
  }, [searchParams]);

  useEffect(() => {
    let products = [...allProducts];

    if (filters.category) {
      products = products.filter((product) => product.category === filters.category);
    }

    if (filters.sizes.length > 0) {
      products = products.filter((product) =>
        product.variants.some(
          (variant) => variant.size && filters.sizes.includes(variant.size),
        ),
      );
    }

    if (filters.colors.length > 0) {
      products = products.filter((product) =>
        product.variants.some(
          (variant) => variant.colorName && filters.colors.includes(variant.colorName),
        ),
      );
    }

    if (filters.inStockOnly) {
      products = products.filter((product) => product.hasStock);
    }

    products = products.filter(
      (product) => Number(product.price) <= Number(filters.maxPrice ?? priceCeiling),
    );

    if (filters.query && filters.query.trim()) {
      const term = filters.query.trim().toLowerCase();
      // Primero filtra por coincidencia en cualquier campo
      products = products.filter((product) => {
        const combined = [
          product.name,
          product.category,
          product.description,
          ...(product.variants ?? []).map((variant) => variant.colorName ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return combined.includes(term);
      });

      // Luego ordena priorizando: nombre empieza con el término > palabra del nombre empieza con término > resto
      products = products
        .map((p) => {
          const name = (p.name || "").toLowerCase();
          const words = name.split(/\s+/).filter(Boolean);
          const starts = name.startsWith(term);
          const wordStarts = !starts && words.some((w) => w.startsWith(term));
          const nameIncludes = !starts && !wordStarts && name.includes(term);
          let rank = 3;
          if (starts) rank = 0;
          else if (wordStarts) rank = 1;
          else if (nameIncludes) rank = 2;
          return { p, rank };
        })
        .sort((a, b) => (a.rank - b.rank) || a.p.name.localeCompare(b.p.name))
        .map((entry) => entry.p);
    }

    setFilteredProducts(products);
  }, [filters, allProducts]);

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
      new Set(allProducts.map((product) => product.category).filter(Boolean)),
    ).sort();

    return {
      sizes: Array.from(sizeSet).sort(),
      colors: Array.from(colorSet).sort(),
      categories,
    };
  }, [allProducts, filters.category]);

  const handleCategoryChange = (categoryLabel) => {
    const nextCategory = filters.category === categoryLabel ? null : categoryLabel;
    setFilters((prev) => ({
      ...prev,
      category: nextCategory,
      colors: [],
      sizes: [],
    }));

    const params = new URLSearchParams(searchParams);
    if (!nextCategory) {
      params.delete("categoria");
    } else {
      params.set("categoria", categoryToSlug(nextCategory));
    }
    setSearchParams(params);
  };

  const handleCheckboxChange = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      const exists = currentValues.includes(value);
      const nextValues = exists
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: nextValues };
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
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">Catalogo</h1>
      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-800">
          Ocurrió un error al cargar los productos. Intenta nuevamente.
        </p>
      )}
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
                <h3 className="mb-2 font-semibold">Categoria</h3>
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
                  En Stock
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
                          value={size}
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
                          value={color}
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
          {loading ? (
            <div className="py-16 text-center text-gray-600">Cargando productos...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="catalog" />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h3 className="text-xl font-semibold">No se encontraron productos</h3>
              <p className="mt-2 text-gray-600">
                Intenta ajustar tus filtros o limpiarlos para ver más resultados.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
