// food-ordering-backend/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Loads environment variables from .env file

// Initialize Express App
const app = express();
// Render will provide the PORT environment variable; use 3000 for local dev
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); // Parses incoming JSON requests into req.body

// CORS Configuration: Allows frontend (running on different origin) to access this backend
app.use(cors({
  origin: [
    'http://localhost:5001', // The Vue.js frontend's local development URL
    // *** IMPORTANT: When deploying frontend, add its production URL here.
   
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods for cross-origin requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers (e.g., for JWT tokens)
}));

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error: ', err));

// --- Import Mongoose Models ---
const Menu = require(__dirname + '/models/Menu'); // <--- updated
const User = require(__dirname + '/models/User'); // <--- updated

// --- Basic Route (for testing server status) ---
// Access this in your browser: http://localhost:3000/
app.get('/', (req, res) => {
  res.send('Food Ordering Backend API is running!');
});

// --- API Routes ---

// @route   GET /api/all-menus
// @desc    Get all menu items
// @access  Public
app.get('/api/all-menus', async (req, res) => {
  try {
    const menus = await Menu.find({}); // Fetch all menus from the database
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Server error fetching menus.' });
  }
});

// @route   POST /api/register
// @desc    Register a new user
// @access  Public
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const newUser = new User({ username, email, password }); // Password will be hashed by pre-save hook in model
    await newUser.save(); // Save the new user to the database

    res.status(201).json({
      message: 'User registered successfully!',
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @route   POST /api/login
// @desc    Authenticate user & get user info (or token in real app)
// @access  Public
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (email not found).' });
    }

    // Use the matchPassword method defined in the User model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (incorrect password).' });
    }

    
    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    
    res.status(200).json({
      message: 'Logged in successfully!',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });


  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});


app.post('/api/menus', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const newMenuItem = new Menu({ name, description, price, category, imageUrl });
    await newMenuItem.save();

    res.status(201).json({
      message: 'Menu item added successfully!',
      menuItem: newMenuItem
    });

  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ message: 'Server error adding menu item.' });
  }
});

// @route   GET /api/menus/:id
// @desc    Get a single menu item by ID
// @access  Public
app.get('/api/menus/:id', async (req, res) => {
  try {
  const menuItem = await Menu.findById(req.params.id);
  
       if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found.' });
      }
  
      res.status(200).json(menuItem);
    } catch (error) {
      console.error('Error fetching single menu item:', error);
      res.status(500).json({ message: 'Server error fetching menu item.' });
    }
  });
  
  // @route   PUT /api/menus/:id
  // @desc    Update a menu item by ID
  // @access  (In a real app, this would require authentication & admin role)
  app.put('/api/menus/:id', async (req, res) => {
    try {
      const { name, description, price, category, imageUrl } = req.body;
  
      const updatedMenuItem = await Menu.findByIdAndUpdate(
        req.params.id,
        { name, description, price, category, imageUrl },
        { new: true, runValidators: true } // `new: true` returns the updated doc, `runValidators` runs schema validators
      );
  
      if (!updatedMenuItem) {
        return res.status(404).json({ message: 'Menu item not found for update.' });
      }
  
      res.status(200).json({
        message: 'Menu item updated successfully!',
        menuItem: updatedMenuItem
      });
  
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: 'Server error updating menu item.' });
    }
  });
  
  // @route   DELETE /api/menus/:id
  // @desc    Delete a menu item by ID
  // @access  (In a real app, this would require authentication & admin role)
  app.delete('/api/menus/:id', async (req, res) => {
    try {
      const deletedMenuItem = await Menu.findByIdAndDelete(req.params.id);
  
      if (!deletedMenuItem) {
        return res.status(404).json({ message: 'Menu item not found for deletion.' });
      }
  
      res.status(200).json({ message: 'Menu item deleted successfully!' });
  
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: 'Server error deleting menu item.' });
    }
  });
  
  // --- Start Server ---
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })