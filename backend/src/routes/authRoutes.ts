import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { sql } from '../db.js'; // Para poder hacer el SELECT de usuarios
import { authenticateToken } from '../middlewares/authMiddleware.js'; // El patovica

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Ruta para obtener la lista de desarrolladores
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name FROM users 
      WHERE role = 'DEVELOPER'
      ORDER BY name ASC
    `;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

export default router;