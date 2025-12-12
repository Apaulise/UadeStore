
import express from 'express';
import cors from 'cors';
import { connectRabbitMQ } from './services/rabbitmq.service.js';

// Importamos las rutas
import productRoutes from './routes/product.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import cartRoutes from './routes/cart.routes.js';
import walletRoutes from './routes/wallet.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Conectamos a RabbitMQ al iniciar
connectRabbitMQ();

// Le decimos a la app que use nuestras rutas con un prefijo
app.use('/api/products', productRoutes);
app.use('/api/orders', purchaseRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wallets', walletRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
