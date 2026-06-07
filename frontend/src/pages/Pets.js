import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assetUrl } from '../utils/config';
import './Pets.css';

const breeds = ['Golden Retriever','Labrador','German Shepherd','Bulldog','Poodle','Beagle','Rottweiler','Siberian Husky','Doberman','Shih Tzu','Pomeranian','Dachshund','Mixed Breed','Other'];

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', breed: '', age: '', weight: '', gender: 'Male', notes: '' });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPets(); }, []);

  const fetchPets = async () => {
    const res = await axios.get('/api/pets');
    setPets(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      if (editing) {
        await axios.put(`/api/pets/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pet updated!');
      } else {
        await axios.post('/api/pets', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pet added! 🐾');
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', breed: '', age: '', weight: '', gender: 'Male', notes: '' });
      setPhoto(null);
      fetchPets();
    } catch (err) {
      toast.error('Something went wrong');
    } finally { setLoading(false); }
  };

  const handleEdit = (pet) => {
    setEditing(pet._id);
    setForm({ name: pet.name, breed: pet.breed || '', age: pet.age || '', weight: pet.weight || '', gender: pet.gender || 'Male', notes: pet.notes || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this pet?')) return;
    await axios.delete(`/api/pets/${id}`);
    toast.success('Pet removed');
    fetchPets();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🐶 My Pets</h1>
          <p>Manage all your pet profiles in one place</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', breed: '', age: '', weight: '', gender: 'Male', notes: '' }); }}>
          + Add Pet
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? '✏️ Edit Pet' : '🐾 Add New Pet'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Pet Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Buddy" required />
                </div>
                <div className="form-group">
                  <label>Breed</label>
                  <select value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}>
                    <option value="">Select breed</option>
                    {breeds.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Age (years)</label>
                  <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="3" min="0" max="30" />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="12" min="0" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Photo</label>
                  <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes / Dietary Needs</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any special notes about your pet..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update Pet' : 'Add Pet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pet Cards */}
      {pets.length === 0 ? (
        <div className="empty-state card">
          <div className="emoji">🐾</div>
          <h3>No pets added yet</h3>
          <p>Add your first pet to start tracking their health</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Add Your First Pet</button>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map(pet => (
            <div className="pet-card" key={pet._id}>
              <div className="pet-card-photo">
                {pet.photo ? <img src={assetUrl(pet.photo)} alt={pet.name} /> : <span>🐶</span>}
              </div>
              <div className="pet-card-body">
                <h3>{pet.name}</h3>
                <div className="pet-card-details">
                  {pet.breed && <span className="badge badge-green">{pet.breed}</span>}
                  {pet.gender && <span className="badge badge-blue">{pet.gender}</span>}
                </div>
                <div className="pet-card-info">
                  {pet.age && <div>🎂 {pet.age} year{pet.age !== 1 ? 's' : ''} old</div>}
                  {pet.weight && <div>⚖️ {pet.weight} kg</div>}
                </div>
                {pet.notes && <p className="pet-card-notes">{pet.notes}</p>}
                <div className="pet-card-actions">
                  <button className="btn-secondary small" onClick={() => handleEdit(pet)}>✏️ Edit</button>
                  <button className="btn-danger small" onClick={() => handleDelete(pet._id)}>🗑️ Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
