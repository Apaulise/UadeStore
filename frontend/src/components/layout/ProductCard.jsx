// src/components/layout/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

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

const ProductCard = ({ product, variant = 'catalog' }) => {
  console.log("1. ¿Qué llega en la prop 'product'?", product);
  const { addItem } = useCart();

  if (!product) return null;

  const allColorObjects = product.Stock.map(stockid => stockid.Color);
  console.log("2. ¿Qué se extrae en 'allColorObjects'?", allColorObjects);

    // 2. Creamos una lista de colores únicos usando un Map por el ID del color
    const uniqueColorsMap = new Map();
    allColorObjects.forEach(color => {
      if (color) { // Asegurarnos que el color no es nulo
        uniqueColorsMap.set(color.id, color);
      }
    });
    const uniqueColors = Array.from(uniqueColorsMap.values());
    console.log("3. ¿Qué queda en 'uniqueColors'?", uniqueColors);
    const handleAdd = () => {
      addItem({
        id: product.id,
        name: product.Titulo,
        price: product.precio || 0,
        image: product.image,
        quantity: 1,
      });
    };
    const imageUrl = product.Imagen?.[0]?.url;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-[#E2DCD4] p-4 shadow-sm">
      {variant === 'admin' && (
        <button className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100">
          <EditIcon />
        </button>
      )}

      <Link
        to={`/producto/${product.id}`}
        className="flex flex-1 flex-col items-center gap-3 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-md bg-gray-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.Titulo}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-brand-text">
            {product.Titulo}
          </h3>
          <p className="text-xl font-bold text-brand-text">
            ${Number(product.precio).toFixed(2)}
          </p>
          <div className="flex items-center gap-x-2">
              {uniqueColors.map((color) => (
                <div
                  key={color.id}
                  className="h-4 w-4 rounded-full border border-black/10"
                  // 👇 CAMBIO CLAVE: Agregamos el '#' al principio del color
                  style={{ backgroundColor: `#${color.hexa}` }}
                  title={color.nombre}
                />
              ))}
            </div>
          </div>
      </Link>

      {variant === 'catalog' && (
        <div className="absolute bottom-0 left-0 w-full translate-y-full transform bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAdd}
            className="w-full rounded-lg bg-brand-blue py-2 font-semibold text-white transition hover:brightness-110"
          >
            Agregar al carrito
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
