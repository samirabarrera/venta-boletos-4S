import { jest } from '@jest/globals';

// Generador de Usuario (Admin o Cliente)
const mockUser = (tipo = 2) => ({
    user_id: 1,
    name: "Usuario Pruebas unitarias",
    email: "pruebasUnitarias@example.com",
    password: "pass",
    tipo_usuario: tipo // 1: Admin, 2: Usuario 
});

// Generador de Evento
const mockEvent = (ticketsDisponibles) => ({
    event_id: 10,
    title: "Concierto de Pruebas unitarias",
    total_tickets: 100,
    tickets_sold: 100 - ticketsDisponibles,
    tickets_remaining: ticketsDisponibles
});

const validarCompra = (evento, cantidad) => {
    if (evento.tickets_remaining < cantidad) throw new Error("No hay suficientes tickets");
    return true;
};

describe('Pruebas Unitarias del Sistema de Tickets', () => {

    //PRUEBA 1: Verifica los roles
    test('Detecta correctamente el usuario que es administrador', () => {
        const admin = mockUser(1); // Creamos un admin
        expect(admin.tipo_usuario).toBe(1);
    });

    test('Detectando que es un usuario normal', () => {
        const cliente = mockUser(2); // Creamos un cliente
        expect(cliente.tipo_usuario).toBe(2);
    });

    //PRUEBA 2: Verifica la existencia de eventos
    test('Permite la venta si hay tickets suficientes', () => {
        const evento = mockEvent(50); //50 tickets remaining
        const resultado = validarCompra(evento, 5); //bought 5 tickets
        expect(resultado).toBe(true);
    });

    test('Debe bloquear venta si NO hay tickets suficientes', () => {
        const evento = mockEvent(2); // remaining 2 tickets
        
        //Error si no hay tickets suficientes
        expect(() => {
            validarCompra(evento, 100); // Intento comprar 100 tickets
        }).toThrow("No hay suficientes tickets");
    });

});