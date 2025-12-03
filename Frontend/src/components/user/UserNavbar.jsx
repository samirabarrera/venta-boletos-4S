import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./user-navbar.css";

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Función para verificar si la ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar className="user-navbar" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/eventos" className="brand-logo">
          <span className="brand-icon">🎫</span>
          <span className="brand-text">Ticketología</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="user-navbar-nav" />
        <Navbar.Collapse id="user-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/eventos"
              className={isActive("/eventos") ? "active-link" : ""}
            >
              Eventos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/entradas"
              className={isActive("/entradas") ? "active-link" : ""}
            >
              Mis Entradas
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/perfil"
              className={isActive("/perfil") ? "active-link" : ""}
            >
              Mi Perfil
            </Nav.Link>
          </Nav>

          {/*Logout */}
          <Nav>
            <Nav.Link onClick={handleLogout} className="logout-btn">
              <span className="nav-icon">🚪</span>
              Cerrar Sesión
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
