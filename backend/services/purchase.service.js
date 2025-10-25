import { supabase } from './supabase.service.js';
import { publishPurchaseEvent } from './rabbitmq.service.js';

export const createNewPurchase = async (purchaseData) => {
  const { userId, items, total } = purchaseData;

  // --- Insertar la Compra Principal ---
  const { data: compra, error: compraError } = await supabase
    .from('Compra')
    .insert({
      usuario_id: userId, 
      total_compra: total,
    })
    .select() 
    .single(); 

  if (compraError) {
    console.error("Error creando Compra:", compraError);
    throw new Error('Error al crear la orden principal.');
  }

  const compraId = compra.id;

  const itemsToInsert = items.map(item => ({
    compra_id: compraId,
    stock_id: item.stockId, 
    cantidad: item.quantity,
    subtotal: item.price * item.quantity 
  }));

  const { error: itemsError } = await supabase
    .from('Item_compra')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error("Error creando Items:", itemsError);
    await supabase.from('Compra').delete().eq('id', compraId); 
    throw new Error('Error al guardar los detalles de la orden.');
  }

  // --- (Futuro Paso) Enviar evento a RabbitMQ ---
  // const eventPayload = { orderId: compraId, userId, timestamp: new Date() };
  // publishOrderCreatedEvent(eventPayload);
  // --- Fin Futuro Paso ---

  return { ...compra, items: itemsToInsert };
};