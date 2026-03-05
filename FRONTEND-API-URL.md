# 🚀 Backend Desplegado - Actualizar URL en Frontend

## ✅ Backend en Producción

El backend ya está desplegado y funcionando en Render.

**URL de Producción:** `https://cacpe-pastaza.onrender.com/api`

---

## 📝 Cambios Necesarios en el Frontend

### Opción 1: Si usan archivo `.env`

Busca el archivo `.env` o `.env.production` en la raíz del proyecto frontend y actualiza:

```env
VITE_API_URL=https://cacpe-pastaza.onrender.com/api
```

O si usan React (Create React App):
```env
REACT_APP_API_URL=https://cacpe-pastaza.onrender.com/api
```

O si usan Next.js:
```env
NEXT_PUBLIC_API_URL=https://cacpe-pastaza.onrender.com/api
```

---

### Opción 2: Si tienen un archivo de configuración

Busca archivos como `config.js`, `constants.js`, o `api.js` y actualiza:

```javascript
// Antes
const API_URL = 'http://localhost:3001/api';

// Después
const API_URL = 'https://cacpe-pastaza.onrender.com/api';
```

---

### Opción 3: Si hacen fetch/axios directamente

Busca en el código donde hacen las peticiones y reemplaza:

```javascript
// Antes
fetch('http://localhost:3001/api/schools')

// Después
fetch('https://cacpe-pastaza.onrender.com/api/schools')
```

---

## 🔍 Dónde Buscar

Busca en estos archivos (usa Ctrl+F o Cmd+F):

1. `.env`
2. `.env.production`
3. `src/config.js`
4. `src/constants.js`
5. `src/api/index.js`
6. `src/services/api.js`
7. Cualquier archivo donde veas `localhost:3001`

**Busca el texto:** `localhost:3001`

**Reemplaza por:** `https://cacpe-pastaza.onrender.com`

---

## 📌 Endpoints Disponibles

Todos los endpoints siguen igual, solo cambia la URL base:

- ✅ `POST https://cacpe-pastaza.onrender.com/api/schools`
- ✅ `GET https://cacpe-pastaza.onrender.com/api/schools`
- ✅ `GET https://cacpe-pastaza.onrender.com/api/schools/:id`
- ✅ `POST https://cacpe-pastaza.onrender.com/api/students`
- ✅ `GET https://cacpe-pastaza.onrender.com/api/students`
- ✅ `GET https://cacpe-pastaza.onrender.com/api/students/cedula/:cedula`
- ✅ `GET https://cacpe-pastaza.onrender.com/api/ranking`

---

## 🧪 Probar que Funciona

Abre en el navegador:
```
https://cacpe-pastaza.onrender.com/api/schools
```

Deberías ver:
```json
{
  "success": true,
  "data": [...]
}
```

---

## ⚠️ Importante

### Primera Petición Lenta
La primera petición puede tardar 30-50 segundos porque Render pone el servicio en "sleep" después de inactividad. Las siguientes peticiones serán rápidas.

### CORS
El backend ya tiene CORS habilitado, no deberían tener problemas de CORS.

### HTTPS
La URL usa HTTPS (seguro), asegúrense de usar `https://` y no `http://`

---

## 🐛 Si hay Problemas

1. **Error de CORS:** Avísame para agregar el dominio del frontend a la whitelist
2. **Error 500:** El backend tiene un problema, revisa los logs en Render
3. **Timeout:** La primera petición tarda, espera 50 segundos

---

## 📞 Contacto

Si tienen dudas o problemas, avísenme.

¡El backend está listo para producción! 🎉
