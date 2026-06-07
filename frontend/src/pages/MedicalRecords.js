import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assetUrl } from '../utils/config';

const recordTypes = ['Prescription','Lab Report','X-Ray','Vaccination','Other'];
const typeIcons = { Prescription:'💊', 'Lab Report':'🧪', 'X-Ray':'🔬', Vaccination:'💉', Other:'📄' };

export default function MedicalRecords() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', type:'Other', notes:'', date:'' });
  const [file, setFile] = useState(null);

  useEffect(() => { axios.get('/api/pets').then(r => { setPets(r.data); if(r.data.length) setSelectedPet(r.data[0]._id); }); }, []);
  useEffect(() => { if(selectedPet) axios.get(`/api/medical-records/${selectedPet}`).then(r => setRecords(r.data)); }, [selectedPet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries({...form, pet: selectedPet}).forEach(([k,v]) => fd.append(k,v));
    if(file) fd.append('file', file);
    try {
      await axios.post('/api/medical-records', fd, { headers:{'Content-Type':'multipart/form-data'} });
      toast.success('Record uploaded!');
      setShowForm(false); setForm({ title:'', type:'Other', notes:'', date:'' }); setFile(null);
      axios.get(`/api/medical-records/${selectedPet}`).then(r => setRecords(r.data));
    } catch { toast.error('Upload failed'); }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/medical-records/${id}`);
    toast.success('Record deleted');
    setRecords(r => r.filter(x => x._id !== id));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>🗂️ Medical Records</h1><p>Store and access all your pet's medical documents</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Upload Record</button>
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
            <h3>📁 Upload Medical Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Blood Test Report" required /></div>
                <div className="form-group"><label>Record Type</label>
                  <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                    {recordTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></div>
                <div className="form-group"><label>Upload File (PDF/Image)</label><input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} /></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} rows={3} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-state card"><div className="emoji">🗂️</div><h3>No medical records</h3><p>Upload prescriptions, lab reports, and other documents</p></div>
      ) : (
        <div className="grid-3">
          {records.map(r => (
            <div className="card" key={r._id}>
              <div style={{fontSize:'2.5rem',marginBottom:10}}>{typeIcons[r.type]||'📄'}</div>
              <div style={{fontWeight:600,marginBottom:4}}>{r.title}</div>
              <span className="badge badge-blue" style={{marginBottom:8}}>{r.type}</span>
              {r.date && <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginBottom:6}}>{new Date(r.date).toLocaleDateString()}</div>}
              {r.notes && <p style={{fontSize:'0.82rem',color:'var(--text-light)',marginBottom:12}}>{r.notes}</p>}
              <div style={{display:'flex',gap:8,marginTop:'auto'}}>
                {r.fileUrl && <a href={assetUrl(r.fileUrl)} target="_blank" rel="noreferrer" className="btn-secondary" style={{padding:'6px 14px',fontSize:'0.8rem'}}>📥 View</a>}
                <button className="btn-danger" style={{padding:'6px 14px',fontSize:'0.8rem'}} onClick={() => handleDelete(r._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
