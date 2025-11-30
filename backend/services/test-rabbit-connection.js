// test-rabbit-connection.js
import 'dotenv/config';
import { connectRabbitMQ } from './rabbitmq.service.js';


async function main() {
  try {
    await connectRabbitMQ();
    console.log('Conexión a RabbitMQ inicializada correctamente');
  } catch (error) {
    console.error('Error probando conexión a RabbitMQ:', error);
  }

  process.exit(0);
}

main();
