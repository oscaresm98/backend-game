const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const morgan = require('morgan')

// Import routes
const dealRoutes = require('./routes/dealRoutes');
const userRoutes = require('./routes/userRoutes');

// Import cron job
const priceUpdateJob = require('./cron/priceUpdateJob');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(morgan('dev'));

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/deals', dealRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Schedule cron job to run every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('Running price update job');
  priceUpdateJob.updatePrices();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;