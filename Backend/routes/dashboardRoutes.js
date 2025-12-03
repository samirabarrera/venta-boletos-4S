import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  obtenerEstadisticas,
  obtenerEventosPorEstado,
  obtenerVentasPorEvento
} from '../controllers/dashboardController.js';

const router = express.Router();

// Rutas del dashboard (solo para administradores)
router.get('/estadisticas', authMiddleware, obtenerEstadisticas);
router.get('/eventos-estado', authMiddleware, obtenerEventosPorEstado);
router.get('/ventas-evento', authMiddleware, obtenerVentasPorEvento);

export default router;
