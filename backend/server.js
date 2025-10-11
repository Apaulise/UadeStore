
console.log('SUPABASE_URL Cargada:', process.env.SUPABASE_URL); import express from 'express';
import cors from 'cors';
import { connectRabbitMQ } from './services/rabbitmq.service.js';

// Importamos las rutas
import productRoutes from './routes/product.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Conectamos a RabbitMQ al iniciar
connectRabbitMQ();

// Le decimos a la app que use nuestras rutas con un prefijo
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});