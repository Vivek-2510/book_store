import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import BookCard from '../components/book/BookCard'
import { FiFilter, FiX } from 'react-icons/fi'

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books,    setBooks]    = useState([])
  const [genres,   setGenres]   = useState([])
  const [total,    setTotal]    = useState(0)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  const currentPage    = Number(searchParams.get('page'))    || 1
  const currentGenre   = searchParams.get('genre')           || ''
  const currentSearch  = searchParams.get('search')          || ''
  const currentSort    = searchParams.get('sort')            || 'newest'
  const currentMinPrice= searchParams.get('minPrice')        || ''
  const currentMaxPrice= searchParams.get('maxPrice')        || ''

  useEffect(() => {
    setLoading(true)
    const params = { page: currentPage, limit: 12 }
    if (currentSearch)   params.search   = currentSearch
    if (currentGenre)    params.genre    = currentGenre
    if (currentSort)     params.sort     = currentSort
    if (currentMinPrice) params.minPrice = currentMinPrice
    if (currentMaxPrice) params.maxPrice = currentMaxPrice

    api.get('/books', { params })
      .then(({ data }) => { setBooks(data.books); setTotal(data.total); setPages(data.pages) })
      .finally(() => setLoading(false))
  }, [searchParams])

  useEffect(() => {
    api.get('/books/genres').then(({ data }) => setGenres(data))
  }, [])

  const setParam = (key, val) => {
    const p = Object.fromEntries(searchParams)
    if (val) p[key] = val; else delete p[key]
    delete p.page
    setSearchParams(p)
  }

  const clearAll = () => setSearchParams({})

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', gap: 28 }}>
        {/* ── SIDEBAR FILTERS ── */}
        <aside style={{ ...s.sidebar, display: showFilter || window.innerWidth > 768 ? 'block' : 'none' }}>
          <div style={s.filterHead}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Filters</span>
            {(currentGenre || currentMinPrice || currentMaxPrice) && (
              <button onClick={clearAll} style={s.clearBtn}><FiX size={13} /> Clear All</button>
            )}
          </div>

          {/* Genre */}
          <div style={s.filterSection}>
            <div style={s.filterLabel}>Genre</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {genres.map(g => (
                <label key={g} style={s.checkLabel}>
                  <input type="radio" name="genre" checked={currentGenre === g} onChange={() => setParam('genre', g)} style={{ accentColor: '#D97706' }} />
                  <span style={{ fontSize: 13 }}>{g}</span>
                </label>
              ))}
              {currentGenre && (
                <button onClick={() => setParam('genre','')} style={s.clearBtn}>Clear genre</button>
              )}
            </div>
          </div>

          {/* Price */}
          <div style={s.filterSection}>
            <div style={s.filterLabel}>Price Range (₹)</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" placeholder="Min" value={currentMinPrice} onChange={e => setParam('minPrice', e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: 13 }} />
              <span style={{ color: '#9C7B6A' }}>—</span>
              <input type="number" placeholder="Max" value={currentMaxPrice} onChange={e => setParam('maxPrice', e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: 13 }} />
            </div>
          </div>

          {/* Sort */}
          <div style={s.filterSection}>
            <div style={s.filterLabel}>Sort By</div>
            <select value={currentSort} onChange={e => setParam('sort', e.target.value)} className="form-input" style={{ fontSize: 13 }}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1 }}>
          {/* Topbar */}
          <div style={s.topbar}>
            <div>
              <h1 style={s.pageTitle}>{currentSearch ? `Results for "${currentSearch}"` : currentGenre || 'All Books'}</h1>
              <p style={{ fontSize: 13, color: '#9C7B6A', marginTop: 2 }}>{total} books found</p>
            </div>
            <button onClick={() => setShowFilter(v => !v)} style={s.filterToggle}><FiFilter size={15} /> Filters</button>
          </div>

          {/* Active filters */}
          {(currentSearch || currentGenre) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {currentSearch && <span style={s.activeTag}>{currentSearch} <button onClick={() => setParam('search','')} style={s.tagClose}>✕</button></span>}
              {currentGenre  && <span style={s.activeTag}>{currentGenre} <button onClick={() => setParam('genre','')} style={s.tagClose}>✕</button></span>}
            </div>
          )}

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
              <div className="empty-title">No books found</div>
              <p className="empty-text">Try adjusting your filters or search terms</p>
              <button onClick={clearAll} className="btn btn-primary mt-16">Clear Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 20, marginBottom: 32 }}>
                {books.map(book => <BookCard key={book._id} book={book} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setParam('page', p)}
                      style={{ ...s.pageBtn, ...(currentPage === p ? s.pageBtnActive : {}) }}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  sidebar:     { width: 220, flexShrink: 0, background: '#fff', borderRadius: 12, border: '1px solid rgba(61,31,13,0.1)', padding: 20, alignSelf: 'flex-start', position: 'sticky', top: 90 },
  filterHead:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(61,31,13,0.1)' },
  clearBtn:    { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' },
  filterSection:{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid rgba(61,31,13,0.08)' },
  filterLabel: { fontSize: 12, fontWeight: 600, color: '#9C7B6A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 },
  checkLabel:  { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#3D1F0D' },
  topbar:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle:   { fontFamily: '"Playfair Display",serif', fontSize: '1.6rem', fontWeight: 700, color: '#3D1F0D' },
  filterToggle:{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1.5px solid rgba(61,31,13,0.2)', color: '#3D1F0D', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  activeTag:   { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,119,6,0.12)', color: '#D97706', padding: '4px 12px', borderRadius: 50, fontSize: 13, fontWeight: 500 },
  tagClose:    { background: 'none', border: 'none', cursor: 'pointer', color: '#D97706', fontSize: 13, padding: 0, lineHeight: 1 },
  pageBtn:     { width: 36, height: 36, borderRadius: 8, border: '1.5px solid rgba(61,31,13,0.15)', background: '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13 },
  pageBtnActive:{ background: '#3D1F0D', color: '#fff', borderColor: '#3D1F0D' },
}
