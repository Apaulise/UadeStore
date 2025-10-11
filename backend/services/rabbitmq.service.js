//Contiene la lógica para conectar y enviar mensajes a RabbitMQ.
import amqp from 'amqplib';

let channel;

// Función para conectar al iniciar el servidor
export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    // Aseguramos que la cola exista
    await channel.assertQueue('purchase_events', { durable: true });
    console.log('Conectado a RabbitMQ');
  } catch (error) {
    console.error('Error al conectar con RabbitMQ:', error);
  }
};

// Función para publicar un evento
export const publishPurchaseEvent = (eventData) => {
  if (channel) {
    const message = Buffer.from(JSON.stringify(eventData));
    channel.sendToQueue('purchase_events', message);
    console.log('Evento de compra enviado:', eventData);
  }
};