import amqp from 'amqplib';

const EXCHANGES = {
  items: process.env.RABBITMQ_EXCHANGE_ITEMS || 'tienda.items',
  stock: process.env.RABBITMQ_EXCHANGE_STOCK || 'tienda.stock',
  purchase: process.env.RABBITMQ_EXCHANGE_PURCHASE || 'tienda.purchase',
};

const ROUTING_KEYS = {
  items: {
    created: 'item.created',
    updated: 'item.updated',
    deleted: 'item.deleted',
  },
  stock: {
    updated: 'stock.updated',
  },
  purchase: {
    created: 'purchase.created',
    completed: 'purchase.completed',
    cancelled: 'purchase.cancelled',
  },
};

const QUEUE_NAME = process.env.RABBITMQ_TIENDA_QUEUE || null;

let connection = null;
let channelPromise = null;

const buildRabbitUrl = () => {
  if (process.env.RABBITMQ_URL) return process.env.RABBITMQ_URL;

  const user = encodeURIComponent(process.env.RABBITMQ_USER || '');
  const pass = encodeURIComponent(process.env.RABBITMQ_PASS || '');
  const host = process.env.RABBITMQ_HOST || 'localhost';
  const port = process.env.RABBITMQ_PORT || '5672';
  const rawVhost = process.env.RABBITMQ_VHOST || '/';
  const vhost = encodeURIComponent(rawVhost.replace(/^\//, ''));

  // si vhost es vacío, la URL termina en "/", que es el default
  return `amqp://${user}:${pass}@${host}:${port}/${vhost}`;
};

const resetChannel = () => {
  channelPromise = null;
  connection = null;
};

const getChannel = async () => {
  if (channelPromise) return channelPromise;

  channelPromise = (async () => {
    const url = buildRabbitUrl();
    console.log('[RabbitMQ] Conectando a URL:', url);
    const conn = await amqp.connect(url);
    connection = conn;
    console.log('[RabbitMQ] serverProperties:', conn.serverProperties);

    conn.on('close', () => {
      console.warn('[RabbitMQ] Conexión cerrada, se reintentará en la próxima publicación');
      resetChannel();
    });

    conn.on('error', (err) => {
      console.error('[RabbitMQ] Error en la conexión:', err?.message || err);
    });

    const channel = await conn.createChannel();
    // No hacemos assertExchange, assertQueue ni bindQueue
    console.log('[RabbitMQ] Conectado a broker');
    return channel;
  })();

  try {
    return await channelPromise;
  } catch (error) {
    resetChannel();
    throw error;
  }
};

export const connectRabbitMQ = async () => {
  try {
    await getChannel();
  } catch (error) {
    console.error('[RabbitMQ] No se pudo inicializar la conexión:', error?.message || error);
  }
};

const publish = async (exchange, routingKey, payload) => {
  try {
    const channel = await getChannel();

    const message = Buffer.from(
      JSON.stringify({
        eventType: routingKey,          // ej purchase.completed
        occurredAt: new Date().toISOString(),
        payload,
      }),
    );

    const sent = channel.publish(exchange, routingKey, message, {
      contentType: 'application/json',
      persistent: true,
    });

    if (!sent) {
      console.warn(`[RabbitMQ] Backpressure al publicar ${routingKey}`);
    }

    return true;
  } catch (error) {
    console.error(`[RabbitMQ] No se pudo publicar ${routingKey}:`, error?.message || error);
    return false;
  }
};

export const publishItemEvent = (eventName, payload) => {
  const routingKey = ROUTING_KEYS.items[eventName];
  if (!routingKey) {
    console.warn(`[RabbitMQ] Evento de item desconocido: ${eventName}`);
    return false;
  }
  return publish(EXCHANGES.items, routingKey, payload);
};

export const publishStockUpdated = (payload) =>
  publish(EXCHANGES.stock, ROUTING_KEYS.stock.updated, payload);

export const publishPurchaseEvent = (eventName, payload, occurredAt) => {
  const routingKey = ROUTING_KEYS.purchase[eventName];
  if (!routingKey) {
    console.warn(`[RabbitMQ] Evento de compra desconocido: ${eventName}`);
    return false;
  }

   console.log(
    '[RabbitMQ] publishPurchaseEvent -> exchange',
    EXCHANGES.purchase,
    'routingKey',
    routingKey,
  );

  return (async () => {
    try {
      const channel = await getChannel();

      const message = Buffer.from(
        JSON.stringify({
          eventType: routingKey,
          occurredAt: occurredAt || new Date().toISOString(),
          payload,
        }),
      );

      const sent = channel.publish(EXCHANGES.purchase, routingKey, message, {
        contentType: 'application/json',
        persistent: true,
      });

      if (!sent) {
        console.warn(`[RabbitMQ] Backpressure al publicar ${routingKey}`);
      }

      return true;
    } catch (error) {
      console.error(`[RabbitMQ] No se pudo publicar ${routingKey}:`, error?.message || error);
      return false;
    }
  })();
};
