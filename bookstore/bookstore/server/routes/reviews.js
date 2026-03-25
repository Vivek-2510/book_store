// ── REVIEWS ───────────────────────────────────────────────────────────────
const express      = require('express');
const reviewRouter = express.Router();
const { Review }   = require('../models/Order');
const Book         = require('../models/Book');
const { protect, admin } = require('../middleware/auth');

// GET /api/reviews/:bookId
reviewRouter.get('/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate('user','name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews/:bookId
reviewRouter.post('/:bookId', protect, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || !title || !comment) return res.status(400).json({ message: 'All fields required' });
    const exists = await Review.findOne({ book: req.params.bookId, user: req.user._id });
    if (exists) return res.status(400).json({ message: 'You have already reviewed this book' });

    const review = await Review.create({ book: req.params.bookId, user: req.user._id, rating, title, comment });
    // Recalculate book rating
    const reviews = await Review.find({ book: req.params.bookId });
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Book.findByIdAndUpdate(req.params.bookId, { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length });
    const populated = await review.populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id — Admin
reviewRouter.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = reviewRouter;
