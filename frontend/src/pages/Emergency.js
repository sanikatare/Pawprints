import React, { useState } from 'react';
import './Emergency.css';

const firstAidTips = [
  { title: 'Choking', icon: '😮', steps: ['Stay calm and restrain your pet gently','Open mouth carefully and look for visible obstruction','For small dogs: hold upside down, give firm back blows','For large dogs: perform Heimlich — press firmly behind ribcage','Rush to vet immediately even if object removed'] },
  { title: 'Poisoning', icon: '☠️', steps: ['Do NOT induce vomiting unless directed by vet','Note what was ingested and how much','Call poison control or vet immediately','Keep pet calm and warm','Do not give food or water until vet advises'] },
  { title: 'Seizure', icon: '⚡', steps: ['Do NOT restrain the pet during seizure','Move away sharp objects to prevent injury','Time the seizure duration','Keep room dark and quiet','Call vet if seizure lasts more than 5 minutes'] },
  { title: 'Bleeding', icon: '🩸', steps: ['Apply firm pressure with clean cloth','Elevate the injured area if possible','Do NOT remove cloth if soaked — add more on top','Apply tourniquet only as last resort for limb','Rush to emergency vet immediately'] },
  { title: 'Heatstroke', icon: '🌡️', steps: ['Move pet to cool shaded area immediately','Apply cool (not cold) water to body','Fan the pet to aid cooling','Offer small amounts of cool water to drink','Head to vet — heatstroke can be fatal quickly'] },
  { title: 'Burns', icon: '🔥', steps: ['Cool the burn with running cool water for 10 min','Do NOT apply butter, oil or toothpaste','Cover loosely with clean damp cloth','Do not burst any blisters','Take to vet for assessment and pain relief'] },
];

const nearbyVets = [
  { name: 'City Pet Emergency Clinic', address: '123 Main Street, Near Central Park', phone: '+91 98765 43210', hours: '24/7 Emergency', distance: '0.8 km' },
  { name: 'PawCare Animal Hospital', address: '456 Green Avenue, Koregaon Park', phone: '+91 87654 32109', hours: '8AM - 10PM', distance: '1.2 km' },
  { name: 'Dr. Mehta Veterinary Clinic', address: '789 Park Road, Aundh', phone: '+91 76543 21098', hours: '9AM - 9PM', distance: '2.1 km' },
  { name: 'Happy Tails Animal Care', address: '101 Baner Road, Baner', phone: '+91 65432 10987', hours: '24/7 Emergency', distance: '2.8 km' },
];

export default function Emergency() {
  const [alertSent, setAlertSent] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);

  const sendAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 5000);
  };

  return (
    <div className="page-container">
      <div className="emergency-hero">
        <div className="em-hero-content">
          <div className="em-icon">🚨</div>
          <h1>Emergency Help</h1>
          <p>Quick access to emergency vet services and first aid guidance</p>
          <button className={`em-alert-btn ${alertSent ? 'sent' : ''}`} onClick={sendAlert}>
            {alertSent ? '✅ Alert Sent! Help is on the way!' : '🚨 SEND EMERGENCY ALERT'}
          </button>
          <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.7)',marginTop:10}}>
            Contacts nearby vets and shares your location
          </div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:32}}>
        <div style={{background:'#fff8e1',border:'1px solid #ffe082',borderRadius:'var(--radius)',padding:20}}>
          <h3 style={{marginBottom:8}}>☎️ Poison Control Hotline</h3>
          <div style={{fontSize:'1.5rem',fontWeight:700,color:'#c0392b',marginBottom:4}}>1800-xxx-xxxx</div>
          <p style={{fontSize:'0.85rem',color:'var(--text-light)'}}>Available 24/7 for pet poisoning emergencies</p>
        </div>
        <div style={{background:'#fce4ec',border:'1px solid #f48fb1',borderRadius:'var(--radius)',padding:20}}>
          <h3 style={{marginBottom:8}}>🏥 Animal Ambulance</h3>
          <div style={{fontSize:'1.5rem',fontWeight:700,color:'#c0392b',marginBottom:4}}>+91 98765 00000</div>
          <p style={{fontSize:'0.85rem',color:'var(--text-light)'}}>Mobile vet unit available for home emergencies</p>
        </div>
      </div>

      <h2 style={{marginBottom:16}}>🩺 First Aid Guide</h2>
      <div className="grid-3" style={{marginBottom:32}}>
        {firstAidTips.map((tip, i) => (
          <div key={i} className={`first-aid-card card ${selectedTip===i?'expanded':''}`} onClick={() => setSelectedTip(selectedTip===i?null:i)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:'1.8rem'}}>{tip.icon}</span>
                <strong>{tip.title}</strong>
              </div>
              <span style={{color:'var(--green-600)',fontWeight:700}}>{selectedTip===i?'▲':'▼'}</span>
            </div>
            {selectedTip === i && (
              <ol style={{marginTop:14,paddingLeft:20}}>
                {tip.steps.map((s,j) => <li key={j} style={{fontSize:'0.85rem',color:'var(--text-mid)',marginBottom:6,lineHeight:1.5}}>{s}</li>)}
              </ol>
            )}
          </div>
        ))}
      </div>

      <h2 style={{marginBottom:16}}>📍 Nearby Veterinary Clinics</h2>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {nearbyVets.map((vet, i) => (
          <div className="card" key={i} style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <div style={{fontSize:'2rem'}}>🏥</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:'1rem',marginBottom:2}}>{vet.name}</div>
              <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{vet.address}</div>
              <div style={{fontSize:'0.82rem',color:'var(--green-600)',marginTop:2}}>⏰ {vet.hours}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{background:'var(--mint)',padding:'3px 10px',borderRadius:'50px',fontSize:'0.78rem',fontWeight:600,color:'var(--green-700)',marginBottom:8}}>{vet.distance} away</div>
              <a href={`tel:${vet.phone}`} className="btn-primary" style={{display:'inline-block',padding:'8px 18px',fontSize:'0.85rem'}}>📞 Call</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
