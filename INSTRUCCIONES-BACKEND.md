# 🔧 Instrucciones para Implementar el Backend

## ✅ Lo que ya tienes corriendo
Tu backend está en `http://localhost:3001` pero faltan los endpoints implementados.

## 📝 Endpoints que necesitas implementar

### 1. POST /api/schools - Crear Escuela

**Archivo:** `src/controllers/schoolController.ts`

```typescript
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
```

---

### 2. POST /api/students - Crear Estudiante

**Archivo:** `src/controllers/studentController.ts`

```typescript
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
```

---

### 3. GET /api/ranking - Obtener Ranking

**Archivo:** `src/controllers/rankingController.ts`

```typescript
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
```

---

### 4. Rutas - Conectar los controladores

**Archivo:** `src/routes/schoolRoutes.ts`

```typescript
import { Router } from 'express';
import { createSchool, getAllSchools, getSchoolById } from '../controllers/schoolController';

const router = Router();

router.post('/schools', createSchool);
router.get('/schools', getAllSchools);
router.get('/schools/:id', getSchoolById);

export default router;
```

**Archivo:** `src/routes/studentRoutes.ts`

```typescript
import { Router } from 'express';
import { createStudent, getAllStudents, getStudentByCedula } from '../controllers/studentController';

const router = Router();

router.post('/students', createStudent);
router.get('/students', getAllStudents);
router.get('/students/cedula/:cedula', getStudentByCedula);

export default router;
```

**Archivo:** `src/routes/rankingRoutes.ts`

```typescript
import { Router } from 'express';
import { getRanking } from '../controllers/rankingController';

const router = Router();

router.get('/ranking', getRanking);

export default router;
```

---

### 5. Archivo Principal - Conectar todas las rutas

**Archivo:** `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schoolRoutes from './routes/schoolRoutes';
import studentRoutes from './routes/studentRoutes';
import rankingRoutes from './routes/rankingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', schoolRoutes);
app.use('/api', studentRoutes);
app.use('/api', rankingRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'CAPTE Pastaza API - Backend funcionando ✅' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});
```

---

### 6. Utilidad Prisma

**Archivo:** `src/utils/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

---

## 🧪 Probar los Endpoints

Una vez implementado, prueba con estos comandos:

### 1. Crear una escuela:
```bash
curl -X POST http://localhost:3001/api/schools \
  -H "Content-Type: application/json" \
  -d "{\"codigoAmie\":\"AMIE-001\",\"nombre\":\"Escuela Test\",\"totalAlumnos\":100}"
```

### 2. Listar escuelas:
```bash
curl http://localhost:3001/api/schools
```

### 3. Crear un estudiante:
```bash
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d "{\"cedula\":\"1234567890\",\"nombre\":\"Juan\",\"apellido\":\"Pérez\",\"edad\":15,\"schoolId\":\"uuid-de-la-escuela\"}"
```

### 4. Ver ranking:
```bash
curl http://localhost:3001/api/ranking
```

---

## ✅ Checklist de Implementación

- [ ] Crear carpeta `src/controllers/`
- [ ] Crear `schoolController.ts`
- [ ] Crear `studentController.ts`
- [ ] Crear `rankingController.ts`
- [ ] Crear carpeta `src/routes/`
- [ ] Crear `schoolRoutes.ts`
- [ ] Crear `studentRoutes.ts`
- [ ] Crear `rankingRoutes.ts`
- [ ] Crear `src/utils/prisma.ts`
- [ ] Actualizar `src/index.ts`
- [ ] Reiniciar el servidor: `npm run dev`
- [ ] Probar con curl o Postman

---

## 🔥 Comandos Rápidos

```bash
# En la carpeta del backend
npm run dev

# El servidor debe mostrar:
# 🚀 Servidor corriendo en http://localhost:3001
# 📡 API disponible en http://localhost:3001/api
```

---

## 🐛 Si hay errores

1. Verifica que Prisma esté generado: `npx prisma generate`
2. Verifica que las migraciones estén aplicadas: `npx prisma migrate dev`
3. Verifica que la base de datos esté conectada en `.env`
4. Revisa los logs del servidor en la terminal

---

¡Con esto tu backend estará completo y el frontend podrá conectarse! 🎉
