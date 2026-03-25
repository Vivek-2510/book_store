import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate             = useNavigate()
  const { items, subtotal, shippingCost, total, clearCart } = useCart()
  const { user }             = useAuth()
  const [loading, setLoading]= useState(false)
  const [addr, setAddr]      = useState({ name: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [payment, setPayment]= useState('COD')

  if (items.length === 0) { navigate('/cart'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!addr.street || !addr.city || !addr.pincode) { toast.error('Please fill all address fields'); return }
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ book: i._id, quantity: i.qty }))
      const { data }   = await api.post('/orders', { items: orderItems, shippingAddress: addr, paymentMethod: payment })
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type='text', placeholder='') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} className="form-input" placeholder={placeholder} value={addr[key]} onChange={e => setAddr(a => ({ ...a, [key]: e.target.value }))} required />
    </div>
  )

  return (
    <div className="container page-wrapper">
      <h1 style={s.title}>Checkout</h1>
      <form onSubmit={handleSubmit} style={s.grid}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={s.sectionTitle}>📦 Delivery Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {field('name',    'Full Name',    'text',  'Your full name')}
              {field('phone',   'Phone',        'tel',   '10-digit mobile number')}
              <div style={{ gridColumn: '1/-1' }}>{field('street', 'Street Address', 'text', 'House no., street, area')}</div>
              {field('city',    'City',         'text',  'City')}
              {field('state',   'State',        'text',  'State')}
              {field('pincode', 'Pincode',      'text',  '6-digit pincode')}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={s.sectionTitle}>💳 Payment Method</h3>
            {[['COD','💵','Cash on Delivery','Pay when your books arrive'],['UPI','📱','UPI Payment','Google Pay, PhonePe, Paytm'],['Card','💳','Credit / Debit Card','All major cards accepted']].map(([val, icon, label, desc]) => (
              <label key={val} style={{ ...s.payOpt, ...(payment === val ? s.payOptActive : {}) }}>
                <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} style={{ accentColor: '#3D1F0D' }} />
                <span style={{ fontSize: 22 }}>{icon}</span>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div><div style={{ fontSize: 12, color: '#9C7B6A' }}>{desc}</div></div>
              </label>
            ))}
            {payment !== 'COD' && (
              <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#D97706', marginTop: 10 }}>
                ℹ️ This is a demo. No real payment will be processed.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={s.sectionTitle}>Order Summary</h3>
            {items.map(i => (
              <div key={i._id} style={s.orderItem}>
                <div style={{ ...s.miniCover, background: i.coverColor }}><div style={s.miniSpine}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{i.title}</div>
                  <div style={{ fontSize: 12, color: '#9C7B6A' }}>×{i.qty}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>₹{i.price * i.qty}</div>
              </div>
            ))}
            <div style={s.divider} />
            {[['Subtotal', `₹${subtotal}`], ['Shipping', shippingCost === 0 ? 'FREE' : `₹${shippingCost}`]].map(([l,v]) => (
              <div key={l} style={s.sumRow}><span>{l}</span><span style={{ color: v === 'FREE' ? '#22C55E' : 'inherit' }}>{v}</span></div>
            ))}
            <div style={{ ...s.sumRow, fontWeight: 700, fontSize: 18, paddingTop: 10, borderTop: '1px solid rgba(61,31,13,0.1)', marginTop: 8 }}>
              <span>Total</span><span style={{ fontFamily: '"Playfair Display",serif' }}>₹{total}</span>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 18 }}>
              {loading ? 'Placing Order...' : `Place Order — ₹${total}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const s = {
  title:       { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 28 },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' },
  sectionTitle:{ fontFamily: '"Playfair Display",serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: 18 },
  payOpt:      { display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid rgba(61,31,13,0.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 10, cursor: 'pointer', transition: '0.2s' },
  payOptActive:{ borderColor: '#3D1F0D', background: 'rgba(61,31,13,0.04)' },
  orderItem:   { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  miniCover:   { width: 40, height: 54, borderRadius: '3px 6px 6px 3px', position: 'relative', flexShrink: 0 },
  miniSpine:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'rgba(0,0,0,0.2)' },
  divider:     { borderTop: '1px solid rgba(61,31,13,0.1)', margin: '14px 0' },
  sumRow:      { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#3D1F0D' },
}
