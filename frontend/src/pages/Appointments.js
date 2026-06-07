import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const timeSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

export default function Appointments() {
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ pet:'', vetName:'', vetClinic:'', date:'', time:'', reason:'', notes:'' });

  useEffect(() => {
    axios.get('/api/pets').then(r => { setPets(r.data); if(r.data.length) setForm(f => ({...f, pet: r.data[0]._id})); });
    fetchAppts();
  }, []);

  const fetchAppts = () => axios.get('/api/appointments').then(r => setAppointments(r.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/appointments', form);
      toast.success('Appointment booked! 📅');
      setShowForm(false);
      setForm(f => ({ pet:f.pet, vetName:'', vetClinic:'', date:'', time:'', reason:'', notes:'' }));
      fetchAppts();
    } catch { toast.error('Failed to book'); }
  };

  const handleCancel = async (id) => {
    await axios.put(`/api/appointments/${id}`, { status:'Cancelled' });
    toast.success('Appointment cancelled');
    fetchAppts();
  };

  const statusColor = (s) => s==='Confirmed'?'green':s==='Cancelled'?'red':'yellow';

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>📅 Appointments</h1><p>Book and manage vet appointments</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Book Appointment</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>📅 Book Vet Appointment</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group"><label>Pet *</label>
                  <select value={form.pet} onChange={e => setForm({...form,pet:e.target.value})} required>
                    {pets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Vet Name *</label><input value={form.vetName} onChange={e => setForm({...form,vetName:e.target.value})} placeholder="Dr. Sharma" required /></div>
                <div className="form-group"><label>Clinic Name</label><input value={form.vetClinic} onChange={e => setForm({...form,vetClinic:e.target.value})} placeholder="City Pet Clinic" /></div>
                <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} required min={new Date().toISOString().split('T')[0]} /></div>
                <div className="form-group"><label>Time *</label>
                  <select value={form.time} onChange={e => setForm({...form,time:e.target.value})} required>
                    <option value="">Select time</option>
                    {timeSlots.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Reason</label><input value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} placeholder="Regular checkup" /></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} rows={2} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="empty-state card"><div className="emoji">📅</div><h3>No appointments booked</h3><p>Schedule a vet visit for your pet</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {appointments.map(a => (
            <div className="card" key={a._id} style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <div style={{fontSize:'2.2rem'}}>🏥</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'1rem'}}>{a.vetName} {a.vetClinic && `— ${a.vetClinic}`}</div>
                <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>
                  {a.pet?.name} · {new Date(a.date).toLocaleDateString()} at {a.time}
                </div>
                {a.reason && <div style={{fontSize:'0.82rem',color:'var(--text-light)',marginTop:2}}>Reason: {a.reason}</div>}
              </div>
              <span className={`badge badge-${statusColor(a.status)}`}>{a.status}</span>
              {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                <button className="btn-danger" style={{padding:'6px 14px',fontSize:'0.8rem'}} onClick={() => handleCancel(a._id)}>Cancel</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
