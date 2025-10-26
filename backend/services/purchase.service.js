import { supabase } from './supabase.service.js';
import { publishPurchaseEvent } from './rabbitmq.service.js';

export const createNewPurchase = async (purchaseData) => {
  console.log("info de ordennn", purchaseData)
  const { userId, items, total } = purchaseData;

  // --- Insertar la Compra Principal ---
  const { data: compra, error: compraError } = await supabase
    .from('Compra')
    .insert({
      usuario_id: 1, 
      total_compra: total,
    })
    .select() 
    .single(); 

  if (compraError) {
    console.error("Error creando Compra:", compraError);
    throw new Error('Error al crear la orden principal.',compraError);
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

 try {
    for (const item of items) {
      // 1. Obtener el stock actual (Necesario para calcular el nuevo stock en JS)
      const { data: currentStockData, error: fetchError } = await supabase
        .from('Stock')
        .select('stock')
        .eq('id', item.stockId)
        .single();

      if (fetchError || !currentStockData) {
         throw new Error(`No se pudo obtener el stock actual para stockId ${item.stockId}. Details: ${fetchError?.message}`);
      }
      
      const currentStockValue = currentStockData.stock;
      const purchasedQuantity = item.quantity;
      const newStock = currentStockValue - purchasedQuantity;
      const { error: updateError } = await supabase
        .from('Stock')
        .update({ stock: newStock }) // Actualiza con el valor calculado
        .eq('id', item.stockId);

      if (updateError) {
        // Si la actualización de stock falla, idealmente deberías revertir toda la transacción
        // (Borrar Compra e Item_compra). Esto es complejo sin RPC.
        console.error(`Error actualizando stock para stockId ${item.stockId}:`, updateError);
        throw new Error(`Fallo al actualizar el stock para uno de los items. Details: ${updateError.message}`);
      }
       console.log(`[OrderService] Stock actualizado para stockId ${item.stockId}: ${currentStockValue} -> ${newStock}`);
    }
  } catch (stockUpdateError) {
      // Si cualquier actualización de stock falla, intentamos revertir todo
      console.error("Error durante la actualización de stock, intentando revertir...", stockUpdateError);
      await supabase.from('Item_compra').delete().eq('compra_id', compraId);
      await supabase.from('Compra').delete().eq('id', compraId);
      // Re-lanzamos el error para que el controlador lo maneje
      throw stockUpdateError; 
  }

  // --- (Futuro Paso) Enviar evento a RabbitMQ ---
  // const eventPayload = { orderId: compraId, userId, timestamp: new Date() };
  // publishOrderCreatedEvent(eventPayload);
  // --- Fin Futuro Paso ---

  return { ...compra, items: itemsToInsert };
};

// Nueva función para obtener el historial de compras de un usuario
export const getPurchaseHistory = async (userId) => {
  if (!userId) throw new Error('El ID de usuario es requerido.');

  // 1. Obtener las compras y todos sus items anidados
  const { data, error } = await supabase
    .from('Compra')
    // --- CONSULTA MODIFICADA ---
    // Pedimos campos de 'purchases' y anidamos el resto
    .select(`
    *, 
    Item_compra (
      *, 
      Stock (
        stock, 
        talle, 
        Color ( nombre, hexa ), 
        Articulo ( 
          Titulo, 
          descripcion, 
          Imagen ( imagen ) 
        )
      )
    )
  `)
    .eq('usuario_id', userId) 
    .order('created_at', { ascending: false });

  // 2. Manejar error
  if (error) {
    console.error('Error fetching purchase history:', error.message);
    throw new Error(error.message);
  }

  // 3. Devolver los datos anidados
  return data;
};