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
mongoose
  .connect(process.env.MONGO_URI || process.env.atlas_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
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
  const { from, to, amount, result } = req.body;
  const conversion = new Conversion({ from, to, amount, result });
  await conversion.save();
  res.json({ message: 'Conversion saved' });
});

app.listen(5000, () => console.log('Server running on port 5000'));