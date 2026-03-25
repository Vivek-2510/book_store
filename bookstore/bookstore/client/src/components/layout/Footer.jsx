import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div className="container">
        <div style={s.grid}>
          <div>
            <div style={s.logo}>📚 <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, fontWeight: 800 }}>Book<span style={{ color: '#D97706' }}>Nest</span></span></div>
            <p style={s.tagline}>Your cozy corner for every book lover. Discover, explore, and read.</p>
          </div>
          <div>
            <div style={s.heading}>Quick Links</div>
            {[['/','/','Home'],['Books','/books','Browse Books'],['Cart','/cart','My Cart'],['Orders','/orders','My Orders']].map(([,path,label]) =>
              <Link key={path} to={path} style={s.link}>{label}</Link>
            )}
          </div>
          <div>
            <div style={s.heading}>Genres</div>
            {['Fiction','Self-Help','Finance','Science Fiction','Fantasy','Business'].map(g =>
              <Link key={g} to={`/books?genre=${g}`} style={s.link}>{g}</Link>
            )}
          </div>
          <div>
            <div style={s.heading}>Support</div>
            <p style={s.link}>📧 support@booknest.com</p>
            <p style={s.link}>📞 1800-BOOK-NEST</p>
            <p style={{ ...s.link, marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Free shipping on orders above ₹499</p>
          </div>
        </div>
        <div style={s.bottom}>
          <span>© 2024 BookNest. All rights reserved.</span>
          <span>Built with ❤️ using MERN Stack</span>
        </div>
      </div>
    </footer>
  )
}

const s = {
  footer:  { background: '#2D1508', color: 'rgba(255,255,255,0.7)', marginTop: 'auto', paddingTop: 48, paddingBottom: 24 },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 32, marginBottom: 36 },
  logo:    { display: 'flex', alignItems: 'center', gap: 10, color: '#fff', marginBottom: 12, fontSize: 14 },
  tagline: { fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)' },
  heading: { fontSize: 13, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 },
  link:    { display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, transition: '0.2s' },
  bottom:  { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' },
}
