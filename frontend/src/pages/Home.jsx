// src/pages/Home.jsx
import heroShirt from "../assets/hero-shirt.png";
import logouadeImg from "../assets/logouade.jpg";
import remeraUadeImg from "../assets/remerauade.jpg";
import buzoUadeImg from "../assets/buzouade.jpg";
import { useEffect, useRef, useState } from "react";
import tiendaInteriorImg from "../assets/interioruade.jpg";
import tiendaExteriorImg from "../assets/exterioruade.jpg";
import { Link } from "react-router-dom";

// Alias para categorías
const basicosImg = logouadeImg;
const bestsellersImg = logouadeImg;
const accesoriosImg = logouadeImg;
const libreriaImg = logouadeImg;

const categories = [
  { name: "Nuestros Básicos", image: basicosImg },
  { name: "Bestsellers", image: bestsellersImg },
  { name: "Accesorios", image: accesoriosImg },
  { name: "Librería", image: libreriaImg },
];

const Home = () => {
  const slides = [
    { src: remeraUadeImg, alt: "Remera UADE" },
    { src: buzoUadeImg, alt: "Buzo UADE" },
  ];

  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);

  const prev = () => setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1));

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;
    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  return (
    <>
      {/* HERO */}
      <section className="bg-[linear-gradient(180deg,#EFE7DE_0%,#1F3B67_100%)]">
        <div className="mx-auto grid max-w-container gap-12 px-8 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="flex flex-col items-center">
            <img
              src={heroShirt}
              alt="Remera con el logo de la universidad"
              className="max-h-[28rem] w-full max-w-xl object-contain"
              loading="lazy"
            />
            <div aria-hidden="true" className="-mt-4 h-10 w-64 rounded-full bg-black/20 blur-md" />
          </div>
          <div className="text-white">
            <h1 className="text-5xl font-extrabold drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] md:text-6xl lg:text-7xl">
              <span className="block">Tu espíritu Universitario,</span>
              <span className="block">a un click.</span>
            </h1>
            <div className="my-6 h-px w-2/3 bg-white/40" aria-hidden="true" />
            <p className="text-xl font-semibold">Más que libros y merch</p>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/90">
              Hace tu compra del merch de la Universidad y retiralo por nuestra sede en Buenos Aires.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <main className="bg-[#EFE7DE] px-45 py-12">
        <div className="mx-auto max-w-container">
          {/* Categorías */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/catalogo?categoria=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-3 rounded-xl bg-white p-4 text-center shadow-sm transition hover:shadow-md"
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

          {/* Nuevo lanzamiento + Carrusel */}
          <section className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2">
            <div className="flex flex-col justify-center rounded-xl bg-white p-8 text-center shadow-lg lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900">Nuevo Lanzamiento</h2>
              <p className="mt-4 text-gray-600">
                En UADE, sabemos que tus metas son grandes. Por eso, creamos un accesorio a la altura de tus desafíos…
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

            <div
              className="relative min-h-[300px] overflow-hidden rounded-xl bg-white shadow-lg"
              role="region"
              aria-roledescription="carousel"
              aria-label="Galería UADE"
              ref={carouselRef}
              tabIndex={0}
            >
              <img
                src={slides[current].src}
                alt={slides[current].alt}
                className="h-full w-full object-cover"
                role="group"
                aria-label={`Slide ${current + 1} de ${slides.length}`}
                loading={current === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <button
                type="button"
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 backdrop-blur-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 backdrop-blur-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-label={`Ir al slide ${i + 1}`}
                    aria-current={current === i}
                    className={`pointer-events-auto h-2 w-2 rounded-full transition ${current === i ? "bg-gray-900" : "bg-gray-400/60 hover:bg-gray-500/80"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-800`}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sección Tienda */}
      <section className="grid grid-cols-1 gap-8 px-45 py-20 md:mt-16 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <img src={tiendaInteriorImg} alt="Interior de la tienda UADE Store" className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-1 flex-col justify-center rounded-xl p-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              VISITA NUESTRA NUEVA
              <span className="block text-5xl font-extrabold text-[#1F3B67] sm:text-6xl">¡TIENDA!</span>
            </h2>
            <p className="mt-4 text-base text-gray-700">
              Encontrala en la sede Montserrat, Campus <span className="block font-semibold">Buenos Aires</span>
            </p>
          </div>

          <div className="flex-1 overflow-hidden rounded-xl bg-white shadow-lg">
            <img src={tiendaExteriorImg} alt="Fachada exterior de la tienda UADE Store" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
