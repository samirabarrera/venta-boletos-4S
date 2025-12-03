import pool  from '../database.js';
import bcrypt from 'bcryptjs';

const hashPasswordMiddleware = async (req, res, next) => {
  try {
    // Solo hashear si existe un campo password en el body
    if (req.body.password) {
      // Verificar que la contraseña no esté ya hasheada
      const isAlreadyHashed = req.body.password.startsWith('$2a$') || 
                              req.body.password.startsWith('$2b$');
      
      if (!isAlreadyHashed) {
        console.log('Hasheando contraseña...');
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        console.log('Contraseña hasheada exitosamente');
      } else {
        console.log('La contraseña ya está hasheada, saltando...');
      }
    }
    
    next();
  } catch (error) {
    console.error('Error al hashear contraseña', error);
    res.status(500).json({ mensaje: 'Error al procesar la contraseña' });
  }
};

export default hashPasswordMiddleware;
