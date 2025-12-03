import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { crearEvento } from "../../api";
import "./admin-evento.css";

export default function AdminEvento() {
  const [formData, setFormData] = useState({
    nombreEvento: "",
    ubicacion: "",
    fecha: "",
    hora: "",
    capacidadMaxima: "",
    eventImage: null,
  });

  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generar opciones de fechas para los próximos 60 días
  const hoy = new Date().toISOString().split("T")[0];

  //Calculamos fecha límite (60 días desde hoy)
  const fechaLimite = new Date();
  fechaLimite.setDate(new Date().getDate() + 60);

// Manejar cambios en los inputs
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value,
  });
};

// Manejar la carga de imagen
const handleImagenChange = (e) => {
  const file = e.target.files[0];

  if (file) {
    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setFormData({
      ...formData,
      eventImage: file,
    });
  }
};

// Manejar el envío del formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("🔍 ESTO TIENE REACT:", formData);
  setError("");
  setSuccess("");

  // Validación básica
  if (!formData.nombreEvento || !formData.ubicacion || !formData.fecha || !formData.hora || !formData.capacidadMaxima || !formData.eventImage) {
      setError("Por favor completa todos los campos");
    return;
  }

  if (formData.capacidadMaxima <= 0) {
    setError("La capacidad máxima de personas debe ser mayor a 0");
    return;
  }

  setLoading(true);

  try {
    // Combinar fecha y hora para el backend
    const fechaHora = `${formData.fecha} ${formData.hora}`;
    // Preparar datos para enviar al backend
    const dataToSend = new FormData();

    dataToSend.append("title", formData.nombreEvento);
    dataToSend.append("location", formData.ubicacion);
    dataToSend.append("event_date", fechaHora);
    dataToSend.append("total_tickets", parseInt(formData.capacidadMaxima));

    if (formData.eventImage) {
      dataToSend.append("eventImage", formData.eventImage);
    }

    await crearEvento(dataToSend);

    setSuccess("¡Evento creado exitosamente!");

    // Limpiar el formulario
    setFormData({
      nombreEvento: "",
      ubicacion: "",
      fecha: "",
      hora: "",
      capacidadMaxima: "",
      eventImage: null,
    });
    setImagenPreview(null);
    document.getElementById("inputImagen").value = "";
    
  } catch (err) {
    console.error("Error al crear evento:", err);
    setError(
      err.message || "Error al conectar con el servidor");
  } finally {
    setLoading(false);
  }
};

return (
  <div className="evento-page">
    <Container>
      <h2 className="evento-titulo">Crear Nuevo Evento</h2>

      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          <Card className="evento-card">
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError("")}
                  dismissible
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  variant="success"
                  onClose={() => setSuccess("")}
                  dismissible
                >
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Nombre del Evento */}
                <Form.Group className="mb-4">
                  <Form.Label className="evento-label">
                    Nombre del Evento
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombreEvento"
                    value={formData.nombreEvento}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre del evento"
                    className="evento-input"
                    disabled={loading}
                  />
                </Form.Group>

                {/* Ubicación */}
                <Form.Group className="mb-4">
                  <Form.Label className="evento-label">Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    placeholder="Ingrese la ubicación del evento"
                    className="evento-input"
                    disabled={loading}
                  />
                </Form.Group>

                {/* Fecha */}
                <Form.Group className="mb-4">
                  <Form.Label className="evento-label" htmlFor="inputFecha">
                    Fecha del Evento
                  </Form.Label>
                  <Form.Control
                    id="inputFecha"
                    type="date" //activa el calendario
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    min={hoy} //Bloquea fechas pasadas
                    className="evento-input"
                    disabled={loading}
                  />
                </Form.Group>
                {/* Hora */}
                <Form.Group className="mb-4">
                  <Form.Label className="evento-label">
                    Hora del Evento
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    className="evento-input"
                    disabled={loading}
                  />
                </Form.Group>

                {/* Capacidad de Personas */}
                <Form.Group className="mb-4">
                  <Form.Label className="evento-label">
                    Capacidad de Personas Máxima
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="capacidadMaxima"
                    value={formData.capacidadMaxima}
                    onChange={handleInputChange}
                    placeholder="Ej: 500"
                    min="1"
                    className="evento-input"
                    disabled={loading}
                  />
                </Form.Group>

                {/* Imagen del Evento */}
                <Form.Group className="mb-4">
                  <Form.Label className="evento-label">
                    Imagen del Evento
                  </Form.Label>
                  <Form.Control
                    id="inputImagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="evento-input"
                    disabled={loading}
                  />
                  {imagenPreview && (
                    <div className="imagen-preview-container">
                      <p className="preview-label">Vista previa:</p>
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        className="imagen-preview"
                      />
                    </div>
                  )}
                </Form.Group>

                {/* Botón de Envío */}
                <div className="d-grid">
                  <Button
                    type="submit"
                    className="evento-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creando evento...
                      </>
                    ) : (
                      "Crear Evento"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);
};