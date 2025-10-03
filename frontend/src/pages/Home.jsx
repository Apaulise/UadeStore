// src/pages/Home.jsx

import heroShirt from "../assets/hero-shirt.png";
// --- PASO 1: Importá las nuevas imágenes que guardaste en /assets ---
import basicosImg from "../assets/basicos.png"; // Reemplazá con tu imagen
import bestsellersImg from "../assets/bestsellers.png"; // Reemplazá con tu imagen
import accesoriosImg from "../assets/accesorios.png"; // Reemplazá con tu imagen
import libreriaImg from "../assets/libreria.png"; // Reemplazá con tu imagen
import nuevoLanzamientoImg from "../assets/nuevo-lanzamiento.png"; // Reemplazá con tu imagen

// Datos para las tarjetas de categorías. Así es más fácil de mantener.
const categories = [
  { name: "Nuestros Básicos", image: basicosImg, href: "#" },
  { name: "Bestsellers", image: bestsellersImg, href: "#" },
  { name: "Accesorios", image: accesoriosImg, href: "#" },
  { name: "Librería", image: libreriaImg, href: "#" },
];

const Home = () => {
  return (
    // Usamos un Fragment (<>) para poder tener múltiples secciones al mismo nivel
    <>
      {/* SECCIÓN HERO (la que ya tenías) */}
      <section className="bg-[linear-gradient(180deg,#EFE7DE_0%,#1F3B67_100%)]">
        <div className="max-w-container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
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

      {/* --- INICIO DE LA NUEVA SECCIÓN --- */}
      <main className="bg-[#EFE7DE] px-4 py-12">
        <div className="max-w-container mx-auto">
          {/* Grilla de Categorías */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category, index) => (
              <a
                key={category.name}
                href={category.href}
                className={`flex flex-col items-center gap-3 rounded-xl border bg-white p-4 text-center shadow-sm transition hover:shadow-md ${
                  // Esto aplica el borde azul solo al último item ("Librería")
                  index === 3 ? "border-blue-500 ring-2 ring-blue-500" : "border-transparent"
                }`}
              >
                <img
                  src={category.image}
                  alt={`Categoría ${category.name}`}
                  className="h-28 w-28 object-contain"
                />
                <span className="text-sm font-semibold text-gray-800">
                  {category.name}
                </span>
              </a>
            ))}
          </div>

          {/* Banner de Nuevo Lanzamiento */}
          <section className="mt-12 overflow-hidden rounded-xl bg-white shadow-lg md:mt-16">
            <div className="grid md:grid-cols-2">
              {/* Contenido de texto */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
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
                <div className="mt-6">
                  <button
                    type="button"
                    className="rounded-full bg-gray-200 px-8 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
                  >
                    Comprar Ahora
                  </button>
                </div>
              </div>

              {/* Imagen del banner (simulando carrusel) */}
              <div className="relative min-h-[300px]">
                <img
                  src={nuevoLanzamientoImg}
                  alt="Bolso de UADE en la pista de un aeropuerto"
                  className="h-full w-full object-cover"
                />
                {/* Flechas para el carrusel (estáticas por ahora) */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 backdrop-blur-sm transition hover:bg-white">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 backdrop-blur-sm transition hover:bg-white">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                </button>
              </div>

            </div>
          </section>
        </div>
      </main>
      {/* --- FIN DE LA NUEVA SECCIÓN --- */}
    </>
  );
};

export default Home;