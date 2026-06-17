import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import stackRoutes from './src/routes/stackRoutes.js';

dotenv.config();
connectDB();

const app = express();

// app.use(cors({
//   origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

app.use(cors());

app.use(express.json());

app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stacks', stackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
