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
  nombre: z.string().min(1, 'Nombre es obligatorio').max(100, 'Nombre debe tener máximo 100 caracteres'),
  apellido: z.string().min(1, 'Apellido es obligatorio').max(100, 'Apellido debe tener máximo 100 caracteres'),
  edad: z.number().int().min(5, 'Edad mínima es 5 años').max(25, 'Edad máxima es 25 años'),
  genero: z.enum(['masculino', 'femenino'], {
    errorMap: () => ({ message: "Género debe ser 'masculino' o 'femenino'" })
  }),
  schoolId: z.string().min(1, 'School ID es obligatorio'),
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
  score: z.number().int().min(0).max(10),
  profile: z.string().min(1, 'Perfil es obligatorio')
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CompleteTrainingInput = z.infer<typeof completeTrainingSchema>;
