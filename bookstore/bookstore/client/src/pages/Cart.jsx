// ─── CART PAGE ───────────────────────────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi'

export function Cart() {
  const { items, removeFromCart, updateQty, subtotal, shippingCost, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="container page-wrapper">
      <div className="empty-state">
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <div className="empty-title">Your cart is empty</div>
        <p className="empty-text">Add some books to get started!</p>
        <Link to="/books" className="btn btn-primary mt-16">Browse Books</Link>
      </div>
    </div>
  )

  return (
    <div className="container page-wrapper">
      <h1 style={s.title}>Shopping Cart <span style={{ fontSize: 16, color: '#9C7B6A', fontFamily: 'Inter', fontWeight: 400 }}>({items.length} items)</span></h1>
      <div style={s.grid}>
        <div style={s.itemsList}>
          {items.map(item => (
            <div key={item._id} style={s.item}>
              <div style={{ ...s.cover, background: item.coverColor || '#4f46e5' }}>
                <div style={s.coverSpine} />
                <span style={s.coverText}>{item.title?.slice(0,20)}</span>
              </div>
              <div style={s.itemInfo}>
                <div style={s.itemTitle}>{item.title}</div>
                <div style={s.itemAuthor}>by {item.author}</div>
                <div style={s.itemPrice}>₹{item.price} each</div>
              </div>
              <div style={s.qtyCtrl}>
                <button onClick={() => updateQty(item._id, item.qty-1)} style={s.qBtn}><FiMinus size={12}/></button>
                <span style={s.qNum}>{item.qty}</span>
                <button onClick={() => updateQty(item._id, item.qty+1)} style={s.qBtn}><FiPlus size={12}/></button>
              </div>
              <div style={s.lineTotal}>₹{item.price * item.qty}</div>
              <button onClick={() => removeFromCart(item._id)} style={s.removeBtn}><FiTrash2 size={15}/></button>
            </div>
          ))}
        </div>

        <div style={s.summary}>
          <h3 style={s.sumTitle}>Order Summary</h3>
          <div style={s.sumRow}><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div style={s.sumRow}>
            <span>Shipping</span>
            <span style={{ color: shippingCost === 0 ? '#22C55E' : '#3D1F0D' }}>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
          </div>
          {shippingCost > 0 && <p style={{ fontSize: 12, color: '#9C7B6A', marginBottom: 10 }}>Add ₹{499 - subtotal} more for free shipping</p>}
          <div style={s.divider} />
          <div style={{ ...s.sumRow, fontWeight: 700, fontSize: 18 }}><span>Total</span><span style={{ fontFamily: '"Playfair Display",serif' }}>₹{total}</span></div>
          <button onClick={() => user ? navigate('/checkout') : navigate('/login')} className="btn btn-primary btn-full" style={{ marginTop: 16, gap: 8 }}>
            {user ? 'Proceed to Checkout' : 'Login to Checkout'} <FiArrowRight size={16}/>
          </button>
          <Link to="/books" className="btn btn-ghost btn-full" style={{ marginTop: 8 }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

const s = {
  title:    { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 28 },
  grid:     { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' },
  itemsList:{ display: 'flex', flexDirection: 'column', gap: 14 },
  item:     { background: '#fff', border: '1px solid rgba(61,31,13,0.1)', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', gap: 16 },
  cover:    { width: 60, height: 80, borderRadius: '4px 8px 8px 4px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  coverSpine:{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'rgba(0,0,0,0.2)' },
  coverText:{ fontSize: 8, color: 'rgba(255,255,255,0.85)', textAlign: 'center', padding: '0 6px', lineHeight: 1.3, zIndex: 1, fontFamily: '"Playfair Display",serif' },
  itemInfo: { flex: 1 },
  itemTitle:{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: 15, color: '#1C1309', marginBottom: 3 },
  itemAuthor:{ fontSize: 12, color: '#9C7B6A', marginBottom: 6 },
  itemPrice:{ fontSize: 13, color: '#5C3317', fontWeight: 500 },
  qtyCtrl:  { display: 'flex', alignItems: 'center', gap: 10, background: '#FDF6EC', border: '1px solid rgba(61,31,13,0.15)', borderRadius: 8, padding: '5px 10px' },
  qBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#3D1F0D', display: 'flex', alignItems: 'center' },
  qNum:     { fontWeight: 700, minWidth: 20, textAlign: 'center', fontSize: 15 },
  lineTotal:{ fontWeight: 700, fontSize: 16, minWidth: 60, textAlign: 'right', fontFamily: '"Playfair Display",serif', color: '#3D1F0D' },
  removeBtn:{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 6, display: 'flex', alignItems: 'center' },
  summary:  { background: '#fff', border: '1px solid rgba(61,31,13,0.1)', borderRadius: 12, padding: 24, position: 'sticky', top: 90 },
  sumTitle: { fontFamily: '"Playfair Display",serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 },
  sumRow:   { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: '#3D1F0D' },
  divider:  { borderTop: '1px solid rgba(61,31,13,0.1)', margin: '14px 0' },
}

export default Cart
