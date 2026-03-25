import { Link } from 'react-router-dom'
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function BookCard({ book }) {
  const { addToCart } = useCart()
  const { user }      = useAuth()
  const discount      = book.originalPrice > book.price
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : 0

  const toggleWishlist = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to use wishlist'); return }
    try {
      await api.post(`/cart/wishlist/${book._id}`)
      toast.success('Wishlist updated!')
    } catch { toast.error('Failed to update wishlist') }
  }

  return (
    <div style={s.card}>
      <Link to={`/books/${book._id}`} style={s.coverLink}>
        <div style={{ ...s.cover, background: book.coverColor || '#4f46e5' }}>
          <div style={s.coverSpine} />
          <div style={s.coverTitle}>{book.title}</div>
          {discount > 0 && <div style={s.discountBadge}>-{discount}%</div>}
          {book.stock === 0 && <div style={s.outBadge}>Out of Stock</div>}
        </div>
      </Link>

      <div style={s.body}>
        <Link to={`/books/${book._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={s.title}>{book.title}</h3>
          <p style={s.author}>by {book.author}</p>
        </Link>

        <div style={s.meta}>
          <span style={s.genre}>{book.genre}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiStar size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <span style={s.rating}>{book.rating?.toFixed(1) || '0.0'}</span>
            <span style={s.reviews}>({book.reviewCount || 0})</span>
          </div>
        </div>

        <div style={s.footer}>
          <div style={s.priceGroup}>
            <span style={s.price}>₹{book.price}</span>
            {book.originalPrice > book.price && <span style={s.originalPrice}>₹{book.originalPrice}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={toggleWishlist} style={s.wishBtn} title="Add to wishlist"><FiHeart size={15} /></button>
            <button
              onClick={() => addToCart(book)}
              disabled={book.stock === 0}
              style={{ ...s.cartBtn, opacity: book.stock === 0 ? 0.5 : 1 }}
              title="Add to cart"
            >
              <FiShoppingCart size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  card:         { background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(61,31,13,0.1)', boxShadow: '0 2px 10px rgba(61,31,13,0.07)', transition: '0.25s', display: 'flex', flexDirection: 'column' },
  coverLink:    { display: 'block', textDecoration: 'none' },
  cover:        { height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  coverSpine:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: 'rgba(0,0,0,0.25)' },
  coverTitle:   { fontFamily: '"Playfair Display",serif', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', textAlign: 'center', padding: '0 16px', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.4)', zIndex: 1 },
  discountBadge:{ position: 'absolute', top: 8, right: 8, background: '#D97706', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 50 },
  outBadge:     { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(220,38,38,0.85)', color: '#fff', fontSize: 10, padding: '3px 10px', borderRadius: 50 },
  body:         { padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  title:        { fontFamily: '"Playfair Display",serif', fontSize: 15, fontWeight: 700, color: '#1C1309', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  author:       { fontSize: 12, color: '#9C7B6A' },
  meta:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  genre:        { fontSize: 11, background: 'rgba(61,31,13,0.08)', color: '#5C3317', padding: '2px 8px', borderRadius: 50, fontWeight: 500 },
  rating:       { fontSize: 12, fontWeight: 600, color: '#3D1F0D' },
  reviews:      { fontSize: 11, color: '#9C7B6A' },
  footer:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(61,31,13,0.07)' },
  priceGroup:   { display: 'flex', alignItems: 'baseline', gap: 6 },
  price:        { fontSize: 17, fontWeight: 700, color: '#3D1F0D', fontFamily: '"JetBrains Mono",monospace' },
  originalPrice:{ fontSize: 12, color: '#9C7B6A', textDecoration: 'line-through' },
  wishBtn:      { width: 32, height: 32, borderRadius: 8, background: 'rgba(61,31,13,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3317' },
  cartBtn:      { width: 32, height: 32, borderRadius: 8, background: '#3D1F0D', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
}
