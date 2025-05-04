// cron/priceUpdateJob.js
const { Game, User } = require('../models/index');
const cheapSharkService = require('../services/cheapSharkService');
const emailService = require('../services/emailService');
const priceCompare = require('../utils/priceCompare');

// Update prices for all games
exports.updatePrices = async () => {
  try {
    console.log('Starting price update job...');
    
    // Get all games from database
    const games = await Game.find();
    
    // Track stats
    let updatedGames = 0;
    let priceDrops = 0;
    let emailsSent = 0;
    
    // Process each game
    for (const game of games) {
      try {
        // Skip games without steamAppID
        if (!game.steamAppID) continue;
        
        // Get updated game info from CheapShark
        const updatedGameInfo = await cheapSharkService.getGameDetails(game.steamAppID);
        
        if (!updatedGameInfo) continue;
        
        // Get old prices for comparison
        const oldCheapestPrice = game.cheapestPrice ? game.cheapestPrice.price : null;
        
        // Update game info
        game.title = updatedGameInfo.title;
        game.thumb = updatedGameInfo.thumb;
        game.stores = updatedGameInfo.stores;
        game.cheapestPrice = updatedGameInfo.cheapestPrice;
        game.lastUpdated = new Date();
        
        // Reset alert status if price changed significantly
        if (oldCheapestPrice && game.cheapestPrice) {
          const priceChanged = priceCompare.isPriceDropSignificant(
            oldCheapestPrice, 
            game.cheapestPrice.price
          );
          
          if (priceChanged) {
            game.alertSent = false;
            priceDrops++;
          }
        }
        
        // Save updated game
        await game.save();
        updatedGames++;
        
        // Send alerts if price dropped and alert not sent yet
        if (oldCheapestPrice && 
            game.cheapestPrice && 
            game.cheapestPrice.price < oldCheapestPrice && 
            !game.alertSent) {
          
          // Find users who have this game in their wishlist
          const users = await User.find({ wishlist: game.steamAppID });
          
          // Send email to each user
          for (const user of users) {
            const emailSent = await emailService.sendPriceAlert(
              user, 
              game, 
              oldCheapestPrice, 
              game.cheapestPrice.price
            );
            
            if (emailSent) emailsSent++;
          }
        }
      } catch (gameError) {
        console.error(`Error processing game ${game.title}:`, gameError);
        continue; // Skip to next game on error
      }
    }
    
    // Fetch new deals to add to database
    const newDeals = await cheapSharkService.fetchDeals(30);
    
    // Add new games that don't exist in database
    for (const deal of newDeals) {
      await Game.findOneAndUpdate(
        { steamAppID: deal.steamAppID },
        deal,
        { upsert: true, new: true }
      );
    }
    
    console.log(`Price update job completed:
      - Updated ${updatedGames} games
      - Found ${priceDrops} price drops
      - Sent ${emailsSent} alert emails
    `);
    
    return {
      updatedGames,
      priceDrops,
      emailsSent
    };
  } catch (error) {
    console.error('Price update job failed:', error);
    throw error;
  }
};