import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Encriptar la contraseña (hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Guardar en la DB
    // const [user] = await sql`
    //   INSERT INTO users (name, email, password, role)
    //   VALUES (${name}, ${email}, hashedPassword, ${role || 'DEVELOPER'})
    //   RETURNING id, name, email, role
    // `;

    // ... arriba está el const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES (${name}, ${email}, ${hashedPassword}, ${role || 'DEVELOPER'})
        RETURNING id, name, email, role
    `;

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario. ¿Quizás el email ya existe?" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

    // 2. Comparar contraseña encriptada
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Credenciales inválidas" });

    // 3. Crear el Token (el pasaporte)
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Error en el login" });
  }
};