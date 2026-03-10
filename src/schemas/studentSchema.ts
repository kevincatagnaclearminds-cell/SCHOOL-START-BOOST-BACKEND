import { z } from 'zod';

// Validación básica de cédula ecuatoriana
export const validarCedulaEcuatoriana = (cedula: string): boolean => {
  // Solo validar formato básico: 10 dígitos numéricos
  if (cedula.length !== 10) return false;
  
  // Validar que todos sean números
  if (!/^\d+$/.test(cedula)) return false;
  
  // Validar provincia (primeros 2 dígitos entre 01 y 24)
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  // Validación más flexible: permitir cualquier tercer dígito válido
  const tercerDigito = parseInt(cedula[2]);
  if (tercerDigito > 9) return false;
  
  return true;
};

export const createStudentSchema = z.object({
  cedula: z.string()
    .length(10, 'Cédula debe tener exactamente 10 dígitos')
    .regex(/^\d+$/, 'Cédula debe contener solo números')
    .refine(validarCedulaEcuatoriana, 'Cédula ecuatoriana inválida'),
  nombre: z.string().min(2, 'Nombre debe tener mínimo 2 caracteres').max(50, 'Nombre debe tener máximo 50 caracteres'),
  apellido: z.string().min(2, 'Apellido debe tener mínimo 2 caracteres').max(50, 'Apellido debe tener máximo 50 caracteres'),
  edad: z.number().int().min(5, 'Edad mínima es 5 años').max(29, 'Edad máxima es 29 años'),
  genero: z.enum(['masculino', 'femenino'], {
    errorMap: () => ({ message: "Género debe ser 'masculino' o 'femenino'" })
  }),
  provincia: z.string().min(1, 'Provincia es obligatoria').max(100, 'Provincia debe tener máximo 100 caracteres'),
  canton: z.string().min(1, 'Cantón es obligatorio').max(100, 'Cantón debe tener máximo 100 caracteres'),
  nivelEducativo: z.enum(['ninguno', 'primaria', 'secundaria', 'tecnologico', 'universitario', 'postgrado'], {
    errorMap: () => ({ message: "Nivel educativo inválido. Valores permitidos: ninguno, primaria, secundaria, tecnologico, universitario, postgrado" })
  }),
  schoolId: z.union([z.string(), z.null()]).optional(),
  otraEscuela: z.string().optional()
}).refine(
  (data) => {
    // Si schoolId es "otra", otraEscuela debe tener valor
    if (data.schoolId === 'otra') {
      return data.otraEscuela && data.otraEscuela.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Debes proporcionar el nombre de la escuela',
    path: ['otraEscuela']
  }
);

export const completeTrainingSchema = z.object({
  score: z.number().int().min(0).max(100),
  profile: z.string().min(1, 'Perfil es obligatorio')
});

export const updateStudentSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener mínimo 2 caracteres').max(50, 'Nombre debe tener máximo 50 caracteres').optional(),
  apellido: z.string().min(2, 'Apellido debe tener mínimo 2 caracteres').max(50, 'Apellido debe tener máximo 50 caracteres').optional(),
  edad: z.number().int().min(5, 'Edad mínima es 5 años').max(29, 'Edad máxima es 29 años').optional(),
  genero: z.enum(['masculino', 'femenino'], {
    errorMap: () => ({ message: "Género debe ser 'masculino' o 'femenino'" })
  }).optional(),
  provincia: z.string().min(1, 'Provincia es obligatoria').max(100, 'Provincia debe tener máximo 100 caracteres').optional(),
  canton: z.string().min(1, 'Cantón es obligatorio').max(100, 'Cantón debe tener máximo 100 caracteres').optional(),
  nivelEducativo: z.enum(['ninguno', 'primaria', 'secundaria', 'tecnologico', 'universitario', 'postgrado'], {
    errorMap: () => ({ message: "Nivel educativo inválido. Valores permitidos: ninguno, primaria, secundaria, tecnologico, universitario, postgrado" })
  }).optional(),
  schoolId: z.union([z.string(), z.null()]).optional(),
  otraEscuela: z.string().optional().nullable()
}).refine(
  (data) => {
    // Si schoolId es "otra", otraEscuela debe tener valor
    if (data.schoolId === 'otra') {
      return data.otraEscuela && data.otraEscuela.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Debes proporcionar el nombre de la escuela',
    path: ['otraEscuela']
  }
);

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CompleteTrainingInput = z.infer<typeof completeTrainingSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
