import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './auth.ts';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Front corre en 5173, backend en 3000
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// 👇 sin /api, todo en raíz
app.use('/', authRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
