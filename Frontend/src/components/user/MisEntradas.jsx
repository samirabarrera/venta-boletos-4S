import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { obtenerMisTickets } from "../../api";
import "../user/mis-entradas.css";

export default function MisEntradas() {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEntradas();
  }, []);

  const cargarEntradas = async () => {
    try {
      setLoading(true);
      const data = await obtenerMisTickets();
      setEntradas(data);
      setError("");
    } catch (err) {
      setError("Error al cargar tus entradas. Por favor, intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearFechaCompra = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-GT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mis-entradas-page">
        <Container className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando tus entradas...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-entradas-page">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="mis-entradas-page">
      <Container>
        <h2 className="titulo-mis-entradas">Mis Entradas 🎫</h2>

        {entradas.length === 0 ? (
          <Alert variant="info" className="text-center mt-4">
            <h5>No tienes entradas compradas aún</h5>
            <p className="mb-0">
              Ve a la sección de <strong>Eventos</strong> para comprar tus entradas.
            </p>
          </Alert>
        ) : (
          <div className="tabla-container">
            <div className="mb-3">
              <Badge bg="primary" className="me-2">
                Total de compras: {entradas.length}
              </Badge>
              <Badge bg="success">
                Total de entradas:{" "}
                {entradas.reduce((sum, e) => sum + e.cant_tickets, 0)}
              </Badge>
            </div>

            <Table striped bordered hover responsive className="tabla-entradas">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Evento</th>
                  <th>Fecha del Evento</th>
                  <th>Lugar</th>
                  <th>Cantidad</th>
                  <th>Fecha de Compra</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada, index) => (
                  <tr key={entrada.transaction_id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{entrada.event_title}</strong>
                    </td>
                    <td>{formatearFecha(entrada.event_date)}</td>
                    <td>{entrada.event_location}</td>
                    <td className="text-center">
                      <Badge bg="primary">{entrada.cant_tickets}</Badge>
                    </td>
                    <td className="text-muted">
                      {formatearFechaCompra(entrada.purchase_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </div>
  );
}