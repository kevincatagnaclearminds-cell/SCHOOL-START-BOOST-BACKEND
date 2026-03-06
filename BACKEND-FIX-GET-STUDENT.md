# 🐛 BUG: GET /api/students/cedula/:cedula NO DEVUELVE TODOS LOS CAMPOS

## 📅 Fecha: Marzo 2026
## 🎯 Proyecto: CACPE Pastaza - Bug Crítico

---

## ⚠️ PROBLEMA URGENTE

El endpoint `GET /api/students/cedula/:cedula` NO está devolviendo todos los campos del estudiante. Solo devuelve:
- ✅ nombre
- ✅ apellido  
- ✅ edad
- ❌ genero (FALTA)
- ❌ provincia (FALTA)
- ❌ canton (FALTA)
- ❌ nivelEducativo (FALTA)
- ❌ schoolId (FALTA)
- ❌ otraEscuela (FALTA)

---

## 🔍 EVIDENCIA

Cuando un estudiante ingresa su cédula registrada, el frontend recibe una respuesta incompleta del backend. Los campos de género, provincia, cantón, nivel educativo y escuela NO se están devolviendo.

**Respuesta Actual (INCORRECTA)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cedula": "1728780766",
    "nombre": "kevin",
    "apellido": "Catagña",
    "edad": 10
    // ❌ FALTAN: genero, provincia, canton, nivelEducativo, schoolId, otraEscuela
  }
}
```

**Respuesta Esperada (CORRECTA)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cedula": "1728780766",
    "nombre": "kevin",
    "apellido": "Catagña",
    "edad": 10,
    "genero": "masculino",
    "provincia": "Pastaza",
    "canton": "Puyo",
    "nivelEducativo": "primaria",
    "schoolId": "uuid-escuela",
    "otraEscuela": null,
    "completedTraining": false,
    "trainingCount": 0,
    "createdAt": "2026-03-05T10:00:00.000Z",
    "updatedAt": "2026-03-05T10:00:00.000Z"
  }
}
```

---

## 💻 SOLUCIÓN

### Revisar el endpoint GET /api/students/cedula/:cedula

El problema está en que el backend NO está incluyendo todos los campos en la respuesta. Probablemente el código se ve así:

**CÓDIGO INCORRECTO** ❌:
```javascript
router.get('/students/cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { cedula },
      select: {
        id: true,
        cedula: true,
        nombre: true,
        apellido: true,
        edad: true
        // ❌ FALTAN LOS DEMÁS CAMPOS
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Estudiante no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
});
```

**CÓDIGO CORRECTO** ✅:
```javascript
router.get('/students/cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Validar que la cédula tenga 10 dígitos
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        error: "Cédula inválida. Debe tener exactamente 10 dígitos"
      });
    }
    
    const student = await prisma.student.findUnique({
      where: { cedula }
      // ✅ NO usar select, devolver TODOS los campos
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Estudiante no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
});
```

---

## 🔑 PUNTOS CLAVE

1. **NO usar `select`** - Cuando usas `select` en Prisma, solo devuelve los campos especificados
2. **Devolver el objeto completo** - `prisma.student.findUnique({ where: { cedula } })` devuelve TODOS los campos
3. **Validar la cédula** - Asegurarse de que tenga 10 dígitos antes de buscar

---

## 🧪 PRUEBA

```bash
GET https://cacpe-pastaza.onrender.com/api/students/cedula/1728780766

Respuesta esperada:
{
  "success": true,
  "data": {
    "id": "...",
    "cedula": "1728780766",
    "nombre": "kevin",
    "apellido": "Catagña",
    "edad": 10,
    "genero": "masculino",        // ✅ DEBE APARECER
    "provincia": "Pastaza",        // ✅ DEBE APARECER
    "canton": "Puyo",              // ✅ DEBE APARECER
    "nivelEducativo": "primaria",  // ✅ DEBE APARECER
    "schoolId": "...",             // ✅ DEBE APARECER
    "otraEscuela": null,           // ✅ DEBE APARECER
    "completedTraining": false,
    "trainingCount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## ⚡ IMPACTO

**CRÍTICO** - Sin estos campos, el formulario no puede autocompletar correctamente y los usuarios registrados no pueden ver sus datos completos.

---

## ✅ CHECKLIST

- [ ] Revisar endpoint GET /api/students/cedula/:cedula
- [ ] Eliminar `select` si existe
- [ ] Asegurar que devuelve TODOS los campos del modelo Student
- [ ] Probar con cédula 1728780766
- [ ] Verificar que devuelve: genero, provincia, canton, nivelEducativo, schoolId, otraEscuela
- [ ] Desplegar a Render

---

## 📞 NOTA

Este es un bug crítico que impide que el autocompletado funcione correctamente. El frontend está esperando TODOS los campos pero el backend solo envía algunos.

---

¡Por favor corregir URGENTEMENTE! 🚨
