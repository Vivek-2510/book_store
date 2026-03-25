import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiSearch } from 'react-icons/fi'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchUsers = () => {
    setLoading(true)
    api.get('/users', { params: { page, limit: 15, search: search || undefined } })
      .then(({ data }) => { setUsers(data.users); setTotal(data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, search])

  const toggleStatus = async (user) => {
    try {
      const { data } = await api.put(`/users/${user._id}/status`)
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: data.isActive } : u))
      toast.success(`User ${data.isActive ? 'activated' : 'suspended'}`)
    } catch { toast.error('Failed to update user') }
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Users</h1>
          <p style={{ color: '#9C7B6A', fontSize: 14 }}>{total} registered users</p>
        </div>
      </div>

      <div style={s.searchWrap}>
        <FiSearch size={15} style={{ color: '#9C7B6A' }}/>
        <input
          style={s.searchInput}
          placeholder="Search by name or email..."
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
                  {['User','Email','Role','Joined','Status','Action'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid rgba(61,31,13,0.07)', opacity: user.isActive ? 1 : 0.6 }}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={s.avatar}>{user.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: '#9C7B6A', fontFamily: 'JetBrains Mono,monospace' }}>{user._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}><span style={{ fontSize: 13 }}>{user.email}</span></td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, background: user.role === 'admin' ? 'rgba(217,119,6,0.12)' : 'rgba(61,31,13,0.08)', color: user.role === 'admin' ? '#D97706' : '#5C3317', padding: '3px 10px', borderRadius: 50, fontWeight: 600, textTransform: 'capitalize' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 12, color: '#9C7B6A' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, background: user.isActive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: user.isActive ? '#16A34A' : '#DC2626', padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={s.td}>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleStatus(user)}
                          style={{ ...s.actionBtn, color: user.isActive ? '#DC2626' : '#16A34A', borderColor: user.isActive ? 'rgba(220,38,38,0.3)' : 'rgba(22,163,74,0.3)', background: user.isActive ? 'rgba(220,38,38,0.07)' : 'rgba(22,163,74,0.07)' }}
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#9C7B6A' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {total > 15 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(61,31,13,0.08)', display: 'flex', gap: 8 }}>
              {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid', borderColor: p === page ? '#3D1F0D' : 'rgba(61,31,13,0.15)', background: p === page ? '#3D1F0D' : '#fff', color: p === page ? '#fff' : '#3D1F0D', cursor: 'pointer', fontSize: 13 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:      { fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: '#3D1F0D', marginBottom: 4 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid rgba(61,31,13,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, maxWidth: 420 },
  searchInput:{ border: 'none', outline: 'none', flex: 1, fontSize: 14, fontFamily: 'Inter,sans-serif', color: '#1C1309', background: 'transparent' },
  clearBtn:   { background: 'none', border: 'none', cursor: 'pointer', color: '#9C7B6A', fontSize: 14 },
  th:         { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#9C7B6A' },
  td:         { padding: '13px 16px' },
  avatar:     { width: 34, height: 34, borderRadius: '50%', background: '#3D1F0D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  actionBtn:  { padding: '5px 14px', borderRadius: 6, border: '1.5px solid', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' },
}
