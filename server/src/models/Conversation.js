const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'group';
    }
  },
  groupAdmin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'group';
    }
  },
  groupAvatar: {
    type: String,
    default: function() {
      return this.type === 'group' ? 'default-group.png' : undefined;
    }
  },
  lastMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  muted: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    until: Date
  }],
  pinnedBy: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ createdAt: -1 });

// Virtual populate messages
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation'
});

// Middleware to handle group conversation validation
conversationSchema.pre('save', function(next) {
  if (this.type === 'group') {
    if (!this.name) {
      next(new Error('Group name is required for group conversations'));
    }
    if (!this.groupAdmin) {
      next(new Error('Group admin is required for group conversations'));
    }
    if (this.participants.length < 2) {
      next(new Error('Group conversations must have at least 2 participants'));
    }
  } else {
    if (this.participants.length !== 2) {
      next(new Error('Private conversations must have exactly 2 participants'));
    }
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
