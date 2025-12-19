import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_provisoria', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user; // Guardamos los datos del usuario en la petición
    next();
  });
};