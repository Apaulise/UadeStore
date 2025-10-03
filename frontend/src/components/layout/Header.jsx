import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/admin", label: "Administración" },
];

const linkBaseClasses =
  "rounded-full px-4 py-2 text-sm font-medium text-brand-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const getLinkClasses = ({ isActive }) =>
  [
    linkBaseClasses,
    isActive ? "bg-black text-white" : "hover:bg-black/5",
  ].join(" ");

const HeaderNavLinks = ({ orientation = "horizontal" }) => (
  <div
    className={
      orientation === "horizontal"
        ? "flex items-center gap-2"
        : "flex flex-col gap-2"
    }
  >
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} className={getLinkClasses}>
        {item.label}
      </NavLink>
    ))}
  </div>
);

const SearchIcon = (props) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m20 20-4.35-4.35m1.1-3.73a5.85 5.85 0 1 1-11.7 0 5.85 5.85 0 0 1 11.7 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BagIcon = (props) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 9V7.5a5 5 0 0 1 10 0V9m-9.5 12h9a1.5 1.5 0 0 0 1.48-1.28l1.17-8A1.5 1.5 0 0 0 17.67 10H6.33a1.5 1.5 0 0 0-1.48 1.72l1.17 8A1.5 1.5 0 0 0 7.5 21Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleNav = () => setIsNavOpen((open) => !open);
  const toggleSearch = () => setIsSearchOpen((open) => !open);

  return (
    <header className="bg-brand-cream text-brand-text">
      <div className="max-w-container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 lg:justify-normal lg:gap-8">
          <div className="min-w-0">
            <Link to="/" className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight">STØRE</span>
              <span className="text-xs font-semibold tracking-[0.35em] text-brand-text/70">
                MERCH
              </span>
            </Link>
          </div>

          <nav
            aria-label="Principal"
            className="hidden flex-1 justify-center lg:flex"
          >
            <HeaderNavLinks orientation="horizontal" />
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <form className="relative" role="search">
              <label className="sr-only" htmlFor="desktop-search">
                Buscar productos
              </label>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text/60" />
              <input
                id="desktop-search"
                type="search"
                placeholder="Buscar"
                className="w-56 rounded-full border border-black/10 bg-white py-2 pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-text/50 focus:outline-none focus:ring-2 focus:ring-black/30"
                // TODO: Conectar con la búsqueda real del módulo CORE
              />
            </form>
            <button
              type="button"
              className="rounded-full p-2 text-brand-text transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              aria-label="Ver bolsa de compras"
            >
              <BagIcon className="h-5 w-5" />
            </button>
            {/* TODO: Integrar el nombre real del usuario desde el CORE */}
            <span className="text-sm font-semibold">Camila</span>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleSearch}
              aria-label="Abrir buscador"
              aria-expanded={isSearchOpen}
              aria-controls="mobile-search"
              className="rounded-full p-2 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-full p-2 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              aria-label="Ver bolsa de compras"
            >
              <BagIcon className="h-5 w-5" />
            </button>
            {/* TODO: Integrar el nombre real del usuario desde el CORE */}
            <span className="text-sm font-semibold">Camila</span>
            <button
              type="button"
              onClick={toggleNav}
              aria-label="Abrir menú principal"
              aria-expanded={isNavOpen}
              aria-controls="primary-navigation"
              className="rounded-full p-2 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <span className="sr-only">Menú</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <form
            id="mobile-search"
            role="search"
            className="mt-3 flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-brand-text shadow-sm lg:hidden"
          >
            <label className="sr-only" htmlFor="mobile-search-input">
              Buscar productos
            </label>
            <SearchIcon className="h-5 w-5 text-brand-text/60" />
            <input
              id="mobile-search-input"
              type="search"
              placeholder="Buscar"
              className="w-full border-none bg-transparent text-sm focus:outline-none"
              // TODO: Conectar con la búsqueda real del módulo CORE
            />
          </form>
        )}

        <nav
          id="primary-navigation"
          aria-label="Principal"
          className={`lg:hidden ${
            isNavOpen
              ? "mt-3 flex flex-col gap-2 border-t border-black/10 pt-3"
              : "hidden"
          }`}
        >
          <HeaderNavLinks orientation="vertical" />
        </nav>
      </div>
    </header>
  );
};

export default Header;
