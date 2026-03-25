// ── ORDERS ───────────────────────────────────────────────────────────────────
const express  = require('express');
const orderRouter = express.Router();
const { Order } = require('../models/Order');
const Book    = require('../models/Book');
const { protect, admin } = require('../middleware/auth');

// POST /api/orders — Place order
orderRouter.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items in order' });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book || !book.isActive) return res.status(400).json({ message: `Book not found: ${item.book}` });
      if (book.stock < item.quantity)  return res.status(400).json({ message: `Insufficient stock for: ${book.title}` });
      subtotal += book.price * item.quantity;
      orderItems.push({ book: book._id, title: book.title, author: book.author, price: book.price, quantity: item.quantity, coverColor: book.coverColor });
      book.stock -= item.quantity;
      await book.save();
    }

    const shipping = subtotal >= 499 ? 0 : 49;
    const total    = subtotal + shipping;

    const order = await Order.create({
      user: req.user._id, items: orderItems, totalItems: items.reduce((s,i)=>s+i.quantity,0),
      subtotal, shipping, total, shippingAddress, paymentMethod: paymentMethod || 'COD', notes
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my — User's orders
orderRouter.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
orderRouter.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/cancel
orderRouter.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (['shipped','delivered'].includes(order.status)) return res.status(400).json({ message: 'Cannot cancel after shipping' });
    order.status = 'cancelled';
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — Admin: all orders
orderRouter.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query).populate('user','name email').sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — Admin: update status
orderRouter.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = orderRouter;
