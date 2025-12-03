import {pool} from '../database.js'; 

export const comprarTicket = async (req, res) => {
    const { event_id, cant_tickets } = req.body;
    const { user_id } = req.user; 

    if (!event_id || !cant_tickets || cant_tickets <= 0) {
        return res.status(400).json({ msg: 'Datos incompletos o inválidos.' });
    }

    let client; 

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const eventResult = await client.query(
            'SELECT * FROM eventos WHERE event_id = $1 FOR UPDATE',
            [event_id]
        );

        if (eventResult.rows.length === 0) {
            await client.query('ROLLBACK'); 
            return res.status(404).json({ msg: 'El evento no existe.' });
        }

        const event = eventResult.rows[0];

        if (event.tickets_remaining < cant_tickets) {
            await client.query('ROLLBACK'); 
            return res.status(400).json({ msg: 'No hay suficientes boletos disponibles.' });
        }

        const newTicketsSold = event.tickets_sold + cant_tickets;
        const newTicketsRemaining = event.tickets_remaining - cant_tickets;

        await client.query(
            'UPDATE eventos SET tickets_sold = $1, tickets_remaining = $2 WHERE event_id = $3',
            [newTicketsSold, newTicketsRemaining, event_id]
        );

        const transactionResult = await client.query(
            'INSERT INTO transactions (event_id, user_id, cant_tickets, purchase_date) VALUES ($1, $2, $3, $4) RETURNING transaction_id',
            [event_id, user_id, cant_tickets, new Date()]
        );
        
        await client.query('COMMIT'); 

        res.status(201).json({ 
            msg: '¡Compra exitosa!',
            transactionId: transactionResult.rows[0].transaction_id 
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al procesar la compra.' });
    } finally {
        if (client) client.release();
    }
};

export const obtenerTicketComprado = async (req, res) => {
    const { user_id } = req.user; 

    try {
        const result = await pool.query(
            `SELECT 
                T.transaction_id, 
                T.cant_tickets, 
                T.purchase_date,
                E.title AS event_title,
                E.location AS event_location,
                E.event_date
            FROM transactions T
            JOIN eventos E ON T.event_id = E.event_id
            WHERE T.user_id = $1
            ORDER BY E.event_date DESC`, 
            [user_id]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al obtener las entradas.' });
    }
};

export const cancelarCompra = async (req, res) => {
    const { id: transaction_id } = req.params; 
    const { user_id } = req.user; 

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const transResult = await client.query(
            'SELECT * FROM transactions WHERE transaction_id = $1 FOR UPDATE',
            [transaction_id]
        );

        if (transResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'La compra no existe.' });
        }

        const transaction = transResult.rows[0];

        if (transaction.user_id !== user_id) {
            await client.query('ROLLBACK');
            return res.status(403).json({ msg: 'Acción no permitida. Esta compra no te pertenece.' });
        }

        const eventResult = await client.query(
            'SELECT * FROM eventos WHERE event_id = $1', 
            [transaction.event_id]
        );

        if (eventResult.rows.length > 0) {
            const event = eventResult.rows[0];
            const newTicketsSold = event.tickets_sold - transaction.cant_tickets;
            const newTicketsRemaining = event.tickets_remaining + transaction.cant_tickets;

            await client.query(
                'UPDATE eventos SET tickets_sold = $1, tickets_remaining = $2 WHERE event_id = $3',
                [newTicketsSold, newTicketsRemaining, transaction.event_id]
            );
        }

        await client.query(
            'DELETE FROM transactions WHERE transaction_id = $1',
            [transaction_id]
        );

        await client.query('COMMIT');

        res.status(200).json({ msg: 'Compra cancelada exitosamente.' });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al cancelar la compra.' });
    } finally {
        if (client) client.release();
    }
};