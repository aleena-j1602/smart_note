import { useState } from "react"
import { supabase } from "./supabaseClient"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const signUp = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signUp({ email, password },
      { redirectTo: "https://idyllic-baklava-e65143.netlify.app/" }
    )
    setLoading(false)
    if (error) setMessage({ type: "error", text: error.message })
    else setMessage({ type: "success", text: "Check your email to confirm your account." })
  }

  const login = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setMessage({ type: "error", text: error.message })
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.panel}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>✦</span>
          <span style={styles.brandName}>Smart Notes</span>
        </div>

        <h2 style={styles.heading}>
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p style={styles.sub}>
          {mode === "login"
            ? "Sign in to access your notes."
            : "Join to start capturing your ideas."}
        </p>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.type === "error" ? styles.msgError : styles.msgSuccess),
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? login() : signUp())}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? login() : signUp())}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={mode === "login" ? login : signUp}
            disabled={loading || !email || !password}
            style={{ width: "100%", marginTop: "8px", padding: "12px" }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </div>

        <div style={styles.switchRow}>
          {mode === "login" ? (
            <>
              <span style={styles.switchText}>Don't have an account?</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setMode("signup"); setMessage(null) }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              <span style={styles.switchText}>Already have an account?</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setMode("login"); setMessage(null) }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#0f0d0b",
  },
  panel: {
    width: "100%",
    maxWidth: "400px",
    background: "#181410",
    border: "1px solid #2e281f",
    borderRadius: "18px",
    padding: "40px 36px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "32px",
  },
  brandIcon: {
    color: "#e8a832",
    fontSize: "20px",
  },
  brandName: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "20px",
    color: "#f0e6d0",
    fontWeight: 400,
  },
  heading: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "28px",
    color: "#f0e6d0",
    margin: "0 0 6px",
    fontWeight: 400,
  },
  sub: {
    fontSize: "14px",
    color: "#8a7a64",
    margin: "0 0 28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8a7a64",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "24px",
    justifyContent: "center",
  },
  switchText: {
    fontSize: "14px",
    color: "#8a7a64",
  },
  message: {
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "20px",
  },
  msgError: {
    background: "rgba(212,88,58,0.12)",
    border: "1px solid rgba(212,88,58,0.3)",
    color: "#e07060",
  },
  msgSuccess: {
    background: "rgba(106,170,106,0.12)",
    border: "1px solid rgba(106,170,106,0.3)",
    color: "#6aaa6a",
  },
}