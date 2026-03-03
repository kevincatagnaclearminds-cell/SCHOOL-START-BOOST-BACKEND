# 🚀 IMPLEMENTAR BACKEND - GUÍA RÁPIDA

## ⚠️ IMPORTANTE
El frontend YA ESTÁ consumiendo estos endpoints. Necesitas implementarlos AHORA para que funcione.

---

## 📝 PASO 1: Crear Controladores

### Archivo: `src/controllers/schoolController.ts`

```typescript
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createSchool = async (req: Request, res: Response) => {
  try {
    const { codigoAmie, nombre, totalAlumnos } = req.body;

    const existing = await prisma.school.findUnique({
      where: { codigoAmie }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'El código AMIE ya existe'
      });
    }

    const school = await prisma.school.create({
      data: { codigoAmie, nombre, totalAlumnos }
    });

    res.status(201).json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error:', error);
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
    console.error('Error:', error);
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
        _count: { select: { students: true } }
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
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la escuela'
    });
  }
};
```

---

### Archivo: `src/controllers/studentController.ts`

```typescript
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { cedula, nombre, apellido, edad, schoolId } = req.body;

    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Escuela no encontrada'
      });
    }

    const existing = await prisma.student.findUnique({
      where: { cedula }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Esta cédula ya está registrada'
      });
    }

    const student = await prisma.student.create({
      data: { cedula, nombre, apellido, edad, schoolId }
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error:', error);
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
          select: { id: true, nombre: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error:', error);
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
        school: { select: { nombre: true } }
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
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el estudiante'
    });
  }
};
```

---

### Archivo: `src/controllers/rankingController.ts`

```typescript
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getRanking = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: { select: { students: true } }
      }
    });

    const ranking = schools.map((school) => {
      const capacitados = school._count.students;
      const percentage = school.totalAlumnos > 0 
        ? (capacitados / school.totalAlumnos) * 100 
        : 0;

      return {
        position: 0,
        school: {
          id: school.id,
          codigoAmie: school.codigoAmie,
          nombre: school.nombre,
          totalAlumnos: school.totalAlumnos
        },
        capacitados,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    ranking.sort((a, b) => b.percentage - a.percentage);

    ranking.forEach((item, index) => {
      item.position = index + 1;
    });

    res.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el ranking'
    });
  }
};
```

---

## 📝 PASO 2: Crear Rutas

### Archivo: `src/routes/schoolRoutes.ts`

```typescript
import { Router } from 'express';
import { createSchool, getAllSchools, getSchoolById } from '../controllers/schoolController';

const router = Router();

router.post('/schools', createSchool);
router.get('/schools', getAllSchools);
router.get('/schools/:id', getSchoolById);

export default router;
```

---

### Archivo: `src/routes/studentRoutes.ts`

```typescript
import { Router } from 'express';
import { createStudent, getAllStudents, getStudentByCedula } from '../controllers/studentController';

const router = Router();

router.post('/students', createStudent);
router.get('/students', getAllStudents);
router.get('/students/cedula/:cedula', getStudentByCedula);

export default router;
```

---

### Archivo: `src/routes/rankingRoutes.ts`

```typescript
import { Router } from 'express';
import { getRanking } from '../controllers/rankingController';

const router = Router();

router.get('/ranking', getRanking);

export default router;
```

---

## 📝 PASO 3: Crear Utilidad Prisma

### Archivo: `src/utils/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

---

## 📝 PASO 4: Actualizar Index Principal

### Archivo: `src/index.ts`

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
  res.json({ message: 'CAPTE Pastaza API ✅' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log(`📡 API en http://localhost:${PORT}/api`);
});
```

---

## 🔥 PASO 5: Reiniciar Servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
npm run dev
```

Deberías ver:
```
🚀 Servidor en http://localhost:3001
📡 API en http://localhost:3001/api
```

---

## ✅ PASO 6: Probar que Funciona

### Prueba 1: Crear escuela
```bash
curl -X POST http://localhost:3001/api/schools \
  -H "Content-Type: application/json" \
  -d "{\"codigoAmie\":\"AMIE-TEST\",\"nombre\":\"Escuela Test\",\"totalAlumnos\":100}"
```

Deberías ver:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "codigoAmie": "AMIE-TEST",
    "nombre": "Escuela Test",
    "totalAlumnos": 100,
    ...
  }
}
```

### Prueba 2: Ver escuelas
```bash
curl http://localhost:3001/api/schools
```

### Prueba 3: Ver ranking
```bash
curl http://localhost:3001/api/ranking
```

---

## 🐛 Si hay Errores

### Error: "Cannot find module"
```bash
npx prisma generate
```

### Error: "prisma is not defined"
Verifica que creaste `src/utils/prisma.ts`

### Error: "Port already in use"
```bash
# Mata el proceso en el puerto 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <numero> /F

# Linux/Mac:
lsof -ti:3001 | xargs kill -9
```

---

## 📋 Checklist Final

- [ ] Crear carpeta `src/controllers/`
- [ ] Crear `schoolController.ts`
- [ ] Crear `studentController.ts`
- [ ] Crear `rankingController.ts`
- [ ] Crear carpeta `src/routes/`
- [ ] Crear `schoolRoutes.ts`
- [ ] Crear `studentRoutes.ts`
- [ ] Crear `rankingRoutes.ts`
- [ ] Crear carpeta `src/utils/`
- [ ] Crear `prisma.ts`
- [ ] Actualizar `src/index.ts`
- [ ] Ejecutar `npm run dev`
- [ ] Probar con curl
- [ ] Probar desde el frontend

---

## 🎯 Resultado Esperado

Una vez implementado:
1. El frontend podrá registrar escuelas
2. Los estudiantes podrán registrarse
3. El ranking se actualizará automáticamente
4. Todo funcionará sin errores

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs del servidor
2. Verifica que Prisma esté generado: `npx prisma generate`
3. Verifica que las migraciones estén aplicadas: `npx prisma migrate dev`
4. Verifica la conexión a la base de datos en `.env`

---

¡Con esto el backend estará 100% funcional! 🚀
