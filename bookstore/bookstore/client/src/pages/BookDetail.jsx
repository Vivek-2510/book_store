import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiHeart, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Stars({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={size} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#E0D5C8', fill: i <= Math.round(rating) ? '#F59E0B' : 'none' }} />
      ))}
    </div>
  )
}

export default function BookDetail() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { user }      = useAuth()
  const [book,     setBook]    = useState(null)
  const [reviews,  setReviews] = useState([])
  const [qty,      setQty]     = useState(1)
  const [loading,  setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submitting,  setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/books/${id}`), api.get(`/reviews/${id}`)])
      .then(([b, r]) => { setBook(b.data); setReviews(r.data) })
      .catch(() => navigate('/books'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart  = () => addToCart(book, qty)
  const handleBuyNow     = () => { addToCart(book, qty); navigate('/cart') }
  const handleWishlist   = async () => {
    if (!user) { toast.error('Please login'); return }
    try { await api.post(`/cart/wishlist/${id}`); toast.success('Wishlist updated!') }
    catch { toast.error('Failed') }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to review'); return }
    setSubmitting(true)
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm)
      setReviews(prev => [data, ...prev])
      setBook(prev => ({ ...prev, rating: data.rating || prev.rating, reviewCount: (prev.reviewCount || 0) + 1 }))
      setReviewForm({ rating: 5, title: '', comment: '' })
      toast.success('Review submitted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!book)   return null

  const discount = book.originalPrice > book.price ? Math.round((1 - book.price / book.originalPrice) * 100) : 0

  return (
    <div className="container page-wrapper">
      <button onClick={() => navigate(-1)} style={s.back}><FiArrowLeft size={16} /> Back</button>

      <div style={s.topGrid}>
        {/* Cover */}
        <div style={s.coverWrap}>
          <div style={{ ...s.cover, background: book.coverColor }}>
            <div style={s.coverSpine} />
            <div style={s.coverTitle}>{book.title}</div>
          </div>
          {book.stock > 0 && book.stock <= 10 && (
            <div style={s.stockWarn}>⚠️ Only {book.stock} left!</div>
          )}
        </div>

        {/* Info */}
        <div style={s.info}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={s.genre}>{book.genre}</span>
            {book.featured && <span style={{ ...s.genre, background: 'rgba(217,119,6,0.12)', color: '#D97706' }}>⭐ Featured</span>}
            {book.stock === 0 && <span style={{ ...s.genre, background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}>Out of Stock</span>}
          </div>

          <h1 style={s.title}>{book.title}</h1>
          <p style={s.author}>by <strong style={{ color: '#5C3317' }}>{book.author}</strong></p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <Stars rating={book.rating} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{book.rating?.toFixed(1)}</span>
            <span style={{ color: '#9C7B6A', fontSize: 13 }}>({book.reviewCount} reviews)</span>
          </div>

          <div style={s.priceRow}>
            <span style={s.price}>₹{book.price}</span>
            {book.originalPrice > book.price && <>
              <span style={s.origPrice}>₹{book.originalPrice}</span>
              <span style={s.discountBadge}>{discount}% OFF</span>
            </>}
          </div>

          <p style={s.desc}>{book.description}</p>

          <div style={s.metaGrid}>
            {[['Publisher', book.publisher],['Year', book.publishedYear],['Pages', book.pages],['Language', book.language],['ISBN', book.isbn]].filter(([,v]) => v).map(([k,v]) => (
              <div key={k}><div style={s.metaKey}>{k}</div><div style={s.metaVal}>{v}</div></div>
            ))}
          </div>

          {book.stock > 0 && (
            <div style={s.qtyRow}>
              <span style={s.metaKey}>Quantity:</span>
              <div style={s.qtyControl}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={s.qtyBtn}><FiMinus size={13} /></button>
                <span style={s.qtyNum}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(book.stock, q+1))} style={s.qtyBtn}><FiPlus size={13} /></button>
              </div>
            </div>
          )}

          <div style={s.actions}>
            <button onClick={handleAddToCart} disabled={book.stock === 0} className="btn btn-primary" style={{ gap: 8 }}>
              <FiShoppingCart size={16} /> {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={book.stock === 0} className="btn btn-secondary">Buy Now</button>
            <button onClick={handleWishlist} style={s.wishBtn}><FiHeart size={18} /></button>
          </div>

          <div style={s.shippingInfo}>
            <span>🚚 Free delivery on orders above ₹499</span>
            <span>↩️ Easy 7-day returns</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section style={{ marginTop: 52 }}>
        <h2 style={s.sectionTitle}>Customer Reviews</h2>

        {/* Add Review */}
        {user && (
          <form onSubmit={handleReview} style={s.reviewForm}>
            <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.1rem', marginBottom: 14 }}>Write a Review</h3>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <FiStar size={22} style={{ color: star <= reviewForm.rating ? '#F59E0B' : '#D1C4B0', fill: star <= reviewForm.rating ? '#F59E0B' : 'none' }} />
                </button>
              ))}
            </div>
            <input required className="form-input" placeholder="Review title" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 10 }} />
            <textarea required className="form-input" rows={3} placeholder="Share your experience..." value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} style={{ marginBottom: 12 }} />
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">{submitting ? 'Submitting...' : 'Submit Review'}</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: '#9C7B6A', textAlign: 'center', padding: 36 }}>No reviews yet. Be the first!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {reviews.map(r => (
              <div key={r._id} style={s.reviewCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={s.revAvatar}>{r.user?.name?.[0] || 'U'}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#9C7B6A' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <Stars rating={r.rating} size={14} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{r.title}</div>
                <p style={{ fontSize: 14, color: '#5C4033', lineHeight: 1.65 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const s = {
  back:         { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#9C7B6A', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0 },
  topGrid:      { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 48, alignItems: 'flex-start' },
  coverWrap:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 },
  cover:        { width: 220, height: 320, borderRadius: '8px 14px 14px 8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '-6px 8px 24px rgba(0,0,0,0.3)' },
  coverSpine:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'rgba(0,0,0,0.25)', borderRadius: '8px 0 0 8px' },
  coverTitle:   { fontFamily: '"Playfair Display",serif', fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: '0 18px', lineHeight: 1.4, textShadow: '0 2px 6px rgba(0,0,0,0.4)', zIndex: 1 },
  stockWarn:    { fontSize: 13, color: '#D97706', background: 'rgba(217,119,6,0.1)', padding: '6px 14px', borderRadius: 8, fontWeight: 500 },
  info:         { display: 'flex', flexDirection: 'column', gap: 0 },
  genre:        { fontSize: 12, background: 'rgba(61,31,13,0.08)', color: '#5C3317', padding: '3px 10px', borderRadius: 50, fontWeight: 500 },
  title:        { fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, color: '#1C1309', lineHeight: 1.15 },
  author:       { fontSize: 15, color: '#9C7B6A', marginTop: 6 },
  priceRow:     { display: 'flex', alignItems: 'baseline', gap: 10, margin: '14px 0' },
  price:        { fontFamily: '"Playfair Display",serif', fontSize: 28, fontWeight: 800, color: '#3D1F0D' },
  origPrice:    { fontSize: 16, color: '#9C7B6A', textDecoration: 'line-through' },
  discountBadge:{ fontSize: 13, background: '#22C55E', color: '#fff', padding: '2px 10px', borderRadius: 50, fontWeight: 600 },
  desc:         { fontSize: 14, color: '#5C4033', lineHeight: 1.8, marginBottom: 18 },
  metaGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14, background: '#FDF6EC', borderRadius: 10, padding: 16, marginBottom: 20 },
  metaKey:      { fontSize: 11, color: '#9C7B6A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 },
  metaVal:      { fontSize: 13, fontWeight: 600, color: '#3D1F0D' },
  qtyRow:       { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  qtyControl:   { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1.5px solid rgba(61,31,13,0.15)', borderRadius: 8, padding: '4px 8px' },
  qtyBtn:       { background: 'none', border: 'none', cursor: 'pointer', color: '#3D1F0D', display: 'flex', alignItems: 'center', padding: 4 },
  qtyNum:       { fontWeight: 700, fontSize: 16, minWidth: 28, textAlign: 'center' },
  actions:      { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
  wishBtn:      { width: 44, height: 44, borderRadius: 8, background: '#FDF6EC', border: '1.5px solid rgba(61,31,13,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3317' },
  shippingInfo: { display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#9C7B6A' },
  sectionTitle: { fontFamily: '"Playfair Display",serif', fontSize: '1.6rem', fontWeight: 700, color: '#3D1F0D', marginBottom: 20 },
  reviewForm:   { background: '#fff', border: '1px solid rgba(61,31,13,0.1)', borderRadius: 12, padding: 24, marginBottom: 24 },
  reviewCard:   { background: '#fff', border: '1px solid rgba(61,31,13,0.1)', borderRadius: 12, padding: 20 },
  revAvatar:    { width: 36, height: 36, borderRadius: '50%', background: '#3D1F0D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 },
}
