import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
    comprarTicket,
    obtenerTicketComprado,
    cancelarCompra
} from '../controllers/ticketController.js'

const router = express.Router();

router.post('/crearCompra', authMiddleware, comprarTicket);
router.get('/misTickets', authMiddleware, obtenerTicketComprado);
router.delete('/misTickets/:id', authMiddleware, cancelarCompra);

export default router;