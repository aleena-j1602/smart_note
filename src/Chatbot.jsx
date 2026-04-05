// Chatbot.jsx
import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Chatbot() {
  const [user, setUser] = useState(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const askGROQ = async () => {
    if (!input.trim() || !user) return

      const userMessage = input.trim()
      setInput("")
      setMessages(prev => [...prev, { role: "user", text: userMessage }])
      setLoading(true)

      // ✅ Fetch notes safely
      const { data: notes, error } = await supabase
        .from("notes")
        .select("title, content")
        .eq("user_id", user.id)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // ✅ Prevent null crash
      const safeNotes = notes || []

      const context = safeNotes
        .map(n => `${n.title || ""}: ${n.content || ""}`)
        .join("\n")

      const prompt = `
    User's notes:
    ${context || "No notes available"}

    Question: ${userMessage}
    Answer concisely:
`

      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
              ],
              max_tokens: 200,
            }),
          }
        )

        // 🔍 DEBUG RESPONSE
        

        const data = await res.json()

        console.log("STATUS:", res.status)
        console.log("ERROR DATA:", data)

        if (!res.ok) {
            throw new Error(data?.error?.message || "Request failed")
            }

        const reply =
          data.choices[0].message.content

        setMessages(prev => [...prev, { role: "ai", text: reply }])
      } catch (err) {
        console.error("FINAL error:", err.message)
        setMessages(prev => [
          ...prev,
          { role: "ai", text: err.message },
        ])
      } finally {
        setLoading(false)
      }
    }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      askGROQ()
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Back
        </button>
        <span style={styles.breadcrumb}>AI Assistant</span>
      </div>

      <h2 style={styles.heading}>Ask your notes</h2>
      <p style={styles.sub}>Your thoughts, made searchable and conversational.</p>

      {/* Message Window */}
      <div style={styles.messageWindow}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✦</span>
            <p style={styles.emptyText}>Ask me anything about your notes.</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAI),
              }}
            >
              <span style={{
                ...styles.roleLabel,
                ...(m.role === "user" ? styles.roleLabelUser : styles.roleLabelAI),
              }}>
                {m.role === "user" ? "You" : "AI"}
              </span>
              <p style={styles.bubbleText}>{m.text}</p>
            </div>
          ))
        )}

        {loading && (
          <div style={{ ...styles.bubble, ...styles.bubbleAI }}>
            <span style={{ ...styles.roleLabel, ...styles.roleLabelAI }}>AI</span>
            <p style={{ ...styles.bubbleText, ...styles.typingDots }}>Thinking…</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Row */}
      <div style={styles.inputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something about your notes…"
          style={styles.input}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={askGROQ}
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || loading ? 0.5 : 1,
          }}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>

      <p style={styles.hint}>Press Enter to send · Shift+Enter for new line</p>
    </div>
  )
}

const styles = {
  wrapper: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "40px 24px 80px",
    width: "100%",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "36px",
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#5a4e3c",
  },
  heading: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "36px",
    color: "#f0e6d0",
    margin: "0 0 8px",
    fontWeight: 400,
  },
  sub: {
    color: "#8a7a64",
    fontSize: "14px",
    margin: "0 0 28px",
    fontStyle: "italic",
  },
  messageWindow: {
    background: "#1a1510",
    border: "1px solid #2e2820",
    borderRadius: "12px",
    padding: "20px",
    minHeight: "300px",
    maxHeight: "420px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "16px",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    margin: "auto",
    paddingTop: "60px",
  },
  emptyIcon: {
    fontSize: "28px",
    color: "#3a3228",
  },
  emptyText: {
    color: "#5a4e3c",
    fontSize: "14px",
    fontStyle: "italic",
    margin: 0,
  },
  bubble: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxWidth: "88%",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleAI: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  roleLabel: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "2px",
  },
  roleLabelUser: {
    color: "#8a7a64",
  },
  roleLabelAI: {
    color: "#5a7a5a",
  },
  bubbleText: {
    margin: 0,
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: "1.6",
    background: "#2a2420",
    color: "#d4c4a8",
    border: "1px solid #3a3228",
  },
  typingDots: {
    color: "#5a4e3c",
    fontStyle: "italic",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
  },
  sendBtn: {
    minWidth: "72px",
    flexShrink: 0,
  },
  hint: {
    fontSize: "11px",
    color: "#3a3228",
    marginTop: "8px",
    textAlign: "right",
    fontStyle: "italic",
  },
}