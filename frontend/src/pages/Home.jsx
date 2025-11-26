// src/pages/Home.jsx
import heroShirt from "../assets/RemeraInicio.png";
import libroUADE from "../assets/LibreUADE.png";
import termoUADE from "../assets/TermoUADE.png";
import remeraUadeImg from "../assets/remerauade.jpg";
import buzoUadeImg from "../assets/buzouade.jpg";
import bolsaUADE from "../assets/BolsaUADE.png";
import tiendaInteriorImg from "../assets/TIENDAINTERIORUADE.png";
import tiendaExteriorImg from "../assets/TIENDAEXTERIORUADE.png";
import { Link } from "react-router-dom";
import { categoryToSlug } from "../data/products";

// Alias para categor�as
const basicosImg = remeraUadeImg;
const bestsellersImg = buzoUadeImg;
const accesoriosImg = termoUADE;
const libreriaImg = libroUADE;

const categories = [
  { name: "NUESTROS BASICOS", image: basicosImg, slug: "nuestros-basicos" },
  { name: "BESTSELLERS", image: bestsellersImg, slug: "bestsellers" },
  { name: "ACCESORIO", image: accesoriosImg, slug: "accesorios" },
  { name: "LIBRERIA", image: libreriaImg, slug: "libreria" },
];

const Home = () => {
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
                to={`/catalogo?categoria=${category.slug}` }
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

          {/* Nuevo lanzamiento */}
          <section className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2">
            <div className="flex flex-col justify-center rounded-xl bg-white p-8 text-center shadow-lg lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900">Nuevo Lanzamiento</h2>
              <p className="mt-4 text-gray-600">
                En UADE, sabemos que tus metas son grandes. Por eso, creamos un accesorio a la altura de tus desafíos. Presentamos el bolso que no solo transporta tus libros y tu notebook, sino también tus ideas, proyectos y el orgullo de pertenecer a una gran universidad.              </p>
            <div className="mt-6 flex justify-center">
                <Link
                  to="/catalogo"
                  className="rounded-full bg-gray-200 px-8 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
                >
                  Comprar Ahora
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-md">
              <img
                src={bolsaUADE}
                alt="Bolsa UADE"
                className="w-[80%] object-contain"
                loading="lazy"
                decoding="async"
              />
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





