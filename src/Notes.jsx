// Notes.jsx
import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import Chatbot from "./Chatbot"

export default function Notes() {
  const [user, setUser] = useState(null)
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Get current user
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    return user
  }

  // Fetch notes (with optional search)
  const fetchNotes = async () => {
    const user = await getCurrentUser()
    if (!user) return

    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query
        .ilike("title", `%${searchQuery}%`)
        .or(`content.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query
    if (error) console.error("Fetch error:", error)
    else setNotes(data)
  }

  // Add new note
  const addNote = async () => {
    if (!title || !content) return
    const user = await getCurrentUser()
    const { error } = await supabase.from("notes").insert([
      {
        title,
        content,
        user_id: user.id,
        tags: tags.split(",").map((t) => t.trim()),
      },
    ])
    if (error) console.error("Insert error:", error)
    else {
      setTitle("")
      setContent("")
      setTags("")
      fetchNotes()
    }
  }

  // Update note content or tags
  const updateNote = async (noteId, newContent, newTags) => {
    const user = await getCurrentUser()
    const { error } = await supabase
      .from("notes")
      .update({ content: newContent, tags: newTags.split(",").map((t) => t.trim()) })
      .eq("id", noteId)
      .eq("user_id", user.id)
    if (error) console.error("Update error:", error)
    else fetchNotes()
  }

  // Delete note
  const deleteNote = async (noteId) => {
    const user = await getCurrentUser()
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId)
      .eq("user_id", user.id)
    if (error) console.error("Delete error:", error)
    else fetchNotes()
  }

  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Logout error:", error)
    else setUser(null)
  }

  useEffect(() => {
    fetchNotes()
  }, [searchQuery])

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={logout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      <h2>Add Note</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <button onClick={addNote} style={{ marginBottom: "20px" }}>
        Add Note
      </button>

      <h2>Search Notes</h2>
      <input
        type="text"
        placeholder="Search by title or content..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <h2>Your Notes</h2>
      {notes.length === 0 && <p>No notes yet.</p>}
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          <input
            type="text"
            value={note.title}
            onChange={(e) => updateNote(note.id, note.content, note.tags.join(","))}
            style={{ width: "100%", fontWeight: "bold", marginBottom: "5px" }}
          />
          <textarea
            value={note.content}
            onChange={(e) => updateNote(note.id, e.target.value, note.tags.join(","))}
            style={{ width: "100%", marginBottom: "5px" }}
          />
          <input
            type="text"
            value={note.tags.join(", ")}
            onChange={(e) => updateNote(note.id, note.content, e.target.value)}
            style={{ width: "100%", marginBottom: "5px" }}
          />
          <p>Created: {new Date(note.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(note.updated_at).toLocaleString()}</p>
          <button onClick={() => deleteNote(note.id)} style={{ marginTop: "5px" }}>
            Delete
          </button>
        </div>
      ))}

      {/* GROQ Chatbot */}
      <Chatbot />
    </div>
  )
}