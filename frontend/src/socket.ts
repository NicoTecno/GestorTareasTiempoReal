import { io } from 'socket.io-client';

// Conectamos con el backend para escuchar eventos en vivo
//export const socket = io('http://localhost:3000');
const socket = io('https://taskflow-api-2hgn.onrender.com');