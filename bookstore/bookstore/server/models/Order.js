const mongoose = require('mongoose');

// ── ORDER MODEL ─────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  book:      { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title:     String,
  author:    String,
  price:     Number,
  quantity:  { type: Number, required: true, min: 1 },
  coverColor:String,
});

const orderSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:      [orderItemSchema],
  totalItems: { type: Number, required: true },
  subtotal:   { type: Number, required: true },
  discount:   { type: Number, default: 0 },
  shipping:   { type: Number, default: 0 },
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  shippingAddress: {
    name:    String,
    phone:   String,
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  },
  notes:      { type: String },
  trackingId: { type: String },
}, { timestamps: true });

// ── REVIEW MODEL ────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  book:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

reviewSchema.index({ book: 1, user: 1 }, { unique: true });

const Order  = mongoose.model('Order',  orderSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = { Order, Review };
