import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import BookCard from '../components/book/BookCard'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [genres,   setGenres]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/books/featured'),
      api.get('/books/genres'),
    ]).then(([f, g]) => {
      setFeatured(f.data)
      setGenres(g.data)
    }).finally(() => setLoading(false))
  }, [])

  const genreIcons = { 'Classic Fiction':'📖', 'Dystopian Fiction':'🌑', 'Fantasy':'🧙', 'Self-Help':'🌟', 'Finance':'💰', 'Science Fiction':'🚀', 'Business':'💼', 'Fiction':'📚' }

  return (
    <div>
      {/* ── HERO ── */}
      <section style={s.hero}>
        <div className="container" style={s.heroInner}>
          <div style={s.heroText}>
            <div style={s.heroBadge}>✦ Free shipping on orders above ₹499</div>
            <h1 style={s.heroTitle}>
              Discover Your Next<br />
              <span style={{ color: '#D97706' }}>Favourite Book</span>
            </h1>
            <p style={s.heroDesc}>Explore thousands of books across every genre. From timeless classics to modern bestsellers — find your perfect read today.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/books" className="btn btn-secondary btn-lg">Browse Books</Link>
              <Link to="/books?genre=Self-Help" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Bestsellers →</Link>
            </div>
          </div>
          <div style={s.heroVisual}>
            {[{ t:'Atomic Habits',c:'#0f766e' },{ t:'The Alchemist',c:'#c2410c' },{ t:'1984',c:'#1c1c1c' }].map((b, i) => (
              <div key={i} style={{ ...s.heroBook, transform: `rotate(${[-8, 0, 8][i]}deg) translateY(${[6, 0, 6][i]}px)`, background: b.c, zIndex: [1, 3, 1][i] }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: 'rgba(0,0,0,0.3)' }} />
                <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 11, color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: 8, lineHeight: 1.3 }}>{b.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={s.statsBar}>
        <div className="container" style={s.statsInner}>
          {[['📚','500+','Books Available'],['🚚','Free','Shipping ₹499+'],['⭐','4.8','Average Rating'],['🔒','100%','Secure Checkout']].map(([icon, val, lbl]) => (
            <div key={lbl} style={s.statItem}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div><div style={s.statVal}>{val}</div><div style={s.statLbl}>{lbl}</div></div>
            </div>
          ))}
        </div>
      </section>

      <div className="container page-wrapper">
        {/* ── FEATURED BOOKS ── */}
        <section style={{ marginBottom: 56 }}>
          <div style={s.sectionHead}>
            <div>
              <div style={s.sectionEye}>✦ Handpicked for You</div>
              <h2 style={s.sectionTitle}>Featured Books</h2>
            </div>
            <Link to="/books" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 20 }}>
              {featured.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          )}
        </section>

        {/* ── GENRES ── */}
        <section style={{ marginBottom: 56 }}>
          <div style={s.sectionHead}>
            <div>
              <div style={s.sectionEye}>✦ Explore by Category</div>
              <h2 style={s.sectionTitle}>Browse Genres</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
            {genres.map(genre => (
              <Link key={genre} to={`/books?genre=${encodeURIComponent(genre)}`} style={s.genreCard}>
                <span style={{ fontSize: 28 }}>{genreIcons[genre] || '📘'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0D', marginTop: 8 }}>{genre}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BANNER ── */}
        <section style={s.banner}>
          <div>
            <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.8rem', color: '#fff', marginBottom: 10 }}>🎁 New Reader? Get 10% Off</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 20, fontSize: 15 }}>Sign up today and get a 10% discount on your first order.</p>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>
          <div style={s.bannerBooks}>
            {['📗','📕','📘','📙'].map((e, i) => <span key={i} style={{ fontSize: 48, transform: `rotate(${[-10,-3,5,12][i]}deg)` }}>{e}</span>)}
          </div>
        </section>
      </div>
    </div>
  )
}

const s = {
  hero:       { background: 'linear-gradient(135deg, #2D1508 0%, #3D1F0D 50%, #5C3317 100%)', padding: '64px 0', overflow: 'hidden' },
  heroInner:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  heroText:   { flex: 1, maxWidth: 560 },
  heroBadge:  { display: 'inline-block', background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.4)', color: '#D97706', fontSize: 12, padding: '6px 14px', borderRadius: 50, marginBottom: 20 },
  heroTitle:  { fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 18 },
  heroDesc:   { fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 },
  heroVisual: { display: 'flex', alignItems: 'flex-end', gap: -10, flexShrink: 0 },
  heroBook:   { width: 100, height: 150, borderRadius: '6px 10px 10px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '-4px 6px 20px rgba(0,0,0,0.5)', marginLeft: -12 },
  statsBar:   { background: '#fff', borderBottom: '1px solid rgba(61,31,13,0.1)', padding: '18px 0' },
  statsInner: { display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 },
  statItem:   { display: 'flex', alignItems: 'center', gap: 12 },
  statVal:    { fontSize: 18, fontWeight: 700, color: '#3D1F0D', fontFamily: '"Playfair Display",serif' },
  statLbl:    { fontSize: 12, color: '#9C7B6A' },
  sectionHead:{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 },
  sectionEye: { fontSize: 12, color: '#D97706', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 },
  sectionTitle:{ fontFamily: '"Playfair Display",serif', fontSize: '1.9rem', fontWeight: 700, color: '#3D1F0D' },
  genreCard:  { background: '#fff', border: '1px solid rgba(61,31,13,0.1)', borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: '0.22s', cursor: 'pointer', textDecoration: 'none' },
  banner:     { background: 'linear-gradient(135deg, #3D1F0D, #5C3317)', borderRadius: 16, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 },
  bannerBooks:{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
}
