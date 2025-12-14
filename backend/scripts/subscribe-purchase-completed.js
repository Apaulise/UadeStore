// backend/scripts/subscribe-purchase-completed.js
import 'dotenv/config';
import amqp from 'amqplib';

const buildRabbitUrl = () => {
  if (process.env.RABBITMQ_URL && process.env.RABBITMQ_URL !== 'la_url_de_tu_servidor_rabbitmq') {
    return process.env.RABBITMQ_URL;
  }

  const user = process.env.RABBITMQ_USER ? encodeURIComponent(process.env.RABBITMQ_USER) : null;
  const pass = process.env.RABBITMQ_PASS ? encodeURIComponent(process.env.RABBITMQ_PASS) : null;
  const host = process.env.RABBITMQ_HOST || 'localhost';
  const port = process.env.RABBITMQ_PORT || '5672';
  const rawVhost = process.env.RABBITMQ_VHOST || '/';
  const vhost = encodeURIComponent(rawVhost.replace(/^\//, ''));

  if (user && pass) return `amqp://${user}:${pass}@${host}:${port}/${vhost}`;
  if (user && !pass) return `amqp://${user}@${host}:${port}/${vhost}`;
  return `amqp://${host}:${port}/${vhost}`;
};

const RABBIT_URL = buildRabbitUrl();

const EXCHANGE = process.env.RABBITMQ_EXCHANGE_PURCHASE || 'tienda.purchase';
const ROUTING_KEY = 'purchase.completed';
const QUEUE = 'debug.purchase.completed';

(async () => {
  const conn = await amqp.connect(RABBIT_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(QUEUE, { durable: false });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  console.log(`📥 Escuchando ${EXCHANGE} -> ${ROUTING_KEY} en ${QUEUE} ... (URL: ${RABBIT_URL})`);

  channel.consume(QUEUE, (msg) => {
    if (!msg) return;
    console.log('📩 Payload recibido:');
    try {
      console.log(JSON.parse(msg.content.toString()));
    } catch {
      console.log(msg.content.toString());
    }
    channel.ack(msg);
  });
})();
