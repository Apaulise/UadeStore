import { supabase } from './supabase.service.js';
import { publishPurchaseEvent } from './rabbitmq.service.js';

export const createNewPurchase = async (purchaseData) => {
  // 1. Guardar la compra en Supabase
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchaseData])
    .select() // .select() devuelve el registro creado
    .single(); // .single() para obtener un objeto en lugar de un array

  if (error) throw new Error(error.message);
  
  // 2. Crear y publicar el evento en RabbitMQ
  const event = {
    type: 'PURCHASE_CREATED',
    purchaseId: data.id,
    userId: data.user_id,
    timestamp: new Date(),
  };
  publishPurchaseEvent(event);

  return data; // Devolvemos la compra creada
  
};

// Nueva función para obtener el historial de compras de un usuario
export const getPurchaseHistory = async (userId) => {
  if (!userId) throw new Error('El ID de usuario es requerido.');

  // 1. Obtener las compras y todos sus items anidados
  const { data, error } = await supabase
    .from('purchases')
    // --- CONSULTA MODIFICADA ---
    // Pedimos campos de 'purchases' y anidamos el resto
    .select(`
      id,
      created_at,
      total,
      item_compra (
        id,
        cantidad,
        subtotal, 
        stock (
          articulo (
            titulo,
            imagen,
            descripcion,
            talle,
            color
          )
        )
      )
    `)
    .eq('user_id', userId) 
    .order('created_at', { ascending: false });

  // 2. Manejar error
  if (error) {
    console.error('Error fetching purchase history:', error.message);
    throw new Error(error.message);
  }

  // 3. Devolver los datos anidados
  return data;
};