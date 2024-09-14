const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const mongoURI = 'mongodb+srv://Test01:Test01@test01.15ns7.mongodb.net/mystore?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const potentialPaths = [
  path.join(__dirname, '../../frontend/index.html'),
  path.join(__dirname, '../../../index.html'),
  path.join(__dirname, '../../index.html'),
];

let html;
for (const filePath of potentialPaths) {
  if (fs.existsSync(filePath)) {
    html = fs.readFileSync(filePath, 'utf8');
    console.log(`Found index.html at: ${filePath}`);
    break;
  }
}

if (!html) {
  console.error('Could not find index.html file. Please ensure the file exists in one of the expected locations.');
  process.exit(1);
}

const $ = cheerio.load(html);

async function populateDatabase() {
  try {
    await Product.deleteMany({}); 

    const products = [];
    $('.product-card').each((i, elem) => {
      const name = $(elem).find('.card-title').text().trim();
      const price = parseFloat($(elem).find('.card-price').attr('value'));
      const image1 = $(elem).find('.img-cover.default').attr('src');
      const image2 = $(elem).find('.img-cover.hover').attr('src');

      if (name && price && image1 && image2) {
        products.push({ name, price, image1, image2 });
      } else {
        console.warn(`Skipped a product due to missing data: ${name || 'Unknown'}`);
      }
    });

    for (const product of products) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`Saved product: ${product.name}`);
    }

    console.log('Database population complete');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

populateDatabase();
