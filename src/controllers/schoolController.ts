import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createSchool = async (req: Request, res: Response) => {
  try {
    const { codigoAmie, nombre, totalAlumnos } = req.body;

    // Validar que no exista el código AMIE
    const existing = await prisma.school.findUnique({
      where: { codigoAmie }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'El código AMIE ya existe'
      });
    }

    // Crear la escuela
    const school = await prisma.school.create({
      data: {
        codigoAmie,
        nombre,
        totalAlumnos
      }
    });

    res.status(201).json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la escuela'
    });
  }
};

export const getAllSchools = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las escuelas'
    });
  }
};

export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Escuela no encontrada'
      });
    }

    res.json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la escuela'
    });
  }
};
