# 🏗️ Estructura del Proyecto: DriverCloudMD

Esta estructura está diseñada para **Next.js 15 (App Router)** con **Supabase**, optimizada para escalabilidad y clara separación de roles (Admin, Instructor, Estudiante).

## 📂 Visión General de Directorios

```text
/
├── .github/                # Workflows de CI/CD (GitHub Actions)
├── public/                 # Assets estáticos (imágenes, fuentes, favicon)
├── src/                    # Código fuente principal
│   ├── app/                # Rutas de Next.js (App Router)
│   ├── components/         # Componentes visuales reutilizables
│   ├── features/           # Módulos de negocio (Lógica Core)
│   ├── hooks/              # Hooks globales reutilizables
│   ├── lib/                # Utilidades, configuración de clientes (Supabase, etc)
│   ├── services/           # Lógica de interacción con APIs/DB (Service Layer)
│   ├── types/              # Definiciones de tipos TypeScript globales y DB
│   └── styles/             # Estilos globales (Tailwind)
├── tests/                  # Tests E2E (Playwright)
├── supabase/               # Migraciones y configuración local de Supabase
├── middleware.ts           # Middleware de Next.js (Auth & RBAC)
└── [Archivos de Config]    # next.config, tailwind.config, etc.
```

---

## 🚀 Detalle: `src/app` (Rutas y Layouts)

Organizamos las rutas usando **Route Groups** `(folder)` para separar layouts y lógica de autenticación sin afectar la URL.

```text
src/app/
├── (public)/               # Rutas públicas
│   ├── page.tsx            # Landing page
│   ├── login/              # Pantalla de Login unificada
│   └── forgot-password/    # Recuperación de clave
│
├── (auth)/                 # Rutas protegidas (Layout con Auth Check)
│   │
│   ├── (dashboard)/        # 🏢 ADMIN & STAFF DASHBOARD
│   │   ├── layout.tsx      # Sidebar, Header de Staff
│   │   ├── dashboard/      # Home del Admin
│   │   ├── students/       # Gestión de Estudiantes
│   │   ├── instructors/    # Gestión de Instructores
│   │   ├── vehicles/       # Gestión de Vehículos
│   │   └── finance/        # Reportes y Pagos
│   │
│   ├── (student-portal)/   # 🎓 STUDENT PORTAL
│   │   ├── layout.tsx      # Layout móvil/simple para estudiantes
│   │   ├── portal/         # Home del estudiante (Dashboard)
│   │   ├── booking/        # Flow de agendamiento
│   │   └── history/        # Historial de clases
│   │
│   ├── (instructor-portal)/ # 🚘 INSTRUCTOR PORTAL
│   │   ├── layout.tsx      # Layout optimizado para móvil
│   │   └── instructor/     # Agenda del instructor
│
├── api/                    # API Routes (Webhooks de MercadoPago, Cron Jobs)
├── layout.tsx              # Root Layout (Providers globales)
└── globals.css             # Tailwind imports
```

---

## 🧠 Detalle: `src/features` (Feature-First Architecture)

En lugar de agrupar todo por "components" o "hooks", agrupamos por **funcionalidad de negocio**. Esto hace que el código sea más fácil de mantener.

```text
src/features/
├── auth/                   # Lógica de Autenticación
│   ├── components/         # LoginForm, ForgotPasswordForm
│   ├── hooks/              # useAuth, useSession
│   └── utils/              # Validaciones de password, roles
│
├── scheduling/             # 📅 CORE: Lógica de Agenda
│   ├── components/
│   │   ├── Calendar/       # Componente visual de calendario
│   │   ├── BookingWizard/  # Flow de reserva paso a paso
│   │   └── TimeSlotPicker/ # Selector de horarios
│   ├── hooks/              # useAvailability, useBookings
│   └── utils/              # Lógica de conflictos, buffers
│
├── students/               # Gestión de Estudiantes
│   ├── components/         # StudentList, StudentProfile, StudentForm
│   └── types/              # Tipos específicos de estudiante
│
├── finance/                # Pagos y Paquetes
│   ├── components/         # PaymentForm, TransactionHistory
│   └── services/           # Integración MercadoPago frontend
│
└── audit/                  # Logs de auditoría
    └── components/         # AuditLogViewer
```

---

## 🛠️ Detalle: `src/components` (UI Compartida)

Componentes puramente visuales, sin lógica de negocio compleja.

```text
src/components/
├── ui/                     # 🧱 Shadcn/UI Primitives (Botones, Inputs, Modales)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── shared/                 # Componentes compuestos reutilizables
│   ├── DataTable.tsx       # Tabla genérica con filtros
│   ├── PageHeader.tsx      # Título y acciones de página
│   ├── StatusBadge.tsx     # Badge (Activo, Inactivo, Pendiente)
│   └── ConfirmDialog.tsx   # Modal de confirmación genérico
```

---

## 📚 Detalle: `src/lib` y `src/services`

Separación entre configuración técnica y llamadas a datos.

```text
src/lib/
├── supabase/
│   ├── client.ts           # Cliente Client-side
│   ├── server.ts           # Cliente Server-side (Cookies)
│   └── middleware.ts       # Cliente para Middleware
├── utils.ts                # cn() para Tailwind, formatters
└── constants.ts            # Constantes globales (ROLES, STATUS)

src/services/               # Capa de "Fetch" (Server Actions o API calls)
├── students.service.ts     # getStudents, createStudent
├── bookings.service.ts     # createBooking, getAvailability
└── payments.service.ts     # processPayment
```

---

## 🛡️ Archivos Críticos

1.  **`src/middleware.ts`**: El guardián de la seguridad.
    *   Verifica sesión de Supabase.
    *   Redirige si no hay sesión.
    *   **Role-Based Redirect:** Envía al usuario a su portal correcto (`/portal`, `/dashboard` o `/instructor`) según su rol en la DB.

2.  **`src/types/database.types.ts`**:
    *   Generado automáticamente desde Supabase CLI.
    *   La fuente de la verdad para TypeScript.

## 🧪 Estrategia de Testing (Tests Folder)

```text
tests/
├── e2e/
│   ├── auth.spec.ts        # Login flows
│   ├── rls.spec.ts         # Pruebas de seguridad de datos
│   └── booking.spec.ts     # Flow crítico de reserva
├── fixtures/               # Datos de prueba
└── playwright.config.ts    # Configuración de Playwright
```
