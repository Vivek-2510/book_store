// ── USERS ─────────────────────────────────────────────────────────────────
const express     = require('express');
const userRouter  = express.Router();
const User        = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// GET /api/users — Admin: list all users
userRouter.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ users, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id/status — Admin: toggle active
userRouter.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = userRouter;

// ── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
const adminRouter = express.Router();
const Book        = require('../models/Book');
const { Order }   = require('../models/Order');

// GET /api/admin/stats
adminRouter.get('/stats', protect, admin, async (req, res) => {
  try {
    const [totalBooks, totalUsers, totalOrders, revenueResult] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    const revenue = revenueResult[0]?.total || 0;
    const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const recentOrders   = await Order.find().populate('user','name email').sort({ createdAt:-1 }).limit(5);
    const topBooks       = await Book.find({ isActive:true }).sort({ reviewCount:-1 }).limit(5);
    const lowStock       = await Book.find({ stock: { $lte: 5 }, isActive: true }).select('title stock');
    res.json({ totalBooks, totalUsers, totalOrders, revenue, ordersByStatus, recentOrders, topBooks, lowStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports.adminRouter = adminRouter;
