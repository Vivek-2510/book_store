import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout }  = useAuth()
  const { totalItems }    = useCart()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [search, setSearch]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/books?search=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>Book<span style={{ color: '#D97706' }}>Nest</span></span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search books, authors..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}><FiSearch size={16} /></button>
        </form>

        {/* Desktop Nav */}
        <div style={styles.navLinks}>
          <Link to="/books" style={{ ...styles.navLink, ...(isActive('/books') ? styles.navLinkActive : {}) }}>Books</Link>

          {/* Cart */}
          <Link to="/cart" style={styles.iconBtn}>
            <FiShoppingCart size={20} />
            {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
          </Link>

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" style={styles.iconBtn}><FiHeart size={20} /></Link>
          )}

          {/* User Dropdown */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button style={styles.userBtn} onClick={() => setDropOpen(v => !v)}>
                <div style={styles.avatar}>{user.name[0].toUpperCase()}</div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
              </button>
              {dropOpen && (
                <div style={styles.dropdown} onMouseLeave={() => setDropOpen(false)}>
                  {user.role === 'admin' && (
                    <Link to="/admin" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                      <FiSettings size={15} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    <FiUser size={15} /> My Profile
                  </Link>
                  <Link to="/orders" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    <FiPackage size={15} /> My Orders
                  </Link>
                  <Link to="/wishlist" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    <FiHeart size={15} /> Wishlist
                  </Link>
                  <div style={styles.dropDivider} />
                  <button style={{ ...styles.dropItem, color: '#DC2626', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => { logout(); setDropOpen(false) }}>
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button style={styles.mobileBtn} onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..." style={{ ...styles.searchInput, flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm"><FiSearch /></button>
          </form>
          <Link to="/books"   style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📚 Books</Link>
          <Link to="/cart"    style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🛒 Cart {totalItems > 0 && `(${totalItems})`}</Link>
          {user ? (
            <>
              <Link to="/profile"  style={styles.mobileLink} onClick={() => setMenuOpen(false)}>👤 Profile</Link>
              <Link to="/orders"   style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📦 Orders</Link>
              <Link to="/wishlist" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>❤️ Wishlist</Link>
              {user.role === 'admin' && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>⚙️ Admin</Link>}
              <button style={{ ...styles.mobileLink, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                onClick={() => { logout(); setMenuOpen(false) }}>🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🔑 Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>✨ Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: { background: '#3D1F0D', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.25)' },
  inner: { display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', height: 68 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 },
  logoIcon: { fontSize: 24 },
  logoText: { fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 800, color: '#fff' },
  searchForm: { display: 'flex', flex: 1, maxWidth: 480, position: 'relative' },
  searchInput: { width: '100%', padding: '9px 44px 9px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none' },
  searchBtn: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  navLink: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, padding: '6px 10px', borderRadius: 6, transition: '0.2s' },
  navLinkActive: { color: '#D97706', background: 'rgba(217,119,6,0.15)' },
  iconBtn: { position: 'relative', color: 'rgba(255,255,255,0.85)', padding: 8, display: 'flex', alignItems: 'center', borderRadius: 8, transition: '0.2s' },
  cartBadge: { position: 'absolute', top: 2, right: 2, background: '#D97706', color: '#fff', borderRadius: '50%', width: 17, height: 17, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '7px 12px', borderRadius: 8, cursor: 'pointer' },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 },
  dropdown: { position: 'absolute', right: 0, top: '100%', marginTop: 8, background: '#fff', border: '1px solid rgba(61,31,13,0.12)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', minWidth: 190, overflow: 'hidden', zIndex: 200 },
  dropItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 14, color: '#3D1F0D', transition: '0.2s', fontFamily: 'Inter,sans-serif' },
  dropDivider: { height: 1, background: 'rgba(61,31,13,0.08)', margin: '4px 0' },
  mobileBtn: { display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 'auto' },
  mobileMenu: { background: '#2D1508', padding: '16px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  mobileLink: { display: 'block', color: 'rgba(255,255,255,0.85)', padding: '11px 0', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.07)' },
}
