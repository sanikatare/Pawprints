import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useFetch } from '../hooks/useFetch';

const SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// SVG Icon helper
const Icon = ({ d, size = 16, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const Icons = {
  bot:      "M12 2a10 10 0 110 20A10 10 0 0112 2z M9 9h.01 M15 9h.01 M9.5 15s1.5 2 2.5 2 2.5-2 2.5-2",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  send:     "M22 2L11 13 M22 2L15 22 8 13 2 16 22 2",
  chat:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  document: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  chart:    "M18 20V10 M12 20V4 M6 20v-6",
  trash:    "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
  back:     "M19 12H5 M12 19l-7-7 7-7",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8",
  paw:      "M11 6.5C11 5.12 9.88 4 8.5 4S6 5.12 6 6.5 7.12 9 8.5 9 11 7.88 11 6.5z M18 6.5C18 5.12 16.88 4 15.5 4S13 5.12 13 6.5 14.12 9 15.5 9 18 7.88 18 6.5z M8 13c0-1.1.4-2.1 1.1-2.8C6.5 10.5 4 12.5 4 15s2 4 5 4.9c.3.1.7.1 1 .1h4c.3 0 .7 0 1-.1 3-.9 5-2.9 5-4.9 0-2.5-2.5-4.5-6.1-4.2C13.6 10.9 14 11.9 14 13",
  vaccine:  "M22 12h-4l-3 9L9 3l-3 9H2",
  pill:     "M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v2 M16 19h6 M19 16v6",
  food:     "M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3",
  scale:    "M12 2a3 3 0 100 6 3 3 0 000-6z M2 20h20l-3-14H5L2 20z",
  gene:     "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
};

const SUGGESTED_QUESTIONS = [
  { text: 'What vaccines does my dog need?',     iconKey: 'vaccine' },
  { text: 'My pet is vomiting, what should I do?', iconKey: 'alert' },
  { text: 'How often should I deworm my cat?',   iconKey: 'pill' },
  { text: 'What foods are toxic to dogs?',        iconKey: 'food' },
  { text: 'How to tell if my pet is overweight?', iconKey: 'scale' },
  { text: 'Signs my pet needs emergency care?',   iconKey: 'alert' },
  { text: 'What are breed-specific health risks?', iconKey: 'gene' },
  { text: 'How much should I feed my pet daily?', iconKey: 'food' },
];

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#f0f0f0;padding:1px 4px;border-radius:3px;font-size:0.85em;font-family:monospace">$1</code>');
}

// Strip emojis from AI-generated content for consistent display
function stripEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|\u{1F4A8}|\u{1F525}|[\u2700-\u27BF]/gu, '').replace(/\s{2,}/g, ' ');
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const rawContent = message.content;
  const isEmergency = !isUser && (rawContent.includes('EMERGENCY') || rawContent.includes('emergency'));
  const cleanContent = stripEmojis(rawContent);
  const lines = cleanContent.split('\n').filter((l, i, arr) => l.trim() || (arr[i - 1] || '').trim());

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '0.85rem',
      alignItems: 'flex-end',
      gap: '0.5rem',
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: isEmergency ? '#fee2e2' : '#e8f5e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: isEmergency ? '#dc2626' : '#2d6a4f',
        }}>
          <Icon d={isEmergency ? Icons.alert : Icons.bot} size={15} />
        </div>
      )}
      <div style={{
        maxWidth: '76%',
        padding: '0.7rem 1rem',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #2d6a4f, #4f9b6e)'
          : isEmergency ? '#fef2f2' : '#f8f9fa',
        color: isUser ? '#fff' : '#2d3436',
        border: isEmergency ? '1px solid #fca5a5' : isUser ? 'none' : '1px solid #eee',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        fontSize: '0.88rem',
        lineHeight: 1.65,
        wordBreak: 'break-word',
      }}>
        {!isUser && (
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.3rem',
            color: isEmergency ? '#dc2626' : '#4f9b6e',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {isEmergency ? 'Emergency Alert' : 'VetAI'}
          </div>
        )}
        {lines.map((line, i) => (
          <p key={i} style={{ margin: '0.12rem 0' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(line) || '&nbsp;' }} />
        ))}
      </div>
      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: '#e8f5e9', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: '#2d6a4f',
        }}>
          <Icon d={Icons.user} size={15} />
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Welcome to VetAI, your AI pet health assistant powered by Google Gemini.\n\nI can help you understand your pet's symptoms, vaccination schedules, nutrition, medications, and general care needs.\n\nSelect a pet below for personalized, breed- and age-aware advice, or ask any general question.\n\nNote: I provide health information for educational purposes only. Always consult a licensed veterinarian for diagnosis and treatment.`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState('');
  const [mode, setMode] = useState('chat');
  const [reportText, setReportText] = useState('');
  const bottomRef = useRef();
  const inputRef = useRef();
  const { data: petsData } = useFetch('/pets');
  const pets = petsData || [];
  const selectedPetObj = pets.find(p => p._id === selectedPet);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg, petId: selectedPet || undefined, sessionId: SESSION_ID });
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      const errMsg = e.response?.data?.message || 'AI service error. Please try again.';
      toast.error(errMsg);
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally { setLoading(false); }
  }, [input, loading, selectedPet]);

  const analyzeReport = async () => {
    if (!reportText.trim()) return toast.warn('Please paste your report text first');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/analyze-report', { text: reportText, petId: selectedPet || undefined });
      setMode('chat');
      setMessages(m => [...m, { role: 'user', content: '[Submitted medical report for AI analysis]' }, { role: 'assistant', content: data.analysis }]);
      setReportText('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const getHealthSummary = async () => {
    if (!selectedPet) return toast.warn('Please select a pet first');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/health-summary', { petId: selectedPet });
      setMode('chat');
      setMessages(m => [...m, { role: 'user', content: `Generate complete health summary for ${data.pet.name}` }, { role: 'assistant', content: data.summary }]);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Summary generation failed');
    } finally { setLoading(false); }
  };

  const clearChat = async () => {
    try { await api.post('/ai/clear-history', { sessionId: SESSION_ID }); } catch {}
    setMessages([{ role: 'assistant', content: 'Conversation cleared. How can I help you and your pet today?' }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', maxWidth: 920, margin: '0 auto', padding: '1rem', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#1a2e27', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon d={Icons.bot} size={22} />
            AI Pet Health Assistant
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.78rem' }}>
            Powered by Google Gemini · Breed & age-aware · Emergency detection
          </p>
        </div>

        <select
          value={selectedPet}
          onChange={e => setSelectedPet(e.target.value)}
          style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid #d1fae5', fontSize: '0.85rem', background: '#f0fdf4', minWidth: 160, color: '#1a2e27' }}
        >
          <option value=''>General (No pet selected)</option>
          {pets.map(p => (
            <option key={p._id} value={p._id}>
              {p.name} — {p.species}{p.breed ? ` (${p.breed})` : ''}{p.age ? `, ${p.age}yr` : ''}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('chat')} style={modeBtn(mode === 'chat')}>
            <Icon d={Icons.chat} size={13} /> Chat
          </button>
          <button onClick={() => setMode('analyze')} style={modeBtn(mode === 'analyze')}>
            <Icon d={Icons.document} size={13} /> Analyze Report
          </button>
          {selectedPet && (
            <button onClick={getHealthSummary} disabled={loading} style={modeBtn(false)}>
              <Icon d={Icons.chart} size={13} /> Health Summary
            </button>
          )}
          <button onClick={clearChat} style={{ ...modeBtn(false), color: '#dc2626', borderColor: '#fca5a5' }} title="Clear conversation">
            <Icon d={Icons.trash} size={13} />
          </button>
        </div>
      </div>

      {/* Pet context badge */}
      {selectedPetObj && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.45rem 0.85rem', marginBottom: '0.6rem', fontSize: '0.78rem', color: '#166534', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Icon d={Icons.paw} size={13} /><strong>{selectedPetObj.name}</strong></span>
          <span>{selectedPetObj.species}</span>
          {selectedPetObj.breed && <span>{selectedPetObj.breed}</span>}
          {selectedPetObj.age && <span>{selectedPetObj.age} yr{selectedPetObj.age >= 8 ? ' (Senior)' : selectedPetObj.age < 1 ? ' (Puppy/Kitten)' : ''}</span>}
          {selectedPetObj.weight && <span>{selectedPetObj.weight} kg</span>}
        </div>
      )}

      {mode === 'analyze' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 0.4rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon d={Icons.document} size={16} /> Medical Report Analyzer
            </h3>
            <p style={{ margin: '0 0 0.75rem', color: '#555', fontSize: '0.85rem' }}>
              Paste lab results, vet notes, blood panels, or any veterinary report text for AI analysis.
            </p>
            <textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Paste your pet's medical report, lab results, blood work, or vet notes here..."
              style={{ flex: 1, minHeight: 220, padding: '0.75rem', borderRadius: 8, border: '1px solid #d1fae5', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button onClick={analyzeReport} disabled={loading || !reportText.trim()} style={{ ...primaryBtn, opacity: loading || !reportText.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon d={Icons.chart} size={14} />
                {loading ? 'Analyzing...' : 'Analyze Report'}
              </button>
              <button onClick={() => setMode('chat')} style={{ ...secondaryBtn, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon d={Icons.back} size={14} /> Back to Chat
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '0.5rem' }}>
            {messages.map((m, i) => <MessageBubble key={i} message={m} />)}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d6a4f' }}>
                  <Icon d={Icons.bot} size={15} />
                </div>
                <div style={{ background: '#f8f9fa', padding: '0.7rem 1rem', borderRadius: '16px 16px 16px 4px', color: '#666', fontSize: '0.88rem', border: '1px solid #eee' }}>
                  <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                    VetAI is thinking
                    <span style={{ display: 'inline-flex', gap: '3px', marginLeft: 6 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#4f9b6e', animation: `bounce 1.2s ${i * 0.2}s infinite`, display: 'block' }} />
                      ))}
                    </span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {SUGGESTED_QUESTIONS.map(s => (
                <button key={s.text} onClick={() => sendMessage(s.text)} disabled={loading}
                  style={{ padding: '0.32rem 0.65rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, cursor: 'pointer', fontSize: '0.77rem', color: '#2d6a4f', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Icon d={Icons[s.iconKey]} size={12} />
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedPetObj ? `Ask about ${selectedPetObj.name}'s health... (Enter to send)` : 'Ask any pet health question... (Enter to send)'}
              rows={2}
              disabled={loading}
              style={{ flex: 1, padding: '0.7rem 0.9rem', borderRadius: 12, border: '1px solid #d1fae5', resize: 'none', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.5, outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#4f9b6e'}
              onBlur={e => e.target.style.borderColor = '#d1fae5'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ ...primaryBtn, height: 58, padding: '0 1.3rem', opacity: !input.trim() || loading ? 0.55 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Icon d={Icons.send} size={14} />
              {loading ? 'Sending' : 'Send'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#aaa', margin: '0.4rem 0 0' }}>
            VetAI provides educational information only — not a substitute for professional veterinary care.
          </p>
        </>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

const modeBtn = (active) => ({
  padding: '0.38rem 0.75rem', borderRadius: 8,
  border: `1px solid ${active ? '#2d6a4f' : '#ddd'}`,
  cursor: 'pointer', fontSize: '0.8rem',
  background: active ? '#2d6a4f' : '#fff',
  color: active ? '#fff' : '#555',
  transition: 'all 0.15s', fontWeight: active ? 600 : 400,
  display: 'flex', alignItems: 'center', gap: '0.35rem',
});

const primaryBtn = {
  background: 'linear-gradient(135deg, #2d6a4f, #4f9b6e)', color: '#fff',
  border: 'none', borderRadius: 10, padding: '0.6rem 1.1rem',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'opacity 0.2s',
};

const secondaryBtn = {
  background: '#f5f5f5', color: '#444', border: '1px solid #ddd',
  borderRadius: 10, padding: '0.6rem 1.1rem', cursor: 'pointer', fontSize: '0.88rem',
};
