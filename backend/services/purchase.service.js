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