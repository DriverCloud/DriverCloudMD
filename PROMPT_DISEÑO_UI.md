# Prompt para Diseño de Frontend - DriverCloudMD

**Rol:** Eres un Ingeniero de Frontend Senior experto en UX/UI, especializado en construir aplicaciones SaaS modernas usando **Next.js 15**, **Tailwind CSS v4** y **Shadcn/UI**.

**Contexto del Proyecto:**
Estamos construyendo "DriverCloudMD", un SaaS para la gestión de escuelas de manejo. El público objetivo son dueños de escuelas (personas de 40-60 años) y secretarios. El diseño debe ser:
1.  **Profesional y Sobrio:** Inspirar confianza y solidez.
2.  **Alta Legibilidad:** Fuentes claras (Inter/Geist), buen contraste.
3.  **Intuitivo:** Navegación clara, sin elementos innecesarios.

**Stack Tecnológico:**
-   Framework: Next.js 15 (App Router).
-   Estilos: Tailwind CSS v4.
-   Componentes: Shadcn/UI (Radix Primitives).
-   Iconos: Lucide React.
-   Fuentes: Geist Sans / Inter.

---

## Tarea: Diseñar e Implementar Vistas Clave

Por favor genera el código React (TSX) para las siguientes pantallas. Asegúrate de que el código sea modular, responsive y use los componentes de Shadcn.

### 1. Pantalla de Login (`/login`)
**Objetivo:** Una entrada segura y moderna.
-   **Layout:** Split-screen (Pantalla dividida).
    -   **Izquierda (50%):** Imagen de alta calidad de un instructor enseñando a manejar o un auto de escuela moderno, con un overlay oscuro y un testimonio o frase inspiradora ("Gestiona tu escuela con la confianza de un experto").
    -   **Derecha (50%):** Formulario de login limpio y centrado.
-   **Elementos del Formulario:**
    -   Logo de "DriverCloudMD" arriba.
    -   Título: "Bienvenido de nuevo". (h1)
    -   Subtítulo: "Ingresa tus credenciales para acceder al panel." (p com o text-muted-foreground)
    -   Inputs: Email y Contraseña (usando componente `Input`, `Label`).
    -   Botón de "Olvidé mi contraseña".
    -   Botón principal "Ingresar" (ancho completo, loading state).
    -   Separador con texto "O".
    -   Botón secundario "Ingresar como Demo" (destacado en verde esmeralda para mostrar que es una demo).
-   **Footer pequeño:** Link a "Términos y Condiciones" y "Soporte".

### 2. Dashboard Layout (`/dashboard/*`)
**Objetivo:** Estructura base para la administración.
-   **Sidebar (Navegación Lateral):**
    -   Fijo a la izquierda (collapsible en móvil).
    -   Logo clara y legible arriba.
    -   Menú agrupado por categorías:
        -   *Principal:* Dashboard, Calendario, Clases.
        -   *Recursos:* Estudiantes, Instructores, Vehículos.
        -   *Administración:* Finanzas, Configuración.
    -   Usuario actual abajo con botón de logout.
    -   Uso de iconos `lucide-react` para cada ítem.
    -   Indicador visual claro de "Página Activa" (bg-accent/text-accent-foreground).
-   **Header (Barra Superior):**
    -   Barra de búsqueda global ("Buscar estudiante...").
    -   Botón de notificaciones (Campana con badge).
    -   Menú de usuario (Avatar).
    -   Breadcrumbs (Migas de pan) para saber dónde estoy.

### 3. Dashboard Home (`/dashboard`)
**Objetivo:** Vista general del estado del negocio (KPIs).
-   **Sección de KPIs (Grid de 4 tarjetas):**
    1.  **Ingresos del Mes:** Monto total, con indicador de % de crecimiento vs mes anterior (verde/rojo).
    2.  **Estudiantes Activos:** Número total, + nuevos inscritos esta semana.
    3.  **Clases Hoy:** e.g., "12 / 20" (Completadas/Totales), barra de progreso visual.
    4.  **Vehículos Disponibles:** e.g., "8 de 10" (2 en mantenimiento con alerta amarilla).
-   **Gráfico Principal (Placeholder):**
    -   Tarjeta grande "Actividad de Clases (Últimos 7 días)".
-   **Listas Rápidas (Grid 2 columnas):**
    -   *Próximas Clases:* Lista compacta de las siguientes 3 clases (Hora, Alumno, Instructor, Status).
    -   *Pagos Recientes:* Lista de los últimos ingresos registrados.

---

**Reglas de Código:**
-   Usa `export function ComponentName() { ... }`.
-   Importa componentes UI desde `@/components/ui/...`.
-   Usa `clsx` o `cn()` para clases condicionales.
-   Mantén la accesibilidad (aria-labels).
-   Si necesitas datos, crea constantes `MOCK_DATA` dentro del mismo archivo para que la vista funcione inmediatamente.
