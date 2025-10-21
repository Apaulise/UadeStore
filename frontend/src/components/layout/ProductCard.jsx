import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCart } from "../../context/CartContext";

const EditIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const ensureHex = (value) => {
  if (!value) return "#1F3B67";
  return value.startsWith("#") ? value : `#${value}`;
};

const ProductCard = ({ product, variant = "catalog", onEdit }) => {
  const { addItem } = useCart();

  if (!product) return null;

  const defaultVariant = useMemo(() => {
    if (product.defaultVariant) return product.defaultVariant;
    const variants = product.variants ?? [];
    return variants.find((item) => item.available) ?? variants[0] ?? null;
  }, [product]);

  const handleQuickAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!defaultVariant?.stockId) {
      toast.error("No hay stock disponible para este producto");
      return;
    }

    try {
      await addItem({ stockId: defaultVariant.stockId, quantity: 1 });
      toast.success("Producto agregado al carrito");
    } catch (err) {
      toast.error("No se pudo agregar al carrito");
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-[#E2DCD4] p-4 shadow-sm">
      {variant === "admin" && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit?.(product);
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100"
        >
          <EditIcon />
        </button>
      )}

      <Link
        to={`/producto/${product.id}`}
        className="flex flex-1 flex-col items-center gap-3 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-md bg-gray-200">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-600">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-brand-text">{product.name}</h3>
          <p className="text-xl font-bold text-brand-text">
            ${Number(product.price ?? 0).toFixed(2)}
          </p>
          {defaultVariant?.colorName && (
            <div className="flex items-center gap-2 text-xs text-brand-text/70">
              <span
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: ensureHex(defaultVariant.colorHex) }}
                title={defaultVariant.colorName}
              />
              <span>{defaultVariant.colorName}</span>
            </div>
          )}
        </div>
      </Link>

      {variant === "catalog" && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleQuickAdd}
            disabled={!defaultVariant?.available}
            className="w-full rounded-lg bg-brand-blue py-2 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-blue/40"
          >
            Agregar al carrito
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
