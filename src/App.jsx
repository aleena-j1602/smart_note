import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Home"
import AddNote from "./AddNote"
import SearchNotes from "./SearchNotes"
import ManageNotes from "./ManageNotes"
import ChatbotPage from "./ChatbotPage"
import Auth from "./Auth"
import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!user) return <Auth />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddNote />} />
        <Route path="/search" element={<SearchNotes />} />
        <Route path="/manage" element={<ManageNotes />} />
        <Route path="/chat" element={<ChatbotPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App