import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// SVG icon component
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const Icons = {
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  close:   "M18 6L6 18M6 6l12 12",
  spinner: "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83",
  noResult:"M9.172 16.172a4 4 0 015.656 0 M9 10h.01 M15 10h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0",
  paw:     "M11 6.5C11 5.12 9.88 4 8.5 4S6 5.12 6 6.5 7.12 9 8.5 9 11 7.88 11 6.5z M18 6.5C18 5.12 16.88 4 15.5 4S13 5.12 13 6.5 14.12 9 15.5 9 18 7.88 18 6.5z M8 13c0-1.1.4-2.1 1.1-2.8C6.5 10.5 4 12.5 4 15s2 4 5 4.9c.3.1.7.1 1 .1h4c.3 0 .7 0 1-.1 3-.9 5-2.9 5-4.9 0-2.5-2.5-4.5-6.1-4.2C13.6 10.9 14 11.9 14 13",
  cal:     "M8 2v3 M16 2v3 M3 8h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  vaccine: "M22 12h-4l-3 9L9 3l-3 9H2",
  records: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8",
  chat:    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  diag:    "M22 12h-4l-3 9L9 3l-3 9H2",
};

const SECTION_CONFIG = {
  pets: {
    iconKey: 'paw', label: 'Pets', path: () => '/pets',
    title: r => r.name,
    detail: r => [r.species, r.breed, r.age ? `${r.age} yr` : null].filter(Boolean).join(' · '),
  },
  appointments: {
    iconKey: 'cal', label: 'Appointments', path: () => '/appointments',
    title: r => `Dr. ${r.vetName}${r.vetClinic ? ` — ${r.vetClinic}` : ''}`,
    detail: r => [r.pet?.name, r.reason, r.date ? new Date(r.date).toLocaleDateString() : null, r.status].filter(Boolean).join(' · '),
  },
  vaccinations: {
    iconKey: 'vaccine', label: 'Vaccinations', path: () => '/vaccinations',
    title: r => r.vaccineName,
    detail: r => [r.pet?.name, r.nextDueDate ? `Due ${new Date(r.nextDueDate).toLocaleDateString()}` : null, r.reminded ? 'Reminded' : null].filter(Boolean).join(' · '),
  },
  records: {
    iconKey: 'records', label: 'Medical Records', path: () => '/medical-records',
    title: r => r.title,
    detail: r => [r.pet?.name, r.type, r.date ? new Date(r.date).toLocaleDateString() : null].filter(Boolean).join(' · '),
  },
  posts: {
    iconKey: 'chat', label: 'Forum Posts', path: () => '/forum',
    title: r => r.title,
    detail: r => [r.author?.name ? `by ${r.author.name}` : null, r.category, r.createdAt ? new Date(r.createdAt).toLocaleDateString() : null].filter(Boolean).join(' · '),
  },
  diagnoses: {
    iconKey: 'diag', label: 'Diagnoses', path: () => '/health-history',
    title: r => `${r.pet?.name || 'Pet'} — ${Array.isArray(r.symptoms) ? r.symptoms.slice(0, 2).join(', ') : r.symptoms || 'Diagnosis'}`,
    detail: r => [r.severity, r.date ? new Date(r.date).toLocaleDateString() : null].filter(Boolean).join(' · '),
  },
};

function SearchResult({ result, config, onClose }) {
  return (
    <Link
      to={config.path(result)}
      onClick={onClose}
      style={{
        display: 'flex', flexDirection: 'column',
        padding: '0.5rem 0.8rem', borderRadius: 8,
        background: '#f8fafc', textDecoration: 'none', color: '#334155',
        border: '1px solid #f0f0f0', transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
      onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
    >
      <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{config.title(result)}</span>
      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.08rem' }}>{config.detail(result)}</span>
    </Link>
  );
}

export default function GlobalSearch({ onClose, inline = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 280);
  const suggestionQuery = useDebounce(query, 150);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) { setResults(null); return; }
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
      .then(r => setResults(r.data.results))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    if (!suggestionQuery || suggestionQuery.length < 1) { setSuggestions([]); return; }
    api.get(`/search/suggestions?q=${encodeURIComponent(suggestionQuery)}`)
      .then(r => setSuggestions(r.data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, [suggestionQuery]);

  const hasResults = results && Object.values(results).some(arr => arr?.length > 0);
  const totalResults = results ? Object.values(results).reduce((s, a) => s + (a?.length || 0), 0) : 0;

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.label);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const content = (
    <div style={{ width: '100%' }}>
      {/* Search Input */}
      <form onSubmit={e => { e.preventDefault(); setShowSuggestions(false); }} style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1, color: '#999' }}>
          <Icon d={Icons.search} size={16} />
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search pets, appointments, vaccines, records, forum..."
          autoComplete="off"
          style={{
            width: '100%', padding: '0.85rem 2.5rem 0.85rem 2.85rem',
            borderRadius: 12, border: '2px solid #e8f5e9', fontSize: '0.95rem',
            outline: 'none', boxSizing: 'border-box', background: '#fff',
            transition: 'border-color 0.2s', color: '#1a2e27',
          }}
          onFocusCapture={e => e.target.style.borderColor = '#2d6a4f'}
          onBlurCapture={e => e.target.style.borderColor = '#e8f5e9'}
        />
        {loading && (
          <span style={{ position: 'absolute', right: '2.5rem', top: '50%', transform: 'translateY(-50%)', color: '#999', animation: 'spin 1s linear infinite' }}>
            <Icon d={Icons.spinner} size={15} />
          </span>
        )}
        {query && !loading && (
          <button type="button"
            onClick={() => { setQuery(''); setResults(null); setSuggestions([]); inputRef.current?.focus(); }}
            style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', padding: 4 }}>
            <Icon d={Icons.close} size={14} />
          </button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && !results && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid #e8f5e9', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4, overflow: 'hidden' }}>
            {suggestions.map((s, i) => (
              <button key={i} type="button" onMouseDown={() => handleSuggestionClick(s)}
                style={{ width: '100%', padding: '0.48rem 1rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <Icon d={Icons[SECTION_CONFIG[s.type]?.iconKey || 'search']} size={14} />
                <span style={{ fontWeight: 500 }}>{s.label}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 'auto' }}>{s.sub}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Results */}
      {results && (
        <div style={{ marginTop: '1rem' }}>
          {!hasResults ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#888' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: '#ccc' }}>
                <Icon d={Icons.noResult} size={44} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>No results for "{query}"</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#aaa' }}>Try different keywords or check the spelling</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "<strong style={{ color: '#475569' }}>{query}</strong>"
              </div>
              {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                const items = results[key];
                if (!items?.length) return null;
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Icon d={Icons[config.iconKey]} size={12} />
                      {config.label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {items.map(r => <SearchResult key={r._id} result={r} config={config} onClose={onClose} />)}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div style={{ marginTop: '1rem', fontSize: '0.86rem' }}>
          <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontWeight: 500 }}>Search across your pet data:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {Object.values(SECTION_CONFIG).map(c => (
              <span key={c.label} style={{ padding: '0.22rem 0.6rem', background: '#f0fdf4', borderRadius: 20, fontSize: '0.76rem', color: '#2d6a4f', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon d={Icons[c.iconKey]} size={11} />
                {c.label}
              </span>
            ))}
          </div>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
            Tip: Press <kbd style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 5px', fontSize: '0.7rem' }}>Ctrl+K</kbd> to open search from anywhere
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  );

  if (inline) return <div style={{ padding: '1.5rem' }}>{content}</div>;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: '92%', maxWidth: 620, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {content}
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: '#ccc' }}>Press Esc to close</div>
      </div>
    </div>
  );
}
