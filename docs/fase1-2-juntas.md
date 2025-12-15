# FASE 1: Autenticación y Multi-Tenancy - Decisiones Finales

## 📊 Resumen Ejecutivo

**Duración estimada:** 8-12 semanas calendario (2-3 meses con 20h/semana)  
**Roles implementados:** 5 (Owner, Admin, Secretary, Instructor, Student)  
**Prioridad:** CRÍTICA - Esta fase es la fundación de todo el sistema

---

## 1.1 DATABASE SCHEMA IMPLEMENTATION

### ✅ MANTENER

#### Users, Owners, Schools, Locations Tables

**Decisión:** Implementar jerarquía completa desde el inicio  
**Términos:**

- Owners pueden tener múltiples Schools
- Schools pueden tener múltiples Locations (opcional)
- Cada School pertenece a 1 Owner
  **Justificación:** Necesario para multi-tenancy básico

#### Memberships Table (N:N)

**Decisión:** Tabla de relaciones User ↔ School ↔ Role  
**Términos:**

- Un user puede tener múltiples memberships (diferentes schools, diferentes roles)
- Unique constraint: (user_id, owner_id, school_id, location_id, role)
- Permite co-ownership y staff compartido
  **Justificación:** Flexibilidad para academias con múltiples sedes

#### Audit Logs Table - COMPLETA

**Decisión:** Implementar audit logging robusto desde día 1  
**Términos:**

- Loguear TODAS las acciones críticas:
  - Login/logout (success y failure)
  - CRUD de students, instructors, vehicles, classes
  - Cambios de roles y memberships
  - Registros de pagos
  - Cambios de configuración (precios, políticas)
  - Todas las acciones de Secretary específicamente
- Campos: `id, actor_user_id, owner_id, school_id, location_id, action, entity_type, entity_id, metadata_json, ip_address, user_agent, created_at`
- Append-only: NO se puede editar/borrar via aplicación
- Con UI básica para Owners (filtros + export CSV)
  **Justificación:**
- Cliente necesita accountability ("¿quién hizo qué?")
- Previene disputas internas
- Debugging de problemas
- Cumplimiento básico de auditoría
  **Tiempo:** 1.5 semanas (incluye UI básica)

#### RLS Policies - Versión Sólida

**Decisión:** Implementar RLS completas con testing exhaustivo  
**Términos:**

- Todas las tablas con datos de tenant incluyen: owner_id, school_id, location_id
- Policies validan acceso via JOIN con memberships usando auth.uid()
- Separar policies por operación: SELECT, INSERT, UPDATE, DELETE
- Testing obligatorio de cada policy con 5 roles
  **Justificación:** "Bug de RLS aniquila el negocio" - data isolation es crítica
  **Tiempo:** 2-3 semanas (no apurar esto)

#### Performance Indexes

**Decisión:** Agregar indexes desde el inicio  
**Términos:**

- Composite indexes en: (owner_id, school_id, location_id)
- Index en memberships: (user_id, school_id, role)
- Index en audit_log: (owner_id, school_id, created_at DESC)
- Indexes en foreign keys para JOINs rápidos
  **Justificación:** Prevenir problemas de performance después

#### Soft Delete Patterns

**Decisión:** Implementar deleted_at en tablas críticas  
**Términos:**

- Entidades con soft delete: users, students, instructors, vehicles, classes, memberships
- Nunca hard delete de datos históricos
- Queries siempre filtran WHERE deleted_at IS NULL
  **Justificación:** Preservar integridad de datos históricos

---

## 1.2 SUPABASE AUTH INTEGRATION

### ✅ MANTENER

#### Email/Password Authentication

**Decisión:** Auth básico de Supabase  
**Términos:**

- Email + password como método principal
- Email verification obligatoria antes de acceso
- Password policy básico (8+ chars, 1 número, 1 mayúscula)
  **Justificación:** Suficiente para MVP, no over-engineer

#### JWT con Custom Claims Básicos

**Decisión:** Agregar claims mínimos necesarios  
**Términos:**

- Claims incluidos: user_id, owner_id, active_scope {school_id, location_id}
- Backend SIEMPRE valida permisos contra DB (no confiar solo en token)
  **Justificación:** Balance entre performance y seguridad

#### Password Reset y Email Verification

**Decisión:** Flows estándar de Supabase  
**Términos:**

- Reset via email con token de 1 hora
- Verificación obligatoria antes de primer login
  **Justificación:** Built-in de Supabase, funciona bien

#### Error Handling

**Decisión:** Mensajes de error user-friendly  
**Términos:**

- No exponer detalles técnicos al user
- Loguear errores detallados en backend
- Mensajes en español (Argentina)
  **Justificación:** UX + seguridad

### ❌ POSPONER

#### Rate Limiting Avanzado

**Decisión:** Usar rate limiting básico de Supabase  
**Términos:** Implementar custom rate limiting solo si hay abuso detectado  
**Cuándo agregar:** Si detectan intentos de brute force en producción  
**Tiempo ahorrado:** 3-5 días

---

## 1.3 ROLE-BASED ACCESS CONTROL (RBAC)

### ✅ MANTENER

#### 5 Roles (no 6)

**Decisión:** Owner, Admin, Secretary, Instructor, Student  
**Términos:**

**OWNER (Rol más alto)**

- Acceso completo a todas las Schools bajo su owner_id
- Puede crear/editar/borrar: Schools, Locations, Staff, Students
- Puede asignar roles (Owner, Admin, Secretary, Instructor)
- Acceso a reportes financieros completos
- Puede cambiar configuración global (precios, políticas)

**ADMIN/CO-OWNER**

- Full CRUD dentro de su(s) School(s) asignada(s)
- Puede crear/editar/borrar: Staff, Students, Classes
- Puede asignar roles dentro de su School (Admin, Secretary, Instructor)
- Acceso a reportes financieros de su School
- Puede cambiar configuración de su School

**SECRETARY (Nuevo - Crítico)**

- PUEDE:
  - CRUD de Students (crear, editar, ver, NO borrar)
  - Agendar/cancelar Classes
  - Registrar Payments manualmente
  - Ver schedule de Instructors
  - Ver reportes básicos de ocupación
- NO PUEDE:
  - Borrar Instructors o Vehicles
  - Cambiar precios de paquetes
  - Ver reportes financieros (revenue, profit margins)
  - Cambiar roles de usuarios
  - Modificar configuración de la School
    **Justificación:** Tu amigo tiene secretarias que necesitan acceso limitado desde día 1

**INSTRUCTOR**

- Ver su propio schedule
- Marcar asistencia de Students en sus Classes
- Ver información de sus Students asignados
- NO puede: acceder a finanzas, crear/editar resources, ver otros Instructors

**STUDENT**

- Ver sus propias Classes (pasadas y futuras)
- Ver su balance de créditos
- Cancelar sus Classes (según política)
- Ver su historial de Payments
- Editar su perfil básico

**Justificación:** 5 roles cubren todos los casos de uso reales

### ❌ ELIMINADO

#### Superadmin

**Decisión:** NO implementar rol Superadmin  
**Términos:**

- Ustedes (SaaS admins) tienen acceso directo a Supabase
- Pueden hacer queries SQL cuando necesiten
- Pueden ver métricas en Vercel/Supabase dashboards
  **Cuándo agregar:** Cuando tengan 50+ academias y necesiten delegar soporte  
  **Tiempo ahorrado:** 1-2 semanas

### ✅ MANTENER

#### Authorization Middleware

**Decisión:** Validación de permisos en cada request  
**Términos:**

- Middleware verifica: user autenticado + tiene permiso para la acción + scope correcto
- NUNCA confiar solo en JWT claims, siempre verificar contra memberships table
  **Justificación:** Seguridad en profundidad

#### Role-based UI Components

**Decisión:** Componentes que se muestran/ocultan según rol  
**Términos:**

- Botones de "Delete" solo visibles para Owner/Admin
- Menú de "Financial Reports" solo para Owner/Admin
- Validación en backend SIEMPRE, UI es solo UX
  **Justificación:** Mejor UX + menos confusión

#### Permission Checking Utilities

**Decisión:** Helper functions para verificar permisos  
**Términos:**

```typescript
// Ejemplos de funciones:
canDeleteStudent(user, student);
canEditPrice(user, package);
canViewFinancialReports(user, school);
canAssignRoles(user, targetUser);
```

**Justificación:** Código más limpio y mantenible

#### Role Assignment Interface

**Decisión:** UI para Owner/Admin asignar roles  
**Términos:**

- Solo Owner puede crear otros Owners
- Admin puede crear Secretary/Instructor dentro de su School
- Validación de que user tiene permiso para asignar ese rol
  **Justificación:** Necesario para operación del sistema

---

## 1.4 MULTI-TENANT DATA SCOPING

### ✅ MANTENER

#### Tenant Scoping en Queries

**Decisión:** Todas las queries filtran por owner_id + school_id  
**Términos:**

- Backend deriva scope de active_scope en JWT
- Queries siempre incluyen WHERE owner_id = X AND school_id = Y
- RLS valida que user tiene acceso a ese scope
  **Justificación:** Data isolation + performance

#### School Selection UI

**Decisión:** UI para users con múltiples Schools seleccionar activa  
**Términos:**

- Dropdown persistente en navbar con lista de Schools
- Al cambiar School, actualizar active_scope en sesión
- Recargar datos con nuevo scope
  **Justificación:** Tu amigo tiene 2 sedes, necesita switch entre ellas

#### Context-based Filtering

**Decisión:** Todos los componentes respetan active_scope  
**Términos:**

- React Context con schoolId actual
- Componentes leen del Context automáticamente
- No permitir bypass del Context
  **Justificación:** Consistencia en toda la app

#### Test Data Isolation - CRÍTICO

**Decisión:** Testing exhaustivo de que tenants no ven data de otros  
**Términos:**

- Test suite con 3 owners diferentes
- Verificar que Owner A NO puede ver students de Owner B
- Verificar que Admin de School 1 NO puede ver classes de School 2
- Test con TODOS los 5 roles
  **Justificación:** "Bug aquí aniquila el negocio"

#### Active Scope Management

**Decisión:** Sistema para trackear y cambiar School activo  
**Términos:**

- Server-side session mantiene active_scope
- Cliente puede cambiar via API endpoint
- Logs en audit_log cuando user cambia scope
  **Justificación:** Operación básica necesaria

### ❌ POSPONER (pero diseñar para futuro)

#### Cross-School Resource Sharing

**Decisión:** NO implementar ahora, pero preparar schema  
**Términos actuales (MVP):**

- Instructors/Vehicles pertenecen a 1 School solamente
- Si instructor trabaja en 2 sedes → duplicar el instructor temporalmente
- Schema permite agregar resource_assignments table después sin re-escribir
  **Términos futuros:**
- Tabla resource_assignments (resource_id, school_id, location_id)
- Conflict detection cross-school
- Permission handling cross-school
  **Cuándo agregar:**
- Cuando 3+ academias pidan esta feature
- O cuando duplicar resources se vuelva inmanejable
  **Tiempo ahorrado ahora:** 2-3 semanas  
  **Diseño preventivo:**

```sql
-- Schema actual:
instructors {
  id UUID,
  school_id UUID,  -- Por ahora, 1 school
  name TEXT,
  ...
}

-- Futuro (sin re-escribir):
resource_assignments {
  id UUID,
  resource_type TEXT, -- 'instructor' | 'vehicle'
  resource_id UUID,
  school_id UUID,
  location_id UUID
}

-- Migración: crear assignments desde school_id existente
INSERT INTO resource_assignments
SELECT gen_random_uuid(), 'instructor', id, school_id, null
FROM instructors;
```

---

## 1.5 AUTHENTICATION UI COMPONENTS

### ✅ MANTENER

#### Login Page

**Decisión:** Página de login estándar  
**Términos:**

- Email + password
- Link a "Olvidé mi contraseña"
- Mensajes de error claros en español
- Responsive (mobile-first)
  **Justificación:** Necesidad básica

#### School Selection Interface

**Decisión:** Modal/dropdown para elegir School después de login  
**Términos:**

- Mostrar solo si user tiene acceso a 2+ Schools
- Display: nombre de School + ubicación (si aplica)
- Botón para cambiar School en navbar después
  **Justificación:** Tu amigo tiene 2 sedes

#### Password Reset

**Decisión:** Flow estándar de reset  
**Términos:**

- Ingresar email → recibir link
- Link válido por 1 hora
- Crear nueva password
  **Justificación:** Requirement básico

#### Responsive Layouts

**Decisión:** Mobile-first design  
**Términos:**

- Funcional en mobile (mayoría de instructors/students usan celular)
- Optimizado para desktop (admin tasks)
- Tailwind CSS + shadcn/ui
  **Justificación:** UX moderna esperada

### ❌ POSPONER

#### Auto-registro de Usuarios

**Decisión:** Solo staff crea usuarios manualmente  
**Términos actuales:**

- Owner/Admin/Secretary van a "Agregar Usuario"
- Llenan: nombre, email, rol
- Sistema envía email de invitación
- User crea su contraseña
  **Términos futuros:**
- Landing page pública con pricing
- Estudiantes se registran y compran paquetes
- Auto-aprobación después de pago
  **Cuándo agregar:** Post-MVP (Fase 5) cuando necesiten escalar adquisición  
  **Tiempo ahorrado ahora:** 2 semanas  
  **Justificación:** Tu preferencia es creación manual por staff

---

## 1.6 SESSION MANAGEMENT

### ✅ MANTENER

#### Session Básico de Supabase

**Decisión:** Usar defaults de Supabase Auth  
**Términos:**

- Access token expira en 1 hora
- Refresh token válido por 7 días
- Renovación automática cuando access token expira
  **Justificación:** "No es problema que sesión dure 1 hora después de cambiar rol"

#### User Blocking Functionality

**Decisión:** Agregar capacidad de bloquear usuarios  
**Términos:**

- Campo `blocked_at` y `blocked_reason` en users table
- Middleware verifica en cada request
- Si user está bloqueado → logout forzado + mensaje
- Solo Owner puede bloquear/desbloquear
- Log en audit_log cuando se bloquea usuario
  **Justificación:** Necesitan poder "echar" a alguien del sistema inmediatamente  
  **Implementación:**

```sql
ALTER TABLE users ADD COLUMN blocked_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN blocked_reason TEXT;

-- Middleware:
if (user.blocked_at !== null) {
  return 401 "Cuenta bloqueada. Contactar administrador."
}
```

### ❌ POSPONER

#### Session Invalidation Automática al Cambiar Rol

**Decisión:** No invalidar sesiones automáticamente  
**Términos:**

- Si cambias rol de un user, su sesión sigue válida hasta expirar
- Backend SIEMPRE valida permisos contra DB, no contra token
- Si user intenta acción que su nuevo rol no permite → error inmediato
  **Cuándo agregar:** Si se convierte en problema real de seguridad  
  **Tiempo ahorrado:** 1-2 semanas  
  **Justificación:** "No es problema" según respuesta #23

#### Multi-device Session Management Avanzado

**Decisión:** No implementar lista de sesiones activas  
**Términos:**

- Users pueden estar logueados en múltiples dispositivos
- No hay UI para ver "dónde estoy logueado"
- No hay botón de "cerrar otras sesiones"
  **Cuándo agregar:** Si users piden esta feature  
  **Tiempo ahorrado:** 1 semana

---

## 1.7 AUDIT LOGGING SYSTEM

### ✅ MANTENER - COMPLETO

#### Eventos a Loguear (TODOS)

**Decisión:** Logging comprehensivo desde día 1  
**Términos - Eventos obligatorios:**

**Autenticación:**

- Login exitoso (user_id, ip, user_agent, timestamp)
- Login fallido (email, ip, reason)
- Logout
- Password reset solicitado
- Password reset completado
- Email verification

**Usuarios y Roles:**

- User creado (quién lo creó, rol asignado)
- Rol cambiado (before, after, quién lo cambió)
- Membership agregada/removida
- User bloqueado/desbloqueado

**Operaciones de Datos:**

- Student: created, updated, (intentos de) deleted
- Instructor: created, updated, deleted
- Vehicle: created, updated, deleted
- Class: created, updated, cancelled, completed
- Payment: registered, updated, refunded

**Configuración:**

- Precio de paquete cambiado (before, after)
- Política de cancelación modificada
- Buffer entre clases modificado
- Settings de School modificados

**Acciones de Secretary (extra tracking):**

- Toda acción de Secretary se loguea con flag especial
- Permite accountability si hay problemas

**Justificación:**

- Cliente dijo "SÍ quiero saber quién hizo cada acción"
- "Owners deben poder verlo para no preguntarme"
- Previene disputas internas
- Debugging más fácil

#### Schema de Audit Log

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contexto
  actor_user_id UUID REFERENCES users(id),
  owner_id UUID REFERENCES owners(id),
  school_id UUID REFERENCES schools(id),
  location_id UUID REFERENCES locations(id),

  -- Acción
  action TEXT NOT NULL, -- 'login', 'create_student', 'delete_class', etc.
  entity_type TEXT, -- 'student', 'class', 'payment', 'user', etc.
  entity_id UUID, -- ID del objeto afectado

  -- Data
  metadata JSONB, -- { before: {...}, after: {...}, reason: "...", etc. }

  -- Tracking
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Special flags
  is_secretary_action BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_audit_logs_owner_school_time
  ON audit_logs(owner_id, school_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor
  ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id);
```

#### UI Básica para Audit Logs

**Decisión:** Interface simple para Owners ver logs  
**Términos - Features de UI:**

**Vista Principal:**

- Tabla con columnas: Timestamp, Usuario, Acción, Entidad, Detalles
- Paginación (50 logs por página)
- Auto-refresh cada 30 segundos (opcional)

**Filtros:**

- Rango de fechas (última semana, último mes, custom)
- Por usuario (dropdown con lista)
- Por tipo de acción (login, create, update, delete)
- Por entidad (student, class, payment, etc.)
- Solo acciones de Secretary (checkbox)

**Detalles:**

- Click en log → modal con:
  - JSON completo de metadata
  - Diff visual si hay before/after
  - IP address y user agent
  - Timestamp preciso

**Export:**

- Botón "Export CSV" con filtros aplicados
- Include: timestamp, user email, action, entity, summary

**Permisos:**

- Solo Owner puede ver audit logs de su Owner
- Admin puede ver logs de su School únicamente
- Secretary/Instructor/Student NO pueden ver logs

**Justificación:** "Owners necesitan verlo, no preguntarme"

#### Append-only Table

**Decisión:** Logs no se pueden editar ni borrar  
**Términos:**

- RLS policies: INSERT allowed, UPDATE/DELETE denied
- Sin botones de edit/delete en UI
- Backups diarios via Supabase
  **Justificación:** "Con que no se puedan editar via app es suficiente" (respuesta #34)

### ❌ NO IMPLEMENTAR

#### Hash-chain / Blockchain Inmutability

**Decisión:** No implementar inmutabilidad criptográfica  
**Términos:**

- No crear hash-chains entre logs
- No validar integridad via hashes
  **Cuándo agregar:** Si hay requerimiento legal/regulatorio específico  
  **Tiempo ahorrado:** 1-2 semanas  
  **Justificación:** "No necesitan inmutabilidad legal" (respuesta #33)

#### Reportes Avanzados de Seguridad

**Decisión:** No implementar dashboards de seguridad  
**Términos:**

- No generar reportes automáticos de:
  - Patrones de login sospechosos
  - Acciones riesgosas detectadas
  - Comparativas de actividad por usuario
    **Cuándo agregar:** Cuando tengan 50+ academias y equipo de seguridad  
    **Tiempo ahorrado:** 2 semanas

---

## 1.8 SECURITY TESTING

### ✅ MANTENER - CRÍTICO

#### Unit Tests de RLS Policies

**Decisión:** Testing exhaustivo de TODAS las policies  
**Términos:**

- Test suite con 3 Owners diferentes, cada uno con 2 Schools
- Tests por cada combinación de rol + operación:
  - Owner: puede ver/editar todo en sus Schools
  - Admin: puede ver/editar solo su School
  - Secretary: puede ver/editar students/classes, NO puede delete instructors
  - Instructor: puede ver solo su data
  - Student: puede ver solo su propia data
- Tests de edge cases:
  - User sin memberships no ve nada
  - User bloqueado no puede hacer nada
  - Membership removed → pierde acceso inmediatamente
- Tests de cross-tenant leaks:
  - Owner A NO puede ver students de Owner B (CRÍTICO)
  - Admin de School 1 NO puede ver classes de School 2
  - Student 1 NO puede ver data de Student 2
    **Justificación:** "Bug de RLS aniquila el negocio" - respuesta #36  
    **Tiempo:** 1.5 semanas (no negociable)

#### Integration Tests de Permissions

**Decisión:** Tests de flujos completos de autorización  
**Términos:**

- Test: Secretary intenta delete instructor → debe fallar
- Test: Secretary registra payment → debe funcionar
- Test: Admin cambia precio → debe funcionar
- Test: Instructor intenta ver financial reports → debe fallar
- Test: Blocked user intenta login → debe fallar
  **Justificación:** Validar que RBAC funciona end-to-end

#### Test de Data Isolation

**Decisión:** Validar aislamiento entre tenants  
**Términos:**

- Setup: 3 owners con data diferente
- Test queries desde cada owner
- Assert: solo ven SU data
- Test con usuario sin memberships → ve array vacío
  **Justificación:** "Aniquila el negocio" si falla

#### Session Security Testing

**Decisión:** Tests básicos de sesiones  
**Términos:**

- Test: Token expirado → rechazado
- Test: Token de otro user → rechazado
- Test: User bloqueado → rechazado
- Test: Token manipulado → rechazado
  **Justificación:** Seguridad básica

### ❌ POSPONER

#### Penetration Testing

**Decisión:** No contratar pentester externo ahora  
**Términos:**

- Usar herramientas automáticas: Dependabot, npm audit
- Security review manual por ustedes
- Contratar pentester cuando tengan 20+ clientes
  **Cuándo hacerlo:** Respuesta #39: "cuando tengan 20+ clientes"  
  **Costo ahorrado ahora:** $2,000-5,000 USD

#### Load Testing

**Decisión:** No hacer pruebas de carga  
**Términos:**

- Asumir que Vercel + Supabase escalan automáticamente
- Monitorear performance en producción
- Hacer load testing solo si hay problemas reales
  **Cuándo hacerlo:** Si tienen 50+ concurrent users y ven slowness

---

## 🎯 DECISIONES ARQUITECTÓNICAS CLAVE

### Schema Design: Preparado para Futuro

**Decisión:** Diseñar pensando en features futuras sin implementarlas  
**Términos:**

- Schema permite agregar resource_assignments sin re-escribir
- Schema permite agregar más campos de config sin migración mayor
- Foreign keys con ON DELETE RESTRICT para preservar historia
  **Justificación:** Ustedes van a mantener esto 12+ meses, debe ser extensible

### Testing como Inversión

**Decisión:** Tests NO son opcional, son parte del desarrollo  
**Términos:**

- Usar AI para escribir tests (Claude/GPT)
- Revisar y ajustar tests manualmente
- CI/CD no permite deploy si tests fallan
- Target: 80% code coverage en funciones críticas
  **Justificación:** "Aniquila el negocio" si RLS falla + ustedes aprenden a programar

### Documentación Continua

**Decisión:** Documentar mientras desarrollan, no después  
**Términos:**

- Cada función tiene JSDoc comment
- Cada RLS policy tiene comment explicando el why
- README en cada carpeta importante
- Usar AI para generar docs base, revisar manualmente
  **Justificación:** Para futuros devs (respuesta #63)

---

## ⏱️ TIMELINE DETALLADO - FASE 1

**Total: 8-12 semanas calendario (2-3 meses con 20h/semana)**

### Semana 1-2: Foundation

- Setup proyecto (Next.js, Supabase, Drizzle)
- Schema design completo en papel
- Spike técnico de RLS (2-3 días críticos)
- Migrations iniciales

### Semana 3-4: RLS + Testing

- Implementar RLS policies para todas las tablas
- Unit tests de policies (exhaustivos)
- Refinar hasta que pasen 100% de tests
- **NO AVANZAR HASTA QUE ESTO ESTÉ SÓLIDO**

### Semana 5-6: Auth Flows + UI

- Login/logout pages
- Password reset flow
- Email verification
- School selection UI
- User blocking functionality

### Semana 7-8: RBAC

- Permissions matrix implementation
- Authorization middleware
- Role-based UI components
- Secretary-specific restrictions
- Role assignment interface

### Semana 9-10: Audit Logging

- Audit logs table + triggers
- Instrumentar código para loguear acciones
- UI básica de audit logs (tabla + filtros)
- Export CSV functionality

### Semana 11-12: Integration + Polish

- Integration tests de auth flows
- Cross-tenant leak tests
- Performance tuning de queries
- Bug fixing
- Documentation
- Deploy a staging

---

## 📋 CHECKLIST DE ACEPTACIÓN - FASE 1

Antes de considerar Fase 1 completa, verificar:

### Funcionalidad

- [ ] Users pueden login con email/password
- [ ] Password reset funciona end-to-end
- [ ] Email verification obligatoria funciona
- [ ] Users con múltiples Schools pueden elegir activa
- [ ] Los 5 roles tienen permisos correctos
- [ ] Secretary NO puede delete instructors (validado)
- [ ] Secretary NO puede ver financial reports (validado)
- [ ] User bloqueado no puede acceder al sistema
- [ ] Audit logs capturan todas las acciones críticas
- [ ] UI de audit logs funciona con filtros + export

### Seguridad

- [ ] 100% de tests de RLS pasan
- [ ] Owner A NO puede ver data de Owner B (validado con tests)
- [ ] Admin de School 1 NO puede ver School 2 (validado)
- [ ] Secretary tiene restricciones correctas (validado)
- [ ] Passwords hasheadas correctamente
- [ ] Tokens JWT validados en cada request
- [ ] Sesiones expiran correctamente

### Performance

- [ ] Login toma <2 segundos
- [ ] Queries con RLS toman <500ms (para 1000 records)
- [ ] Indexes correctos en memberships y audit_logs

### Documentación

- [ ] README de arquitectura completo
- [ ] RLS policies documentadas (por qué cada policy existe)
- [ ] Schema documentado (propósito de cada tabla)
- [ ] Permisos de cada rol documentados
- [ ] Setup instructions para devs futuros

### Deploy

- [ ] Producción en Vercel
- [ ] Database en Supabase (production)
- [ ] Environment variables configuradas
- [ ] Backups automáticos activos
- [ ] Monitoring (Sentry) funcionando

---

## 🚨 RIESGOS IDENTIFICADOS

### Riesgo Alto: Complejidad de RLS

**Problema:** Poca experiencia con RLS complejas  
**Mitigación:**

- Spike técnico de 2-3 días ANTES de empezar Fase 1
- Testing exhaustivo (no negociable)
- Pedir review de experto en Supabase en la comunidad
- Documentar exhaustivamente

### Riesgo Medio: Timeline Optimista

**Problema:** 2-3 meses puede ser poco si hay blockers  
**Mitigación:**

- Buffer de 20% en cada estimación
- Comenzar con lo más riesgoso (RLS)
- Re-evaluar timeline cada 2 semanas

### Riesgo Bajo: Scope Creep

**Problema:** Tentación de agregar features "ya que estamos"  
**Mitigación:**

- Este documento es el contrato
- Si algo no está en ✅ MANTENER, va a backlog
- Revisar scope cada semana

---

## 🎯 SIGUIENTE PASO

Una vez que confirmes estas decisiones de Fase 1, procedemos a:

1. **Spike Técnico de RLS** (2-3 días)

   - Implementar 1 tabla completa con policies
   - Tests exhaustivos
   - Documentar patrón

2. **Analizar Fase 2: Scheduling** con el mismo nivel de detalle

   - Qué mantener vs posponer
   - Decisiones sobre buffers, recurrencia, etc.

3. **Crear el documento maestro consolidado** después de analizar todas las fases

---

**¿Estás de acuerdo con estas decisiones de Fase 1?**

# FASE 2: Sistema de Programación (Scheduling) - Decisiones Finales

## 📊 Resumen Ejecutivo

**Duración estimada:** 10 semanas calendario (2.5 meses con 20h/semana)  
**Features implementadas:** 12 componentes críticos del sistema de agendamiento  
**Prioridad:** CRÍTICA - Este es el corazón del sistema, sin scheduling no hay producto

**Decisión arquitectónica principal:** Scheduling avanzado con todas las features vs sistema básico rápido  
**Justificación:** Respuesta #60 - Preferencia clara por sistema robusto en 10 semanas sobre sistema simple en 4 semanas

**Top 3 Features Críticas (Respuesta #57):**

- ✅ **A) Detección de conflictos básica**
- ✅ **B) Buffers configurables**
- ✅ **D) Cancelación con política 24h**

**Pain Point #1 a resolver (Respuesta #58):**

> "La propia organización y control, sobre si el cliente canceló, cuántas veces, de qué día a qué día, si avisó con tiempo, si no avisó con tiempo."

---

## 2.1 DETECCIÓN DE CONFLICTOS

### ✅ MANTENER

#### Validación de Conflictos al Guardar

**Decisión:** Validación en el momento de hacer click en "Guardar", no en tiempo real mientras escribe  
**Términos:**

- Latencia aceptable: 1-2 segundos para validar
- Bloqueo a nivel de base de datos con constraints y RLS
- Validación en backend SIEMPRE antes de INSERT/UPDATE
- Mensaje simple de error sin detalles de la clase conflictiva
- NO mostrar sugerencias automáticas de horarios alternativos
  **Justificación:**
- Respuesta #1: "No necesitan feedback instantáneo <500ms"
- Respuesta #2: "Es frecuente que intenten agendar 2 clases al mismo tiempo"
- Respuesta #3: "Suficiente con mensaje simple de error"
- Respuesta #4: "No necesitan sugerencias automáticas"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** 1-2 semanas

#### Validaciones Requeridas (TODAS CRÍTICAS)

**Decisión:** 6 tipos de conflictos que el sistema debe detectar y bloquear  
**Términos:**

**1. Conflicto de Instructor:**

```sql
-- Validación en función/trigger:
IF EXISTS (
  SELECT 1 FROM appointments
  WHERE instructor_id = NEW.instructor_id
    AND scheduled_date = NEW.scheduled_date
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
    AND id != NEW.id
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'El instructor ya tiene clase a esa hora';
END IF;
```

**2. Conflicto de Vehículo:**

```sql
IF EXISTS (
  SELECT 1 FROM appointments
  WHERE vehicle_id = NEW.vehicle_id
    AND scheduled_date = NEW.scheduled_date
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
    AND id != NEW.id
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'El vehículo ya está asignado a otra clase';
END IF;
```

**3. Conflicto de Estudiante:**

```sql
IF EXISTS (
  SELECT 1 FROM appointments
  WHERE student_id = NEW.student_id
    AND scheduled_date = NEW.scheduled_date
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
    AND id != NEW.id
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'El estudiante ya tiene clase a esa hora';
END IF;
```

**4. Instructor No Disponible (día bloqueado):**

```sql
IF EXISTS (
  SELECT 1 FROM instructor_availability
  WHERE instructor_id = NEW.instructor_id
    AND NEW.scheduled_date = ANY(blocked_dates)
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'El instructor no está disponible ese día';
END IF;
```

**5. Vehículo en Mantenimiento:**

```sql
IF EXISTS (
  SELECT 1 FROM vehicle_maintenance
  WHERE vehicle_id = NEW.vehicle_id
    AND NEW.scheduled_date BETWEEN start_date AND end_date
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'El vehículo está en mantenimiento';
END IF;
```

**6. Día No Laborable:**

```sql
IF EXISTS (
  SELECT 1 FROM school_non_working_days
  WHERE school_id = NEW.school_id
    AND non_working_date = NEW.scheduled_date
) THEN
  RAISE EXCEPTION 'La escuela no opera ese día';
END IF;
```

**Justificación:** Respuesta #49 - "Tiene que ser real la disponibilidad... SIEMPRE las citas que salgan en el sistema deben ser reales y previamente verificadas"

#### Validación de Buffers

**Decisión:** Validar tiempo mínimo entre clases del mismo instructor/vehículo  
**Términos:**

```sql
-- Obtener buffer configurado para la escuela
SELECT default_buffer_minutes INTO v_buffer
FROM school_settings
WHERE school_id = NEW.school_id;

-- Validar que hay buffer suficiente con clase anterior
IF EXISTS (
  SELECT 1 FROM appointments
  WHERE instructor_id = NEW.instructor_id
    AND scheduled_date = NEW.scheduled_date
    AND end_time > (NEW.start_time - (v_buffer || ' minutes')::INTERVAL)
    AND start_time < NEW.start_time
    AND id != NEW.id
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'No hay suficiente tiempo entre clases (buffer: % min)', v_buffer;
END IF;

-- Validar que hay buffer suficiente con clase siguiente
IF EXISTS (
  SELECT 1 FROM appointments
  WHERE instructor_id = NEW.instructor_id
    AND scheduled_date = NEW.scheduled_date
    AND start_time < (NEW.end_time + (v_buffer || ' minutes')::INTERVAL)
    AND end_time > NEW.end_time
    AND id != NEW.id
    AND deleted_at IS NULL
) THEN
  RAISE EXCEPTION 'No hay suficiente tiempo entre clases (buffer: % min)', v_buffer;
END IF;
```

**Justificación:** Respuestas #5-10 sobre buffers configurables

### ❌ NO IMPLEMENTAR

#### Feedback en Tiempo Real (<500ms)

**Decisión:** No implementar validación instantánea mientras el usuario escribe  
**Términos:**

- Solo validar cuando hace click en "Guardar"
- No necesitan ver errores mientras tipean la hora
  **Cuándo agregar:** Si users piden específicamente esta UX  
  **Tiempo ahorrado:** 1-2 semanas  
  **Justificación:** Respuesta #1 - "Está bien verificar cuando hacen click en Guardar"

#### Mostrar Detalles de Clase Conflictiva

**Decisión:** No mostrar información de la clase que está causando el conflicto  
**Términos:**

- Mensaje simple: "El instructor ya tiene clase a esa hora"
- NO mostrar: nombre del estudiante, detalles, hora exacta
  **Cuándo agregar:** Si users piden ver más contexto  
  **Tiempo ahorrado:** 3-5 días  
  **Justificación:** Respuesta #3 - "Es suficiente mostrar mensaje simple"

#### Sugerencias Automáticas de Horarios

**Decisión:** No implementar sistema de sugerencias inteligentes  
**Términos:**

- No calcular horarios alternativos disponibles
- No mostrar "Este instructor está libre a las 11am y 2pm"
- Users buscan manualmente otros horarios
  **Cuándo agregar:** Post-MVP si hay demanda  
  **Tiempo ahorrado:** 2-3 semanas  
  **Justificación:** Respuesta #4 - "No necesitan sugerencias automáticas"

---

## 2.2 BUFFERS ENTRE CLASES

### ✅ MANTENER

#### Buffer Configurable por Escuela

**Decisión:** Cada escuela configura su propio tiempo de buffer, no por instructor individual  
**Términos:**

- Campo en school_settings: `default_buffer_minutes`
- Valor predeterminado: 15 minutos
- Se aplica tanto a instructores como a vehículos
- Owner/Admin puede cambiar el valor desde UI de configuración
  **Justificación:**
- Respuesta #5: "Sería bueno que lo pueda setear cada escuela"
- Respuesta #6: "A priori ese tiempo es igual para todos"
- Respuesta #7: "Vehículos usan el mismo tiempo que instructores"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** 3-5 días

**Schema:**

```sql
ALTER TABLE school_settings
ADD COLUMN default_buffer_minutes INTEGER DEFAULT 15 CHECK (default_buffer_minutes >= 0);

ALTER TABLE school_settings
ADD COLUMN allow_manual_override BOOLEAN DEFAULT true;

ALTER TABLE school_settings
ADD COLUMN buffer_varies_by_resource_count BOOLEAN DEFAULT false;
```

#### Override Manual de Buffer

**Decisión:** Permitir tomar 2 citas juntas sin buffer si es necesario  
**Términos:**

- Sistema NO tiene "botón de override" automático
- Si necesitan saltarse buffer: simplemente toman 2 citas manuales consecutivas
- Responsabilidad del conductor y alumno coordinarlo offline
- No hay validación extra para estos casos
  **Justificación:** Respuesta #10 - "En la práctica, cuando se necesite tomar 2 citas juntas, simplemente se toman 2"
  **Complejidad:** BAJA (no hacer nada especial)

#### Variación por Cantidad de Recursos

**Decisión:** Preparar schema para buffers diferentes según recursos  
**Términos actuales (MVP):**

- Mismo buffer para todos los instructores/vehículos
- Campo `buffer_varies_by_resource_count` existe pero no se usa
  **Términos futuros:**
- Poder configurar: "Si tengo 1 auto: 30 min buffer, si tengo 10 autos: 15 min buffer"
- Tabla resource_buffer_rules (para después)
  **Cuándo agregar:** Si una academia pide esta feature específicamente  
  **Tiempo ahorrado ahora:** 1 semana  
  **Justificación:** Respuesta #8 - "Sí, pueden variar" pero respuesta #9 - "Si no es muy difícil lo sumamos desde día 1, sino postponer"

### ⚠️ IMPLEMENTACIÓN CONDICIONAL

#### Configuración de Buffer Desde Día 1

**Decisión:** Implementar en MVP solo si no es complejo  
**Términos:**

- Si toma <5 días: incluir en MVP
- Si toma >5 días: postponer para después
- **Evaluación:** Es MEDIA complejidad (agregar campo + validación) → **INCLUIR en MVP**
  **Justificación:** Respuesta #9 - "Si no es muy difícil de hacer, lo sumamos desde día 1"

---

## 2.3 CLASES RECURRENTES

### ✅ MANTENER - CRÍTICO

#### Creación de Series de Clases

**Decisión:** Permitir crear múltiples clases de una vez con patrón recurrente  
**Términos:**

- User puede crear "10 clases, todos los martes a las 3pm"
- Patrón inicial soportado: WEEKLY (semanal)
- Sistema crea 10 registros individuales en appointments table
- Todos vinculados via appointment_series table
  **Justificación:**
- Respuesta #11: "Es muy común"
- Respuesta #13: "Sí, lo necesitamos"
  **Complejidad:** ALTA  
  **Prioridad:** CRÍTICA  
  **Tiempo estimado:** 1.5-2 semanas

**Schema:**

```sql
CREATE TABLE appointment_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  student_id UUID NOT NULL REFERENCES students(id),
  instructor_id UUID NOT NULL REFERENCES instructors(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  class_type_id UUID NOT NULL REFERENCES class_types(id),

  -- Recurrence pattern
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Dates
  series_start_date DATE NOT NULL,
  series_end_date DATE,

  -- Excluded dates (non-working days)
  excluded_dates DATE[],

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Multi-tenancy
  owner_id UUID NOT NULL REFERENCES owners(id)
);

-- Modify appointments table
ALTER TABLE appointments
ADD COLUMN series_id UUID REFERENCES appointment_series(id);

ALTER TABLE appointments
ADD COLUMN is_series_exception BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX idx_appointment_series_school ON appointment_series(school_id, deleted_at);
CREATE INDEX idx_appointments_series ON appointments(series_id);
```

#### Modificación Individual vs Serie Completa

**Decisión:** Soportar ambos tipos de modificación  
**Términos:**

**Modificar Clase Individual:**

- User selecciona 1 clase de la serie
- Hace cambios (hora, instructor, etc.)
- Sistema marca `is_series_exception = true`
- Esa clase ya no sigue el patrón de la serie
- Resto de la serie no se afecta

**Modificar Serie Completa:**

- User selecciona "Editar serie"
- Hace cambios (cambiar hora de 3pm a 4pm)
- Sistema pregunta: "¿Aplicar solo a clases futuras o a todas?"
- Si futuras: UPDATE appointments WHERE series_id = X AND scheduled_date >= TODAY AND is_series_exception = false
- Si todas: UPDATE appointments WHERE series_id = X AND is_series_exception = false

**UI necesaria:**

- Al editar clase que es parte de serie: Modal con 2 opciones
  - "Solo esta clase"
  - "Esta clase y todas las siguientes"
  - "Toda la serie"

**Justificación:** Respuesta #14 - "Solo a la clase modificada, es decir, deben poderse las 2 cosas, modificar una clase individual de las 10, o modificar varias"
**Complejidad:** MEDIA-ALTA  
**Tiempo estimado:** Incluido en 1.5-2 semanas de clases recurrentes

#### Sistema de Días No Laborables

**Decisión:** Owner puede marcar días específicos donde no hay clases  
**Términos:**

- Tabla school_non_working_days con lista de fechas
- Owner/Admin puede agregar/quitar fechas vía UI
- Ejemplos: feriados nacionales, días de mantenimiento, vacaciones
- Al crear serie de clases: sistema salta automáticamente estos días
- Si hay clase ya agendada en día no laborable: sistema muestra warning/error

**Schema:**

```sql
CREATE TABLE school_non_working_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  owner_id UUID NOT NULL REFERENCES owners(id),

  non_working_date DATE NOT NULL,
  reason TEXT, -- "Feriado nacional", "Vacaciones de verano", etc.

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, non_working_date)
);

CREATE INDEX idx_school_non_working_days ON school_non_working_days(school_id, non_working_date);
```

**Lógica al crear serie:**

```typescript
// Al crear serie de 10 clases semanales:
const appointments = [];
let currentDate = startDate;
let createdCount = 0;

while (createdCount < totalClasses) {
  // Verificar si es día no laborable
  const isNonWorking = await checkNonWorkingDay(schoolId, currentDate);

  if (!isNonWorking) {
    appointments.push({
      scheduled_date: currentDate,
      start_time: startTime,
      // ... resto de campos
    });
    createdCount++;
  }

  // Siguiente semana
  currentDate = addDays(currentDate, 7);
}
```

**Justificación:** Respuesta #15 - "Seria genial, o implementar un sistema de días no laborables, que lo cargue el dueño manual"
**Complejidad:** MEDIA  
**Tiempo estimado:** Incluido en estimación de clases recurrentes

### ❌ NO IMPLEMENTAR

#### Feriados Automáticos

**Decisión:** No cargar feriados automáticamente por país/región  
**Términos:**

- No integrar con APIs de feriados
- No tener lista pre-cargada de feriados argentinos
- Owner debe cargar manualmente cada feriado
  **Cuándo agregar:** Si 5+ academias piden esta feature  
  **Tiempo ahorrado:** 1 semana  
  **Justificación:** Respuesta #15 - "Que lo cargue el dueño manual" (no pidió automático)

#### Patrones Complejos de Recurrencia

**Decisión:** Solo soportar WEEKLY en MVP  
**Términos actuales:**

- Solo "cada X semanas" (ej: cada 1 semana = semanal, cada 2 semanas = quincenal)
- NO soportar: "primer lunes de cada mes", "último viernes", etc.
  **Términos futuros:**
- Agregar MONTHLY si hay demanda
- Patrones complejos solo si realmente se usan
  **Cuándo agregar:** Después de tener 10 academias usando el sistema  
  **Tiempo ahorrado:** 2 semanas

---

## 2.4 UI DEL CALENDARIO

### ✅ MANTENER - CRÍTICO

#### Vista de Calendario Visual

**Decisión:** Calendario estilo Google Calendar sin drag & drop  
**Términos:**

- Vista visual con grid de horas y días
- Clases se muestran como bloques de color
- Click en bloque → modal con detalles
- Click en espacio vacío → crear nueva clase
- NO implementar: drag & drop, resize, arrastrar para cambiar hora
  **Justificación:**
- Respuesta #20: "Sí, pero sin drag and drop"
- Respuesta #21: "Esto suena bien" (sobre tabla/lista alternativa)
  **Complejidad:** ALTA  
  **Prioridad:** CRÍTICA  
  **Tiempo estimado:** 2-3 semanas

#### 4 Vistas de Calendario (TODAS)

**Decisión:** Implementar todas las vistas, priorizando semanal y diaria  
**Términos:**

**1. Vista Diaria (HOY):**

- Grid de horas (ej: 8am - 8pm)
- Columnas: por instructor (si hay 3 instructors, 3 columnas)
- Clases mostradas como bloques de color
- Scroll vertical para ver todo el día
- Uso: Alta frecuencia

**2. Vista Semanal (ESTA SEMANA):**

- Grid de días (Lun-Dom) × horas
- Similar a Google Calendar week view
- Clases mostradas como bloques
- Color-coding por instructor
- Uso: Alta frecuencia (la más usada)

**3. Vista Mensual:**

- Calendario tradicional de mes
- Días con clases muestran número de clases
- Click en día → muestra lista de clases de ese día
- Uso: Frecuencia media

**4. Solo Lista:**

- Tabla con columnas: Fecha, Hora, Estudiante, Instructor, Vehículo, Estado
- Filtros: por instructor, por estudiante, por fecha
- Sort por cualquier columna
- Paginación (50 por página)
- Export a CSV
- Uso: Frecuencia media

**Justificación:** Respuesta #22 - "Necesito todas las vistas, aunque las más usadas serán semanal y diaria"

#### Color-Coding de Clases

**Decisión:** Colores por instructor y por estado  
**Términos:**

- Cada instructor tiene un color asignado (auto-generado o elegido)
- Estados con colores:
  - Confirmada: Verde
  - Pendiente: Amarillo
  - Cancelada: Rojo
  - Completada: Gris
  - No-show: Naranja
- Color de fondo del bloque = color de instructor (opacidad 50%)
- Borde del bloque = color de estado
  **Justificación:** Mejorar legibilidad del calendario

#### Responsive Design

**Decisión:** Mobile-first, funcional en celular  
**Términos:**

- En mobile: vista de lista por defecto
- Vista diaria funciona bien en mobile (vertical scroll)
- Vista semanal en mobile: horizontal scroll
- Vista mensual: se adapta a pantalla chica
- Botones grandes para touch
  **Justificación:** Secretarias e instructores usarán desde celular

### ✅ MANTENER - CRÍTICO

#### Portal de Instructor (Separado)

**Decisión:** Plataforma independiente para que instructores vean SUS clases  
**Términos:**

- URL dedicada o sección del sistema
- Instructor solo ve SUS propias clases agendadas
- Vistas disponibles: diaria, semanal, lista
- Puede marcar asistencia/no-show en las clases
- Puede ver información básica de sus estudiantes asignados
- SOLO LECTURA: no puede crear ni editar clases
- NO puede ver: clases de otros instructores, finanzas, configuración
  **Justificación:**
- Respuesta #23: "No hay problema con eso, solo accesible para instructor"
- Respuesta #33: **"Creo que no comprarían si el chofer no puede ver su clase, es muy importante"** ← CRÍTICO para venta
  **Complejidad:** MEDIA  
  **Prioridad:** CRÍTICA (sin esto NO se vende)  
  **Tiempo estimado:** 1 semana

**RLS para Instructor:**

```sql
CREATE POLICY "Instructors can only see their own appointments"
ON appointments FOR SELECT
TO authenticated
USING (
  instructor_id IN (
    SELECT instructor_id FROM instructors
    WHERE user_id = auth.uid()
  )
);
```

#### Imprimir Horarios

**Decisión:** Generar PDF de horarios para imprimir  
**Términos:**

- Botón "Imprimir" en cada vista
- Genera PDF con:
  - Vista semanal: tabla de clases de la semana
  - Vista diaria: lista de clases del día
- Formato: tamaño carta, blanco y negro
- Include: logo de la escuela, nombre, fechas
- Use case: pegar horario en pared de la oficina
  **Justificación:** Respuesta #24 - "Si no es muy difícil lo podemos implementar"
  **Complejidad:** BAJA (usar jsPDF o react-pdf)  
  **Tiempo estimado:** 2-3 días

### ❌ NO IMPLEMENTAR

#### Drag & Drop

**Decisión:** No implementar arrastrar clases para cambiar hora/día  
**Términos:**

- Para cambiar hora: click en clase → modal → editar hora → guardar
- Más pasos pero más seguro (evita cambios accidentales)
  **Cuándo agregar:** Si 10+ users piden esta feature  
  **Tiempo ahorrado:** 2-3 semanas  
  **Justificación:** Respuesta #20 - "Sin drag and drop"

#### Resize de Clases

**Decisión:** No permitir cambiar duración arrastrando el borde del bloque  
**Términos:**

- Duración se define al crear la clase (basado en class_type)
- Para cambiar duración: editar clase manualmente
  **Cuándo agregar:** Post-MVP si hay demanda  
  **Tiempo ahorrado:** 1 semana

---

## 2.5 POLÍTICAS DE CANCELACIÓN

### ✅ MANTENER - CRÍTICO

#### Política Configurable por Escuela

**Decisión:** Cada escuela define su período de cancelación  
**Términos:**

- Campo en school_settings: `cancellation_policy_hours`
- Valor predeterminado: 24 horas
- Otras escuelas pueden configurar: 48h, 12h, 2h, etc.
- Owner/Admin puede cambiar desde UI de configuración
  **Justificación:**
- Respuesta #25: "Normalmente usa 24h, aunque puede haber excepciones"
- Respuesta #26: "Sí, otras podrían necesitar políticas diferentes"
  **Complejidad:** MEDIA  
  **Prioridad:** CRÍTICA (Top 3)  
  **Tiempo estimado:** 1 semana

**Schema:**

```sql
ALTER TABLE school_settings
ADD COLUMN cancellation_policy_hours INTEGER DEFAULT 24 CHECK (cancellation_policy_hours >= 0);

ALTER TABLE school_settings
ADD COLUMN allow_policy_exceptions BOOLEAN DEFAULT true;
```

#### Bloqueo de Cancelación (NO Warning)

**Decisión:** Sistema BLOQUEA cancelaciones dentro del período, no solo advierte  
**Términos:**

- Si clase es en <24 horas (o X horas configuradas): botón de cancelar está DESHABILITADO
- Mensaje: "No se puede cancelar. Política de la escuela: mínimo 24 horas de aviso"
- NO es solo un warning que user puede ignorar
- Es un bloqueo completo a nivel de backend también
  **Justificación:** Respuesta #28 - "Que la bloquee dentro de las horas no permitidas"
  **Complejidad:** BAJA  
  **Tiempo estimado:** Incluido en 1 semana de políticas

**Validación en backend:**

```typescript
const canCancel = (appointment: Appointment, policyHours: number) => {
  const now = new Date();
  const appointmentTime = new Date(
    `${appointment.scheduled_date} ${appointment.start_time}`
  );
  const hoursUntilAppointment =
    (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilAppointment < policyHours) {
    throw new Error(
      `No se puede cancelar. Debe avisar con al menos ${policyHours} horas de anticipación.`
    );
  }

  return true;
};
```

#### Excepciones Manuales por Owner/Secretary

**Decisión:** Owner y Secretary pueden hacer excepciones a la política  
**Términos:**

- Owner/Secretary pueden cancelar clases incluso dentro del período prohibido
- Al hacerlo, deben indicar motivo: "Emergencia familiar", "Enfermedad", etc.
- Queda registrado en audit_log: quién aprobó la excepción y por qué
- Crédito del estudiante NO se consume si hay excepción aprobada
  **Justificación:**
- Respuesta #25: "Puede haber excepciones"
- Respuesta #27: "El owner, o la secretaria decide"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** Incluido en 1 semana

**Schema:**

```sql
ALTER TABLE appointments
ADD COLUMN cancellation_exception BOOLEAN DEFAULT false;

ALTER TABLE appointments
ADD COLUMN cancellation_exception_reason TEXT;

ALTER TABLE appointments
ADD COLUMN cancellation_approved_by UUID REFERENCES users(id);
```

#### Cancelación por Instructor - Devolución Automática

**Decisión:** Si instructor cancela, crédito se devuelve automáticamente al estudiante  
**Términos:**

- Instructor (o Owner en su nombre) cancela la clase
- Sistema automáticamente:
  1. Marca clase como cancelled
  2. Marca cancelled_by_instructor = true
  3. Devuelve crédito al estudiante (student_credits += 1)
  4. Registra en audit_log
- Instructor NO cobra esa clase
- Excepción: Si Owner aprueba manualmente, instructor puede cobrar
  **Justificación:** Respuesta #29 - "Si un instructor cancela una clase el crédito se le devuelve al alumno automáticamente, pero el instructor no podrá cobrar esa clase (a menos que haya algún buen motivo, que tmb lo decide el dueño)"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** Incluido en 1 semana

**Lógica:**

```typescript
const cancelAppointmentByInstructor = async (
  appointmentId: string,
  reason: string
) => {
  // 1. Marcar clase como cancelada
  await db.appointments.update({
    where: { id: appointmentId },
    data: {
      status: "cancelled",
      cancelled_by_instructor: true,
      cancellation_reason: reason,
      cancelled_at: new Date(),
    },
  });

  // 2. Devolver crédito al estudiante
  await db.students.update({
    where: { id: appointment.student_id },
    data: {
      available_credits: { increment: 1 },
    },
  });

  // 3. Audit log
  await createAuditLog({
    action: "instructor_cancelled_class",
    entity_type: "appointment",
    entity_id: appointmentId,
    metadata: { reason, credit_refunded: true },
  });
};
```

**Schema:**

```sql
ALTER TABLE appointments
ADD COLUMN cancelled_by_instructor BOOLEAN DEFAULT false;

ALTER TABLE appointments
ADD COLUMN cancellation_reason TEXT;

ALTER TABLE appointments
ADD COLUMN cancelled_at TIMESTAMPTZ;

ALTER TABLE appointments
ADD COLUMN instructor_can_charge BOOLEAN DEFAULT false;
```

### ❌ NO IMPLEMENTAR (por ahora)

#### Políticas Diferentes por Tipo de Clase

**Decisión:** Misma política para todas las clases  
**Términos actuales:**

- Política de 24h (o X horas) aplica a TODAS las clases
- No distinguir entre clase práctica vs teórica
  **Términos futuros:**
- Poder configurar: "Clases prácticas: 24h, Clases teóricas: 2h"
  **Cuándo agregar:** Si una academia pide explícitamente  
  **Tiempo ahorrado:** 1 semana

---

#### 2.5.1 Política Escalonada + bloqueo &lt;12h en portal (Unificación MVP)

- Ventanas y devolución para estudiante:
  - ≥ 24h: devolución 1.0 (100%)
  - 12–24h: devolución 0.5 (50%)
  - &lt; 12h: devolución 0.0 (0%)
- Portal del estudiante:
  - Botón “Cancelar” DESHABILITADO si faltan &lt; 12h (el staff sí puede cancelar en cualquier momento).
- Justificación médica/emergencia/fuerza mayor:
  - Si presenta justificativo válido en ventana, la devolución final es 1.0 crédito (incluso si 12–24h o &lt;12h).
  - Ventana de presentación de justificativo: hasta 24h posteriores a la clase.
  - Aprobadores: Owner o Secretary.

Referencias cruzadas:
- Ver regla de UI/UX en [DECISIONES_FASE_5_StudentPortal.md](DECISIONES_FASE_5_StudentPortal.md)
- Ver detalle de “Ausencia Justificada” en [DECISIONES_FASE_3_Recursos.md](DECISIONES_FASE_3_Recursos.md)

#### 2.5.2 Modelo operativo contable: siempre descontar y luego compensar

- Filosofía operativa: simplificar y evitar “créditos en evaluación”.
- En toda falta del alumno o cancelación tardía (12–24h o &lt;12h), el sistema:
  1) Descuenta SIEMPRE 1.0 (“debit first”).
  2) Aplica compensación automática según política (p. ej., +0.5 en 12–24h).
  3) Si se aprueba justificativo dentro de la ventana, agrega el compensatorio adicional (+0.5 o +1.0).
- Cancelaciones con ≥24h no generan “falta”: se libera reserva o se compensa 1.0 directamente sin descontar previamente.

Ejemplos de timeline (ledger neto):
- 12–24h sin justificativo: -1.0 +0.5 = -0.5
- 12–24h con justificativo aprobado: -1.0 +0.5 +0.5 = 0.0
- &lt;12h/no‑show sin justificativo: -1.0
- &lt;12h/no‑show con justificativo aprobado: -1.0 +1.0 = 0.0

Pagos a instructor:
- Con justificativo aprobado: instructor NO cobra (si hubo provisión, se revierte).
- Sin justificativo: se mantiene la regla de pago por cancelación tardía/no‑show.

Ver lógica de ejemplo en [DECISIONES_FASE_5_StudentPortal.md](DECISIONES_FASE_5_StudentPortal.md).

#### 2.5.3 Reserva y Consumo de créditos (FIFO + congelados primero)

- Reserva al agendar; consumo al completar:
  - Al confirmar un slot, se crea una “reserva” del crédito.
  - Al completar la clase, se “consume” (credit_used).
  - Si se cancela ≥24h: se “libera” la reserva (released) sin consumo.
- Orden de consumo:
  - FIFO entre paquetes activos.
  - Prioridad: créditos congelados se consumen primero (antes que créditos comunes).
- Notas:
  - Este patrón de reservas permite consistencia entre Scheduling (Fase 2) y el portal del estudiante (Fase 5).

#### 2.5.4 Ledger: nuevos tipos de transacción y estados

- Nuevos tipos para reflejar el flujo contable:
  - reserved (reserva al agendar)
  - released (liberación de reserva)
  - credit_used (-1.0 al completar o al aplicar “debit first” en faltas/late)
  - partial_refund (+0.5 en 12–24h sin justificativo)
  - justified_absence_requested (solicitud de justificada)
  - justified_absence_approved (+0.5 o +1.0)
  - justified_absence_rejected
  - no_show
- Modelo fraccional:
  - Campo fractional_amount DECIMAL(3,2) en créditos para soportar 0.50.
- Visualización:
  - Estudiante ve el timeline completo en “Mis Créditos” con saldo posterior a cada movimiento.

#### 2.5.5 Configuración y Dashboard (impacto Fase 6)

- Settings (Admin Dashboard):
  - Aprobación de justificativos (ver, aprobar, rechazar, adjuntar evidencia).
  - Parámetros de ventanas (horas) y canales de notificación.
- Reportes:
  - Incluir métricas de cancelaciones por ventana y compensaciones aplicadas.
  - Ajustes por “ausencia justificada” reflejados en recibos de pago a instructores (si corresponde).
## 2.6 NOTIFICACIONES Y RECORDATORIOS

### ✅ MANTENER - CRÍTICO (Debe estar en MVP)

#### WhatsApp Business API Integration

**Decisión:** Recordatorios automáticos vía WhatsApp como canal principal  
**Términos:**

- Usar WhatsApp Business API (no WhatsApp Web scraping)
- Servicio recomendado: Twilio WhatsApp API o 360dialog
- Enviar mensajes de:
  - Recordatorio de clase (configurable cuándo)
  - Confirmación de clase agendada
  - Notificación de cancelación
  - Notificación de cambio de horario
- Templates de mensajes en español argentino
  **Justificación:**
- Respuesta #34: "Sí" (necesitan recordatorios)
- Respuesta #35: "Sería espectacular, vía WhatsApp API"
- Respuesta #37: "Seria ideal que este en el MVP"
  **Complejidad:** ALTA (cero experiencia previa)  
  **Prioridad:** CRÍTICA (debe estar en MVP)  
  **Tiempo estimado:** 1-1.5 semanas

**IMPORTANTE:** Spike técnico de 2-3 días ANTES de Fase 2 para:

- Crear cuenta en Twilio/360dialog
- Enviar primer mensaje de prueba
- Entender rate limits y costos
- Validar que funciona en Argentina

**Templates de mensajes:**

```
// Recordatorio 24h antes:
"¡Hola {nombre}! 👋
Recordatorio: tienes clase mañana {dia} a las {hora} con el instructor {instructor}.
📍 Ubicación: {direccion}
🚗 Vehículo: {vehiculo}

Si necesitas cancelar, avísanos con 24hs de anticipación.
- {escuela}"

// Recordatorio 2h antes:
"Hola {nombre}!
Tu clase de manejo es en 2 horas (a las {hora}).
Instructor: {instructor}
Nos vemos pronto! 🚗
- {escuela}"

// Clase cancelada:
"Hola {nombre},
Tu clase del {dia} a las {hora} ha sido cancelada.
Motivo: {razon}
Tu crédito ha sido devuelto.
Contactanos para reagendar.
- {escuela}"

// Cambio de horario:
"Hola {nombre},
Tu clase ha sido reprogramada:
❌ Antes: {dia_viejo} a las {hora_vieja}
✅ Ahora: {dia_nuevo} a las {hora_nuevo}
Instructor: {instructor}
- {escuela}"
```

#### Email como Fallback

**Decisión:** Si WhatsApp falla, enviar email  
**Términos:**

- Intentar WhatsApp primero
- Si falla (número inválido, WhatsApp no registrado, etc.): enviar email
- Usar Supabase Auth emails o Resend
- Mismos templates que WhatsApp pero formato HTML
  **Justificación:** Respuesta #35 - "a lo sumo email"
  **Complejidad:** BAJA (email es más fácil que WhatsApp)  
  **Tiempo estimado:** Incluido en 1 semana de notificaciones

#### Recordatorios Configurables

**Decisión:** Múltiples recordatorios configurables por escuela  
**Términos:**

- School puede configurar 1 o más recordatorios
- Ejemplos de configuraciones:
  - Solo 2h antes
  - 24h antes + 2h antes
  - 48h antes + 24h antes + 1h antes
- UI: lista de recordatorios con +/- para agregar/quitar
- Cada recordatorio tiene: tiempo antes (en horas), canal (WhatsApp/Email/Ambos)
  **Justificación:** Respuesta #36 - "Poder decidir eso seria genial, tener más de 1 recordatorio... que sea configurable"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** Incluido en 1-1.5 semanas

**Schema:**

```sql
CREATE TABLE reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  owner_id UUID NOT NULL REFERENCES owners(id),

  hours_before INTEGER NOT NULL CHECK (hours_before >= 0),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'both')),
  enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, hours_before, channel)
);

-- Default reminders para nueva escuela:
INSERT INTO reminder_settings (school_id, owner_id, hours_before, channel) VALUES
  (NEW.id, NEW.owner_id, 24, 'whatsapp'),
  (NEW.id, NEW.owner_id, 2, 'whatsapp');
```

#### Scheduler de Recordatorios

**Decisión:** Background job que verifica y envía recordatorios  
**Términos:**

- Cron job corriendo cada 15 minutos
- Query: clases que están en X horas (según reminder_settings)
- Enviar recordatorio si no se ha enviado ya
- Marcar en BD que recordatorio fue enviado
- Retry si falla (hasta 3 intentos)
  **Complejidad:** MEDIA  
  **Tiempo estimado:** Incluido en estimación

**Tabla de tracking:**

```sql
CREATE TABLE reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  reminder_hours_before INTEGER NOT NULL,
  channel TEXT NOT NULL,

  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  UNIQUE(appointment_id, reminder_hours_before, channel)
);
```

### ❌ NO IMPLEMENTAR

#### SMS Notifications

**Decisión:** No implementar SMS  
**Términos:**

- Solo WhatsApp + Email
- SMS no se usa en Latinoamérica
  **Justificación:** Respuesta #35 - "SMS no se usa en latinoamérica"
  **Tiempo ahorrado:** 1 semana

#### App Móvil con Push Notifications

**Decisión:** No desarrollar app nativa  
**Términos:**

- Sistema es web responsive
- No push notifications nativas
- Usar WhatsApp/Email para notificar
  **Cuándo agregar:** Si tienen 50+ academias y presupuesto para app  
  **Tiempo ahorrado:** 3-4 meses

---

## 2.7 MANEJO DE NO-SHOWS

### ✅ MANTENER

#### Consumo Automático de Crédito

**Decisión:** No-show consume crédito del estudiante automáticamente  
**Términos:**

- Instructor o Secretary marca "No-show" en el sistema
- Sistema automáticamente:
  1. Marca appointment.status = 'no_show'
  2. NO devuelve crédito al estudiante
  3. Registra en audit_log
- Es equivalente a cancelación tardía (ambos consumen crédito)
  **Justificación:** Respuesta #38 - "Sí, consume directamente"
  **Complejidad:** BAJA  
  **Tiempo estimado:** 2-3 días

**Schema:**

```sql
ALTER TABLE appointments
ADD COLUMN marked_no_show_by UUID REFERENCES users(id);

ALTER TABLE appointments
ADD COLUMN marked_no_show_at TIMESTAMPTZ;
```

**Lógica:**

```typescript
const markNoShow = async (appointmentId: string, markedBy: string) => {
  // 1. Marcar como no-show
  await db.appointments.update({
    where: { id: appointmentId },
    data: {
      status: "no_show",
      marked_no_show_by: markedBy,
      marked_no_show_at: new Date(),
    },
  });

  // 2. NO devolver crédito (ya fue consumido al agendar)
  // 3. Audit log
  await createAuditLog({
    action: "mark_no_show",
    entity_type: "appointment",
    entity_id: appointmentId,
    actor_user_id: markedBy,
  });
};
```

#### Quien Marca No-Show

**Decisión:** Instructor o Secretary pueden marcar  
**Términos:**

- Instructor: puede marcar no-show en SUS clases
- Secretary: puede marcar no-show en cualquier clase
- Owner/Admin: pueden marcar no-show en cualquier clase
- Sistema NO marca automáticamente (requiere acción humana)
  **Justificación:** Respuesta #39 - "Lo hace el instructor, o la secretaria depende quien se entere primero"
  **Complejidad:** BAJA  
  **Tiempo estimado:** Incluido en 2-3 días

### ❌ NO IMPLEMENTAR

#### Tracking Automático de No-Shows

**Decisión:** No implementar reportes automáticos de patrones de no-show  
**Términos actuales:**

- Sistema registra cada no-show
- Pero NO genera alertas como "Este estudiante tiene 3 no-shows este mes"
- Owner puede ver manualmente en audit logs o exportar a Excel
  **Términos futuros:**
- Dashboard con "Estudiantes con más no-shows"
- Alertas automáticas si estudiante supera X no-shows
  **Cuándo agregar:** Si Owners piden esta feature  
  **Tiempo ahorrado:** 1 semana  
  **Justificación:** Respuesta #40 - "No es necesario un tracking, eso lo podemos ver a mano"

#### Penalidad Extra por No-Show

**Decisión:** No implementar penalidades adicionales  
**Términos:**

- No-show = consume 1 crédito (igual que cancelación tardía)
- NO consume 2 créditos
- NO suspensión temporal
- NO multa económica extra
  **Cuándo agregar:** Si una academia pide implementar penalidades  
  **Tiempo ahorrado:** 1 semana  
  **Justificación:** Respuesta #41 - "Por ahora no hay penalidad"

---

## 2.8 RE-PROGRAMACIÓN (RESCHEDULING)

### ✅ MANTENER

#### Reprogramación Gratis si Respeta Período

**Decisión:** Estudiante puede reprogramar sin costo si avisa con tiempo  
**Términos:**

- Si clase es en >24 horas (o X según policy): puede reprogramar gratis
- Si clase es en <24 horas: NO puede reprogramar (botón bloqueado)
- "Reprogramar gratis" significa: cancelar vieja clase + crear nueva, sin perder crédito
  **Justificación:**
- Respuesta #43: "Si están dentro del período que sí pueden cancelar... en ese caso pueden cancelar y tomar una nueva"
- Respuesta #44: "Es gratis si respeta el periodo"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** 3-4 días

**Proceso de reprogramación:**

```typescript
const rescheduleAppointment = async (
  oldAppointmentId: string,
  newDate: Date,
  newTime: string
) => {
  const oldAppointment = await getAppointment(oldAppointmentId);
  const policyHours = await getSchoolPolicy(oldAppointment.school_id);

  // 1. Validar que puede reprogramar
  if (!canCancel(oldAppointment, policyHours)) {
    throw new Error("No se puede reprogramar. Debe avisar con anticipación");
  }

  // 2. Validar límite de reprogramaciones
  const rescheduleCount = await countReschedules(
    oldAppointment.student_id,
    oldAppointment.school_id,
    currentMonth
  );
  const maxReschedules = await getMaxReschedules(oldAppointment.school_id);

  if (maxReschedules && rescheduleCount >= maxReschedules) {
    throw new Error(
      `Has alcanzado el límite de ${maxReschedules} reprogramaciones este mes`
    );
  }

  // 3. Cancelar clase vieja (sin consumir crédito)
  await cancelAppointment(oldAppointmentId, "rescheduled", false);

  // 4. Crear clase nueva
  const newAppointment = await createAppointment({
    ...oldAppointment,
    scheduled_date: newDate,
    start_time: newTime,
    rescheduled_from: oldAppointmentId,
  });

  // 5. Incrementar contador
  await incrementRescheduleCount(oldAppointment.student_id);

  // 6. Audit log
  await createAuditLog({
    action: "reschedule_appointment",
    metadata: {
      old_appointment_id: oldAppointmentId,
      new_appointment_id: newAppointment.id,
      old_date: oldAppointment.scheduled_date,
      new_date: newDate,
    },
  });

  return newAppointment;
};
```

#### Límite Configurable de Reprogramaciones

**Decisión:** Cada escuela puede limitar cuántas veces puede reprogramar un estudiante  
**Términos:**

- Campo en school_settings: `max_reschedules_per_month`
- Si NULL o 0: ilimitado
- Si N: estudiante puede reprogramar máximo N veces por mes
- Se resetea el 1ro de cada mes
- Owner puede hacer excepciones manualmente
  **Justificación:** Respuesta #45 - "Sería genial poner un límite, que lo elija la escuela, incluso puede ser infinito"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** Incluido en 3-4 días

**Schema:**

```sql
ALTER TABLE school_settings
ADD COLUMN max_reschedules_per_month INTEGER;

ALTER TABLE appointments
ADD COLUMN rescheduled_from UUID REFERENCES appointments(id);

ALTER TABLE students
ADD COLUMN reschedule_count_current_month INTEGER DEFAULT 0;

ALTER TABLE students
ADD COLUMN reschedule_count_last_reset DATE;
```

### ⚠️ DECISIÓN DE IMPLEMENTACIÓN

#### Cancelar + Crear vs Mover Clase

**Decisión:** Implementar como "Cancelar + Crear" para MVP  
**Términos:**

- Al reprogramar: sistema cancela clase vieja y crea clase nueva
- NO es un "move" que mantiene el mismo appointment_id
- Beneficios: más simple, audit trail más claro
- Downside: pierde historial de la clase original (pero queda en audit_log)
  **Justificación:** Respuesta #43 - "Dejo a tu criterio si es mejor cancelar y tomar una nueva, o moverla"
  **Complejidad:** BAJA  
  **Decisión final:** Cancelar + Crear (más simple para MVP)

---

## 2.9 DISPONIBILIDAD DE INSTRUCTORES

### ✅ MANTENER - CRÍTICO

#### Horarios Flexibles

**Decisión:** No forzar horarios fijos, cada escuela decide  
**Términos:**

- Sistema NO tiene concepto de "horario de trabajo" del instructor
- Instructor está disponible a menos que:
  - Tenga clase agendada
  - Haya marcado día como "no disponible"
  - Sea día no laborable de la escuela
- Cada escuela puede implementar sus propias reglas (fuera del sistema si quieren)
  **Justificación:**
- Respuesta #46: "No necesariamente tienen horarios fijos, depende de la escuela"
- Respuesta #47: "Puede ser flexible"
  **Complejidad:** BAJA (no hacer nada especial)

#### Días No Disponibles (Configurable)

**Decisión:** Owner decide si instructores pueden auto-bloquearse  
**Términos:**

- Campo en school_settings: `instructors_can_self_block`
- Si TRUE: instructor puede marcar sus propios días "no disponible"
- Si FALSE: solo Owner/Admin puede marcar días no disponibles del instructor
- Cuando instructor se bloquea: debe indicar motivo (vacaciones, médico, personal)
- Owner ve todos los días bloqueados y puede aprobar/rechazar
  **Justificación:** Respuesta #48 - "Eso quiero que lo decida el dueño"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** 1 semana

**Schema:**

```sql
CREATE TABLE instructor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id),
  school_id UUID NOT NULL REFERENCES schools(id),
  owner_id UUID NOT NULL REFERENCES owners(id),

  blocked_date DATE NOT NULL,
  blocked_reason TEXT NOT NULL CHECK (blocked_reason IN ('vacation', 'medical', 'personal', 'maintenance', 'other')),
  notes TEXT,

  requested_by UUID REFERENCES users(id), -- Si instructor lo pidió
  approved_by UUID REFERENCES users(id), -- Owner que aprobó
  approved_at TIMESTAMPTZ,

  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(instructor_id, blocked_date)
);

CREATE INDEX idx_instructor_availability ON instructor_availability(instructor_id, blocked_date, deleted_at);

ALTER TABLE school_settings
ADD COLUMN instructors_can_self_block BOOLEAN DEFAULT false;
```

**Flujo si `instructors_can_self_block = true`:**

1. Instructor solicita día libre vía UI
2. Sistema crea registro con status='pending'
3. Owner recibe notificación (o ve en dashboard)
4. Owner aprueba/rechaza
5. Si aprobado: día queda bloqueado
6. Si rechazado: instructor recibe notificación

**Flujo si `instructors_can_self_block = false`:**

1. Solo Owner/Admin puede bloquear días de instructores
2. Status siempre es 'approved' (no hay approval process)

#### Validación Real al Agendar - CRÍTICO

**Decisión:** SIEMPRE validar disponibilidad real antes de confirmar clase  
**Términos:**

- Al intentar agendar clase: sistema valida:
  1. Instructor NO tiene otra clase a esa hora
  2. Instructor NO está en día bloqueado
  3. Vehículo NO está en mantenimiento
  4. NO es día no laborable
  5. Respeta buffers configurados
- Si CUALQUIERA de estas validaciones falla: clase NO se agenda
- NO permitir "agendar pendiente de confirmación" - debe ser real desde el inicio
  **Justificación:** Respuesta #49 - **"Tiene que ser real la disponibilidad... SIEMPRE las citas que salgan en el sistema deben ser reales y previamente verificadas que de verdad existen"**
  **Complejidad:** MEDIA-ALTA (muchas validaciones cruzadas)  
  **Prioridad:** CRÍTICA  
  **Tiempo estimado:** Incluido en 1 semana

**Función de validación completa:**

```typescript
const validateAppointmentAvailability = async (
  appointment: AppointmentInput
) => {
  const errors = [];

  // 1. Conflicto de instructor
  const instructorConflict = await checkInstructorConflict(
    appointment.instructor_id,
    appointment.scheduled_date,
    appointment.start_time,
    appointment.end_time
  );
  if (instructorConflict) {
    errors.push("El instructor ya tiene clase a esa hora");
  }

  // 2. Instructor bloqueado
  const instructorBlocked = await checkInstructorBlocked(
    appointment.instructor_id,
    appointment.scheduled_date
  );
  if (instructorBlocked) {
    errors.push(
      `El instructor no está disponible ese día: ${instructorBlocked.reason}`
    );
  }

  // 3. Conflicto de vehículo
  const vehicleConflict = await checkVehicleConflict(
    appointment.vehicle_id,
    appointment.scheduled_date,
    appointment.start_time,
    appointment.end_time
  );
  if (vehicleConflict) {
    errors.push("El vehículo ya está asignado a otra clase");
  }

  // 4. Vehículo en mantenimiento
  const vehicleMaintenance = await checkVehicleMaintenance(
    appointment.vehicle_id,
    appointment.scheduled_date
  );
  if (vehicleMaintenance) {
    errors.push("El vehículo está en mantenimiento");
  }

  // 5. Día no laborable
  const nonWorkingDay = await checkNonWorkingDay(
    appointment.school_id,
    appointment.scheduled_date
  );
  if (nonWorkingDay) {
    errors.push(`La escuela no opera ese día: ${nonWorkingDay.reason}`);
  }

  // 6. Buffers
  const bufferViolation = await checkBufferViolation(
    appointment.instructor_id,
    appointment.vehicle_id,
    appointment.scheduled_date,
    appointment.start_time,
    appointment.end_time,
    appointment.school_id
  );
  if (bufferViolation) {
    errors.push(
      `No hay suficiente tiempo entre clases (buffer: ${bufferViolation.minutes} min)`
    );
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return true;
};
```

### ❌ NO IMPLEMENTAR

#### Horarios de Trabajo Predefinidos

**Decisión:** No implementar concepto de "working hours"  
**Términos:**

- No crear tabla de instructor_working_hours
- No validar "este instructor solo trabaja 9am-5pm"
- Instructor está disponible salvo que esté bloqueado explícitamente
  **Cuándo agregar:** Si 3+ academias piden esta feature  
  **Tiempo ahorrado:** 1-2 semanas

---

## 2.10 TIPOS DE CLASES

### ✅ MANTENER

#### Configuración de Tipos por Escuela

**Decisión:** Cada escuela define sus propios tipos de clases  
**Términos:**

- Owner/Admin puede crear tipos de clases custom
- Cada tipo tiene:
  - Nombre (ej: "Clase práctica", "Clase teórica", "Examen práctico")
  - Duración en minutos (ej: 60, 90, 30)
  - Es práctica o teórica (boolean)
  - Máximo de estudiantes (siempre 1 si es práctica, puede ser N si es teórica)
- Al crear clase: user elige el tipo, y duración se auto-completa
  **Justificación:**
- Respuesta #50: "Sí, hay diferentes clases, seria idea que eso lo setee cada escuela"
- Respuesta #51: "Seria genial que lo determine la escuela"
  **Complejidad:** MEDIA  
  **Tiempo estimado:** 4-5 días

**Schema:**

```sql
CREATE TABLE class_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  owner_id UUID NOT NULL REFERENCES owners(id),

  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

  is_practical BOOLEAN DEFAULT true,
  is_theoretical BOOLEAN DEFAULT false,
  max_students INTEGER DEFAULT 1 CHECK (max_students > 0),

  -- Validación: si es práctica, max_students debe ser 1
  CONSTRAINT check_practical_max_students
    CHECK (NOT is_practical OR max_students = 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(school_id, name, deleted_at)
);

CREATE INDEX idx_class_types_school ON class_types(school_id, deleted_at);

-- Al crear clase, referenciar el tipo:
ALTER TABLE appointments
ADD COLUMN class_type_id UUID REFERENCES class_types(id);
```

**Tipos default al crear escuela:**

```sql
-- Auto-crear tipos básicos:
INSERT INTO class_types (school_id, owner_id, name, duration_minutes, is_practical, max_students) VALUES
  (NEW.id, NEW.owner_id, 'Clase práctica', 60, true, 1),
  (NEW.id, NEW.owner_id, 'Clase teórica', 90, false, 10),
  (NEW.id, NEW.owner_id, 'Examen práctico', 30, true, 1);
```

#### Regla Invariable: Prácticas son 1-on-1

**Decisión:** Clases prácticas SIEMPRE son 1 instructor con 1 estudiante  
**Términos:**

- Constraint en BD: si `is_practical = true`, entonces `max_students = 1`
- UI no permite cambiar max_students si es clase práctica
- Clases teóricas pueden ser grupales (N estudiantes)
  **Justificación:** Respuesta #56 - "Siempre es 1-1 las prácticas"
  **Complejidad:** BAJA  
  **Tiempo estimado:** Incluido en 4-5 días

### ❌ POSPONER

#### Recursos Específicos por Tipo de Clase

**Decisión:** No implementar requerimientos de recursos específicos  
**Términos actuales:**

- Cualquier vehículo puede usarse para cualquier clase
- No validar "esta clase requiere auto con cámara reversa"
  **Términos futuros:**
- Tabla: class_type_resource_requirements
- Validar que vehículo tiene features necesarias antes de agendar
  **Cuándo agregar:** Feature futura, si hay demanda  
  **Tiempo ahorrado:** 2 semanas  
  **Justificación:** Respuesta #52 - "Puede ser una feature futura"

---

## 2.11 CLASES GRUPALES

### ✅ MANTENER

#### Soporte para Clases Teóricas Grupales

**Decisión:** Permitir clases con múltiples estudiantes simultáneos  
**Términos:**

- Clases teóricas pueden tener N estudiantes (ej: máximo 10)
- Cada estudiante "enrollado" en la clase grupal consume 1 crédito
- Al crear clase grupal: Owner selecciona lista de estudiantes
- Cada estudiante ve la clase en su calendario
- Instructor ve todos los estudiantes enrollados
  **Justificación:**
- Respuesta #54: "Existe"
- Respuesta #55: "Sí existe" (es crítico)
  **Complejidad:** BAJA-MEDIA  
  **Prioridad:** INCLUIR en MVP  
  **Tiempo estimado:** 2-3 días

**Schema:**

```sql
CREATE TABLE appointment_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  student_id UUID NOT NULL REFERENCES students(id),

  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN, -- null = no marcado, true = asistió, false = no asistió

  UNIQUE(appointment_id, student_id)
);

CREATE INDEX idx_appointment_enrollments ON appointment_enrollments(appointment_id);
CREATE INDEX idx_student_enrollments ON appointment_enrollments(student_id);

-- Modificar appointments:
-- Para clase 1-on-1: student_id está poblado (legacy)
-- Para clase grupal: student_id es NULL, estudiantes en enrollments
```

**Lógica:**

```typescript
const createGroupClass = async (classData: {
  instructor_id: string;
  vehicle_id: string;
  class_type_id: string;
  scheduled_date: Date;
  start_time: string;
  student_ids: string[]; // Lista de estudiantes
}) => {
  // 1. Validar que class_type permite grupo
  const classType = await getClassType(classData.class_type_id);
  if (classType.max_students < classData.student_ids.length) {
    throw new Error(
      `Máximo ${classType.max_students} estudiantes para este tipo de clase`
    );
  }

  // 2. Crear appointment (sin student_id)
  const appointment = await createAppointment({
    ...classData,
    student_id: null, // Clase grupal
    is_group_class: true,
  });

  // 3. Enrollar estudiantes
  for (const studentId of classData.student_ids) {
    await enrollStudent(appointment.id, studentId);

    // 4. Consumir crédito de cada estudiante
    await consumeStudentCredit(studentId);
  }

  return appointment;
};
```

#### Validación de Capacidad

**Decisión:** No permitir enrollar más estudiantes que el máximo  
**Términos:**

- Al intentar enrollar estudiante: validar que no se exceda max_students
- UI muestra "X/Y plazas ocupadas"
- Si clase está llena: botón de enrollar deshabilitado
  **Complejidad:** BAJA  
  **Tiempo estimado:** Incluido en 2-3 días

### ✅ CONFIRMAR

#### Prácticas Siempre 1-on-1

**Decisión:** Clases prácticas NUNCA son grupales  
**Términos:**

- Si `is_practical = true`: max_students forzado a 1
- UI no permite crear clase práctica grupal
- Constraint en BD previene esto
  **Justificación:** Respuesta #56 - "Siempre es 1-1 las prácticas"

---

## 2.12 ANALYTICS Y REPORTES

### ✅ MANTENER - CRÍTICO

#### Todas las Métricas son Críticas para MVP

**Decisión:** Implementar dashboard completo con todas las métricas solicitadas  
**Términos:**

- Respuesta #61: "Todas" las métricas son importantes
- Respuesta #62: "Sí" son críticas para MVP
- Respuesta #63: "Ufff, las 2 cosas" (dashboards Y export Excel)
  **Complejidad:** ALTA  
  **Prioridad:** CRÍTICA  
  **Tiempo estimado:** 1.5-2 semanas

#### Métricas a Implementar

**1. Clases por Período**

```sql
-- Query para clases por día/semana/mes:
SELECT
  DATE_TRUNC('day', scheduled_date) as date,
  COUNT(*) as total_classes,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows
FROM appointments
WHERE school_id = $1
  AND scheduled_date BETWEEN $2 AND $3
  AND deleted_at IS NULL
GROUP BY DATE_TRUNC('day', scheduled_date)
ORDER BY date;
```

**2. Utilización de Instructores**

```sql
-- % de horas ocupadas por instructor:
WITH instructor_hours AS (
  SELECT
    i.id,
    i.name,
    COUNT(a.id) as total_classes,
    SUM(ct.duration_minutes) as total_minutes_worked,
    -- Asumir jornada de 8 horas = 480 minutos por día hábil
    (DATE_TRUNC('day', $3) - DATE_TRUNC('day', $2)) * 480 as available_minutes
  FROM instructors i
  LEFT JOIN appointments a ON a.instructor_id = i.id
    AND a.scheduled_date BETWEEN $2 AND $3
    AND a.deleted_at IS NULL
  LEFT JOIN class_types ct ON ct.id = a.class_type_id
  WHERE i.school_id = $1
  GROUP BY i.id, i.name
)
SELECT
  name,
  total_classes,
  total_minutes_worked,
  ROUND((total_minutes_worked::NUMERIC / available_minutes * 100), 2) as utilization_percentage
FROM instructor_hours
ORDER BY utilization_percentage DESC;
```

**3. Utilización de Vehículos**

```sql
-- Similar a instructores pero para vehículos:
WITH vehicle_hours AS (
  SELECT
    v.id,
    v.make || ' ' || v.model as vehicle_name,
    COUNT(a.id) as total_classes,
    SUM(ct.duration_minutes) as total_minutes_used
  FROM vehicles v
  LEFT JOIN appointments a ON a.vehicle_id = v.id
    AND a.scheduled_date BETWEEN $2 AND $3
    AND a.deleted_at IS NULL
  LEFT JOIN class_types ct ON ct.id = a.class_type_id
  WHERE v.school_id = $1
  GROUP BY v.id, v.make, v.model
)
SELECT
  vehicle_name,
  total_classes,
  total_minutes_used,
  ROUND((total_minutes_used::NUMERIC / (8 * 60 * 30)), 2) as utilization_percentage -- 30 días, 8h/día
FROM vehicle_hours
ORDER BY utilization_percentage DESC;
```

**4. Horarios Pico (Heat Map)**

```sql
-- Clases por día de semana y hora:
SELECT
  EXTRACT(DOW FROM scheduled_date) as day_of_week, -- 0=Sunday, 6=Saturday
  EXTRACT(HOUR FROM start_time) as hour_of_day,
  COUNT(*) as class_count
FROM appointments
WHERE school_id = $1
  AND scheduled_date BETWEEN $2 AND $3
  AND deleted_at IS NULL
GROUP BY day_of_week, hour_of_day
ORDER BY day_of_week, hour_of_day;
```

**5. Tasa de Cancelaciones**

```sql
-- % de clases canceladas vs total:
SELECT
  COUNT(*) as total_classes,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_classes,
  ROUND((COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::NUMERIC / COUNT(*) * 100), 2) as cancellation_rate
FROM appointments
WHERE school_id = $1
  AND scheduled_date BETWEEN $2 AND $3
  AND deleted_at IS NULL;
```

**6. Tasa de No-Shows**

```sql
-- % de no-shows vs total:
SELECT
  COUNT(*) as total_classes,
  COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_classes,
  ROUND((COUNT(CASE WHEN status = 'no_show' THEN 1 END)::NUMERIC / COUNT(*) * 100), 2) as no_show_rate
FROM appointments
WHERE school_id = $1
  AND scheduled_date BETWEEN $2 AND $3
  AND deleted_at IS NULL;
```

#### Dashboard UI

**Decisión:** Interface visual con gráficos + tablas  
**Términos:**

- Usar librería de charts: Recharts o Chart.js
- Gráficos incluidos:
  - Line chart: clases por día (último mes)
  - Bar chart: utilización de instructores (%)
  - Bar chart: utilización de vehículos (%)
  - Heat map: horarios pico (día × hora)
  - Pie chart: estados de clases (completadas, canceladas, no-shows)
- KPIs grandes arriba:
  - Total clases este mes
  - Tasa de cancelaciones (%)
  - Tasa de no-shows (%)
  - Instructor más utilizado
  - Vehículo más utilizado
- Filtros:
  - Rango de fechas (última semana, último mes, últimos 3 meses, custom)
  - Por location (si tiene múltiples)
- Botón "Export to Excel" en cada sección
  **Complejidad:** ALTA  
  **Tiempo estimado:** 1.5 semanas

#### Export a Excel/CSV

**Decisión:** Permitir exportar todas las métricas a archivo  
**Términos:**

- Usar librería: xlsx o papaparse
- Formato: .xlsx (Excel) o .csv
- Incluir:
  - Hoja 1: Resumen general (KPIs)
  - Hoja 2: Clases por día
  - Hoja 3: Utilización de instructores
  - Hoja 4: Utilización de vehículos
  - Hoja 5: Horarios pico (matriz)
- Botón "Export All" que genera archivo con todas las hojas
- Botones individuales para exportar cada métrica
  **Justificación:** Respuesta #63 - "Las 2 cosas" (dashboard Y export)
  **Complejidad:** MEDIA  
  **Tiempo estimado:** Incluido en 1.5-2 semanas

**Ejemplo de export:**

```typescript
const exportToExcel = async (
  schoolId: string,
  startDate: Date,
  endDate: Date
) => {
  const workbook = new ExcelJS.Workbook();

  // Hoja 1: Resumen
  const summarySheet = workbook.addWorksheet("Resumen");
  const summary = await getSummaryMetrics(schoolId, startDate, endDate);
  summarySheet.addRow(["Métrica", "Valor"]);
  summarySheet.addRow(["Total clases", summary.total_classes]);
  summarySheet.addRow(["Tasa cancelaciones", `${summary.cancellation_rate}%`]);
  summarySheet.addRow(["Tasa no-shows", `${summary.no_show_rate}%`]);

  // Hoja 2: Clases por día
  const dailySheet = workbook.addWorksheet("Clases por Día");
  const dailyData = await getClassesByDay(schoolId, startDate, endDate);
  dailySheet.addRow([
    "Fecha",
    "Total",
    "Completadas",
    "Canceladas",
    "No-shows",
  ]);
  dailyData.forEach((row) => {
    dailySheet.addRow([
      row.date,
      row.total,
      row.completed,
      row.cancelled,
      row.no_shows,
    ]);
  });

  // ... más hojas

  // Descargar
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
```

### ❌ NO IMPLEMENTAR (por ahora)

#### Reportes Predictivos

**Decisión:** No implementar forecasting o predicciones  
**Términos:**

- No predecir demanda futura
- No sugerir "vas a necesitar otro instructor en 2 meses"
- Solo mostrar datos históricos
  **Cuándo agregar:** Post-MVP si hay valor real  
  **Tiempo ahorrado:** 2-3 semanas

#### Comparativas con Industria

**Decisión:** No mostrar benchmarks externos  
**Términos:**

- No comparar "tu tasa de cancelaciones vs promedio de la industria"
- Solo mostrar métricas propias
  **Cuándo agregar:** Cuando tengan 100+ academias y data aggregada  
  **Tiempo ahorrado:** 1 semana

---

## ⏱️ TIMELINE DETALLADO - FASE 2

**Total: 10 semanas calendario (2.5 meses con 20h/semana)**

### Semana 1-2: Foundation + Spike WhatsApp

- **Días 1-3:** Spike técnico WhatsApp Business API
  - Crear cuenta Twilio/360dialog
  - Enviar primer mensaje de prueba
  - Validar costos y rate limits
  - Documentar findings
- **Días 4-7:** Schema design completo
  - appointments table
  - appointment_series table
  - class_types table
  - instructor_availability table
  - school_non_working_days table
  - reminder_settings table
  - reminders_sent table
- **Días 8-10:** Migrations + RLS policies para todas las tablas nuevas

### Semana 3-4: Detección de Conflictos + Buffers

- **Semana 3:**
  - Función de validación completa de conflictos
  - Validación de buffers configurables
  - Validación de disponibilidad de instructor
  - Validación de días no laborables
  - Tests unitarios de validaciones
- **Semana 4:**
  - UI de configuración de buffers
  - UI de días no laborables
  - UI de disponibilidad de instructores
  - Testing de edge cases

### Semana 5-6: Clases Recurrentes + Tipos de Clases

- **Semana 5:**
  - CRUD de appointment_series
  - Lógica de creación de series
  - Sistema de excluded_dates
  - Modificar clase individual vs serie
- **Semana 6:**
  - CRUD de class_types
  - UI para crear/editar tipos
  - Integración de tipos con appointments
  - Clases grupales (enrollments)
  - Testing de recurrencia

### Semana 7: Políticas de Cancelación + Re-programación

- **Días 1-3:** Políticas de cancelación
  - Configuración por escuela
  - Bloqueo de cancelaciones
  - Excepciones manuales
  - Cancelación por instructor
- **Días 4-7:** Re-programación
  - Lógica de reschedule
  - Límites configurables
  - UI de reprogramación
  - Tests de políticas

### Semana 8: Notificaciones (CRÍTICO - alta complejidad)

- **Días 1-2:** Integración WhatsApp API
  - Setup de Twilio/360dialog
  - Envío de mensajes básicos
  - Manejo de errores
- **Días 3-4:** Templates y scheduler
  - Templates de mensajes
  - Scheduler de recordatorios (cron job)
  - Tabla de tracking (reminders_sent)
- **Días 5-6:** Email fallback
  - Setup de Resend o Supabase Auth emails
  - Templates HTML
  - Lógica de fallback
- **Día 7:** Testing completo de notificaciones

### Semana 9: UI de Calendario + Portal Instructor

- **Días 1-4:** 4 vistas de calendario
  - Vista diaria
  - Vista semanal
  - Vista mensual
  - Vista de lista
  - Color-coding
  - Responsive design
- **Días 5-7:** Portal de instructor
  - Vista de SUS clases
  - Marcar asistencia/no-show
  - Ver info de estudiantes
  - Tests de permisos

### Semana 10: Analytics + Imprimir + Polish

- **Días 1-4:** Dashboard de analytics
  - Queries de métricas
  - Gráficos (Recharts)
  - KPIs
  - Heat map de horarios pico
- **Días 5-6:** Export a Excel
  - Implementar export
  - Testing de formatos
  - Imprimir horarios (PDF)
- **Día 7:** Polish final
  - Bug fixing
  - Performance tuning
  - Documentación
  - Deploy a staging

---

## 📋 CHECKLIST DE ACEPTACIÓN - FASE 2

Antes de considerar Fase 2 completa, verificar:

### Funcionalidad Core

- [ ] Sistema detecta y bloquea todos los 6 tipos de conflictos
- [ ] Buffers configurables funcionan correctamente
- [ ] No se pueden agendar clases en días bloqueados (instructor, vehículo, escuela)
- [ ] Clases recurrentes se crean correctamente
- [ ] Modificar clase individual no afecta serie
- [ ] Modificar serie afecta solo clases futuras (o todas si se elige)
- [ ] Días no laborables se respetan al crear series
- [ ] 4 vistas de calendario funcionan y son responsive

### Cancelación y Reprogramación

- [ ] Políticas de cancelación se respetan (bloqueo funciona)
- [ ] Owner/Secretary pueden hacer excepciones
- [ ] Cancelación por instructor devuelve crédito automáticamente
- [ ] No-shows consumen crédito correctamente
- [ ] Reprogramación gratuita funciona si respeta período
- [ ] Límite de reprogramaciones se respeta

### Notificaciones

- [ ] WhatsApp Business API funciona end-to-end
- [ ] Recordatorios se envían 24h y 2h antes (o según configuración)
- [ ] Email fallback funciona si WhatsApp falla
- [ ] Templates de mensajes están en español argentino
- [ ] Notificaciones de cancelación/cambio se envían

### Portal Instructor

- [ ] Instructor puede ver SOLO sus clases
- [ ] Instructor puede marcar asistencia/no-show
- [ ] Instructor NO puede ver clases de otros
- [ ] Instructor NO puede ver finanzas
- [ ] RLS policies validadas

### Analytics

- [ ] Dashboard muestra todas las métricas correctamente
- [ ] Gráficos se renderizan bien
- [ ] Export a Excel funciona
- [ ] Imprimir horarios genera PDF correcto
- [ ] Filtros de fecha funcionan

### Validaciones Críticas

- [ ] NO se puede agendar instructor en día bloqueado
- [ ] NO se puede agendar vehículo en mantenimiento
- [ ] NO se puede agendar en día no laborable
- [ ] NO se permite doble-booking
- [ ] Buffers se respetan siempre
- [ ] Clases prácticas son siempre 1-on-1

### Performance

- [ ] Validación de conflictos toma <2 segundos
- [ ] Cargar calendario semanal toma <1 segundo
- [ ] Crear serie de 10 clases toma <5 segundos
- [ ] Queries de analytics toman <3 segundos
- [ ] Envío de recordatorio toma <5 segundos

### Testing

- [ ] 100% de tests de validaciones pasan
- [ ] Tests de clases recurrentes pasan
- [ ] Tests de políticas de cancelación pasan
- [ ] Integration tests de notificaciones pasan
- [ ] Load testing básico completado (100 clases simultáneas)

### Documentación

- [ ] Todas las funciones tienen JSDoc comments
- [ ] Schema está documentado
- [ ] Políticas de cancelación documentadas
- [ ] Setup de WhatsApp API documentado
- [ ] README de Fase 2 completo

---

## 🚨 RIESGOS IDENTIFICADOS

### Riesgo Alto: WhatsApp Business API (Cero Experiencia)

**Problema:** Nunca han usado WhatsApp Business API  
**Mitigación:**

- **Spike técnico OBLIGATORIO de 2-3 días ANTES de comenzar Fase 2**
- Usar servicio managed (Twilio, 360dialog) en vez de API directa
- Email como fallback siempre activo
- Tener plan B: si WhatsApp no funciona en tiempo, lanzar MVP con solo email y agregar WhatsApp después
- Documentar exhaustivamente el setup
  **Impacto si falla:** Feature está en MVP por lo que podría retrasar lanzamiento  
  **Probabilidad:** MEDIA  
  **Plan de contingencia:** Lanzar con email, agregar WhatsApp en Fase 2.5

### Riesgo Alto: Complejidad de Validaciones

**Problema:** Muchas reglas interdependientes de validación  
**Impacto:** Bugs pueden permitir conflictos que "aniquilan el negocio"  
**Mitigación:**

- Testing exhaustivo de CADA validación
- Tests de combinaciones (ej: instructor bloqueado + día no laborable)
- Code review obligatorio de toda lógica de validación
- Usar transactions para atomicidad
- Documentar TODAS las reglas de negocio
  **Probabilidad:** MEDIA  
  **Plan de contingencia:** Dedicar semana extra si es necesario

### Riesgo Medio: Performance de Queries de Disponibilidad

**Problema:** Queries de "qué horas están libres" pueden ser lentas  
**Mitigación:**

- Indexes correctos desde día 1
- Cache de configuraciones (buffers, políticas)
- Load testing con 1000+ clases
- Query optimization antes de producción
  **Probabilidad:** BAJA-MEDIA  
  **Plan de contingencia:** Optimizar queries o agregar cache si hay slowness

### Riesgo Medio: Complejidad de Clases Recurrentes

**Problema:** Lógica de modificar individual vs serie puede tener bugs  
**Mitigación:**

- Tests exhaustivos de todos los casos
- Validar UX con usuario antes de implementar
- Modelo de datos claro con series + exceptions
- Documentar comportamiento esperado en cada caso
  **Probabilidad:** MEDIA  
  **Plan de contingencia:** Simplificar UX si es muy complejo (ej: solo permitir modificar serie completa)

### Riesgo Bajo: Timeline Optimista

**Problema:** 10 semanas puede ser poco si hay blockers  
**Mitigación:**

- Buffer de 20% en cada estimación (ya incluido)
- Priorizar features críticas primero
- Re-evaluar timeline cada 2 semanas
- Comunicar delays temprano
  **Probabilidad:** MEDIA  
  **Plan de contingencia:** Posponer features no críticas si se atrasan

---

## 🎯 SIGUIENTE PASO

Una vez que confirmes estas decisiones de Fase 2, procedemos a:

1. **Spike Técnico de WhatsApp** (2-3 días) - OBLIGATORIO ANTES DE EMPEZAR

   - Setup de cuenta
   - Enviar mensaje de prueba
   - Validar costos
   - Documentar

2. **Analizar Fase 3: Gestión de Recursos** con el mismo nivel de detalle

   - Students (CRUD, créditos, packages)
   - Instructors (gestión, disponibilidad)
   - Vehicles (mantenimiento, asignación)

3. **Analizar Fase 4: Gestión de Pagos**

   - Mercado Pago integration
   - Registro manual de pagos
   - Tracking de créditos

4. **Crear el documento maestro consolidado** después de analizar todas las fases

---

**¿Estás de acuerdo con estas decisiones de Fase 2?**
