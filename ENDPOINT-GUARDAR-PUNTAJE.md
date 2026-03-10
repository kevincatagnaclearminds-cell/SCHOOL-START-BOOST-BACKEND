# Endpoint para Guardar Puntaje

## Cambios Implementados

### Rutas Simplificadas
- ✅ Cambiado de `/api/students/cedula/:cedula` a `/api/students/:cedula`
- ✅ Ahora coincide con lo que el frontend espera

## Flujo Correcto

### 1. Buscar Estudiante por Cédula
```
GET /api/students/:cedula
```

**Ejemplo:**
```
GET https://cacpe-pastaza.onrender.com/api/students/1728760765
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-estudiante",
    "cedula": "1728760765",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 25,
    "puntaje": null,
    "completedTraining": false,
    ...
  }
}
```

### 2. Guardar Puntaje
```
POST /api/students/:id/complete-training
```

**Body:**
```json
{
  "score": 9,
  "profile": "Emprendedor"
}
```

**IMPORTANTE:**
- `score` debe ser un número entero entre 0 y 10
- `profile` es obligatorio (string)

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "isFirstTime": true,
    "trainingCount": 1,
    "score": 9,
    "profile": "Emprendedor",
    "completed": false
  }
}
```

## Lógica de Completado

- `completed: true` solo si `score >= 100`
- Como el score máximo es 10, actualmente NUNCA se marca como completado
- **REVISAR:** ¿El puntaje debería ser de 0-100 en lugar de 0-10?

## Estado del Deploy

El cambio de rutas ya está en GitHub y Render está haciendo el deploy automáticamente.
Espera 2-3 minutos desde el push para que el cambio esté activo.

## Verificar que el Deploy Terminó

Prueba este endpoint:
```
GET https://cacpe-pastaza.onrender.com/api/students/1728760765
```

Si devuelve 404, el deploy aún no terminó o la cédula no existe en la BD.
Si devuelve 200 con datos, el deploy está listo.
