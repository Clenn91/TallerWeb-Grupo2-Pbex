# Guía de Despliegue - Sistema de Gestión de Calidad Pbex

Esta guía detalla cómo desplegar el sistema en diferentes escenarios: local, nube parcial (solo BD) y nube total.

---

## ✅ Estado Actual del Proyecto

- **Backend:** TypeScript + Express + Sequelize + PostgreSQL, listo para Node.js 18+
- **Frontend:** TypeScript + React + Vite + TailwindCSS con dashboards y módulos productivos
- **Autenticación:** JWT con roles y permisos (Asistente, Supervisor, Administrador, Gerencia, Visitante)
- **Base de Datos:** Scripts `init-db` y `seed` para inicializar tablas y datos de ejemplo
- **Despliegue:** Soporta 3 modos: local completo, local con BD en nube, y todo en nube
- **TypeScript:** Configurado en backend y frontend con type-safety completo
- **Scripts:** `init-db`, `seed`, `migrate` (preparado), `build`, `dev`, `type-check`

---

## 📋 Tabla de Contenidos

1. [Despliegue Local Completo](#1-despliegue-local-completo)
2. [Despliegue con Base de Datos en la Nube](#2-despliegue-con-base-de-datos-en-la-nube)
3. [Despliegue Total en la Nube](#3-despliegue-total-en-la-nube)
4. [Configuración de Producción](#4-configuración-de-producción)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Despliegue Local Completo

### Requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo localmente
- npm 9.0+
- TypeScript 5.3+ (se instala automáticamente con `npm install`)

### Pasos

#### 1.1. Instalar PostgreSQL Local

**Windows:**

1. Descarga PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Ejecuta el instalador y sigue las instrucciones
3. Anota la contraseña del usuario `postgres` que configures

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**

```bash
brew install postgresql@14
brew services start postgresql@14
```

#### 1.2. Crear Base de Datos

Conéctate a PostgreSQL:

```bash
# Windows (desde cmd o PowerShell)
psql -U postgres

# Linux/macOS
sudo -u postgres psql
```

Crea la base de datos:

```sql
CREATE DATABASE pbex_quality_db;
\q
```

#### 1.3. Configurar Variables de Entorno

En `server/.env`:

```env
DEPLOYMENT_MODE=local

DB_HOST_LOCAL=localhost
DB_PORT_LOCAL=5432
DB_NAME_LOCAL=pbex_quality_db
DB_USER_LOCAL=postgres
DB_PASSWORD_LOCAL=tu_contraseña_postgres

NODE_ENV=development
PORT=3000
API_PREFIX=/api

JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=24h

MAIL_ENABLED=false
```

#### 1.4. Instalar Dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

#### 1.5. Inicializar Base de Datos

```bash
cd server
npm run init-db
npm run seed  # Poblar base de datos.
```

> ℹ️ **Recuerda:** El script `init-db` solo sincroniza modelos (tablas). Asegúrate de haber creado la base de datos `pbex_quality_db` (o la que definas en `.env`) antes de ejecutarlo.

#### 1.6. Ejecutar Aplicación

**Terminal 1 - Backend:**

```bash
cd server
npm run dev  # Usa tsx watch para hot-reload de TypeScript
```

> 💡 **Nota TypeScript:** El comando `npm run dev` usa `tsx watch` que compila y ejecuta TypeScript en tiempo real. Para producción, primero ejecuta `npm run build` y luego `npm start`.

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev  # Vite compila TypeScript automáticamente
```

> 💡 **Nota TypeScript:** Vite compila TypeScript automáticamente en desarrollo. Para producción, ejecuta `npm run build` que primero verifica tipos y luego construye.

#### 1.7. Verificar

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/health`

---

## 2. Despliegue con Base de Datos en la Nube

En este escenario, el backend y frontend corren localmente, pero la base de datos está en un servicio en la nube (como AWS RDS, Heroku Postgres, Railway, etc.).

### 2.1. Crear Base de Datos en la Nube

**Opciones populares:**

- **Heroku Postgres**: [heroku.com/postgres](https://www.heroku.com/postgres)
- **Railway**: [railway.app](https://railway.app)
- **Supabase**: [supabase.com](https://supabase.com)
- **AWS RDS**: [aws.amazon.com/rds](https://aws.amazon.com/rds)
- **DigitalOcean**: [digitalocean.com/products/managed-databases](https://www.digitalocean.com/products/managed-databases)

**Ejemplo con Heroku Postgres:**

1. Crea una cuenta en Heroku
2. Crea una nueva app
3. Agrega el addon "Heroku Postgres"
4. Obtén las credenciales desde el dashboard de Heroku

### 2.2. Configurar Variables de Entorno

En `server/.env`:

```env
DEPLOYMENT_MODE=cloud

# Configuración Local (no se usa en este modo)
DB_HOST_LOCAL=localhost
DB_PORT_LOCAL=5432
DB_NAME_LOCAL=pbex_quality_db
DB_USER_LOCAL=postgres
DB_PASSWORD_LOCAL=tu_contraseña

# Configuración Nube (usada cuando DEPLOYMENT_MODE=cloud)
DB_HOST_CLOUD=tu-host-postgresql.com
DB_PORT_CLOUD=5432
DB_NAME_CLOUD=tu_base_de_datos
DB_USER_CLOUD=tu_usuario
DB_PASSWORD_CLOUD=tu_contraseña

NODE_ENV=development
PORT=3000
API_PREFIX=/api

JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

MAIL_ENABLED=false
```

### 2.3. Inicializar Base de Datos Remota

```bash
cd server
npm run init-db
npm run seed  # Opcional
```

> 📌 **Nota:** Aunque la base esté en la nube, debe existir antes de correr `init-db`. Usualmente la creas desde el panel del proveedor (Heroku Postgres, Railway, etc.).

### 2.4. Ejecutar Aplicación

Igual que en el despliegue local:

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

### 2.5. Verificar Conexión

Al iniciar el servidor, deberías ver:

```
✓ Conexión a PostgreSQL establecida correctamente (modo: cloud)
  Host: tu-host-postgresql.com:5432
  Database: tu_base_de_datos
```

---

## 3. Despliegue Total en la Nube

En este escenario, tanto el backend, frontend como la base de datos están en la nube.

### 3.1. Opciones de Hosting

**Backend + Frontend:**

- **Heroku**: Fácil de usar, soporta Node.js
- **Railway**: Moderno, fácil configuración
- **Vercel**: Excelente para frontend React
- **AWS EC2/Elastic Beanstalk**: Más control, más configuración
- **DigitalOcean App Platform**: Simple y escalable
- **Render**: Alternativa moderna a Heroku

**Base de Datos:**

- Mismas opciones que en la sección 2.1

### 3.2. Despliegue en Heroku (Ejemplo)

#### 3.2.1. Preparar el Proyecto

**Crear `Procfile` en la raíz del proyecto:**

```
web: cd server && npm start
```

**Crear `package.json` en la raíz (opcional, para scripts globales):**

```json
{
  "name": "pbex3",
  "version": "1.0.0",
  "scripts": {
    "postinstall": "cd server && npm install && cd ../client && npm install && npm run build",
    "start": "cd server && npm start"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Modificar `server/app.ts` para servir archivos estáticos del frontend:**

Agrega antes de `app.use(notFound)` en `server/app.ts`:

```typescript
// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}
```

> 📌 **Nota:** Asegúrate de que el frontend esté compilado (`cd client && npm run build`) antes de desplegar.

#### 3.2.2. Instalar Heroku CLI

```bash
# Windows (con Chocolatey)
choco install heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 3.2.3. Login y Crear App

```bash
heroku login
heroku create pbex-quality-system
```

#### 3.2.4. Agregar Base de Datos

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

#### 3.2.5. Configurar Variables de Entorno

```bash
heroku config:set DEPLOYMENT_MODE=cloud
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_jwt_secret_super_seguro_produccion
heroku config:set JWT_EXPIRES_IN=24h
heroku config:set PORT=3000
heroku config:set API_PREFIX=/api

# Las credenciales de PostgreSQL se configuran automáticamente
# pero puedes verlas con:
heroku config
```

**Nota:** Heroku Postgres automáticamente crea variables `DATABASE_URL`. El sistema actual usa `DB_*_CLOUD` para la configuración. Si prefieres usar `DATABASE_URL`, necesitarías modificar `server/config/database.ts` para parsear la URL. Por ahora, configura manualmente:

```bash
heroku config:set DB_HOST_CLOUD=tu-host
heroku config:set DB_PORT_CLOUD=5432
heroku config:set DB_NAME_CLOUD=tu-db
heroku config:set DB_USER_CLOUD=tu-usuario
heroku config:set DB_PASSWORD_CLOUD=tu-password
```

#### 3.2.6. Desplegar

```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### 3.2.7. Compilar y Desplegar

```bash
# Compilar TypeScript del backend
cd server
npm run build

# Compilar frontend
cd ../client
npm run build

# Volver a la raíz y hacer commit
cd ..
git add .
git commit -m "Build para producción"
git push heroku main
```

#### 3.2.8. Inicializar Base de Datos

```bash
heroku run npm run init-db --prefix server
heroku run npm run seed --prefix server  # Opcional
```

> ℹ️ Heroku crea la instancia PostgreSQL, pero `npm run init-db` solo genera/actualiza las tablas del proyecto; no recrea la base. Verifica que el addon esté aprovisionado y accesible antes de este paso.

#### 3.2.9. Abrir Aplicación

```bash
heroku open
```

> 💡 **Nota TypeScript:** En producción, Heroku ejecutará `npm start` que usa el código compilado de `dist/`. Asegúrate de que el build se ejecute correctamente durante el despliegue.

### 3.3. Despliegue en Railway (Alternativa)

Railway es más simple y moderno:

1. Conecta tu repositorio GitHub a Railway
2. Railway detecta automáticamente Node.js
3. Agrega un servicio PostgreSQL
4. Configura las variables de entorno en el dashboard
5. Railway despliega automáticamente

### 3.4. Despliegue en Vercel (Solo Frontend) + Backend Separado

**Frontend en Vercel:**

1. Conecta tu repositorio
2. Configura:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Agrega variable de entorno: `VITE_API_URL=https://tu-backend.com/api`

> 📌 **Nota:** Vercel detecta automáticamente Vite/React. Asegúrate de configurar la variable `VITE_API_URL` para que el frontend se conecte al backend.

**Backend en Railway/Heroku:**

Sigue los pasos de la sección 3.2 o 3.3.

---

## 4. Configuración de Producción

### 4.1. Variables de Entorno Críticas

```env
NODE_ENV=production
DEPLOYMENT_MODE=cloud

# JWT - DEBE SER DIFERENTE EN PRODUCCIÓN
JWT_SECRET=genera_un_secret_super_largo_y_aleatorio_aqui
JWT_EXPIRES_IN=24h

# Email (si lo usas)
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_contraseña_app
MAIL_FROM=tu_email@gmail.com
```

### 4.2. Seguridad

- ✅ Cambia `JWT_SECRET` por uno fuerte y aleatorio
- ✅ Usa HTTPS en producción
- ✅ Configura CORS correctamente (`FRONTEND_URL` en `.env`)
- ✅ Habilita rate limiting
- ✅ Revisa logs regularmente

### 4.3. Optimizaciones

- **Backend**: Usa `NODE_ENV=production` para optimizaciones
- **Frontend**: El build de Vite ya está optimizado
- **Base de Datos**: Configura índices apropiados (ya incluidos en los modelos)
- **CDN**: Considera usar un CDN para archivos estáticos

### 4.4. Monitoreo

Considera agregar:

- **Sentry** para tracking de errores
- **LogRocket** para sesiones de usuario
- **New Relic** para performance

---

## 5. Troubleshooting

### Error: "Cannot connect to database"

**Causas comunes:**

1. PostgreSQL no está corriendo
2. Credenciales incorrectas
3. Firewall bloqueando conexión
4. `DEPLOYMENT_MODE` incorrecto

**Solución:**

- Verifica que PostgreSQL esté corriendo: `pg_isready` o `psql -U postgres`
- Verifica credenciales en `.env`
- Verifica que `DEPLOYMENT_MODE` coincida con la configuración que estás usando

### Error: "Port already in use"

**Solución:**

```bash
# Cambia el puerto en .env
PORT=3001

# O mata el proceso que usa el puerto
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill
```

### Error al generar PDFs

**Solución:**

- Puppeteer requiere Chromium. En producción, puede necesitar dependencias del sistema.
- En Heroku, agrega el buildpack: `heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack`

### Error: "Module not found"

**Solución:**

```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
```

### Base de datos no se crea automáticamente

**Solución:**

- Crea la base de datos manualmente antes de ejecutar `init-db`
- El script `init-db` solo sincroniza tablas, no crea la base de datos
- En servicios administrados (Heroku, Railway), la base se crea automáticamente al agregar el servicio PostgreSQL

### Error: "Cannot find module" en producción

**Solución:**

- Asegúrate de haber ejecutado `npm run build` antes de `npm start`
- Verifica que el directorio `dist/` exista y contenga los archivos compilados
- En Heroku, el build se ejecuta automáticamente si tienes un `package.json` en la raíz con script `postinstall`

---

## 📞 Soporte

Si encuentras problemas, verifica:

1. Los logs del servidor (`console.log` en desarrollo)
2. Los logs de PostgreSQL
3. Las variables de entorno están correctas
4. La versión de Node.js es 18+

---

**Última actualización:** Enero 2025  
**Versión del Proyecto:** 3.0.0  
**Stack:** Node.js 18+ | TypeScript 5.3+ | Express | Sequelize | PostgreSQL 14+ | React 18+ | Vite
