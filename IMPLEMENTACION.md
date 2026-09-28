# SUINMEX Tienda - Guía Completa de Implementación

## ✅ Proyecto Completado

**SUINMEX Tienda** es una solución e-commerce B2B/B2C completa con:
- Backend Node.js/Express + PostgreSQL
- Frontend tienda (React + Vite)
- Panel Admin (React + Vite)
- Integración MercadoPago
- 2,070 productos importados

---

## 📁 Estructura

```
suinmex-tienda/
├── backend/              # API Express
│   ├── routes/           # Auth, Products, Categories, Orders, Checkout, Admin
│   ├── server.js         # Express app
│   ├── schema.sql        # BD schema
│   ├── import-csv.js     # Importer de productos
│   └── migrate.js        # Migraciones
├── frontend/             # Tienda pública (React + Vite)
│   ├── src/
│   │   ├── pages/        # Home, ProductDetail, Cart, Checkout, Auth, Profile
│   │   ├── styles/       # CSS modular
│   │   ├── store.js      # Zustand store
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── admin/                # Panel admin (React + Vite)
│   ├── src/
│   │   ├── pages/        # Dashboard, Categories, Subcategories, Products, Orders, Login
│   │   ├── styles/
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── railway.json          # Config para Railway
├── RAILWAY_SETUP.md      # Instrucciones deploy
└── README.md             # Documentación
```

---

## 🚀 Instalación Local

### 1. Backend

```bash
cd C:\Users\Alan\suinmex-tienda

# Instalar dependencias
npm install

# Crear .env (copiar de .env.example)
# Editar con tus datos PostgreSQL, JWT_SECRET, MercadoPago token, etc

# Ejecutar migraciones (crea BD + usuario admin)
npm run migrate

# Importar productos
npm run import-csv C:\Users\Alan\Downloads\ProductosHora.csv

# Arrancar servidor
npm run dev
# API en http://localhost:3000
```

### 2. Frontend Tienda

```bash
cd frontend

npm install
npm run dev
# Tienda en http://localhost:5173
```

### 3. Admin Panel

```bash
cd ../admin

npm install
npm run dev
# Admin en http://localhost:5174
```

---

## 🔐 Credenciales por Defecto

**Admin Panel**
- Email: `admin@suinmex.com`
- Password: (ver `ADMIN_PASSWORD` en `.env` después de migrar)

**Cambiar en primer login** ⚠️

---

## 📊 Funcionalidades

### Tienda Pública (Frontend)
✅ Catálogo con búsqueda y filtros  
✅ Filtrar por categoría y subcategoría  
✅ Detalle de producto  
✅ Carrito persistente (localStorage)  
✅ Checkout con MercadoPago  
✅ Login/Registro (B2B con RFC)  
✅ Mi Cuenta con historial de órdenes  
✅ Responsive design  

### Panel Admin
✅ Dashboard con estadísticas  
✅ Gestión de categorías (crear, editar, eliminar)  
✅ **Gestión de subcategorías con toggle de visibilidad** ← Lo que pidieron  
✅ Gestión de productos (crear, editar, buscar)  
✅ Listado de órdenes con filtros por estado  
✅ Cambiar estado de órdenes  
✅ Control de acceso con JWT  

### Backend API
✅ Auth con JWT (30 días)  
✅ CRUD completo de productos/categorías/órdenes  
✅ Búsqueda y paginación  
✅ Integración MercadoPago  
✅ Generación automática de recibos  
✅ Importador de CSV  

---

## 🔧 Configuración MercadoPago

### Sandbox (Testing)

1. Crear cuenta en https://www.mercadopago.com.mx
2. Obtener **Access Token** de test
3. En `.env`:
   ```
   MERCADOPAGO_ACCESS_TOKEN=APP_USR_XXXXXXXXXXXXX
   ```

### Tarjetas de prueba Sandbox
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
```

Nombre: `APRO` = aprueba | `OTHE` = rechaza

---

## 🚢 Deploy en Railway

Ver [RAILWAY_SETUP.md](./RAILWAY_SETUP.md)

Pasos resumidos:
1. Conectar GitHub a Railway
2. Agregar PostgreSQL como servicio
3. Configurar variables de entorno
4. Push to main
5. Railway auto-deploya

---

## 📱 Funcionalidades Especiales

### Control de Subcategorías en Admin

En el panel admin, puedes:
1. Ir a **🏷️ Subcategorías**
2. Ver todas las subcategorías con su categoría padre
3. Hacer click en toggle `is_visible` para mostrar/ocultar en tienda
4. La tienda solo muestra subcategorías con `is_visible = true`

### Importador de CSV

```bash
npm run import-csv <ruta-al-csv>
```

Características:
- Importa automáticamente o actualiza productos existentes
- Extrae categorías del título (keywords)
- Asigna subcategorías por marca
- Maneja bien 2,070+ productos

---

## 🔄 API Endpoints

### Públicos
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/:id` - Detalle
- `GET /api/categories` - Categorías (solo visibles)
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Autenticados (JWT)
- `POST /api/orders` - Crear orden
- `GET /api/orders/:id` - Detalle orden
- `GET /api/orders/user/:userId` - Órdenes del usuario
- `POST /api/checkout/create-preference` - Preference MercadoPago

### Admin Only
- `GET /api/admin/categories` - Listar categorías (todas)
- `POST /api/admin/categories` - Crear categoría
- `PATCH /api/admin/categories/:id` - Editar categoría
- `GET /api/admin/subcategories` - Listar subcategorías
- `PATCH /api/admin/subcategories/:id` - Editar subcategoría ← Aquí se controla `is_visible`
- `GET /api/admin/products` - Listar productos (admin)
- `PATCH /api/admin/products/:id` - Editar producto
- `GET /api/admin/orders` - Listar órdenes (con filtros)

---

## 📝 Variables de Entorno

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/suinmex

# Server
PORT=3000
NODE_ENV=development|production
JWT_SECRET=tu-clave-segura-aqui

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR_XXXXXXXXXXXXX

# Admin
ADMIN_EMAIL=admin@suinmex.com
ADMIN_PASSWORD=tu-password-fuerte

# Frontend
VITE_API_URL=http://localhost:3000  # O tu URL de producción
VITE_STORE_NAME=SUINMEX
```

---

## 🛠️ Troubleshooting

**"Cannot find module"**  
→ `npm install` en la carpeta correspondiente

**"Database connection error"**  
→ Verificar `DATABASE_URL` en `.env`  
→ PostgreSQL debe estar corriendo

**"MercadoPago payment fails"**  
→ Verificar token en `.env`  
→ Usar token de sandbox para testing

**Admin no carga**  
→ Asegurar que el backend esté corriendo en puerto 3000  
→ Verificar CORS en `backend/server.js`

---

## 📞 Contacto

**WhatsApp**: 81 1044 1811  
**Email**: admin@suinmex.com

---

## 🎯 Próximos Pasos Opcionales

- [ ] Factura electrónica (CFDI)
- [ ] Integraciones con ERP externo
- [ ] Reportes de ventas avanzados
- [ ] SMS/Email notifications
- [ ] Descuentos y cupones
- [ ] Reviews y ratings
- [ ] Sistema de notificaciones en real-time
- [ ] Mobile app nativa

---

**Proyecto listo para producción ✅**
