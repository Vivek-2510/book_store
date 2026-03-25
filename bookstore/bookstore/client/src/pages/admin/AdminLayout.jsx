import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiGrid, FiBook, FiShoppingBag, FiUsers, FiLogOut, FiPlus } from 'react-icons/fi'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
    fontSize: 14, fontWeight: 500, color: isActive ? '#D97706' : 'rgba(255,255,255,0.65)',
    background: isActive ? 'rgba(217,119,6,0.15)' : 'transparent',
    textDecoration: 'none', transition: '0.2s', marginBottom: 2,
    borderLeft: isActive ? '3px solid #D97706' : '3px solid transparent',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={{ fontSize: 22 }}>📚</span>
          <div>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>Book<span style={{ color: '#D97706' }}>Nest</span></div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
          </div>
        </div>

        <div style={s.adminUser}>
          <div style={s.avatar}>{user?.name?.[0]}</div>
          <div><div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{user?.name}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Administrator</div></div>
        </div>

        <nav style={{ padding: '14px 12px', flex: 1 }}>
          <div style={s.navSection}>Menu</div>
          <NavLink to="/admin"        end style={navStyle}><FiGrid size={16}/> Dashboard</NavLink>
          <NavLink to="/admin/books"  style={navStyle}><FiBook size={16}/> Books</NavLink>
          <NavLink to="/admin/orders" style={navStyle}><FiShoppingBag size={16}/> Orders</NavLink>
          <NavLink to="/admin/users"  style={navStyle}><FiUsers size={16}/> Users</NavLink>
          <div style={s.navSection}>Quick Actions</div>
          <NavLink to="/admin/books/new" style={navStyle}><FiPlus size={16}/> Add Book</NavLink>
          <NavLink to="/" style={navStyle} onClick={e => e.preventDefault() || navigate('/')}>🏪 View Store</NavLink>
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, padding: '8px 2px', width: '100%' }}>
            <FiLogOut size={15}/> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <span style={{ fontSize: 13, color: '#9C7B6A', fontFamily: '"JetBrains Mono",monospace' }}>ADMIN / {window.location.pathname.split('/').filter(Boolean).join(' / ').toUpperCase()}</span>
          <NavLink to="/" style={{ fontSize: 13, color: '#D97706' }}>← View Store</NavLink>
        </div>
        <div style={{ padding: 28 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const s = {
  sidebar:    { width: 230, background: '#2D1508', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 },
  brand:      { display: 'flex', alignItems: 'center', gap: 12, padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  adminUser:  { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  avatar:     { width: 34, height: 34, borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0 },
  navSection: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '10px 8px 5px', fontFamily: '"JetBrains Mono",monospace' },
  main:       { flex: 1, background: '#FDF6EC', minHeight: '100vh' },
  topbar:     { background: '#fff', borderBottom: '1px solid rgba(61,31,13,0.1)', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
}
