import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  HelpCircle, 
  Terminal,
  User,
  Radio
} from 'lucide-react';
import { queryAssistant } from '../api';

export default function AssistantView({ targetNumber }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **Telecom Investigation Assistant**. I analyze your currently loaded synthetic CDR records, tower hops, and CGNAT translation tables.\n\nEvery answer I provide is backed strictly by factual record citations and log references. If a query cannot be verified against the loaded dataset, I will state **"Insufficient data"** rather than fabricating findings.`,
      supportingPoints: [
        'Ask about outgoing call frequencies',
        'Analyze suspect contacts and associates',
        'Review SIM/IMEI swap events',
        'Trace cell tower movements'
      ],
      evidence: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await queryAssistant(q.trim());
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        supportingPoints: res.supportingPoints || [],
        evidence: res.evidence || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `Error processing query: ${err.message}. Please verify the backend is running.`,
          supportingPoints: [],
          evidence: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which number has the highest number of outgoing calls?',
    `Who are the most frequent contacts of ${targetNumber}?`,
    `Show this number's tower timeline.`,
    'Are there any SIM/IMEI changes detected?',
    'Is there a matching IPDR session for 198.51.100.45 port 41200?',
    'Are there any suspicious late-night calls?',
    'Tell me about Case CASE-2026-X88 summary'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Info */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--cyan-primary), var(--blue-primary))', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>Evidence-Based Telecom Assistant</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Strict zero-hallucination policy • Powered by local analytics engine</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--cyan-primary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <ShieldCheck size={14} />
          <span>Local Rule-Based NLP</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.65rem', marginBottom: '0.5rem' }}>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', borderRadius: '16px', padding: '0.3rem 0.75rem' }}
            onClick={() => handleSend(p)}
          >
            <Sparkles size={11} style={{ color: 'var(--cyan-primary)' }} />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div 
        className="card" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem', 
          padding: '1.25rem',
          marginBottom: '1rem'
        }}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '80%' : '90%'
              }}
            >
              {!isUser && (
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 8, 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} style={{ color: 'var(--cyan-primary)' }} />
                </div>
              )}

              <div style={{
                background: isUser ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.25))' : 'var(--bg-secondary)',
                border: `1px solid ${isUser ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-color)'}`,
                padding: '0.9rem 1.1rem',
                borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                color: '#fff'
              }}>
                {/* Text Body */}
                <div style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>

                {/* Supporting Points */}
                {msg.supportingPoints && msg.supportingPoints.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {msg.supportingPoints.map((pt, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: 3 }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Supporting Evidence Citations */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div style={{ 
                    marginTop: '0.85rem', 
                    paddingTop: '0.65rem', 
                    borderTop: '1px solid rgba(255,255,255,0.08)' 
                  }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--cyan-primary)', fontWeight: 700, marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={12} /> Supporting Evidence Citations ({msg.evidence.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {msg.evidence.map((ev, eIdx) => (
                        <div 
                          key={eIdx}
                          style={{
                            background: 'rgba(0,0,0,0.35)',
                            padding: '0.45rem 0.75rem',
                            borderRadius: 6,
                            fontSize: '0.74rem',
                            borderLeft: '3px solid var(--cyan-primary)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 2 }}>
                            <span className="font-mono" style={{ color: 'var(--cyan-primary)', fontWeight: 600 }}>{ev.recordId}</span>
                            <span className="font-mono">{ev.sourceFile} (Row {ev.sourceRow})</span>
                          </div>
                          <div style={{ color: '#cbd5e1' }}>{ev.description}</div>
                          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
                            Timestamp: {ev.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 8, 
                  backgroundColor: 'rgba(6, 182, 212, 0.2)', 
                  border: '1px solid var(--cyan-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} style={{ color: 'var(--cyan-primary)' }} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} style={{ color: 'var(--cyan-primary)' }} />
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Analyzing loaded CDR/IPDR records and verifying evidence...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
        <input 
          type="text" 
          className="input-text font-mono"
          placeholder="Ask anything (e.g. 'Which number has highest outgoing calls?', 'SIM changes?')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          style={{ height: '44px', paddingLeft: '1rem', fontSize: '0.88rem' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !inputQuery.trim()}
          style={{ height: '44px', padding: '0 1.5rem' }}
        >
          <Send size={15} />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
