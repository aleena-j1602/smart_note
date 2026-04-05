import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import { useNavigate } from "react-router-dom"

export default function SearchNotes() {
  const [notes, setNotes] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchNotes = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)

    // ✅ FIXED search query
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
      )
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (!error) {
      // ✅ FIX: normalize tags safely
      const formatted = data.map(note => ({
        ...note,
        tags: Array.isArray(note.tags)
          ? note.tags
          : typeof note.tags === "string"
          ? note.tags.split(",")
          : []
      }))

      setNotes(formatted)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [searchQuery])

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Back
        </button>
        <span style={styles.breadcrumb}>Search</span>
      </div>

      <h2 style={styles.heading}>Find a note</h2>

      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>◎</span>
        <input
          type="text"
          placeholder="Search by title or content…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          autoFocus
        />
        {searchQuery && (
          <button style={styles.clearBtn} onClick={() => setSearchQuery("")}>
            ✕
          </button>
        )}
      </div>

      {searchQuery && (
        <div style={styles.resultCount}>
          {notes.length} {notes.length === 1 ? "result" : "results"} for "{searchQuery}"
        </div>
      )}

      <div style={styles.list}>
        {loading ? (
          <div style={styles.empty}>Searching…</div>
        ) : notes.length === 0 ? (
          <div style={styles.empty}>
            {searchQuery
              ? "No notes match that search."
              : "You haven't written any notes yet."}
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} style={styles.card}>
              <h3 style={styles.noteTitle}>{note.title}</h3>

              {note.content && (
                <p style={styles.noteContent}>{note.content}</p>
              )}

              {/* ✅ SAFE TAG HANDLING */}
              {note.tags.length > 0 && (
                <div style={styles.tags}>
                  {note.tags
                    .filter(Boolean)
                    .map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                </div>
              )}

              <div style={styles.noteDate}>
                {new Date(note.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          ))
        )}
      </div>
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
  heading: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "36px",
    color: "#f0e6d0",
    margin: "0 0 24px",
    fontWeight: 400,
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "#5a4e3c",
    fontSize: "16px",
    pointerEvents: "none",
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: "40px",
    paddingRight: "36px",
  },
  clearBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#5a4e3c",
    cursor: "pointer",
    padding: "4px",
    fontSize: "13px",
    width: "auto",
  },
  resultCount: {
    fontSize: "13px",
    color: "#8a7a64",
    marginBottom: "16px",
    fontStyle: "italic",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    background: "#181410",
    border: "1px solid #2e281f",
    borderRadius: "12px",
    padding: "20px",
    transition: "border-color 0.2s",
  },
  noteTitle: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "20px",
    color: "#f0e6d0",
    margin: "0 0 8px",
    fontWeight: 400,
  },
  noteContent: {
    fontSize: "14px",
    color: "#8a7a64",
    margin: "0 0 12px",
    lineHeight: 1.6,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "12px",
  },
  noteDate: {
    fontSize: "12px",
    color: "#5a4e3c",
  },
  empty: {
    padding: "48px 0",
    textAlign: "center",
    color: "#5a4e3c",
    fontSize: "14px",
    fontStyle: "italic",
  },
}