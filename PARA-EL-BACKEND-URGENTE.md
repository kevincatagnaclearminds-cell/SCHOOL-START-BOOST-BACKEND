# 🚨 CAMBIOS URGENTES EN EL FRONTEND - BACKEND DEBE IMPLEMENTAR

## 📅 Fecha: Marzo 2026
## 🎯 Proyecto: CAPTE Pastaza - Reto 200

---

## ⚠️ RESUMEN EJECUTIVO

El frontend YA ESTÁ ENVIANDO estos campos al backend. El backend DEBE actualizarse INMEDIATAMENTE para aceptarlos, de lo contrario seguirá dando error HTTP 400/409.

---

## 📤 LO QUE EL FRONTEND ESTÁ ENVIANDO AHORA

### Endpoint: `POST /api/students`

```json
{
  "cedula": "1600000000",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 18,
  "genero": "masculino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "secundaria",
  "schoolId": "uuid-escuela-123",
  "otraEscuela": null
}
```

---

## 🆕 CAMPOS NUEVOS QUE EL BACKEND DEBE ACEPTAR

| Campo | Tipo | Obligatorio | Valores Permitidos | Ejemplo |
|-------|------|-------------|-------------------|---------|
| `genero` | string | ✅ Sí | "masculino", "femenino" | "masculino" |
| `provincia` | string | ✅ Sí | Texto libre | "Pastaza" |
| `canton` | string | ✅ Sí | Texto libre | "Puyo" |
| `nivelEducativo` | string | ✅ Sí | "ninguno", "primaria", "secundaria", "tecnologico", "universitario", "postgrado" | "secundaria" |
| `otraEscuela` | string | ❌ No | Texto libre (solo si schoolId="otra") | "Escuela Nueva" |

---

## 📊 VALIDACIONES QUE EL FRONTEND YA HACE

### 1. Cédula
- ✅ Exactamente 10 dígitos
- ✅ Solo números
- ✅ No permite letras

### 2. Nombre y Apellido
- ✅ Solo letras (incluye acentos y ñ)
- ✅ Mínimo 2 caracteres
- ✅ Máximo 50 caracteres
- ✅ No permite números

### 3. Edad
- ✅ Mínimo: 5 años
- ✅ Máximo: 29 años (ACTUALIZADO de 25 a 29)

### 4. Género
- ✅ Solo acepta: "masculino" o "femenino"

### 5. Nivel Educativo
- ✅ Solo acepta: "ninguno", "primaria", "secundaria", "tecnologico", "universitario", "postgrado"

### 6. Provincia y Cantón
- ✅ Campos obligatorios
- ✅ Texto libre

---

## 🔧 LO QUE EL BACKEND DEBE HACER

### 1. Actualizar el Modelo de Base de Datos

```prisma
model Student {
  id                String   @id @default(uuid())
  cedula            String   @unique
  nombre            String
  apellido          String
  edad              Int
  genero            String   // ⚠️ AGREGAR
  provincia         String   // ⚠️ AGREGAR
  canton            String   // ⚠️ AGREGAR
  nivelEducativo    String   // ⚠️ AGREGAR
  schoolId          String
  otraEscuela       String?  // ⚠️ AGREGAR (opcional)
  school            School   @relation(fields: [schoolId], references: [id])
  completedTraining Boolean  @default(false)
  trainingCount     Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 2. Ejecutar Migración

```bash
npx prisma migrate dev --name add_student_fields
```

O manualmente:

```sql
ALTER TABLE "Student" 
ADD COLUMN "genero" VARCHAR(10) NOT NULL DEFAULT 'masculino',
ADD COLUMN "provincia" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN "canton" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN "nivelEducativo" VARCHAR(20) NOT NULL DEFAULT 'ninguno',
ADD COLUMN "otraEscuela" VARCHAR(200);
```

### 3. Actualizar el Endpoint POST /api/students

```javascript
// Validar género
if (!["masculino", "femenino"].includes(req.body.genero)) {
  return res.status(400).json({
    success: false,
    error: "El género debe ser 'masculino' o 'femenino'"
  });
}

// Validar provincia
if (!req.body.provincia || req.body.provincia.trim() === '') {
  return res.status(400).json({
    success: false,
    error: "La provincia es obligatoria"
  });
}

// Validar cantón
if (!req.body.canton || req.body.canton.trim() === '') {
  return res.status(400).json({
    success: false,
    error: "El cantón es obligatorio"
  });
}

// Validar nivel educativo
const nivelesValidos = ["ninguno", "primaria", "secundaria", "tecnologico", "universitario", "postgrado"];
if (!nivelesValidos.includes(req.body.nivelEducativo)) {
  return res.status(400).json({
    success: false,
    error: "Nivel educativo inválido. Valores permitidos: ninguno, primaria, secundaria, tecnologico, universitario, postgrado"
  });
}

// Validar edad (ACTUALIZADO)
if (req.body.edad < 5 || req.body.edad > 29) {
  return res.status(400).json({
    success: false,
    error: "La edad debe estar entre 5 y 29 años"
  });
}

// Validar cédula única
const existingStudent = await prisma.student.findUnique({
  where: { cedula: req.body.cedula }
});

if (existingStudent) {
  return res.status(409).json({
    success: false,
    error: "Esta cédula ya está registrada",
    existingStudent: {
      id: existingStudent.id,
      cedula: existingStudent.cedula,
      nombre: existingStudent.nombre,
      apellido: existingStudent.apellido
    }
  });
}

// Crear estudiante
const newStudent = await prisma.student.create({
  data: {
    cedula: req.body.cedula,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    edad: req.body.edad,
    genero: req.body.genero,
    provincia: req.body.provincia,
    canton: req.body.canton,
    nivelEducativo: req.body.nivelEducativo,
    schoolId: req.body.schoolId,
    otraEscuela: req.body.otraEscuela || null
  }
});

return res.status(201).json({
  success: true,
  data: newStudent
});
```

### 4. Actualizar GET /api/students y GET /api/students/cedula/:cedula

Asegurarse de que retornen los nuevos campos:

```javascript
{
  "success": true,
  "data": {
    "id": "uuid",
    "cedula": "1600000000",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 18,
    "genero": "masculino",
    "provincia": "Pastaza",
    "canton": "Puyo",
    "nivelEducativo": "secundaria",
    "schoolId": "uuid-escuela",
    "otraEscuela": null,
    "completedTraining": false,
    "trainingCount": 0,
    "createdAt": "2026-03-05T10:00:00.000Z"
  }
}
```

---

## 🧪 PRUEBAS QUE DEBEN PASAR

### ✅ Test 1: Registro exitoso con todos los campos
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000000",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 18,
  "genero": "masculino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "secundaria",
  "schoolId": "uuid-escuela"
}

Esperado: 201 Created
```

### ❌ Test 2: Sin género (debe fallar)
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000001",
  "nombre": "María",
  "apellido": "López",
  "edad": 20,
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "universitario",
  "schoolId": "uuid-escuela"
}

Esperado: 400 Bad Request
Error: "El género debe ser 'masculino' o 'femenino'"
```

### ❌ Test 3: Nivel educativo inválido (debe fallar)
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000002",
  "nombre": "Pedro",
  "apellido": "García",
  "edad": 25,
  "genero": "masculino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "doctorado",
  "schoolId": "uuid-escuela"
}

Esperado: 400 Bad Request
Error: "Nivel educativo inválido"
```

### ✅ Test 4: Con "otra" escuela
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000003",
  "nombre": "Ana",
  "apellido": "Martínez",
  "edad": 22,
  "genero": "femenino",
  "provincia": "Pastaza",
  "canton": "Mera",
  "nivelEducativo": "universitario",
  "schoolId": "otra",
  "otraEscuela": "Unidad Educativa Nueva Esperanza"
}

Esperado: 201 Created
```

### ❌ Test 5: Cédula duplicada (debe fallar)
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000000",
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "edad": 19,
  "genero": "masculino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "secundaria",
  "schoolId": "uuid-escuela"
}

Esperado: 409 Conflict
Error: "Esta cédula ya está registrada"
```

### ✅ Test 6: Edad 29 (límite máximo)
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000004",
  "nombre": "Laura",
  "apellido": "Sánchez",
  "edad": 29,
  "genero": "femenino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "postgrado",
  "schoolId": "uuid-escuela"
}

Esperado: 201 Created
```

### ❌ Test 7: Edad 30 (excede límite)
```bash
POST https://cacpe-pastaza.onrender.com/api/students
Content-Type: application/json

{
  "cedula": "1600000005",
  "nombre": "Miguel",
  "apellido": "Torres",
  "edad": 30,
  "genero": "masculino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "universitario",
  "schoolId": "uuid-escuela"
}

Esperado: 400 Bad Request
Error: "La edad debe estar entre 5 y 29 años"
```

---

## ✅ CHECKLIST PARA EL BACKEND

- [ ] Agregar campos al modelo Student: genero, provincia, canton, nivelEducativo, otraEscuela
- [ ] Ejecutar migración de base de datos
- [ ] Actualizar validación de edad (máximo 29)
- [ ] Validar género (masculino/femenino)
- [ ] Validar provincia (obligatorio)
- [ ] Validar cantón (obligatorio)
- [ ] Validar nivel educativo (6 opciones válidas)
- [ ] Validar cédula única (no duplicados)
- [ ] Actualizar POST /api/students para aceptar nuevos campos
- [ ] Actualizar GET /api/students para retornar nuevos campos
- [ ] Actualizar GET /api/students/cedula/:cedula para retornar nuevos campos
- [ ] Probar todos los casos de prueba
- [ ] Desplegar a Render

---

## 🚀 PRIORIDAD MÁXIMA

**ESTO ES URGENTE** - El frontend ya está funcionando y enviando estos datos. El backend DEBE implementar estos cambios AHORA para que la aplicación funcione.

---

## 📞 CONTACTO

Si hay dudas, revisar también:
- `BACKEND-CAMPOS-ADICIONALES.md` - Detalles técnicos completos
- `BACKEND-NUEVOS-REQUERIMIENTOS.md` - Requerimientos anteriores

---

## 🎯 URL DEL BACKEND

**Producción**: https://cacpe-pastaza.onrender.com/api

Asegúrense de desplegar los cambios a Render después de implementar.

---

¡El frontend está listo y esperando! 🚀
