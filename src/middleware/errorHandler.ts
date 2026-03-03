import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Ya existe un registro con estos datos únicos'
    });
  }

  if (err.code === 'P2003') {
    return res.status(404).json({
      success: false,
      error: 'Referencia no encontrada'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
};
