const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: './src/config/config.env' });

// Load models
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Status = require('./models/Status');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    avatar: 'default-avatar.png',
    status: 'Available',
    online: false
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'default-avatar.png',
    status: 'Hey there! I am using WhatsApp',
    online: false
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'default-avatar.png',
    status: 'Busy',
    online: false
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
    await Status.deleteMany();

    console.log('Data cleared...');

    // Create users with hashed passwords
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return User.create(user);
      })
    );

    console.log('Users created...');

    // Create conversations
    const conversations = [
      {
        type: 'private',
        participants: [createdUsers[1]._id, createdUsers[2]._id]
      },
      {
        type: 'group',
        name: 'Test Group',
        participants: createdUsers.map(user => user._id),
        groupAdmin: createdUsers[0]._id,
        groupAvatar: 'default-group.png'
      }
    ];

    const createdConversations = await Conversation.create(conversations);
    console.log('Conversations created...');

    // Create messages
    const messages = [
      {
        conversation: createdConversations[0]._id,
        sender: createdUsers[1]._id,
        type: 'text',
        content: 'Hey Jane! How are you?',
        status: 'read'
      },
      {
        conversation: createdConversations[0]._id,
        sender: createdUsers[2]._id,
        type: 'text',
        content: 'Hi John! I\'m good, thanks for asking.',
        status: 'read'
      },
      {
        conversation: createdConversations[1]._id,
        sender: createdUsers[0]._id,
        type: 'text',
        content: 'Welcome to the group everyone!',
        status: 'read'
      }
    ];

    await Message.create(messages);
    console.log('Messages created...');

    // Create statuses
    const statuses = [
      {
        user: createdUsers[1]._id,
        type: 'text',
        content: 'Having a great day!',
        backgroundColor: '#25D366',
        font: 'Arial'
      },
      {
        user: createdUsers[2]._id,
        type: 'text',
        content: 'At work 💼',
        backgroundColor: '#128C7E',
        font: 'Arial'
      }
    ];

    await Status.create(statuses);
    console.log('Statuses created...');

    // Update conversations with last message
    for (const conversation of createdConversations) {
      const lastMessage = await Message.findOne({ conversation: conversation._id })
        .sort('-createdAt');
      
      if (lastMessage) {
        conversation.lastMessage = lastMessage._id;
        await conversation.save();
      }
    }

    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
    await Status.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use correct command:');
  console.log('npm run seed -- -i  (to import data)');
  console.log('npm run seed -- -d  (to delete data)');
  process.exit();
}
