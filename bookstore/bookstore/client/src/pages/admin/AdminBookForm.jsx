import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const COVER_COLORS = ['#1a3a5c','#2d5a1b','#1c1c1c','#7c3aed','#c2410c','#0f766e','#1e40af','#92400e','#db2777','#065f46','#4f46e5','#0369a1','#b91c1c','#a16207']

const DEFAULT_FORM = {
  title:'', author:'', description:'', price:'', originalPrice:'', genre:'',
  isbn:'', pages:'', publisher:'', publishedYear:'', language:'English',
  stock:'', coverColor:'#4f46e5', tags:'', featured: false,
}

export default function AdminBookForm() {
  const navigate      = useNavigate()
  const { id }        = useParams()
  const isEdit        = Boolean(id)
  const [form, setForm]     = useState(DEFAULT_FORM)
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    api.get('/books/genres').then(({ data }) => setGenres(data))
    if (isEdit) {
      api.get(`/books/${id}`)
        .then(({ data }) => setForm({ ...DEFAULT_FORM, ...data, tags: data.tags?.join(', ') || '' }))
        .finally(() => setFetching(false))
    }
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.author || !form.price || !form.genre) {
      toast.error('Please fill all required fields'); return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        pages:         Number(form.pages)  || undefined,
        stock:         Number(form.stock)  || 0,
        publishedYear: Number(form.publishedYear) || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (isEdit) {
        await api.put(`/books/${id}`, payload)
        toast.success('Book updated successfully!')
      } else {
        await api.post('/books', payload)
        toast.success('Book added successfully!')
      }
      navigate('/admin/books')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="loader"><div className="spinner"/></div>

  const inp = (label, key, type='text', placeholder='', required=false) => (
    <div className="form-group">
      <label className="form-label">{label} {required && <span style={{ color: '#DC2626' }}>*</span>}</label>
      <input
        type={type}
        className="form-input"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        required={required}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
          <p style={{ color: '#9C7B6A', fontSize: 14 }}>{isEdit ? `Editing: ${form.title}` : 'Fill in the details to add a new book'}</p>
        </div>
        <button onClick={() => navigate('/admin/books')} className="btn btn-ghost btn-sm">← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Cover preview */}
        <div className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ ...s.coverPreview, background: form.coverColor }}>
            <div style={s.coverSpine}/>
            <div style={s.coverTitlePrev}>{form.title || 'Book Title'}</div>
            <div style={s.coverAuthorPrev}>{form.author || 'Author Name'}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="form-label">Cover Color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {COVER_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('coverColor', color)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: color, border: form.coverColor === color ? '3px solid #3D1F0D' : '2px solid transparent', cursor: 'pointer' }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={form.coverColor} onChange={e => set('coverColor', e.target.value)} style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6 }}/>
              <span style={{ fontSize: 13, color: '#9C7B6A' }}>Custom color</span>
            </div>
          </div>
        </div>

        {/* Main Info */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={s.sectionTitle}>📖 Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1/-1' }}>{inp('Title', 'title', 'text', 'Book title', true)}</div>
            {inp('Author', 'author', 'text', 'Author name', true)}
            <div className="form-group">
              <label className="form-label">Genre <span style={{ color: '#DC2626' }}>*</span></label>
              <select className="form-input" value={form.genre} onChange={e => set('genre', e.target.value)} required>
                <option value="">Select genre</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="__new__">+ Other (type below)</option>
              </select>
              {form.genre === '__new__' && (
                <input className="form-input" style={{ marginTop: 8 }} placeholder="Type new genre..." onChange={e => set('genre', e.target.value)} />
              )}
            </div>
            {inp('Language', 'language', 'text', 'English')}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea className="form-input" rows={3} placeholder="Book description..." value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={s.sectionTitle}>💰 Pricing & Stock</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {inp('Selling Price (₹)', 'price',         'number', '299', true)}
            {inp('Original Price (₹)',  'originalPrice', 'number', '399')}
            {inp('Stock Quantity',       'stock',         'number', '50',  true)}
          </div>
        </div>

        {/* Details */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={s.sectionTitle}>📋 Book Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {inp('ISBN',           'isbn',          'text',   '978-XXXXXXXXX')}
            {inp('Publisher',      'publisher',     'text',   'Publisher name')}
            {inp('Published Year', 'publishedYear', 'number', '2024')}
            {inp('Pages',          'pages',         'number', '320')}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="fiction, classic, award-winner" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Featured */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => set('featured', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#3D1F0D' }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>⭐ Feature this book</div>
              <div style={{ fontSize: 12, color: '#9C7B6A', marginTop: 2 }}>Featured books appear on the homepage</div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
            {loading ? 'Saving...' : isEdit ? '💾 Save Changes' : '✅ Add Book'}
          </button>
          <button type="button" onClick={() => navigate('/admin/books')} className="btn btn-ghost btn-lg">Cancel</button>
        </div>
      </form>
    </div>
  )
}

const s = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:       { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 4 },
  sectionTitle:{ fontFamily: '"Playfair Display",serif', fontSize: '1.1rem', fontWeight: 700, color: '#3D1F0D', marginBottom: 18 },
  coverPreview:{ width: 140, height: 200, borderRadius: '6px 10px 10px 6px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '-4px 6px 16px rgba(0,0,0,0.25)', flexShrink: 0 },
  coverSpine:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: 'rgba(0,0,0,0.25)', borderRadius: '6px 0 0 6px' },
  coverTitlePrev:{ fontFamily: '"Playfair Display",serif', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: '0 14px', lineHeight: 1.4, zIndex: 1 },
  coverAuthorPrev:{ fontSize: 10, color: 'rgba(255,255,255,0.65)', zIndex: 1, textAlign: 'center', padding: '0 10px' },
}
