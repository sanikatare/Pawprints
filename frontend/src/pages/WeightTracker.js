import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function WeightTracker() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    axios.get('/api/pets').then((r) => {
      setPets(r.data);
      if (r.data.length) setSelectedPet(r.data[0]._id);
    });
  }, []);

  const fetchLogs = useCallback(() => {
    if (!selectedPet) return;
    axios.get(`/api/weight-logs/${selectedPet}`).then((r) => setLogs(r.data)).catch(() => {});
  }, [selectedPet]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) return;
    try {
      await axios.post('/api/weight-logs', { pet: selectedPet, weight: parseFloat(weight), notes });
      toast.success('Weight logged');
      setWeight('');
      setNotes('');
      fetchLogs();
      axios.get('/api/pets').then((r) => setPets(r.data));
    } catch {
      toast.error('Failed to log weight');
    }
  };

  const selectedPetObj = pets.find((p) => p._id === selectedPet);

  const chartData = {
    labels: logs.map((l) => new Date(l.date).toLocaleDateString()),
    datasets: [{
      label: 'Weight (kg)',
      data: logs.map((l) => l.weight),
      borderColor: '#2d6a4f',
      backgroundColor: 'rgba(45, 106, 79, 0.1)',
      tension: 0.3,
      fill: true,
    }],
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>⚖️ Weight Tracker</h1>
          <p>Monitor your pet&apos;s weight over time</p>
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: 280, marginBottom: 24 }}>
        <label>Select Pet</label>
        <select value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}>
          {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {selectedPetObj && (
        <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--green-700)' }}>
            {selectedPetObj.weight || '—'} <span style={{ fontSize: '1rem' }}>kg</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Current weight for {selectedPetObj.name}</div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Log Weight</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Weight (kg) *</label>
              <input type="number" step="0.1" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </div>
            <button type="submit" className="btn-primary">Log Weight</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Weight Trend</h3>
          {logs.length < 2 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <p>Log at least 2 entries to see the trend chart</p>
            </div>
          ) : (
            <Line data={chartData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }} />
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...logs].reverse().map((l) => (
              <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{new Date(l.date).toLocaleDateString()}</span>
                <strong>{l.weight} kg</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{l.notes || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
