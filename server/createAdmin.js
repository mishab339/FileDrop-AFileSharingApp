const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const createAdmin = async () => {
  try {
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('\n=== Admin User Management ===\n');
      console.log('Usage:');
      console.log('  node createAdmin.js <email>              - Make existing user admin');
      console.log('  node createAdmin.js <email> <password>   - Create new admin user');
      console.log('  node createAdmin.js list                 - List all admin users\n');
      process.exit(0);
    }

    // List all admins
    if (args[0] === 'list') {
      const admins = await User.find({ role: 'admin' }).select('name email createdAt');
      if (admins.length === 0) {
        console.log('\nNo admin users found.\n');
      } else {
        console.log('\n=== Admin Users ===\n');
        admins.forEach(admin => {
          console.log(`Name: ${admin.name}`);
          console.log(`Email: ${admin.email}`);
          console.log(`Created: ${admin.createdAt}`);
          console.log('---');
        });
      }
      process.exit(0);
    }

    const email = args[0];
    const password = args[1];

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser && !password) {
      // Make existing user an admin
      if (existingUser.role === 'admin') {
        console.log(`\n✓ User ${email} is already an admin.\n`);
      } else {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`\n✓ Successfully upgraded ${email} to admin role!\n`);
      }
    } else if (!existingUser && password) {
      // Create new admin user
      const name = email.split('@')[0]; // Use email prefix as name
      
      const newAdmin = await User.create({
        name: name,
        email: email,
        password: password,
        role: 'admin',
        isEmailVerified: true, // Auto-verify admin
        maxStorage: 50 * 1024 * 1024 * 1024 // 50GB for admin
      });

      console.log(`\n✓ Successfully created admin user!\n`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`\nYou can now login with these credentials.\n`);
    } else if (existingUser && password) {
      console.log(`\n✗ User with email ${email} already exists.`);
      console.log(`Use without password to upgrade existing user to admin.\n`);
    } else {
      console.log(`\n✗ User with email ${email} not found.`);
      console.log(`Provide a password to create a new admin user.\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
