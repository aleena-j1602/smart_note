import { useState, useRef } from "react"
import { supabase } from "./supabaseClient"
import { useNavigate } from "react-router-dom"

export default function AddNote() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState("text")
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null
    const r = new SpeechRecognition()
    r.continuous = true
    r.interimResults = true
    return r
  }

  const startListening = () => {
    const recognition = initRecognition()
    if (!recognition) {
      alert("Speech recognition not supported in this browser")
      return
    }
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)

    recognition.onresult = (event) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setContent(transcript)
    }

    recognition.onend = () => setListening(false)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const addNote = async () => {
    if (!title.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("notes").insert([{
      title,
      content,
      user_id: user.id,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    }])
    setSaving(false)
    setSaved(true)
    if (listening) stopListening()
    setTimeout(() => {
      setSaved(false)
      setTitle("")
      setContent("")
      setTags("")
    }, 1800)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Back
        </button>
        <span style={styles.breadcrumb}>New note</span>
      </div>

      <h2 style={styles.heading}>Capture a thought</h2>
      <p style={styles.sub}>Write it down before it slips away.</p>

      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Title</label>
          <input
            placeholder="What's on your mind?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Content</label>
            <div style={styles.modeToggle}>
              <button
                style={{
                  ...styles.modeBtn,
                  ...(mode === "text" ? styles.modeBtnActive : {}),
                }}
                onClick={() => {
                  if (listening) stopListening()
                  setMode("text")
                }}
              >
                ✏️ Text
              </button>
              <button
                style={{
                  ...styles.modeBtn,
                  ...(mode === "voice" ? styles.modeBtnActive : {}),
                }}
                onClick={() => setMode("voice")}
              >
                🎤 Voice
              </button>
            </div>
          </div>

          <textarea
            placeholder={
              mode === "voice"
                ? "Your voice will appear here…"
                : "The details, the nuances, the big idea..."
            }
            value={content}
            onChange={e => mode === "text" && setContent(e.target.value)}
            readOnly={mode === "voice"}
            style={{
              minHeight: "180px",
              cursor: mode === "voice" ? "default" : "text",
            }}
          />

          {mode === "voice" && (
            <div style={styles.voiceControls}>
              {listening && (
                <span style={styles.listeningBadge}>
                  <span style={styles.pulseDot} /> Listening…
                </span>
              )}
              {!listening ? (
                <button
                  className="btn btn-sm"
                  style={styles.recordBtn}
                  onClick={startListening}
                >
                  🎤 Start Recording
                </button>
              ) : (
                <button
                  className="btn btn-sm"
                  style={{ ...styles.recordBtn, ...styles.recordBtnStop }}
                  onClick={stopListening}
                >
                  ⏹ Stop Recording
                </button>
              )}
            </div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Tags</label>
          <input
            placeholder="work, ideas, personal (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        <div style={styles.actions}>
          <button
            className="btn btn-primary"
            onClick={addNote}
            disabled={saving || !title.trim()}
            style={{
              opacity: !title.trim() && !saving ? 0.5 : 1,
              minWidth: "120px",
            }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save note"}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </div>
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
    margin: "0 0 32px",
    fontStyle: "italic",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8a7a64",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  modeToggle: {
    display: "flex",
    gap: "4px",
  },
  modeBtn: {
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "20px",
    border: "1px solid #3a3228",
    background: "transparent",
    color: "#8a7a64",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  modeBtnActive: {
    background: "#3a3228",
    color: "#f0e6d0",
    borderColor: "#5a4e3c",
  },
  voiceControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "4px",
  },
  listeningBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#c0392b",
    fontStyle: "italic",
  },
  pulseDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#c0392b",
    animation: "pulse 1s infinite",
  },
  recordBtn: {
    fontSize: "12px",
    background: "#2a3a2a",
    color: "#a0c8a0",
    border: "1px solid #3a5a3a",
    borderRadius: "6px",
    padding: "5px 14px",
    cursor: "pointer",
  },
  recordBtnStop: {
    background: "#3a2a2a",
    color: "#c8a0a0",
    borderColor: "#5a3a3a",
  },
  actions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingTop: "8px",
  },
}