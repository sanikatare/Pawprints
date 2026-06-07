import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { assetUrl } from '../utils/config';

const careData = {
  default: {
    diet: ['Feed high-quality dog food appropriate for age and size','Always provide fresh clean water','Avoid toxic foods: chocolate, grapes, onions, xylitol','Feed 2-3 small meals per day instead of one large meal','Measure portions to prevent obesity'],
    exercise: ['30-60 minutes of daily exercise recommended','Mix walking, running and playtime','Mental stimulation with puzzle toys','Avoid exercise right after meals','Adjust intensity based on age and health'],
    care: ['Brush teeth 2-3 times per week to prevent dental disease','Trim nails every 3-4 weeks','Regular ear cleaning to prevent infections','Bathe once a month or as needed','Regular grooming based on coat type']
  },
  puppy: {
    diet: ['Feed puppy-specific food with higher protein and fat','3-4 small meals per day for young puppies','Avoid adult food — different nutritional needs','Introduce new foods gradually','Consult vet for portion sizes by breed'],
    exercise: ['Short, gentle play sessions (5 min per month of age)','Avoid strenuous exercise until bones develop','Socialization walks are important','No jumping or stairs for large breeds under 1 year','Lots of rest between play sessions'],
    care: ['Start dental hygiene habits early','Handle paws frequently to ease future nail trims','Early grooming sessions build positive habits','Begin training and socialization immediately','More frequent vet visits for vaccinations']
  },
  senior: {
    diet: ['Switch to senior formula dog food after age 7','Lower calorie content to prevent weight gain','Joint supplements like glucosamine and chondroitin','More frequent smaller meals easier on digestion','Increase water intake encouragement'],
    exercise: ['Gentle, low-impact exercise like slow walks','Swimming is excellent for arthritic joints','Shorter but more frequent walks','Watch for signs of pain or exhaustion','Mental stimulation remains important'],
    care: ['More frequent vet check-ups (every 6 months)','Watch for lumps, bumps, or behavioral changes','Orthopedic bedding for comfort','Regular dental cleaning becomes more critical','Monitor weight closely']
  }
};

const breedTips = {
  'Golden Retriever': { special: 'Prone to hip dysplasia and cancer. Annual screening recommended. Loves water — swimming is great exercise!', grooming: 'Daily brushing needed. Heavy seasonal shedding. Professional grooming every 6-8 weeks.' },
  'Labrador': { special: 'Prone to obesity — measure food carefully. Joint issues common. Very energetic — needs 1-2 hrs exercise daily.', grooming: 'Weekly brushing. Moderate shedding. Occasional baths.' },
  'German Shepherd': { special: 'Prone to hip dysplasia and degenerative myelopathy. Mental stimulation crucial to prevent destructive behavior.', grooming: 'Daily brushing. Heavy shedder. Bathe every 3-4 months.' },
  'Pomeranian': { special: 'Dental disease very common — daily brushing essential. Prone to luxating patella. Watch for tracheal collapse.', grooming: 'Daily brushing to prevent matting. Professional grooming every 4-6 weeks.' },
  'Shih Tzu': { special: 'Eye problems common — clean daily. Brachycephalic — avoid heat and strenuous exercise. Regular dental care vital.', grooming: 'Daily brushing required or keep short. Professional grooming every 6-8 weeks.' },
};

export default function CareSuggestions() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('diet');

  useEffect(() => { axios.get('/api/pets').then(r => { setPets(r.data); if(r.data.length) setSelectedPet(r.data[0]); }); }, []);

  const getAgeCategory = (age) => { if(!age) return 'default'; if(age < 1) return 'puppy'; if(age > 7) return 'senior'; return 'default'; };
  const tips = selectedPet ? careData[getAgeCategory(selectedPet.age)] : careData.default;
  const breedSpecific = selectedPet?.breed ? breedTips[selectedPet.breed] : null;

  const tabs = [
    { key:'diet', label:'🥗 Diet', tips: tips.diet },
    { key:'exercise', label:'🏃 Exercise', tips: tips.exercise },
    { key:'care', label:'🛁 Grooming & Care', tips: tips.care },
  ];

  return (
    <div className="page-container">
      <div className="page-header"><h1>💚 Care Suggestions</h1><p>Personalized health and wellness tips for your pet</p></div>

      {pets.length > 0 && (
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
          {pets.map(p => (
            <div key={p._id} onClick={() => setSelectedPet(p)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',borderRadius:'50px',border:`2px solid ${selectedPet?._id===p._id?'var(--green-500)':'var(--border)'}`,background:selectedPet?._id===p._id?'var(--mint)':'white',cursor:'pointer',fontWeight:selectedPet?._id===p._id?600:400,transition:'all 0.2s'}}>
              <span>{p.photo?<img src={assetUrl(p.photo)} alt="" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}} />:'🐶'}</span>
              <span>{p.name}</span>
              {p.age && <span style={{fontSize:'0.75rem',background:'white',padding:'2px 8px',borderRadius:'50px',color:'var(--text-muted)'}}>{getAgeCategory(p.age)}</span>}
            </div>
          ))}
        </div>
      )}

      {selectedPet && (
        <div className="card" style={{marginBottom:24,background:'linear-gradient(135deg,var(--green-50),var(--mint))'}}>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <span style={{fontSize:'2.5rem'}}>🐶</span>
            <div>
              <h3>{selectedPet.name}'s Profile</h3>
              <div style={{fontSize:'0.85rem',color:'var(--text-mid)'}}>
                {selectedPet.breed && <span style={{marginRight:12}}>🐾 {selectedPet.breed}</span>}
                {selectedPet.age && <span style={{marginRight:12}}>🎂 {selectedPet.age} years ({getAgeCategory(selectedPet.age)})</span>}
                {selectedPet.weight && <span>⚖️ {selectedPet.weight} kg</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {breedSpecific && (
        <div style={{marginBottom:24}}>
          <h3 style={{marginBottom:12}}>🐾 Breed-Specific Tips for {selectedPet.breed}</h3>
          <div className="grid-2">
            <div className="card" style={{background:'#fff8e1',border:'1px solid #ffe082'}}>
              <h4 style={{marginBottom:10}}>⚕️ Health Watch</h4>
              <p style={{fontSize:'0.88rem',color:'#7d6608',lineHeight:1.6}}>{breedSpecific.special}</p>
            </div>
            <div className="card" style={{background:'#e8f5e9',border:'1px solid #a5d6a7'}}>
              <h4 style={{marginBottom:10}}>✂️ Grooming Needs</h4>
              <p style={{fontSize:'0.88rem',color:'var(--green-800)',lineHeight:1.6}}>{breedSpecific.grooming}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{padding:'9px 20px',borderRadius:'50px',border:'1.5px solid var(--border)',background:activeTab===t.key?'var(--green-500)':'white',color:activeTab===t.key?'white':'var(--text-mid)',fontWeight:600,cursor:'pointer',fontSize:'0.88rem',transition:'all 0.2s'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <h3 style={{marginBottom:16}}>{tabs.find(t=>t.key===activeTab)?.label} Tips</h3>
        <ul style={{listStyle:'none',padding:0}}>
          {tips[activeTab]?.map((tip, i) => (
            <li key={i} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid var(--green-50)',alignItems:'flex-start'}}>
              <span style={{fontSize:'1rem',marginTop:2}}>✅</span>
              <span style={{fontSize:'0.9rem',color:'var(--text-mid)',lineHeight:1.6}}>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
