import React, { useState, useRef } from "react";

export default function SpeechToTextButton({ onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (onResult) onResult(text); // send recognized text back
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognitionRef.current.start();
  };

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={listening}
      style={{
        padding: "10px 12px",
        background: listening ? "#ff4b4b" : "#433ae8ff",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: listening ? "not-allowed" : "pointer"
      }}
    >
      {listening ? "🎙 Listening..." : "🎤 Speak"}
    </button>
  );
}
