// test-publish-purchase.js
import 'dotenv/config';
import { publishPurchaseEvent } from './rabbitmq.service.js';

async function main() {
  const payload = {
    compra_id: 'e5b1c8a3-9d02-44a3-bf17-457f21897a02',
    usuario_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    total: 1800,
    items: [
      {
        producto_id: 1,
      },
      {
        producto_id: 2,
      },
    ],
  };

  const ok = await publishPurchaseEvent(
    'completed',                      // clave del enum
    payload,
    '2025-10-11T18:45:00Z',
  );

  console.log('Resultado publish:', ok);
  setTimeout(() => process.exit(0), 30000);
  process.exit(0);
}

main();
