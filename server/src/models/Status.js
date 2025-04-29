const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  mediaUrl: {
    type: String,
    required: function() {
      return ['image', 'video'].includes(this.type);
    }
  },
  caption: {
    type: String
  },
  backgroundColor: {
    type: String,
    required: function() {
      return this.type === 'text';
    },
    default: '#000000'
  },
  font: {
    type: String,
    required: function() {
      return this.type === 'text';
    },
    default: 'Arial'
  },
  viewers: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  privacy: {
    type: String,
    enum: ['all', 'contacts', 'specific'],
    default: 'all'
  },
  visibleTo: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  hiddenFrom: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // Status expires after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
statusSchema.index({ user: 1, createdAt: -1 });
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Virtual for checking if status is expired
statusSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

// Virtual for getting view count
statusSchema.virtual('viewCount').get(function() {
  return this.viewers.length;
});

// Method to check if a user can view the status
statusSchema.methods.canView = function(userId) {
  if (this.privacy === 'all') {
    return !this.hiddenFrom.includes(userId);
  }
  if (this.privacy === 'contacts') {
    return this.user.contacts.includes(userId) && !this.hiddenFrom.includes(userId);
  }
  if (this.privacy === 'specific') {
    return this.visibleTo.includes(userId);
  }
  return false;
};

module.exports = mongoose.model('Status', statusSchema);
