import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
    crearEvento,
    verEvento,
    cancelarEvento
} from '../controllers/eventController.js'
import { upload } from '../middleware/uploadImage.js';

const router = express.Router();

router.post('/crearEvento', authMiddleware, upload.single('eventImage'), crearEvento);
router.get('/misEventos', authMiddleware, verEvento);
router.delete('/misEventos/:id', authMiddleware, cancelarEvento);

export default router;