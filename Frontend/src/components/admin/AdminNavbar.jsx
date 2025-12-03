import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./admin-navbar.css";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Función para verificar si la ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar className="admin-navbar" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/admin/dashboard" className="brand-logo">
          Admin Panel
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/admin/dashboard"
              className={isActive("/admin/dashboard") ? "active-link" : ""}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin/evento"
              className={isActive("/admin/evento") ? "active-link" : ""}
            >
              Organizar Evento
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin/perfil"
              className={isActive("/admin/perfil") ? "active-link" : ""}
            >
              Mi Perfil
            </Nav.Link>
          </Nav>

          {/* Botón de Logout */}
          <Nav>
            <Nav.Link onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
