import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./mi-perfil.css";

export default function MiPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/user/mi-perfil', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
      } else {
        // Si el token es inválido, redirigir al login
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <Container>
          <div className="perfil-container">
            <Card className="perfil-card">
              <Card.Body>
                <p className="text-center">Cargando...</p>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-page">
        <Container>
          <div className="perfil-container">
            <Card className="perfil-card">
              <Card.Body>
                <p className="text-center text-danger">{error}</p>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <Container>
        <div className="perfil-container">
          <Card className="perfil-card">
            <Card.Body>
              <div className="perfil-header">
                <h2 className="perfil-titulo">Mi Perfil</h2>
              </div>

              <div className="perfil-info">
                <div className="info-item">
                  <label className="info-label">Nombre:</label>
                  <p className="info-value">{usuario?.name || 'N/A'}</p>
                </div>

                <div className="info-item">
                  <label className="info-label">Email:</label>
                  <p className="info-value">{usuario?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="perfil-actions">
                <Button
                  className="btn-cerrar-sesion"
                  onClick={handleCerrarSesion}
                >
                Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}
