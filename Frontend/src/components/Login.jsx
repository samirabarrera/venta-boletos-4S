import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  
  const [datos, setDatos] = useState({
    correo: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setDatos({
      ...datos,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault(); 
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: datos.correo,
          password: datos.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        
        // Decodificar el token para obtener el tipo de usuario
        const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
        const tipoUsuario = tokenPayload.tipo_usuario;
        
        // Redirigir según el tipo de usuario
        // tipo_usuario: 1 = Admin, 2 = Usuario regular
        if (tipoUsuario === 1) {
          navigate('/admin/dashboard');
        } else {
          navigate('/eventos');
        }
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: "url('/img/BackgroundImage.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="card shadow p-4"
        style={{ width: "22rem", backgroundColor: "rgba(250, 250, 250, 0.9)" }}
      >
        <h2 className="text-center mb-4">Login</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo</label>
            <input
              type="email"
              id="correo"
              name="correo"
              className="form-control"
              placeholder="ejemplo@email.com"
              onChange={handleChange}
              value={datos.correo}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="********"
              onChange={handleChange}
              value={datos.password}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: "#b83280",
              borderColor: "#9d2b6d",
              color: "white",
            }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center mt-3">
          ¿No tienes cuenta?{" "}
          <Link
            to="/registro"
            className="text-decoration-none"
            style={{ color: "#9d2b6d", fontWeight: "bold" }}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
