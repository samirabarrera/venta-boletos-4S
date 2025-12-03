import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar.jsx';
import './admin-layout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Navbar siempre visible */}
      <AdminNavbar />

      {/* Contenido principal de la página */}
      <main className="admin-page-content">
        <Outlet />
      </main>
    </div>
  );
}
