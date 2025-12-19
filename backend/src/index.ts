import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';    // NUEVO
import projectRoutes from './routes/projectRoutes.js'; // NUEVO

import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const httpServer = createServer(app);
//const io = new Server(httpServer, { cors: { origin: "*" } });
const io = new Server(httpServer, {
  cors: {
    origin: "https://tu-proyecto.vercel.app", // Reemplazá con tu URL real de Vercel
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.use((req: any, _res, next) => {
  req.io = io;
  next();
});

// --- REGISTRO DE RUTAS ---
app.use('/tasks', taskRoutes);
app.use('/teams', teamRoutes);
app.use('/projects', projectRoutes);
app.use('/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Sistema de Gestión listo en http://localhost:${PORT}`);
});