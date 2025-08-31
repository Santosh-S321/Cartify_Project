import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // For Phase 1, just redirect to home or profile
    navigate('/profile')
  }

  return (
    <span>
    <div className="login-page">
      <h2>Login to Cartify</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div class="checkbox">
        <label>
          <input type="checkbox"/> Remember me
        </label>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </span>
  )
}