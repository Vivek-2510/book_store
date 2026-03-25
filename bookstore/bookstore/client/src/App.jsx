import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Layout
import Navbar   from './components/layout/Navbar'
import Footer   from './components/layout/Footer'

// Pages
import Home         from './pages/Home'
import BookList     from './pages/BookList'
import BookDetail   from './pages/BookDetail'
import Cart         from './pages/Cart'
import Checkout     from './pages/Checkout'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Profile      from './pages/Profile'
import Orders       from './pages/Orders'
import OrderDetail  from './pages/OrderDetail'
import Wishlist     from './pages/Wishlist'

// Admin Pages
import AdminLayout      from './pages/admin/AdminLayout'
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminBooks       from './pages/admin/AdminBooks'
import AdminOrders      from './pages/admin/AdminOrders'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminBookForm    from './pages/admin/AdminBookForm'

// Protected Route Wrappers
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#3D1F0D', color: '#fff' },
              success: { iconTheme: { primary: '#D97706', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/books" element={<PublicLayout><BookList /></PublicLayout>} />
            <Route path="/books/:id" element={<PublicLayout><BookDetail /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

            {/* Protected Routes */}
            <Route path="/checkout" element={<PrivateRoute><PublicLayout><Checkout /></PublicLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><PublicLayout><Profile /></PublicLayout></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><PublicLayout><Orders /></PublicLayout></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><PublicLayout><OrderDetail /></PublicLayout></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><PublicLayout><Wishlist /></PublicLayout></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="books/new" element={<AdminBookForm />} />
              <Route path="books/:id/edit" element={<AdminBookForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
