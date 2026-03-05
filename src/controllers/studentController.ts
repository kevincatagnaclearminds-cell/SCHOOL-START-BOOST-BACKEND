import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { cedula, nombre, apellido, edad, genero, schoolId, otraEscuela } = req.body;

    // Si schoolId no es "otra", validar que la escuela exista
    if (schoolId !== 'otra') {
      const school = await prisma.school.findUnique({
        where: { id: schoolId }
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          error: 'Escuela no encontrada'
        });
      }
    }

    // Validar que no exista la cédula
    const existing = await prisma.student.findUnique({
      where: { cedula },
      include: {
        school: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Esta cédula ya está registrada',
        existingStudent: {
          id: existing.id,
          cedula: existing.cedula,
          nombre: existing.nombre,
          apellido: existing.apellido,
          edad: existing.edad,
          genero: existing.genero,
          schoolId: existing.schoolId,
          otraEscuela: existing.otraEscuela
        }
      });
    }

    // Crear el estudiante
    const studentData: any = {
      cedula,
      nombre,
      apellido,
      edad,
      genero,
      otraEscuela: schoolId === 'otra' ? otraEscuela : null
    };

    // Solo agregar schoolId si no es "otra"
    if (schoolId !== 'otra') {
      studentData.schoolId = schoolId;
    }

    const student = await prisma.student.create({
      data: studentData,
      include: {
        school: {
          select: {
            id: true,
            nombre: true
          }
        }
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
      error: 'Error al crear el estudiante'
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
      error: 'Error al obtener los estudiantes'
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
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
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
      error: 'Error al obtener el estudiante'
    });
  }
};

export const completeTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, profile } = req.body;

    // Buscar el estudiante
    const student = await prisma.student.findUnique({
      where: { id },
      include: { school: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    const isFirstTime = !student.completedTraining;

    // Actualizar estudiante
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        completedTraining: true,
        trainingCount: student.trainingCount + 1
      }
    });

    // Solo sumar a la escuela si es la primera vez Y tiene una escuela asociada
    if (isFirstTime && student.schoolId) {
      await prisma.school.update({
        where: { id: student.schoolId },
        data: {
          alumnosCapacitados: {
            increment: 1
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        isFirstTime,
        trainingCount: updatedStudent.trainingCount,
        score,
        profile
      }
    });
  } catch (error) {
    console.error('Error completing training:', error);
    res.status(500).json({
      success: false,
      error: 'Error al completar la capacitación'
    });
  }
};
