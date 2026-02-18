import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectionDB } from './lib/db.js';
import { app, server } from './lib/socket.js';

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: [
      'https://chitzy-chat-app.netlify.app',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  }),
);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectionDB();
});
