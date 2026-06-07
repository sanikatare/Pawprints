import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assetUrl } from '../utils/config';
import './Diagnosis.css';

const SYMPTOMS = [
  'Vomiting', 'Diarrhea', 'Lethargy', 'Loss of Appetite', 'Excessive Thirst',
  'Coughing', 'Itching', 'Limping', 'Fever', 'Seizures',
  'Sneezing', 'Runny Nose', 'Eye Discharge', 'Hair Loss', 'Weight Loss',
  'Excessive Urination', 'Bloating', 'Difficulty Breathing', 'Pale Gums', 'Head Shaking'
];

export default function Diagnosis() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/pets').then(r => { setPets(r.data); if (r.data.length > 0) setSelectedPet(r.data[0]._id); });
  }, []);

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleDiagnose = async () => {
    if (!selectedPet) return toast.error('Please select a pet');
    if (selectedSymptoms.length === 0) return toast.error('Please select at least one symptom');
    setLoading(true);
    try {
      const res = await axios.post('/api/diagnosis/predict', { petId: selectedPet, symptoms: selectedSymptoms });
      setResult(res.data);
      toast.success('Diagnosis complete!');
    } catch (err) {
      toast.error('Diagnosis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Severe') return '#c0392b';
    if (severity === 'Moderate') return '#e67e22';
    return '#27ae60';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🩺 Symptom Checker</h1>
        <p>Select your pet's symptoms to get an AI-powered diagnosis</p>
      </div>

      <div className="diagnosis-layout">
        {/* Input Panel */}
        <div className="diag-input-panel">
          <div className="card">
            <h3>1. Select Your Pet</h3>
            {pets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pets found. <a href="/pets" style={{ color: 'var(--green-600)' }}>Add a pet first</a>.</p>
            ) : (
              <div className="pet-selector">
                {pets.map(pet => (
                  <div key={pet._id} className={`pet-select-item ${selectedPet === pet._id ? 'selected' : ''}`} onClick={() => setSelectedPet(pet._id)}>
                    <span className="ps-icon">{pet.photo ? <img src={assetUrl(pet.photo)} alt="" /> : '🐶'}</span>
                    <span>{pet.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3>2. Select Symptoms <span className="symptom-count">({selectedSymptoms.length} selected)</span></h3>
            <div className="symptoms-grid">
              {SYMPTOMS.map(s => (
                <div key={s} className={`symptom-chip ${selectedSymptoms.includes(s) ? 'selected' : ''}`} onClick={() => toggleSymptom(s)}>
                  <span className="chip-check">{selectedSymptoms.includes(s) ? '✓' : '+'}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary diag-btn" onClick={handleDiagnose} disabled={loading || selectedSymptoms.length === 0}>
            {loading ? '🔍 Analyzing...' : '🩺 Diagnose Now'}
          </button>
        </div>

        {/* Result Panel */}
        <div className="diag-result-panel">
          {!result ? (
            <div className="diag-placeholder card">
              <div style={{ fontSize: '4rem', marginBottom: 20 }}>🩺</div>
              <h3>Ready to diagnose</h3>
              <p>Select a pet and symptoms, then click "Diagnose Now" to get predictions</p>
              <div className="diag-tips">
                <div className="diag-tip">✅ Select all visible symptoms</div>
                <div className="diag-tip">✅ More symptoms = better accuracy</div>
                <div className="diag-tip">✅ Always consult a vet for serious conditions</div>
              </div>
            </div>
          ) : (
            <div className="diagnosis-result">
              <div className="result-header card">
                <div className="result-severity" style={{ background: getSeverityColor(result.severity) + '20', color: getSeverityColor(result.severity) }}>
                  {result.severity} Severity
                </div>
                <h3>Diagnosis Results</h3>
                <p>{result.symptoms.join(', ')}</p>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h4>🦠 Possible Conditions</h4>
                {result.predictedDiseases.map((d, i) => (
                  <div className="disease-item" key={i}>
                    <div className="disease-info">
                      <div className="disease-name">{i + 1}. {d.disease}</div>
                      <div className="disease-desc">{d.description}</div>
                    </div>
                    <div className="confidence-bar-wrap">
                      <div className="conf-val">{d.confidence}%</div>
                      <div className="confidence-bar">
                        <div className="conf-fill" style={{ width: `${d.confidence}%`, background: d.confidence > 60 ? 'var(--green-500)' : d.confidence > 40 ? '#f39c12' : '#e74c3c' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h4>💊 Treatment Suggestions</h4>
                <ul className="suggestion-list">
                  {result.treatments.map((t, i) => <li key={i}>✅ {t}</li>)}
                </ul>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h4>⚠️ Precautions</h4>
                <ul className="suggestion-list precautions">
                  {result.precautions.map((p, i) => <li key={i}>⚠️ {p}</li>)}
                </ul>
              </div>

              <div className="vet-notice">
                🏥 <strong>Always consult a licensed veterinarian</strong> for an accurate diagnosis and treatment plan. This tool is for informational purposes only.
              </div>

              <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => { setResult(null); setSelectedSymptoms([]); }}>
                🔄 New Diagnosis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
