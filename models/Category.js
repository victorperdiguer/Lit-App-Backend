const mongoose = require('mongoose');

//model for category to ease adding new ones
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Category', categorySchema);