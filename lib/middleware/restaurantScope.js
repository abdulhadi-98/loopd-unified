const Restaurant = require('../models/Restaurant');

async function restaurantScope(req, res, next) {
  try {
    const restaurantId = req.user.restaurant_id;
    if (!restaurantId) return res.status(403).json({ error: 'No restaurant scope' });
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    req.restaurant = restaurant;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = restaurantScope;
