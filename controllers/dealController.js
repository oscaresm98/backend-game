const { Game } = require('../models/user');
const cheapSharkService = require('../services/cheapSharkService');

// Get all deals
exports.getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Get deals from database or fetch from CheapShark
    let games = await Game.find()
      .sort({ 'cheapestPrice.price': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // If no games in database, fetch from CheapShark
    if (games.length === 0) {
      const deals = await cheapSharkService.fetchDeals();
      
      // Save deals to database
      await Game.insertMany(deals);
      
      games = deals;
    }

    // Get total count for pagination
    const count = await Game.countDocuments();
    
    res.json({
      games,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search games
exports.searchGames = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    // Search games in database
    const games = await Game.find({ 
      title: { $regex: title, $options: 'i' } 
    }).limit(20);
    
    // If not enough results, fetch from CheapShark API
    if (games.length < 5) {
      const searchResults = await cheapSharkService.searchGames(title);
      
      // Save new games to database if they don't exist
      for (const game of searchResults) {
        await Game.findOneAndUpdate(
          { steamAppID: game.steamAppID },
          game,
          { upsert: true, new: true }
        );
      }
      
      // Return combined results
      const updatedGames = await Game.find({ 
        title: { $regex: title, $options: 'i' } 
      }).limit(20);
      
      return res.json(updatedGames);
    }
    
    res.json(games);
  } catch (error) {
    console.error('Search games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};