import 'dotenv/config';
import { publishPurchaseEvent } from './rabbitmq.service.js';

async function main() {
  console.log('Arrancando spam de purchase.completed');

  for (let i = 1; i <= 10; i++) {
    const payload = {
      compra_id: `test-${i}`,
      usuario_id: 'debug-user',
      total: 1000 + i,
      items: [
        { producto_id: 1, cantidad: 1, subtotal: 500 },
        { producto_id: 2, cantidad: 1, subtotal: 500 },
      ],
    };

    const ok = await publishPurchaseEvent(
      'completed',
      payload,
      '2025-10-11T18:45:00Z',
    );

    console.log(`Mensaje ${i}, resultado publish:`, ok);
  }

  console.log('Mensajes enviados, dejo la conexion abierta 60 segundos');
  setTimeout(() => {
    console.log('Cerrando proceso de prueba');
    process.exit(0);
  }, 60000);
}

main().catch((err) => {
  console.error('Error en spam publish', err);
  process.exit(1);
});
