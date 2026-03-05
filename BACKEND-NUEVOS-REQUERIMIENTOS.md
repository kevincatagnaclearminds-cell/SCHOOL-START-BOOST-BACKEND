# 🔧 NUEVOS REQUERIMIENTOS PARA EL BACKEND

## 📅 Fecha: Marzo 2026
## 🎯 Proyecto: CAPTE Pastaza - Reto 200

---

## ✅ CAMBIOS IMPLEMENTADOS EN FRONTEND

### 1. Capacitación
- ✅ Dinero inicial cambiado de $300 a $200
- ✅ "Reto 300" cambiado a "Reto 200"
- ✅ Metas actualizadas:
  - Curso o capacitación: $150
  - Ahorro para estudios: $400
  - Laptop: $600
  - Bicicleta: $300
  - Viaje: $500 (NUEVA)
- ✅ Rango meta personalizada: $200-$600 (antes $100-$300)
- ✅ Todas las situaciones actualizadas (sin indicadores de dinero, botones verdes)
- ✅ Preguntas con botón "Continuar" (sin checkmarks)
- ✅ Pantalla de resultados con 4 cards de perfiles

### 2. Registro de Estudiantes
- ✅ Campo "Género" agregado (Masculino/Femenino)
- ✅ Validación de formulario actualizada

---

## 🚨 REQUERIMIENTOS CRÍTICOS PARA EL BACKEND

### 1. ACTUALIZAR MODELO STUDENT - AGREGAR CAMPO GÉNERO ⚠️ URGENTE

**Campos necesarios en modelo Student**:
```prisma
model Student {
  id                String   @id @default(uuid())
  cedula            String   @unique
  nombre            String
  apellido          String
  edad              Int
  genero            String   // ⚠️ NUEVO CAMPO - valores: "masculino" o "femenino"
  schoolId          String
  school            School   @relation(fields: [schoolId], references: [id])
  completedTraining Boolean  @default(false)
  trainingCount     Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Endpoint afectado**: `POST /api/students`

**Request body actualizado**:
```json
{
  "cedula": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 15,
  "genero": "masculino",
  "schoolId": "uuid-escuela"
}
```

**Validación**:
- Campo obligatorio
- Solo acepta: "masculino" o "femenino"
- Retornar error 400 si el valor no es válido

---

### 2. VALIDACIÓN DE CÉDULA ECUATORIANA ⚠️ URGENTE

**Endpoint afectado**: `POST /api/students`

**Implementar**:
```javascript
// Validación de cédula ecuatoriana (10 dígitos)
function validarCedulaEcuatoriana(cedula) {
  if (cedula.length !== 10) return false;
  
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  const tercerDigito = parseInt(cedula[2]);
  if (tercerDigito > 6) return false;
  
  // Algoritmo módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i]) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  
  const digitoVerificador = parseInt(cedula[9]);
  const resultado = (10 - (suma % 10)) % 10;
  
  return resultado === digitoVerificador;
}
```

**Respuesta de error**:
```json
{
  "success": false,
  "error": "Cédula ecuatoriana inválida"
}
```

---

### 3. NO PERMITIR CÉDULAS DUPLICADAS ⚠️ URGENTE

**Endpoint afectado**: `POST /api/students`

**Implementar**:
1. Antes de crear, verificar si la cédula ya existe
2. Si existe, retornar error con código 409 (Conflict)

**Respuesta de error**:
```json
{
  "success": false,
  "error": "Esta cédula ya está registrada",
  "existingStudent": {
    "id": "uuid",
    "cedula": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 15,
    "genero": "masculino",
    "schoolId": "uuid-escuela"
  }
}
```

---

### 4. ENDPOINT PARA BUSCAR ESTUDIANTE POR CÉDULA ⚠️ URGENTE

**Nuevo endpoint**: `GET /api/students/cedula/:cedula`

**Ya existe** ✅ (según FRONTEND-API-URL.md)

**Verificar que retorne**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cedula": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 15,
    "genero": "masculino",
    "schoolId": "uuid-escuela",
    "school": {
      "id": "uuid-escuela",
      "nombre": "Escuela Simón Bolívar"
    },
    "completedTraining": true,
    "trainingCount": 1
  }
}
```

---

### 5. LÓGICA DE CAPACITACIÓN COMPLETADA

**Reglas**:
1. Cuando un estudiante completa la capacitación por primera vez:
   - `completedTraining = true`
   - `trainingCount = 1`
   - Sumar 1 al contador de la escuela

2. Si vuelve a completar:
   - `trainingCount++`
   - **NO sumar** al contador de la escuela (solo cuenta la primera vez)

---

### 6. NUEVO ENDPOINT: COMPLETAR CAPACITACIÓN

**Endpoint**: `POST /api/students/:id/complete-training`

**Request body**:
```json
{
  "score": 8,
  "profile": "Constructor de Metas"
}
```

**Lógica**:
```javascript
async function completeTraining(studentId, score, profile) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { school: true }
  });
  
  if (!student) {
    return { success: false, error: "Estudiante no encontrado" };
  }
  
  const isFirstTime = !student.completedTraining;
  
  // Actualizar estudiante
  await prisma.student.update({
    where: { id: studentId },
    data: {
      completedTraining: true,
      trainingCount: student.trainingCount + 1
    }
  });
  
  // Solo sumar a la escuela si es la primera vez
  if (isFirstTime) {
    await prisma.school.update({
      where: { id: student.schoolId },
      data: {
        alumnosCapacitados: {
          increment: 1
        }
      }
    });
  }
  
  return {
    success: true,
    data: {
      isFirstTime,
      trainingCount: student.trainingCount + 1
    }
  };
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "isFirstTime": true,
    "trainingCount": 1
  }
}
```

---

### 7. ACTUALIZAR MODELO SCHOOL

**Verificar que tenga**:
```prisma
model School {
  id                  String    @id @default(uuid())
  codigoAmie          String    @unique
  nombre              String
  totalAlumnos        Int
  alumnosCapacitados  Int       @default(0)  // ✅ Ya existe
  students            Student[]
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

---

## � ENDPOINT DE RANKING

**Verificar que calcule correctamente**:
```javascript
async function getRanking() {
  const schools = await prisma.school.findMany({
    include: {
      _count: {
        select: { students: true }
      }
    },
    orderBy: {
      alumnosCapacitados: 'desc'
    }
  });
  
  return schools.map(school => ({
    id: school.id,
    nombre: school.nombre,
    codigoAmie: school.codigoAmie,
    totalAlumnos: school.totalAlumnos,
    alumnosCapacitados: school.alumnosCapacitados,
    porcentaje: (school.alumnosCapacitados / school.totalAlumnos * 100).toFixed(2),
    estudiantesRegistrados: school._count.students
  }));
}
```

---

## 🔄 MIGRACIONES NECESARIAS

### Migración 1: Agregar campo género a Student
```sql
ALTER TABLE "Student" 
ADD COLUMN "genero" VARCHAR(10) NOT NULL DEFAULT 'masculino';
```

### Migración 2: Agregar campos de capacitación a Student
```sql
ALTER TABLE "Student" 
ADD COLUMN "completedTraining" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "trainingCount" INTEGER NOT NULL DEFAULT 0;
```

### Migración 3: Actualizar cédulas existentes
```sql
-- Si hay estudiantes duplicados, mantener solo el primero
DELETE FROM "Student" a
USING "Student" b
WHERE a.id > b.id
AND a.cedula = b.cedula;

-- Hacer cédula única
ALTER TABLE "Student"
ADD CONSTRAINT "Student_cedula_key" UNIQUE ("cedula");
```

---

## ✅ CHECKLIST PARA EL BACKEND

- [ ] Agregar campo "genero" al modelo Student
- [ ] Actualizar validación POST /api/students para incluir género
- [ ] Implementar validación de cédula ecuatoriana
- [ ] Agregar constraint UNIQUE a cedula
- [ ] Verificar endpoint GET /api/students/cedula/:cedula
- [ ] Agregar campos completedTraining y trainingCount
- [ ] Crear endpoint POST /api/students/:id/complete-training
- [ ] Actualizar lógica de ranking
- [ ] Ejecutar migraciones
- [ ] Probar flujo completo:
  - [ ] Registro nuevo estudiante con género
  - [ ] Intento de registro duplicado (debe fallar)
  - [ ] Búsqueda por cédula
  - [ ] Completar capacitación (primera vez)
  - [ ] Completar capacitación (segunda vez)
  - [ ] Verificar que ranking solo cuenta primera vez

---

## 🧪 CASOS DE PRUEBA

### Test 1: Registro nuevo con género
```bash
POST /api/students
{
  "cedula": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 15,
  "genero": "masculino",
  "schoolId": "uuid-escuela"
}
# Esperado: 201 Created
```

### Test 2: Registro sin género
```bash
POST /api/students
{
  "cedula": "1234567891",
  "nombre": "María",
  "apellido": "López",
  "edad": 14,
  "schoolId": "uuid-escuela"
}
# Esperado: 400 Bad Request - "Campo género es obligatorio"
```

### Test 3: Registro con género inválido
```bash
POST /api/students
{
  "cedula": "1234567892",
  "nombre": "Pedro",
  "apellido": "García",
  "edad": 16,
  "genero": "otro",
  "schoolId": "uuid-escuela"
}
# Esperado: 400 Bad Request - "Género debe ser 'masculino' o 'femenino'"
```

### Test 4: Registro duplicado
```bash
POST /api/students
{
  "cedula": "1234567890",  # Ya existe
  "nombre": "María",
  "apellido": "López",
  "edad": 14,
  "genero": "femenino",
  "schoolId": "uuid-escuela"
}
# Esperado: 409 Conflict con datos del estudiante existente
```

### Test 5: Cédula inválida
```bash
POST /api/students
{
  "cedula": "0000000000",  # Inválida
  "nombre": "Pedro",
  "apellido": "García",
  "edad": 16,
  "genero": "masculino",
  "schoolId": "uuid-escuela"
}
# Esperado: 400 Bad Request
```

### Test 6: Buscar por cédula
```bash
GET /api/students/cedula/1234567890
# Esperado: 200 OK con datos completos incluyendo género
```

### Test 7: Completar capacitación (primera vez)
```bash
POST /api/students/uuid-estudiante/complete-training
{
  "score": 8,
  "profile": "Constructor de Metas"
}
# Esperado: isFirstTime = true, escuela +1
```

### Test 8: Completar capacitación (segunda vez)
```bash
POST /api/students/uuid-estudiante/complete-training
{
  "score": 10,
  "profile": "Diseñador de su Futuro"
}
# Esperado: isFirstTime = false, escuela sin cambios
```

---

## 📞 CONTACTO

Si hay dudas sobre algún requerimiento, revisar:
- `FRONTEND-API-URL.md` - Endpoints actuales
- `INTEGRACION-BACKEND.md` - Integración frontend-backend
- `IMPLEMENTAR-BACKEND-AHORA.md` - Especificación original

---

## 🎯 PRIORIDAD

1. ⚠️ **URGENTE**: Agregar campo género al modelo y endpoint
2. ⚠️ **URGENTE**: Validación de cédula + No duplicados
3. ⚠️ **URGENTE**: Endpoint buscar por cédula
4. **ALTA**: Lógica de capacitación completada
5. **MEDIA**: Endpoint completar capacitación
6. **BAJA**: Tests automatizados

---

## 🆕 RESUMEN DE CAMBIOS EN ESTA ACTUALIZACIÓN

### Campo Género Agregado
- El frontend ahora envía el campo `genero` en el registro de estudiantes
- Valores permitidos: "masculino" o "femenino"
- Campo obligatorio en el formulario
- El backend debe validar y almacenar este campo

### Pantalla de Resultados Actualizada
- Ahora muestra 4 cards con todos los perfiles financieros
- El perfil del usuario se destaca en color
- Los otros 3 perfiles se muestran en gris

---

¡El frontend está listo para consumir estos cambios! 🚀
