const nodemailer = require('nodemailer');
const { User, Game } = require('../models/user');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send price alert email
exports.sendPriceAlert = async (user, game, oldPrice, newPrice) => {
  try {
    const savings = ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `🎮 Price Alert: ${game.title} is now ${newPrice}€ (${savings}% off)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Price Alert: ${game.title}</h2>
          <p>Good news! A game on your wishlist is now on sale:</p>
          
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <img src="${game.thumb}" alt="${game.title}" style="max-width: 200px; display: block; margin: 0 auto 15px;">
            <h3>${game.title}</h3>
            <p><strong>Previous price:</strong> ${oldPrice}€</p>
            <p><strong>Current price:</strong> ${newPrice}€</p>
            <p><strong>You save:</strong> ${savings}%</p>
            <p><strong>Store:</strong> ${getStoreName(game.cheapestPrice.storeID)}</p>
          </div>
          
          <p>Happy gaming!</p>
          <p>Your Game Deals Tracker</p>
          
          <p style="font-size: 12px; color: #777; margin-top: 30px;">
            If you no longer wish to receive these alerts, you can remove the game from your wishlist.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Price alert email sent to ${user.email} for ${game.title}`);
    
    // Mark alert as sent
    game.alertSent = true;
    await game.save();
    
    return true;
  } catch (error) {
    console.error('Error sending price alert email:', error);
    return false;
  }
};

// Helper function to get store name
function getStoreName(storeID) {
  const stores = {
    1: 'Steam',
    2: 'GamersGate',
    3: 'GreenManGaming',
    4: 'Amazon',
    5: 'GameStop',
    6: 'Direct2Drive',
    7: 'GOG',
    8: 'Origin',
    9: 'Get Games',
    10: 'Shiny Loot',
    11: 'Humble Store',
    12: 'Desura',
    13: 'Uplay',
    14: 'IndieGameStand',
    15: 'Fanatical',
    16: 'Gamesrocket',
    17: 'Games Republic',
    18: 'SilaGames',
    19: 'Playfield',
    20: 'ImperialGames',
    21: 'WinGameStore',
    22: 'FunStockDigital',
    23: 'GameBillet',
    24: 'Voidu',
    25: 'Epic Games Store',
    26: 'Razer Game Store',
    27: 'Gamesplanet',
    28: 'Gamesload',
    29: '2Game',
    30: 'IndieGala',
    31: 'Blizzard Shop',
    32: 'AllYouPlay',
    33: 'DLGamer',
    34: 'Noctre',
    35: 'DreamGame'
  };
  
  return stores[storeID] || 'Unknown Store';
}