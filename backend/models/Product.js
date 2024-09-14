const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image1: String, 
  image2: String  
});

module.exports = mongoose.model('Product', productSchema);
