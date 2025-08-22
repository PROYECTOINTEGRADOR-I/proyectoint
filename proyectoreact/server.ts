import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './auth.ts';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// ⚡ CORS: permitir cualquier frontend
app.use(cors({ origin: true, credentials: true }));

// Rutas
app.use('/', authRoutes);

// Escuchar en todas las interfaces
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running at http://0.0.0.0:${PORT}`);
});