import { useState } from 'react'
import type { FormEvent } from 'react'
//import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  try {
    await loginUser({ email, password })
    window.location.href = '/app'
  } catch (error) {
    console.error('Error en login:', error)
  }
}

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Ingresar</button>
      </form>
    </main>
  )
}

export default LoginPage