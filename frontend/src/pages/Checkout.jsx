import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { usePendingOrder } from '../context/PendingOrderContext';
import { OrdersAPI } from '../services/api';

const accentColor = '#1F3B67';
const pickupDate = '01/07/2025';
const availableBalance = 700;

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { setLastOrder } = usePendingOrder();
  const [email, setEmail] = useState('');
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const orderPreview = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: Number(item.price) || 0,
        image: item.image,
      })),
    [items],
  );

  const formattedTotal = currencyFormatter.format(total);
  const formattedBalance = currencyFormatter.format(availableBalance);

  const handleContinueShopping = () => {
    navigate('/catalogo');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handlePay = async () => {
    if (isProcessing) return;
    setIsProcessing(true);


    const userIdPlaceholder = 1; 

    const orderPayload =  {
      userId: userIdPlaceholder, 
      items: items.map(item => ({ 
          stockId: item.stockId, 
          quantity: item.quantity,
          price: item.price,
      })),
      total: total,
    };

    console.info('Enviando orden a la APIIIII:', orderPayload);

    try {
        const response = await OrdersAPI.create(orderPayload);
        const orderData = response.data; // Ya sabemos que esto funciona

        // 1. Guarda la orden en el contexto (no hace daño)
        setLastOrder(orderData); 

        // 2. ¡LA SOLUCIÓN! Guarda la orden en el Session Storage
        // Lo guardamos como string, por eso usamos JSON.stringify
        sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

        // 3. Limpia el carrito
        await clear(); 
        
        toast.success('Compra realizada con éxito');

        // 4. Navega (ya no necesitas pasar el state aquí)
        navigate('/checkout/exito', { replace: true });
     } catch (err) {
        console.error("Error al crear la orden:", err);
        toast.error(err.response?.data?.message || 'Error al procesar el pago');
      } finally {
        setIsProcessing(false);
      }
  };

  return (
    <div className="bg-white text-brand-text">
      <div className="border-t-4" style={{ borderColor: accentColor }} />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 lg:flex-row lg:items-start lg:gap-12">
        <section className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Carrito de Compras</h1>
            </div>
            <button
              type="button"
              onClick={handleContinueShopping}
              className="flex items-center gap-2 text-sm font-semibold text-brand-blue transition hover:text-brand-blue/80"
            >
              <span aria-hidden="true">←</span>
              Seguir Comprando
            </button>
          </div>

          <div className="mt-8 space-y-8 border-r border-black/10 pr-0 lg:pr-10">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                Contacto
              </h2>
              <label className="block text-sm font-medium text-brand-text/80" htmlFor="checkout-email">
                Email
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@uade.edu.ar"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-2 text-sm shadow-sm transition focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <label className="flex items-center gap-2 text-sm text-brand-text/80">
                <input
                  type="checkbox"
                  checked={notifyOffers}
                  onChange={(event) => setNotifyOffers(event.target.checked)}
                  className="h-4 w-4 rounded border border-black/20 text-brand-blue focus:ring-brand-blue"
                />
                Notificarme con nuevas ofertas
              </label>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                Entrega
              </h2>
              <p className="text-sm text-brand-text/80">
                El pedido estará listo el <span className="font-semibold">{pickupDate}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                Pago
              </h2>
              <p className="text-sm text-brand-text/80">
                Todas las transacciones se realizan con la billetera virtual de la institución.
              </p>
              <p className="text-sm font-semibold text-brand-text">Saldo disponible: {formattedBalance}</p>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing || orderPreview.length === 0}
                className="w-full rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    isProcessing || orderPreview.length === 0 ? '#9AA3B5' : accentColor,
                }}
              >
                {isProcessing ? 'Procesando…' : 'Pagar'}
              </button>
            </div>
          </div>
        </section>

        <aside className="w-full max-w-xl space-y-6 rounded-2xl border border-black/10 bg-[#F6F7FB] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">Resumen</h2>

          {orderPreview.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-blue/40 bg-white p-6 text-center text-sm text-brand-text/70">
              Aún no agregaste productos al carrito.
            </div>
          ) : (
            <div className="space-y-4">
              {orderPreview.map((item) => (
                <div
                  key={`${item.id}-${item.size ?? 'unique'}-${item.color ?? 'color'}`}
                  className="flex items-center justify-between gap-4 border-b border-black/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow">
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
                      <p className="text-xs text-brand-text/70">
                        {item.color ? `${item.color}` : 'Color: N/A'}
                      </p>
                      <p className="text-xs text-brand-text/70">
                        Cantidad: {item.quantity}
                        {item.size ? ` · Talle: ${item.size}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-brand-text">
                    {currencyFormatter.format(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-base font-semibold text-brand-text">
            <span>Total:</span>
            <span>{formattedTotal}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
