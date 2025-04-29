const ErrorResponse = require('./errorResponse');

class WebRTCHandler {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // Store active call rooms
    this.peers = new Map(); // Store peer connections
  }

  // Initialize WebRTC handlers
  initialize() {
    this.io.on('connection', (socket) => {
      this.handleCallSignaling(socket);
    });
  }

  // Handle WebRTC signaling
  handleCallSignaling(socket) {
    // Handle call offer
    socket.on('call:offer', async (data) => {
      try {
        const { receiverId, sdp, type } = data;
        const receiverSocket = this.getReceiverSocket(receiverId);
        
        if (!receiverSocket) {
          socket.emit('call:error', { message: 'User is offline' });
          return;
        }

        // Create a unique room for the call
        const roomId = `${socket.user._id}-${receiverId}-${Date.now()}`;
        
        // Store room information
        this.rooms.set(roomId, {
          caller: socket.user._id,
          receiver: receiverId,
          type,
          startTime: Date.now()
        });

        // Join the room
        socket.join(roomId);

        // Send offer to receiver
        receiverSocket.emit('call:incoming', {
          callerId: socket.user._id,
          callerName: socket.user.name,
          roomId,
          type,
          sdp
        });

      } catch (error) {
        console.error('Call offer error:', error);
        socket.emit('call:error', { message: 'Failed to initiate call' });
      }
    });

    // Handle call answer
    socket.on('call:answer', (data) => {
      try {
        const { roomId, sdp, accepted } = data;
        const room = this.rooms.get(roomId);

        if (!room) {
          socket.emit('call:error', { message: 'Call room not found' });
          return;
        }

        if (accepted) {
          // Join room and send answer to caller
          socket.join(roomId);
          this.io.to(roomId).emit('call:answered', { sdp });
        } else {
          // Handle call rejection
          this.handleCallRejection(roomId, socket.user._id);
        }

      } catch (error) {
        console.error('Call answer error:', error);
        socket.emit('call:error', { message: 'Failed to answer call' });
      }
    });

    // Handle ICE candidates
    socket.on('call:ice-candidate', (data) => {
      try {
        const { roomId, candidate } = data;
        socket.to(roomId).emit('call:ice-candidate', { candidate });
      } catch (error) {
        console.error('ICE candidate error:', error);
      }
    });

    // Handle call end
    socket.on('call:end', (data) => {
      try {
        const { roomId } = data;
        this.handleCallEnd(roomId, socket.user._id);
      } catch (error) {
        console.error('Call end error:', error);
      }
    });

    // Handle media stream changes
    socket.on('call:media-state', (data) => {
      try {
        const { roomId, video, audio } = data;
        socket.to(roomId).emit('call:media-state', { userId: socket.user._id, video, audio });
      } catch (error) {
        console.error('Media state change error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        // End any active calls for this user
        this.handleUserDisconnection(socket.user._id);
      } catch (error) {
        console.error('Disconnect handling error:', error);
      }
    });
  }

  // Helper methods
  getReceiverSocket(receiverId) {
    const receiverSocket = Array.from(this.io.sockets.sockets.values())
      .find(s => s.user && s.user._id.toString() === receiverId.toString());
    return receiverSocket;
  }

  handleCallRejection(roomId, userId) {
    try {
      const room = this.rooms.get(roomId);
      if (room) {
        this.io.to(roomId).emit('call:rejected', { userId });
        this.cleanupCall(roomId);
      }
    } catch (error) {
      console.error('Call rejection error:', error);
    }
  }

  handleCallEnd(roomId, userId) {
    try {
      const room = this.rooms.get(roomId);
      if (room) {
        this.io.to(roomId).emit('call:ended', { userId });
        this.cleanupCall(roomId);
      }
    } catch (error) {
      console.error('Call end error:', error);
    }
  }

  handleUserDisconnection(userId) {
    try {
      // Find and end all calls involving this user
      for (const [roomId, room] of this.rooms.entries()) {
        if (room.caller === userId || room.receiver === userId) {
          this.handleCallEnd(roomId, userId);
        }
      }
    } catch (error) {
      console.error('User disconnection error:', error);
    }
  }

  cleanupCall(roomId) {
    try {
      // Remove room data
      this.rooms.delete(roomId);
      
      // Remove peer connections
      if (this.peers.has(roomId)) {
        this.peers.delete(roomId);
      }
    } catch (error) {
      console.error('Call cleanup error:', error);
    }
  }

  // Get active call statistics
  getCallStats() {
    return {
      activeCalls: this.rooms.size,
      activeConnections: this.peers.size,
      rooms: Array.from(this.rooms.entries()).map(([roomId, room]) => ({
        roomId,
        ...room,
        duration: Math.floor((Date.now() - room.startTime) / 1000)
      }))
    };
  }
}

module.exports = WebRTCHandler;
