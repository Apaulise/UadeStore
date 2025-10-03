import heroShirt from "../assets/hero-shirt.png";

const Home = () => {
  return (
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
            Hace tu compra del merch de la Universidad y retiralo por nuestra sede en Buenos Aires.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
