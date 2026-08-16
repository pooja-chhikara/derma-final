import { useEffect, useRef, useState } from "react";
import { sendChatMessage, GeminiError } from "../lib/gemini";

const WELCOME = {
  role: "assistant",
  text: "Hi, I'm Sage 🌿 — your DermaCare skin guide. Ask me about routines, ingredients, or a concern you're seeing, and I'll help however I can.",
};

const SUGGESTIONS = [
  "What's a good routine for oily skin?",
  "Is retinol safe with vitamin C?",
  "How do I fade dark spots?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  async function handleSend(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;

    const history = messages;
    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const reply = await sendChatMessage(history, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      const msg = err instanceof GeminiError ? err.message : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: msg }]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleSend();
  }

  return (
    <>
      <button
        className="chat-bubble-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat with Sage"}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-leaf"}`}></i>
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar">🌿</span>
              <div>
                <div className="chat-name">Sage</div>
                <div className="chat-status">Your DermaCare guide</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <span className="msg-avatar">{m.role === "assistant" ? "🌿" : "🙂"}</span>
                <span className="msg-bubble">{m.text}</span>
              </div>
            ))}
            {sending && (
              <div className="chat-msg assistant">
                <span className="msg-avatar">🌿</span>
                <span className="msg-bubble typing">
                  <span></span><span></span><span></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && !sending && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSend(s)}>{s}</button>
              ))}
            </div>
          )}

          <form className="chat-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask Sage about your skin…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
