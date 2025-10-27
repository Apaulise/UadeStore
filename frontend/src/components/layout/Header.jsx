import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import logoUade from "../../assets/logouadeNegro.png";
import { useCart } from "../../context/CartContext";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catalogo" },
  { to: "/admin", label: "Administracion" },
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
  const { toggle, items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();
  const [query, setQuery] = useState("");

  const toggleNav = () => setIsNavOpen((open) => !open);
  const toggleSearch = () => setIsSearchOpen((open) => !open);

  // Mantiene el input sincronizado con la URL
  useEffect(() => {
    const q = sp.get("q") || "";
    setQuery(q);
  }, [location.search, sp]);

  // Búsqueda en vivo: navega/actualiza resultados mientras se escribe
  useEffect(() => {
    // --- INICIO DE LA CORRECIÓN ---
    // 1. Determina si estamos en una página "buscable"
    const isAdminPath = location.pathname.startsWith("/admin");
    const isCatalogPath = location.pathname.startsWith("/catalogo");

    // 2. GUARD CLAUSE: Si no estamos en admin o catalogo, no hacemos nada.
    // Esto evita que la búsqueda "en vivo" nos saque de /item/123 o /
    if (!isAdminPath && !isCatalogPath) {
      return; 
    }
    // --- FIN DE LA CORRECIÓN ---

    const id = setTimeout(() => {
      const q = (query || "").trim();

      const basePath = isAdminPath ? "/admin" : "/catalogo";
      // Si no hay término de búsqueda y la URL ya tiene filtros (p.ej., categoria),
      // no sobrescribimos los parámetros existentes.
      if (!q && location.search && new URLSearchParams(location.search).has("categoria")) {
        return;
      }
      const params = new URLSearchParams(location.search);
      if (q) params.set("q", q); else params.delete("q");
      const targetSearch = params.toString() ? `?${params.toString()}` : "";
      const target = `${basePath}${targetSearch}`;

      if (location.pathname !== basePath || location.search !== targetSearch) {
        // Usar 'replace: true' es mejor para la búsqueda en vivo, no llena el historial
        navigate(target, { replace: true });
      }
    }, 250);
    return () => clearTimeout(id);
  }, [query, location.pathname, navigate, location.search]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const q = (query || "").trim();

    // Esta lógica está bien, al hacer "Enter" sí queremos navegar
    const isAdminPath = location.pathname.startsWith("/admin");
    const basePath = isAdminPath ? "/admin" : "/catalogo";
    const params = new URLSearchParams(location.search);
    if (q) params.set("q", q); else params.delete("q");
    const targetSearch = params.toString() ? `?${params.toString()}` : "";
    const target = `${basePath}${targetSearch}`;

    navigate(target);
    setIsSearchOpen(false);
  };

  return (
    <header className="bg-brand-cream text-brand-text">
      <div className="max-w-container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 lg:justify-normal lg:gap-8">
          <div className="min-w-0">
            <Link to="/" className="flex items-center" aria-label="Ir al inicio">
              <img
                src={logoUade}
                alt="UADE Store Merch"
                className="h-8 w-auto md:h-10"
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          <nav
            aria-label="Principal"
            className="hidden flex-1 justify-center lg:flex"
          >
            <HeaderNavLinks orientation="horizontal" />
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {location.pathname !== '/admin' && (
            <form className="relative" role="search" onSubmit={onSubmitSearch}>
              <label className="sr-only" htmlFor="desktop-search">
                Buscar productos
              </label>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text/60" />
              <input
                id="desktop-search"
                type="search"
                placeholder="Buscar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56 rounded-full border border-black/10 bg-white py-2 pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-text/50 focus:outline-none focus:ring-2 focus:ring-black/30"
              />
            </form>
            )}
            <button
              type="button"
              className="rounded-full p-2 text-brand-text transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              aria-label="Ver bolsa de compras"
              onClick={toggle}
            >
              <div className="relative">
                <BagIcon className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {items.length}
                  </span>
                )}
              </div>
            </button>
            <Link
              to="/mis-compras"
              className="text-sm font-semibold transition hover:text-brand-blue"
            >
              Camila
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {location.pathname !== '/admin' && (
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
            )}
            <button
              type="button"
              className="rounded-full p-2 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              aria-label="Ver bolsa de compras"
              onClick={toggle}
            >
              <div className="relative">
                <BagIcon className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {items.length}
                  </span>
                )}
              </div>
            </button>
            <Link
              to="/mis-compras"
              className="text-sm font-semibold transition hover:text-brand-blue"
            >
              Camila
            </Link>
            <button
              type="button"
              onClick={toggleNav}
              aria-label="Abrir menu principal"
              aria-expanded={isNavOpen}
              aria-controls="primary-navigation"
              className="rounded-full p-2 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <span className="sr-only">menu</span>
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

        {location.pathname !== '/admin' && isSearchOpen && (
          <form
            id="mobile-search"
            role="search"
            onSubmit={onSubmitSearch}
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-none bg-transparent text-sm focus:outline-none"
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
