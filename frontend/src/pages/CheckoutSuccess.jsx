import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePendingOrder } from '../context/PendingOrderContext';

const accentColor = '#1F3B67';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  minimumFractionDigits: 2,
});

// Utilidad compartida: calcular fecha hábil a N días
const getBusinessDateFromNow = (businessDays = 3) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  let remaining = businessDays;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { clearLastOrder } = usePendingOrder();

  // ¡AQUÍ LEEMOS LOS DATOS!
  // 1. Intenta leer la orden desde sessionStorage
  const orderString = sessionStorage.getItem('lastOrder');
  
  // 2. Convierte el string de vuelta a un objeto
  const orderData = orderString ? JSON.parse(orderString) : null;

  // 3. Usa los datos leídos o el fallback
  const order = orderData ?? {
    pickupDate: getBusinessDateFromNow(3),
    items: [],
    total: 0,
  };

  const handleBack = () => {
    // ¡LIMPIEZA CRUCIAL!
    // 1. Limpia el estado del contexto
    clearLastOrder();
    // 2. Limpia el sessionStorage para que esto no se vuelva a mostrar
    sessionStorage.removeItem('lastOrder'); 
    
    navigate('/catalogo');
  };
  return (
    <div className="bg-brand-cream min-h-[70vh] text-brand-text">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 lg:flex-row lg:items-start lg:gap-12">
        <section className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mis Compras</h1>
              <p className="mt-6 text-3xl font-extrabold" style={{ color: accentColor }}>
                ¡Compra realizada con éxito!
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-semibold text-brand-blue transition hover:text-brand-blue/80"
            >
              <span aria-hidden="true">←</span>
              Volver
            </button>
          </div>

          <div className="mt-12 border-r border-black/10 pr-0 lg:pr-10">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                Fecha de Entrega
              </h2>
              <p className="text-sm text-brand-text/80">
                El pedido estará listo el{' '}
                <span className="font-semibold">{order.pickupDate ?? getBusinessDateFromNow(3)}</span>
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-dashed border-brand-blue/40 bg-white p-6 text-sm text-brand-text/70">
              Guardamos la confirmación en tu perfil. Recibirás las próximas actualizaciones vía email.
            </div>
          </div>
        </section>

        <aside className="w-full max-w-xl space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">Resumen</h2>

          {order.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-blue/40 bg-[#F6F7FB] p-6 text-center text-sm text-brand-text/70">
              Sin productos registrados. Continuá comprando desde el catálogo.
            </div>
          ) : (
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={`${item.id}-${item.size ?? 'unique'}-${item.color ?? 'color'}`}
                  className="flex items-center justify-between gap-4 border-b border-black/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#EFE7DE]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-brand-text/60">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{item.name}</p>
                      <p className="text-xs text-brand-text/70">{item.color ?? 'Color: N/A'}</p>
                      <p className="text-xs text-brand-text/70">
                        Cantidad: {item.quantity}
                        {item.size ? ` · Talle: ${item.size}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-brand-text">
                    {currencyFormatter.format((Number(item.price) || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-base font-semibold text-brand-text">
            <span>Total:</span>
            <span>{currencyFormatter.format(order.total ?? 0)}</span>
          </div>

          <div className="pt-4">
            <Link
              to="/catalogo"
              className="block rounded-full border border-brand-blue px-5 py-2 text-center text-sm font-semibold text-brand-blue transition hover:bg-brand-blue/10"
            >
              Ir al catálogo
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
