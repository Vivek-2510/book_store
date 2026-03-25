import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiEye, FiEyeOff } from 'react-icons/fi'

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function Login() {
  const { login, loading }   = useAuth()
  const navigate             = useNavigate()
  const location             = useLocation()
  const from                 = location.state?.from || '/'
  const [email,    setEmail] = useState('')
  const [password, setPass]  = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await login(email, password)
    if (res.success) navigate(res.role === 'admin' ? '/admin' : from, { replace: true })
  }

  return (
    <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={s.card}>
        <div style={s.logo}>📚</div>
        <h2 style={s.title}>Welcome Back</h2>
        <p style={s.sub}>Sign in to your BookNest account</p>

        <div style={s.demoBox}>
          <strong>Demo Credentials</strong><br/>
          Admin: admin@bookstore.com / admin123<br/>
          User: john@example.com / user123
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Your password" value={password} onChange={e => setPass(e.target.value)} required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn}>{showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={s.switchText}>Don't have an account? <Link to="/register" style={s.link}>Sign up</Link></p>
      </div>
    </div>
  )
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export function Register() {
  const { register, loading } = useAuth()
  const navigate              = useNavigate()
  const [name,     setName]   = useState('')
  const [email,    setEmail]  = useState('')
  const [password, setPass]   = useState('')
  const [showPass, setShow]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await register(name, email, password)
    if (res.success) navigate('/')
  }

  return (
    <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={s.card}>
        <div style={s.logo}>📚</div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>Join BookNest and start reading</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={password} onChange={e => setPass(e.target.value)} required minLength={6} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShow(v => !v)} style={s.eyeBtn}>{showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={s.switchText}>Already have an account? <Link to="/login" style={s.link}>Sign in</Link></p>
      </div>
    </div>
  )
}

const s = {
  card:      { background: '#fff', borderRadius: 16, padding: '40px 44px', width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(61,31,13,0.12)', border: '1px solid rgba(61,31,13,0.08)' },
  logo:      { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title:     { fontFamily: '"Playfair Display",serif', fontSize: '1.8rem', fontWeight: 800, color: '#3D1F0D', textAlign: 'center', marginBottom: 6 },
  sub:       { color: '#9C7B6A', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  demoBox:   { background: '#FDF6EC', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#5C3317', marginBottom: 20, lineHeight: 1.7 },
  eyeBtn:    { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C7B6A', display: 'flex', alignItems: 'center' },
  switchText:{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#9C7B6A' },
  link:      { color: '#D97706', fontWeight: 600 },
}

export default Login
