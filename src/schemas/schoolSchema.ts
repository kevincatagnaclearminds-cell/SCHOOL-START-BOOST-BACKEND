import { z } from 'zod';

export const createSchoolSchema = z.object({
  codigoAmie: z.string().max(50, 'Código AMIE debe tener máximo 50 caracteres'),
  nombre: z.string().max(200, 'Nombre debe tener máximo 200 caracteres'),
  totalAlumnos: z.number().int().min(1, 'Total de alumnos debe ser al menos 1').max(10000, 'Total de alumnos no puede exceder 10000')
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
