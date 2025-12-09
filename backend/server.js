const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection via Mongoose
mongoose.set('strictQuery', true);
let mongoConnected = false;

mongoose
  .connect(process.env.MONGO_URI || process.env.atlas_URL)
  .then(() => {
    console.log('MongoDB connected');
    mongoConnected = true;
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.warn('Server will continue without MongoDB. Conversion history will not be saved.');
    mongoConnected = false;
  });

// Simple conversion schema/model
const conversionSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  result: Number,
  date: { type: Date, default: Date.now }
});
const Conversion = mongoose.model('Conversion', conversionSchema);

// Route to get exchange rates
app.get('/api/rates', async (req, res) => {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${req.query.base}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Route to save conversion history
app.post('/api/convert', async (req, res) => {
  try {
    if (!mongoConnected) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { from, to, amount, result } = req.body;
    
    // Validate required fields
    if (!from || !to || amount === undefined || result === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const conversion = new Conversion({ from, to, amount, result });
    await conversion.save();
    res.json({ message: 'Conversion saved' });
  } catch (error) {
    console.error('Error saving conversion:', error);
    res.status(500).json({ error: 'Failed to save conversion', details: error.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
