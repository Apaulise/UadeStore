import { supabase } from './supabase.service.js';

const DEFAULT_USER_ID = 1;

const roundCurrency = (value) => Number.parseFloat(Number(value ?? 0).toFixed(2));

const fetchStockById = async (stockId) => {
  const { data, error } = await supabase
    .from('Stock')
    .select(
      `
        id,
        articulo_id,
        stock,
        talle,
        Color:color_id (
          id,
          nombre,
          hexa
        ),
        Articulo:articulo_id (
          id,
          Titulo,
          precio,
          categoria,
          descripcion,
          Imagen (
            id,
            imagen
          )
        )
      `,
    )
    .eq('id', stockId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Stock no encontrado');
  }

  return data;
};

const fetchCartRows = async (userId) => {
  const { data, error } = await supabase
    .from('Carrito')
    .select('id, usuario_id, stock_id, monto_total')
    .eq('usuario_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

const buildCartItems = async (rows) => {
  if (!rows.length) return [];

  const stockIds = [...new Set(rows.map((row) => row.stock_id))];

  const { data: stocks, error } = await supabase
    .from('Stock')
    .select(
      `
        id,
        articulo_id,
        stock,
        talle,
        Color:color_id (
          id,
          nombre,
          hexa
        ),
        Articulo:articulo_id (
          id,
          Titulo,
          precio,
          categoria,
          descripcion,
          Imagen (
            id,
            imagen
          )
        )
      `,
    )
    .in('id', stockIds);

  if (error) {
    throw new Error(error.message);
  }

  const stockMap = new Map((stocks ?? []).map((stock) => [stock.id, stock]));

  return rows
    .map((row) => {
      const stock = stockMap.get(row.stock_id);
      if (!stock) return null;

      const articulo = stock.Articulo;
      const unitPrice = Number(articulo?.precio ?? 0);
      const quantity =
        unitPrice > 0 ? Math.max(1, Math.round((row.monto_total ?? 0) / unitPrice)) : 1;

      const firstImage = articulo?.Imagen?.[0]?.imagen ?? null;

      return {
        cartId: row.id,
        userId: row.usuario_id,
        stockId: stock.id,
        productId: articulo?.id ?? null,
        name: articulo?.Titulo ?? 'Producto',
        price: roundCurrency(unitPrice),
        quantity,
        subtotal: roundCurrency(row.monto_total ?? unitPrice * quantity),
        availableStock: stock.stock ?? 0,
        size: stock.talle ?? null,
        color: stock.Color?.nombre ?? null,
        colorHex: stock.Color?.hexa ?? null,
        image: firstImage,
        category: articulo?.categoria ?? null,
      };
    })
    .filter(Boolean);
};

export const getCart = async ({ userId = DEFAULT_USER_ID } = {}) => {
  const rows = await fetchCartRows(userId);
  const items = await buildCartItems(rows);

  const total = roundCurrency(
    items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0),
  );

  return { items, total };
};

export const addItem = async ({
  userId = DEFAULT_USER_ID,
  stockId,
  quantity = 1,
} = {}) => {
  if (!stockId) {
    throw new Error('stockId requerido');
  }

  const safeQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);

  const stock = await fetchStockById(stockId);
  const unitPrice = Number(stock.Articulo?.precio ?? 0);
  if (!unitPrice) {
    throw new Error('El Artículo asociado no tiene precio definido');
  }

  const addition = roundCurrency(unitPrice * safeQuantity);

  const { data: existing, error: existingError } = await supabase
    .from('Carrito')
    .select('id, monto_total')
    .eq('usuario_id', userId)
    .eq('stock_id', stockId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const newTotal = roundCurrency((existing.monto_total ?? 0) + addition);
    const { error: updateError } = await supabase
      .from('Carrito')
      .update({ monto_total: newTotal })
      .eq('id', existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { error: insertError } = await supabase
      .from('Carrito')
      .insert({
        usuario_id: userId,
        stock_id: stockId,
        monto_total: addition,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return getCart({ userId });
};

export const updateItemQuantity = async ({
  cartId,
  userId = DEFAULT_USER_ID,
  quantity,
}) => {
  if (!cartId) {
    throw new Error('cartId requerido');
  }

  const safeQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);

  const { data: cartRow, error: cartError } = await supabase
    .from('Carrito')
    .select('id, usuario_id, stock_id')
    .eq('id', cartId)
    .maybeSingle();

  if (cartError) {
    throw new Error(cartError.message);
  }

  if (!cartRow) {
    throw new Error('Item de carrito no encontrado');
  }

  const stock = await fetchStockById(cartRow.stock_id);
  const unitPrice = Number(stock.Articulo?.precio ?? 0);
  if (!unitPrice) {
    throw new Error('El Artículo asociado no tiene precio definido');
  }

  const newTotal = roundCurrency(unitPrice * safeQuantity);

  const { error: updateError } = await supabase
    .from('Carrito')
    .update({ monto_total: newTotal })
    .eq('id', cartId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return getCart({ userId });
};

export const removeItem = async ({ cartId, userId = DEFAULT_USER_ID }) => {
  if (!cartId) throw new Error('cartId requerido');

  const { error } = await supabase.from('Carrito').delete().eq('id', cartId);

  if (error) throw new Error(error.message);

  return getCart({ userId });
};

export const clearCart = async ({ userId = DEFAULT_USER_ID }) => {
  const { error } = await supabase.from('Carrito').delete().eq('usuario_id', userId);

  if (error) throw new Error(error.message);

  return { items: [], total: 0 };
};
