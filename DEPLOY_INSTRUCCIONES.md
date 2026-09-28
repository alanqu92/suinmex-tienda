# SUINMEX Tienda - Deploy en Railway (Paso a Paso)

## 🚀 Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.app
2. Click en **"+ New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Elige tu cuenta alanqu92
5. Busca y selecciona repo **`suinmex-tienda`**
6. Click **"Deploy"**

Railway detectará automáticamente `railway.json` ✅

## 🐘 Paso 2: Agregar PostgreSQL

1. En tu proyecto Railway (después del deploy)
2. Click **"+ Add"** o **"Add Service"**
3. Busca **"PostgreSQL"**
4. Selecciona **"PostgreSQL"**
5. Railway crea automáticamente la BD y genera `DATABASE_URL`

⏳ Espera a que esté en estado "Up"

## 🔧 Paso 3: Configurar Variables de Entorno

En Railway Project Settings → Variables:

Copia y pega EXACTAMENTE (ajusta los valores):

```
DATABASE_URL
(AUTO - generado por PostgreSQL, dejar como está)

JWT_SECRET
tu-clave-super-segura-123-aqui

MERCADOPAGO_ACCESS_TOKEN
APP_USR_XXXXXXXXXXXXXXXXXXXXX

NODE_ENV
production

ADMIN_EMAIL
admin@suinmex.com

ADMIN_PASSWORD
TuPassword123!

VITE_API_URL
https://suinmex-tienda-prod.up.railway.app
(o tu dominio final)

VITE_STORE_NAME
SUINMEX
```

⚠️ **IMPORTANTE**: 
- No usar valores por defecto en PROD
- `JWT_SECRET` cambiar a algo seguro
- `ADMIN_PASSWORD` cambiar después de login

## 🏃 Paso 4: Ejecutar Migraciones en Railway

Después de que deploy esté completo (estado "Up"):

1. En Railway, selecciona el servicio Node.js
2. Click en tab **"Terminal"** (icono >_)
3. Ejecuta:
   ```bash
   npm run migrate
   ```
4. Deberías ver:
   ```
   ✅ Schema created
   ✅ Admin user created: admin@suinmex.com
   ```

## 📦 Paso 5: Importar Productos (Opcional en Railway)

**Opción A: Local (Recomendado)**
```bash
# En tu máquina local
npm run import-csv C:\Users\Alan\Downloads\ProductosHora.csv

# Hacer backup de la BD
pg_dump suinmex > backup.sql

# Restaurar en Railway
(ver instrucciones de Railway CLI)
```

**Opción B: Directo en Railway**
1. Terminal en Railway
2. Descargar CSV a Railway (complejo, no recomendado)

## 🌐 Paso 6: Configurar Dominio (Opcional)

Si quieres usar `suinmex.com`:

1. En Railway → Deploy Settings → Custom Domain
2. Agregar `suinmex.com`
3. Apuntar DNS tu registrador a nameservers Railway
4. Actualizar `VITE_API_URL` a tu dominio

## ✅ Verificar Deploy

Después de todo:

1. Tienda: `https://suinmex-tienda-prod.up.railway.app` (o tu dominio)
2. Admin: `https://suinmex-tienda-prod.up.railway.app/admin` (ruta en tu frontend)
   - Email: `admin@suinmex.com`
   - Password: (la que pusiste en ADMIN_PASSWORD)

3. Probar:
   - Navegar catálogo
   - Crear cuenta
   - Agregar producto al carrito
   - Iniciar checkout (MercadoPago en sandbox)

## 🐛 Troubleshooting

**"Build failed"**
- Revisar logs en Railway
- Asegurar que `package.json` tiene todas las dependencias
- Intentar `npm install` localmente

**"Database connection error"**
- Verificar `DATABASE_URL` está en variables
- Ejecutar `npm run migrate` en Railway terminal

**"CORS error"**
- Backend necesita CORS habilitado (ya lo está en server.js)
- Verificar `VITE_API_URL` sea la URL correcta

**"MercadoPago no funciona"**
- Token de SANDBOX debe empezar con `APP_USR_`
- Usar tarjeta de prueba: `4111 1111 1111 1111`
- Nombre: `APRO` aprueba, `OTHE` rechaza

## 📱 URLs Finales

- Tienda pública: `https://suinmex-tienda-prod.up.railway.app`
- Admin panel: `https://suinmex-tienda-prod.up.railway.app:5174` o mismo dominio (depende de config)
- API: `https://suinmex-tienda-prod.up.railway.app/api`

## 🔒 Security Checklist

- [ ] JWT_SECRET es único y seguro
- [ ] ADMIN_PASSWORD cambiado tras primer login
- [ ] MercadoPago token es de SANDBOX (si es testing)
- [ ] DATABASE_URL tiene contraseña segura
- [ ] No commitear .env a GitHub
- [ ] CORS configurado correctamente

---

**¿Problemas?** 
Revisar logs en Railway → tu servicio → Logs tab
