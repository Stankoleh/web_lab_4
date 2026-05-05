import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import api, { getErrorText } from './services/api.js';

function Layout({ user, setUser, children }) {
  const navigate = useNavigate();
  async function logout() {
    try { await api.post('/logout/'); } catch (_) {}
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon">♫</div><div><b>MusicLab</b><span>Lab 4 CRUD</span></div></div>
      <nav className="side-nav">
        <Link to="/users">Users</Link>
        <Link to="/playlists">Playlists</Link>
      </nav>
      <div className="profile-card">
        <span className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
        <div><b>{user?.username}</b><p>{user?.role}</p></div>
      </div>
      <button className="button button-ghost full" onClick={logout}>Logout</button>
    </aside>
    <main className="content">{children}</main>
  </div>;
}

function Login({ setUser }) {
  const [form, setForm] = useState({ username: 'admin', password: 'admin' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/login/', form);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/users');
    } catch (err) { setError(getErrorText(err)); }
  }
  return <div className="login-page">
    <section className="login-card">
      <div className="brand login-brand"><div className="brand-icon">♫</div><div><b>MusicLab</b><span>Django + React</span></div></div>
      <h1>Login</h1>
      <p className="muted">Use demo account: admin / admin</p>
      {error && <p className="error-box">{error}</p>}
      <form onSubmit={submit}>
        <label className="field">Username<input value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/></label>
        <label className="field">Password<input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/></label>
        <button className="button full">Login</button>
      </form>
    </section>
  </div>;
}

function PageHeader({ title, text, action }) {
  return <div className="toolbar"><div><h1>{title}</h1><p>{text}</p></div>{action}</div>;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'regular' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = async () => setUsers((await api.get('/users/')).data);
  useEffect(()=>{ load().catch(err=>setError(getErrorText(err))); }, []);
  async function save(e) {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, username: form.username.trim().replaceAll(' ', '_') };
      if (editing) await api.put(`/users/${editing}/`, payload); else await api.post('/users/', payload);
      setForm({ username: '', password: '', role: 'regular' }); setEditing(null); await load();
    } catch (err) { setError(getErrorText(err)); }
  }
  async function remove(id) { if (!confirm('Delete user?')) return; await api.delete(`/users/${id}/`); await load(); }
  return <>
    <PageHeader title="Users listing" text="Login/logout, roles, users listing and CRUD operations" action={<Link className="button" to="/playlists">Open playlists</Link>} />
    {error && <div className="error-box">{error}</div>}
    <div className="grid two">
      <section className="card"><h2>Users</h2><table className="table"><thead><tr><th>username</th><th>role</th><th>actions</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><b>{u.username}</b></td><td><span className={`badge ${u.role === 'admin' ? 'admin' : ''}`}>{u.role}</span></td><td className="actions"><button className="button button-teal" onClick={()=>alert(`User: ${u.username}\nRole: ${u.role}`)}>view</button><button className="button button-secondary" onClick={()=>{setEditing(u.id); setForm({username:u.username,password:'',role:u.role});}}>edit</button><button className="button button-danger" onClick={()=>remove(u.id)}>delete</button></td></tr>)}</tbody></table></section>
      <section className="card"><h2>{editing ? 'Edit user' : 'Create user dialog'}</h2><form onSubmit={save}>
        <label className="field">username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Oleh_Stanko" required/></label>
        <label className="field">password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={editing ? 'leave empty to keep old password' : 'password'} required={!editing}/></label>
        <label className="field">role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="regular">regular</option><option value="admin">admin</option></select></label>
        <div className="button-row"><button className="button">{editing ? 'save' : 'ok'}</button>{editing && <button type="button" className="button button-secondary" onClick={()=>{setEditing(null);setForm({username:'',password:'',role:'regular'});}}>cancel</button>}</div>
      </form></section>
    </div>
  </>;
}

function SongList({ playlist, onChanged }) {
  const [form, setForm] = useState({ title: '', artist: '', duration: '', url: '' });
  const [error, setError] = useState('');
  async function addSong(e) {
    e.preventDefault(); setError('');
    try {
      await api.post(`/playlists/${playlist.id}/songs/`, { ...form, position: (playlist.songs?.length || 0) + 1 });
      setForm({ title: '', artist: '', duration: '', url: '' });
      await onChanged();
    } catch (err) { setError(getErrorText(err)); }
  }
  async function deleteSong(songId) {
    if (!confirm('Delete song?')) return;
    await api.delete(`/playlists/${playlist.id}/songs/${songId}/`);
    await onChanged();
  }
  return <div className="song-panel">
    <h3>Music in playlist</h3>
    {error && <p className="error-box">{error}</p>}
    <div className="track-list">{playlist.songs?.length ? playlist.songs.map(song => <div className="track" key={song.id}>
      <div className="track-num">{song.position}</div><div><b>{song.title}</b><p>{song.artist || 'Unknown artist'} {song.duration ? `• ${song.duration}` : ''}</p>{song.url && <a href={song.url} target="_blank">open track</a>}</div>
      <button className="mini-danger" onClick={()=>deleteSong(song.id)}>×</button>
    </div>) : <p className="muted">No songs yet. Add the first track below.</p>}</div>
    <form className="song-form" onSubmit={addSong}>
      <input required placeholder="Song title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <input placeholder="Artist" value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})}/>
      <input placeholder="03:45" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/>
      <input placeholder="Track URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/>
      <button className="button">Add music</button>
    </form>
  </div>;
}

function Playlists() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: '', visibility: '' });
  const [form, setForm] = useState({ name: '', description: '', coverUrl: '', isPublic: true });
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  async function load() { setError(''); const res = await api.get('/playlists/', { params: filters }); setItems(res.data); }
  useEffect(()=>{ load().catch(err=>setError(getErrorText(err))); }, []);
  const selected = useMemo(() => items.find(p => p.id === selectedId) || items[0], [items, selectedId]);
  async function create(e) { e.preventDefault(); try { await api.post('/playlists/', form); setForm({ name:'', description:'', coverUrl:'', isPublic:true }); await load(); } catch(err){ setError(getErrorText(err)); } }
  async function remove(id) { if (!confirm('Delete playlist?')) return; await api.delete(`/playlists/${id}/`); await load(); }
  return <>
    <PageHeader title="Playlists" text="Playlist cards, filtering, details, create/delete and music tracks inside each playlist" action={<Link className="button button-secondary" to="/users">Back to users</Link>} />
    {error && <div className="error-box">{error}</div>}
    <div className="playlist-layout">
      <section className="card"><h2>Filter</h2><div className="filters"><input placeholder="search playlist" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/><select value={filters.visibility} onChange={e=>setFilters({...filters,visibility:e.target.value})}><option value="">all</option><option value="public">public</option><option value="private">private</option></select><button className="button" onClick={load}>apply</button></div>
        <div className="playlist-cards">{items.map(p=><article className={`playlist-card ${selected?.id === p.id ? 'active' : ''}`} key={p.id} onClick={()=>setSelectedId(p.id)}>
          <div className="cover">{p.coverUrl ? <img src={p.coverUrl} alt=""/> : <span>♫</span>}</div>
          <div className="playlist-info"><h3>{p.name}</h3><p>{p.description || 'No description'}</p><div className="meta"><span>{p.owner_username}</span><span>{p.songs_count || p.songs?.length || 0} songs</span><span className={`badge ${p.isPublic ? 'public' : ''}`}>{p.isPublic ? 'public' : 'private'}</span></div></div>
          <button className="mini-danger" onClick={(e)=>{e.stopPropagation(); remove(p.id);}}>×</button>
        </article>)}</div>
      </section>
      <section className="card"><h2>Create playlist</h2><form onSubmit={create}>
        <label className="field">name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label className="field">description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
        <label className="field">cover url<input value={form.coverUrl} onChange={e=>setForm({...form,coverUrl:e.target.value})}/></label>
        <label className="check"><input type="checkbox" checked={form.isPublic} onChange={e=>setForm({...form,isPublic:e.target.checked})}/> public playlist</label>
        <button className="button full">create</button>
      </form>
      {selected && <SongList playlist={selected} onChanged={load}/>}</section>
    </div>
  </>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(()=>{ const token=localStorage.getItem('token'); if(!token){setReady(true);return;} api.get('/me/').then(r=>setUser(r.data)).catch(()=>localStorage.removeItem('token')).finally(()=>setReady(true)); }, []);
  if (!ready) return <div className="loading">Loading...</div>;
  return <Routes><Route path="/login" element={<Login setUser={setUser}/>}/><Route path="/*" element={user ? <Layout user={user} setUser={setUser}><Routes><Route path="/users" element={<Users/>}/><Route path="/playlists" element={<Playlists/>}/><Route path="*" element={<Navigate to="/users"/>}/></Routes></Layout> : <Navigate to="/login"/>}/></Routes>;
}
