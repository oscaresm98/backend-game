// utils/priceCompare.js

/**
 * Determines if a price drop is significant enough to warrant an alert
 * @param {number} oldPrice - The previous price
 * @param {number} newPrice - The current price
 * @param {number} minimumDropPercentage - Minimum percentage drop to be considered significant (default 15%)
 * @param {number} minimumDropAmount - Minimum amount drop to be considered significant (default $5)
 * @returns {boolean} - Whether the price drop is significant
 */
exports.isPriceDropSignificant = (oldPrice, newPrice, minimumDropPercentage = 15, minimumDropAmount = 5) => {
    // Check if prices are valid numbers
    if (typeof oldPrice !== 'number' || typeof newPrice !== 'number') {
      return false;
    }
    
    // Calculate the drop amount and percentage
    const dropAmount = oldPrice - newPrice;
    const dropPercentage = (dropAmount / oldPrice) * 100;
    
    // A price drop is significant if either:
    // 1. The drop percentage is greater than the minimum percentage
    // 2. The drop amount is greater than the minimum amount
    return dropPercentage >= minimumDropPercentage || dropAmount >= minimumDropAmount;
  };
  
  /**
   * Formats a price for display
   * @param {number} price - The price to format
   * @param {string} currencySymbol - The currency symbol (default '$')
   * @returns {string} - The formatted price
   */
  exports.formatPrice = (price, currencySymbol = '$') => {
    if (typeof price !== 'number') {
      return 'N/A';
    }
    
    return `${currencySymbol}${price.toFixed(2)}`;
  };
  
  /**
   * Calculates the savings amount and percentage
   * @param {number} originalPrice - The original price
   * @param {number} salePrice - The sale price
   * @returns {Object} - Object containing the savings amount and percentage
   */
  exports.calculateSavings = (originalPrice, salePrice) => {
    if (typeof originalPrice !== 'number' || typeof salePrice !== 'number') {
      return { amount: 0, percentage: 0 };
    }
    
    const savingsAmount = originalPrice - salePrice;
    const savingsPercentage = (savingsAmount / originalPrice) * 100;
    
    return {
      amount: savingsAmount,
      percentage: savingsPercentage
    };
  };