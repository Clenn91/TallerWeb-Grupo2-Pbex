# Permisos y Funcionalidades por Rol

Este documento detalla qué puede hacer cada rol en el Sistema de Gestión de Calidad Pbex.

---

## 📋 Roles del Sistema

1. **Asistente de Calidad** (`asistente_calidad`)
2. **Supervisor** (`supervisor`)
3. **Administrador** (`administrador`)
4. **Gerencia** (`gerencia`)
5. **Visitante** (`visitante`)

---

## 👤 1. Asistente de Calidad

### ✅ **Puede Hacer:**

#### 📝 Registro de Calidad

- ✅ Crear registros de producción
  - Ingresar datos de producción (peso, diámetro, medidas)
  - Registrar número de lote, fecha, turno, línea de producción
  - Registrar total producido, aprobado y rechazado
- ✅ Crear controles de calidad
  - Registrar medidas físicas (peso, diámetro, altura, ancho)
  - Registrar defectos por tipo (mancha, rebaba, incompleto, etc.)
  - El sistema calcula automáticamente el porcentaje de merma

#### 📄 Certificados

- ✅ Solicitar certificados de calidad
- ✅ Ver todos los certificados (propios y de otros)
- ❌ **NO puede** aprobar ni rechazar certificados

#### ⚠️ No Conformidades

- ✅ Crear reportes de no conformidades
- ✅ Ver todas las no conformidades
- ❌ **NO puede** resolver ni cambiar el estado de no conformidades

#### 📦 Productos

- ✅ Ver catálogo de productos
- ✅ Ver fichas técnicas
- ❌ **NO puede** crear, editar ni eliminar productos

### ❌ **NO Puede Hacer:**

- ❌ Ver Dashboard (métricas y estadísticas)
- ❌ Ver Alertas
- ❌ Gestionar usuarios
- ❌ Aprobar/rechazar certificados
- ❌ Resolver alertas

### 📍 **Menú Visible:**

- Registro de Calidad
- Certificados
- No Conformidades
- Productos

---

## 👔 2. Supervisor

### ✅ **Puede Hacer:**

#### 📊 Dashboard

- ✅ Ver métricas en tiempo real
- ✅ Ver gráficos de producción, mermas y cumplimiento
- ✅ Aplicar filtros por fecha, turno, producto y línea
- ✅ Ver tendencias de producción
- ✅ Ver estadísticas de defectos por tipo

#### 📝 Registro de Calidad

- ✅ **Todo lo que puede el Asistente** (crear registros y controles)
- ✅ Ver todos los registros de producción
- ✅ Ver todos los controles de calidad

#### 📄 Certificados

- ✅ Solicitar certificados
- ✅ **Aprobar certificados** (genera PDF automáticamente)
- ✅ **Rechazar certificados** (con motivo)
- ✅ Ver todos los certificados

#### 🚨 Alertas

- ✅ Ver todas las alertas activas
- ✅ **Resolver alertas** (con notas de resolución)
- ✅ **Descartar alertas**
- ✅ Ver historial de alertas

#### ⚠️ No Conformidades

- ✅ Crear reportes de no conformidades
- ✅ **Resolver no conformidades** (con acción correctiva)
- ✅ **Cambiar estado** de no conformidades
- ✅ Ver todas las no conformidades

#### 👥 Usuarios

- ✅ Ver lista de usuarios
- ✅ Ver detalles de usuarios
- ❌ **NO puede** crear, editar ni eliminar usuarios

#### 📦 Productos

- ✅ Ver catálogo de productos
- ❌ **NO puede** crear, editar ni eliminar productos

### ❌ **NO Puede Hacer:**

- ❌ Gestionar usuarios (crear, editar, eliminar)
- ❌ Gestionar productos (crear, editar, eliminar)

### 📍 **Menú Visible:**

- Dashboard
- Registro de Calidad
- Certificados
- Alertas
- No Conformidades
- Productos
- Usuarios (solo lectura)

---

## 🔐 3. Administrador

### ✅ **Puede Hacer:**

#### 🔧 **TODO lo que puede el Supervisor** +

- ✅ **Gestión completa de usuarios**
  - Crear nuevos usuarios
  - Editar usuarios existentes
  - Eliminar/desactivar usuarios
  - Cambiar contraseñas de usuarios
  - Asignar roles
- ✅ **Gestión completa de productos**
  - Crear productos
  - Editar productos
  - Eliminar/desactivar productos
  - Configurar umbrales de alerta por producto

#### 📊 Dashboard

- ✅ Todas las funcionalidades del supervisor

#### 📝 Registro de Calidad

- ✅ Todas las funcionalidades del supervisor

#### 📄 Certificados

- ✅ Todas las funcionalidades del supervisor

#### 🚨 Alertas

- ✅ Todas las funcionalidades del supervisor

#### ⚠️ No Conformidades

- ✅ Todas las funcionalidades del supervisor

### 📍 **Menú Visible:**

- Dashboard
- Registro de Calidad
- Certificados
- Alertas
- No Conformidades
- Productos (con opciones de edición)
- Usuarios (con opciones de gestión completa)

---

## 💼 4. Gerencia

### ✅ **Puede Hacer:**

#### 📊 Dashboard

- ✅ Ver métricas en tiempo real
- ✅ Ver gráficos de producción, mermas y cumplimiento
- ✅ Aplicar filtros por fecha, turno, producto y línea
- ✅ Ver tendencias de producción
- ✅ Ver estadísticas de defectos por tipo
- ✅ Exportar reportes (preparado para implementar)

#### 📄 Certificados

- ✅ Ver todos los certificados
- ✅ Descargar certificados aprobados
- ❌ **NO puede** solicitar, aprobar ni rechazar certificados

#### 🚨 Alertas

- ✅ Ver todas las alertas
- ✅ Ver historial de alertas
- ❌ **NO puede** resolver ni descartar alertas

#### 📦 Productos

- ✅ Ver catálogo de productos
- ✅ Ver fichas técnicas
- ❌ **NO puede** crear, editar ni eliminar productos

### ❌ **NO Puede Hacer:**

- ❌ Registrar producción o controles de calidad
- ❌ Gestionar usuarios
- ❌ Gestionar productos
- ❌ Aprobar/rechazar certificados
- ❌ Resolver alertas o no conformidades

### 📍 **Menú Visible:**

- Dashboard
- Certificados
- Alertas
- Productos

**Nota:** El rol de Gerencia está diseñado para **visualización y análisis**, no para operaciones diarias.

---

## 👁️ 5. Visitante

### ✅ **Puede Hacer:**

#### 📦 Productos

- ✅ Ver catálogo público de productos
- ✅ Ver fichas técnicas
- ✅ Ver especificaciones de productos

### ❌ **NO Puede Hacer:**

- ❌ Acceder al sistema interno (requiere login)
- ❌ Ver cualquier otra funcionalidad

### 📍 **Acceso:**

- Solo puede acceder a la página pública de productos (`/products`)
- No tiene acceso al sistema interno
- No requiere autenticación para ver productos públicos

---

## 📊 Resumen Comparativo

| Funcionalidad                     | Asistente | Supervisor | Administrador | Gerencia | Visitante    |
| --------------------------------- | --------- | ---------- | ------------- | -------- | ------------ |
| **Dashboard**                     | ❌        | ✅         | ✅            | ✅       | ❌           |
| **Registro de Producción**        | ✅        | ✅         | ✅            | ❌       | ❌           |
| **Control de Calidad**            | ✅        | ✅         | ✅            | ❌       | ❌           |
| **Solicitar Certificados**        | ✅        | ✅         | ✅            | ❌       | ❌           |
| **Aprobar/Rechazar Certificados** | ❌        | ✅         | ✅            | ❌       | ❌           |
| **Ver Certificados**              | ✅        | ✅         | ✅            | ✅       | ❌           |
| **Ver Alertas**                   | ❌        | ✅         | ✅            | ✅       | ❌           |
| **Resolver Alertas**              | ❌        | ✅         | ✅            | ❌       | ❌           |
| **Crear No Conformidades**        | ✅        | ✅         | ✅            | ❌       | ❌           |
| **Resolver No Conformidades**     | ❌        | ✅         | ✅            | ❌       | ❌           |
| **Gestionar Usuarios**            | ❌        | 👁️ Ver     | ✅            | ❌       | ❌           |
| **Gestionar Productos**           | ❌        | ❌         | ✅            | ❌       | ❌           |
| **Ver Productos**                 | ✅        | ✅         | ✅            | ✅       | ✅ (público) |

**Leyenda:**

- ✅ = Puede hacerlo
- ❌ = No puede hacerlo
- 👁️ = Solo lectura

---

## 🔑 Notas Importantes

1. **Herencia de Permisos**: Los roles superiores heredan los permisos de los roles inferiores.

   - Administrador > Supervisor > Asistente
   - Gerencia tiene permisos de solo lectura/consulta

2. **Seguridad**: Todos los permisos están validados tanto en el frontend (menú visible) como en el backend (middleware de autorización).

3. **Auditoría**: Todas las acciones quedan registradas con el usuario que las realizó (campos `userId`, `requestedBy`, `approvedBy`, etc.).

4. **Alertas Automáticas**: El sistema genera alertas automáticamente cuando las mermas superan los umbrales configurados, independientemente del rol.

---

**Última actualización:** Enero 2025
