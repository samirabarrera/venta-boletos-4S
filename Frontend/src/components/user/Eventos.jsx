import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { obtenerEventos, comprarTicket } from "../../api.js";
import "../user/eventos.css";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);
  const [mensajeCompra, setMensajeCompra] = useState({ tipo: "", texto: "" });

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const data = await obtenerEventos();
      setEventos(data);
      setError("");
    } catch (err) {
      setError("Error al cargar los eventos. Por favor, intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = (evento) => {
    setEventoSeleccionado(evento);
    setCantidad(1);
    setMensajeCompra({ tipo: "", texto: "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEventoSeleccionado(null);
    setCantidad(1);
    setMensajeCompra({ tipo: "", texto: "" });
  };

  const confirmarCompra = async () => {
    if (!eventoSeleccionado) return;

    try {
      setComprando(true);
      setMensajeCompra({ tipo: "", texto: "" });

      await comprarTicket(eventoSeleccionado.event_id, cantidad);

      setMensajeCompra({
        tipo: "success",
        texto: `¡Compra exitosa! Has adquirido ${cantidad} entrada(s) para ${eventoSeleccionado.title}`,
      });

      await cargarEventos();

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const mensajeError =
        err.response?.data?.msg || "Error al procesar la compra. Intenta de nuevo.";
      setMensajeCompra({
        tipo: "danger",
        texto: mensajeError,
      });
    } finally {
      setComprando(false);
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

  if (loading) {
    return (
      <div className="eventos-page">
        <Container className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando eventos...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eventos-page">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
          <Button onClick={cargarEventos}>Reintentar</Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="eventos-page">
      <Container>
        <h2 className="titulo-eventos">Próximos Eventos 🎵</h2>

        {eventos.length === 0 ? (
          <Alert variant="info" className="text-center">
            No hay eventos disponibles en este momento.
          </Alert>
        ) : (
          <Row className="justify-content-center">
            {eventos.map((evento) => (
              <Col md={4} className="mb-4" key={evento.event_id}>
                <Card className="shadow evento-card h-100">
                  <Card.Img
                    variant="top"
                    src={evento.image_url || "/img/default-event.jpg"}
                    alt={evento.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{evento.title}</Card.Title>
                    <Card.Text className="flex-grow-1">
                      <strong>Fecha:</strong> {formatearFecha(evento.event_date)}
                      <br />
                      <strong>Lugar:</strong> {evento.location}
                      <br />
                      <strong>Disponibles:</strong> {evento.tickets_remaining} entradas
                    </Card.Text>
                    <Button
                      className="btn-comprar mt-auto"
                      onClick={() => handleComprar(evento)}
                      disabled={evento.tickets_remaining === 0}
                    >
                      {evento.tickets_remaining === 0
                        ? "Agotado"
                        : "Comprar Entradas"}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Modal de Compra */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Comprar Entradas</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {mensajeCompra.texto && (
            <Alert variant={mensajeCompra.tipo} className="mb-3">
              {mensajeCompra.texto}
            </Alert>
          )}

          {!mensajeCompra.texto && eventoSeleccionado && (
            <>
              <div className="text-center mb-3">
                <h5>{eventoSeleccionado.title}</h5>
                <p className="text-muted">
                  {formatearFecha(eventoSeleccionado.event_date)}
                </p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Cantidad de entradas</Form.Label>
                <Form.Select
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  disabled={comprando}
                >
                  {[...Array(Math.min(10, eventoSeleccionado.tickets_remaining))].map(
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "entrada" : "entradas"}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>

              <div className="alert alert-info">
                <strong>Disponibles:</strong> {eventoSeleccionado.tickets_remaining}{" "}
                entradas
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          {!mensajeCompra.texto && (
            <>
              <Button variant="secondary" onClick={handleClose} disabled={comprando}>
                Cancelar
              </Button>
              <Button
                className="btn-comprar"
                onClick={confirmarCompra}
                disabled={comprando}
              >
                {comprando ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Procesando...
                  </>
                ) : (
                  "Confirmar Compra"
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
