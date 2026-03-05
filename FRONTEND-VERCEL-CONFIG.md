# 🔧 Solución Error 404 al Recargar en Vercel

## Problema
Cuando recargas la página en una ruta como `/registro-escuela`, sale error 404 NOT_FOUND.

## Solución

Crear un archivo `vercel.json` en la raíz del proyecto frontend:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Explicación

Este archivo le dice a Vercel que todas las rutas deben servir el `index.html`, permitiendo que el router del frontend (Vue Router, React Router, etc.) maneje las rutas.

## Pasos

1. Crear archivo `vercel.json` en la raíz del proyecto
2. Copiar el contenido de arriba
3. Hacer commit y push
4. Vercel hará redeploy automáticamente
5. Probar recargando la página en cualquier ruta

## Alternativa para otros servicios

### Netlify
Crear archivo `_redirects` en la carpeta `public/`:
```
/*    /index.html   200
```

### Firebase Hosting
En `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

Con esto, el error 404 al recargar desaparecerá. ✅
