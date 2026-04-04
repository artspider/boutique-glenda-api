type LoginPayload = {
  email: string
  password: string
}

async function loginUser(payload: LoginPayload) {
  const formData = new URLSearchParams()
  formData.append('username', payload.email)
  formData.append('password', payload.password)

  const response = await fetch('http://127.0.0.1:8000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new Error('Credenciales inválidas o error de servidor')
  }

  return response.json()
}

export { loginUser }