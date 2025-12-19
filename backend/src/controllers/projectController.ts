import { Request, Response } from 'express';
import { sql } from '../db.js';

export const createProject = async (req: any, res: Response) => {
  const { name, team_id } = req.body;
  try {
    const [project] = await sql`
      INSERT INTO projects (name, team_id)
      VALUES (${name}, ${team_id})
      RETURNING *
    `;
    // Notificamos en tiempo real que se creó un proyecto
    req.io.emit('project:created', project);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Error al crear proyecto" });
  }
};