const mongoose = require('mongoose');

//model for category to ease adding new ones
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, { timestamps: true })

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;