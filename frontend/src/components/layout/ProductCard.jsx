// src/components/ProductCard.jsx

import React from 'react';

const EditIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const ProductCard = ({ product, variant = 'catalog' }) => { // Le agregué el valor por defecto
  return (
    // 👇 CAMBIO #1: Agregamos 'group' y 'relative'
    <div className="group relative bg-[#E2DCD4] rounded-lg p-4 shadow-sm flex flex-col h-full overflow-hidden">
    
      {/* --- Icono de Editar (Solo para Admin) --- */}
      {/* Esto ahora funcionará bien gracias al 'relative' del padre */}
      {variant === 'admin' && (
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10">
          <EditIcon />
        </button>
      )}

      {/* imagen */}
      <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
      
      {/* Contenido que no cambia */}
      <div className="flex flex-col items-center">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-xl font-bold">${product.price}</p>
        <div className="h-4 w-4 rounded-full bg-black border"></div>
      </div>
      
      {/* --- Botón "Agregar al carrito" (Solo para Catálogo con Hover Effect) --- */}
      {variant === 'catalog' && (
        // 👇 CAMBIO #2: Agregamos la lógica de hover a este div también
        <div 
          className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent
                     opacity-0 transform translate-y-full 
                     transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
        >
          <button 
            className="w-full bg-brand-blue text-white py-2 rounded-lg"
          >
            Agregar al carrito
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;