import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Si es error de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Error de validación",
      details: err.flatten().fieldErrors,
    });
  }

  // Cualquier otro error inesperado
  console.error("❌ Error no controlado:", err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
};