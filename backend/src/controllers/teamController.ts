import { Request, Response } from 'express';
import { sql } from '../db.js';

export const createTeam = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const [team] = await sql`
      INSERT INTO teams (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: "El equipo ya existe o faltan datos" });
  }
};

export const getTeams = async (_req: Request, res: Response) => {
  const teams = await sql`SELECT * FROM teams`;
  res.json(teams);
};