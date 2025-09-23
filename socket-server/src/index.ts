import http from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your app's URL
  }
});

// --- NEW: Map to track which user ID belongs to which socket connection ---
const userSockets = new Map<string, string>(); // Map<userId, socketId>

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
interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
}
const groupRooms = new Map<string, Map<string, OnlineUser>>();

const broadcastAllGroupCounts = () => {
  const allGroupCounts = Array.from(groupRooms.entries()).map(([groupId, users]) => ({
    groupId,
    onlineCount: users.size,
    onlineUsers: Array.from(users.values()),
  }));
  io.emit('update-all-group-counts', allGroupCounts);
};


io.on('connection', (socket: Socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // --- NEW: Event for a user to identify themselves after connecting ---
  socket.on('authenticate', (userId: string) => {
    if (userId) {
      console.log(`🔗 Authenticating user ${userId} with socket ${socket.id}`);
      userSockets.set(userId, socket.id);
    }
  });

  // --- NEW: Event for an admin to suspend a user in real-time ---
  socket.on('admin:suspend-user', (targetUserId: string) => {
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      console.log(`🚀 Forcing logout for user ${targetUserId} on socket ${targetSocketId}`);
      // Emit a 'force-logout' event directly to that specific user
      io.to(targetSocketId).emit('force-logout', { reason: 'suspended' });
    } else {
      console.log(`⚠️ Could not find active socket for suspended user ${targetUserId}`);
    }
  });


  // --- (Your other socket event listeners for chat, groups, etc. remain the same) ---
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
  
  socket.on('join-group', ({ groupId, user }: { groupId: string; user: OnlineUser }) => {
    if (!user || !user.name) {
      console.error(`❌ Refused to join group: User object is invalid for socket ${socket.id}`, user);
      return; 
    }
    socket.join(groupId);
    if (!groupRooms.has(groupId)) groupRooms.set(groupId, new Map());
    
    const roomUsers = groupRooms.get(groupId)!;
    roomUsers.set(socket.id, user);
    
    io.to(groupId).emit('update-online-users', Array.from(roomUsers.values()));
    broadcastAllGroupCounts();
  });


  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    
    // --- Clean up the userSockets map on disconnect ---
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`🧹 De-authenticated user ${userId} from socket map.`);
        break;
      }
    }

    // --- (Your existing cleanup logic for groups remains the same) ---
    let needsBroadcast = false;
    groupRooms.forEach((users, groupId) => {
        if(users.has(socket.id)){
            users.delete(socket.id);
            io.to(groupId).emit('update-online-users', Array.from(users.values()));
            needsBroadcast = true;
        }
    });

    if (needsBroadcast) {
      broadcastAllGroupCounts();
    }
  });
});

const PORT = process.env.PORT || 4000; 
server.listen(PORT, () => {
  console.log(`🚀 Real-time server is live on port ${PORT}`);
});