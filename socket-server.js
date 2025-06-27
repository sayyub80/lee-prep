const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const ChatSession = require('./src/models/ChatSession').default;
const Message = require('./src/models/Message').default;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const waitingUsers = {
  chat: [],
  voice: []
};

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (mode) => {
    console.log(\`User \${socket.id} wants to join mode: \${mode}\`);
    socket.mode = mode;

    // Check if there is a waiting user for this mode
    if (waitingUsers[mode].length > 0) {
      const partnerSocket = waitingUsers[mode].shift();
      if (partnerSocket.connected) {
        // Notify both users they are matched
        socket.partnerId = partnerSocket.id;
        partnerSocket.partnerId = socket.id;

        // Create a new chat session in DB
        try {
          const chatSession = new ChatSession({
            participants: [socket.id, partnerSocket.id],
            type: mode,
            status: 'active',
            startedAt: new Date(),
          });
          await chatSession.save();
          socket.chatSessionId = chatSession._id;
          partnerSocket.chatSessionId = chatSession._id;
        } catch (err) {
          console.error('Error creating chat session:', err);
        }

        socket.emit('matched', { partnerId: partnerSocket.id, chatSessionId: socket.chatSessionId });
        partnerSocket.emit('matched', { partnerId: socket.id, chatSessionId: partnerSocket.chatSessionId });

        console.log(\`Matched \${socket.id} with \${partnerSocket.id} for mode \${mode}\`);
      } else {
        // Partner disconnected, try again
        socket.emit('waiting');
        waitingUsers[mode].push(socket);
      }
    } else {
      // No waiting user, add this socket to waiting list
      waitingUsers[mode].push(socket);
      socket.emit('waiting');
      console.log(\`User \${socket.id} is waiting for a partner in mode \${mode}\`);
    }
  });

  socket.on('signal', (data) => {
    const { partnerId, signalData } = data;
    const partnerSocket = io.sockets.sockets.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit('signal', { from: socket.id, signalData });
    }
  });

  socket.on('chat-message', async (message) => {
    const partnerSocket = io.sockets.sockets.get(socket.partnerId);
    if (partnerSocket) {
      partnerSocket.emit('chat-message', { from: socket.id, message });
    }
    // Save message to DB
    try {
      if (socket.chatSessionId) {
        const msg = new Message({
          session: socket.chatSessionId,
          sender: socket.id,
          text: message,
          createdAt: new Date(),
        });
        await msg.save();
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    // Remove from waiting list if present
    if (socket.mode && waitingUsers[socket.mode]) {
      waitingUsers[socket.mode] = waitingUsers[socket.mode].filter(s => s.id !== socket.id);
    }
    // Notify partner if connected
    if (socket.partnerId) {
      const partnerSocket = io.sockets.sockets.get(socket.partnerId);
      if (partnerSocket) {
        partnerSocket.emit('partner-disconnected');
        partnerSocket.partnerId = null;
      }
    }
    // Update chat session status to ended
    try {
      if (socket.chatSessionId) {
        await ChatSession.findByIdAndUpdate(socket.chatSessionId, {
          status: 'ended',
          endedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Error updating chat session:', err);
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(\`Socket.io signaling server running on port \${PORT}\`);
});
