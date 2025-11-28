# Sistema de Gestión de Calidad Pbex

Sistema web centralizado para digitalizar y optimizar los procesos de control de calidad y producción de **Plásticos Básicos de Exportación S.A.C.**, empresa manufacturera de plásticos con 35 años de experiencia.

## Integrantes - Grupo 1

- Quiñonez Rivera, Esteban
- Palomino Julián Alex Marcelo
- Arias Chumpitaz, Giovanni
- Layme Moya, Victor
- Espinoza Carlos, Diego Sebastian

## ✅ Estado actual del proyecto

- **Backend:** TypeScript + Express + Sequelize + PostgreSQL, listo para Node.js 18+
- **Frontend:** TypeScript + React + Vite + TailwindCSS con dashboards y módulos productivos
- **Autenticación:** JWT con sistema de roles y permisos completo
- **Base de Datos:** Scripts `init-db` y `seed` para inicializar tablas y datos de ejemplo
- **Despliegue:** Soporta 3 modos de despliegue (local, nube parcial, nube total)
- **TypeScript:** Configurado en backend y frontend con type-safety completo

## 🎯 Descripción

Este sistema reemplaza archivos dispersos (Word/Excel) por una plataforma unificada con trazabilidad completa, permitiendo:

- Registro digital de datos de producción y calidad
- Control de parámetros por turno
- Reporte de defectos y mermas
- Generación automática de certificados de calidad en PDF
- Dashboard con métricas en tiempo real
- Sistema de alertas automáticas
- Gestión de no conformidades
- Administración de usuarios y permisos

## 🏗️ Arquitectura

El proyecto sigue una arquitectura **MVC (Model-View-Controller)** con separación clara entre frontend y backend:

```
Pbex3/
├── client/          # Frontend (React + Vite + TailwindCSS)
└── server/          # Backend (Node.js + Express + Sequelize + PostgreSQL)
```

### Stack Tecnológico

**Backend:**

- Node.js v18+
- TypeScript 5.3+
- Express.js
- Sequelize (ORM)
- PostgreSQL 14+
- JWT (Autenticación)
- Puppeteer (Generación de PDFs)
- Nodemailer (Emails opcionales)
- Sharp (Procesamiento de imágenes)
- Express Rate Limit (Seguridad)

**Frontend:**

- React 18+
- TypeScript 5.3+
- Vite
- TailwindCSS
- React Router
- React Query
- Recharts (Gráficos)
- React Hook Form + Zod
- Axios (HTTP Client)
- React Hot Toast (Notificaciones)

## 👥 Roles de Usuario

1. **Asistente de Calidad**: Registro de datos, control de parámetros, reporte de defectos
2. **Supervisor/Administrador**: Dashboard, análisis, gestión de usuarios, aprobación de certificados
3. **Gerencia/Jefatura**: Visualización de reportes, análisis de indicadores, exportación de datos
4. **Visitante**: Consulta de catálogo de productos y fichas técnicas

## 📋 Módulos Principales

### 1. Módulo de Registro de Calidad

- Formulario digital para registro de datos de producción
- Validación automática de campos
- Registro de mermas por tipo de defecto
- Cálculo automático de porcentaje de mermas
- Registro de no conformidades

### 2. Módulo de Certificados

- Generación automática de certificados en PDF
- Almacenamiento en historial con código único
- Aprobación de certificados por supervisor
- Catálogo público de fichas técnicas

### 3. Módulo de Reportes y Dashboards

- Dashboard con métricas en tiempo real
- Gráficos de producción, mermas y cumplimiento
- Filtros por fecha, turno, producto y línea
- Exportación de reportes (preparado para Excel/PDF)

### 4. Módulo de Alertas

- Alertas automáticas cuando mermas superan límites
- Notificaciones por correo electrónico (opcional)
- Configuración de umbrales por producto
- Historial de eventos de alertas

### 5. Módulo de Administración

- CRUD de usuarios
- Asignación de roles y permisos
- Sistema de autenticación seguro
- Auditoría de acciones por usuario

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 14+ (local o en la nube)
- npm 9.0+
- TypeScript 5.3+ (se instala automáticamente con `npm install`)

### Instalación

1. **Clonar o copiar el proyecto**

2. **Instalar dependencias del backend:**

```bash
cd server
npm install
```

3. **Instalar dependencias del frontend:**

```bash
cd ../client
npm install
```

4. **Configurar variables de entorno:**

   Copia el archivo `.env.example` a `.env` en la carpeta `server/`:

```bash
cd ../server
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL (ver sección de configuración más abajo).

5. **Crear la base de datos manualmente (requerido):**

   Desde `psql` (local o remoto) crea la base indicada en `.env`. Ejemplo:

```sql
CREATE DATABASE pbex_quality_db;
```

> 📌 `npm run init-db` **no crea** la base de datos, solo sincroniza las tablas. Si usas un servicio administrado (Heroku, Railway, etc.) debes crear la base desde el panel del proveedor antes de continuar.

6. **Sincronizar tablas con Sequelize:**

```bash
npm run init-db
```

7. **Cargar datos de ejemplo (opcional):**

```bash
npm run seed
```

### Ejecución en Desarrollo

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

La aplicación estará disponible en:

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`

### Usuarios de Prueba

Si ejecutaste `npm run seed`, puedes usar estos usuarios:

- **admin** / **admin123** (Administrador)
- **supervisor** / **super123** (Supervisor)
- **asistente** / **asist123** (Asistente de Calidad)
- **gerencia** / **geren123** (Gerencia)

## ⚙️ Configuración

### Variables de Entorno

El archivo `.env` en `server/` debe contener (ver `server/env.example` para plantilla completa):

```env
# Modo de despliegue: 'local' o 'cloud'
DEPLOYMENT_MODE=local

# PostgreSQL Local
DB_HOST_LOCAL=localhost
DB_PORT_LOCAL=5432
DB_NAME_LOCAL=pbex_quality_db
DB_USER_LOCAL=postgres
DB_PASSWORD_LOCAL=tu_contraseña

# PostgreSQL Nube (si DEPLOYMENT_MODE=cloud)
DB_HOST_CLOUD=tu-servidor-postgresql.com
DB_PORT_CLOUD=5432
DB_NAME_CLOUD=pbex_quality_db
DB_USER_CLOUD=tu_usuario
DB_PASSWORD_CLOUD=tu_contraseña

# Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Email (Opcional - el sistema funciona sin esto)
MAIL_ENABLED=false
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_contraseña_app
MAIL_FROM=tu_email@gmail.com

# Puppeteer (PDFs)
PUPPETEER_EXECUTABLE_PATH=

# Alertas
ALERT_DEFAULT_THRESHOLD=5.0
```

> 📌 **Importante:** Copia `server/env.example` a `server/.env` y completa los valores según tu entorno.

### Alternar entre Local y Nube

Simplemente cambia `DEPLOYMENT_MODE` en el archivo `.env`:

- `DEPLOYMENT_MODE=local` → Usa configuración `DB_*_LOCAL`
- `DEPLOYMENT_MODE=cloud` → Usa configuración `DB_*_CLOUD`

## 📚 Documentación Adicional

Para instrucciones detalladas de despliegue, consulta:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de despliegue (local, nube parcial, nube total)

## 🔒 Seguridad

- Autenticación basada en JWT
- Encriptación de contraseñas con bcrypt
- Validación de permisos por rol en cada operación
- Rate limiting en endpoints críticos
- CORS configurado
- Headers de seguridad (Helmet)

## 📝 Scripts Disponibles

### Backend (`server/`)

```bash
npm install        # Instalar dependencias (incluye TypeScript)
npm run build      # Compilar TypeScript a JavaScript (genera dist/)
npm start          # Iniciar en producción (ejecuta dist/server.js)
npm run dev        # Iniciar en desarrollo con hot-reload (tsx watch server.ts)
npm run init-db    # Crear y sincronizar tablas (la base debe existir previamente)
npm run seed       # Poblar con datos de ejemplo (usuarios, productos, etc.)
npm run migrate    # Script de migración (preparado para futuras migraciones)
npm run type-check # Verificar tipos TypeScript sin compilar
```

### Frontend (`client/`)

```bash
npm install        # Instalar dependencias (incluye TypeScript)
npm run dev        # Iniciar servidor de desarrollo (Vite dev server)
npm run build      # Compilar TypeScript y construir para producción (genera dist/)
npm run preview    # Previsualizar build de producción localmente
npm run type-check # Verificar tipos TypeScript sin compilar
npm run lint       # Ejecutar linter (ESLint)
```

> 💡 **Nota:** En desarrollo, tanto el backend (`tsx watch`) como el frontend (Vite) compilan TypeScript automáticamente. Para producción, ejecuta `npm run build` en ambos antes de desplegar.

## 🗄️ Modelo de Datos

### Entidades Principales

- **Users**: Usuarios, roles, contraseñas encriptadas
- **Products**: Catálogo de productos con imágenes y especificaciones
- **ProductionRecords**: Registros de producción por turno y línea
- **QualityControls**: Controles de calidad por lote
- **Defects**: Tipos y cantidades de mermas/defectos
- **Certificates**: Certificados de calidad generados en PDF
- **Alerts**: Alertas automáticas cuando mermas superan umbrales
- **NonConformities**: No conformidades registradas y resueltas

### Relaciones

- Un **ProductionRecord** puede tener múltiples **QualityControls**
- Un **QualityControl** puede tener múltiples **Defects**
- Un **Certificate** está asociado a un **QualityControl** y un **Product**
- Las **Alerts** se generan automáticamente basadas en **Defects**

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Verifica que `DEPLOYMENT_MODE` esté configurado correctamente
4. Verifica que la base de datos exista

### Error al generar PDFs

- Puppeteer requiere Chromium. Si hay problemas, puedes especificar la ruta a Chrome instalado en `PUPPETEER_EXECUTABLE_PATH` en `.env`
- En producción (Heroku, Railway), puede ser necesario agregar buildpacks específicos para Puppeteer

### Error: "Cannot find module" en producción

- Asegúrate de haber ejecutado `npm run build` en el backend antes de `npm start`
- Verifica que el directorio `server/dist/` exista con los archivos compilados

## 📄 Licencia

© 2025 Plásticos Básicos de Exportación S.A.C. - Todos los derechos reservados.

**RUC:** 20101607233

## 📞 Contacto

- **Email:** ventas@pbex.com.pe
- **Teléfono:** (01) 357-6464 / (01) 362-5355
- **Dirección:** Av. Colectora Industrial 191, Santa Anita, Lima - Perú

---

**Versión:** 3.0.0  
**Última actualización:** Enero 2025  
**Stack:** Node.js 18+ | TypeScript 5.3+ | Express | Sequelize | PostgreSQL 14+ | React 18+ | Vite | TailwindCSS
