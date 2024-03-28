const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// connection to MongoDB
mongoose.connect('mongodb://localhost:27017/my_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// definition de collection 
const Dataschema = new mongoose.Schema({
  id: String,
  equipe: String,
  country:String
});
const Data = mongoose.model('Data', Dataschema);

// endpoint


//Get all data 

app.get('/datas', async (req, res) => {
  try {
    const datas = await Data.find();
    res.json(datas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//insert data
app.post('/datas', async (req, res) => {
  const data = new Data({
    id: req.body.id,
    equipe: req.body.equipe,
    country: req.body.country
  });

  try {
    const newItem = await data.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


//get specific data 
app.get('/datas/:id', getItem, (req, res) => {
  res.json(res.item);
});


//UPDATE DATAA 
app.patch('/datas/:id', getItem, async (req, res) => {
  if (req.body.equipe != null) {
    res.item.equipe = req.body.equipe;
  }
  if (req.body.country != null) {
    res.item.country = req.body.country;
  }
  try {
    const updatedItem = await res.item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//DELETE DATA

app.delete('/datas/:id', getItem, async (req, res) => {
  try {
    await res.item.remove();
    res.json({ message: 'Deleted Data' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getItem(req, res, next) {
  try {
    const item = await Data.findById(req.params.id);
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
