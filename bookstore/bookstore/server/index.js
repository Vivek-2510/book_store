const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/books',    require('./routes/books'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/admin',    require('./routes/admin'));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Bookstore API running' }));

// ── MongoDB Connection ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // Seed database if empty
    await seedDatabase();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Seed Database ───────────────────────────────────────────────────────────
async function seedDatabase() {
  const Book = require('./models/Book');
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');

  const bookCount = await Book.countDocuments();
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPass = await bcrypt.hash('user123', 10);
    await User.insertMany([
      { name: 'Admin User', email: 'admin@bookstore.com', password: hashedPassword, role: 'admin' },
      { name: 'John Doe',   email: 'john@example.com',   password: hashedUserPass, role: 'user' },
    ]);
    console.log('👤 Demo users seeded');
  }

  if (bookCount === 0) {
    await Book.insertMany([
      { title: 'The Great Gatsby',       author: 'F. Scott Fitzgerald', price: 299,  originalPrice: 399,  genre: 'Classic Fiction',   description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',   isbn: '978-0743273565', pages: 180, publisher: 'Scribner',         publishedYear: 1925, language: 'English', stock: 45, rating: 4.2, reviewCount: 128, coverColor: '#1a3a5c', tags: ['classic','fiction','american'], featured: true  },
      { title: 'To Kill a Mockingbird',  author: 'Harper Lee',          price: 349,  originalPrice: 449,  genre: 'Classic Fiction',   description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',       isbn: '978-0061935466', pages: 281, publisher: 'Harper Perennial', publishedYear: 1960, language: 'English', stock: 38, rating: 4.8, reviewCount: 256, coverColor: '#2d5a1b', tags: ['classic','drama','legal'],   featured: true  },
      { title: '1984',                   author: 'George Orwell',        price: 279,  originalPrice: 379,  genre: 'Dystopian Fiction',  description: 'Among the seminal texts of the 20th century, 1984 is a rare work that grows more haunting as its futuristic year recedes into history.',                          isbn: '978-0451524935', pages: 328, publisher: 'Signet Classic',   publishedYear: 1949, language: 'English', stock: 52, rating: 4.7, reviewCount: 312, coverColor: '#1c1c1c', tags: ['dystopia','sci-fi','political'], featured: true  },
      { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', price: 399, originalPrice: 499, genre: 'Fantasy', description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive.',        isbn: '978-0590353427', pages: 309, publisher: 'Scholastic',       publishedYear: 1997, language: 'English', stock: 60, rating: 4.9, reviewCount: 512, coverColor: '#7c3aed', tags: ['fantasy','magic','adventure'], featured: true  },
      { title: 'The Alchemist',          author: 'Paulo Coelho',         price: 249,  originalPrice: 349,  genre: 'Fiction',            description: 'A magical story about following your dream. Every few decades a book comes along that changes the lives of its readers forever.',isbn: '978-0062315007', pages: 197, publisher: 'HarperOne',        publishedYear: 1988, language: 'English', stock: 73, rating: 4.6, reviewCount: 445, coverColor: '#c2410c', tags: ['spiritual','adventure','philosophy'], featured: false },
      { title: 'Atomic Habits',          author: 'James Clear',          price: 449,  originalPrice: 599,  genre: 'Self-Help',          description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day.',                                  isbn: '978-0735211292', pages: 320, publisher: 'Avery',            publishedYear: 2018, language: 'English', stock: 88, rating: 4.8, reviewCount: 634, coverColor: '#0f766e', tags: ['habits','productivity','self-help'], featured: true  },
      { title: 'The Psychology of Money',author: 'Morgan Housel',        price: 399,  originalPrice: 499,  genre: 'Finance',            description: 'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know.',              isbn: '978-0857197689', pages: 256, publisher: 'Harriman House',   publishedYear: 2020, language: 'English', stock: 55, rating: 4.7, reviewCount: 389, coverColor: '#1e40af', tags: ['finance','psychology','investing'], featured: true  },
      { title: 'Dune',                   author: 'Frank Herbert',         price: 499,  originalPrice: 649,  genre: 'Science Fiction',    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',             isbn: '978-0441013593', pages: 688, publisher: 'Ace',              publishedYear: 1965, language: 'English', stock: 29, rating: 4.5, reviewCount: 278, coverColor: '#92400e', tags: ['sci-fi','epic','space'], featured: false },
      { title: 'Ikigai',                 author: 'Héctor García',         price: 299,  originalPrice: 399,  genre: 'Self-Help',          description: 'The Japanese secret to a long and happy life and our search for meaning.',                                                isbn: '978-0143130727', pages: 208, publisher: 'Penguin Life',      publishedYear: 2016, language: 'English', stock: 44, rating: 4.4, reviewCount: 211, coverColor: '#db2777', tags: ['japanese','lifestyle','happiness'], featured: false },
      { title: 'Rich Dad Poor Dad',      author: 'Robert T. Kiyosaki',    price: 299,  originalPrice: 399,  genre: 'Finance',            description: 'What the rich teach their kids about money that the poor and middle class do not!',                                         isbn: '978-1612680194', pages: 336, publisher: 'Plata Publishing',  publishedYear: 1997, language: 'English', stock: 66, rating: 4.5, reviewCount: 498, coverColor: '#065f46', tags: ['finance','wealth','business'], featured: false },
      { title: 'The Lean Startup',       author: 'Eric Ries',             price: 449,  originalPrice: 549,  genre: 'Business',           description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.',                            isbn: '978-0307887894', pages: 336, publisher: 'Crown Business',   publishedYear: 2011, language: 'English', stock: 33, rating: 4.3, reviewCount: 167, coverColor: '#4f46e5', tags: ['startup','business','entrepreneurship'], featured: false },
      { title: 'Deep Work',              author: 'Cal Newport',           price: 379,  originalPrice: 479,  genre: 'Self-Help',          description: 'Rules for Focused Success in a Distracted World.',                                                                         isbn: '978-1455586691', pages: 296, publisher: 'Grand Central',    publishedYear: 2016, language: 'English', stock: 41, rating: 4.6, reviewCount: 234, coverColor: '#0369a1', tags: ['productivity','focus','career'], featured: false },
    ]);
    console.log('📚 Demo books seeded');
  }
}
