import http from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your app's URL
  }
});

// --- For 1:1 Matchmaking ---
interface UserData {
  socket: Socket;
  name: string;
}
const waitingUsers: UserData[] = [];

// --- For Group Chat ---
interface GroupMessage {
    groupId: string;
    sender: { id: string; name: string };
    text: string;
}
// Store online users for each group
const groupRooms = new Map<string, Map<string, { id: string; name: string }>>();

// --- NEW HELPER FUNCTION ---
// This function calculates and broadcasts counts for ALL groups to ALL clients.
const broadcastAllGroupCounts = () => {
  const allGroupCounts = Array.from(groupRooms.entries()).map(([groupId, users]) => ({
    groupId,
    onlineCount: users.size,
    onlineUsers: Array.from(users.values()), // Sending user details as well
  }));
  io.emit('update-all-group-counts', allGroupCounts);
};


io.on('connection', (socket: Socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // --- ADD THIS ---
  // Send the initial group counts to the newly connected client
  broadcastAllGroupCounts();


  // --- LOGIC FOR 1:1 MATCHMAKING (no changes needed here) ---
  socket.on('join-chat', ({ name }: { name: string }) => {
    console.log(`➡️  User '${name}' (${socket.id}) is looking for a 1:1 partner.`);
    if (waitingUsers.some(user => user.socket.id === socket.id)) return;
    
    waitingUsers.push({ socket, name });

    if (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift()!;
      const user2 = waitingUsers.shift()!;
      const roomName = uuidv4();
      const duration = 120; // 2 minutes

      console.log(`🎉 Matched 1:1 -> '${user1.name}' and '${user2.name}'`);
      user1.socket.emit('matched', { partner: { id: user2.socket.id, name: user2.name }, roomName, duration });
      user2.socket.emit('matched', { partner: { id: user1.socket.id, name: user1.name }, roomName, duration });
    } else {
      console.log(`⏳ User '${name}' is now waiting for a 1:1 partner.`);
      socket.emit('waiting');
    }
  });

  // --- MODIFIED: LOGIC FOR GROUP CHAT ---
  socket.on('join-group', ({ groupId, user }: { groupId: string; user: { id: string, name: string } }) => {
    socket.join(groupId);
    if (!groupRooms.has(groupId)) groupRooms.set(groupId, new Map());
    
    const roomUsers = groupRooms.get(groupId)!;
    roomUsers.set(socket.id, user);
    
    console.log(`User ${user.name} joined group ${groupId}. Size: ${roomUsers.size}`);
    // Emit to the specific group who is online
    io.to(groupId).emit('update-online-users', Array.from(roomUsers.values()));

    // --- ADD THIS ---
    // Broadcast updated counts to everyone
    broadcastAllGroupCounts();
  });

  socket.on('send-group-message', (message: GroupMessage) => {
    socket.to(message.groupId).emit('receive-group-message', message);
  });

  socket.on('start-group-voice-chat', ({ groupId }: { groupId: string }) => {
    const initiator = groupRooms.get(groupId)?.get(socket.id);
    console.log(`🎤 User ${initiator?.name || socket.id} is entering voice chat for group: ${groupId}`);
    
    const livekitRoomName = groupId;

    socket.emit('group-voice-chat-started', { livekitRoomName });
  });

  // --- MODIFIED: DISCONNECTION LOGIC ---
  const cleanup = () => {
    // Clean up from 1:1 waiting queue
    const index = waitingUsers.findIndex(u => u.socket.id === socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
      console.log(`🧹 Removed ${socket.id} from 1:1 waiting queue.`);
    }

    // --- MODIFICATION START ---
    let needsBroadcast = false;
    // Clean up from any group rooms
    groupRooms.forEach((users, groupId) => {
        if(users.has(socket.id)){
            const user = users.get(socket.id)!;
            users.delete(socket.id);
            io.to(groupId).emit('update-online-users', Array.from(users.values()));
            console.log(`User ${user.name} left group ${groupId} due to disconnect.`);
            needsBroadcast = true;
        }
    });

    if (needsBroadcast) {
      broadcastAllGroupCounts();
    }
    // --- MODIFICATION END ---
  };

  socket.on('leave-group', ({ groupId, user }) => {
    socket.leave(groupId);
    if (groupRooms.has(groupId)) {
        const roomUsers = groupRooms.get(groupId)!;
        roomUsers.delete(socket.id);
        io.to(groupId).emit('update-online-users', Array.from(roomUsers.values()));
        // --- ADD THIS ---
        broadcastAllGroupCounts();
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    cleanup();
  });
});

const PORT = process.env.PORT || 4000; 
server.listen(PORT, () => {
  console.log(`🚀 Real-time server is live on port ${PORT}`);
});