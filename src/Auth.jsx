import { useState } from "react"
import { supabase } from "./supabaseClient"

export default function Auth() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // 🔐 SIGN UP
  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.log("❌", error.message)
    } else {
      alert("Check your email for confirmation!")
    }
  }

  // 🔓 LOGIN
  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log("❌", error.message)
    } else {
      alert("Logged in successfully!")
    }
  }

  return (
    <div>
      <h2>Auth Page</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={signUp}>Sign Up</button>
      <button onClick={login}>Login</button>
    </div>
  )
}