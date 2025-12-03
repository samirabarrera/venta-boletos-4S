import express from "express";
import {
    registrarUsuario,
    loginUsuario,
    usuarioActual
} from "../controllers/usuarioController.js";
import authMiddleware from "../middleware/auth.js";
import hashPasswordMiddleware from "../middleware/hashPassword.js";

const router = express.Router();

router.post('/registro', hashPasswordMiddleware, registrarUsuario);
router.post('/login', loginUsuario);
router.get('/mi-perfil', authMiddleware, usuarioActual);

export default router;