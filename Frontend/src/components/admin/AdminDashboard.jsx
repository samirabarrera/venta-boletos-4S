import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { obtenerEstadisticasAdmin, obtenerEventosPorEstado, obtenerVentasPorEvento } from "../../api";
import "./admin-dashboard.css";

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_eventos: 0,
    tickets_vendidos: 0,
    usuarios_registrados: 0,
  });
  
  const [eventosEstado, setEventosEstado] = useState({
    disponibles: 0,
    agotados: 0,
    pasados: 0,
  });
  
  const [ventasEvento, setVentasEvento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar estadísticas generales
      const statsData = await obtenerEstadisticasAdmin();
      setStats(statsData);

      // Cargar eventos por estado
      const estadoData = await obtenerEventosPorEstado();
      setEventosEstado(estadoData);

      // Cargar ventas por evento
      const ventasData = await obtenerVentasPorEvento();
      setVentasEvento(ventasData);

    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      setError("Error al cargar los datos del dashboard. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráfica de pastel (distribución de eventos por estado)
  const pieData = {
    labels: ["Disponibles", "Agotados", "Pasados"],
    datasets: [
      {
        label: "Eventos por Estado",
        data: [
          eventosEstado.disponibles || 0,
          eventosEstado.agotados || 0,
          eventosEstado.pasados || 0,
        ],
        backgroundColor: [
          "rgba(40, 167, 69, 0.8)",   // Verde - Disponibles
          "rgba(220, 53, 69, 0.8)",   // Rojo - Agotados
          "rgba(108, 117, 125, 0.8)", // Gris - Pasados
        ],
        borderColor: [
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
          "rgba(108, 117, 125, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Datos para gráfica de barras (ventas por evento)
  const barData = {
    labels: ventasEvento.map(e => e.title),
    datasets: [
      {
        label: "Tickets Vendidos",
        data: ventasEvento.map(e => e.tickets_sold),
        backgroundColor: "rgba(184, 50, 128, 0.7)",
        borderColor: "rgba(184, 50, 128, 1)",
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top Eventos por Ventas",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Container className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando dashboard...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
          <Button onClick={cargarDatos}>Reintentar</Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="dashboard-titulo">Dashboard Administrativo</h2>
          <Button 
            variant="outline-primary" 
            onClick={cargarDatos}
            className="d-flex align-items-center gap-2"
          >
            Actualizar
          </Button>
        </div>

        {/* Tarjetas de Estadísticas - Solo 3 */}
        <Row className="mb-4">
          <Col md={4} sm={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <h3 className="stat-number">{stats.total_eventos}</h3>
                <p className="stat-label">Total Eventos</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} sm={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <h3 className="stat-number">{stats.tickets_vendidos}</h3>
                <p className="stat-label">Tickets Vendidos</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} sm={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <h3 className="stat-number">{stats.usuarios_registrados}</h3>
                <p className="stat-label">Usuarios Registrados</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Gráficas */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="chart-card">
              <Card.Body>
                <h5 className="chart-title">Estado de Eventos</h5>
                <div className="chart-container">
                  {(eventosEstado.disponibles + eventosEstado.agotados + eventosEstado.pasados) > 0 ? (
                    <Pie data={pieData} />
                  ) : (
                    <Alert variant="info" className="text-center">
                      No hay eventos registrados aún
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="chart-card">
              <Card.Body>
                <h5 className="chart-title">Ventas por Evento</h5>
                <div className="chart-container">
                  {ventasEvento.length > 0 ? (
                    <Bar data={barData} options={barOptions} />
                  ) : (
                    <Alert variant="info" className="text-center">
                      No hay ventas registradas aún
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
