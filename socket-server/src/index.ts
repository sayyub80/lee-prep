import http from 'http';
import { Server, Socket } from 'socket.io';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your app's URL
  }
});

interface UserData {
  socket: Socket;
  name: string;
}

const waitingUsers: UserData[] = [];
const activeSessions = new Map<string, string>(); // Map<socketId, partnerSocketId>

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-chat', ({ name }: { name: string }) => {
    if (waitingUsers.some(user => user.socket.id === socket.id)) return;
    waitingUsers.push({ socket, name });

    if (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift()!;
      const user2 = waitingUsers.shift()!;
      
      activeSessions.set(user1.socket.id, user2.socket.id);
      activeSessions.set(user2.socket.id, user1.socket.id);

      const callDuration = 300; // 5 minutes in seconds

      user1.socket.emit('matched', { partner: { id: user2.socket.id, name: user2.name }, duration: callDuration });
      user2.socket.emit('matched', { partner: { id: user1.socket.id, name: user1.name }, duration: callDuration });
    } else {
      socket.emit('waiting');
    }
  });

  socket.on('send-chat-message', (data: { to: string, message: string }) => {
    io.to(data.to).emit('receive-chat-message', { message: data.message });
  });

  // Call invitation flow
  socket.on('outgoing-call', (data: { to: string; from: { id: string, name: string }, signal: any }) => {
    io.to(data.to).emit('incoming-call', { from: data.from, signal: data.signal });
  });

  socket.on('call-accepted', (data: { to: string, signal: any }) => {
    io.to(data.to).emit('call-accepted', { signal: data.signal });
  });

  socket.on('call-declined', (data: { to: string }) => {
    io.to(data.to).emit('call-declined');
  });
  
  // WebRTC ICE candidates
  socket.on('ice-candidate', (data: { to: string, candidate: any }) => {
      io.to(data.to).emit('ice-candidate', data.candidate);
  });

  const cleanupSession = () => {
    const partnerId = activeSessions.get(socket.id);
    if (partnerId) {
        io.to(partnerId).emit('partner-disconnected');
        activeSessions.delete(partnerId);
    }
    activeSessions.delete(socket.id);
    const index = waitingUsers.findIndex(user => user.socket.id === socket.id);
    if (index !== -1) waitingUsers.splice(index, 1);
  };
  
  socket.on('leave-session', cleanupSession);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    cleanupSession();
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.io TypeScript server running on port ${PORT}`);
});