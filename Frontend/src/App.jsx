import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";
import MiPerfil from "./components/MiPerfil.jsx";

// Importar páginas exclusivas de usuario
import UserLayout from "./components/user/UserLayout.jsx";
import Eventos from "./components/user/Eventos.jsx";
import MisEntradas from "./components/user/MisEntradas.jsx";

// Importar páginas exclusivas de administrador
import AdminLayout from "./components/admin/AdminLayout.jsx";
import Dashboard from "./components/admin/AdminDashboard.jsx";
import OrganizarEvento from "./components/admin/AdminEvento.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas y sin navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas para USER*/}
          <Route element={<UserLayout />}>
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/entradas" element={<MisEntradas />} />
            <Route path="/perfil" element={<MiPerfil />} />
          </Route>

        {/* Rutas protegidas para ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/evento" element={<OrganizarEvento />} />
            <Route path="/admin/perfil" element={<MiPerfil />} />
          </Route>
        </Route>


        {/* Ruta 404/No Encontrada */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}
export default App;
