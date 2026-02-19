import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://chitzy-chat-app.netlify.app',
    ],
    credentials: true,
  },
});

const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  const userId = socket.handshake.query.userId;
  console.log('User ID from socket:', userId);
  if (userId) userSocketMap[userId] = socket.id;
  console.log('Current users:', userSocketMap);

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // ✅ LIVE MESSAGE LISTENER ADD
  socket.on('sendMessage', (data) => {
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    console.log('📩 sendMessage event received from:', socket.id);
    console.log('📦 Data ID:', data._id);
    console.log('🎯 Receiver socket:', receiverSocketId);

    if (receiverSocketId) {
      console.log('🚀 Emitting newMessage to receiver:', receiverSocketId);
      io.to(receiverSocketId).emit('newMessage', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('🟢 A user connected', socket.id);

    for (const key in userSocketMap) {
      if (userSocketMap[key] === socket.id) {
        delete userSocketMap[key];
      }
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };
