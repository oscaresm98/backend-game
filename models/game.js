const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    steamAppID: {
      type: Number,
      required: true,
      unique: true
    },
    thumb: String,
    stores: [{
      storeID: Number,
      storeName: String,
      currentPrice: Number,
      regularPrice: Number,
      savings: Number,
      lastUpdate: Date
    }],
    cheapestPrice: {
      price: Number,
      storeID: Number
    },
    alertSent: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  });
  
  const Game = mongoose.model('Game', GameSchema);
  
  module.exports = {
    Game
  };
