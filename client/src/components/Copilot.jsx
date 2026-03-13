import { useState, useRef, useEffect } from 'react';
import { api } from '../api';

export default function Copilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your Recruiter Copilot 🤖\n\nI can help you with:\n• Finding top candidates\n• Drafting emails\n• Getting pipeline stats\n• Summarizing feedback\n\nWhat would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.copilot(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: res.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that request. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="copilot-fab" onClick={() => setOpen(!open)} title="Recruiter Copilot">
        {open ? '✕' : '✦'}
      </button>

      {open && (
        <div className="copilot-panel">
          <div className="copilot-header">
            <h3>✦ Recruiter Copilot</h3>
            <button className="modal-close" onClick={() => setOpen(false)} style={{ width: '28px', height: '28px' }}>✕</button>
          </div>
          <div className="copilot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`copilot-msg ${msg.role}`}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j}>
                    {line.replace(/\*\*(.*?)\*\*/g, '«$1»').split('«').map((part, k) => {
                      if (part.includes('»')) {
                        const [bold, rest] = part.split('»');
                        return <span key={k}><strong>{bold}</strong>{rest}</span>;
                      }
                      return part;
                    })}
                    {j < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            ))}
            {loading && (
              <div className="copilot-msg bot">
                <span style={{ display: 'inline-flex', gap: '4px' }}>
                  <span style={{ animation: 'pulseGlow 1s infinite 0s' }}>●</span>
                  <span style={{ animation: 'pulseGlow 1s infinite 0.2s' }}>●</span>
                  <span style={{ animation: 'pulseGlow 1s infinite 0.4s' }}>●</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="copilot-input-area">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button className="copilot-send-btn" onClick={sendMessage} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
