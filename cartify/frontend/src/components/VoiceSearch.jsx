import React, { useState } from 'react';
import './VoiceSearch.css';

function VoiceSearch({ onResult }) {
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className={`voice-search-btn ${isListening ? 'listening' : ''}`}
      aria-label="Voice Search"
    >
      {isListening ? '🔴 Speak Now...' : '🎤 Voice Search'}
    </button>
  );
}

export default VoiceSearch;
