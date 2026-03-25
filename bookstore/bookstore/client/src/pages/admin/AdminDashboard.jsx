import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader"><div className="spinner"/></div>
  if (!stats)  return null

  const statusColor = { pending:'#D97706', confirmed:'#2563EB', shipped:'#7C3AED', delivered:'#16A34A', cancelled:'#DC2626' }

  return (
    <div>
      <h1 style={s.title}>Dashboard</h1>
      <p style={{ color: '#9C7B6A', marginBottom: 28, fontSize: 14 }}>Welcome back! Here's what's happening in your store.</p>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label:'Total Books',   value: stats.totalBooks,  icon:'📚', color:'#3D1F0D', sub:'In catalog'       },
          { label:'Total Users',   value: stats.totalUsers,  icon:'👥', color:'#2563EB', sub:'Registered'       },
          { label:'Total Orders',  value: stats.totalOrders, icon:'📦', color:'#7C3AED', sub:'All time'         },
          { label:'Revenue',       value:`₹${(stats.revenue/1000).toFixed(1)}k`, icon:'💰', color:'#16A34A', sub:'Total earned' },
        ].map(({ label, value, icon, color, sub }) => (
          <div key={label} style={s.statCard}>
            <div style={{ ...s.statIcon, background: color+'15' }}>{icon}</div>
            <div>
              <div style={{ fontSize: 13, color: '#9C7B6A', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.8rem', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9C7B6A', marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.grid}>
        {/* Recent Orders */}
        <div className="card">
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Recent Orders</span>
            <Link to="/admin/orders" style={s.viewAll}>View All →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FDF6EC' }}>
                  {['Order ID','Customer','Items','Total','Status'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid rgba(61,31,13,0.07)' }}>
                    <td style={s.td}>
                      <Link to={`/orders/${order._id}`} style={{ color: '#D97706', fontWeight: 600, fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td style={s.td}><div style={{ fontSize: 13 }}>{order.user?.name}</div><div style={{ fontSize: 11, color: '#9C7B6A' }}>{order.user?.email}</div></td>
                    <td style={s.td}><span style={{ fontSize: 13 }}>{order.totalItems} item(s)</span></td>
                    <td style={s.td}><span style={{ fontWeight: 700 }}>₹{order.total}</span></td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, background: (statusColor[order.status]||'#9C7B6A')+'20', color: statusColor[order.status]||'#9C7B6A', padding: '3px 9px', borderRadius: 50, fontWeight: 600, textTransform: 'capitalize' }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Status Breakdown */}
          <div className="card" style={{ padding: 22 }}>
            <div style={s.cardTitle}>Order Status</div>
            <div style={{ marginTop: 16 }}>
              {stats.ordersByStatus.map(({ _id, count }) => (
                <div key={_id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ textTransform: 'capitalize' }}>{_id}</span>
                    <span style={{ fontWeight: 600, color: statusColor[_id] || '#9C7B6A' }}>{count}</span>
                  </div>
                  <div style={{ background: '#EDE9E0', borderRadius: 50, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(count / stats.totalOrders * 100)}%`, height: '100%', background: statusColor[_id] || '#9C7B6A', borderRadius: 50 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {stats.lowStock?.length > 0 && (
            <div className="card" style={{ padding: 22, border: '1px solid rgba(217,119,6,0.3)' }}>
              <div style={{ ...s.cardTitle, color: '#D97706' }}>⚠️ Low Stock Alert</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.lowStock.map(book => (
                  <div key={book._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#5C3317' }}>{book.title}</span>
                    <span style={{ fontWeight: 700, color: book.stock === 0 ? '#DC2626' : '#D97706' }}>
                      {book.stock === 0 ? 'OUT' : `${book.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/admin/books" className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>Manage Books</Link>
            </div>
          )}

          {/* Top Books */}
          <div className="card" style={{ padding: 22 }}>
            <div style={s.cardTitle}>Top Rated Books</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.topBooks.map((book, i) => (
                <div key={book._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 44, borderRadius: '3px 6px 6px 3px', background: book.coverColor, position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1309' }}>{book.title}</div>
                    <div style={{ fontSize: 11, color: '#9C7B6A' }}>⭐ {book.rating?.toFixed(1)} · {book.reviewCount} reviews</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3D1F0D' }}>₹{book.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  title:     { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 6 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 },
  statCard:  { background: '#fff', border: '1px solid rgba(61,31,13,0.1)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 14 },
  statIcon:  { width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  grid:      { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 },
  cardHead:  { padding: '16px 20px', borderBottom: '1px solid rgba(61,31,13,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#3D1F0D', fontFamily: '"Playfair Display",serif' },
  viewAll:   { fontSize: 13, color: '#D97706', textDecoration: 'none' },
  th:        { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#9C7B6A' },
  td:        { padding: '13px 16px', fontSize: 13 },
}
