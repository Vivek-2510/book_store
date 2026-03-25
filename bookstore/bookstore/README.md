# 📚 BookNest — Online Book Store (MERN Stack)

A fully functional online bookstore built with **MongoDB, Express.js, React.js, and Node.js**.

---

## 🗂️ Project Structure

```
bookstore/
├── package.json              ← Root scripts (run both server + client)
├── server/                   ← Express + MongoDB Backend
│   ├── index.js              ← Entry point + DB connection + seed
│   ├── .env                  ← Environment variables
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Order.js          ← (also exports Review model)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   └── admin.js
│   └── middleware/
│       └── auth.js           ← JWT protect + admin middleware
└── client/                   ← React + Vite Frontend
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── utils/api.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── components/
        │   ├── layout/Navbar.jsx
        │   ├── layout/Footer.jsx
        │   └── book/BookCard.jsx
        └── pages/
            ├── Home.jsx
            ├── BookList.jsx
            ├── BookDetail.jsx
            ├── Cart.jsx
            ├── Checkout.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Profile.jsx
            ├── Orders.jsx
            ├── OrderDetail.jsx
            ├── Wishlist.jsx
            └── admin/
                ├── AdminLayout.jsx
                ├── AdminDashboard.jsx
                ├── AdminBooks.jsx
                ├── AdminBookForm.jsx
                ├── AdminOrders.jsx
                └── AdminUsers.jsx
```

---

## ⚙️ Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Vite, React Router v6   |
| Styling     | Custom CSS (no framework)         |
| Backend     | Node.js, Express.js               |
| Database    | MongoDB with Mongoose             |
| Auth        | JWT (JSON Web Tokens) + bcryptjs  |
| HTTP Client | Axios                             |
| Icons       | React Icons                       |
| Toast       | React Hot Toast                   |

---

## 🚀 How to Run in VS Code

### Prerequisites — Install These First

1. **Node.js** (v18+): https://nodejs.org
2. **MongoDB** (Community): https://www.mongodb.com/try/download/community
3. **VS Code**: https://code.visualstudio.com

---

### Step 1: Verify MongoDB is Running

**Windows:**
```bash
# Open Services (Win+R → services.msc) and check "MongoDB" is Running
# OR open Command Prompt as Admin and run:
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

### Step 2: Open Project in VS Code

```bash
# Open VS Code terminal (Ctrl + `)
# Navigate to project folder
cd bookstore
```

---

### Step 3: Install All Dependencies

Run this ONE command in the VS Code terminal from the `bookstore/` root:

```bash
npm run install-all
```

This installs:
- Root concurrently package
- All server packages (express, mongoose, bcryptjs, jwt...)
- All client packages (react, vite, axios, react-router...)

---

### Step 4: Start the Application

```bash
npm run dev
```

This starts BOTH server and client simultaneously:
- 🟢 **Backend API** → http://localhost:5000
- 🔵 **Frontend**    → http://localhost:5173

Your browser will open automatically at **http://localhost:5173**

---

### Step 5: Login with Demo Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@bookstore.com      | admin123   |
| User  | john@example.com         | user123    |

---

## 📋 All Available NPM Commands

| Command                 | Description                              |
|-------------------------|------------------------------------------|
| `npm run install-all`   | Install all dependencies (run once)      |
| `npm run dev`           | Start both backend + frontend together   |
| `npm run server`        | Start only the Express backend           |
| `npm run client`        | Start only the React frontend            |
| `npm run build`         | Build frontend for production            |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Register new user  |
| POST   | /api/auth/login     | Login              |
| GET    | /api/auth/me        | Get current user   |
| PUT    | /api/auth/profile   | Update profile     |
| PUT    | /api/auth/password  | Change password    |

### Books
| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| GET    | /api/books          | List (search, filter, page)|
| GET    | /api/books/featured | Featured books            |
| GET    | /api/books/genres   | All genres                |
| GET    | /api/books/:id      | Single book               |
| POST   | /api/books          | Add book (Admin)          |
| PUT    | /api/books/:id      | Update book (Admin)       |
| DELETE | /api/books/:id      | Delete book (Admin)       |

### Orders
| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| POST   | /api/orders              | Place order              |
| GET    | /api/orders/my           | My orders                |
| GET    | /api/orders/:id          | Order detail             |
| PUT    | /api/orders/:id/cancel   | Cancel order             |
| GET    | /api/orders              | All orders (Admin)       |
| PUT    | /api/orders/:id/status   | Update status (Admin)    |

### Reviews
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /api/reviews/:bookId| Get book reviews    |
| POST   | /api/reviews/:bookId| Add review          |

### Admin
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /api/admin/stats    | Dashboard stats     |
| GET    | /api/users          | List users          |
| PUT    | /api/users/:id/status| Toggle user status |

---

## ✨ Features

### 👤 User Features
- 📚 Browse books with search, genre filter, price filter, sorting
- 📖 Detailed book page with reviews & ratings
- 🛒 Shopping cart (persisted in localStorage)
- 💳 Checkout with address & payment method
- 📦 Order tracking with status timeline
- ❤️ Wishlist (persisted in MongoDB)
- 👤 Profile management
- ⭐ Write reviews for books
- 🔐 JWT authentication

### ⚙️ Admin Features
- 📊 Dashboard with stats, revenue, low stock alerts
- 📚 Full book CRUD (add, edit, delete, feature)
- 📦 Order management with status updates
- 👥 User management (activate/suspend)
- 🎨 Book cover color picker

---

## 🔧 Troubleshooting

**MongoDB not connecting?**
```bash
# Make sure MongoDB service is running
# Check if port 27017 is free
# Windows: net start MongoDB
# Mac: brew services restart mongodb-community
```

**Port already in use?**
```bash
# Kill the process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -ti:5000 | xargs kill
```

**node_modules missing?**
```bash
npm run install-all
```

**React not loading?**
- Check http://localhost:5173
- Make sure `npm run dev` is running (both server + client)
- Check VS Code terminal for errors
