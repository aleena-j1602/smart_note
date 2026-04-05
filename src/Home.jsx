import { useNavigate } from "react-router-dom"
import { supabase } from "./supabaseClient"

const navItems = [
  {
    path: "/add",
    icon: "✦",
    label: "New Note",
    desc: "Capture your thoughts",
    accent: true,
  },
  {
    path: "/search",
    icon: "◎",
    label: "Search",
    desc: "Find anything, fast",
  },
  {
    path: "/manage",
    icon: "⊞",
    label: "Manage",
    desc: "Edit & organise notes",
  },
  {
    path: "/chat",
    icon: "⟡",
    label: "AI Chatbot",
    desc: "Chat with your notes",
  },
]

export default function Home() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Your workspace</div>
          <h1 style={styles.title}>Smart Notes</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut} style={styles.signOutBtn}>
          Sign out
        </button>
      </div>

      {/* Decorative line */}
      <div style={styles.rule} />

      {/* Main grid */}
      <div style={styles.grid}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.card,
              ...(item.accent ? styles.cardAccent : {}),
            }}
            className="nav-card"
          >
            <span style={{
              ...styles.icon,
              ...(item.accent ? styles.iconAccent : {}),
            }}>{item.icon}</span>
            <div>
              <div style={{
                ...styles.cardLabel,
                ...(item.accent ? styles.cardLabelAccent : {}),
              }}>{item.label}</div>
              <div style={styles.cardDesc}>{item.desc}</div>
            </div>
            <span style={styles.arrow}>→</span>
          </button>
        ))}
      </div>

      {/* Footer note count area */}
      <div style={styles.footer}>
        <span style={styles.footerDot}>●</span>
        <span style={styles.footerText}>Your thoughts, beautifully organised</span>
      </div>

      <style>{`
        .nav-card:hover { 
          background: #211c17 !important;
          border-color: #3d3428 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .nav-card:hover .arrow { opacity: 1 !important; transform: translateX(3px); }
        .nav-card { transition: all 0.2s ease; }
      `}</style>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0f0d0b",
    padding: "60px 24px",
    maxWidth: "580px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#e8a832",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "52px",
    color: "#f0e6d0",
    margin: 0,
    fontWeight: 400,
    lineHeight: 1.1,
  },
  signOutBtn: {
    marginTop: "8px",
    flexShrink: 0,
  },
  rule: {
    height: "1px",
    background: "linear-gradient(to right, #2e281f, #3d3428, #2e281f)",
    margin: "32px 0 36px",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 20px",
    background: "#181410",
    border: "1px solid #2e281f",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  cardAccent: {
    background: "rgba(232,168,50,0.07)",
    border: "1px solid rgba(232,168,50,0.25)",
  },
  icon: {
    fontSize: "20px",
    color: "#8a7a64",
    width: "32px",
    flexShrink: 0,
    textAlign: "center",
  },
  iconAccent: {
    color: "#e8a832",
  },
  cardLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    color: "#f0e6d0",
    marginBottom: "2px",
  },
  cardLabelAccent: {
    color: "#e8a832",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#8a7a64",
  },
  arrow: {
    marginLeft: "auto",
    color: "#5a4e3c",
    fontSize: "18px",
    opacity: 0.6,
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  footer: {
    marginTop: "48px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  footerDot: {
    fontSize: "8px",
    color: "#e8a832",
  },
  footerText: {
    fontSize: "13px",
    color: "#5a4e3c",
    fontStyle: "italic",
  },
}