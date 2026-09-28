# SUINMEX Tienda - Configuración en Railway

## Pasos para desplegar en Railway:

### 1. Preparar GitHub (si no existe repo remoto)

```bash
# En C:\Users\Alan\suinmex-tienda
git remote add origin https://github.com/TU_USER/suinmex-tienda.git
git branch -M main
git push -u origin main
```

### 2. En Railway (https://railway.app)

1. Click en **"+ New Project"**
2. Seleccionar **"Deploy from GitHub"**
3. Conectar tu cuenta GitHub y seleccionar repo `suinmex-tienda`
4. Railway detectará `railway.json` automáticamente

### 3. Agregar PostgreSQL

En el proyecto Railway:
1. Click en **"Add Service"**
2. Seleccionar **"Database"** → **"PostgreSQL"**
3. Railway crea automáticamente `DATABASE_URL` en env vars

### 4. Configurar Variables de Entorno

En Railway Project Settings → Variables:

```
DATABASE_URL = (auto-generado por PostgreSQL service)
JWT_SECRET = tu-secret-key-super-seguro-aqui
MERCADOPAGO_ACCESS_TOKEN = APP_USR_XXXXXXXXXXXXX
NODE_ENV = production
ADMIN_EMAIL = admin@suinmex.com
ADMIN_PASSWORD = tu-password-fuerte
VITE_API_URL = https://suinmex-tienda-prod.up.railway.app
```

### 5. Ejecutar Migraciones en Railway

Una vez deployado:

1. En Railway, ir al servicio Node.js
2. Abrir Terminal (icono >_)
3. Ejecutar:
   ```bash
   npm run migrate
   ```

### 6. Importar Productos (Opcional en Railway)

Si quieres importar el CSV en producción:

1. Subir `ProductosHora.csv` a un bucket (AWS S3, Railway Files, etc)
2. Modificar `import-csv.js` para descargar desde URL
3. O hacerlo localmente y backupear BD

**Recomendación**: Hacer import local, luego backup de BD, y restaurar en Railway.

### 7. Configurar Dominio

En Railway:
1. Deploy → Custom Domain
2. Agregar `suinmex.com` (o subdomain)
3. Apuntar DNS a Railway nameservers

## Variables de Entorno Producción

| Variable | Ejemplo | Notas |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...` | Auto-generado |
| `JWT_SECRET` | `MiSecretoSeguro123` | Cambiar en prod |
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR_...` | Token de producción |
| `NODE_ENV` | `production` | |
| `ADMIN_EMAIL` | `admin@suinmex.com` | |
| `ADMIN_PASSWORD` | `Abc123!Strong` | Cambiar después de login |
| `VITE_API_URL` | `https://suinmex.com` | Tu dominio final |

## Troubleshooting

### Build fails
- Revisar logs en Railway
- Asegurar que `package.json` tiene todas las dependencias
- Ejecutar `npm install` localmente para verificar

### Database connection error
- Verificar `DATABASE_URL` está en variables
- Ejecutar `npm run migrate` en Railway terminal

### MercadoPago no funciona
- Usar token de **sandbox** para testing
- Cambiar a **producción** cuando esté lista
- Configurar webhooks en MP dashboard

### Recibos no se generan
- Verificar BD tiene tabla `receipts`
- Ejecutar migrations nuevamente

## Resumen Deploy:

```
1. git push origin main → Railway detecta cambios
2. Railway corre npm install + npm start
3. Terminal en Railway: npm run migrate
4. Agregar dominio
5. ✅ Listo!
```

## URLs útiles:

- Dashboard: https://railway.app/account/projects
- Logs: Railway Project → Logs tab
- Postgres Admin: Railway Project → PostgreSQL → Connect
