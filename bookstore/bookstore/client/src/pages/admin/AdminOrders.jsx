import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [filter,  setFilter]  = useState('')
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders', { params: { page, limit: 15, status: filter || undefined } })
      .then(({ data }) => { setOrders(data.orders); setTotal(data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page, filter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
      toast.success(`Order marked as ${status}`)
    } catch { toast.error('Failed to update status') }
  }

  const statusColor = {
    pending:   '#D97706',
    confirmed: '#2563EB',
    shipped:   '#7C3AED',
    delivered: '#16A34A',
    cancelled: '#DC2626',
  }

  const STATUSES = ['pending','confirmed','shipped','delivered','cancelled']

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Orders</h1>
          <p style={{ color: '#9C7B6A', fontSize: 14 }}>{total} orders total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={s.filterRow}>
        {['', ...STATUSES].map(st => (
          <button
            key={st}
            onClick={() => { setFilter(st); setPage(1) }}
            style={{ ...s.filterTab, ...(filter === st ? s.filterTabActive : {}) }}
          >
            {st ? st.charAt(0).toUpperCase() + st.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"/></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FDF6EC' }}>
                  {['Order ID','Customer','Items','Total','Payment','Status','Date','Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid rgba(61,31,13,0.07)' }}>
                    <td style={s.td}>
                      <Link to={`/orders/${order._id}`} style={{ color: '#D97706', fontWeight: 600, fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{order.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#9C7B6A' }}>{order.user?.email}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} style={{ width: 24, height: 34, borderRadius: '2px 4px 4px 2px', background: item.coverColor || '#4f46e5', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'rgba(0,0,0,0.2)' }}/>
                          </div>
                        ))}
                        {order.items.length > 3 && <span style={{ fontSize: 11, color: '#9C7B6A', alignSelf: 'center' }}>+{order.items.length - 3}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#9C7B6A', marginTop: 3 }}>{order.totalItems} item(s)</div>
                    </td>
                    <td style={s.td}><span style={{ fontWeight: 700, fontSize: 15 }}>₹{order.total}</span></td>
                    <td style={s.td}><span style={s.payBadge}>{order.paymentMethod}</span></td>
                    <td style={s.td}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        style={{ ...s.statusSelect, color: statusColor[order.status] || '#9C7B6A', borderColor: (statusColor[order.status] || '#9C7B6A')+'40', background: (statusColor[order.status] || '#9C7B6A')+'12' }}
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase()+st.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: 12, color: '#9C7B6A' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={s.td}>
                      <Link to={`/orders/${order._id}`} style={s.viewBtn}>View</Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9C7B6A', fontSize: 14 }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(61,31,13,0.08)', display: 'flex', gap: 8 }}>
              {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid', borderColor: p === page ? '#3D1F0D' : 'rgba(61,31,13,0.15)', background: p === page ? '#3D1F0D' : '#fff', color: p === page ? '#fff' : '#3D1F0D', cursor: 'pointer', fontSize: 13 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:        { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 4 },
  filterRow:    { display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' },
  filterTab:    { padding: '7px 16px', borderRadius: 50, border: '1.5px solid rgba(61,31,13,0.15)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#5C3317', transition: '0.2s', fontFamily: 'Inter,sans-serif' },
  filterTabActive:{ background: '#3D1F0D', color: '#fff', borderColor: '#3D1F0D' },
  th:           { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#9C7B6A', whiteSpace: 'nowrap' },
  td:           { padding: '12px 14px' },
  payBadge:     { fontSize: 11, background: 'rgba(37,99,235,0.1)', color: '#2563EB', padding: '3px 9px', borderRadius: 50, fontWeight: 600 },
  statusSelect: { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 50, border: '1.5px solid', cursor: 'pointer', fontFamily: 'Inter,sans-serif', outline: 'none', textTransform: 'capitalize' },
  viewBtn:      { fontSize: 12, color: '#D97706', fontWeight: 600, padding: '5px 12px', border: '1.5px solid rgba(217,119,6,0.4)', borderRadius: 6, textDecoration: 'none', display: 'inline-block' },
}
