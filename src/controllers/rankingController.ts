import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getRanking = async (req: Request, res: Response) => {
  try {
    // Obtener todas las escuelas con el conteo de estudiantes
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: {
        alumnosCapacitados: 'desc'
      }
    });

    // Calcular el ranking
    const ranking = schools.map((school, index) => {
      const percentage = school.totalAlumnos > 0 
        ? (school.alumnosCapacitados / school.totalAlumnos) * 100 
        : 0;

      return {
        position: index + 1,
        school: {
          id: school.id,
          codigoAmie: school.codigoAmie,
          nombre: school.nombre,
          totalAlumnos: school.totalAlumnos
        },
        alumnosCapacitados: school.alumnosCapacitados,
        estudiantesRegistrados: school._count.students,
        porcentaje: Math.round(percentage * 100) / 100 // 2 decimales
      };
    });

    res.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el ranking'
    });
  }
};
