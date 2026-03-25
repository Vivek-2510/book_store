import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiStar } from 'react-icons/fi'

export default function AdminBooks() {
  const [books,   setBooks]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  const fetchBooks = () => {
    setLoading(true)
    api.get('/books', { params: { page, limit: 15, search: search || undefined } })
      .then(({ data }) => { setBooks(data.books); setTotal(data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBooks() }, [page, search])

  const deleteBook = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await api.delete(`/books/${id}`)
      toast.success('Book deleted')
      fetchBooks()
    } catch { toast.error('Failed to delete') }
  }

  const toggleFeatured = async (book) => {
    try {
      await api.put(`/books/${book._id}`, { featured: !book.featured })
      setBooks(prev => prev.map(b => b._id === book._id ? { ...b, featured: !b.featured } : b))
      toast.success(book.featured ? 'Removed from featured' : 'Added to featured')
    } catch { toast.error('Failed to update') }
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Books</h1>
          <p style={{ color: '#9C7B6A', fontSize: 14 }}>{total} books in catalog</p>
        </div>
        <Link to="/admin/books/new" className="btn btn-primary" style={{ gap: 8 }}>
          <FiPlus size={16}/> Add New Book
        </Link>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <FiSearch size={15} style={{ color: '#9C7B6A' }}/>
        <input
          style={s.searchInput}
          placeholder="Search by title, author..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        {search && <button onClick={() => setSearch('')} style={s.clearBtn}>✕</button>}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"/></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FDF6EC' }}>
                  {['Book','Genre','Price','Stock','Rating','Featured','Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id} style={{ borderBottom: '1px solid rgba(61,31,13,0.07)' }}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ ...s.miniCover, background: book.coverColor }}>
                          <div style={s.miniSpine}/>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#1C1309', maxWidth: 200 }}>{book.title}</div>
                          <div style={{ fontSize: 11, color: '#9C7B6A' }}>by {book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}><span style={s.genreBadge}>{book.genre}</span></td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>₹{book.price}</div>
                      {book.originalPrice > book.price && (
                        <div style={{ fontSize: 11, color: '#9C7B6A', textDecoration: 'line-through' }}>₹{book.originalPrice}</div>
                      )}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 700, color: book.stock === 0 ? '#DC2626' : book.stock <= 5 ? '#D97706' : '#16A34A', fontSize: 14 }}>
                        {book.stock}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiStar size={13} style={{ color: '#F59E0B', fill: '#F59E0B' }}/>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{book.rating?.toFixed(1)}</span>
                        <span style={{ fontSize: 11, color: '#9C7B6A' }}>({book.reviewCount})</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <button
                        onClick={() => toggleFeatured(book)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                        title={book.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {book.featured ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/books/${book._id}/edit`} style={s.editBtn} title="Edit">
                          <FiEdit2 size={14}/>
                        </Link>
                        <button onClick={() => deleteBook(book._id, book.title)} style={s.deleteBtn} title="Delete">
                          <FiTrash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(61,31,13,0.08)', display: 'flex', gap: 8, justifyContent: 'center' }}>
              {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid', borderColor: p === page ? '#3D1F0D' : 'rgba(61,31,13,0.15)', background: p === page ? '#3D1F0D' : '#fff', color: p === page ? '#fff' : '#3D1F0D', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                >{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:      { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 4 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid rgba(61,31,13,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, maxWidth: 420 },
  searchInput:{ border: 'none', outline: 'none', flex: 1, fontSize: 14, fontFamily: 'Inter,sans-serif', color: '#1C1309', background: 'transparent' },
  clearBtn:   { background: 'none', border: 'none', cursor: 'pointer', color: '#9C7B6A', fontSize: 14 },
  th:         { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#9C7B6A', whiteSpace: 'nowrap' },
  td:         { padding: '13px 16px' },
  miniCover:  { width: 36, height: 50, borderRadius: '3px 6px 6px 3px', position: 'relative', flexShrink: 0 },
  miniSpine:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'rgba(0,0,0,0.2)', borderRadius: '3px 0 0 3px' },
  genreBadge: { fontSize: 11, background: 'rgba(61,31,13,0.08)', color: '#5C3317', padding: '3px 9px', borderRadius: 50, fontWeight: 500, whiteSpace: 'nowrap' },
  editBtn:    { width: 32, height: 32, borderRadius: 7, background: 'rgba(37,99,235,0.1)', border: 'none', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  deleteBtn:  { width: 32, height: 32, borderRadius: 7, background: 'rgba(220,38,38,0.1)', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
