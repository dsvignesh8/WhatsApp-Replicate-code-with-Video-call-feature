const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Call = require('../models/Call');
const WebRTCHandler = require('../utils/webRTC');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.webRTC = new WebRTCHandler(io);
  }

  initialize() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      this.handleMessaging(socket);
      this.handlePresence(socket);
      this.handleTyping(socket);
      this.handleDisconnection(socket);
    });

    // Initialize WebRTC handler
    this.webRTC.initialize();
  }

  handleConnection(socket) {
    const userId = socket.user._id.toString();
    this.connectedUsers.set(userId, socket.id);
    
    // Update user's online status
    User.findByIdAndUpdate(userId, { 
      online: true,
      lastSeen: Date.now()
    }).exec();

    // Notify user's contacts about online status
    this.broadcastUserStatus(userId, true);

    // Join user to their conversation rooms
    Conversation.find({ participants: userId })
      .select('_id')
      .exec()
      .then(conversations => {
        conversations.forEach(conv => {
          socket.join(`conversation:${conv._id}`);
        });
      });
  }

  handleMessaging(socket) {
    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content, type = 'text', replyTo } = data;
        
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          content,
          type,
          replyTo
        });

        await message.populate('sender', 'name avatar');
        
        // Emit to conversation room
        this.io.to(`conversation:${conversationId}`).emit('message:new', message);
        
        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          $inc: { 'unreadCount.$[elem].count': 1 }
        }, {
          arrayFilters: [{ 
            'elem.user': { 
              $ne: socket.user._id 
            }
          }]
        });

        // Send push notification to offline users
        const conversation = await Conversation.findById(conversationId)
          .populate('participants', 'name');
        
        conversation.participants.forEach(participant => {
          if (participant._id.toString() !== socket.user._id.toString()) {
            const recipientSocket = this.connectedUsers.get(participant._id.toString());
            if (!recipientSocket) {
              // User is offline, send push notification
              // Implementation depends on your push notification service
            }
          }
        });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Message status updates
    socket.on('message:status', async (data) => {
      try {
        const { messageId, status } = data;
        
        const message = await Message.findByIdAndUpdate(messageId, 
          { status },
          { new: true }
        );

        this.io.to(`conversation:${message.conversation}`).emit('message:status_update', {
          messageId,
          status
        });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Message deletion
    socket.on('message:delete', async (data) => {
      try {
        const { messageId, deleteForEveryone } = data;
        
        const message = await Message.findById(messageId);
        
        if (!message) {
          throw new Error('Message not found');
        }

        if (deleteForEveryone && message.sender.toString() === socket.user._id.toString()) {
          await message.remove();
          this.io.to(`conversation:${message.conversation}`).emit('message:deleted', {
            messageId,
            deleteForEveryone
          });
        } else {
          message.deletedFor.push(socket.user._id);
          await message.save();
          socket.emit('message:deleted', {
            messageId,
            deleteForEveryone: false
          });
        }
      } catch (error) {
        socket.emit('error', error.message);
      }
    });
  }

  handlePresence(socket) {
    socket.on('presence:update', async (data) => {
      try {
        const { status } = data;
        await User.findByIdAndUpdate(socket.user._id, { status });
        this.broadcastUserStatus(socket.user._id.toString(), true, status);
      } catch (error) {
        socket.emit('error', error.message);
      }
    });
  }

  handleTyping(socket) {
    socket.on('typing:start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        userId: socket.user._id,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        userId: socket.user._id,
        isTyping: false
      });
    });
  }

  handleDisconnection(socket) {
    socket.on('disconnect', async () => {
      const userId = socket.user._id.toString();
      this.connectedUsers.delete(userId);
      
      // Update user's online status
      await User.findByIdAndUpdate(userId, {
        online: false,
        lastSeen: Date.now()
      });

      // Notify user's contacts about offline status
      this.broadcastUserStatus(userId, false);
    });
  }

  broadcastUserStatus(userId, online, status = null) {
    User.findById(userId)
      .select('contacts')
      .exec()
      .then(user => {
        user.contacts.forEach(contactId => {
          const contactSocketId = this.connectedUsers.get(contactId.toString());
          if (contactSocketId) {
            this.io.to(contactSocketId).emit('user:status', {
              userId,
              online,
              status,
              lastSeen: online ? Date.now() : Date.now()
            });
          }
        });
      });
  }
}

module.exports = SocketHandler;
