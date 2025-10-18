import { Link, useMatches } from "react-router-dom";

const Breadcrumbs = () => {
  const matches = useMatches();

  const crumbs = matches.flatMap((match) => {
    if (!match.handle || !match.handle.crumb) return [];
    const value =
      typeof match.handle.crumb === "function"
        ? match.handle.crumb(match)
        : match.handle.crumb;
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  });

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="bg-white py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 text-sm text-brand-text/60 sm:px-6 lg:px-8">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={`${crumb.to ?? "crumb"}-${index}`} className="flex items-center gap-1">
              {isLast ? (
                <span className="font-semibold text-brand-text">{crumb.label}</span>
              ) : (
                <Link to={crumb.to ?? "/"} className="font-medium text-brand-blue hover:underline">
                  {crumb.label}
                </Link>
              )}
              {!isLast && <span className="text-brand-text/30">/</span>}
            </span>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
