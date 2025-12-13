import React, { useMemo, useState, useEffect } from 'react'; // ✨ Agregamos useEffect
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { usePendingOrder } from '../context/PendingOrderContext';
import { OrdersAPI } from '../services/api';
import { WalletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const accentColor = '#1F3B67';

// Calcula fecha de retiro: dentro de 3 días hábiles
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

const pickupDate = getBusinessDateFromNow(3);

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency', 
  currency:"ARS",// O 'ARS' si prefieres, aunque el formatter usa USD
  minimumFractionDigits: 2,
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { setLastOrder } = usePendingOrder();
  const [email, setEmail] = useState('');
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // ✨ Estado para la billetera
  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  // ✨ Efecto para cargar el saldo real al montar el componente
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const myWallet = await WalletAPI.getMine();
        // Nota: myWallet ya viene limpio gracias al service (ej: { balance: "20000.00", ... })
        setWallet(myWallet);
      } catch (error) {
        console.error("Error cargando wallet:", error);
        toast.error("No se pudo cargar el saldo de tu billetera");
      } finally {
        setLoadingWallet(false);
      }
    };

    if (user) {
        fetchWallet();
    }
  }, [user]);
  console.log("Wallet en Checkout:", loadingWallet,"wallet", wallet);

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

  // ✨ Convertimos el saldo a número para comparar y formatear
  const walletBalanceNumber = parseFloat(wallet?.balance || 0);
  const formattedBalance = loadingWallet 
      ? "Cargando..." 
      : currencyFormatter.format(walletBalanceNumber);
      console.log("formattedBalance:", formattedBalance, "wallet.balance:", wallet?.balance);
      console.log("formattedTotal:", formattedTotal, "total:", total);

  const handleContinueShopping = () => {
    navigate('/catalogo');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handlePay = async () => {
    if (isProcessing) return;

    // VALIDACIÓN DE SALDO ANTES DE PAGAR
    if (loadingWallet) {
        toast.error("Aguarde un momento, cargando billetera...");
        return;
    }
    // Verificamos tener el UUID de la billetera (Viene del endpoint getMine)
    if (!wallet?.uuid) {
        toast.error("Error: No se identificó tu billetera para debitar.");
        return;
    }

    setIsProcessing(true);

    try {
        console.log("Iniciando transferencia...");
        
        await WalletAPI.pay({
            fromWalletId: wallet.uuid, // El UUID que nos devolvió getMine
            amount: total,
            currency: wallet.currency || "ARG", // Usamos la moneda de tu billetera
            description: `Compra UadeStore - ${items.length} items`
        });

        console.log("Pago exitoso en Core. Creando orden local...");

    setIsProcessing(true);
    } catch (err) {
        console.error("Error en el proceso de transferencia:", err);
        toast.error(err.message || 'Error al procesar el pago');
      } finally {
        setIsProcessing(false);
      }

    // Aseguramos que haya un ID, buscando en las variantes posibles
    const userIdPlaceholder = user?.sub;

    const orderPayload =  {
      userId: userIdPlaceholder, 
      items: items.map(item => ({ 
          stockId: item.stockId, 
          quantity: item.quantity,
          price: item.price,
      })),
      total: total,
    };
  
    try {
        // Creamos la orden (La base de datos validará stock, etc.)
        const response = await OrdersAPI.create(orderPayload);
        const orderData = response.data; 

        // 1. Guardar estado
        setLastOrder(orderData); 
        
        const successOrder = {
          id: orderData?.id,
          createdAt: orderData?.created_at,
          pickupDate,
          items: orderPreview,
          total,
        };
        
        // 2. Persistencia
        setLastOrder(successOrder);
        sessionStorage.setItem('lastOrder', JSON.stringify(successOrder));

        // 3. Limpiar carrito
        await clear(); 
        
        toast.success('Compra realizada con éxito');

        // 4. Redirigir
        navigate('/checkout/exito', { replace: true });

     } catch (err) {
        console.error("Error al crear la orden:", err);
        toast.error(err.response?.data?.message || 'Error al procesar el pago');
      } finally {
        setIsProcessing(false);
      }
  };
  
  // AQUI SIGUE TU RETURN (...)

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
            {walletBalanceNumber < total ? (
              <><p className="text-sm font-semibold text-red-600">Saldo insuficiente para completar la compra.</p><button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue/10"
              >
                Cancelar
              </button></>
            ) : (
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
            </div>)}
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
