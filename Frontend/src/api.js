const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 
    'Authorization': `Bearer ${token}`,
  } : {};
};

//Eventos
export const obtenerEventos = async () => {
  const response = await fetch(`${API_URL}/events/misEventos`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener eventos');
  }
  return await response.json();
};

export const crearEvento = async (formData) => {
  const response = await fetch(`${API_URL}/events/crearEvento`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || 'Error al crear evento');
  }
  return await response.json();
};

export const deleteEvent = async (id) => {
  const response = await fetch(`${API_URL}/events/misEventos/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || 'Error al eliminar evento');
  }
  return await response.json();
};

//Tickets
export const comprarTicket = async (eventId, cantidad) => {
  const response = await fetch(`${API_URL}/tickets/crearCompra`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event_id: eventId,
      cant_tickets: cantidad
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || 'Error al comprar ticket');
  }
  return await response.json();
};

export const obtenerMisTickets = async () => {
  const response = await fetch(`${API_URL}/tickets/misTickets`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener mis tickets');
  }
  return await response.json();
};

//Dashboard Admin
export const obtenerEstadisticasAdmin = async () => {
  const response = await fetch(`${API_URL}/dashboard/estadisticas`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }
  return await response.json();
};

export const obtenerEventosPorEstado = async () => {
  const response = await fetch(`${API_URL}/dashboard/eventos-estado`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener eventos por estado');
  }
  return await response.json();
};

export const obtenerVentasPorEvento = async () => {
  const response = await fetch(`${API_URL}/dashboard/ventas-evento`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener ventas por evento');
  }
  return await response.json();
};
