import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import Auth from "./Auth"
import Notes from "./Notes"

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <div>
      {user ? <Notes /> : <Auth />}
    </div>
  )
}

export default App