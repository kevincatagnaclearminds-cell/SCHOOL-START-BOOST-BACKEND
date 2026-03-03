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
      }
    });

    // Calcular el ranking
    const ranking = schools.map((school, index) => {
      const capacitados = school._count.students;
      const percentage = school.totalAlumnos > 0 
        ? (capacitados / school.totalAlumnos) * 100 
        : 0;

      return {
        position: 0, // Se asignará después de ordenar
        school: {
          id: school.id,
          codigoAmie: school.codigoAmie,
          nombre: school.nombre,
          totalAlumnos: school.totalAlumnos
        },
        capacitados,
        percentage: Math.round(percentage * 100) / 100 // 2 decimales
      };
    });

    // Ordenar por porcentaje descendente
    ranking.sort((a, b) => b.percentage - a.percentage);

    // Asignar posiciones
    ranking.forEach((item, index) => {
      item.position = index + 1;
    });

    res.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el ranking'
    });
  }
};
