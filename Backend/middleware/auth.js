import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(403).json({ message: "Token no proporcionado"});
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token recibido:", req.headers.authorization);
    console.log("Token decodificado:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido"});
  }
};

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ message: "Acceso denegado: No tienes permisos suficientes" });
    }
    next();
  };
};

export default authMiddleware;