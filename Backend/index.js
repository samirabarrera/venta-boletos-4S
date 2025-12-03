import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuarioRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { pool } from './database.js'

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173', // puerto del frontend
  credentials: true // Permitir envío de cookies y credenciales del admin
}));

const pruebaConexion = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Hora actual en la base de datos:", res.rows[0]);
  } catch (err) {
    console.error("Fallo en prueba de conexión:", err);
  }
};
pruebaConexion();

// Servir archivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/user', usuarioRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
//Archivos estáticos del frontend
app.use('/frontend', express.static('Frontend'));
//Levantar puerto en el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});

export default app;