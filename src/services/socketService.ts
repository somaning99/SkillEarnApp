import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

let currentUserId: string | null = null;

export const getSocket = (userId?: string) => {
  if (!socket) {
    socket = io(window.location.origin, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });
  }
  
  if (userId && userId !== currentUserId) {
    currentUserId = userId;
    if (socket.connected) {
      socket.emit('join', userId);
    }
    
    // Always ensure we join on every successful connection
    socket.off('connect');
    socket.on('connect', () => {
      if (currentUserId) {
        socket?.emit('join', currentUserId);
      }
    });
  }
  return socket;
};
