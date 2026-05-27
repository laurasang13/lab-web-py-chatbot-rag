import { useState, useRef, useEffect } from "react";
import styles from "./ChatbotPage.module.css";

const API_URL = "http://localhost:8000/chat";

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hola, soy MindVibes Assistant 🌿 Estoy aquí para ayudarte con tus emociones y bienestar. ¿Cómo te sientes hoy?",
      fuentes: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [privacyWarning, setPrivacyWarning] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setPrivacyWarning(false);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: trimmed, session_id: sessionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error del servidor");
      }

      const data = await res.json();
      if (data.session_id && !sessionId) setSessionId(data.session_id);
      if (data.advertencia_privacidad) setPrivacyWarning(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.respuesta,
          fuentes: data.fuentes,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Lo siento, hubo un problema al conectar con el asistente. Inténtalo de nuevo.`,
          fuentes: [],
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  return (
    <div className={styles.page}>
      <div className={styles.chatWrapper}>
        <header className={styles.header}>
          <div className={styles.avatarDot} />
          <div>
            <p className={styles.headerTitle}>MindVibes Assistant</p>
            <p className={styles.headerSub}>Bienestar emocional · RAG</p>
          </div>
        </header>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.messageRow} ${msg.role === "user" ? styles.userRow : styles.botRow}`}
            >
              {msg.role === "assistant" && (
                <div className={styles.botAvatar}>M</div>
              )}
              <div className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.botBubble} ${msg.error ? styles.errorBubble : ""}`}>
                <p className={styles.bubbleText}>{msg.content}</p>
                {msg.fuentes && msg.fuentes.length > 0 && (
                  <div className={styles.sources}>
                    <span className={styles.sourcesLabel}>Fuentes:</span>{" "}
                    {msg.fuentes.map((f, fi) => (
                      <span key={fi} className={styles.sourceTag}>
                        {f.replace(".txt", "").replace("docs/", "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.messageRow} ${styles.botRow}`}>
              <div className={styles.botAvatar}>M</div>
              <div className={`${styles.bubble} ${styles.botBubble}`}>
                <span className={styles.typing}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {privacyWarning && (
          <div className={styles.privacyAlert}>
            ⚠️ Tu mensaje parece contener información personal. No es necesario compartir datos privados.
          </div>
        )}

        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            rows={1}
            placeholder="Escribe cómo te sientes hoy…"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Enviar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
