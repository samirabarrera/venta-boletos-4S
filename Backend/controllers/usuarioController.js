import { pool } from '../database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

//Registrar Usuario
export const registrarUsuario = async (req, res) => {
    const { name, email, password } = req.body;
    const TIPO_USUARIO_DEFAULT = 2;
    try {
        const existe = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (existe.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }
        // El password ya viene hasheado del middleware hashPasswordMiddleware
        await pool.query(
            'INSERT INTO users (name, email, password, tipo_usuario) VALUES ($1, $2, $3, $4)',
            [name, email, password, TIPO_USUARIO_DEFAULT]
        );
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

//Login Usuario
export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;
    try {
        const resultado = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (resultado.rows.length === 0) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }
        const user = resultado.rows[0];
        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }
        const token = jwt.sign(
            { user_id: user.user_id, tipo_usuario: user.tipo_usuario },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

//Usuario Actual
export const usuarioActual = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const resultado = await pool.query(
            'SELECT user_id, name, email FROM users WHERE user_id = $1',
            [user_id]
        ); 
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al obtener usuario actual:", error);
        res.status(500).json({ mensaje: 'Error al obtener los datos del usuario' });
    }
};