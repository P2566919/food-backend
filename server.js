// server.js - This is the main backend server file

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000; // Render will provide process.env.PORT

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies

// CORS Configuration: Crucial for allowing your frontend to connect
app.use(cors({
  origin: [
    'http://localhost:5001', // Your Vue.js frontend's development URL
    // When you deploy your frontend, add its production URL here:
    // 'https://your-frontend-app.onrender.com', // Example if deployed to Render
    // 'https://www.your-custom-frontend-domain.com' // Example for a custom domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers (e.g., for JWT tokens)
}));

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Basic Route (for testing server status) ---
app.get('/', (req, res) => {
  res.send('Food Ordering Backend API is running!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- API Routes ---
const Menu = require('./models/Menu'); // Import Menu model
const User = require('./models/User'); // Import User model

// Route to get all menus
app.get('/api/all-menus', async (req, res) => {
  try {
    const menus = await Menu.find(); // Fetch all menus from the database
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Server error fetching menus.' });
  }
});

// Route for user registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // In a real app, you'd hash the password here (e.g., using bcrypt)
    // For simplicity, we'll store it as is for now, but DON'T DO THIS IN PRODUCTION!
    const newUser = new User({ username, email, password });
    await newUser.save(); // Save the new user to the database

    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// You can add more routes here, e.g., for login, adding menu items, etc.
/*
app.post('/api/login', async (req, res) => {
    // Implement login logic here
});

app.post('/api/menus', async (req, res) => {
    // Implement add new menu item logic here (requires authentication/admin check)
});
*/