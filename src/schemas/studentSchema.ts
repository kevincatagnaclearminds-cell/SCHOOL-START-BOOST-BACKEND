import { z } from 'zod';

export const createStudentSchema = z.object({
  cedula: z.string().length(10, 'Cédula debe tener exactamente 10 dígitos').regex(/^\d+$/, 'Cédula debe contener solo números'),
  nombre: z.string().max(100, 'Nombre debe tener máximo 100 caracteres'),
  apellido: z.string().max(100, 'Apellido debe tener máximo 100 caracteres'),
  edad: z.number().int().min(5, 'Edad mínima es 5 años').max(25, 'Edad máxima es 25 años'),
  schoolId: z.string().uuid('School ID debe ser un UUID válido')
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
