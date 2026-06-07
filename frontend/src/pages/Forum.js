import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const categories = ['General','Health','Nutrition','Training','Emergency'];

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', content:'', category:'General' });
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchPosts(); }, []);
  const fetchPosts = () => axios.get('/api/forum').then(r => setPosts(r.data));

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/forum', form);
      toast.success('Post created!');
      setShowForm(false); setForm({ title:'', content:'', category:'General' });
      fetchPosts();
    } catch { toast.error('Failed to post'); }
  };

  const handleLike = async (id) => {
    await axios.post(`/api/forum/${id}/like`);
    fetchPosts();
  };

  const handleComment = async (id) => {
    if (!commentText.trim()) return;
    await axios.post(`/api/forum/${id}/comment`, { content: commentText });
    setCommentText('');
    fetchPosts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/forum/${id}`);
    toast.success('Post deleted');
    fetchPosts();
  };

  const catColors = { General:'badge-blue', Health:'badge-green', Nutrition:'badge-yellow', Training:'badge-blue', Emergency:'badge-red' };
  const filtered = filter === 'All' ? posts : posts.filter(p => p.category === filter);

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>💬 Community Forum</h1><p>Share experiences and connect with fellow pet owners</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Post</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        {['All',...categories].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{padding:'7px 18px',borderRadius:'50px',border:'1.5px solid var(--border)',background: filter===c?'var(--mint)':'white',color: filter===c?'var(--green-800)':'var(--text-mid)',fontWeight: filter===c?600:400,cursor:'pointer',fontSize:'0.85rem'}}>
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>📝 Create New Post</h3>
            <form onSubmit={handlePost}>
              <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="What's on your mind?" required /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Content *</label><textarea value={form.content} onChange={e => setForm({...form,content:e.target.value})} rows={5} placeholder="Share your experience or question..." required /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state card"><div className="emoji">💬</div><h3>No posts yet</h3><p>Be the first to start a conversation!</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {filtered.map(post => (
            <div className="card" key={post._id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <h3 style={{fontSize:'1.05rem',marginBottom:6}}>{post.title}</h3>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span className={`badge ${catColors[post.category]||'badge-blue'}`}>{post.category}</span>
                    <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>by {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {post.author?._id === user?.id && (
                  <button onClick={() => handleDelete(post._id)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'1rem'}}>🗑️</button>
                )}
              </div>
              <p style={{fontSize:'0.9rem',color:'var(--text-mid)',marginBottom:14,lineHeight:1.6}}>{post.content}</p>
              <div style={{display:'flex',gap:16,alignItems:'center'}}>
                <button onClick={() => handleLike(post._id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.88rem',color:'var(--text-light)'}}>
                  ❤️ {post.likes?.length || 0}
                </button>
                <button onClick={() => setExpandedPost(expandedPost===post._id?null:post._id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.88rem',color:'var(--green-600)',fontWeight:500}}>
                  💬 {post.comments?.length || 0} comments
                </button>
              </div>
              {expandedPost === post._id && (
                <div style={{marginTop:16,borderTop:'1px solid var(--border)',paddingTop:16}}>
                  {post.comments?.map((c,i) => (
                    <div key={i} style={{background:'var(--green-50)',borderRadius:'var(--radius-sm)',padding:'10px 14px',marginBottom:8}}>
                      <div style={{fontWeight:600,fontSize:'0.82rem',marginBottom:3}}>{c.author?.name}</div>
                      <div style={{fontSize:'0.88rem',color:'var(--text-mid)'}}>{c.content}</div>
                    </div>
                  ))}
                  <div style={{display:'flex',gap:8,marginTop:12}}>
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." style={{flex:1,padding:'9px 14px',border:'1.5px solid var(--border)',borderRadius:'50px',fontSize:'0.88rem',outline:'none'}} onKeyDown={e => e.key==='Enter' && handleComment(post._id)} />
                    <button className="btn-primary" style={{padding:'9px 20px',fontSize:'0.85rem'}} onClick={() => handleComment(post._id)}>Send</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
