# 🚀 Guía de Deploy en Render

## Paso 1: Subir código a GitHub

```bash
git init
git add .
git commit -m "Backend CAPTE Pastaza"
git branch -M main
git remote add origin TU_REPOSITORIO_GITHUB
git push -u origin main
```

## Paso 2: Configurar en Render

1. Ve a https://dashboard.render.com
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name:** capte-backend
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

## Paso 3: Variables de Entorno

En la sección "Environment" de Render, agrega:

**DATABASE_URL**
```
postgresql://neondb_owner:npg_Nb5Ggy0njqwr@ep-aged-union-ai48qym3-pooler.c-4.us-east-1.aws.neon.tech/CAPTE-Pastaza?sslmode=require
```

**NODE_ENV**
```
production
```

## Paso 4: Deploy

Click en "Create Web Service" y espera a que termine el deploy.

Tu API estará disponible en: `https://capte-backend.onrender.com/api`

## Errores Comunes

### Error: "Cannot find module"
- Asegúrate de que `postinstall` esté en package.json
- Verifica que el Build Command incluya `npx prisma generate`

### Error: "Port already in use"
- Render asigna el puerto automáticamente vía `process.env.PORT`
- Ya está configurado en src/index.ts

### Error de conexión a base de datos
- Verifica que DATABASE_URL esté correctamente configurada en Environment
- Asegúrate de usar la URL de Neon con `?sslmode=require`
