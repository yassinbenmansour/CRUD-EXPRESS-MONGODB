const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/my_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Schema and Model
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String
});
const Item = mongoose.model('Item', ItemSchema);

// CRUD Routes
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/items', async (req, res) => {
  const item = new Item({
    name: req.body.name,
    description: req.body.description
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/items/:id', getItem, (req, res) => {
  res.json(res.item);
});

app.patch('/items/:id', getItem, async (req, res) => {
  if (req.body.name != null) {
    res.item.name = req.body.name;
  }
  if (req.body.description != null) {
    res.item.description = req.body.description;
  }
  try {
    const updatedItem = await res.item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/items/:id', getItem, async (req, res) => {
  try {
    await res.item.remove();
    res.json({ message: 'Deleted Item' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Cannot find item' });
    }
    res.item = item;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
