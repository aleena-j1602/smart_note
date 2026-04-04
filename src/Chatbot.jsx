// Chatbot.jsx
import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Chatbot() {
  const [user, setUser] = useState(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])

  // Get logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  // Send question to GROQ
  const askGROQ = async () => {
    if (!input || !user) return

    // Fetch user's notes
    const { data: notes } = await supabase
      .from("notes")
      .select("title, content, tags")
      .eq("user_id", user.id)

    const context = notes.map((n) => `${n.title}: ${n.content}`).join("\n")

    const prompt = `
You are a helpful assistant. 
User's notes:
${context}

Question: ${input}
Answer concisely:
`

    try {
      const res = await fetch("https://api.groq.ai/v1/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "groq-code-mini", // or your chosen GROQ model
          prompt,
          max_tokens: 200,
        }),
      })

      const data = await res.json()
      const reply = data?.text || "No response from GROQ"

      setMessages([...messages, { role: "user", text: input }, { role: "ai", text: reply }])
      setInput("")
    } catch (err) {
      console.error("GROQ API error:", err)
      setMessages([...messages, { role: "user", text: input }, { role: "ai", text: "Error fetching response" }])
      setInput("")
    }
  }

  return (
    <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "5px" }}>
      <h2>AI Chatbot (GROQ)</h2>
      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          marginBottom: "10px",
          padding: "5px",
          background: "#f9f9f9",
          borderRadius: "5px",
        }}
      >
        {messages.length === 0 && <p>Ask me something about your notes!</p>}
        {messages.map((m, idx) => (
          <p key={idx} style={{ margin: "5px 0" }}>
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question..."
        style={{ width: "80%", marginRight: "5px", padding: "5px" }}
      />
      <button onClick={askGROQ} style={{ padding: "5px 10px" }}>
        Send
      </button>
    </div>
  )
}