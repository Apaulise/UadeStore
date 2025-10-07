// src/pages/Home.jsx

import heroShirt from "../assets/hero-shirt.png";
import basicosImg from "../assets/basicos.png";
import bestsellersImg from "../assets/bestsellers.png";
import accesoriosImg from "../assets/accesorios.png";
import libreriaImg from "../assets/libreria.png";
import nuevoLanzamientoImg from "../assets/nuevo-lanzamiento.png";

// --- NUEVAS IMPORTACIONES DE IMÁGENES ---
import tiendaInteriorImg from "../assets/nuevo-lanzamiento.png"; // Reemplaza con tu imagen
import tiendaExteriorImg from "../assets/nuevo-lanzamiento.png"; // Reemplaza con tu imagen
import { Link } from 'react-router-dom';

const categories = [
  { name: "Nuestros Básicos", image: basicosImg, href: "#" },
  { name: "Bestsellers", image: bestsellersImg, href: "#" },
  { name: "Accesorios", image: accesoriosImg, href: "#" },
  { name: "Librería", image: libreriaImg, href: "#" },
];

const Home = () => {
  return (
    <>
      {/* SECCIÓN HERO (EXISTENTE) */}
      <section className="bg-[linear-gradient(180deg,#EFE7DE_0%,#1F3B67_100%)]">
        <div className="max-w-container mx-auto grid gap-12 px-8 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="flex flex-col items-center">
            <img
              src={heroShirt}
              alt="Remera con el logo de la universidad"
              className="max-h-[28rem] w-full max-w-xl object-contain"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="-mt-4 h-10 w-64 rounded-full bg-black/20 blur-md"
            />
          </div>
          <div className="text-white">
            <h1 className="text-5xl font-extrabold drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] md:text-6xl lg:text-7xl">
              <span className="block">Tu espíritu Universitario,</span>
              <span className="block">a un click.</span>
            </h1>
            <div className="my-6 h-px w-2/3 bg-white/40" aria-hidden="true" />
            <p className="text-xl font-semibold">Más que libros y merch</p>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/90">
              Hace tu compra del merch de la Universidad y retiralo por nuestra
              sede en Buenos Aires.
            </p>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN PRINCIPAL DE CONTENIDO (EXISTENTE) --- */}
      <main className="bg-[#EFE7DE] px-45 py-12">
        <div className="max-w-container mx-auto">
          {/* Grilla de Categorías (EXISTENTE) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/catalogo?categoria=${encodeURIComponent(category.name)}`}
                href={category.href}
                className={`flex flex-col items-center border-transparent gap-3 rounded-xl bg-white p-4 text-center shadow-sm transition hover:shadow-md`}
              >
                <img
                  src={category.image}
                  alt={`Categoría ${category.name}`}
                  className="h-28 w-28 object-contain"
                />
                <span className="text-sm font-semibold text-gray-800">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Banner de Nuevo Lanzamiento (EXISTENTE) */}
          <section className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2">
            <div className="flex flex-col justify-center rounded-xl bg-white p-8 text-center shadow-lg lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Nuevo Lanzamiento
              </h2>
              <p className="mt-4 text-gray-600">
                En UADE, sabemos que tus metas son grandes. Por eso, creamos
                un accesorio a la altura de tus desafíos. Presentamos el
                bolso que no solo transporta tus libros y tu notebook, sino
                también tus ideas, proyectos y el orgullo de pertenecer a una
                gran universidad.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="rounded-full bg-gray-200 px-8 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
                >
                  Comprar Ahora
                </button>
              </div>
            </div>

            <div className="relative min-h-[300px] overflow-hidden rounded-xl bg-white shadow-lg">
              <img
                src={nuevoLanzamientoImg}
                alt="Bolso de UADE en la pista de un aeropuerto"
                className="h-full w-full object-cover"
              />
              <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 backdrop-blur-sm transition hover:bg-white">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 backdrop-blur-sm transition hover:bg-white">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </section>
        </div>
      </main>
      <section className="px-45 py-20 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2">
            {/* Columna Izquierda: Imagen grande de la tienda interior */}
            <div className="overflow-hidden rounded-xl bg-white shadow-lg">
              <img
                src={tiendaInteriorImg}
                alt="Interior de la tienda UADE Store"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Columna Derecha: Texto arriba, Imagen pequeña abajo */}
            <div className="flex flex-col gap-8"> {/* Usamos flex-col y gap para separar verticalmente */}
              {/* Parte superior: Texto */}
              <div className="flex flex-1 flex-col justify-center rounded-xl p-8 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  VISITA NUESTRA NUEVA
                  <span className="block text-5xl font-extrabold text-[#1F3B67] sm:text-6xl">
                    ¡TIENDA!
                  </span>
                </h2>
                <p className="mt-4 text-base text-gray-700">
                  Encontrala en la sede Montserrat, Campus
                  <span className="block font-semibold">Buenos Aires</span>
                </p>
              </div>

              {/* Parte inferior: Imagen de la fachada de la tienda */}
              <div className="flex-1 overflow-hidden rounded-xl bg-white shadow-lg"> {/* flex-1 para que ocupe el espacio restante */}
                <img
                  src={tiendaExteriorImg}
                  alt="Fachada exterior de la tienda UADE Store"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </section>
    </>
  );
};

export default Home;