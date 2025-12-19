import { io } from 'socket.io-client';

// Conectamos con el backend para escuchar eventos en vivo
//export const socket = io('http://localhost:3000');
export const socket = io('https://taskflow-api-2hgn.onrender.com', {
  transports: ['polling', 'websocket'], // Esto asegura que conecte sí o sí
  withCredentials: true
});