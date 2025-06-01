const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  // Add other fields as needed
});

module.exports = mongoose.model('Menu', menuSchema);