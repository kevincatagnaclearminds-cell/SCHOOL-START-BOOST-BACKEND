# Backend API - CAPTE Pastaza Global Money Week

## 📋 Descripción General

Backend API REST para el sistema de capacitación financiera de CAPTE Pastaza. Gestiona el registro de escuelas, estudiantes y el ranking de participación.

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL (Neon)
- **Validación**: Zod
- **CORS**: cors
- **Variables de entorno**: dotenv

## 📦 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── schoolController.ts
│   │   ├── studentController.ts
│   │   └── rankingController.ts
│   ├── routes/
│   │   ├── schoolRoutes.ts
│   │   ├── studentRoutes.ts
│   │   └── rankingRoutes.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validateRequest.ts
│   ├── schemas/
│   │   ├── schoolSchema.ts
│   │   └── studentSchema.ts
│   ├── utils/
│   │   └── prisma.ts
│   └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🗄️ Schema de Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model School {
  id           String    @id @default(uuid())
  codigoAmie   String    @unique @map("codigo_amie")
  nombre       String
  totalAlumnos Int       @map("total_alumnos")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  students     Student[]

  @@map("schools")
}

model Student {
  id        String   @id @default(uuid())
  cedula    String   @unique
  nombre    String
  apellido  String
  edad      Int
  schoolId  String   @map("school_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  school    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@map("students")
}
```

## 🔌 Endpoints API

### Base URL
```
http://localhost:3000/api
```

---

### 🏫 Escuelas (Schools)

#### 1. Crear Escuela
```http
POST /api/schools
```

**Request Body:**
```json
{
  "codigoAmie": "AMIE-12345",
  "nombre": "Escuela Fiscal Simón Bolívar",
  "totalAlumnos": 450
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "codigoAmie": "AMIE-12345",
    "nombre": "Escuela Fiscal Simón Bolívar",
    "totalAlumnos": 450,
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `409`: Código AMIE ya existe

---

#### 2. Obtener Todas las Escuelas
```http
GET /api/schools
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "codigoAmie": "AMIE-12345",
      "nombre": "Escuela Fiscal Simón Bolívar",
      "totalAlumnos": 450,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

---

#### 3. Obtener Escuela por ID
```http
GET /api/schools/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "codigoAmie": "AMIE-12345",
    "nombre": "Escuela Fiscal Simón Bolívar",
    "totalAlumnos": 450,
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z",
    "_count": {
      "students": 120
    }
  }
}
```

**Errores:**
- `404`: Escuela no encontrada

---

### 👨‍🎓 Estudiantes (Students)

#### 4. Crear Estudiante
```http
POST /api/students
```

**Request Body:**
```json
{
  "cedula": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 15,
  "schoolId": "uuid-school-here"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "cedula": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 15,
    "schoolId": "uuid-school-here",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `404`: Escuela no encontrada
- `409`: Cédula ya registrada

---

#### 5. Obtener Todos los Estudiantes
```http
GET /api/students
```

**Query Parameters (opcionales):**
- `schoolId`: Filtrar por escuela

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "cedula": "1234567890",
      "nombre": "Juan",
      "apellido": "Pérez",
      "edad": 15,
      "schoolId": "uuid-school-here",
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z",
      "school": {
        "id": "uuid-school-here",
        "nombre": "Escuela Fiscal Simón Bolívar"
      }
    }
  ]
}
```

---

#### 6. Obtener Estudiante por Cédula
```http
GET /api/students/cedula/:cedula
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "cedula": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 15,
    "schoolId": "uuid-school-here",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "school": {
      "nombre": "Escuela Fiscal Simón Bolívar"
    }
  }
}
```

**Errores:**
- `404`: Estudiante no encontrado

---

### 🏆 Ranking

#### 7. Obtener Ranking de Escuelas
```http
GET /api/ranking
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "school": {
        "id": "uuid-here",
        "codigoAmie": "AMIE-12345",
        "nombre": "Escuela Fiscal Simón Bolívar",
        "totalAlumnos": 450
      },
      "capacitados": 380,
      "percentage": 84.44
    },
    {
      "position": 2,
      "school": {
        "id": "uuid-here-2",
        "codigoAmie": "AMIE-67890",
        "nombre": "Colegio San Francisco",
        "totalAlumnos": 320
      },
      "capacitados": 250,
      "percentage": 78.13
    }
  ]
}
```

---

## 📝 Instalación y Configuración

### 1. Crear el proyecto

```bash
mkdir capte-backend
cd capte-backend
npm init -y
```

### 2. Instalar dependencias

```bash
npm install express prisma @prisma/client cors dotenv zod
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
```

### 3. Configurar TypeScript

```bash
npx tsc --init
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 4. Configurar Prisma

```bash
npx prisma init
```

### 5. Variables de Entorno

**.env.example:**
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
PORT=3000
NODE_ENV=development
```

**.env:**
```env
# Obtén tu URL de conexión desde Neon.tech
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/capte_db?sslmode=require"
PORT=3000
NODE_ENV=development
```

### 6. Scripts en package.json

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push"
  }
}
```

---

## 🚀 Pasos para Iniciar

### 1. Configurar Base de Datos en Neon

1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto llamado "capte-pastaza"
4. Copia la connection string
5. Pégala en tu archivo `.env`

### 2. Ejecutar Migraciones

```bash
npx prisma migrate dev --name init
```

### 3. Generar Cliente Prisma

```bash
npx prisma generate
```

### 4. Iniciar Servidor

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

---

## 🧪 Testing con cURL

### Crear una escuela:
```bash
curl -X POST http://localhost:3000/api/schools \
  -H "Content-Type: application/json" \
  -d '{
    "codigoAmie": "AMIE-12345",
    "nombre": "Escuela Fiscal Simón Bolívar",
    "totalAlumnos": 450
  }'
```

### Crear un estudiante:
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 15,
    "schoolId": "uuid-de-la-escuela"
  }'
```

### Ver ranking:
```bash
curl http://localhost:3000/api/ranking
```

---

## 📊 Validaciones

### Escuela:
- `codigoAmie`: String, obligatorio, máximo 50 caracteres, único
- `nombre`: String, obligatorio, máximo 200 caracteres
- `totalAlumnos`: Número entero, mínimo 1, máximo 10000

### Estudiante:
- `cedula`: String, obligatorio, 10 dígitos, único
- `nombre`: String, obligatorio, máximo 100 caracteres
- `apellido`: String, obligatorio, máximo 100 caracteres
- `edad`: Número entero, mínimo 5, máximo 25
- `schoolId`: UUID válido, debe existir en la base de datos

---

## 🔒 Seguridad

- CORS configurado para permitir solo el dominio del frontend
- Validación de datos con Zod
- Sanitización de inputs
- Manejo de errores centralizado
- Rate limiting (opcional, recomendado para producción)

---

## 📦 Deployment

### Opciones recomendadas:
1. **Railway.app** (Fácil, gratis)
2. **Render.com** (Gratis con limitaciones)
3. **Vercel** (Serverless)
4. **Heroku** (Pago)

### Variables de entorno en producción:
```env
DATABASE_URL=tu-url-de-neon
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.com
```

---

## 📚 Recursos Adicionales

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Express.js](https://expressjs.com/)
- [Zod Validation](https://zod.dev/)

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Verifica que tu IP esté en la whitelist de Neon
- Revisa que la connection string sea correcta

### Error: "Unique constraint failed"
- El código AMIE o cédula ya existe en la base de datos

### Error: "Foreign key constraint failed"
- El schoolId proporcionado no existe

---

## 📞 Contacto

Para dudas o soporte: CAPTE Pastaza - Global Money Week
