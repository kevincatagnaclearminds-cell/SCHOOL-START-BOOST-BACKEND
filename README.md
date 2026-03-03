# CAPTE Pastaza Backend API

Backend para el sistema de capacitación financiera Global Money Week.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos
```bash
npx prisma generate
npx prisma db push
```

### 3. Iniciar servidor
```bash
npm run dev
```

El servidor estará en `http://localhost:3000`

## 📌 Endpoints

- `POST /api/schools` - Crear escuela
- `GET /api/schools` - Listar escuelas
- `GET /api/schools/:id` - Obtener escuela por ID
- `POST /api/students` - Crear estudiante
- `GET /api/students` - Listar estudiantes
- `GET /api/students/cedula/:cedula` - Buscar estudiante por cédula
- `GET /api/ranking` - Obtener ranking de escuelas

Ver `BACKEND-SPEC.md` para documentación completa.
