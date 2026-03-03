import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schoolRoutes from './routes/schoolRoutes';
import studentRoutes from './routes/studentRoutes';
import rankingRoutes from './routes/rankingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', schoolRoutes);
app.use('/api', studentRoutes);
app.use('/api', rankingRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'CAPTE Pastaza API - Backend funcionando ✅' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});
