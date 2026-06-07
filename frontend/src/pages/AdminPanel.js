import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    axios.get('/api/admin/stats').then(r => setStats(r.data)).catch(() => {});
    axios.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => {});
    axios.get('/api/admin/appointments').then(r => setAppointments(r.data)).catch(() => {});
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/admin/users/${id}`);
    toast.success('User deleted');
    setUsers(u => u.filter(x => x._id !== id));
  };

  const updateAppt = async (id, status) => {
    await axios.put(`/api/admin/appointments/${id}`, { status });
    toast.success('Appointment updated');
    setAppointments(a => a.map(x => x._id===id ? {...x, status} : x));
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>⚙️ Admin Panel</h1><p>Manage users, data, and monitor system activity</p></div>

      {stats && (
        <div className="grid-4" style={{marginBottom:32}}>
          {[['👥','Users',stats.users],['🐶','Pets',stats.pets],['🩺','Diagnoses',stats.diagnoses],['📅','Appointments',stats.appointments]].map(([icon,label,val]) => (
            <div className="card" key={label} style={{textAlign:'center'}}>
              <div style={{fontSize:'2rem',marginBottom:8}}>{icon}</div>
              <div style={{fontSize:'2rem',fontFamily:'var(--font-display)',color:'var(--green-700)',fontWeight:600}}>{val}</div>
              <div style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['overview','users','appointments'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{padding:'9px 20px',borderRadius:'50px',border:'1.5px solid var(--border)',background:tab===t?'var(--green-500)':'white',color:tab===t?'white':'var(--text-mid)',fontWeight:600,cursor:'pointer',textTransform:'capitalize',transition:'all 0.2s'}}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <h3 style={{marginBottom:16}}>👥 All Users ({users.length})</h3>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.88rem'}}>
              <thead>
                <tr style={{borderBottom:'2px solid var(--border)'}}>
                  {['Name','Email','Role','Joined','Actions'].map(h => <th key={h} style={{padding:'10px 12px',textAlign:'left',color:'var(--text-muted)',fontWeight:600}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{borderBottom:'1px solid var(--green-50)'}}>
                    <td style={{padding:'10px 12px',fontWeight:500}}>{u.name}</td>
                    <td style={{padding:'10px 12px',color:'var(--text-muted)'}}>{u.email}</td>
                    <td style={{padding:'10px 12px'}}><span className={`badge badge-${u.role==='admin'?'red':u.role==='vet'?'blue':'green'}`}>{u.role}</span></td>
                    <td style={{padding:'10px 12px',color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{padding:'10px 12px'}}>
                      {u.role !== 'admin' && <button className="btn-danger" style={{padding:'5px 12px',fontSize:'0.78rem'}} onClick={() => deleteUser(u._id)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="card">
          <h3 style={{marginBottom:16}}>📅 All Appointments ({appointments.length})</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {appointments.map(a => (
              <div key={a._id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px',background:'var(--cream)',borderRadius:'var(--radius-sm)',flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:'0.9rem'}}>{a.user?.name} — {a.pet?.name}</div>
                  <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{a.vetName} · {new Date(a.date).toLocaleDateString()} {a.time}</div>
                </div>
                <span className={`badge badge-${a.status==='Confirmed'?'green':a.status==='Cancelled'?'red':'yellow'}`}>{a.status}</span>
                <select value={a.status} onChange={e => updateAppt(a._id, e.target.value)} style={{padding:'5px 10px',borderRadius:'50px',border:'1px solid var(--border)',fontSize:'0.82rem'}}>
                  {['Pending','Confirmed','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div className="card">
          <h3 style={{marginBottom:16}}>📊 System Overview</h3>
          <div className="grid-2">
            {[['Total Users',stats?.users||0,'👥'],['Total Pets',stats?.pets||0,'🐶'],['Diagnoses Run',stats?.diagnoses||0,'🩺'],['Appointments',stats?.appointments||0,'📅'],['Forum Posts',stats?.posts||0,'💬']].map(([label,val,icon]) => (
              <div key={label} style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:'var(--cream)',borderRadius:'var(--radius-sm)'}}>
                <span style={{fontSize:'1.8rem'}}>{icon}</span>
                <div>
                  <div style={{fontSize:'1.5rem',fontFamily:'var(--font-display)',color:'var(--green-700)',fontWeight:600}}>{val}</div>
                  <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
