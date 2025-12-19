import { io } from 'socket.io-client';

// Conectamos con el backend para escuchar eventos en vivo
export const socket = io('http://localhost:3000');