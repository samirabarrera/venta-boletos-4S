import pool from '../database.js';

// POST: Crear evento
export const crearEvento = async (req, res) => {
  if (req.user.tipo_usuario !== 1) {
    return res.status(403).json({ msg: "Acceso denegado." });
  }
  const { title, location, event_date, total_tickets } = req.body;
  if (!req.file) {
    return res.status(400).json({ msg: "No se subió ninguna imagen." });
  }

  // Construir la URL de la imagen
  const image_url = `/uploads/${req.file.filename}`;
  if (
    !title ||
    !location ||
    !event_date ||
    !total_tickets ||
    total_tickets <= 0
  ) {
    return res
      .status(400)
      .json({ msg: "Todos los campos de texto son obligatorios." });
  }

  try {
    const tickets_sold = 0;
    const tickets_remaining = total_tickets;

    // Guardar la 'image_url' en la base de datos
    const result = await pool.query(
      "INSERT INTO eventos (title, location, event_date, total_tickets, tickets_sold, tickets_remaining, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING event_id",
      [
        title,
        location,
        event_date,
        total_tickets,
        tickets_sold,
        tickets_remaining,
        image_url,
      ]
    );

    res.status(201).json({
      msg: "Evento creado exitosamente",
      eventId: result.rows[0].event_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor al crear el evento." });
  }
};

// GET /api/events/misEventos
export const verEvento = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT event_id, title, location, event_date, tickets_remaining FROM eventos WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error en el servidor al obtener los eventos." });
  }
};

// DELETE /api/events/misEventos/:id
export const cancelarEvento = async (req, res) => {
  if (req.user.tipo_usuario !== 1) {
    return res.status(403).json({
      msg: "Acceso denegado. Solo los administradores pueden eliminar eventos.",
    });
  }

  const { id: event_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT tickets_sold FROM eventos WHERE event_id = $1",
      [event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "El evento no existe." });
    }

    if (result.rows[0].tickets_sold > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar un evento que ya tiene boletos vendidos.",
      });
    }

    await pool.query("DELETE FROM eventos WHERE event_id = $1", [event_id]);

    res.status(200).json({ msg: "Evento eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error en el servidor al eliminar el evento." });
  }
};
