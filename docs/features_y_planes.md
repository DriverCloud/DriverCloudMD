# DriverCloudMD: Features y Propuesta de Planes de Precios

Basado en la arquitectura y código del proyecto (Next.js, Supabase, módulos de facturación, agenda, etc.), aquí tienes el desglose completo de todas las características (features) actuales de la plataforma, agrupadas por módulo, seguido de una propuesta de 3 planes de precios para monetizar tu SaaS.

## 🛠️ Listado Completo de Features

### 1. Sistema de Múltiples Portales (Roles de Usuario)
*   **Admin Dashboard:** Panel de control centralizado y robusto para dueños y coordinadores/secretarios.
*   **Portal de Instructor:** Interfaz optimizada (móvil-friendly) para que los instructores vean su agenda diaria y gestionen sus clases asignadas.
*   **Portal de Estudiante:** Espacio para que el alumno vea su historial de clases, saldo disponible y realice auto-reservas.

### 2. Gestión de Agenda y Reservas (Scheduling Core)
*   **Calendario Interactivo:** Vista gráfica de todas las clases programadas para toda la escuela.
*   **Motor de Auto-reservas (Booking Wizard):** Flujo guiado paso a paso para que alumnos (o administradores) agenden clases fácilmente.
*   **Prevención de Conflictos:** Manejo inteligente de la disponibilidad de instructores, choques de horarios y "buffers" (tiempo libre obligatorio entre clases).

### 3. Gestión de Recursos y Operaciones
*   **Gestión de Estudiantes:** Fichas completas de alumnos, control de clases consumidas vs. compradas, historial de progreso.
*   **Gestión de Instructores:** Asignación de vehículos y clases a instructores específicos.
*   **Gestión de Flota (Vehículos):** Control de inventario, estado dinámico de los vehículos (ej. disponible, en mantenimiento) y alertas visuales.

### 4. Finanzas, eCommerce y Reportes
*   **Venta de Paquetes de Clases:** Configuración y venta de combos estructurados de clases (ej. "Pack Inicial", "Pack Avanzado").
*   **Integración con Pasarelas de Pago:** Cobro online automatizado (ej. MercadoPago).
*   **Historial de Transacciones:** Registro inmutable de ingresos, pagos recientes y deudas.
*   **Generación de Documentos:** Exportación automática de Facturas y Recibos en formato PDF listos para imprimir o enviar.

### 5. Analítica y Dashboard Ejecutivo
*   **Panel de Control en Tiempo Real (KPIs):** Alertas y métricas clave calculadas al instante (Ingresos del mes, % de crecimiento, Estudiantes activos, volumen de clases).
*   **Gráficos Visuales:** Estadísticas avanzadas de tendencias, actividad de los últimos días y rendimiento mediante gráficos dinámicos.
*   **Proyección de Ingresos:** Cálculo predictivo del flujo de caja esperado basado en las clases programadas.

### 6. Seguridad y Auditoría Empresarial
*   **Control de Acceso Granular (RBAC):** Permisos estrictos que aseguran que cada rol solo vea lo que le corresponde (Ej. El instructor no ve los ingresos totales).
*   **Logs de Auditoría:** Historial detallado de qué usuario modificó qué dato (ideal para escuelas con múltiples secretarios combatiendo errores humanos o fraudes).

---

## 💰 Propuesta de Planes de Precios (Formato SaaS)

Con el listado anterior, puedes diseñar fácilmente tu "Tabla de Pricing" en 3 niveles ("Tiers") para escalar orgánicamente a tus clientes.

### 1. Plan Starter (Básico)
*Apuntado a: Instructores independientes o emprendedores que abren su primera escuela (1-2 vehículos).*
*   **Alcance:** 1 Admin, Hasta 2 Instructores, 2 Vehículos, límite de ~50 estudiantes activos.
*   **Features Incluidas:**
    *   Gestión básica de estudiantes y vehículos.
    *   Calendario central para el Administrador.
    *   Registro manual de pagos en efectivo/transferencia.
*   **Features Bloqueadas (Upsell):** Sin portal para estudiantes (el admin hace todo el trabajo de agendar), sin portal para instructores, sin cobros online mediante tarjeta.

### 2. Plan Pro (Growth / Más Popular)
*Apuntado a: Escuelas de manejo establecidas (3-10 autos) que buscan digitalizarse, ahorrar tiempo administrativo y automatizar reservas.*
*   **Alcance:** Hasta 3 usuarios de Oficina (Administradores/Secretarios), 10 Instructores, 10 Vehículos, Estudiantes ilimitados.
*   **Features Incluidas:**
    *   *Todo lo del plan Starter, más:*
    *   **Sistema de Auto-reserva (Student Portal):** Los alumnos se agendan solos 24/7.
    *   **Portal de Instructor:** Los instructores ven su agenda directo en sus celulares.
    *   **Pagos Online / Ecommerce:** Venta de "Paquetes de clases" con cobro automático digital integrado.
    *   **Dashboard Financiero Básico:** Generación de PDFs para recibos y vista de ingresos.

### 3. Plan Enterprise (Premium / Corporativo)
*Apuntado a: Academias grandes, múltiples sucursales, flotas amplias y estructuras con varias líneas de mando.*
*   **Alcance:** Sin límites de Admins, Instructores, Vehículos o Estudiantes. (Soporte Multi-Sede).
*   **Features Incluidas:**
    *   *Todo lo del plan Pro, más:*
    *   **Analítica Avanzada:** Gráficos de tendencia, proyecciones financieras y KPIs gerenciales.
    *   **Módulo de Auditoría (Audit Logs):** Trazabilidad completa para saber qué secretario borró un turno o modificó un pago (indispensable para negocios grandes).
    *   **Gestión Avanzada de Flota:** Alertas precisas de "En Mantenimiento", historial de estado vehicular.
    *   **Soporte Prioritario:** SLA garantizado, integración con canales directos de ayuda.
