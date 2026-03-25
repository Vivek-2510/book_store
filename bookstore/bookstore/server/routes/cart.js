// ── CART (client-side managed, but wishlist stored in DB) ─────────────────
const express = require('express');
const cartRouter = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/cart/wishlist/:bookId
cartRouter.post('/wishlist/:bookId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;
    const idx = user.wishlist.indexOf(bookId);
    if (idx === -1) user.wishlist.push(bookId);
    else            user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cart/wishlist
cartRouter.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist','title author price coverColor rating');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = cartRouter;
