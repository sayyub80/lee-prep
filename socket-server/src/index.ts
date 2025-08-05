import http from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

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

io.on('connection', (socket: Socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on('join-chat', ({ name }: { name: string }) => {
    console.log(`➡️  User '${name}' (${socket.id}) is looking for a partner.`);
    
    // Prevent user from joining the queue twice
    if (waitingUsers.some(user => user.socket.id === socket.id)) return;
    
    waitingUsers.push({ socket, name });

    // If we have at least two users, match them
    if (waitingUsers.length >= 2) {
      console.log(`🎉 Found a match! Creating session...`);
      const user1 = waitingUsers.shift()!;
      const user2 = waitingUsers.shift()!;
      
      const roomName = uuidv4();
      const duration = 120; // 2 minutes

      // Notify both users they are matched
      user1.socket.emit('matched', { partner: { id: user2.socket.id, name: user2.name }, roomName, duration });
      user2.socket.emit('matched', { partner: { id: user1.socket.id, name: user1.name }, roomName, duration });

      console.log(`✅ Matched '${user1.name}' and '${user2.name}' in room ${roomName}`);
    } else {
      console.log(`⏳ User '${name}' is now waiting. Queue size: 1`);
      socket.emit('waiting');
    }
  });

  const handleDisconnect = () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    const index = waitingUsers.findIndex(user => user.socket.id === socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
      console.log(`🧹 Removed ${socket.id} from waiting queue.`);
    }
  };

  socket.on('disconnect', handleDisconnect);
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io Server running on port ${PORT}`);
});