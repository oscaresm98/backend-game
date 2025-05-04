const axios = require('axios');

const CHEAPSHARK_API_URL = 'https://www.cheapshark.com/api/1.0';

// Fetch deals from CheapShark API
exports.fetchDeals = async (limit = 60) => {
  try {
    const response = await axios.get(`${CHEAPSHARK_API_URL}/deals`, {
      params: {
        pageSize: limit,
        sortBy: 'Deal Rating',
        desc: 1
      }
    });

    // Transform data to match our Game model
    return response.data.map(deal => ({
      title: deal.title,
      steamAppID: parseInt(deal.steamAppID) || 0,
      thumb: deal.thumb,
      stores: [{
        storeID: parseInt(deal.storeID),
        storeName: getStoreName(parseInt(deal.storeID)),
        currentPrice: parseFloat(deal.salePrice),
        regularPrice: parseFloat(deal.normalPrice),
        savings: parseFloat(deal.savings),
        lastUpdate: new Date()
      }],
      cheapestPrice: {
        price: parseFloat(deal.salePrice),
        storeID: parseInt(deal.storeID)
      },
      lastUpdated: new Date()
    }));
  } catch (error) {
    console.error('Error fetching deals from CheapShark:', error);
    throw error;
  }
};

// Search games on CheapShark API
exports.searchGames = async (title) => {
  try {
    const response = await axios.get(`${CHEAPSHARK_API_URL}/games`, {
      params: {
        title,
        limit: 20
      }
    });

    // Transform data to match our Game model
    return response.data.map(game => ({
      title: game.external,
      steamAppID: parseInt(game.steamAppID) || 0,
      thumb: game.thumb,
      cheapestPrice: {
        price: parseFloat(game.cheapest),
        storeID: 1 // Default to Steam
      },
      lastUpdated: new Date()
    }));
  } catch (error) {
    console.error('Error searching games on CheapShark:', error);
    throw error;
  }
};

// Get game details
exports.getGameDetails = async (steamAppID) => {
  try {
    const response = await axios.get(`${CHEAPSHARK_API_URL}/games`, {
      params: {
        steamAppID
      }
    });

    if (!response.data || !response.data.info) {
      return null;
    }

    const gameInfo = response.data.info;
    const deals = response.data.deals || [];

    // Transform data to match our Game model
    const storeDeals = deals.map(deal => ({
      storeID: parseInt(deal.storeID),
      storeName: getStoreName(parseInt(deal.storeID)),
      currentPrice: parseFloat(deal.price),
      regularPrice: parseFloat(deal.retailPrice),
      savings: parseFloat(deal.savings),
      lastUpdate: new Date()
    }));

    // Find cheapest deal
    const cheapestDeal = deals.reduce((min, deal) => 
      parseFloat(deal.price) < parseFloat(min.price) ? deal : min, deals[0]);

    return {
      title: gameInfo.title,
      steamAppID: parseInt(steamAppID),
      thumb: gameInfo.thumb,
      stores: storeDeals,
      cheapestPrice: cheapestDeal ? {
        price: parseFloat(cheapestDeal.price),
        storeID: parseInt(cheapestDeal.storeID)
      } : null,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting game details from CheapShark:', error);
    throw error;
  }
};

// Helper function to get store names
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