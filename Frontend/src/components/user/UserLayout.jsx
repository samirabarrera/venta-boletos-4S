import { Outlet } from 'react-router-dom';
import UserNavbar from './UserNavbar.jsx';
import './user-layout.css';

export default function UserLayout() {
  return (
    <div className="user-layout">
      {/* Navbar siempre visible */}
      <UserNavbar />

      {/* Contenido principal de la página */}
      <main className="user-page-content">
        <Outlet />
      </main>
    </div>
  );
}
