import request from 'supertest';
import pg from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { jest } from '@jest/globals';

// Aumentamos timeout por Docker
jest.setTimeout(90000);

let container;
let pgClient;
let app;

// Variables para reutilizar en los flujos
let userToken;
let adminToken;
let createdEventId;
let createdUserId;

beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:15").start();
    const connectionUri = container.getConnectionUri();

    // 2. Parsear la URI para obtener las credenciales
    const url = new URL(connectionUri);
    
    process.env.DB_USER = url.username;
    process.env.DB_HOST = url.hostname;
    process.env.DB_NAME = url.pathname.slice(1);
    process.env.DB_PASS = url.password;
    process.env.DB_PORT = url.port;
    process.env.JWT_SECRET = 'test-secret-key-12345';

    const { Client } = pg;
    pgClient = new Client({ connectionString: connectionUri });
    await pgClient.connect();

    //DB esquema
    await pgClient.query(`
        CREATE TABLE users (
            user_id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            tipo_usuario INT
        );

        CREATE TABLE eventos (
            event_id SERIAL PRIMARY KEY,
            title VARCHAR(150),
            location VARCHAR(200),
            total_tickets INT,
            tickets_sold INT DEFAULT 0,
            tickets_remaining INT,
            event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            image_url TEXT
        );

        CREATE TABLE transactions (
            transaction_id SERIAL PRIMARY KEY,
            event_id INT,
            user_id INT,
            cant_tickets INT,
            purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const appModule = await import('../index.js');
    app = appModule.default;
});

afterAll(async () => {
    if (pgClient) await pgClient.end();
    if (container) await container.stop();
});

describe('Pruebas integradas', () => {
    test('1. Register -> Debe crear usuario en DB y retornar 201', async () => {
        const newUser = {
            name: 'Juan Perez',
            email: 'juan@test.com',
            password: 'securePass123'
        };

        const res = await request(app).post('/api/user/registro').send(newUser);
        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('mensaje');
        
        // Validación directa en DB
        const dbCheck = await pgClient.query("SELECT * FROM users WHERE email = 'juan@test.com'");
        expect(dbCheck.rows).toHaveLength(1);
        expect(dbCheck.rows[0].name).toBe('Juan Perez');
        expect(dbCheck.rows[0].tipo_usuario).toBe(2);
        
        // Verificar que password está hasheado
        expect(dbCheck.rows[0].password).not.toBe('securePass123');
        expect(dbCheck.rows[0].password.length).toBeGreaterThan(20);
        
        createdUserId = dbCheck.rows[0].user_id;
    });

    test('1b. Register -> Debe rechazar email duplicado (400)', async () => {
        const duplicateUser = {
            name: 'Juan Duplicado',
            email: 'juan@test.com',
            password: 'otherPass456'
        };

        const res = await request(app).post('/api/user/registro').send(duplicateUser);
        expect(res.status).toBe(400);
        expect(res.body.mensaje).toContain('ya existe');
    });

    //Login (200, token)
    test('2. Login -> Retorna token y NO expone password', async () => {
        const res = await request(app).post('/api/user/login').send({
            email: 'juan@test.com',
            password: 'securePass123'
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        userToken = res.body.token;
        
        expect(res.body.password).toBeUndefined();
        if (res.body.user) {
            expect(res.body.user).not.toHaveProperty('password');
        }
    });

    test('2b. Login -> Debe rechazar credenciales inválidas (400)', async () => {
        const res = await request(app).post('/api/user/login').send({
            email: 'juan@test.com',
            password: 'wrongPassword'
        });

        expect(res.status).toBe(400);
        expect(res.body.mensaje).toContain('incorrectos');
    });

    //Crear un Admin
    test('Setup Admin', async () => {
        const bcrypt = (await import('bcryptjs')).default;
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await pgClient.query(
            'INSERT INTO users (name, email, password, tipo_usuario) VALUES ($1, $2, $3, $4)',
            ['Admin Boss', 'admin@test.com', hashedPassword, 1]
        );

        const res = await request(app).post('/api/user/login').send({
            email: 'admin@test.com', 
            password: 'admin123'
        });
        
        expect(res.status).toBe(200);
        adminToken = res.body.token;
    });

    //Seguridad con errores 401 y 403
    describe('Pruebas de Seguridad y Roles', () => {
        
        test('Debe rechazar acceso sin token (403)', async () => {
            const res = await request(app).post('/api/events/crearEvento').send({});
            expect(res.status).toBe(403);
        });

        test('Debe rechazar token inválido (403)', async () => {
            const res = await request(app)
                .post('/api/events/crearEvento')
                .set('Authorization', 'Bearer tokenInvalido123')
                .send({});
            
            expect(res.status).toBe(403);
        });

        test('Debe rechazar acción prohibida por rol (403)', async () => {
            const res = await request(app)
                .post('/api/events/crearEvento')
                .set('Authorization', `Bearer ${userToken}`)
                .field('title', 'Hack Attempt')
                .field('location', 'Nowhere')
                .field('event_date', '2025-12-31')
                .field('total_tickets', '50');
            
            expect(res.status).toBe(403); 
        });
    });

    //Creación de evento
    test('3. Crear Evento -> 201 y guardado en DB', async () => {
        const buffer = Buffer.from('fake-image-data');
        
        const res = await request(app)
            .post('/api/events/crearEvento')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Concierto Integración')
            .field('location', 'Estadio Nacional')
            .field('event_date', '2025-12-31T20:00:00')
            .field('total_tickets', '100')
            .attach('eventImage', buffer, 'test.jpg');

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('eventId');

        // Validar en DB
        const dbEvent = await pgClient.query("SELECT * FROM eventos WHERE title = 'Concierto Integración'");
        expect(dbEvent.rows).toHaveLength(1);
        expect(dbEvent.rows[0].location).toBe('Estadio Nacional');
        expect(dbEvent.rows[0].total_tickets).toBe(100);
        expect(dbEvent.rows[0].tickets_remaining).toBe(100);
        expect(dbEvent.rows[0].tickets_sold).toBe(0);
        createdEventId = dbEvent.rows[0].event_id;
    });

    test('3b. Crear Evento -> Usuario normal NO puede crear (403)', async () => {
        const buffer = Buffer.from('fake-image');
        
        const res = await request(app)
            .post('/api/events/crearEvento')
            .set('Authorization', `Bearer ${userToken}`)
            .field('title', 'Evento No Autorizado')
            .field('location', 'Lugar')
            .field('event_date', '2025-12-31')
            .field('total_tickets', '50')
            .attach('eventImage', buffer, 'test.jpg');

        expect(res.status).toBe(403);
    });

    //Listar eventos
    test('4. Listar Eventos -> Debe retornar lista', async () => {
        const res = await request(app)
            .get('/api/events/misEventos')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        
        const eventoEncontrado = res.body.find(e => e.title === 'Concierto Integración');
        expect(eventoEncontrado).toBeDefined();
        expect(eventoEncontrado.tickets_remaining).toBe(100);
    });

    //Compra de ticket
    test('5. Compra Ticket -> 201, Ticket en DB, Capacity decrementado', async () => {
        const ticketsAComprar = 2;

        const res = await request(app)
            .post('/api/tickets/crearCompra')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                event_id: createdEventId,
                cant_tickets: ticketsAComprar
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('transactionId');

        // Verificar transacción en DB
        const transactionCheck = await pgClient.query(
            "SELECT * FROM transactions WHERE event_id = $1 AND user_id = $2", 
            [createdEventId, createdUserId]
        );
        expect(transactionCheck.rows.length).toBeGreaterThan(0);
        expect(transactionCheck.rows[0].cant_tickets).toBe(ticketsAComprar);

        // VERIFICACIÓN CRÍTICA: Capacity Decrementado
        const eventCheck = await pgClient.query("SELECT * FROM eventos WHERE event_id = $1", [createdEventId]);
        
        const remaining = eventCheck.rows[0].tickets_remaining;
        const sold = eventCheck.rows[0].tickets_sold;

        expect(remaining).toBe(98); // 100 - 2
        expect(sold).toBe(2);       // 0 + 2
    });

    test('5b. Compra Ticket -> Debe rechazar si no hay suficientes (400)', async () => {
        const res = await request(app)
            .post('/api/tickets/crearCompra')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                event_id: createdEventId,
                cant_tickets: 200
            });

        expect(res.status).toBe(400);
        expect(res.body.msg).toContain('suficientes');
    });

    test('6. Ver Mis Tickets -> Debe retornar compras del usuario', async () => {
        const res = await request(app)
            .get('/api/tickets/misTickets')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        
        const compra = res.body.find(t => t.event_title === 'Concierto Integración');
        expect(compra).toBeDefined();
        expect(compra.cant_tickets).toBe(2);
    });

    test('7. Cancelar Compra -> Restaura capacidad del evento', async () => {
        const transactions = await pgClient.query(
            "SELECT * FROM transactions WHERE event_id = $1 AND user_id = $2",
            [createdEventId, createdUserId]
        );
        const transactionId = transactions.rows[0].transaction_id;

        const res = await request(app)
            .delete(`/api/tickets/misTickets/${transactionId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);

        // Verificar capacidad restaurada
        const eventCheck = await pgClient.query("SELECT * FROM eventos WHERE event_id = $1", [createdEventId]);
        expect(eventCheck.rows[0].tickets_remaining).toBe(100);
        expect(eventCheck.rows[0].tickets_sold).toBe(0);
    });

    test('8. Eliminar Evento -> Admin puede eliminar evento sin ventas', async () => {
        const res = await request(app)
            .delete(`/api/events/misEventos/${createdEventId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);

        const dbCheck = await pgClient.query("SELECT * FROM eventos WHERE event_id = $1", [createdEventId]);
        expect(dbCheck.rows).toHaveLength(0);
    });

    test('8b. Eliminar Evento -> Usuario normal NO puede eliminar (403)', async () => {
        const buffer = Buffer.from('fake-image');
        const createRes = await request(app)
            .post('/api/events/crearEvento')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Evento Temporal')
            .field('location', 'Lugar')
            .field('event_date', '2025-12-31')
            .field('total_tickets', '50')
            .attach('eventImage', buffer, 'test.jpg');

        const tempEventId = createRes.body.eventId;

        const res = await request(app)
            .delete(`/api/events/misEventos/${tempEventId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);

        // Limpiar
        await request(app)
            .delete(`/api/events/misEventos/${tempEventId}`)
            .set('Authorization', `Bearer ${adminToken}`);
    });

});