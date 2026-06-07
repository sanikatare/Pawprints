import React from 'react';
import GlobalSearch from './GlobalSearch.jsx';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function SearchPage() {
  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', color: '#1a2e27', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" size={22} />
        Search
      </h1>
      <GlobalSearch inline={true} onClose={null} />
    </div>
  );
}
