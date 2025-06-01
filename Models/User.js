// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // This will store the HASHED password
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Optional: User roles
  // Add other user-related fields as needed
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// --- Password Hashing Middleware ---
// This runs before saving a user if the password has been modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // If password is not modified, skip hashing
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Proceed to save
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// --- Method to compare passwords ---
// This method will be available on user instances to compare provided password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);