# 🧪 TEST: Verificar qué devuelve GET /api/students/cedula/1728780766

## Prueba Manual

Abre tu navegador o Postman y haz esta petición:

```
GET https://cacpe-pastaza.onrender.com/api/students/cedula/1728780766
```

## Respuesta Esperada (CORRECTA)

```json
{
  "success": true,
  "data": {
    "id": "uuid-del-estudiante",
    "cedula": "1728780766",
    "nombre": "kevin",
    "apellido": "Catagña",
    "edad": 10,
    "genero": "femenino",
    "provincia": "Cotopaxi",
    "canton": "Pedro Moncayo",
    "nivelEducativo": "secundaria",
    "schoolId": "ae01ad82-5846-4b4a-aad6-d8e5e8e5e8e5",
    "otraEscuela": null,
    "completedTraining": false,
    "trainingCount": 0,
    "createdAt": "2026-03-05T...",
    "updatedAt": "2026-03-05T..."
  }
}
```

## Si NO devuelve todos los campos

Entonces el problema está en el backend y necesitas:
1. Verificar que Render haya redesplegado
2. Ver los logs en Render para errores
3. Verificar que la base de datos tenga los datos

## Si SÍ devuelve todos los campos

Entonces el problema está en el frontend:
1. El frontend NO está haciendo GET cuando el usuario ingresa la cédula
2. O el frontend está haciendo GET pero NO está usando los datos para autocompletar
3. O el frontend está sobrescribiendo los datos con valores vacíos

## Cómo verificar en el navegador

1. Abre el frontend: https://tu-frontend.vercel.app
2. Abre DevTools (F12)
3. Ve a la pestaña "Network"
4. Ingresa la cédula: 1728780766
5. Observa qué peticiones se hacen:
   - ✅ CORRECTO: Ves `GET /api/students/cedula/1728780766` → 200 OK
   - ❌ INCORRECTO: Ves `POST /api/students` → 409 Conflict
   - ❌ INCORRECTO: No ves ninguna petición

## Solución según el caso

### Caso A: Backend NO devuelve todos los campos
→ Redesplegar backend en Render

### Caso B: Frontend NO hace GET
→ Agregar lógica en el frontend para hacer GET cuando cedula.length === 10

### Caso C: Frontend hace GET pero NO autocompleta
→ Verificar que el frontend esté usando `data.data.genero`, `data.data.provincia`, etc.

### Caso D: Frontend autocompleta pero luego se borran los campos
→ Verificar que no haya un `reset()` o `setFormData({})` que borre los valores
