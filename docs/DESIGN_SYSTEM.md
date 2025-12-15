# Sistema de Diseño - DriverCloudMD

Este documento define las reglas de estilo y consistencia visual del proyecto.

## 1. Fuente de la Verdad (CSS Variables)
El estilo global se controla desde **`src/app/globals.css`**. Aquí se definen los colores semánticos.

-   **Tipografía:** `Inter` (Configurada en `src/app/layout.tsx`).
-   **Iconografía:** `Lucide React` (Estilo limpio, trazo fino).
-   **Bordes:** `Rounded-lg` (0.5rem) para tarjetas y botones.

## 2. Paleta de Colores (Theme)
No usamos códigos HEX (`#1152d4`) directamente en los componentes. Usamos las **variables semánticas** de Tailwind/Shadcn para soportar Modo Oscuro automáticamente.

| Variable | Tailwind Class | Uso |
| :--- | :--- | :--- |
| `--primary` | `bg-primary` | Botones principales, elementos activos, marca. |
| `--secondary` | `bg-secondary` | Botones secundarios, fondos de contraste suave. |
| `--muted` | `bg-muted` | Fondos de áreas laterales (Sidebar), elementos deshabilitados. |
| `--accent` | `bg-accent` | Hover states, elementos destacados momentáneamente. |
| `--destructive` | `bg-destructive` | Acciones de peligro (Borrar, Cerrar Sesión). |

### Ejemplo de uso correcto:
```tsx
// ✅ CORRECTO (Usa semantic class)
<div className="bg-primary text-primary-foreground">Hola</div>

// ❌ INCORRECTO (Hardcoded)
<div className="bg-[#1152d4] text-white">Hola</div>
```

## 3. Componentes Base (`src/components/ui/`)
Para mantener la consistencia, **NUNCA** crees elementos HTML nativos (`<button>`, `<input>`) directamente si existe un componente UI.

-   **Botones:** Usa `<Button variant="...">`.
    -   `default`: Acción principal.
    -   `outline`: Acciones secundarias.
    -   `ghost`: Botones en barras de herramientas o menús.
-   **Tarjetas:** Usa `<Card>` para agrupar contenido en el Dashboard.
-   **Inputs:** Usa `<Input>` y `<Label>`.

## 4. Estructura de Layouts
La consistencia estructural se maneja en los layout shells:

-   **Dashboard:** `src/components/layout/Sidebar.tsx` (Navegación) y `Header.tsx`.
-   **Auth:** `src/app/(auth)/layout.tsx` (Wrapper del dashboard).
-   **Public:** `src/app/(public)/layout.tsx` (Landing page).

Para agregar nuevas páginas al Dashboard, simplemente crea el archivo en `src/app/(auth)/(dashboard)/[nueva-ruta]/page.tsx` y automáticamente heredará el Sidebar y Header.
