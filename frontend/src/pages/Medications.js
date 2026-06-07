import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Medications() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: '', startDate: '', endDate: '', notes: '', active: true,
  });

  useEffect(() => {
    axios.get('/api/pets').then((r) => {
      setPets(r.data);
      if (r.data.length) setSelectedPet(r.data[0]._id);
    });
  }, []);

  const fetchMedications = useCallback(() => {
    if (!selectedPet) return;
    axios.get(`/api/medications?pet=${selectedPet}`).then((r) => setMedications(r.data)).catch(() => {});
  }, [selectedPet]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medications', { ...form, pet: selectedPet });
      toast.success('Medication added');
      setShowForm(false);
      setForm({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', notes: '', active: true });
      fetchMedications();
    } catch {
      toast.error('Failed to add medication');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this medication?')) return;
    await axios.delete(`/api/medications/${id}`);
    toast.success('Medication removed');
    fetchMedications();
  };

  const toggleActive = async (med) => {
    await axios.put(`/api/medications/${med._id}`, { active: !med.active });
    fetchMedications();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>💊 Medications</h1>
          <p>Track your pet&apos;s medications and dosages</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} disabled={!selectedPet}>
          + Add Medication
        </button>
      </div>

      <div className="form-group" style={{ maxWidth: 280, marginBottom: 24 }}>
        <label>Select Pet</label>
        <select value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}>
          {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>💊 Add Medication</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Medication Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Dosage</label>
                  <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 10mg" />
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="e.g. Twice daily" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {medications.length === 0 ? (
        <div className="empty-state card">
          <div className="emoji">💊</div>
          <h3>No medications recorded</h3>
          <p>Add medications prescribed by your vet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {medications.map((m) => (
            <div className="card" key={m._id} style={{ opacity: m.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                  </div>
                  {m.notes && <div style={{ fontSize: '0.82rem', marginTop: 6 }}>{m.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${m.active ? 'green' : 'yellow'}`}>
                    {m.active ? 'Active' : 'Inactive'}
                  </span>
                  <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => toggleActive(m)}>
                    {m.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(m._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
