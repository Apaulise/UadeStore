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

export const listSizes = async () => {
  // Obtiene los valores existentes en la columna enum `talle` de Stock
  const { data, error } = await supabase
    .from('Stock')
    .select('talle')
    .not('talle', 'is', null);

  if (error) throw new Error(error.message);

  const sizes = Array.from(new Set((data ?? []).map((row) => row.talle))).filter(Boolean);
  sizes.sort((a, b) => `${a}`.localeCompare(`${b}`, 'es', { numeric: true }));
  return sizes;
};

export const createArticulo = async ({ name, price, description, category }) => {
  // La columna `categoria` es NOT NULL y es un enum.
  // Tomamos la categoría enviada desde el front si viene,
  // si no, intentamos usar la de algún Articulo existente
  // para garantizar que el valor pertenece al enum.
  let categoria = category || null;

  if (!categoria) {
    const { data: existing, error: existingError } = await supabase
      .from('Articulo')
      .select('categoria')
      .limit(1)
      .maybeSingle();

    if (!existingError && existing?.categoria) {
      categoria = existing.categoria;
    } else {
      // Fallback razonable si no hay artículos aún.
      categoria = 'LIBRERIA';
    }
  }

  const payload = {
    Titulo: name ?? '',
    precio: Number(price ?? 0),
    descripcion: description ?? '',
    categoria,
  };

  const { data, error } = await supabase
    .from('Articulo')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
};

const createArticuloWithSafeId = async ({ name, price, description, category }) => {
  let categoria = category || null;
  let nextId = 1;

  const { data: last, error: lastError } = await supabase
    .from('Articulo')
    .select('id, categoria')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastError && last?.id != null) {
    const parsed = Number(last.id);
    nextId = Number.isFinite(parsed) ? parsed + 1 : 1;
  }

  if (!categoria) {
    if (last?.categoria) {
      categoria = last.categoria;
    } else {
      categoria = 'LIBRERIA';
    }
  }

  const payload = {
    id: nextId,
    Titulo: name ?? '',
    precio: Number(price ?? 0),
    descripcion: description ?? '',
    categoria,
  };

  const { data, error } = await supabase
    .from('Articulo')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
};

export const updateArticulo = async (productId, { name, price, description, category }) => {
  const payload = {};
  if (name !== undefined) payload.Titulo = name;
  if (price !== undefined) payload.precio = Number(price);
  if (description !== undefined) payload.descripcion = description;
  if (category !== undefined) payload.categoria = category;

  if (Object.keys(payload).length === 0) return null;

  const { error } = await supabase
    .from('Articulo')
    .update(payload)
    .eq('id', productId);

  if (error) throw new Error(error.message);
  return true;
};

const upsertProductImages = async (productId, imagesInput) => {
  // No modificar imágenes si el campo no viene en el payload
  if (imagesInput === undefined) return;

  const urls = (imagesInput ?? [])
    .map((url) => (url ?? '').toString().trim())
    .filter(Boolean);

  const { data: existing, error: fetchError } = await supabase
    .from('Imagen')
    .select('id')
    .eq('articulo_id', productId);

  if (fetchError) throw new Error(fetchError.message);

  const existingRows = existing ?? [];
  const existingIds = existingRows.map((row) => row.id);

  // Si no hay URLs, borrar todas
  if (urls.length === 0) {
    if (existingIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('Imagen')
        .delete()
        .in('id', existingIds);
      if (deleteError) throw new Error(deleteError.message);
    }
    return;
  }

  // Siempre dejamos las imágenes en el orden recibido: borramos todas y reinsertamos
  if (existingIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('Imagen')
      .delete()
      .in('id', existingIds);
    if (deleteError) throw new Error(deleteError.message);
  }

  const insertPayload = urls.map((url) => ({
    articulo_id: productId,
    imagen: url,
  }));

  const { error: insertError } = await supabase.from('Imagen').insert(insertPayload);
  if (insertError) throw new Error(insertError.message);
};

const syncProductStock = async (productId, variants = []) => {
  const { data: existing, error: existingError } = await supabase
    .from('Stock')
    .select('id, color_id, talle')
    .eq('articulo_id', productId);

  if (existingError) throw new Error(existingError.message);

  const existingRows = existing ?? [];
  const existingIds = new Set(existingRows.map((item) => item.id));
  const keepIds = new Set();

  const { data: colors, error: colorsError } = await supabase
    .from('Color')
    .select('id, nombre, hexa');

  if (colorsError) throw new Error(colorsError.message);

  const colorsCache = [...(colors ?? [])];
  // Mapa de combinaciones existentes color_id+talle -> id para evitar colisiones durante esta sincronización
  const comboToId = new Map(
    existingRows.map((row) => [`${row.color_id ?? 'null'}::${row.talle ?? ''}`, row.id]),
  );

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

    // Detecta si ya existe una fila con la misma combinación
    const comboKey = `${colorId ?? 'null'}::${size ?? ''}`;
    const existingSameComboId = comboToId.get(comboKey) ?? null;
    const existingSameCombo = existingSameComboId
      ? { id: existingSameComboId }
      : null;

    if (existingSameCombo) {
      // Si existe y es distinto al que estamos editando, actualizamos el existente
      // y marcamos para conservar ese id, evitando violar la PK compuesta.
      const targetId = existingSameCombo.id;
      const { error: updateError } = await supabase
        .from('Stock')
        .update({ stock: safeStock })
        .eq('id', targetId)
        .eq('articulo_id', productId);
      if (updateError) throw new Error(updateError.message);
      keepIds.add(targetId);
      comboToId.set(comboKey, targetId);

      // Si teníamos otro id distinto para esta variante, lo eliminaremos al final
      if (stockId && stockId !== targetId) {
        // marcará eliminación por no estar en keepIds
      }
      continue;
    }

    if (stockId) {
      // Si el registro cambia de combinación, actualizamos el mapa
      const prev = existingRows.find((row) => row.id === stockId);
      if (prev) {
        comboToId.delete(`${prev.color_id ?? 'null'}::${prev.talle ?? ''}`);
      }
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
      comboToId.set(comboKey, stockId);
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
      comboToId.set(comboKey, inserted.id);
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

export const createProductWithStock = async (payload) => {
  const safePayload = payload ?? {};
  const productId = await createArticuloWithSafeId(safePayload);
  await syncProductStock(productId, safePayload.stockItems ?? []);
  await upsertProductImages(productId, safePayload.images);
  return getArticuloById(productId);
};

export const updateProductWithStock = async (productId, payload) => {
  const safePayload = payload ?? {};
  await updateArticulo(productId, safePayload);
  await syncProductStock(productId, safePayload.stockItems ?? []);
  await upsertProductImages(productId, safePayload.images);
  return getArticuloById(productId);
};

export const deleteProduct = async (productId) => {
  try {
    // 1. Find all Stock IDs associated with the Articulo
    const { data: stockItems, error: stockFetchError } = await supabase
      .from('Stock')
      .select('id') // Select only the IDs
      .eq('articulo_id', productId);

    if (stockFetchError) throw new Error(`Error fetching stock IDs: ${stockFetchError.message}`);

    const stockIds = stockItems.map(item => item.id);

    // Only proceed if there are stock items (optional, prevents unnecessary deletes)
    if (stockIds.length > 0) {
      // 2. Delete related entries in Carrito
      const { error: carritoError } = await supabase
        .from('Carrito')
        .delete()
        .in('stock_id', stockIds); // Delete where stock_id is one of the found IDs

      if (carritoError) throw new Error(`Error deleting from Carrito: ${carritoError.message}`);

      // 3. Delete related entries in Item_compra
      const { error: itemCompraError } = await supabase
        .from('Item_compra')
        .delete()
        .in('stock_id', stockIds); // Delete where stock_id is one of the found IDs

      if (itemCompraError) throw new Error(`Error deleting from Item_compra: ${itemCompraError.message}`);

      // 4. Delete Stock entries
      const { error: stockError } = await supabase
        .from('Stock')
        .delete()
        .eq('articulo_id', productId); // Or use .in('id', stockIds)

      if (stockError) throw new Error(`Error deleting Stock: ${stockError.message}`);
    }

    // 5. Delete Imagen entries
    const { error: imageError } = await supabase
      .from('Imagen')
      .delete()
      .eq('articulo_id', productId);

    if (imageError) throw new Error(`Error deleting Imagen: ${imageError.message}`);

    // 6. Finally, delete the Articulo
    const { error: articleError } = await supabase
      .from('Articulo')
      .delete()
      .eq('id', productId);

    if (articleError) throw new Error(`Error deleting Articulo: ${articleError.message}`);

    console.log(`Successfully deleted Articulo ${productId} and related data.`);
    return true;

  } catch (error) {
    console.error("Deletion failed:", error);
    // Re-throw the error so the calling function knows it failed
    throw error; 
  }
};
