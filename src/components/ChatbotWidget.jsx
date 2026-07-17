import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../data/localization';
import './ChatbotWidget.css';

export default function ChatbotWidget({ schemes, onSelectScheme, onStartWizard, lang = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // RAG file upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [useDocMode, setUseDocMode] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false); // auto-detected

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const t = translations[lang] || translations.en;

  // Auto-ping backend on mount to detect if Groq is live
  useEffect(() => {
    const API_URL = import.meta.env.VITE_RAG_API_URL || 'https://schemesense-ai.onrender.com';
    fetch(`${API_URL}/`)
      .then(r => r.json())
      .then(data => setBackendOnline(data.groq_enabled === true))
      .catch(() => setBackendOnline(false));

    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? prev + ' ' + transcript : transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Re-greet the user when language changes
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: t.botWelcome,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [lang, t.botWelcome]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const triggerBotResponse = async (userText) => {
    // Show typing state
    const typingId = Date.now() + 999;
    setMessages(prev => [...prev, {
      id: typingId,
      sender: 'bot',
      text: 'Thinking...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    try {
      let backendQuery = userText;
      const lower = userText.toLowerCase();
      if (lower.includes('किसान') || lower.includes('రైతు')) backendQuery += ' farmer agriculture';
      if (lower.includes('छात्र') || lower.includes('विद्यार्थी') || lower.includes('విద్యార్థి')) backendQuery += ' scholarship education student';
      if (lower.includes('ऋण') || lower.includes('व्यवसाय') || lower.includes('వ్యాపారం')) backendQuery += ' business loan';
      if (lower.includes('पात्र') || lower.includes('అర్హత')) backendQuery += ' am i eligible for pm kisan';

      const API_URL = import.meta.env.VITE_RAG_API_URL || 'https://schemesense-ai.onrender.com';
      const useDocs = useDocMode && uploadedFiles.length > 0;
      const getUrl = `${API_URL}/api/chat?query=${encodeURIComponent(backendQuery)}&lang=${lang}&use_uploaded_docs=${useDocs}&v=3`;
      
      const response = await fetch(getUrl, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Backend error');
      }

      const data = await response.json();
      const matchedList = schemes.filter(s => data.matches.includes(s.id));

      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        links: matchedList.slice(0, 3),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    } catch (err) {
      // Gracefully fall back to local rule-based simulation engine
      const response = generateBotResponse(userText);
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now() + 1,
        sender: 'bot',
        ...response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: timeString
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Trigger Bot Response
    triggerBotResponse(userText);
  };

  const handleChipClick = (chipText) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: chipText,
      time: timeString
    };
    setMessages(prev => [...prev, userMsg]);
    triggerBotResponse(chipText);
  };

  const handleVoiceClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        // Set language based on current UI language
        recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser does not support Voice input. Please use Chrome or Edge.");
      }
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const API_URL = import.meta.env.VITE_RAG_API_URL || 'https://schemesense-ai.onrender.com';

    for (const file of files) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Optimistic UI
      setUploadedFiles(prev => [...prev, { name: file.name, status: 'uploading', chunks: 0 }]);

      try {
        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          setUploadedFiles(prev => prev.map(f =>
            f.name === file.name ? { name: file.name, status: 'done', chunks: data.chunks_created } : f
          ));
          // Auto bot message confirming ingestion
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            text: `📄 **${file.name}** uploaded! ${data.chunks_created} text chunks indexed. You can now ask questions about this document.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setUseDocMode(true);
        } else {
          setUploadedFiles(prev => prev.map(f =>
            f.name === file.name ? { ...f, status: 'error' } : f
          ));
        }
      } catch {
        setUploadedFiles(prev => prev.map(f =>
          f.name === file.name ? { ...f, status: 'error' } : f
        ));
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: '⚠️ Could not reach the RAG backend to upload the file. Make sure the Python server is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
      setIsUploading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetGroqKey = async () => {
    if (!groqKey.trim()) return;
    const API_URL = import.meta.env.VITE_RAG_API_URL || 'https://schemesense-ai.onrender.com';
    try {
      await fetch(`${API_URL}/api/set-groq-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: groqKey.trim() })
      });
      localStorage.setItem('groq_api_key', groqKey.trim());
      setShowGroqInput(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: '🤖 Groq LLM connected! I can now generate natural language answers from your uploaded documents.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      alert('Could not connect to backend to set Groq key.');
    }
  };

  // Upgraded simulated Natural NLP matching engine
  const generateBotResponse = (query) => {
    const text = query.toLowerCase();
    
    // NLP parsing flags
    let matchedCategory = '';
    let matchedState = '';
    let matchedGender = '';
    let parsedAge = null;

    // Extract age if any digit is found
    const ageMatch = text.match(/\b\d{1,2}\b/);
    if (ageMatch) {
      parsedAge = parseInt(ageMatch[0]);
    }

    // Category mapping
    if (text.includes('scholarship') || text.includes('student') || text.includes('study') || text.includes('education') || text.includes('college') || text.includes('school') || text.includes('छात्र') || text.includes('विद्यार्थी') || text.includes('విద్యార్థి') || text.includes('చదువు')) {
      matchedCategory = 'Education & Learning';
    } else if (text.includes('farmer') || text.includes('agriculture') || text.includes('crop') || text.includes('cultivat') || text.includes('kisan') || text.includes('rythu') || text.includes('किसान') || text.includes('खेती') || text.includes('రైతు') || text.includes('వ్యవసాయం')) {
      matchedCategory = 'Agriculture, Rural & Environment';
    } else if (text.includes('business') || text.includes('entrepreneur') || text.includes('loan') || text.includes('mudra') || text.includes('shop') || text.includes('startup') || text.includes('trade') || text.includes('ऋण') || text.includes('व्यवसाय') || text.includes('వ్యాపారం') || text.includes('రుణం')) {
      matchedCategory = 'Business & Entrepreneurship';
    } else if (text.includes('health') || text.includes('hospital') || text.includes('insurance') || text.includes('medical') || text.includes('treatment') || text.includes('ayushman') || text.includes('pregnancy') || text.includes('janani') || text.includes('स्वास्थ्य') || text.includes('अस्पताल') || text.includes('ఆరోగ్యం') || text.includes('ఆసుపత్రి')) {
      matchedCategory = 'Health & Wellness';
    } else if (text.includes('girl') || text.includes('daughter') || text.includes('woman') || text.includes('women') || text.includes('female') || text.includes('mother') || text.includes('sukanya') || text.includes('kanya') || text.includes('maternal')) {
      matchedCategory = 'Women and Child';
    } else if (text.includes('pension') || text.includes('old age') || text.includes('elderly') || text.includes('accident') || text.includes('security') || text.includes('welfare') || text.includes('social') || text.includes('bima')) {
      matchedCategory = 'Social Welfare & Security';
    }

    // State mapping
    if (text.includes('bihar')) {
      matchedState = 'Bihar';
    } else if (text.includes('up') || text.includes('uttar pradesh') || text.includes('kanya sumangala')) {
      matchedState = 'Uttar Pradesh';
    } else if (text.includes('jammu') || text.includes('kashmir') || text.includes('j&k') || text.includes('jk')) {
      matchedState = 'Jammu and Kashmir';
    } else if (text.includes('telangana') || text.includes('hyderabad') || text.includes('bandhu')) {
      matchedState = 'Telangana';
    }

    // Gender mapping
    if (text.includes('female') || text.includes('girl') || text.includes('woman') || text.includes('women') || text.includes('daughter') || text.includes('she') || text.includes('her')) {
      matchedGender = 'Female';
    } else if (text.includes('male') || text.includes('boy') || text.includes('man') || text.includes('men') || text.includes('he') || text.includes('him')) {
      matchedGender = 'Male';
    }

    // Filter matching schemes
    let matchedSchemes = schemes.filter(scheme => {
      const r = scheme.rules;

      // Category match
      if (matchedCategory && scheme.category !== matchedCategory) return false;

      // State match
      if (matchedState && r.states.indexOf('All') === -1 && r.states.indexOf(matchedState) === -1) return false;

      // Gender match
      if (matchedGender && r.genders.indexOf('All') === -1 && r.genders.indexOf(matchedGender) === -1) return false;

      // Age match
      if (parsedAge !== null && (parsedAge < r.minAge || parsedAge > r.maxAge)) return false;

      // If nothing parsed, check keywords in title/desc
      if (!matchedCategory && !matchedState && !matchedGender && parsedAge === null) {
        const queryWords = text.split(' ').filter(w => w.length > 3);
        const matchAnyWord = queryWords.some(word => 
          scheme.title.toLowerCase().includes(word) ||
          scheme.description.toLowerCase().includes(word) ||
          scheme.ministry.toLowerCase().includes(word)
        );
        return matchAnyWord;
      }

      return true;
    });

    matchedSchemes = matchedSchemes.slice(0, 3);

    if (matchedSchemes.length > 0) {
      return {
        text: `${t.botMatchesTitle} (${matchedSchemes.length} found)`,
        links: matchedSchemes
      };
    }

    // Fallback response
    return {
      text: "I couldn't find a direct match for your specific query. Try typing keywords like 'scholarship', 'pension', 'farmer support', or 'business loans'. You can also run our full Eligibility Finder Wizard to match against all factors.",
      suggestWizard: true
    };
  };

  return (
    <div className="chatbot-widget-container">
      {/* Backdrop to close chat on outside click */}
      {isOpen && (
        <div className="chatbot-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Floating Action Button - always visible, toggles open/close */}
      <button 
        className={`chatbot-fab ${isOpen ? 'fab-open' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close Chatbot' : 'Open Chatbot'}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="fab-tooltip">{t.botName}</span>
          </>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chat-window  view-enter">
          
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-profile">
              <div className="bot-avatar-active">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="chat-header-text">
                <span className="bot-name">{t.botName}</span>
                <span className="bot-status" style={{ color: backendOnline ? 'var(--emerald)' : 'var(--text-muted)' }}>
                  ● {backendOnline ? 'AI Active' : t.botRole}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className={`btn-chat-action ${uploadedFiles.length > 0 ? 'active' : ''}`}
                title="Upload document (PDF/DOCX/TXT)"
                onClick={() => setShowUploadPanel(p => !p)}
              >📎</button>
              <button className="btn-close-chat" onClick={() => setIsOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>


          {/* Upload Panel */}
          {showUploadPanel && (
            <div className="chat-upload-panel">
              <div className="upload-drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileUpload({ target: { files: e.dataTransfer.files } }); }}
              >
                {isUploading ? <span>⏳ Uploading...</span> : <><span className="upload-icon">📁</span><span className="upload-label">Drop PDF/DOCX/TXT or <u>click to browse</u></span></>}
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.doc,.txt" style={{display:'none'}} onChange={handleFileUpload} />
              {uploadedFiles.length > 0 && (
                <div className="upload-file-list">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className={`upload-file-item ${f.status}`}>
                      <span>{f.status==='uploading'?'⏳':f.status==='done'?'✅':'❌'}</span>
                      <span className="upload-file-name">{f.name}</span>
                      {f.status==='done' && <span className="upload-file-chunks">{f.chunks} chunks</span>}
                    </div>
                  ))}
                </div>
              )}
              {uploadedFiles.some(f => f.status === 'done') && (
                <label className="upload-mode-toggle">
                  <input type="checkbox" checked={useDocMode} onChange={e => setUseDocMode(e.target.checked)} />
                  <span>Search uploaded docs (not schemes DB)</span>
                </label>
              )}
            </div>
          )}

          {/* Message Thread Area */}
          <div className="chat-messages-box">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-bubble-row ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  <p className="message-bubble-text">{msg.text}</p>
                  {msg.links && msg.links.length > 0 && (
                    <div className="chat-schemes-links-list">
                      {msg.links.map(scheme => (
                        <div key={scheme.id} className="chat-scheme-link-card" onClick={() => { onSelectScheme(scheme); }}>
                          <span className="chat-link-title">{scheme.title}</span>
                          <span className="chat-link-meta">{scheme.category} • {scheme.type}</span>
                          <span className="chat-view-btn-inline">{t.botMatchesBtn} →</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggest Wizard CTA button */}
                  {msg.suggestWizard && (
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        onStartWizard();
                      }}
                      className="btn btn-saffron btn-sm-chat-wizard"
                    >
                      {t.startWizardBtn}
                    </button>
                  )}

                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips Row */}
          <div className="chat-chips-scroll-container">
            {[t.botChipScholarships, t.botChipFarmers, t.botChipLoans, t.botChipCheck].map((chipText, i) => (
              <button
                key={i}
                type="button"
                className="chat-suggestion-chip"
                onClick={() => handleChipClick(chipText)}
              >
                {chipText}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <button 
              type="button" 
              className={`chat-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceClick}
              title={isListening ? "Listening..." : "Click to speak"}
            >
              {isListening ? (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm5 10v1a5 5 0 0 1-10 0v-1H5v1a7 7 0 0 0 6 6.92V22h2v-3.08A7 7 0 0 0 19 13v-1h-2z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              )}
            </button>
            <input 
              type="text" 
              placeholder={isListening ? "Listening..." : t.botPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="chat-input-field"
            />
            <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
