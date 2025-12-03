import { pool } from '../database.js';

// GET /api/dashboard/estadisticas
export const obtenerEstadisticas = async (req, res) => {
  // Verificar que sea administrador
  if (req.user.tipo_usuario !== 1) {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
  }
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM eventos) as total_eventos,
        (SELECT COALESCE(SUM(tickets_sold), 0) FROM eventos) as tickets_vendidos,
        (SELECT COUNT(*) FROM users) as usuarios_registrados
    `);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ msg: 'Error en el servidor al obtener estadísticas.' });
  }
};

export const obtenerEventosPorEstado = async (req, res) => {
  // Verificar que sea administrador
  if (req.user.tipo_usuario !== 1) {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        COUNT(CASE WHEN tickets_remaining > 0 AND event_date >= CURRENT_DATE THEN 1 END) as disponibles,
        COUNT(CASE WHEN tickets_remaining = 0 AND event_date >= CURRENT_DATE THEN 1 END) as agotados,
        COUNT(CASE WHEN event_date < CURRENT_DATE THEN 1 END) as pasados
      FROM eventos
    `);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener eventos por estado:', error);
    res.status(500).json({ msg: 'Error en el servidor al obtener eventos por estado.' });
  }
};

export const obtenerVentasPorEvento = async (req, res) => {
  // Verificar que sea administrador
  if (req.user.tipo_usuario !== 1) {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        event_id,
        title,
        event_date,
        total_tickets,
        tickets_sold,
        tickets_remaining,
        ROUND((tickets_sold::DECIMAL / NULLIF(total_tickets, 0) * 100), 2) as porcentaje_vendido
      FROM eventos
      WHERE tickets_sold > 0
      ORDER BY tickets_sold DESC
      LIMIT 10
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener ventas por evento:', error);
    res.status(500).json({ msg: 'Error en el servidor al obtener ventas por evento.' });
  }
};
