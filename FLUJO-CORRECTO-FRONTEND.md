# 🔄 FLUJO CORRECTO: Frontend debe usar GET primero, NO POST

## 📅 Fecha: Marzo 2026
## 🎯 Proyecto: CACPE Pastaza - Flujo de Autocompletado

---

## ⚠️ PROBLEMA DETECTADO

El frontend podría estar haciendo POST en lugar de GET cuando el usuario ingresa su cédula, lo que causa que:
1. Se intente crear un estudiante duplicado
2. El backend devuelva error 409
3. Los campos no se autocompleten correctamente

---

## ✅ FLUJO CORRECTO

### 1️⃣ Usuario ingresa cédula (10 dígitos)

```javascript
// Cuando el usuario termina de escribir la cédula
const cedula = "1728780766";

if (cedula.length === 10) {
  // ✅ HACER GET PRIMERO
  checkIfStudentExists(cedula);
}
```

### 2️⃣ Frontend hace GET (NO POST)

```javascript
const checkIfStudentExists = async (cedula) => {
  try {
    // ✅ CORRECTO: Usar GET
    const response = await fetch(`https://cacpe-pastaza.onrender.com/api/students/cedula/${cedula}`);
    
    if (response.ok) {
      // ✅ Estudiante existe - AUTOCOMPLETAR
      const data = await response.json();
      const student = data.data;
      
      // Autocompletar TODOS los campos
      setFormData({
        cedula: student.cedula,
        nombre: student.nombre,
        apellido: student.apellido,
        edad: student.edad,
        genero: student.genero,              // ✅ IMPORTANTE
        provincia: student.provincia,        // ✅ IMPORTANTE
        canton: student.canton,              // ✅ IMPORTANTE
        nivelEducativo: student.nivelEducativo, // ✅ IMPORTANTE
        schoolId: student.schoolId || 'otra',   // ✅ IMPORTANTE
        otraEscuela: student.otraEscuela     // ✅ IMPORTANTE
      });
      
      // Mostrar modal de bienvenida
      setShowWelcomeModal(true);
      setIsExistingStudent(true);
      
    } else if (response.status === 404) {
      // ✅ Estudiante NO existe - Dejar formulario vacío
      setIsExistingStudent(false);
      // No hacer nada, usuario puede llenar el formulario
    }
    
  } catch (error) {
    console.error('Error checking student:', error);
  }
};
```

### 3️⃣ Usuario hace cambios (opcional)

Si el estudiante existe, puede editar cualquier campo EXCEPTO la cédula.

### 4️⃣ Usuario hace clic en "Iniciar Capacitación"

```javascript
const handleSubmit = async () => {
  if (isExistingStudent) {
    // ✅ CORRECTO: Usar PUT para actualizar
    const response = await fetch(`https://cacpe-pastaza.onrender.com/api/students/cedula/${formData.cedula}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellido: formData.apellido,
        edad: formData.edad,
        genero: formData.genero,
        provincia: formData.provincia,
        canton: formData.canton,
        nivelEducativo: formData.nivelEducativo,
        schoolId: formData.schoolId,
        otraEscuela: formData.otraEscuela
      })
    });
    
    if (response.ok) {
      // Redirigir a capacitación
      navigate('/capacitacion');
    }
    
  } else {
    // ✅ CORRECTO: Usar POST para crear nuevo
    const response = await fetch('https://cacpe-pastaza.onrender.com/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Redirigir a capacitación
      navigate('/capacitacion');
    } else if (response.status === 409) {
      // Cédula duplicada (no debería pasar si usamos GET primero)
      alert('Esta cédula ya está registrada');
    }
  }
};
```

---

## ❌ FLUJO INCORRECTO (NO HACER)

```javascript
// ❌ MAL: Hacer POST directamente sin verificar primero
const handleSubmit = async () => {
  const response = await fetch('https://cacpe-pastaza.onrender.com/api/students', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  if (response.status === 409) {
    // ❌ Ya es tarde, el error ya ocurrió
    const data = await response.json();
    // Intentar usar existingStudent aquí es complicado
  }
};
```

---

## 🔑 PUNTOS CLAVE

1. **SIEMPRE usar GET primero** cuando el usuario ingresa la cédula
2. **NO hacer POST** hasta que el usuario haga clic en "Iniciar Capacitación"
3. **Usar PUT** si el estudiante ya existe (isExistingStudent = true)
4. **Usar POST** solo si el estudiante NO existe (isExistingStudent = false)
5. **Autocompletar TODOS los campos** cuando GET devuelve 200

---

## 🧪 PRUEBA

### Caso 1: Estudiante existente (cédula 1728780766)

1. Usuario escribe: `1728780766`
2. Frontend hace: `GET /api/students/cedula/1728780766`
3. Backend devuelve: 200 OK con TODOS los datos
4. Frontend autocompleta:
   - ✅ Nombre: kevin
   - ✅ Apellido: Catagña
   - ✅ Edad: 10
   - ✅ Género: femenino
   - ✅ Provincia: Cotopaxi
   - ✅ Cantón: Pedro Moncayo
   - ✅ Nivel Educativo: secundaria
   - ✅ Escuela: (la registrada)
5. Usuario hace cambios (opcional)
6. Usuario hace clic en "Iniciar Capacitación"
7. Frontend hace: `PUT /api/students/cedula/1728780766`
8. Backend actualiza y devuelve: 200 OK
9. Frontend redirige a `/capacitacion`

### Caso 2: Estudiante nuevo (cédula 9999999999)

1. Usuario escribe: `9999999999`
2. Frontend hace: `GET /api/students/cedula/9999999999`
3. Backend devuelve: 404 Not Found
4. Frontend deja formulario vacío
5. Usuario llena todos los campos
6. Usuario hace clic en "Iniciar Capacitación"
7. Frontend hace: `POST /api/students`
8. Backend crea y devuelve: 201 Created
9. Frontend redirige a `/capacitacion`

---

## 📞 ENDPOINTS DISPONIBLES

- `GET /api/students/cedula/:cedula` - Verificar si existe y obtener datos
- `POST /api/students` - Crear nuevo estudiante
- `PUT /api/students/cedula/:cedula` - Actualizar estudiante existente

---

¡El backend YA está listo! Solo falta que el frontend use el flujo correcto. 🚀
