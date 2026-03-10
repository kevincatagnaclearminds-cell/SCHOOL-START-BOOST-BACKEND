import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { cedula, nombre, apellido, edad, genero, provincia, canton, nivelEducativo, schoolId, otraEscuela } = req.body;

    // Si schoolId no es "otra", "INDEPENDIENTE" ni null, validar que la escuela exista
    if (schoolId && schoolId !== 'otra' && schoolId !== 'INDEPENDIENTE' && schoolId !== null) {
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
          provincia: existing.provincia,
          canton: existing.canton,
          nivelEducativo: existing.nivelEducativo,
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
      provincia,
      canton,
      nivelEducativo,
      otraEscuela: schoolId === 'otra' ? otraEscuela : null
    };

    // Solo agregar schoolId si no es "otra", "INDEPENDIENTE" ni null
    if (schoolId && schoolId !== 'otra' && schoolId !== 'INDEPENDIENTE' && schoolId !== null) {
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

    // Validar que la cédula tenga 10 dígitos
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        error: 'Cédula inválida. Debe tener exactamente 10 dígitos'
      });
    }

    // Buscar estudiante - devuelve TODOS los campos
    const student = await prisma.student.findUnique({
      where: { cedula }
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
    const isCompleted = score >= 100; // Completado si puntaje >= 100

    // Actualizar estudiante
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        puntaje: score,
        completedTraining: isCompleted,
        trainingCount: student.trainingCount + 1
      }
    });

    // Solo sumar a la escuela si es la primera vez Y tiene una escuela asociada Y completó
    if (isFirstTime && student.schoolId && isCompleted) {
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
        profile,
        completed: isCompleted
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

export const updateStudentByCedula = async (req: Request, res: Response) => {
  try {
    const { cedula } = req.params;
    const { nombre, apellido, edad, genero, provincia, canton, nivelEducativo, schoolId, otraEscuela } = req.body;

    // Validar formato de cédula
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        error: 'Cédula inválida. Debe tener exactamente 10 dígitos'
      });
    }

    // Buscar estudiante
    const existingStudent = await prisma.student.findUnique({
      where: { cedula }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    // Preparar datos para actualizar (solo los que vienen en el body)
    const updateData: any = {};

    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (edad !== undefined) updateData.edad = edad;
    if (genero !== undefined) updateData.genero = genero;
    if (provincia !== undefined) updateData.provincia = provincia;
    if (canton !== undefined) updateData.canton = canton;
    if (nivelEducativo !== undefined) updateData.nivelEducativo = nivelEducativo;
    
    // Manejar schoolId y otraEscuela
    if (schoolId !== undefined) {
      if (schoolId === 'otra') {
        updateData.schoolId = null;
        updateData.otraEscuela = otraEscuela || null;
      } else if (schoolId === 'INDEPENDIENTE' || schoolId === null) {
        updateData.schoolId = null;
        updateData.otraEscuela = null;
      } else {
        updateData.schoolId = schoolId;
        updateData.otraEscuela = null;
      }
    }

    // Actualizar estudiante
    const updatedStudent = await prisma.student.update({
      where: { cedula },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el estudiante'
    });
  }
};
