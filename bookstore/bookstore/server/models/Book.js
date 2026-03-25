const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  author:        { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  genre:         { type: String, required: true },
  isbn:          { type: String, unique: true, sparse: true },
  pages:         { type: Number },
  publisher:     { type: String },
  publishedYear: { type: Number },
  language:      { type: String, default: 'English' },
  stock:         { type: Number, default: 0, min: 0 },
  coverImage:    { type: String, default: '' },
  coverColor:    { type: String, default: '#4f46e5' },
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:   { type: Number, default: 0 },
  tags:          [String],
  featured:      { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
