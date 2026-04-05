import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import { useNavigate } from "react-router-dom"

export default function ManageNotes() {
  const [notes, setNotes] = useState([])
  const [saving, setSaving] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from("notes").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (!error) setNotes(data)
  }

  const saveNote = async (note) => {
    setSaving(note.id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("notes").update({
      content: note.content,
      tags: typeof note.tags === "string"
        ? note.tags.split(",").map(t => t.trim()).filter(Boolean)
        : note.tags,
    }).eq("id", note.id).eq("user_id", user.id)
    setTimeout(() => setSaving(null), 1200)
  }

  const deleteNote = async (noteId) => {
    if (!confirm("Delete this note permanently?")) return
    setDeleting(noteId)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id)
    setDeleting(null)
    fetchNotes()
  }

  const handleChange = (id, field, value) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n))
  }

  useEffect(() => { fetchNotes() }, [])

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Back</button>
        <span style={styles.breadcrumb}>Manage notes</span>
      </div>

      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Your notes</h2>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/add")}>
          + New note
        </button>
      </div>

      {notes.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✦</div>
          <p>No notes yet. Start writing!</p>
          <button className="btn btn-primary" onClick={() => navigate("/add")}>
            Write your first note
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {notes.map(note => (
            <div key={note.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.noteTitle}>{note.title}</h3>
                <div style={styles.noteDate}>
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric"
                  })}
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Content</label>
                <textarea
                  value={note.content}
                  onChange={e => handleChange(note.id, "content", e.target.value)}
                  style={{ minHeight: "100px" }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tags</label>
                <input
                  type="text"
                  value={Array.isArray(note.tags) ? note.tags.join(", ") : note.tags || ""}
                  onChange={e => handleChange(note.id, "tags", e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div style={styles.cardActions}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => saveNote(note)}
                  disabled={saving === note.id}
                  style={{ minWidth: "90px" }}
                >
                  {saving === note.id ? "✓ Saved" : "Save"}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteNote(note.id)}
                  disabled={deleting === note.id}
                >
                  {deleting === note.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    maxWidth: "700px",
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
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  heading: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "36px",
    color: "#f0e6d0",
    margin: 0,
    fontWeight: 400,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    background: "#181410",
    border: "1px solid #2e281f",
    borderRadius: "14px",
    padding: "20px 22px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "16px",
    gap: "12px",
  },
  noteTitle: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "20px",
    color: "#f0e6d0",
    margin: 0,
    fontWeight: 400,
  },
  noteDate: {
    fontSize: "12px",
    color: "#5a4e3c",
    flexShrink: 0,
    paddingTop: "4px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#5a4e3c",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  empty: {
    textAlign: "center",
    padding: "64px 24px",
    color: "#8a7a64",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  emptyIcon: {
    fontSize: "32px",
    color: "#e8a832",
    opacity: 0.5,
  },
}