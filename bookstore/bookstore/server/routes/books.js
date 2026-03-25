const express = require('express');
const router  = express.Router();
const Book    = require('../models/Book');
const { protect, admin } = require('../middleware/auth');

// GET /api/books — List with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const { search, genre, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;
    const query = { isActive: true };

    if (search) query.$or = [
      { title:  { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { tags:   { $in: [new RegExp(search, 'i')] } },
    ];
    if (genre)    query.genre = genre;
    if (featured) query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      'price-asc':   { price: 1 },
      'price-desc':  { price: -1 },
      'rating':      { rating: -1 },
      'newest':      { createdAt: -1 },
      'popular':     { reviewCount: -1 },
    };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ books, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/genres — Get all genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Book.distinct('genre', { isActive: true });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/featured
router.get('/featured', async (req, res) => {
  try {
    const books = await Book.find({ featured: true, isActive: true }).limit(8);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.isActive) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/books — Admin: Create book
router.post('/', protect, admin, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/books/:id — Admin: Update book
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/books/:id — Admin: Soft delete
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
