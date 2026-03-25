import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: { street:'',city:'',state:'',pincode:'' } })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setForm({ name: data.name, phone: data.phone || '', address: data.address || { street:'',city:'',state:'',pincode:'' } })
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    await updateProfile(form)
    setSaving(false)
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: 680 }}>
      <h1 style={s.title}>My Profile</h1>
      <div className="card" style={{ padding: 32 }}>
        <div style={s.profileHead}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div><div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.4rem', fontWeight: 700 }}>{user?.name}</div><div style={{ color: '#9C7B6A', fontSize: 13 }}>{user?.email}</div><span style={s.roleBadge}>{user?.role}</span></div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(61,31,13,0.1)', margin: '24px 0' }} />
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number"/></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Street Address</label><input className="form-input" value={form.address.street} onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} placeholder="Street address"/></div>
            <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.address.city} onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} /></div>
            <div className="form-group"><label className="form-label">Pincode</label><input className="form-input" value={form.address.pincode} onChange={e => setForm(f => ({ ...f, address: { ...f.address, pincode: e.target.value } }))} /></div>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  )
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export function Orders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  }, [])

  const statusColor = { pending:'#D97706', confirmed:'#2563EB', shipped:'#7C3AED', delivered:'#16A34A', cancelled:'#DC2626' }

  if (loading) return <div className="loader"><div className="spinner"/></div>

  return (
    <div className="container page-wrapper">
      <h1 style={s.title}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 60, marginBottom: 16 }}>📦</div><div className="empty-title">No orders yet</div><Link to="/books" className="btn btn-primary mt-16">Shop Now</Link></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order._id} className="card" style={{ padding: 20 }}>
              <div style={s.orderHead}>
                <div>
                  <div style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: 16 }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#9C7B6A', marginTop: 3 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })} · {order.totalItems} item(s)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>₹{order.total}</div>
                  <span style={{ fontSize: 12, background: statusColor[order.status]+'20', color: statusColor[order.status], padding: '3px 10px', borderRadius: 50, fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ ...s.orderBook, background: item.coverColor }}>
                    <div style={s.obSpine}/>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
                {order.status === 'pending' && <button onClick={() => cancelOrder(order._id, setOrders)} className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function cancelOrder(id, setOrders) {
  if (!confirm('Cancel this order?')) return
  try {
    await api.put(`/orders/${id}/cancel`)
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o))
    toast.success('Order cancelled')
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel') }
}

// ─── ORDER DETAIL ─────────────────────────────────────────────────────────────
export function OrderDetail() {
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const id = window.location.pathname.split('/').pop()

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false))
  }, [id])

  const statusSteps = ['pending','confirmed','shipped','delivered']
  const statusColor = { pending:'#D97706', confirmed:'#2563EB', shipped:'#7C3AED', delivered:'#16A34A', cancelled:'#DC2626' }

  if (loading) return <div className="loader"><div className="spinner"/></div>
  if (!order)  return <div className="container page-wrapper"><p>Order not found.</p></div>

  return (
    <div className="container page-wrapper">
      <h1 style={s.title}>Order Details</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          {/* Status tracker */}
          {order.status !== 'cancelled' && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={s.sectionTitle}>Order Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 2, background: '#EDE9E0', zIndex: 0 }} />
                {statusSteps.map((step, i) => {
                  const idx = statusSteps.indexOf(order.status)
                  const done = i <= idx
                  return (
                    <div key={step} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#3D1F0D' : '#EDE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: done ? 'none' : '2px solid #D1C4B0', color: done ? '#fff' : '#9C7B6A', fontSize: 14, fontWeight: 700 }}>
                        {done ? '✓' : i+1}
                      </div>
                      <div style={{ fontSize: 11, color: done ? '#3D1F0D' : '#9C7B6A', fontWeight: done ? 600 : 400, textTransform: 'capitalize' }}>{step}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={s.sectionTitle}>Items Ordered</h3>
            {order.items.map((item, i) => (
              <div key={i} style={s.detailItem}>
                <div style={{ ...s.orderBook, background: item.coverColor, width: 48, height: 64, flexShrink: 0 }}><div style={s.obSpine}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#9C7B6A' }}>by {item.author}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>₹{item.price} × {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 22, marginBottom: 16 }}>
            <h3 style={s.sectionTitle}>Order Info</h3>
            {[['Order ID', '#'+order._id.slice(-8).toUpperCase()],['Date', new Date(order.createdAt).toLocaleDateString('en-IN')],['Status', order.status],['Payment', order.paymentMethod]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: '#9C7B6A' }}>{k}</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize', color: k === 'Status' ? statusColor[v] : '#3D1F0D' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(61,31,13,0.1)', paddingTop: 12, marginTop: 4 }}>
              {[['Subtotal',`₹${order.subtotal}`],['Shipping',order.shipping===0?'FREE':`₹${order.shipping}`],['Total',`₹${order.total}`]].map(([k,v],i)=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize: i===2?16:13, fontWeight: i===2?700:400, marginBottom: 8 }}>
                  <span>{k}</span><span style={{ color: v==='FREE'?'#22C55E':i===2?'#3D1F0D':'inherit' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {order.shippingAddress && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={s.sectionTitle}>Delivery Address</h3>
              <p style={{ fontSize: 13, color: '#5C4033', lineHeight: 1.7 }}>
                {order.shippingAddress.name}<br/>
                {order.shippingAddress.street}<br/>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br/>
                📞 {order.shippingAddress.phone}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export function Wishlist() {
  const [books, setBooks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/cart/wishlist').then(({ data }) => setBooks(data)).finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    await api.post(`/cart/wishlist/${id}`)
    setBooks(prev => prev.filter(b => b._id !== id))
    toast.success('Removed from wishlist')
  }

  if (loading) return <div className="loader"><div className="spinner"/></div>

  return (
    <div className="container page-wrapper">
      <h1 style={s.title}>My Wishlist</h1>
      {books.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 60, marginBottom: 16 }}>❤️</div><div className="empty-title">Your wishlist is empty</div><Link to="/books" className="btn btn-primary mt-16">Explore Books</Link></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
          {books.map(book => (
            <div key={book._id} style={s.wishCard}>
              <div style={{ ...s.wishCover, background: book.coverColor }}><div style={s.obSpine}/><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.88)', padding: 8, textAlign: 'center', fontFamily: '"Playfair Display",serif' }}>{book.title}</span></div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{book.title}</div>
                <div style={{ fontSize: 12, color: '#9C7B6A', marginBottom: 10 }}>by {book.author}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>₹{book.price}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm">Buy</Link>
                    <button onClick={() => remove(book._id)} className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  title:      { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 28 },
  sectionTitle:{ fontFamily: '"Playfair Display",serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 },
  profileHead:{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 },
  avatar:     { width: 60, height: 60, borderRadius: '50%', background: '#3D1F0D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display",serif', fontSize: 24, fontWeight: 700, flexShrink: 0 },
  roleBadge:  { display: 'inline-block', marginTop: 6, fontSize: 11, background: 'rgba(217,119,6,0.12)', color: '#D97706', padding: '2px 10px', borderRadius: 50, fontWeight: 600, textTransform: 'capitalize' },
  orderHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderBook:  { width: 36, height: 50, borderRadius: '3px 6px 6px 3px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  obSpine:    { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'rgba(0,0,0,0.2)' },
  detailItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(61,31,13,0.08)' },
  wishCard:   { background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(61,31,13,0.1)', boxShadow: '0 2px 10px rgba(61,31,13,0.07)' },
  wishCover:  { height: 160, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

export default Profile
