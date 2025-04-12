const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testLogin = async () => {
  try {
    console.log('Testing login functionality...'.yellow);
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (!adminUser) {
      console.log('Admin user not found!'.red);
      process.exit(1);
    }
    
    console.log(`Found admin user: ${adminUser.name}`.green);
    console.log(`Password hash: ${adminUser.password}`.cyan);
    
    // Test password match
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);
    
    if (isMatch) {
      console.log(`Password '${testPassword}' matches!`.green);
    } else {
      console.log(`Password '${testPassword}' does NOT match!`.red);
      
      // Create a new hash for comparison
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(testPassword, salt);
      console.log(`New hash for '${testPassword}': ${newHash}`.yellow);
    }
    
    // Test JWT token generation
    const token = adminUser.getSignedJwtToken();
    console.log(`Generated JWT token: ${token}`.cyan);
    
    console.log('Login test completed!'.green);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Run the function
testLogin();
