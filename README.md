# SUINMEX Tienda - Equipos Industriales

Tienda online B2B/B2C para SUINMEX con Node.js/Express, PostgreSQL y MercadoPago.

## Características

- 📦 Catálogo de ~2,070 productos importados desde CSV
- 🏷️ Categorías y subcategorías con control de visibilidad
- 🛒 Carrito y checkout con MercadoPago
- 📝 Recibos automáticos (no factura CFDI)
- 👥 Autenticación B2B (RFC) + B2C
- 📊 Panel admin para gestionar productos, órdenes, categorías
- 🔄 Importador CSV con API + carga manual

## Setup Local

### 1. Base de datos

```bash
# Instalar PostgreSQL
# Crear BD
createdb suinmex

# Ejecutar schema
psql suinmex < backend/schema.sql
```

### 2. Configuración

```bash
cp .env.example .env
# Editar .env con tus datos
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Importar productos

```bash
# Asegurate que DATABASE_URL está correcto en .env
npm run import-csv C:\Users\Alan\Downloads\ProductosHora.csv
```

### 5. Correr en desarrollo

```bash
npm run dev
# Server en http://localhost:3000
```

## Panel Admin

**URL**: `http://localhost:3000/admin`

### Funciones:
- ✅ Crear/editar categorías
- ✅ Crear/editar subcategorías (toggle de visibilidad)
- ✅ Gestionar productos
- ✅ Ver órdenes
- ✅ Cambiar estado de órdenes

### Credenciales por defecto:
- Email: `admin@suinmex.com`
- Password: (revisar .env ADMIN_PASSWORD)

## API Endpoints

### Productos
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/:id` - Detalle producto
- `GET /api/products/search/:query` - Buscar
- `GET /api/categories` - Categorías con subcategorías visibles

### Órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders/:id` - Detalle orden
- `GET /api/orders/user/:userId` - Órdenes del usuario (auth requerida)

### Checkout
- `POST /api/checkout/create-preference` - Crear preference MercadoPago
- `POST /api/checkout/success` - Callback de pago exitoso

### Admin
- `GET /api/admin/categories` - Listar categorías (auth admin)
- `POST /api/admin/categories` - Crear categoría
- `PATCH /api/admin/categories/:id` - Editar categoría
- `PATCH /api/admin/subcategories/:id` - Editar subcategoría (incluye is_visible)
- `GET /api/admin/orders` - Listar órdenes
- `PATCH /api/admin/products/:id` - Editar producto

## Deploy en Railway

1. Conectar repo a Railway
2. Agregar variables de entorno:
   - `DATABASE_URL` (PostgreSQL en Railway)
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `VITE_API_URL=https://tudominio.com`

3. Railway detectará `railway.json` y desplegará automáticamente

## Estructura del Proyecto

```
suinmex-tienda/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Login/registro
│   │   ├── products.js      # Catálogo
│   │   ├── categories.js    # Categorías
│   │   ├── orders.js        # Órdenes
│   │   ├── checkout.js      # MercadoPago
│   │   └── admin.js         # Panel admin
│   ├── server.js            # Express app
│   ├── import-csv.js        # Script importador
│   └── schema.sql           # BD schema
├── frontend/                # React/Vue frontend (próximo)
├── admin/                   # Panel admin (próximo)
├── package.json
├── .env.example
└── railway.json
```

## Próximas fases

- [ ] Frontend tienda (React/Vite)
- [ ] Panel admin visual (Masterpanel adaptado)
- [ ] Cargas masivas vía API (multipart CSV)
- [ ] Reportes de ventas
- [ ] Factura electrónica (opcional)
- [ ] Integraciones con ERP externo

## Notas

- Los precios están en MXN
- Stock es manual (no hay gestión automática por sucursal)
- Las imágenes vienen como URLs (no se descargan)
- Recibos se generan automáticamente al pago confirmado
