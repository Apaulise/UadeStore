//Funciones para obtener productos de Supabase.

import { supabase } from './supabase.service.js'; // Importamos el cliente

// Función que obtiene todos los productos
export const getAllArticulos = async () => {
  const { data, error } = await supabase
    .from('Articulo')
    .select(`
      *,
      Stock (
        *,
        Color (*)
      ), Imagenes(*)
    `);

  if (error) throw new Error(error.message); // Si hay un error, lo lanzamos
  return data;
};

export const getArticuloById = async (productId) => {
  const { data, error } = await supabase
    .from('Articulo') // 1. De la tabla 'products'
    .select('*')      // 2. Traeme todas las columnas
    .eq('id', productId) // 3. DONDE la columna 'id' SEA IGUAL A productId
    .single();        // 4. Y como sé que es uno solo, devuélvemelo como objeto, no como array

  if (error) throw new Error(error.message);
  return data;
};