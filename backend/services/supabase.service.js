//Configura y exporta el cliente de Supabase.
import { createClient } from '@supabase/supabase-js';

// Leemos las claves desde el archivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Creamos y exportamos el cliente
export const supabase = createClient(supabaseUrl, supabaseKey);