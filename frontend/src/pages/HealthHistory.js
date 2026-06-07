import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function HealthHistory() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/pets').then(r => { setPets(r.data); if (r.data.length) setSelectedPet(r.data[0]._id); });
  }, []);

  useEffect(() => {
    if (!selectedPet) return;
    axios.get(`/api/health-history/${selectedPet}`).then(r => setHistory(r.data));
    axios.get(`/api/health-history/stats/${selectedPet}`).then(r => setStats(r.data));
  }, [selectedPet]);

  return (
    <div className="page-container">
      <div className="page-header"><h1>📊 Health History</h1><p>Track your pet's health trends over time</p></div>

      <div className="form-group" style={{maxWidth:280}}>
        <label>Select Pet</label>
        <select value={selectedPet} onChange={e => setSelectedPet(e.target.value)}>
          {pets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {stats && (
        <div className="grid-3" style={{marginBottom:24}}>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:8}}>🩺</div>
            <div style={{fontSize:'2rem',fontFamily:'var(--font-display)',color:'var(--green-700)',fontWeight:600}}>{stats.totalDiagnoses}</div>
            <div style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Total Diagnoses</div>
          </div>
          <div className="card">
            <h4 style={{marginBottom:16}}>Severity Breakdown</h4>
            <Doughnut data={{
              labels:['Mild','Moderate','Severe'],
              datasets:[{data:[stats.severityBreakdown.Mild,stats.severityBreakdown.Moderate,stats.severityBreakdown.Severe],backgroundColor:['#a8d5a2','#ffd700','#ff6b6b'],borderWidth:0}]
            }} options={{plugins:{legend:{position:'right'}},cutout:'65%'}} />
          </div>
          <div className="card">
            <h4 style={{marginBottom:16}}>Monthly Activity</h4>
            <Bar data={{
              labels:Object.keys(stats.monthlyData).slice(-6),
              datasets:[{label:'Diagnoses',data:Object.values(stats.monthlyData).slice(-6),backgroundColor:'#a8d5a2',borderRadius:8}]
            }} options={{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}} />
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="empty-state card"><div className="emoji">📋</div><h3>No health history yet</h3><p>Use the Symptom Checker to start tracking your pet's health</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {history.map(h => (
            <div className="card" key={h._id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'1rem',marginBottom:4}}>Symptoms: {h.symptoms.join(', ')}</div>
                  <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{new Date(h.date).toLocaleString()}</div>
                </div>
                <span className={`badge badge-${h.severity==='Severe'?'red':h.severity==='Moderate'?'yellow':'green'}`}>{h.severity}</span>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {h.predictedDiseases.map((d,i) => (
                  <div key={i} style={{background:'var(--green-50)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'8px 14px',fontSize:'0.85rem'}}>
                    <strong>{d.disease}</strong> <span style={{color:'var(--green-600)',fontWeight:600}}>{d.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
