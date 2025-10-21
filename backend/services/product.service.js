import { supabase } from './supabase.service.js';

const PRODUCT_SELECT = `
  *,
  Stock (
    *,
    Color (*)
  ),
  Imagen(*)
`;

const normalizeHex = (hex) => {
  if (!hex) return null;
  return hex.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
};

const normalizeName = (value) => (value ?? '').toString().trim();

const ensureColor = async ({ name, hex }, colorsCache) => {
  const normalizedHex = normalizeHex(hex);
  const normalizedName = normalizeName(name);

  let match =
    colorsCache.find(
      (c) => normalizeName(c.nombre).toLowerCase() === normalizedName.toLowerCase() && normalizedName
    ) ?? null;

  if (!match && normalizedHex) {
    match = colorsCache.find((c) => normalizeHex(c.hexa) === normalizedHex) ?? null;
  }

  if (!match) {
    const payload = {
      nombre: normalizedName || `Color ${colorsCache.length + 1}`,
      hexa: normalizedHex || null,
    };

    const { data, error } = await supabase
      .from('Color')
      .insert(payload)
      .select('id, nombre, hexa')
      .single();

    if (error) throw new Error(error.message);

    colorsCache.push(data);
    match = data;
  }

  return match.id;
};

export const getAllArticulos = async () => {
  const { data, error } = await supabase
    .from('Articulo')
    .select(PRODUCT_SELECT);

  if (error) throw new Error(error.message);
  return data;
};

export const getArticuloById = async (productId) => {
  const { data, error } = await supabase
    .from('Articulo')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const listColors = async () => {
  const { data, error } = await supabase
    .from('Color')
    .select('id, nombre, hexa')
    .order('nombre');

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const updateArticulo = async (productId, { name, price, description }) => {
  const payload = {};
  if (name !== undefined) payload.Titulo = name;
  if (price !== undefined) payload.precio = Number(price);
  if (description !== undefined) payload.descripcion = description;

  if (Object.keys(payload).length === 0) return null;

  const { error } = await supabase
    .from('Articulo')
    .update(payload)
    .eq('id', productId);

  if (error) throw new Error(error.message);
  return true;
};

const syncProductStock = async (productId, variants = []) => {
  const { data: existing, error: existingError } = await supabase
    .from('Stock')
    .select('id')
    .eq('articulo_id', productId);

  if (existingError) throw new Error(existingError.message);

  const existingIds = new Set((existing ?? []).map((item) => item.id));
  const keepIds = new Set();

  const { data: colors, error: colorsError } = await supabase
    .from('Color')
    .select('id, nombre, hexa');

  if (colorsError) throw new Error(colorsError.message);

  const colorsCache = [...(colors ?? [])];

  for (const variant of variants) {
    const stockId = variant.id ? Number(variant.id) : null;
    const size = variant.size ? variant.size.toString().trim() : null;
    const quantity = Number.parseInt(variant.stock, 10);
    const safeStock = Number.isNaN(quantity) ? 0 : quantity;
    const colorId = await ensureColor(
      {
        name: variant.colorName ?? variant.color ?? '',
        hex: variant.colorHex ?? variant.hex ?? null,
      },
      colorsCache
    );

    if (stockId) {
      const { error: updateError } = await supabase
        .from('Stock')
        .update({
          color_id: colorId,
          talle: size,
          stock: safeStock,
        })
        .eq('id', stockId)
        .eq('articulo_id', productId);

      if (updateError) throw new Error(updateError.message);
      keepIds.add(stockId);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('Stock')
        .insert({
          articulo_id: productId,
          color_id: colorId,
          talle: size,
          stock: safeStock,
        })
        .select('id')
        .single();

      if (insertError) throw new Error(insertError.message);
      keepIds.add(inserted.id);
    }
  }

  const toDelete = [...existingIds].filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('Stock')
      .delete()
      .in('id', toDelete);

    if (deleteError) throw new Error(deleteError.message);
  }
};

export const updateProductWithStock = async (productId, payload) => {
  await updateArticulo(productId, payload ?? {});
  await syncProductStock(productId, payload?.stockItems ?? []);
  return getArticuloById(productId);
};

export const deleteProduct = async (productId) => {
  const { error: stockError } = await supabase
    .from('Stock')
    .delete()
    .eq('articulo_id', productId);

  if (stockError) throw new Error(stockError.message);

  const { error: articleError } = await supabase
    .from('Articulo')
    .delete()
    .eq('id', productId);

  if (articleError) throw new Error(articleError.message);

  return true;
};
