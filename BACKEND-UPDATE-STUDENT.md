# 🔄 NUEVO ENDPOINT: Actualizar Estudiante por Cédula

## 📅 Fecha: Marzo 2026
## 🎯 Proyecto: CAPTE Pastaza - Actualización de Datos

---

## ⚠️ RESUMEN

El frontend ahora permite que usuarios registrados puedan EDITAR sus datos antes de iniciar la capacitación. Cuando hacen cambios y dan clic en "Iniciar Capacitación", el sistema debe ACTUALIZAR los datos en la base de datos.

---

## 🆕 NUEVO ENDPOINT REQUERIDO

### `PUT /api/students/cedula/:cedula`

**Descripción**: Actualiza los datos de un estudiante existente identificado por su cédula.

**Parámetros de URL**:
- `cedula` (string, requerido): La cédula del estudiante (10 dígitos)

**Body (JSON)**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 19,
  "genero": "masculino",
  "provincia": "Pastaza",
  "canton": "Puyo",
  "nivelEducativo": "universitario",
  "schoolId": "uuid-escuela-123",
  "otraEscuela": null
}
```

**Campos Actualizables** (todos opcionales en el body):
- `nombre` (string)
- `apellido` (string)
- `edad` (number)
- `genero` (string: "masculino" | "femenino")
- `provincia` (string)
- `canton` (string)
- `nivelEducativo` (string: "ninguno" | "primaria" | "secundaria" | "tecnologico" | "universitario" | "postgrado")
- `schoolId` (string)
- `otraEscuela` (string | null)

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cedula": "1600000000",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 19,
    "genero": "masculino",
    "provincia": "Pastaza",
    "canton": "Puyo",
    "nivelEducativo": "universitario",
    "schoolId": "uuid-escuela",
    "otraEscuela": null,
    "completedTraining": false,
    "trainingCount": 0,
    "createdAt": "2026-03-05T10:00:00.000Z",
    "updatedAt": "2026-03-05T11:30:00.000Z"
  }
}
```

**Respuesta de Error (404 Not Found)**:
```json
{
  "success": false,
  "error": "Estudiante no encontrado"
}
```

**Respuesta de Error (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Datos inválidos"
}
```

---

## 💻 IMPLEMENTACIÓN SUGERIDA (Node.js + Prisma)

```javascript
// PUT /api/students/cedula/:cedula
router.put('/students/cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Validar que la cédula tenga 10 dígitos
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        error: "Cédula inválida. Debe tener exactamente 10 dígitos"
      });
    }

    // Buscar estudiante
    const existingStudent = await prisma.student.findUnique({
      where: { cedula }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        error: "Estudiante no encontrado"
      });
    }

    // Validaciones opcionales de los campos que vienen en el body
    if (req.body.genero && !["masculino", "femenino"].includes(req.body.genero)) {
      return res.status(400).json({
        success: false,
        error: "El género debe ser 'masculino' o 'femenino'"
      });
    }

    if (req.body.nivelEducativo) {
      const nivelesValidos = ["ninguno", "primaria", "secundaria", "tecnologico", "universitario", "postgrado"];
      if (!nivelesValidos.includes(req.body.nivelEducativo)) {
        return res.status(400).json({
          success: false,
          error: "Nivel educativo inválido"
        });
      }
    }

    if (req.body.edad && (req.body.edad < 5 || req.body.edad > 29)) {
      return res.status(400).json({
        success: false,
        error: "La edad debe estar entre 5 y 29 años"
      });
    }

    // Actualizar estudiante
    const updatedStudent = await prisma.student.update({
      where: { cedula },
      data: {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        edad: req.body.edad,
        genero: req.body.genero,
        provincia: req.body.provincia,
        canton: req.body.canton,
        nivelEducativo: req.body.nivelEducativo,
        schoolId: req.body.schoolId,
        otraEscuela: req.body.otraEscuela || null,
        updatedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
});
```

---

## 🔄 FLUJO DE USUARIO

1. **Usuario ingresa cédula** (10 dígitos)
2. **Sistema busca en BD** usando `GET /api/students/cedula/:cedula`
3. **Si existe**: 
   - Autocompleta todos los campos
   - Muestra modal de bienvenida
   - Usuario puede EDITAR cualquier campo (excepto cédula)
4. **Usuario hace cambios** (ej: cambia edad de 18 a 19)
5. **Usuario hace clic en "Iniciar Capacitación"**
6. **Frontend llama** `PUT /api/students/cedula/:cedula` con los datos actualizados
7. **Backend actualiza** los datos en la base de datos
8. **Frontend redirige** a `/capacitacion`

---

## 🧪 CASOS DE PRUEBA

### ✅ Test 1: Actualización exitosa
```bash
PUT https://cacpe-pastaza.onrender.com/api/students/cedula/1600000000
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "edad": 19,
  "nivelEducativo": "universitario"
}

Esperado: 200 OK con datos actualizados
```

### ❌ Test 2: Estudiante no existe
```bash
PUT https://cacpe-pastaza.onrender.com/api/students/cedula/9999999999
Content-Type: application/json

{
  "nombre": "Test"
}

Esperado: 404 Not Found
Error: "Estudiante no encontrado"
```

### ❌ Test 3: Género inválido
```bash
PUT https://cacpe-pastaza.onrender.com/api/students/cedula/1600000000
Content-Type: application/json

{
  "genero": "otro"
}

Esperado: 400 Bad Request
Error: "El género debe ser 'masculino' o 'femenino'"
```

### ❌ Test 4: Edad fuera de rango
```bash
PUT https://cacpe-pastaza.onrender.com/api/students/cedula/1600000000
Content-Type: application/json

{
  "edad": 35
}

Esperado: 400 Bad Request
Error: "La edad debe estar entre 5 y 29 años"
```

### ✅ Test 5: Actualización parcial (solo algunos campos)
```bash
PUT https://cacpe-pastaza.onrender.com/api/students/cedula/1600000000
Content-Type: application/json

{
  "provincia": "Pichincha",
  "canton": "Quito"
}

Esperado: 200 OK
Solo actualiza provincia y cantón, mantiene los demás campos
```

---

## ⚠️ NOTAS IMPORTANTES

1. **La cédula NO se puede cambiar** - es el identificador único
2. **Todos los campos en el body son opcionales** - solo se actualizan los que vienen
3. **Mantener las mismas validaciones** que en el POST original
4. **Actualizar el campo `updatedAt`** automáticamente
5. **No permitir cambiar `id`, `createdAt`, `completedTraining`, `trainingCount`**

---

## ✅ CHECKLIST PARA EL BACKEND

- [ ] Crear endpoint PUT /api/students/cedula/:cedula
- [ ] Validar que la cédula tenga 10 dígitos
- [ ] Buscar estudiante por cédula
- [ ] Retornar 404 si no existe
- [ ] Validar campos opcionales (género, edad, nivelEducativo)
- [ ] Actualizar solo los campos que vienen en el body
- [ ] Actualizar campo updatedAt automáticamente
- [ ] Retornar estudiante actualizado
- [ ] Probar todos los casos de prueba
- [ ] Desplegar a Render

---

## 🚀 PRIORIDAD

**MEDIA-ALTA** - Esta funcionalidad mejora la experiencia del usuario permitiendo corregir datos sin tener que registrarse de nuevo.

---

## 📞 ARCHIVOS RELACIONADOS

- `PARA-EL-BACKEND-URGENTE.md` - Campos originales del estudiante
- `BACKEND-CAMPOS-ADICIONALES.md` - Detalles de validaciones
- `src/hooks/useStudents.ts` - Hook con función updateStudent
- `src/components/students/StudentRegistrationForm.tsx` - Formulario que usa la actualización

---

¡El frontend ya está listo y esperando este endpoint! 🚀
