const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const productsRouter = require('./routes/products');

const app = express();
const port = process.env.PORT || 3000;

const mongoURI = 'mongodb+srv://Test01:Test01@test01.15ns7.mongodb.net/mystore?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

function findFrontendPath() {
  const potentialPaths = [
    path.join(__dirname, '../frontend'),
    path.join(__dirname, 'frontend'),
    path.join(__dirname, '..'), 
    __dirname 
  ];

  for (const dir of potentialPaths) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      console.log(`Found frontend directory at: ${dir}`);
      return dir;
    }
  }

  console.error('Could not find frontend directory with index.html');
  process.exit(1);
}

const frontendPath = findFrontendPath();
app.use(express.static(frontendPath));

app.use('/api/products', productsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});