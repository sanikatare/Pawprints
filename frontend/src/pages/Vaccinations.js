import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const vaccines = ['Rabies','Distemper','Parvovirus','Hepatitis','Leptospirosis','Bordetella','Lyme Disease','Influenza','Other'];

export default function Vaccinations() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [vaccinations, setVaccinations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vaccineName:'', dateAdministered:'', nextDueDate:'', veterinarian:'', notes:'' });

  useEffect(() => { axios.get('/api/pets').then(r => { setPets(r.data); if(r.data.length) setSelectedPet(r.data[0]._id); }); }, []);
  useEffect(() => { if(selectedPet) axios.get(`/api/vaccinations/${selectedPet}`).then(r => setVaccinations(r.data)); }, [selectedPet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/vaccinations', { ...form, pet: selectedPet });
      toast.success('Vaccination record added! 💉');
      setShowForm(false);
      setForm({ vaccineName:'', dateAdministered:'', nextDueDate:'', veterinarian:'', notes:'' });
      axios.get(`/api/vaccinations/${selectedPet}`).then(r => setVaccinations(r.data));
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/vaccinations/${id}`);
    toast.success('Record deleted');
    setVaccinations(v => v.filter(x => x._id !== id));
  };

  const isDueSoon = (d) => { if(!d) return false; const diff = (new Date(d) - new Date()) / (1000*60*60*24); return diff <= 30 && diff >= 0; };
  const isOverdue = (d) => { if(!d) return false; return new Date(d) < new Date(); };

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>💉 Vaccinations</h1><p>Track vaccination records and set reminders</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Record</button>
      </div>

      <div className="form-group" style={{maxWidth:280,marginBottom:24}}>
        <label>Select Pet</label>
        <select value={selectedPet} onChange={e => setSelectedPet(e.target.value)}>
          {pets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>💉 Add Vaccination Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group"><label>Vaccine Name *</label>
                  <select value={form.vaccineName} onChange={e => setForm({...form,vaccineName:e.target.value})} required>
                    <option value="">Select vaccine</option>
                    {vaccines.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Date Administered</label><input type="date" value={form.dateAdministered} onChange={e => setForm({...form,dateAdministered:e.target.value})} /></div>
                <div className="form-group"><label>Next Due Date</label><input type="date" value={form.nextDueDate} onChange={e => setForm({...form,nextDueDate:e.target.value})} /></div>
                <div className="form-group"><label>Veterinarian</label><input value={form.veterinarian} onChange={e => setForm({...form,veterinarian:e.target.value})} placeholder="Dr. Smith" /></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} rows={2} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vaccinations.length === 0 ? (
        <div className="empty-state card"><div className="emoji">💉</div><h3>No vaccination records</h3><p>Add your pet's vaccination history</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {vaccinations.map(v => (
            <div className="card" key={v._id} style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{fontSize:'2rem'}}>💉</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'1rem'}}>{v.vaccineName}</div>
                {v.dateAdministered && <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Given: {new Date(v.dateAdministered).toLocaleDateString()}</div>}
                {v.veterinarian && <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Vet: {v.veterinarian}</div>}
              </div>
              {v.nextDueDate && (
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Next due</div>
                  <div style={{fontWeight:600,fontSize:'0.88rem',color: isOverdue(v.nextDueDate)?'#c0392b':isDueSoon(v.nextDueDate)?'#e67e22':'var(--green-600)'}}>
                    {new Date(v.nextDueDate).toLocaleDateString()}
                  </div>
                  {isOverdue(v.nextDueDate) && <span className="badge badge-red">Overdue</span>}
                  {isDueSoon(v.nextDueDate) && !isOverdue(v.nextDueDate) && <span className="badge badge-yellow">Due Soon</span>}
                </div>
              )}
              <button className="btn-danger" style={{padding:'6px 14px',fontSize:'0.8rem'}} onClick={() => handleDelete(v._id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
