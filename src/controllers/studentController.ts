import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { cedula, nombre, apellido, edad, schoolId } = req.body;

    // Validar que la escuela exista
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Escuela no encontrada'
      });
    }

    // Validar que no exista la cédula
    const existing = await prisma.student.findUnique({
      where: { cedula }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Esta cédula ya está registrada'
      });
    }

    // Crear el estudiante
    const student = await prisma.student.create({
      data: {
        cedula,
        nombre,
        apellido,
        edad,
        schoolId
      }
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el estudiante'
    });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const where = schoolId ? { schoolId: schoolId as string } : {};

    const students = await prisma.student.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los estudiantes'
    });
  }
};

export const getStudentByCedula = async (req: Request, res: Response) => {
  try {
    const { cedula } = req.params;

    const student = await prisma.student.findUnique({
      where: { cedula },
      include: {
        school: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el estudiante'
    });
  }
};
