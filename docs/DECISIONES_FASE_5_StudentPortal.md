# 🎓 FASE 5: Student Portal - Decisiones Finales

**Proyecto:** Driving School Management SaaS  
**Cliente:** DriverCloud  
**Fecha:** 22 de Octubre 2025  
**Versión:** 1.0 - MVP Scope

---

## 📑 Índice

1. [Acceso y Autenticación](#1-acceso-y-autenticación)
2. [Dashboard del Estudiante](#2-dashboard-del-estudiante)
3. [Visualización de Clases](#3-visualización-de-clases)
4. [Agendamiento de Clases](#4-agendamiento-de-clases)
5. [Cancelación y Re-programación](#5-cancelación-y-re-programación)
6. [Balance y Créditos](#6-balance-y-créditos)
7. [Compra de Paquetes](#7-compra-de-paquetes)
8. [Historial de Pagos](#8-historial-de-pagos)
9. [Perfil y Datos Personales](#9-perfil-y-datos-personales)
10. [Progreso y Evaluaciones](#10-progreso-y-evaluaciones)
11. [Notificaciones](#11-notificaciones)
12. [Comunicación](#12-comunicación)
13. [Post-Graduación](#13-post-graduación)
14. [Mobile Experience](#14-mobile-experience)
15. [Privacidad y Seguridad](#15-privacidad-y-seguridad)
16. [Features Adicionales](#16-features-adicionales)
17. [MVP Scope](#17-mvp-scope)

---

## 1. Acceso y Autenticación

### 1.1 Creación de Cuenta

**Decisión:** El STAFF crea la cuenta del estudiante y le envía credenciales.

**Proceso:**
```yaml
Creación_de_Cuenta:
  quien_crea: "Owner o Secretary"
  desde: "Panel de administración"
  
  pasos:
    1. Staff busca o crea perfil del estudiante
    2. Staff hace clic en "Crear acceso al portal"
    3. Sistema genera credenciales temporales
    4. Sistema envía email automático con:
       - Usuario (email)
       - Contraseña temporal
       - Link al portal
       - Instrucciones de primer login
  
  NO_hay:
    - Auto-registro público
    - Código de invitación
    - Social login (Google/Facebook) en MVP
```

**Justificación:** Control total del staff sobre quién accede al sistema.

---

### 1.2 Método de Login

**Decisión:** Email + contraseña (método tradicional).

**Especificaciones:**
```yaml
Login_Method:
  usuario: email
  contraseña: password
  
  no_soportado_en_MVP:
    - Teléfono + SMS OTP
    - Magic link (sin contraseña)
    - Social login
    - Biometrics
```

---

### 1.3 Primer Login y Seguridad

**Decisión:** Contraseña temporal que DEBE ser cambiada en primer login.

**Flujo completo:**
```yaml
Primer_Login:
  1. Estudiante recibe email con credenciales
  2. Hace clic en link al portal
  3. Ingresa email + contraseña temporal
  4. Sistema detecta que es primer login
  5. Redirige a pantalla "Cambiar Contraseña"
  6. OBLIGATORIO cambiar contraseña antes de continuar
  7. Nueva contraseña debe cumplir requisitos:
     - Mínimo 8 caracteres
     - Al menos 1 mayúscula
     - Al menos 1 número
     - Al menos 1 carácter especial
  8. Después de cambiar: acceso completo al portal

Password_Reset:
  estudiante_puede: "Solicitar reset por su cuenta"
  proceso:
    - Botón "Olvidé mi contraseña"
    - Ingresa email
    - Recibe link de reset
    - Crea nueva contraseña
    - NO requiere intervención del staff
```

---

### 1.4 Verificación de Identidad

**Decisión:** Verificar AMBOS: email Y teléfono.

**Proceso de verificación:**
```yaml
Email_Verification:
  cuándo: "Al crear cuenta"
  método: "Link de verificación en email"
  obligatorio: true
  bloqueo: "No puede usar portal hasta verificar email"
  
  flujo:
    1. Staff crea cuenta
    2. Sistema envía email con link de verificación
    3. Estudiante hace clic en link
    4. Email marcado como verificado
    5. Ahora puede hacer login

Phone_Verification:
  cuándo: "Al crear cuenta"
  método: "SMS con código de 6 dígitos"
  obligatorio: true
  bloqueo: "No puede agendar clases hasta verificar teléfono"
  
  flujo:
    1. Estudiante hace login por primera vez
    2. Después de cambiar contraseña, ve modal "Verificar teléfono"
    3. Sistema envía SMS con código
    4. Estudiante ingresa código
    5. Teléfono marcado como verificado
    6. Ahora puede usar todas las funciones

Nota: Email se verifica ANTES del primer login, teléfono DESPUÉS
```

**Justificación:** 
- Email: comunicación oficial y recuperación de cuenta
- Teléfono: WhatsApp es canal crítico de comunicación + prevención de no-shows

---

### 1.5 Prevención de Cuentas Duplicadas

**Decisión CRÍTICA:** Validación de duplicados SOLO dentro de la misma escuela (no cross-school en MVP).

**Reglas:**
```yaml
Duplicate_Prevention:
  
  Regla_MVP:
    scope: "Solo dentro de una School"
    validar:
      - Email único por School
      - Teléfono único por School
    
    NO_validar:
      - Email duplicado en otra School
      - Teléfono duplicado en otra School
  
  Ejemplo_Escenario:
    Alumno_Juan:
      email: "juan@example.com"
      escuela_A: "Registrado"
      escuela_B: "Puede registrarse con MISMO email"
    
    razon: "En MVP no compartimos recursos entre escuelas"
  
  Migración_Futura:
    cuando: "Post-MVP (cuando compartamos recursos)"
    cambio: "Validar duplicados GLOBAL (cross-school)"
    proceso_migracion:
      - Detectar duplicados existentes
      - Ofrecer "Merge accounts"
      - Estudiante elige escuela principal
      - Mantiene historial de ambas

Database_Check:
  query: |
    SELECT COUNT(*) 
    FROM students 
    WHERE school_id = :school_id 
      AND (email = :email OR phone = :phone)
      AND deleted_at IS NULL
  
  if count > 0:
    mostrar_error: "Ya existe un estudiante con ese email/teléfono en esta escuela"
```

**Caso especial - Estudiante se muda:**
```yaml
Student_Moves:
  escenario: "Alumno se muda a otra ciudad, empieza en otra escuela"
  
  MVP_Workaround:
    - Staff crea NUEVA cuenta en escuela nueva
    - Historial de escuela vieja queda aislado
    - Estudiante tiene 2 cuentas separadas
  
  Post_MVP:
    - Sistema detecta email duplicado cross-school
    - Pregunta: "¿Es el mismo estudiante?"
    - Si SÍ: merge accounts, historial unificado
    - Si NO: permitir duplicado (puede ser homónimo)
```

---

### 1.6 Autenticación de Dos Factores (2FA)

**Decisión:** NO en MVP.

**Justificación:**
- Complejidad adicional
- No es crítico para seguridad inicial
- Usuarios objetivo no están familiarizados con 2FA

**Post-MVP:** 
- Opcional para estudiantes que lo deseen
- Obligatorio para staff (Owner/Secretary)

---

## 2. Dashboard del Estudiante

### 2.1 Página Principal

**Decisión:** Dashboard general con resumen de toda la información crítica.

**Estructura del dashboard:**
```yaml
Dashboard_Layout:
  
  Header:
    - Nombre del estudiante
    - Foto de perfil (si tiene)
    - Nombre de la escuela
    - Balance de créditos (destacado)
  
  Main_Content:
    
    Widget_1_Proxima_Clase:
      título: "Tu Próxima Clase"
      contenido:
        - Fecha y hora
        - Instructor asignado (nombre, SIN foto)
        - Tipo de clase (práctica/teórica)
        - Ubicación pickup
        - Cuenta regresiva: "Faltan 2 días, 5 horas"
        - Botón: "Cancelar" / "Reprogramar"
      
      if no_hay_clases_agendadas:
        mostrar: "No tienes clases agendadas"
        botón: "Agendar una clase"
    
    Widget_2_Balance_Creditos:
      título: "Tus Créditos"
      contenido_principal:
        - Total disponible: "8 créditos"
        - Desglose por paquete:
          * Paquete A: 5 créditos (vencen DD/MM)
          * Paquete B: 3 créditos (vencen DD/MM)
        - Alertas:
          * "⚠️ 2 créditos vencen en 5 días"
          * "❄️ Tienes 1 crédito congelado"
      
      botón: "Comprar más créditos" (si habilitado)
      link: "Ver historial completo"
    
    Widget_3_Historial_Reciente:
      título: "Clases Recientes"
      contenido:
        - Últimas 3 clases completadas
        - Por cada clase:
          * Fecha
          * Instructor
          * Tipo de clase
          * Evaluación (si existe)
        - Link: "Ver historial completo"
    
    Widget_4_Progreso:
      título: "Tu Progreso"
      contenido:
        - Barra de progreso: "15 de 30 clases recomendadas"
        - Estadísticas:
          * Clases prácticas: 10
          * Clases teóricas: 5
        - Próximos pasos / Objetivos (si configurado)
        - Fecha estimada de examen (si configurado)
      
      link: "Ver progreso detallado"
    
    Widget_5_Notificaciones:
      título: "Notificaciones"
      contenido:
        - Últimas 3 notificaciones no leídas
        - Badge con número de no leídas
      
      link: "Ver todas las notificaciones"
  
  Sidebar_derecho:
    - Info de contacto de la escuela
    - WhatsApp de contacto (botón directo)
    - Horarios de atención
    - Botón "Ayuda"

Responsive_Mobile:
  - Widgets apilados verticalmente
  - Prioridad de visualización:
    1. Próxima clase
    2. Balance de créditos
    3. Resto
```

---

### 2.2 Información Crítica Visible

**Decisión:** Todo lo siguiente debe ser visible al instante en el home.

**Lista completa:**
```yaml
Critical_Info_Home:
  ✅ Balance de créditos disponibles (número grande, destacado)
  ✅ Próxima clase agendada (fecha, hora, instructor)
  ✅ Clases pendientes (cantidad)
  ✅ Créditos por vencer (alerta visible si < 7 días)
  ✅ Historial de clases (últimas 3 completadas)
  ✅ Alertas/notificaciones importantes (badge con número)
  ✅ Progreso del curso (barra de progreso)
  ✅ Objetivos/próximos pasos (si configurado)
```

---

### 2.3 Onboarding y Tutorial

**Decisión:** NO hay tutorial automático en MVP.

**Justificación:**
- UI debe ser auto-explicativa
- Staff puede guiar al estudiante presencialmente
- Tooltips inline si son necesarios

**Post-MVP:**
- Tour interactivo opcional
- Videos tutoriales
- "¿Primera vez aquí? Ver guía rápida"

---

### 2.4 Personalización del Dashboard

**Decisión:** Personalización LIMITADA en MVP.

**Permitido:**
```yaml
Customization_Allowed:
  ✅ cambiar_idioma: ['español', 'inglés'] (post-MVP para inglés)
  ✅ cambiar_tema: ['light', 'dark']
  ❌ reordenar_widgets: NO en MVP
  ❌ ocultar_widgets: NO en MVP
  ❌ notificaciones_personalizadas: Sí (ver sección 11)
```

**Configuración:**
```yaml
Settings_Menu:
  ubicación: "Avatar → Configuración"
  opciones:
    - Idioma (dropdown)
    - Tema (toggle: claro/oscuro)
    - Preferencias de notificaciones
    - Cambiar contraseña
    - Cerrar sesión
```

---

## 3. Visualización de Clases

### 3.1 Vistas Disponibles

**Decisión:** AMBAS opciones - calendario visual Y lista.

**Implementación:**
```yaml
Class_Views:
  
  Tabs:
    - "📅 Calendario"
    - "📋 Lista"
  
  Vista_Calendario:
    tipos: ['Día', 'Semana', 'Mes']
    default: 'Semana'
    características:
      - Eventos mostrados como bloques
      - Código de color por tipo de clase
      - Click en evento → modal con detalles
      - Navegación: flechas < >
    
    ejemplo_color_coding:
      - Práctica: Azul
      - Teórica: Verde
      - Completada: Gris
      - Cancelada: Rojo (tachado)
  
  Vista_Lista:
    ordenamiento: "Cronológico (próximas primero)"
    agrupación: "Por fecha"
    características:
      - Tabla/cards con info completa
      - Scroll infinito o paginación
      - Búsqueda y filtros visibles
    
    columnas:
      - Fecha y hora
      - Tipo de clase
      - Instructor
      - Estado
      - Acciones (ver detalles, cancelar, reprogramar)
```

---

### 3.2 Información de Cada Clase

**Decisión:** Información completa EXCEPTO foto de instructor y notas internas.

**Datos visibles:**
```yaml
Class_Details:
  
  Información_Básica:
    ✅ fecha: date
    ✅ hora_inicio: time
    ✅ hora_fin: time (o duración)
    ✅ tipo_clase: enum ['Práctica', 'Teórica']
    ✅ estado: enum ['Agendada', 'Completada', 'Cancelada', 'Reprogramada']
  
  Instructor:
    ✅ nombre_completo: string
    ❌ foto: NO visible para estudiante
    ✅ especialidad: string (ej: "Experto en estacionamiento")
    ❌ teléfono_directo: NO visible
  
  Vehículo:
    ✅ marca: string
    ✅ modelo: string
    ✅ patente: string
    ✅ tipo_transmision: enum ['Manual', 'Automático']
    ❌ foto: NO en MVP
  
  Ubicación:
    ✅ punto_de_encuentro: string (dirección)
    ✅ mapa: link a Google Maps (opcional)
    ✅ notas_ubicacion: text (ej: "Frente a la plaza")
  
  Otros:
    ✅ duración_estimada: integer (minutos)
    ✅ créditos_consumidos: integer (normalmente 1)
    ❌ notas_internas_instructor: NO visible para estudiante
    ❌ notas_privadas_staff: NO visible para estudiante

Evaluación_Instructor:
  if class.status == 'Completada':
    ✅ puede_ver_evaluacion: true
    ✅ puede_ver_comentarios_públicos: true
    ❌ NO_puede_ver_notas_privadas: true
```

**Justificación fotos NO visibles:**
- Foto instructor: privacidad + evitar discriminación
- Foto vehículo: no crítico en MVP

---

### 3.3 Historial de Clases

**Decisión:** Sí, puede ver TODAS sus clases pasadas con información completa.

**Especificaciones:**
```yaml
Class_History:
  
  Sección: "Mi Historial"
  ubicación: "Menú principal → Historial"
  
  Alcance:
    - Todas las clases desde que se registró
    - Sin límite de tiempo (no solo "últimos 6 meses")
  
  Información_Por_Clase:
    todo_lo_de_seccion_3_2: true
    plus:
      - Fecha de creación de la cita
      - Quién agendó (Staff o Auto-agendado)
      - Historial de cambios (si fue reprogramada)
      - Evaluación del instructor (si existe)
  
  Filtros:
    - Por fecha (rango)
    - Por tipo de clase
    - Por instructor
    - Por estado (completada/cancelada/etc)
  
  Exportar:
    - ❌ NO en MVP
    - Post-MVP: PDF / CSV
  
  Estadísticas:
    - Total de clases tomadas
    - Clases prácticas vs teóricas
    - Clases completadas vs canceladas
    - Tasa de asistencia (% no-show)
```

---

### 3.4 Privacidad de Clases

**Decisión:** NO puede ver clases de otros estudiantes (privacidad total).

**Regla:**
```yaml
Privacy_Rule:
  puede_ver: "SOLO sus propias clases"
  NO_puede_ver:
    - Clases de otros estudiantes
    - Horarios ocupados de instructores (solo ve slots libres)
    - Calendario completo de la escuela
  
  excepción_futura:
    "Clases en grupo" (post-MVP):
      - Si hay concepto de clases grupales
      - Ve otros participantes de SU clase grupal
      - NO ve clases grupales de otros
```

---

### 3.5 Búsqueda y Filtros

**Decisión:** Sí a TODOS los filtros mencionados.

**Implementación:**
```yaml
Filters_Search:
  
  Barra_Búsqueda:
    ubicación: "Top de la vista"
    buscar_por:
      - Nombre de instructor
      - Fecha específica
      - Tipo de clase
    
    tipo_búsqueda: "Contains (parcial)"
    ejemplo: "juan" encuentra "Instructor Juan Pérez"
  
  Filtros_Dropdown:
    
    Tipo_de_Clase:
      - Todas
      - Práctica
      - Teórica
    
    Instructor:
      - Todos
      - [Lista de instructores con los que tuvo clase]
    
    Estado:
      - Todas
      - Agendadas (upcoming)
      - Completadas
      - Canceladas
      - Reprogramadas
    
    Rango_de_Fechas:
      - Próximos 7 días
      - Próximos 30 días
      - Últimos 30 días
      - Últimos 90 días
      - Custom (selector de rango)
  
  Aplicación:
    - Filtros se aplican en tiempo real (sin botón "Aplicar")
    - Se pueden combinar múltiples filtros
    - Contador: "Mostrando 8 de 45 clases"
    - Botón "Limpiar filtros"
  
  Persistencia:
    - ❌ NO guarda filtros entre sesiones en MVP
    - Post-MVP: Guardar "vista preferida"
```

---

## 4. Agendamiento de Clases

### 4.1 Modelo de Agendamiento

**Decisión CRÍTICA:** Modelo HÍBRIDO en MVP.

**Explicación:**
```yaml
Hybrid_Scheduling:
  
  descripción: |
    El estudiante PUEDE auto-agendar clases (sin aprobación del staff),
    PERO el staff puede desactivar esta función por estudiante o global.
  
  Configuración_Global:
    ubicación: "Settings → Configuración de la Escuela"
    opción: "Permitir auto-agendamiento de estudiantes"
    default: true
    
    if false:
      - Estudiantes solo ven botón "Solicitar Clase"
      - Staff debe aprobar manualmente
  
  Configuración_Por_Estudiante:
    ubicación: "Perfil del Estudiante (vista staff)"
    opción: "Permitir auto-agendar"
    default: heredar de configuración global
    
    casos_de_uso:
      - Bloquear estudiante problemático (muchas cancelaciones)
      - Estudiante nuevo (primeras clases supervisadas)
      - Estudiante VIP (staff prefiere coordinar personalmente)
  
  Flujo_Auto_Agendamiento:
    1. Estudiante hace clic "Agendar Clase"
    2. Ve wizard de agendamiento (ver 4.2)
    3. Confirma
    4. Clase queda CONFIRMADA inmediatamente (NO pending)
    5. Notificaciones automáticas a instructor y estudiante
  
  Flujo_Solicitud_Manual:
    1. Estudiante hace clic "Solicitar Clase"
    2. Llena formulario: tipo, fecha preferida, instructor preferido, notas
    3. Envía solicitud
    4. Queda con status 'pending_approval'
    5. Staff ve solicitud en dashboard
    6. Staff aprueba/rechaza y asigna slot específico
    7. Estudiante recibe notificación de confirmación o rechazo
```

**Justificación:** Flexibilidad para diferentes escuelas y estudiantes.

---

### 4.2 Flujo de Auto-Agendamiento

**Decisión:** Wizard paso a paso con validaciones automáticas.

**Proceso completo:**
```yaml
Booking_Wizard:
  
  Paso_1_Tipo_de_Clase:
    pregunta: "¿Qué tipo de clase quieres agendar?"
    opciones:
      - "🚗 Clase Práctica"
      - "📚 Clase Teórica"
    
    validación:
      - Estudiante debe tener créditos disponibles
      - Si no tiene: mostrar error + botón "Comprar créditos"
  
  Paso_2_Instructor:
    pregunta: "¿Con qué instructor?"
    
    opciones_visualización:
      - Lista de instructores disponibles
      - Muestra NOMBRE completo
      - NO muestra foto
      - Muestra especialidad (si tiene)
      - Muestra badge "⭐ Favorito" (si lo marcó)
    
    filtrado:
      - Solo instructores con especialidad en tipo seleccionado
      - Solo instructores activos
      - Ordenamiento: Favoritos primero, luego alfabético
    
    opción_adicional:
      - Radio button: "Cualquier instructor disponible"
      - Si elige esto: sistema busca CUALQUIER instructor en paso 3
  
  Paso_3_Fecha_y_Hora:
    
    UI_Componente: "Calendario interactivo"
    
    visualización:
      - Calendario mensual
      - Días con slots disponibles: resaltados en verde
      - Días sin slots: grises (no clickeables)
      - Días no laborables: marcados con X
    
    al_hacer_click_en_día:
      - Muestra lista de slots disponibles
      - Por cada slot:
        * Hora inicio
        * Duración
        * Instructor (si seleccionó "cualquiera" en paso 2)
        * Badge "Disponible"
      
      - Solo muestra slots que cumplen:
        ✅ Instructor disponible
        ✅ Vehículo disponible (asignado automáticamente)
        ✅ Respeta buffers de la escuela
        ✅ Respeta ventana de anticipación (ver 4.3)
        ✅ Dentro de horario laboral
    
    navegación:
      - Botón "< Mes anterior" / "Mes siguiente >"
      - Botón "Hoy"
  
  Paso_4_Confirmación:
    
    resumen:
      - Tipo de clase
      - Instructor asignado
      - Fecha y hora
      - Duración estimada
      - Vehículo asignado (marca, modelo, patente)
      - Punto de encuentro
      - Créditos a consumir: 1
      - Balance después de agendar: X créditos
    
    campos_adicionales:
      - Notas (opcional): text area
        * Placeholder: "¿Algo que el instructor deba saber?"
        * Ejemplos: "Recógeme en X dirección", "Quiero practicar estacionamiento"
    
    botones:
      - "← Volver" (editar selección)
      - "Confirmar y Agendar" (botón destacado)
    
    validación_final:
      - Verificar que slot sigue disponible
      - Verificar que estudiante sigue teniendo créditos
      - Si algo cambió: mostrar error y permitir re-seleccionar
  
  Paso_5_Éxito:
    
    mensaje: "¡Clase agendada exitosamente! 🎉"
    
    muestra:
      - Resumen de la clase
      - "Te enviamos confirmación por email y WhatsApp"
      - Botones:
        * "Ver en mi calendario"
        * "Agendar otra clase"
        * "Volver al inicio"
    
    acciones_del_sistema:
      - Crear class record en DB (status: 'scheduled')
      - Consumir 1 crédito (status: 'reserved', no 'used' hasta que se complete)
      - Enviar notificación a estudiante (email + WhatsApp)
      - Enviar notificación a instructor (email + WhatsApp)
      - Agregar evento a calendario del instructor
```

---

### 4.3 Restricciones de Agendamiento

**Decisión CRÍTICA:** Ventana de anticipación VARIABLE según horario de oficina.

**Reglas:**
```yaml
Booking_Restrictions:
  
  Anticipación_Mínima:
    
    Caso_1_Durante_Horario_Oficina:
      definición: "Estudiante agenda dentro del horario de atención"
      horario_oficina: configurable por escuela (ej: 9:00-18:00)
      anticipación_mínima: 6 horas
      
      ejemplo:
        - Horario oficina: 9:00-18:00
        - Estudiante agenda a las 14:00 (dentro de horario)
        - Puede agendar clase para las 20:00 del mismo día (6h después)
      
      justificación: "Staff está disponible para resolver problemas"
    
    Caso_2_Fuera_Horario_Oficina:
      definición: "Estudiante agenda fuera del horario de atención"
      anticipación_mínima: 12 horas
      
      ejemplo:
        - Horario oficina: 9:00-18:00
        - Estudiante agenda a las 21:00 (fuera de horario)
        - Puede agendar clase para las 9:00 del día siguiente (12h después)
      
      justificación: "Evitar agendamientos de último momento cuando staff no puede intervenir"
  
  Límite_Clases_Futuras:
    descripción: "Máximo de clases agendadas simultáneamente"
    valor: 3 clases
    configurable: true (por escuela)
    
    validación:
      if student.upcoming_classes.count >= 3:
        mostrar_error: "Ya tienes 3 clases agendadas. Completa o cancela alguna antes de agendar más."
    
    justificación: "Evitar acaparamiento de slots + estudiantes que agendan y no van"
  
  Verificación_Créditos:
    regla: "Debe tener AL MENOS 1 crédito disponible"
    
    validación:
      if student.available_credits < 1:
        bloquear_agendamiento: true
        mostrar: "No tienes créditos disponibles"
        botón: "Comprar paquete" (si está habilitado)
  
  Horario_Laboral:
    regla: "Solo puede agendar dentro del horario de operación de la escuela"
    horario_configurable: true (por escuela)
    
    ejemplo:
      - Escuela opera: Lunes-Viernes 8:00-20:00, Sábados 9:00-14:00
      - NO puede agendar: Domingos, ni después de las 20:00
  
  Días_No_Laborables:
    - Sistema respeta días marcados como "no laborables" (ver Fase 2)
    - Feriados
    - Días de mantenimiento
    - Eventos especiales

Validación_Tiempo_Real:
  - TODAS las reglas se validan al momento de seleccionar slot
  - Si slot ya no cumple reglas: se muestra deshabilitado
  - Mensajes claros de por qué no puede agendar
```

---

### 4.4 Selección de Instructor

**Decisión:** Estudiante puede elegir instructor específico por nombre, o "cualquiera disponible".

**Implementación:**
```yaml
Instructor_Selection:
  
  Opciones:
    
    Opción_1_Específico:
      - Lista dropdown con nombres de instructores
      - Muestra:
        * Nombre completo
        * Especialidad (si tiene)
        * Badge "⭐ Favorito" (si lo marcó antes)
      - NO muestra:
        * Foto
        * Rating/reviews de otros estudiantes (no existe en MVP)
      
      filtrado_automático:
        - Solo instructores activos
        - Solo instructores con especialidad en el tipo de clase elegido
        - Ordenamiento: Favoritos primero, luego alfabético
    
    Opción_2_Cualquiera:
      - Radio button: "Cualquier instructor disponible"
      - Si elige esto:
        * En paso de fecha/hora ve slots con CUALQUIER instructor
        * Puede ver "con Instructor Juan" en cada slot
        * Sistema asigna automáticamente según disponibilidad
  
  Sistema_Favoritos:
    descripción: "Estudiante puede marcar instructores favoritos"
    
    cómo_marcar:
      - En historial de clases: botón "★" junto a instructor
      - En lista de instructores: botón "★"
    
    beneficios:
      - Aparecen primero en lista de selección
      - Badge visual "⭐ Favorito"
      - Filtro rápido "Mostrar solo favoritos"
    
    límite: sin límite de favoritos
  
  Restricciones:
    ❌ NO puede ver:
      - Horario completo del instructor
      - Cuántas clases tiene agendadas
      - Rating/reviews
      - Información personal
    
    ✅ Solo ve:
      - Slots donde ESE instructor está disponible
```

**Justificación favoritos:** Estudiantes naturalmente desarrollan preferencias, sistema lo facilita.

---

### 4.5 Asignación de Vehículo

**Decisión:** Vehículo NO es seleccionable por estudiante, sistema asigna automáticamente.

**Lógica de asignación:**
```yaml
Vehicle_Assignment:
  
  selección_manual: false
  asignación: "Automática por sistema"
  
  Criterios_Asignación:
    1. Tipo de clase (manual/automático según lo que student aprendió)
    2. Disponibilidad en el slot
    3. Vehículo asignado al instructor (si instructor tiene vehículo fijo)
    4. Estado del vehículo (activo, mantenimiento al día)
  
  Query_Lógica:
    """
    SELECT vehicles
    WHERE school_id = :school_id
      AND status = 'active'
      AND transmission_type = :required_type
      AND NOT EXISTS (conflicting class in same time slot)
      AND all_documents_valid = true
    ORDER BY last_assigned_time ASC  -- Rotación equitativa
    LIMIT 1
    """
  
  Estudiante_Ve:
    - Marca, modelo, patente del vehículo asignado
    - Tipo de transmisión
    - NO ve: foto, kilometraje, historial de mantenimiento
  
  Preferencias_Futuras (Post-MVP):
    - "Prefiero auto automático" (si student tiene esa opción)
    - "Último auto que usé" (continuidad)
```

**Justificación:** Simplifica flujo de agendamiento, evita saturación de ciertos vehículos.

---

### 4.6 Tipo de Clase - Restricción

**Decisión CRÍTICA:** Al reprogramar, debe ser el MISMO tipo de clase.

**Regla:**
```yaml
Class_Type_Rule:
  
  Al_Agendar_Nueva_Clase:
    - Estudiante elige libremente: Práctica o Teórica
  
  Al_Reprogramar_Clase_Existente:
    - Sistema PRE-SELECCIONA el tipo original
    - Campo "Tipo de clase" está DESHABILITADO (no editable)
    - Si era Práctica → nueva cita debe ser Práctica
    - Si era Teórica → nueva cita debe ser Teórica
  
  Validación:
    if rescheduling:
      new_class.type must == old_class.type
  
  Excepciones:
    - Si estudiante quiere cambiar tipo: debe CANCELAR y agendar nueva
    - Staff puede cambiar tipo manualmente desde su panel

Justificación:
  - Simplifica lógica de créditos
  - Evita confusión en historial
  - Crédito "reservado" para tipo específico
```

---

### 4.7 Agendamiento vs Solicitud

**Decisión:** Si auto-agendamiento está HABILITADO, confirmación es INMEDIATA (no pending).

**Flujo:**
```yaml
Immediate_Confirmation:
  
  Cuando_Estudiante_Confirma:
    1. Validar que slot sigue disponible
    2. Crear class record con status='scheduled'
    3. Reservar crédito (marcar como 'reserved')
    4. Actualizar disponibilidad de instructor
    5. Enviar notificaciones (estudiante + instructor + staff)
    6. Mostrar confirmación en pantalla
  
  NO_hay_estado_pending: true
  NO_requiere_aprobación_manual: true
  
  Rollback:
    if validation_fails_at_confirmation:
      - Mostrar error claro
      - Permitir re-intentar
      - Sugerir slots alternativos

Si_Auto_Agendamiento_Deshabilitado:
  1. Estudiante llena formulario de "Solicitud"
  2. Class record con status='pending_approval'
  3. Staff ve solicitud en dashboard
  4. Staff aprueba manualmente
  5. Recién ahí status='scheduled'
```

---

## 5. Cancelación y Re-programación

### 5.1 Cancelación por Portal

**Decisión:** Estudiante PUEDE cancelar clases directamente desde el portal, con política de devolución escalonada.

**Política de Cancelación:**
```yaml
Cancellation_Policy:
  
  Ventana_1_Más_de_24h:
    condición: "Cancela con más de 24 horas de anticipación"
    devolución: "1 crédito COMPLETO"
    
    ejemplo:
      - Clase agendada: 2025-01-20 10:00
      - Cancela el: 2025-01-18 15:00 (36 horas antes)
      - Resultado: Crédito devuelto 100%
  
  Ventana_2_Entre_24h_y_12h:
    condición: "Cancela entre 24 y 12 horas antes"
    devolución: "0.5 créditos (medio punto)"
    pérdida: "0.5 créditos"
    
    ejemplo:
      - Clase agendada: 2025-01-20 10:00
      - Cancela el: 2025-01-19 20:00 (14 horas antes)
      - Resultado: Devuelve 0.5, pierde 0.5
    
    nota: "El 0.5 perdido se marca como 'partially_used'"
  
  Ventana_3_Menos_de_12h:
    condición: "Cancela con menos de 12 horas de anticipación"
    devolución: "0 créditos"
    pérdida: "1 crédito COMPLETO"
    
    ejemplo:
      - Clase agendada: 2025-01-20 10:00
      - Cancela el: 2025-01-20 08:00 (2 horas antes)
      - Resultado: Pierde el crédito completamente
  
  No_Show:
    condición: "Estudiante no aparece y no canceló"
    devolución: "0 créditos"
    pérdida: "1 crédito COMPLETO"
    class_status: 'student_no_show'

Instructor_Payment:
  - Si cancela con >24h: Instructor NO cobra
  - Si cancela <24h: Instructor SÍ cobra (ver Fase 3)
  - No-show: Instructor SÍ cobra
```

**Nota técnica - Medios créditos:**
```sql
-- Nuevo campo en student_credits
ALTER TABLE student_credits 
ADD COLUMN fractional_amount DECIMAL(3,2) DEFAULT 1.00;

-- 1.00 = crédito completo
-- 0.50 = medio crédito
-- 0.00 = crédito usado completamente
```

---
#### 5.1.1 Bloqueo en Portal y Excepciones

- Regla de bloqueo en portal:
  - Si faltan &lt; 12 horas para la clase, el botón "Cancelar Clase" se muestra DESHABILITADO para el estudiante.
  - Mensaje visible: "No puedes cancelar desde el portal cuando faltan menos de 12 horas. Si faltaste por una causa justificada, envía tu justificativo."
  - Reprogramación: aplica la misma regla de bloqueo (&lt; 12h no reprogramable por estudiante).
- Excepciones por staff:
  - Owner/Secretary pueden cancelar manualmente en cualquier momento (incluido &lt; 12h), indicando motivo y si corresponde "Ausencia justificada".
  - La excepción aprobada ajusta créditos y pagos según la sección 5.7 Ausencia Justificada (ver más abajo).

#### 5.1.2 Reglas con Justificación Médica (y fuerza mayor)

- Ventanas y devolución para estudiante (con/ sin justificativo):
  - ≥ 24h: 
    - Sin justificativo: devolución 1.0 crédito (100%)
    - Con justificativo: devolución 1.0 crédito (100%)
  - 12–24h:
    - Sin justificativo: devolución 0.5 crédito (50%)
    - Con justificativo (médico/emergencia/fuerza mayor): devolución 1.0 crédito (100%)
  - &lt; 12h:
    - Sin justificativo: no hay devolución (0.0)
    - Con justificativo (médico/emergencia/fuerza mayor): devolución 1.0 crédito (100%)
- Justificativos aceptados:
  - Salud: certificado médico/orden o constancia con fecha y hora.
  - Emergencia familiar: documentación fehaciente (parte, constancia, acta).
  - Fuerza mayor: evidencia verificable (p. ej. parte policial, corte servicio crítico, accidente).
- Ventana para presentar justificativo:
  - Hasta 24 horas POSTERIORES a la hora programada de la clase.
- Aprobadores:
  - Owner o Secretary (según permisos).
- Efecto en ledger y pagos:
  - Al aprobar "Ausencia justificada":
    - Ledger: crear evento justified_absence_approved (+1.0 o reverso de penalización en 12–24h).
    - Instructor payment: NO cobra esa clase (reversa de pago si correspondía).
  - Si NO se aprueba:
    - Se mantienen las reglas escalonadas estándar (12–24h = 0.5; &lt; 12h = 0.0) y el pago al instructor sigue la lógica de clase cancelada tarde/no‑show sin justificativo.

### 5.2 Proceso de Cancelación

**Decisión:** Flujo simple y directo con confirmación.

**UI/UX:**
```yaml
Cancellation_Flow:
  
  Paso_1_Iniciar:
    ubicación: "Detalles de clase → Botón 'Cancelar Clase'"
    
    validación_inicial:
      if class.status != 'scheduled':
        mostrar_error: "Esta clase no puede ser cancelada"
        casos:
          - Ya completada
          - Ya cancelada
          - Pasó la fecha/hora
  
  Paso_2_Advertencia:
    modal_título: "¿Estás seguro de cancelar esta clase?"
    
    contenido:
      - Resumen de la clase (fecha, hora, instructor)
      - Advertencia clara según ventana:
        
        Si >24h:
          texto: "✅ Recibirás tu crédito de vuelta completo"
          color: verde
        
        Si 24h-12h:
          texto: "⚠️ Recibirás solo MEDIO crédito (0.5)"
          texto_adicional: "Perderás 0.5 créditos"
          color: amarillo
        
        Si <12h:
          texto: "❌ PERDERÁS tu crédito completo (no hay devolución)"
          color: rojo
      
      - Cuenta regresiva visual:
        "Puedes cancelar gratis hasta el DD/MM/YYYY HH:MM"
        o
        "Estás cancelando con X horas de anticipación"
    
    campo_razón:
      label: "¿Por qué cancelas? (opcional)"
      tipo: textarea
      placeholder: "Ayúdanos a mejorar..."
      max_length: 500
    
    botones:
      - "Volver" (cerrar modal, no cancela)
      - "Sí, cancelar clase" (botón destacado, color según ventana)
  
  Paso_3_Procesamiento:
    
    spinner: "Cancelando clase..."
    
    acciones_backend:
      1. Actualizar class.status = 'cancelled_by_student'
      2. Guardar cancellation_reason
      3. Calcular devolución según ventana
      4. Devolver créditos (1.0, 0.5, o 0.0)
      5. Actualizar disponibilidad de instructor
      6. Enviar notificaciones:
         - Estudiante: confirmación de cancelación
         - Instructor: notificación de clase cancelada
         - Staff: notificación (si configurado)
      7. Registrar en audit log
  
  Paso_4_Confirmación:
    modal_título: "Clase cancelada"
    
    contenido:
      - "Tu clase del DD/MM a las HH:MM ha sido cancelada"
      - Créditos devueltos: "1.0 crédito" / "0.5 créditos" / "No hay devolución"
      - Balance actual: "Tienes X créditos disponibles"
      - "Hemos notificado al instructor"
    
    botones:
      - "Agendar otra clase"
      - "Ver mi calendario"
      - "Volver al inicio"

Error_Handling:
  
  Conflict_Race_Condition:
    escenario: "2 usuarios intentan modificar misma clase simultáneamente"
    solución: "Optimistic locking con version field"
    mensaje: "Esta clase ya fue modificada. Por favor recarga la página."
  
  Network_Failure:
    escenario: "Falló la conexión durante cancelación"
    solución: "Idempotency keys + retry logic"
    mensaje: "Algo salió mal. Verifica tu conexión y reintenta."
```

---

### 5.3 Validación Automática de Ventana

**Decisión:** Sí, sistema valida automáticamente y aplica política correspondiente.

**Implementación:**
```typescript
// Lógica de validación
function calculateRefund(class: Class, cancellationTime: DateTime) {
  const hoursUntilClass = class.scheduled_time.diff(cancellationTime, 'hours');
  
  if (hoursUntilClass >= 24) {
    return {
      refund: 1.0,
      penalty: 0.0,
      message: "Devolución completa",
      color: "green"
    };
  } else if (hoursUntilClass >= 12) {
    return {
      refund: 0.5,
      penalty: 0.5,
      message: "Devolución parcial (medio crédito)",
      color: "yellow"
    };
  } else {
    return {
      refund: 0.0,
      penalty: 1.0,
      message: "Sin devolución",
      color: "red"
    };
  }
}
```

---

### 5.4 Visualización de Consecuencias

**Decisión:** Sí, estudiante DEBE ver claramente las consecuencias ANTES de confirmar.

**Especificaciones:**
```yaml
Consequence_Display:
  
  Ubicación: "Modal de confirmación de cancelación"
  
  Elementos_Visuales:
    
    Badge_de_Estado:
      - Verde + "✅": Cancelación sin penalización
      - Amarillo + "⚠️": Penalización parcial
      - Rojo + "❌": Penalización completa
    
    Texto_Destacado:
      tamaño: grande
      negrita: true
      ejemplos:
        - "Recibirás tu crédito completo de vuelta"
        - "PERDERÁS medio crédito (0.5)"
        - "PERDERÁS tu crédito completo (1.0)"
    
    Cuenta_Regresiva:
      - Muestra tiempo exacto hasta la clase
      - "Faltan X horas y Y minutos para tu clase"
      - Actualización en tiempo real (cada minuto)
    
    Proyección_Balance:
      - "Balance actual: 5 créditos"
      - "Balance después de cancelar: 5 créditos" (si >24h)
      - "Balance después de cancelar: 4.5 créditos" (si 24-12h)
      - "Balance después de cancelar: 4 créditos" (si <12h)
    
    Cálculo_Explícito:
      ejemplo:
        ```
        Crédito reservado: 1.0
        Devolución:        0.5
        Penalización:      0.5
        ─────────────────────
        Balance después:   4.5 créditos
        ```

Accesibilidad:
  - Texto claro y simple
  - Código de color + iconos (no solo color)
  - Confirmación de "Entiendo las consecuencias" (checkbox obligatorio si <12h)
```

---

### 5.5 Re-programación

**Decisión:** Sí puede re-programar, aplicando las MISMAS reglas que cancelación.

**Diferencias con cancelación:**
```yaml
Rescheduling_vs_Cancellation:
  
  Similitudes:
    - Mismas ventanas de tiempo (24h, 12h)
    - Misma política de devolución de créditos
    - Mismas penalizaciones
  
  Diferencias:
    
    Cancelación:
      1. Clase se cancela
      2. Crédito devuelto (si aplica)
      3. Fin del proceso
    
    Re-programación:
      1. Marca clase original como 'rescheduled'
      2. Aplica política de devolución (1.0, 0.5, 0.0)
      3. Abre wizard de agendamiento
      4. Debe elegir nueva fecha/hora INMEDIATAMENTE
      5. Nueva clase se crea con status 'scheduled'
      6. Ambas clases quedan vinculadas (old_class_id → new_class_id)

UI_Flow:
  
  Botón: "Reprogramar Clase"
  ubicación: "Junto a 'Cancelar Clase'"
  
  Paso_1:
    - Mismo modal de advertencia que cancelación
    - Muestra consecuencias de créditos
  
  Paso_2:
    - Si confirma: abre wizard de agendamiento (ver 4.2)
    - Pre-llenado:
      * Tipo de clase: MISMO que original (no editable)
      * Instructor: mismo si estudiante no elige otro
  
  Paso_3:
    - Elige nueva fecha/hora
    - Confirma
    - Sistema:
      * Cancela clase vieja con refund correspondiente
      * Crea clase nueva con crédito devuelto
      * Notifica a instructor viejo: "Clase cancelada"
      * Notifica a instructor nuevo: "Nueva clase agendada"

Historial:
  - Ambas clases visibles en historial
  - Clase original: status 'rescheduled' + link a nueva clase
  - Clase nueva: badge "Reprogramada desde DD/MM"
```

---

### 5.6 Historial de Cancelaciones

**Decisión:** Sí puede ver historial, NO hay límite de cancelaciones en MVP.

**Implementación:**
```yaml
Cancellation_History:
  
  Ubicación: "Mi Historial → Tab 'Canceladas'"
  
  Información_Por_Cancelación:
    - Fecha/hora de la clase original
    - Fecha/hora de la cancelación
    - Tiempo de anticipación ("Cancelaste 30 horas antes")
    - Créditos devueltos (1.0 / 0.5 / 0.0)
    - Razón de cancelación (si la dio)
    - Instructor que iba a tener
  
  Estadísticas:
    - Total de clases canceladas
    - Tasa de cancelación (% del total de clases)
    - Penalizaciones acumuladas (créditos perdidos)
  
  NO_hay_en_MVP:
    - Límite de cancelaciones por mes
    - Advertencia "Has cancelado X veces este mes"
    - Bloqueo automático por exceso de cancelaciones

Post_MVP:
  - Configuración por escuela: límite de cancelaciones
  - Alerta cuando se acerca al límite
  - Penalizaciones progresivas (a más cancelaciones, más penalización)
```

**Justificación sin límite:** En MVP queremos data real de comportamiento antes de imponer restricciones.

---

## 6. Balance y Créditos

### 6.1 Visualización de Créditos

**Decisión:** Desglosado por paquete con toda la información.

**UI/UX:**
```yaml
Credits_Display:
  
  Ubicación_Principal:
    - Header del portal (badge destacado)
    - Número grande: "8 créditos"
    - Color coded:
      * Verde: >5 créditos
      * Amarillo: 2-5 créditos
      * Rojo: <2 créditos
  
  Página_Completa: "Mis Créditos"
  
  Sección_Resumen:
    título: "Tus Créditos Disponibles"
    
    Card_Principal:
      número_grande: "8.5 créditos"
      subtexto: "en 2 paquetes activos"
  
  Sección_Desglose:
    título: "Desglose por Paquete"
    
    Por_Cada_Paquete:
      card_individual:
        
        header:
          - Nombre del paquete: "Paquete 10 Clases"
          - Badge de estado: "Activo" / "Vencido" / "Congelado"
        
        body:
          - Total comprado: "10 clases"
          - Usadas: "5 clases"
          - Restantes: "5 créditos"
          - Fecha de compra: "01/01/2025"
          - Fecha de vencimiento: "01/04/2025"
          - Precio pagado: "$50,000"
          
          - Barra de progreso visual:
            [████████████░░░░░░░░] 50%
          
          - Si tiene créditos congelados:
            "❄️ 2 créditos congelados"
            tooltip: "Créditos guardados por cancelación oportuna"
        
        footer:
          - Link: "Ver historial de uso"
          - Link: "Ver recibo de compra"
  
  Ordenamiento:
    - Paquetes activos primero
    - Ordenados por fecha de vencimiento (próximos a vencer primero)
    - Paquetes vencidos al final (colapsados)
```

---

### 6.2 Detalle Completo de Paquetes

**Decisión:** Sí, estudiante puede ver TODO el detalle de sus paquetes.

**Información visible:**
```yaml
Package_Details:
  
  Información_Básica:
    ✅ nombre_paquete: "Paquete 10 Clases"
    ✅ descripción: text (si existe)
    ✅ tipo_clases: "Prácticas y/o Teóricas"
  
  Créditos:
    ✅ total_clases_compradas: 10
    ✅ clases_usadas: 5
    ✅ clases_restantes: 5
    ✅ créditos_disponibles: 5.0 (puede incluir fracciones)
    ✅ créditos_congelados: 2 (si aplica)
    ✅ créditos_vencidos: 0
  
  Fechas:
    ✅ fecha_compra: date
    ✅ fecha_vencimiento: date
    ✅ días_hasta_vencimiento: integer (con alerta si <7)
    ✅ validez_configurada: "90 días" (info)
  
  Pago:
    ✅ precio_pagado: decimal
    ✅ método_pago: string
    ✅ descuento_aplicado: decimal (si hubo)
    ✅ link_recibo: URL al PDF
  
  Estado:
    ✅ status: badge visual
    ✅ motivo_estado: text (si es congelado/bloqueado)
  
  Historial_de_Uso:
    tabla o lista:
      - Fecha en que usó cada crédito
      - Clase asociada (link a detalles)
      - Instructor
      - Estado (completada/cancelada)

Acciones_Disponibles:
  - Botón: "Ver clases de este paquete"
  - Botón: "Descargar recibo"
  - Botón: "Extender vencimiento" (si está habilitado - post-MVP)
```

---

### 6.3 Alertas de Créditos por Vencer

**Decisión:** Sí, alertas múltiples con threshold de 7 días.

**Sistema de Alertas:**
```yaml
Expiration_Alerts:
  
  Triggers:
    
    7_Días_Antes:
      tipo: "warning"
      canales:
        - ✅ Banner en dashboard (siempre visible)
        - ✅ Email
        - ✅ WhatsApp
      
      mensaje:
        dashboard: "⚠️ Tienes 5 créditos que vencen en 7 días"
        email/whatsapp: |
          Hola {nombre},
          
          Tienes {cantidad} créditos que vencen el {fecha}.
          ¡Agenda tus clases antes de que se pierdan!
          
          [Ver mis créditos] [Agendar clase]
      
      frecuencia: "Alerta única al llegar a 7 días"
    
    3_Días_Antes:
      tipo: "urgent"
      canales:
        - ✅ Banner en dashboard (color rojo)
        - ✅ Email
        - ✅ WhatsApp
        - ✅ Notificación in-app (pop-up)
      
      mensaje:
        dashboard: "🚨 ¡URGENTE! Tienes 5 créditos que vencen en 3 días"
      
      frecuencia: "Alerta única al llegar a 3 días"
    
    1_Día_Antes:
      tipo: "critical"
      canales: todos los anteriores
      mensaje: "⏰ ¡ÚLTIMO DÍA! Tus créditos vencen mañana"
      frecuencia: "Alerta única"
    
    Día_de_Vencimiento:
      tipo: "final"
      canales:
        - ✅ Email
        - ✅ WhatsApp
      mensaje: |
        Tus {cantidad} créditos del paquete "{paquete}" han vencido hoy.
        
        Si necesitas más clases, puedes comprar un nuevo paquete.
      
      acción_sistema:
        - Marcar créditos como 'expired'
        - Actualizar student.available_credits
        - NO borrar del historial
  
  Banner_Permanente:
    ubicación: "Top del dashboard, debajo del header"
    color: "#FFA500" (naranja) si <7 días, "#FF0000" (rojo) si <3 días
    
    contenido:
      - Icono de alerta
      - Texto: "X créditos vencen en Y días"
      - Botón: "Agendar ahora"
      - Botón X: "Cerrar" (se oculta temporalmente, vuelve en próximo login)
  
  Configuración:
    - ❌ Estudiante NO puede desactivar estas alertas
    - ❌ Son críticas para el negocio
    - ✅ Post-MVP: podría elegir canales (email sí, WhatsApp no)
```

---

### 6.4 Créditos Congelados

**Decisión:** Sí puede verlos, con explicación clara del motivo.

**Implementación:**
```yaml
Frozen_Credits:
  
  Definición:
    origen: "Clases canceladas a tiempo pero sin slots disponibles para reprogramar"
    característica_especial: "Pueden usarse DESPUÉS del vencimiento del paquete"
    ver_Fase_3_decisión: "2.4 Créditos Congelados"
  
  Visualización:
    
    Badge: "❄️ Congelado"
    color: azul claro
    
    En_Card_de_Paquete:
      texto: "2 créditos congelados"
      tooltip_hover: |
        Estos créditos fueron guardados porque cancelaste a tiempo
        pero no había slots disponibles para reprogramar.
        
        Puedes usarlos incluso después del vencimiento del paquete.
    
    Detalle_Completo:
      sección: "Créditos Congelados"
      por_cada_crédito:
        - Fecha de congelamiento
        - Motivo: "Cancelación sin slots disponibles"
        - Clase original (fecha, instructor)
        - Estado: "Disponible para usar"
        - Puede agendar con este crédito: Sí
  
  Al_Agendar:
    - Sistema PRIORIZA créditos congelados (se consumen primero)
    - Mensaje: "Usarás 1 crédito congelado para esta clase"
    - Badge en confirmación: "Crédito congelado aplicado"
  
  Vencimiento:
    - ✅ Créditos congelados NO vencen con la fecha del paquete original
    - ⚠️ Pueden vencer según política de escuela (configurable)
    - Ejemplo: "Créditos congelados válidos por 180 días desde congelamiento"
    - Alerta separada: "Tienes créditos congelados que vencen en X días"
```

---

### 6.5 Historial de Uso de Créditos

**Decisión:** Sí, historial COMPLETO con todas las transacciones.

**Estructura:**
```yaml
Credit_Transaction_History:
  
  Ubicación: "Mis Créditos → Tab 'Historial'"
  
  Vista_Timeline:
    ordenamiento: "Cronológico reverso (más reciente primero)"
    
    Tipos_de_Transacciones:
      
      Compra:
        icono: "🛒"
        color: verde
        info:
          - "Compraste paquete {nombre}"
          - "+10 créditos"
          - Fecha y hora
          - Monto pagado
          - Link a recibo
      
      Uso:
        icono: "✓"
        color: azul
        info:
          - "Usaste 1 crédito"
          - Clase asociada (fecha, instructor)
          - Balance después: "9 créditos"
      
      Devolución_Completa:
        icono: "↩️"
        color: verde
        info:
          - "Crédito devuelto (cancelación >24h)"
          - Clase cancelada (fecha)
          - +1 crédito
      
      Devolución_Parcial:
        icono: "½"
        color: amarillo
        info:
          - "Devolución parcial (cancelación 24-12h)"
          - Clase cancelada (fecha)
          - +0.5 créditos
      
      Pérdida:
        icono: "❌"
        color: rojo
        info:
          - "Crédito perdido (cancelación <12h / no-show)"
          - Clase cancelada (fecha)
          - -1 crédito
      
      Congelamiento:
        icono: "❄️"
        color: azul claro
        info:
          - "Crédito congelado"
          - Motivo: "Sin slots disponibles"
          - Clase original (fecha)
      
      Descongelamiento:
        icono: "🔓"
        color: azul
        info:
          - "Crédito descongelado y usado"
          - Clase donde se usó (fecha)
      
      Vencimiento:
        icono: "⏱️"
        color: gris
        info:
          - "Créditos vencidos sin usar"
          - Cantidad: -X créditos
          - Fecha de vencimiento
          - Paquete origen
      
      Crédito_Promocional:
        icono: "🎁"
        color: morado
        info:
          - "Crédito promocional otorgado"
          - Motivo: "Referido / Campaña / Compensación"
          - +X créditos
  
  Filtros:
    - Por tipo de transacción
    - Por paquete
    - Por rango de fechas
    - Ver solo "activas" vs "todas"
  
  Exportar:
    - ❌ NO en MVP
    - Post-MVP: Descargar CSV/PDF con todo el historial
  
  Balance_Running:
    - Cada transacción muestra balance DESPUÉS de esa acción
    - Ejemplo timeline:
      ```
      20/01 Compra: +10 → Balance: 10
      21/01 Uso: -1 → Balance: 9
      22/01 Devolución: +1 → Balance: 10
      23/01 Pérdida: -1 → Balance: 9
      ```
```

---

## 7. Compra de Paquetes

### 7.1 Compra Online

**Decisión CRÍTICA:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  1. "Fase 4 (Payments) ya es compleja"
  2. "Priorizar auto-agendamiento primero"
  3. "Escuelas prefieren vender presencialmente al inicio"
  4. "Mercado Pago integration requiere más testing"

MVP_Workflow:
  - Estudiante ve botón "Comprar créditos" (opcional: deshabilitado)
  - Click → Mensaje: "Contacta a la escuela para comprar más clases"
  - Botón: "WhatsApp con secretaría"
  - Compra se procesa presencialmente (como en Fase 4)
  - Staff registra pago manualmente
  - Créditos se acreditan
  - Estudiante ve actualización en su portal

Post_MVP_Online_Purchase:
  timeline: "Sprint 6-8 después del MVP"
  features:
    - Catálogo de paquetes con precios
    - Checkout con Mercado Pago
    - Aplicación de cupones
    - Acreditación automática de créditos
    - Confirmación automática por email/WhatsApp
  
  dependencias:
    - Mercado Pago integration estable
    - Sistema de cupones funcionando
    - Notifications system robusto
```

---

### 7.2 Catálogo de Paquetes (Solo Visualización)

**Decisión:** Sí puede VER los paquetes disponibles, pero no comprar online.

**Implementación:**
```yaml
Package_Catalog:
  
  Ubicación: "Paquetes" (menú principal)
  
  Por_Cada_Paquete:
    card:
      header:
        - Nombre: "Paquete 10 Clases"
        - Badge: "Más popular" / "Mejor valor" (si configurado)
      
      body:
        - Cantidad de clases: "10 clases"
        - Validez: "90 días desde la compra"
        - Precio: "$50,000"
        - Precio por clase: "$5,000/clase" (calculado)
        - Descripción: text (opcional)
        - Características incluidas:
          * "Clases prácticas y teóricas"
          * "Flexibilidad de horarios"
          * "Instructores certificados"
      
      footer:
        - Botón: "Contactar para comprar" → WhatsApp
        - NO hay botón "Comprar ahora"
  
  Comparación:
    - Vista de tabla para comparar paquetes
    - Columnas: Nombre, Clases, Precio, Precio/Clase, Validez
  
  Recomendaciones:
    if student.completed_classes > 5:
      mostrar: "Basado en tu progreso, te recomendamos el Paquete 20"
```

---

### 7.3 Cupones de Descuento

**Decisión:** Sí hay sistema de cupones, pero aplicados manualmente por staff en MVP.

**Flujo:**
```yaml
Coupon_System_MVP:
  
  Estudiante_NO_puede:
    - Ingresar código de cupón en portal
    - Ver cupones disponibles
    - Aplicar descuentos automáticamente
  
  Estudiante_SÍ_puede:
    - Ver si se le aplicó descuento en historial de pagos
    - Ver precio final pagado (con descuento ya incluido)
  
  Proceso_Actual:
    1. Estudiante va presencialmente a escuela
    2. Dice: "Tengo un cupón de descuento: VERANO2025"
    3. Staff valida cupón en sistema (ver Fase 4)
    4. Staff aplica descuento
    5. Estudiante paga precio con descuento
    6. En portal ve: "Precio: $45,000 (descuento aplicado: $5,000)"

Post_MVP:
  - Campo "Código de descuento" en checkout online
  - Validación automática de cupones
  - Mensaje: "Cupón VERANO2025 aplicado: -10%"
```

---

### 7.4 Historial de Compras

**Decisión:** Sí, historial completo visible (ya cubierto en Fase 4).

**Referencia:**
```yaml
Ver_Sección_8: "Historial de Pagos"
Integración_con_Fase_4: true
```

---

### 7.5 Carrito de Compras

**Decisión:** Sí puede haber carrito, pero solo POST-MVP cuando se habilite compra online.

**Justificación:** Sin compra online en MVP, no hay necesidad de carrito.

---

### 7.6 Pagos Fallidos

**Decisión:** En MVP (sin compra online), no aplica. POST-MVP ver Fase 4.

---

## 8. Historial de Pagos

### 8.1 Visualización Completa

**Decisión:** Sí puede ver TODOS sus pagos históricos.

**Implementación:**
```yaml
Payment_History:
  
  Ubicación: "Mi Cuenta → Pagos"
  
  Vista_Lista:
    
    Por_Cada_Pago:
      card:
        
        header:
          - Fecha: date
          - Monto: decimal (destacado)
          - Badge de estado:
            * "Completado" (verde)
            * "Pendiente" (amarillo)
            * "Fallido" (rojo)
            * "Reembolsado" (gris)
        
        body:
          - Paquete comprado: "Paquete 10 Clases"
          - Método de pago: "Efectivo" / "Mercado Pago" / "Transferencia"
          - Créditos otorgados: "10 clases"
          - Descuento aplicado: "$5,000" (si hubo)
          - Precio original: "$50,000"
          - Precio final: "$45,000"
          - Referencia/ID: "#PAY-12345"
        
        footer:
          - Botón: "Ver recibo" (abre PDF)
          - Botón: "Descargar recibo"
          - Link: "Ver créditos de este paquete"
  
  Filtros:
    - Por fecha (rango)
    - Por método de pago
    - Por estado
    - Por monto (rango)
  
  Ordenamiento:
    default: "Más reciente primero"
    opciones:
      - Más reciente primero
      - Más antiguo primero
      - Mayor monto primero
      - Menor monto primero
  
  Búsqueda:
    - Por ID de pago
    - Por nombre de paquete
  
  Estadísticas:
    card_resumen:
      - Total gastado histórico: "$150,000"
      - Total de pagos: "3 pagos"
      - Método más usado: "Efectivo"
      - Promedio por pago: "$50,000"
```

---

### 8.2 Detalles de Cada Pago

**Decisión:** TODOS los detalles mencionados son visibles.

**Información completa:**
```yaml
Payment_Details:
  
  Modal_Detalle: "Click en pago → Modal con info completa"
  
  Secciones:
    
    Información_Básica:
      - ID de transacción: string
      - Fecha y hora: datetime
      - Estado: badge
    
    Paquete:
      - Nombre del paquete
      - Cantidad de clases
      - Validez (días)
      - Créditos otorgados
      - Link: "Ver este paquete"
    
    Montos:
      - Precio del paquete: decimal
      - Descuento aplicado: decimal (si hubo)
        * Tipo de descuento: "10% off" / "$5,000 off"
        * Código de cupón: "VERANO2025" (si se usó)
      - Monto final: decimal (destacado)
    
    Pago:
      - Método de pago: string
      - Detalles del método:
        * Si Mercado Pago: ID de transacción MP
        * Si Transferencia: Número de comprobante
        * Si Efectivo: "Pago en efectivo"
      - Procesado por: staff_name (quien registró el pago)
    
    Comprobantes:
      - Recibo interno: link/botón "Ver" / "Descargar"
      - Comprobante de pago: imagen/PDF (si se subió)
      - Factura oficial: PDF (si se emitió) - Post-MVP
    
    Créditos:
      - Créditos otorgados: integer
      - Fecha de vencimiento: date
      - Estado actual de esos créditos:
        * "5 créditos disponibles"
        * "2 créditos usados"
        * "3 créditos vencidos"
    
    Auditoría:
      - Creado el: datetime
      - Creado por: staff_name
      - Última modificación: datetime (si hubo)
```

---

### 8.3 Descarga de Recibos

**Decisión:** Sí puede descargar recibos en PDF.

**Implementación:**
```yaml
Receipt_Download:
  
  Formato: PDF
  generación: "On-demand (se genera al momento de descargar)"
  
  Contenido_PDF:
    ver_Fase_4: "4.2 Recibo Interno"
    incluye:
      - Header con logo y datos de escuela
      - Datos del estudiante
      - Detalle del paquete comprado
      - Montos
      - Método de pago
      - Fecha
      - Firma digital (si configurada)
      - QR code con link de verificación (post-MVP)
  
  Acciones:
    botón_ver: "Ver recibo" → Abre PDF en nueva pestaña
    botón_descargar: "Descargar recibo" → Descarga directa
    botón_email: "Enviar por email" → Envía PDF al email del estudiante
  
  Naming:
    formato: "Recibo_{Escuela}_{Fecha}_{ID}.pdf"
    ejemplo: "Recibo_MiEscuela_20250120_PAY12345.pdf"
  
  Storage:
    - PDFs generados se cachean temporalmente (24h)
    - Luego se re-generan on-demand si se piden de nuevo
    - No consumir storage innecesario
```

---

### 8.4 Factura Oficial

**Decisión:** NO puede solicitar desde portal en MVP (ya decidido en Fase 4).

**Referencia:**
```yaml
Ver_Fase_4: "4.1 Facturación con AFIP"
Decisión: "POST-MVP"

MVP_Process:
  - Estudiante debe solicitar factura presencialmente o por WhatsApp
  - Staff genera factura en sistema de AFIP (externo)
  - Staff sube PDF de factura al sistema
  - Aparece en historial de pagos del estudiante

Post_MVP:
  - Botón "Solicitar Factura" en historial de pagos
  - Staff recibe notificación
  - Staff genera y sube factura
  - Estudiante recibe notificación cuando está lista
```

---

## 9. Perfil y Datos Personales

### 9.1 Edición de Perfil

**Decisión CRÍTICA:** Estudiante NO puede editar NADA de su perfil en MVP.

**Justificación:**
```yaml
Razones:
  1. "Control de datos centralizado en staff"
  2. "Evitar inconsistencias o datos falsos"
  3. "Información legal debe ser verificada presencialmente"
  4. "Simplifica MVP - menos validaciones"

Implicaciones:
  - Todos los cambios de datos deben ser solicitados al staff
  - Staff actualiza en su panel de administración
  - Estudiante solo ve sus datos (read-only)
```

**Workaround:**
```yaml
Si_Estudiante_Necesita_Cambiar_Datos:
  1. Ve su perfil (read-only)
  2. Nota que algo está incorrecto
  3. Click botón: "Solicitar cambio de datos"
  4. Abre WhatsApp pre-llenado con mensaje:
     "Hola, necesito actualizar mis datos personales: [campo]"
  5. Staff lo actualiza manualmente
  6. Estudiante ve cambio reflejado

Post_MVP:
  campos_editables_permitidos:
    ✅ Teléfono de contacto
    ✅ Email secundario
    ✅ Dirección
    ❌ Nombre completo (requiere validación)
    ❌ Documento (requiere validación)
    ✅ Foto de perfil
```

---

### 9.2 Campos NO Editables

**Decisión:** NINGÚN campo editable en MVP (ver 9.1).

**Lista completa de campos bloqueados:**
```yaml
Locked_Fields:
  ❌ nombre_completo
  ❌ email_principal
  ❌ teléfono
  ❌ documento_tipo
  ❌ documento_número
  ❌ fecha_nacimiento
  ❌ dirección
  ❌ contacto_emergencia
  ❌ foto_perfil
  ❌ cualquier_otro_campo

UI_Visual:
  - Campos se muestran como texto plano (no inputs)
  - Sin botón "Editar" junto a campos
  - Botón global: "Solicitar cambio" → WhatsApp
```

---

### 9.3 Foto de Perfil

**Decisión:** NO puede subir foto en MVP.

**Alternativa:**
```yaml
Profile_Picture:
  
  MVP:
    mostrar: "Avatar con iniciales"
    ejemplo: "MP" para "María Pérez"
    color: "Generado aleatoriamente basado en nombre"
    estilo: "Circular"
  
  Post_MVP:
    - Botón "Subir foto"
    - Crop/resize automático
    - Validación de formato (jpg, png)
    - Max size: 2MB
    - Moderación opcional (staff aprueba)
```

---

### 9.4 Información Legal Visible

**Decisión:** Sí puede VER su información legal.

**Campos visibles (read-only):**
```yaml
Legal_Info_Visible:
  
  Documento:
    ✅ tipo: "DNI" / "CUIL" / "Pasaporte"
    ✅ número: "12345678"
    ❌ foto_documento: NO en MVP (post-MVP)
  
  Licencia_de_Conducir:
    if student.has_license:
      ✅ número_licencia: string
      ✅ tipo_licencia: "Clase B"
      ✅ fecha_emisión: date
      ✅ fecha_vencimiento: date
      ✅ estado: "Válida" / "Vencida" (calculado automático)
    else:
      mostrar: "Aún no tienes licencia de conducir"
  
  Certificados:
    if existe:
      ✅ nombre_certificado: string
      ✅ fecha_emisión: date
      ❌ archivo_pdf: NO en MVP
  
  Información_Escuela:
    ✅ fecha_registro: date (cuándo se dio de alta)
    ✅ estado: "Activo" / "Inactivo" / "Graduado"
    ✅ fecha_graduación: date (si aplica)

UI:
  sección: "Mi Perfil → Documentos"
  estilo: Cards con iconos
  tooltip: Explicación de cada campo si es necesario
```

---

### 9.5 Contactos de Emergencia

**Decisión:** NO puede agregar/editar, solo VER.

**Implementación:**
```yaml
Emergency_Contacts:
  
  Visualización:
    sección: "Mi Perfil → Contactos de Emergencia"
    
    mostrar:
      - Nombre completo: string
      - Relación: "Padre" / "Madre" / "Hermano" / etc
      - Teléfono: string
      - Email: string (opcional)
    
    sin_contacto:
      if emergency_contact == null:
        mostrar: "No tienes contacto de emergencia registrado"
        botón: "Solicitar agregar" → WhatsApp con staff
  
  Edición:
    ❌ NO puede editar en MVP
    workaround: "Contactar al staff para actualizar"
  
  Post_MVP:
    ✅ Puede agregar múltiples contactos
    ✅ Puede editar sin aprobación (son sus contactos)
    ✅ Puede priorizar (contacto primario, secundario)
```

---

## 10. Progreso y Evaluaciones

### 10.1 Tracking de Progreso

**Decisión:** Sí, sistema de tracking de progreso visible.

**Implementación:**
```yaml
Progress_Tracking:
  
  Ubicación: "Mi Progreso" (menú principal)
  
  Dashboard_Progreso:
    
    Widget_Principal:
      título: "Tu Avance en el Curso"
      
      barra_progreso:
        tipo: "Barra horizontal"
        cálculo: "(clases_completadas / clases_recomendadas) * 100"
        ejemplo: "[████████████░░░░░░░░] 60%"
        texto: "15 de 25 clases recomendadas"
      
      nota:
        "Las 'clases recomendadas' son configuradas por la escuela
        según el tipo de licencia y nivel del estudiante"
    
    Estadísticas_Generales:
      
      cards:
        
        Total_Clases:
          número: "15 clases"
          subtexto: "completadas en total"
          icono: "✓"
        
        Prácticas_vs_Teóricas:
          gráfico: "Pie chart o barras"
          datos:
            - Prácticas: 10 clases (67%)
            - Teóricas: 5 clases (33%)
        
        Tasa_Asistencia:
          número: "95%"
          cálculo: "(clases_completadas / clases_agendadas) * 100"
          subtexto: "tasa de asistencia"
          badge: "Excelente" / "Buena" / "Regular"
        
        Instructor_Frecuente:
          nombre: "Juan Pérez"
          subtexto: "7 clases con este instructor"
          badge: "Tu instructor más frecuente"
    
    Habilidades: (si configurado por escuela)
      
      lista_skills:
        
        - nombre: "Estacionamiento"
          estado: "Dominado ✓"
          clases: 5
          progreso: 100%
        
        - nombre: "Rotondas"
          estado: "En progreso ⏳"
          clases: 3
          progreso: 60%
        
        - nombre: "Autopista"
          estado: "Pendiente 🔒"
          clases: 0
          progreso: 0%
      
      nota:
        "Las habilidades son marcadas por tu instructor
        después de cada clase"
    
    Próximos_Pasos:
      
      if configurado_por_staff:
        lista:
          - "Completar 3 clases más de autopista"
          - "Practicar estacionamiento en paralelo"
          - "Aprobar simulacro de examen"
      else:
        mensaje: "Tu instructor te indicará los próximos pasos"
  
  Configuración_Staff:
    - Staff puede configurar "clases recomendadas" por estudiante
    - Staff puede marcar habilidades como "dominadas"
    - Staff puede agregar "próximos pasos" / objetivos
```

---

### 10.2 Evaluaciones del Instructor

**Decisión:** Sí puede ver evaluaciones, pero NO notas privadas.

**Qué puede ver:**
```yaml
Instructor_Evaluations:
  
  Ubicación: "Historial de Clases → Click en clase completada"
  
  Información_Visible:
    
    Rating_General:
      tipo: "Estrellas o escala numérica"
      ejemplo: "⭐⭐⭐⭐⭐ (5/5)"
      descripción: "Desempeño general en la clase"
    
    Comentarios_Públicos:
      tipo: text
      max_length: 500 caracteres
      ejemplos:
        - "Excelente manejo en rotondas. Sigue practicando autopista."
        - "Muy bien! Ya estás listo para el examen."
        - "Necesitas practicar más el estacionamiento en paralelo."
      
      nota: "Instructor escribe estos comentarios sabiendo que
            el estudiante los verá"
    
    Habilidades_Evaluadas: (si configurado)
      lista:
        - Estacionamiento: ⭐⭐⭐⭐ (4/5)
        - Cambios de carril: ⭐⭐⭐⭐⭐ (5/5)
        - Uso de espejos: ⭐⭐⭐ (3/5)
    
    Áreas_de_Mejora:
      lista:
        - "Revisar puntos ciegos antes de cambiar carril"
        - "Practicar frenado suave"
      
      estilo: "Constructivo y orientado a mejora"
  
  NO_Puede_Ver:
    
    ❌ Notas_Privadas_Instructor:
      descripción: "Notas que el instructor escribe para sí mismo
                   o para compartir solo con el staff"
      ejemplos:
        - "Estudiante muy nervioso, necesita más paciencia"
        - "Tiene miedo a autopistas, ir despacio"
        - "Familia insistente, manejar con cuidado"
      
      ubicación: "Visible solo en panel de staff"
    
    ❌ Evaluación_Comparativa:
      ejemplo: "Este estudiante es mejor/peor que el promedio"
    
    ❌ Información_Sensible:
      ejemplos:
        - Condiciones médicas
        - Situaciones personales
        - Información confidencial

Database_Structure:
  class_evaluation:
    - class_id: uuid
    - overall_rating: integer (1-5)
    - public_comments: text
    - private_notes: text  # NO visible para estudiante
    - skills_evaluated: jsonb
    - areas_of_improvement: text[]
    - instructor_id: uuid
    - created_at: timestamp
```

---

### 10.3 Objetivos y Próximos Pasos

**Decisión:** Sí, puede haber sistema de objetivos configurado por staff.

**Implementación:**
```yaml
Goals_Next_Steps:
  
  Tipo_1_Objetivos_Predefinidos:
    descripción: "Checklist de objetivos por tipo de licencia"
    
    ejemplo_clase_B:
      objetivos:
        - ✓ Completar 10 clases prácticas
        - ✓ Dominar estacionamiento (3 técnicas)
        - ⏳ Practicar autopista (0/5 clases)
        - 🔒 Aprobar simulacro de examen
        - 🔒 Completar curso teórico
    
    configuración:
      - Staff marca objetivos como "completados"
      - Se marcan automáticamente según clases
      - Orden secuencial o paralelo
  
  Tipo_2_Próximos_Pasos_Personalizados:
    descripción: "Lista custom por estudiante"
    
    ejemplo:
      próximos_pasos:
        - "Practicar 3 clases más de autopista"
        - "Revisar señales de tránsito (manual)"
        - "Agendar simulacro de examen para fin de mes"
    
    quién_crea: "Staff o instructor"
    frecuencia: "Se actualizan después de cada clase"
  
  Visualización:
    
    Widget_Dashboard:
      título: "Tus Próximos Pasos"
      lista: Top 3 objetivos pendientes
      link: "Ver todos los objetivos"
    
    Página_Completa:
      título: "Mi Plan de Estudios"
      
      tabs:
        - "Objetivos": Checklist completo
        - "Recomendaciones": Próximos pasos
        - "Historial": Objetivos completados
  
  Notificaciones:
    trigger: "Cuando completas un objetivo"
    mensaje: "🎉 ¡Felicitaciones! Completaste: Dominar estacionamiento"
    canal: "In-app + email"
```

---

### 10.4 Fecha Estimada de Examen

**Decisión:** Sí puede ver fecha estimada, si staff la configuró.

**Implementación:**
```yaml
Exam_Date:
  
  Configuración:
    quién_setea: "Staff o instructor"
    cuándo: "Cuando el estudiante está cerca de estar listo"
    campo: student.estimated_exam_date (nullable)
  
  Visualización:
    
    Si_Está_Configurada:
      ubicación: "Dashboard principal + Mi Progreso"
      
      widget:
        título: "Tu Examen de Conducir"
        fecha: "15 de Marzo, 2025"
        días_restantes: "Faltan 45 días"
        countdown: "Cuenta regresiva visual"
        
        estado_preparación:
          if ready:
            "✅ Estás listo para el examen"
            color: verde
          else:
            "⏳ Aún necesitas X clases"
            lista_pendientes:
              - "5 clases prácticas más"
              - "Aprobar simulacro"
            color: amarillo
        
        botón: "Ver checklist de requisitos"
    
    Si_NO_Está_Configurada:
      mostrar: "Tu fecha de examen aún no ha sido establecida"
      subtexto: "Tu instructor la configurará cuando estés listo"
  
  Checklist_Requisitos:
    modal: "Requisitos para el Examen"
    
    contenido:
      - ✓ Mínimo 20 clases prácticas (completadas)
      - ✓ Mínimo 5 clases teóricas (completadas)
      - ✓ Dominar todas las habilidades básicas
      - ⏳ Aprobar simulacro interno (pendiente)
      - ⏳ Tener licencia vigente clase anterior (si aplica)
      - ⏳ Documentación completa
    
    progreso_general:
      "Cumples 4 de 6 requisitos (67%)"
  
  Modificación:
    - Estudiante NO puede cambiar fecha
    - Solo staff puede modificarla
    - Si cambia: estudiante recibe notificación
```

---

### 10.5 Gamificación

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Añade complejidad innecesaria"
  - "No es crítico para operación"
  - "Requiere diseño UX cuidadoso"
  - "Puede ser percibido como infantil por algunos"

Post_MVP:
  features_posibles:
    
    Badges:
      - "🏆 Primera Clase Completada"
      - "⭐ 10 Clases sin Cancelaciones"
      - "🚗 Maestro del Estacionamiento"
      - "🛣️ Conquistador de Autopistas"
      - "📚 Estudiante Dedicado (5 teóricas)"
    
    Rachas:
      - "Llevas 3 semanas consecutivas asistiendo"
      - "🔥 Racha de 10 clases sin faltar"
    
    Leaderboard:
      - ❌ NO competir entre estudiantes (privacidad)
      - ✅ Solo mostrar logros personales
    
    Niveles:
      - Novato → Aprendiz → Practicante → Avanzado → Maestro
      - Basado en clases completadas y habilidades dominadas
```

---

## 11. Notificaciones

### 11.1 Tipos de Notificaciones

**Decisión:** Todas las notificaciones listadas son necesarias en MVP.

**Lista completa:**
```yaml
Notification_Types:
  
  Clases:
    
    Nueva_Clase_Agendada:
      trigger: "Staff agenda clase para el estudiante"
      mensaje: "Se agendó una nueva clase para ti: {fecha} a las {hora} con {instructor}"
      canales: [email, whatsapp, in-app]
      urgencia: normal
    
    Recordatorio_Clase:
      trigger: "X horas antes de la clase"
      X_configurable: true (default: 24h y 2h antes)
      mensaje_24h: "Recordatorio: Mañana tienes clase a las {hora} con {instructor}"
      mensaje_2h: "Tu clase empieza en 2 horas. Punto de encuentro: {ubicación}"
      canales: [whatsapp, in-app]
      urgencia: alta
    
    Clase_Cancelada_Por_Instructor:
      trigger: "Instructor o escuela cancela clase"
      mensaje: "Tu clase del {fecha} a las {hora} fue cancelada. Motivo: {razón}. Tu crédito fue devuelto."
      canales: [email, whatsapp, in-app]
      urgencia: crítica
      acción_requerida: "Reagendar"
    
    Clase_Reprogramada:
      trigger: "Staff reprograma clase"
      mensaje: "Tu clase fue reprogramada: Nueva fecha {fecha} a las {hora}"
      canales: [email, whatsapp, in-app]
      urgencia: alta
    
    Evaluación_Disponible:
      trigger: "Instructor completa evaluación de clase"
      mensaje: "Tu instructor dejó comentarios sobre tu última clase. ¡Ve cómo te fue!"
      canales: [email, in-app]
      urgencia: normal
  
  Créditos:
    
    Créditos_Por_Vencer:
      triggers:
        - 7_días_antes
        - 3_días_antes
        - 1_día_antes
        - día_de_vencimiento
      mensaje: "⚠️ Tienes {cantidad} créditos que vencen {cuándo}. ¡Agenda tus clases!"
      canales: [email, whatsapp, in-app]
      urgencia: alta
    
    Créditos_Vencidos:
      trigger: "Créditos vencieron sin usar"
      mensaje: "{cantidad} créditos del {paquete} vencieron hoy sin usar."
      canales: [email, whatsapp]
      urgencia: info
    
    Créditos_Bajos:
      trigger: "Créditos disponibles < 2"
      mensaje: "Te quedan solo {cantidad} créditos. Considera comprar más."
      canales: [in-app, email]
      urgencia: normal
      frecuencia: "Solo primera vez que baja de 2"
  
  Pagos:
    
    Pago_Exitoso:
      trigger: "Pago confirmado"
      mensaje: "¡Tu pago de ${monto} fue confirmado! Se acreditaron {créditos} créditos."
      canales: [email, whatsapp, in-app]
      urgencia: normal
      adjuntos: [recibo_pdf]
    
    Pago_Fallido:
      trigger: "Pago rechazado"
      mensaje: "Tu pago de ${monto} no pudo procesarse. Por favor intenta nuevamente."
      canales: [email, whatsapp]
      urgencia: alta
    
    Comprobante_Requerido:
      trigger: "Transferencia registrada sin comprobante"
      mensaje: "Registramos tu transferencia. Por favor sube el comprobante para confirmar."
      canales: [email, in-app]
      urgencia: normal
  
  Cuenta:
    
    Bienvenida:
      trigger: "Cuenta creada"
      mensaje: "¡Bienvenido a {escuela}! Tu cuenta está lista. Tus credenciales: {email}"
      canales: [email]
      urgencia: crítica
      adjuntos: [guía_inicio]
    
    Cambio_Contraseña:
      trigger: "Contraseña cambiada"
      mensaje: "Tu contraseña fue cambiada exitosamente."
      canales: [email]
      urgencia: alta
    
    Reset_Contraseña:
      trigger: "Solicita reset"
      mensaje: "Link para resetear tu contraseña: {link}"
      canales: [email]
      urgencia: crítica
      expiración: "15 minutos"
    
    Verificación_Email:
      trigger: "Email sin verificar"
      mensaje: "Verifica tu email para activar tu cuenta: {link}"
      canales: [email]
      urgencia: crítica
    
    Verificación_Teléfono:
      trigger: "Teléfono sin verificar"
      mensaje: "Tu código de verificación: {código}"
      canales: [sms]
      urgencia: crítica
  
  Progreso:
    
    Objetivo_Completado:
      trigger: "Completa objetivo/habilidad"
      mensaje: "🎉 ¡Felicitaciones! Completaste: {objetivo}"
      canales: [in-app, email]
      urgencia: normal
    
    Hito_Alcanzado:
      triggers:
        - 5_clases_completadas
        - 10_clases_completadas
        - 20_clases_completadas
      mensaje: "🎉 ¡Completaste {número} clases! Sigue así."
      canales: [in-app, email]
      urgencia: normal
    
    Listo_Para_Examen:
      trigger: "Staff marca como 'ready_for_exam'"
      mensaje: "¡Estás listo para el examen! Tu instructor te contactará pronto."
      canales: [email, whatsapp, in-app]
      urgencia: alta
  
  Promocionales:
    
    Nueva_Promoción:
      trigger: "Staff crea promoción/cupón"
      mensaje: "🎁 ¡Oferta especial! {descripción}. Usa código: {código}"
      canales: [email, whatsapp]
      urgencia: normal
      opt_out: permitido
    
    Reactivación:
      trigger: "Inactivo por 30 días (sin agendar clases)"
      mensaje: "¡Te extrañamos! Vuelve y agenda tu próxima clase."
      canales: [email, whatsapp]
      urgencia: normal
```

---

### 11.2 Canales de Notificación

**Decisión:** WhatsApp y Email en MVP (ya cubierto en Fase 2).

**Referencia:**
```yaml
Ver_Fase_2: "Notificaciones"

Canales_MVP:
  ✅ WhatsApp: Canal CRÍTICO (principal comunicación en Argentina)
  ✅ Email: Canal secundario pero importante
  ✅ In-App: Notificaciones dentro del portal

Canales_Post_MVP:
  ❌ SMS: Caro en Argentina
  ❌ Push_Notifications: Requiere app móvil nativa
```

**Especificaciones:**
```yaml
WhatsApp_Integration:
  proveedor: "WhatsApp Business API"
  requisitos:
    - Cuenta Business verificada
    - Número dedicado
    - Templates aprobados por Meta
  
  tipos_mensajes:
    - Template messages: Pre-aprobados por Meta
    - Session messages: Respuestas dentro de 24h
  
  límites:
    - Sin spam
    - Solo notificaciones transaccionales
    - Respetar opt-out

Email:
  proveedor: "Sugerido: Resend o SendGrid"
  características:
    - Plantillas HTML responsive
    - Tracking de opens/clicks
    - Bounce handling
    - Unsubscribe link obligatorio

In_App:
  ubicación: "Campana en header"
  características:
    - Badge con número de no leídas
    - Lista de notificaciones
    - Marcar como leída
    - Persistencia en DB
```

---

### 11.3 Configuración de Preferencias

**Decisión:** Sí, estudiante puede configurar preferencias.

**Implementación:**
```yaml
Notification_Preferences:
  
  Ubicación: "Mi Cuenta → Configuración → Notificaciones"
  
  Granularidad:
    
    Por_Tipo:
      ejemplo:
        - "Recordatorios de clase": [email ✓, whatsapp ✓]
        - "Créditos por vencer": [email ✓, whatsapp ✓]
        - "Promociones": [email ✓, whatsapp ✗]
      
      restricciones:
        críticas_no_desactivables:
          - Clase cancelada (SIEMPRE se notifica)
          - Pago exitoso (SIEMPRE se notifica)
          - Bienvenida (SIEMPRE se notifica)
    
    Por_Canal:
      toggle_global:
        - "Recibir emails": ✓
        - "Recibir WhatsApp": ✓
      
      nota: "Algunas notificaciones críticas no se pueden desactivar"
  
  UI_Design:
    
    Tabla:
      columnas:
        - Tipo de notificación
        - Email (checkbox)
        - WhatsApp (checkbox)
        - In-App (checkbox - siempre ON)
      
      filas: Una por cada tipo de notificación
      
      bloqueadas:
        - Checkbox deshabilitado + tooltip "Esta notificación es obligatoria"
  
  Horario_No_Molestar:
    descripción: "No recibir notificaciones en ciertas horas"
    
    configuración:
      - Desde: time picker (ej: 22:00)
      - Hasta: time picker (ej: 8:00)
      - Días: checkboxes (Lun-Dom)
    
    excepciones:
      - Notificaciones críticas SÍ se envían (ej: clase cancelada)
      - Solo aplica a recordatorios y promociones
  
  Frecuencia:
    
    Resumen_Semanal:
      descripción: "Recibir resumen de la semana en vez de notificaciones individuales"
      opción: checkbox
      contenido_resumen:
        - Clases completadas esta semana
        - Próximas clases
        - Balance de créditos
        - Objetivos alcanzados
      envío: "Domingos a las 18:00"
    
    Batch_Notifications:
      descripción: "Agrupar múltiples notificaciones en un solo mensaje"
      ejemplo: En vez de 3 WhatsApp separados, 1 con lista de 3 items
      configuración: toggle ON/OFF
  
  Guardado:
    - Botón "Guardar preferencias"
    - Confirmación: "Tus preferencias fueron actualizadas"
    - Se aplican inmediatamente
```

---

### 11.4 Centro de Notificaciones

**Decisión:** Sí, centro de notificaciones in-app.

**Implementación:**
```yaml
Notification_Center:
  
  Ubicación: "Campana en header (top-right)"
  
  Badge:
    mostrar: "Número de notificaciones NO leídas"
    color: rojo
    máximo: "99+" (si hay más de 99)
  
  Dropdown:
    trigger: "Click en campana"
    
    header:
      - Título: "Notificaciones"
      - Botón: "Marcar todas como leídas"
      - Tab: "Todas" / "No leídas"
    
    Lista:
      ordenamiento: "Más reciente primero"
      agrupación: "Por fecha (Hoy, Ayer, Esta semana, Más antiguas)"
      
      Por_Cada_Notificación:
        card:
          - Icono según tipo
          - Título corto
          - Mensaje resumido (max 100 chars)
          - Timestamp relativo ("Hace 2 horas")
          - Badge: "No leída" (si aplica)
          - Click → Abre modal con detalle completo
      
      paginación: "Scroll infinito (load more)"
      límite_inicial: "Últimas 20 notificaciones"
    
    Footer:
      link: "Ver todas las notificaciones"
      → Redirige a página completa
  
  Página_Completa:
    ubicación: "Menú → Notificaciones"
    
    filtros:
      - Por tipo
      - Por fecha (rango)
      - Leídas / No leídas
    
    acciones_masivas:
      - Marcar todas como leídas
      - Eliminar seleccionadas
      - Eliminar todas (con confirmación)
    
    búsqueda: "Buscar en notificaciones"
  
  Estados:
    
    No_Leída:
      - Background destacado (azul claro)
      - Badge "Nuevo"
      - Negrita
    
    Leída:
      - Background normal
      - Sin badge
      - Texto normal
    
    Archivada:
      - No visible en lista principal
      - Solo en "Archivadas"
  
  Acciones:
    
    Al_Recibir_Notificación:
      1. Crear registro en DB (notifications table)
      2. Badge de campana se actualiza (+1)
      3. Si usuario está online: push en tiempo real (WebSocket)
      4. Si usuario offline: verá al hacer login
    
    Al_Hacer_Click:
      1. Marcar como leída automáticamente
      2. Actualizar badge (-1)
      3. Mostrar detalle completo
      4. Si tiene acción: botón "Ir a [destino]"
         ejemplo: "Ir a la clase" / "Ver mis créditos"
  
  Persistencia:
    - Notificaciones se guardan en DB
    - Retención: 90 días
    - Después se archivan o eliminan (configurable)
```

---

## 12. Comunicación

### 12.1 Contacto con Staff

**Decisión:** Botón directo a WhatsApp (no chat interno).

**Implementación:**
```yaml
Staff_Contact:
  
  Método_Principal: "WhatsApp"
  
  Botón:
    ubicación: "Múltiples lugares"
    ubicaciones:
      - Header (siempre visible): icono de WhatsApp
      - Dashboard: Widget "¿Necesitas ayuda?"
      - Perfil: Botón "Contactar escuela"
      - Cualquier error: "Contactar soporte"
    
    comportamiento:
      click: "Abre WhatsApp con mensaje pre-llenado"
      
      mensaje_pre_llenado:
        base: |
          Hola, soy {nombre} (ID: {student_id}).
          
        contexto_automático:
          desde_error: "+ Tengo un problema con: {contexto}"
          desde_clase: "+ Sobre mi clase del {fecha}: {asunto}"
          desde_créditos: "+ Consulta sobre mis créditos"
          desde_pago: "+ Consulta sobre mi pago #{payment_id}"
      
      target:
        web: "https://wa.me/{phone}?text={mensaje_encoded}"
        mobile: "whatsapp://send?phone={phone}&text={mensaje_encoded}"
  
  Alternativas:
    
    Email:
      ubicación: "Footer del portal"
      mostrar: "Email: contacto@escuela.com"
      comportamiento: "Abre cliente de email (mailto:)"
    
    Teléfono:
      ubicación: "Footer + widget de contacto"
      mostrar: "Tel: +54 9 11 1234-5678"
      click: "tel:+5491112345678" (en móvil)
    
    Horarios:
      ubicación: "Widget de contacto"
      mostrar: "Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00"
```

**Justificación:** WhatsApp es canal principal en Argentina, evita duplicar infraestructura de chat.

---

### 12.2 Sistema de Tickets

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "WhatsApp es suficiente para volumen inicial"
  - "Agrega complejidad significativa"
  - "Staff puede gestionar consultas en WhatsApp directamente"
  - "Sin tickets = menos overhead operacional"

Post_MVP:
  cuándo: "Cuando volumen de consultas > 50/día"
  
  features:
    - Crear ticket desde portal
    - Categorías: Pagos, Clases, Técnico, Otro
    - Prioridad: Baja, Media, Alta
    - Estados: Abierto, En progreso, Resuelto, Cerrado
    - Historial de tickets
    - Respuestas dentro del portal
    - Notificaciones de actualizaciones
    - SLA tracking
```

---

### 12.3 Contacto con Instructor

**Decisión:** NO puede contactar instructor directamente.

**Justificación:**
```yaml
Razones:
  - "Centralizar comunicación en staff"
  - "Evitar mensajes a deshoras a instructores"
  - "Staff puede mediar y resolver mejor"
  - "Proteger privacidad de instructores"

Workaround:
  estudiante_necesita_hablar_con_instructor:
    1. Contacta al staff (WhatsApp)
    2. Staff coordina con instructor
    3. Instructor contacta al estudiante (si necesario)
  
  caso_especial_clase_en_curso:
    - Durante la clase presencial: comunicación directa
    - Post-clase: si instructor da su número voluntariamente (fuera del sistema)

Post_MVP:
  mensajería_controlada:
    - Estudiante puede enviar mensaje pre-definidos
    - Opciones:
      * "Voy 10 minutos tarde"
      * "Cambio de punto de encuentro"
      * "Confirmo asistencia"
    - Instructor recibe por WhatsApp (unidireccional)
    - NO hay chat bidireccional libre
```

---

### 12.4 FAQ y Centro de Ayuda

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Requiere crear contenido extenso"
  - "Mantenimiento constante"
  - "Staff puede responder directamente (volumen bajo)"

Post_MVP:
  estructura:
    
    Categorías:
      - Cómo agendar clases
      - Políticas de cancelación
      - Créditos y paquetes
      - Pagos y facturación
      - Cuenta y perfil
      - Examen de conducir
    
    Por_Cada_Artículo:
      - Título
      - Contenido (con imágenes/videos)
      - Tags
      - Búsqueda
      - "¿Te ayudó este artículo?" (feedback)
    
    Extras:
      - Barra de búsqueda prominente
      - Artículos relacionados
      - Videos tutoriales
      - Artículos más vistos
```

---

## 13. Post-Graduación

### 13.1 Estado de Graduado

**Decisión:** Graduado tiene acceso COMPLETO y normal al portal.

**Comportamiento:**
```yaml
Graduated_Student:
  
  Access:
    portal: "Acceso completo, sin cambios"
    funciones: "Todas disponibles"
  
  Visualización:
    
    Badge:
      ubicación: "Header del portal"
      texto: "🎓 Graduado"
      color: oro
      tooltip: "Completaste el curso exitosamente el {fecha}"
    
    Dashboard:
      widget_especial:
        título: "¡Felicitaciones, Graduado!"
        contenido:
          - "Completaste tu curso el {fecha}"
          - "Aprobaste el examen: {sí/no/pendiente}"
          - Estadísticas finales:
            * Total clases: X
            * Horas de práctica: Y
            * Instructor principal: {nombre}
        botones:
          - "Descargar certificado"
          - "Dejar reseña"
  
  Funciones_Disponibles:
    ✅ ver_historial_completo: true
    ✅ ver_pagos: true
    ✅ ver_progreso: true
    ✅ descargar_certificado: true
    ✅ dejar_reseña: true
    
    ⏸️ agendar_nuevas_clases:
      comportamiento: "Puede agendar, pero se muestra alerta"
      alerta: "Ya te graduaste. ¿Necesitas clases de perfeccionamiento?"
      requiere: "Confirmación explícita"
    
    ⏸️ comprar_paquetes:
      comportamiento: "Puede comprar, con mensaje especial"
      mensaje: "¿Clases de perfeccionamiento o para otra licencia?"
  
  Razón_Acceso_Completo:
    - Ver historial para trámites
    - Descargar certificados
    - Referencias futuras
    - Re-activación para cursos adicionales (moto, truck, etc)
```

---

### 13.2 Certificado de Finalización

**Decisión:** Sí puede descargar certificado PDF.

**Implementación:**
```yaml
Graduation_Certificate:
  
  Generación:
    trigger: "Staff marca como 'graduated'"
    método: "PDF generado automáticamente"
  
  Contenido_PDF:
    
    Header:
      - Logo de la escuela
      - Título: "Certificado de Finalización"
    
    Body:
      - Texto formal:
        """
        Certificamos que {NOMBRE_COMPLETO} (DNI {NÚMERO})
        ha completado exitosamente el curso de conducción
        en {NOMBRE_ESCUELA}.
        
        Detalles del curso:
        - Fecha de inicio: {fecha}
        - Fecha de finalización: {fecha}
        - Total de clases: {número}
        - Instructor principal: {nombre}
        - Tipo de licencia: Clase {B/A/C/D}
        - Examen aprobado: {Sí/No} el {fecha}
        """
      
      - Estadísticas:
        * Clases prácticas: X
        * Clases teóricas: Y
        * Horas totales: Z
        * Tasa de asistencia: XX%
    
    Footer:
      - Firma del director/owner (imagen)
      - Sello de la escuela (imagen)
      - Código QR: link de verificación (post-MVP)
      - Fecha de emisión
      - Número de certificado: CERT-{school_id}-{student_id}-{year}
  
  Descarga:
    ubicación: "Dashboard + Mi Progreso"
    botones:
      - "Descargar Certificado" (PDF)
      - "Enviar por Email"
      - "Compartir" (link temporal) - post-MVP
  
  Verificación (Post-MVP):
    - QR code en certificado
    - Escanear → web pública de verificación
    - Muestra: Nombre, fecha, escuela, válido/inválido
    - Útil para trámites oficiales
  
  Customización:
    - Staff puede editar template del certificado
    - Subir logo, firma, sello
    - Cambiar textos
    - Elegir diseño (clásico, moderno, etc)
```

---

### 13.3 Sistema de Reseñas

**Decisión:** Sí puede dejar reseña en Google Maps.

**Implementación:**
```yaml
Reviews_System:
  
  Plataforma: "Google Maps (externa)"
  
  Flujo:
    
    Ubicación:
      trigger_points:
        - Dashboard de graduado: Widget "Deja tu reseña"
        - Email post-graduación: Link directo
        - Después de última clase: Notificación
    
    Proceso:
      1. Botón: "Dejar reseña en Google"
      2. Click → Abre Google Maps review page
      3. URL directo al perfil de la escuela en Google Maps
      4. Estudiante escribe reseña en Google (fuera del portal)
      5. Sistema registra que se hizo click (tracking)
    
    Tracking_Interno:
      - Campo en student: review_requested_at (timestamp)
      - Campo: review_link_clicked (boolean)
      - NO guardamos la reseña en nuestro sistema
      - NO sabemos si realmente dejó la reseña
  
  Link_Google_Maps:
    formato: "https://search.google.com/local/writereview?placeid={place_id}"
    obtención_place_id:
      1. Escuela busca su negocio en Google Maps
      2. Staff copia Place ID
      3. Lo configura en Settings
  
  Incentivos (Opcional):
    
    Sin_Incentivo_Económico:
      - NO se paga por reseñas (viola políticas de Google)
    
    Incentivo_Social:
      - Mensaje: "Tu opinión ayuda a futuros estudiantes"
      - Agradecimiento público (con permiso): "Gracias {nombre} por tu reseña"
    
    Seguimiento:
      - Email de recordatorio después de 7 días (si no hizo click)
      - Máximo 2 recordatorios, luego no molestar más
  
  Reviews_Internas (Post-MVP):
    descripción: "Sistema de reseñas dentro del portal (privadas)"
    uso: "Feedback interno para mejorar servicio"
    campos:
      - Rating general (1-5 estrellas)
      - Rating instructor (1-5)
      - Rating vehículos (1-5)
      - Rating instalaciones (1-5)
      - Comentario abierto
    privacidad: "Solo visible para staff"
```

---

## 14. Mobile Experience

### 14.1 Diseño Responsive

**Decisión:** Sí, responsive es OBLIGATORIO en MVP.

**Justificación:**
```yaml
Razones_Críticas:
  - "Mayoría de usuarios usarán celular (60-70% del tráfico esperado)"
  - "WhatsApp se usa mayormente en móvil"
  - "Estudiantes jóvenes prefieren móvil"
  - "Agendar desde el celular es más conveniente"

Implementación:
  framework: "Tailwind CSS (mobile-first)"
  breakpoints:
    - mobile: "< 640px"
    - tablet: "640px - 1024px"
    - desktop: "> 1024px"
  
  Diseño_Mobile_First:
    - Diseñar primero para móvil
    - Luego expandir para desktop
    - NO al revés
  
  Componentes_Responsive:
    
    Navigation:
      mobile: "Hamburger menu"
      desktop: "Horizontal navbar"
    
    Dashboard:
      mobile: "Widgets apilados verticalmente"
      desktop: "Grid 2-3 columnas"
    
    Calendario:
      mobile: "Vista día/lista prioritaria"
      desktop: "Vista semana/mes"
    
    Formularios:
      mobile: "Full width, campos apilados"
      desktop: "2 columnas, más compacto"
    
    Tablas:
      mobile: "Cards con scroll horizontal"
      desktop: "Tabla tradicional"
  
  Testing:
    devices_prioritarios:
      - iPhone SE (pantalla pequeña)
      - iPhone 12/13/14 (estándar)
      - Samsung Galaxy S21/S22
      - iPad (tablet)
    
    navegadores:
      - Safari iOS (crítico)
      - Chrome Android
      - Chrome desktop
      - Firefox desktop
```

---

### 14.2 App Móvil Nativa

**Decisión:** NO hay app nativa en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Web app responsive es suficiente"
  - "Evita complejidad de 2 codebases (iOS + Android)"
  - "Evita proceso de aprobación de App Store / Play Store"
  - "Evita costos de developer accounts ($99/año Apple, $25 Google)"
  - "Updates más rápidos (web vs app)"
  - "MVP debe validar producto primero"

Web_App_Ventajas:
  - Un solo codebase
  - Updates instantáneos
  - No requiere instalación
  - Cross-platform automático
  - Más fácil de mantener

Post_MVP:
  cuándo: "Cuando tengamos 500+ usuarios activos y validen necesidad"
  
  features_app_nativa:
    - Push notifications (más confiables que web)
    - Funcionamiento offline
    - Integración con calendario nativo
    - Mejor rendimiento
    - Acceso a features nativas (cámara, ubicación, etc)
  
  tecnología_sugerida:
    - React Native (usar conocimiento de React existente)
    - Expo (simplifica desarrollo)
    - Código compartido ~70% con web
```

---

### 14.3 PWA (Progressive Web App)

**Decisión:** NO en MVP, pero infraestructura preparada.

**Razón:**
```yaml
PWA_Benefits:
  - Instalable en home screen
  - Funciona offline (limitado)
  - Ícono en el dispositivo (como app)
  - Fullscreen mode
  - Push notifications (limitado en iOS)

MVP_Status:
  implementar_base: false
  preparar_infraestructura: true
  
  qué_hacer_en_MVP:
    - ✅ HTTPS obligatorio (requisito para PWA)
    - ✅ Responsive design (ya cubierto)
    - ❌ Manifest.json (post-MVP)
    - ❌ Service Workers (post-MVP)
    - ❌ Offline functionality (post-MVP)
    - ❌ Install prompt (post-MVP)

Post_MVP:
  timeline: "Sprint 2-3 después del MVP"
  esfuerzo: "1-2 semanas"
  
  implementación:
    - Agregar manifest.json
    - Configurar service worker (caching básico)
    - Install banner para iOS/Android
    - Offline fallback page
    - Background sync (para forms)
```

**Nota sobre PWA:** Es un buen intermedio entre web y app nativa, menor esfuerzo que app nativa.

---

## 15. Privacidad y Seguridad

### 15.1 Exportación de Datos (GDPR-style)

**Decisión:** Sí puede exportar sus datos completos.

**Implementación:**
```yaml
Data_Export:
  
  Ubicación: "Mi Cuenta → Privacidad → Exportar mis datos"
  
  Botón:
    texto: "Solicitar exportación de datos"
    descripción: "Descarga toda tu información en un archivo ZIP"
  
  Proceso:
    
    1. Click_Botón:
      - Modal de confirmación:
        "Vamos a preparar un archivo con toda tu información.
        Te enviaremos un email cuando esté listo (usualmente 5-10 minutos)."
      - Botón: "Solicitar exportación"
    
    2. Backend_Processing:
      - Job asíncrono (background)
      - Recopila todos los datos del estudiante
      - Genera ZIP con archivos
      - Sube a storage temporal (expiración: 7 días)
      - Envía email con link de descarga
    
    3. Email_Notificación:
      asunto: "Tu exportación de datos está lista"
      contenido:
        - "Hola {nombre}, tu archivo de datos está listo."
        - "Link de descarga: {link}" (expira en 7 días)
        - "Tamaño: X MB"
      
    4. Descarga:
      - Click en link → descarga directa
      - Archivo protegido con contraseña (enviar en email separado)
      - Expiración: 7 días, luego se elimina
  
  Contenido_ZIP:
    
    archivos:
      
      personal_info.json:
        - Nombre, email, teléfono
        - Documento, fecha nacimiento
        - Dirección
        - Contacto emergencia
        - Licencia (si tiene)
      
      classes.json:
        - Historial completo de clases
        - Fechas, instructores, vehículos
        - Evaluaciones
        - Estados (completadas/canceladas)
      
      credits.json:
        - Paquetes comprados
        - Transacciones de créditos
        - Balance histórico
      
      payments.json:
        - Historial de pagos
        - Montos, métodos, fechas
        - IDs de transacciones
      
      notifications.json:
        - Historial de notificaciones
        - Tipos, fechas, estados
      
      progress.json:
        - Objetivos
        - Habilidades evaluadas
        - Fecha estimada de examen
        - Estadísticas
      
      attachments/:
        - Recibos (PDFs)
        - Certificado (si graduado)
        - Comprobantes de pago
    
    formato: "JSON legible + CSVs + PDFs"
    total: "Usualmente 5-20 MB"
  
  Frecuencia:
    límite: "1 exportación cada 30 días"
    razón: "Evitar abuso del sistema"
    excepción: "Staff puede generar a pedido"
  
  Cumplimiento:
    legislación: "GDPR (Europa) + PDPA (Argentina)"
    derecho: "Derecho de acceso a datos personales"
    timeline: "Datos entregados dentro de 30 días" (nosotros: 10 minutos)
```

---

### 15.2 Eliminación de Cuenta

**Decisión:** Debe solicitarlo al staff, NO puede eliminarse solo.

**Justificación:**
```yaml
Razones:
  legal:
    - "Retención de datos por obligación legal (histórico de pagos)"
    - "Auditoría financiera requiere mantener registros"
    - "Posibles reclamos futuros"
  
  operacional:
    - "Prevenir eliminaciones accidentales"
    - "Estudiante puede tener deudas pendientes"
    - "Puede tener clases agendadas"
  
  técnica:
    - "Relaciones complejas en DB (pagos, clases, etc)"
    - "Soft delete es más seguro"

Proceso:
  
  Estudiante:
    1. Ve botón: "Eliminar mi cuenta" (en Privacidad)
    2. Click → Modal:
       "Para eliminar tu cuenta, debes contactar a la escuela."
       Botón: "Contactar por WhatsApp"
    3. WhatsApp pre-llenado:
       "Hola, solicito eliminar mi cuenta de {escuela}."
  
  Staff:
    1. Recibe solicitud del estudiante
    2. Verifica:
       - No tiene clases agendadas futuras
       - No tiene deudas pendientes
       - No tiene créditos sin usar (o los acepta perder)
    3. Si todo OK:
       - Soft delete: marca deleted_at = NOW()
       - Estado: 'deleted'
       - Datos personales: ANONIMIZADOS (ver 15.3)
    4. Notifica al estudiante:
       "Tu cuenta fue desactivada."

Soft_Delete_vs_Hard_Delete:
  
  Soft_Delete (MVP):
    - deleted_at timestamp != NULL
    - Datos permanecen en DB
    - No visible en búsquedas
    - No puede hacer login
    - Datos financieros intactos (auditoría)
  
  Hard_Delete (Post-MVP con caución):
    - Solo después de período de retención (ej: 5 años)
    - Requiere proceso manual de staff
    - Elimina físicamente de DB
    - Backup previo obligatorio

Anonimización:
  
  Al_Soft_Delete:
    - email → "deleted_user_{id}@example.com"
    - phone → "+00000000000"
    - name → "Usuario Eliminado"
    - address → "***"
    - document → "***"
  
  Datos_que_PERMANECEN:
    ✅ Historial de pagos (montos, fechas)
    ✅ Historial de clases (fechas, sin evaluaciones)
    ✅ Transacciones financieras (auditoría)
    ❌ Datos personales identificables
```

---

### 15.3 Términos y Condiciones

**Decisión:** Sí, debe aceptar T&C al crear cuenta.

**Implementación:**
```yaml
Terms_and_Conditions:
  
  Aceptación_Inicial:
    cuándo: "Al crear cuenta (primer login)"
    
    pantalla:
      - Título: "Términos y Condiciones"
      - Contenido scrolleable con T&C completos
      - Checkbox obligatorio: "He leído y acepto los Términos y Condiciones"
      - Link: "Leer Política de Privacidad"
      - Botón "Aceptar y Continuar" (deshabilitado hasta marcar checkbox)
      - NO puede usar el sistema sin aceptar
  
  Contenido_T&C:
    
    secciones_básicas:
      - Uso del servicio
      - Responsabilidades del estudiante
      - Política de cancelación y reembolsos
      - Privacidad y uso de datos
      - Propiedad intelectual
      - Limitación de responsabilidad
      - Jurisdicción aplicable (Argentina)
      - Contacto
    
    puntos_clave:
      - "Al agendar clase, aceptas política de cancelación"
      - "Créditos vencidos no son reembolsables"
      - "Datos serán usados para operación del servicio"
      - "Escuela se reserva derecho de rechazar servicio"
      - "No garantizamos aprobación del examen oficial"
  
  Actualización_de_T&C:
    
    cuándo: "Si escuela modifica los términos"
    
    proceso:
      1. Staff publica nuevos T&C con fecha de vigencia
      2. Estudiante ve banner al hacer login:
         "Los Términos y Condiciones fueron actualizados.
         Por favor revisa y acepta para continuar."
      3. Modal obligatorio con nuevos T&C
      4. Debe aceptar para usar el sistema
      5. Se registra fecha de aceptación en DB
    
    registro_DB:
      tabla: terms_acceptances
      campos:
        - student_id: uuid
        - terms_version: integer
        - accepted_at: timestamp
        - ip_address: string (evidencia)
  
  Documento_Legal:
    
    creación:
      responsable: "Cliente (con abogado recomendado)"
      formato: PDF + HTML
      ubicación: URL pública (ej: /terms-and-conditions)
    
    versionamiento:
      - Cada versión tiene número único
      - Fecha de vigencia
      - Changelog visible (qué cambió)
    
    accesibilidad:
      - Link en footer: "Términos y Condiciones"
      - Link en modal de aceptación
      - Puede descargar PDF en cualquier momento

Cumplimiento_Legal:
  - Argentina: Ley de Protección de Datos Personales 25.326
  - Código de Defensa del Consumidor
  - Términos deben ser claros y comprensibles
  - NO puede haber cláusulas abusivas
```

---

### 15.4 Audit Log Público

**Decisión:** NO, estudiante NO puede ver quién accedió a su perfil.

**Justificación:**
```yaml
Razones:
  - "No es práctico ni útil para el estudiante"
  - "Staff necesita acceder frecuentemente (no es sospechoso)"
  - "Genera paranoia innecesaria"
  - "Complejidad adicional sin beneficio claro"

Alternativa:
  - Audit log existe en backend (para admin)
  - Staff puede ver su propio historial de acciones
  - Owner puede auditar acciones del staff
  - Estudiante NO lo ve

Post_MVP:
  podría_agregarse: "Vista limitada"
  ejemplo:
    - "Tu información fue actualizada el {fecha} por {staff}"
    - NO muestra cada vez que alguien VIO el perfil
    - Solo cambios significativos

Seguridad_General:
  mejores_prácticas:
    - HTTPS obligatorio
    - Sessions seguras
    - Rate limiting en login
    - Logging de accesos sospechosos (backend)
    - Notificación si cambia email/contraseña
```

---

## 16. Features Adicionales

### 16.1 Multi-Idioma

**Decisión:** Sí, pero solo español en MVP. Inglés post-MVP.

**Implementación:**
```yaml
I18n_Internationalization:
  
  MVP:
    idiomas_soportados: ["español"]
    idioma_default: "español"
    no_hay_selector: true
  
  Preparación_Post_MVP:
    
    arquitectura:
      - Usar biblioteca i18n (react-i18next)
      - Separar todos los strings en archivos de traducción
      - NO hardcodear textos en componentes
    
    estructura_archivos:
      /locales
        /es
          common.json
          dashboard.json
          classes.json
          payments.json
        /en  (vacío en MVP, llenar post-MVP)
          common.json
          ...
    
    ejemplo_uso:
      // Mal (hardcoded)
      <h1>Bienvenido al portal</h1>
      
      // Bien (i18n ready)
      <h1>{t('common.welcome')}</h1>
  
  Post_MVP:
    
    idiomas_adicionales: ["inglés"]
    
    selector_idioma:
      ubicación: "Settings → Idioma"
      opciones: ["Español", "English"]
      persistencia: "Guardado en preferencias de usuario"
      efecto: "Toda la UI cambia inmediatamente"
    
    alcance_traducción:
      - ✅ Toda la UI
      - ✅ Emails
      - ✅ Notificaciones WhatsApp
      - ❌ Contenido generado por staff (descripciones de paquetes, etc)
    
    trabajo_requerido:
      - Traducir ~500-1000 strings
      - Contratar traductor nativo
      - Testing exhaustivo en inglés
      - Ajustar layouts (inglés suele ser más largo)
```

---

### 16.2 Contenido Regional

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "MVP enfocado en Buenos Aires / Argentina"
  - "Regulaciones de tránsito varían por provincia"
  - "Requiere investigación legal por región"
  - "Complejidad sin retorno en MVP"

Ejemplos_Contenido_Regional:
  - Requisitos para examen por provincia
  - Tipos de licencia según jurisdicción
  - Documentación requerida
  - Costos oficiales del registro
  - Contacto de autoridades locales

Post_MVP:
  - Si expandimos a múltiples provincias
  - Agregar campo "provincia" en school
  - Mostrar contenido específico según provincia
  - FAQ regionalizado
```

---

### 16.3 Sistema de Referidos

**Decisión:** Sí, sistema de referidos en MVP.

**Implementación:**
```yaml
Referral_System:
  
  Ubicación: "Mi Cuenta → Referidos"
  
  Código_Personal:
    
    generación:
      - Cada estudiante tiene código único
      - Formato: {nombre}-{random} (ej: MARIA-X7K9)
      - Generado automáticamente al crear cuenta
    
    visualización:
      widget_dashboard:
        título: "Refiere a un amigo"
        código: "Tu código: MARIA-X7K9"
        botón_copiar: "Copiar código"
        link_compartir: "https://app.escuela.com/signup?ref=MARIA-X7K9"
        
        beneficios:
          - "Tu amigo recibe: {beneficio_referido}"
          - "Tú recibes: {beneficio_referrer}"
          
          ejemplo:
            - "Tu amigo: 10% descuento en su primer paquete"
            - "Tú: 2 clases gratis cuando tu amigo compre su primer paquete"
  
  Flujo_Completo:
    
    1. Estudiante_Refiere:
      - Comparte su código/link con amigo
      - Métodos: WhatsApp, email, redes sociales
    
    2. Amigo_Se_Registra:
      - Usa link con código (URL param: ?ref=MARIA-X7K9)
      - O ingresa código manualmente en registro
      - Sistema asocia referido con referrer
    
    3. Amigo_Compra_Paquete:
      - Se aplica descuento automáticamente
      - Sistema registra "conversión de referido"
    
    4. Recompensa_Referrer:
      - Sistema otorga créditos promocionales al referrer
      - Notificación: "¡{amigo} usó tu código! Ganaste 2 clases gratis"
      - Créditos acreditados inmediatamente
  
  Configuración_Beneficios:
    
    tipo_1_descuento_referido:
      - Porcentaje o monto fijo
      - Aplicable a primer paquete o cualquier paquete
      - Ejemplo: "10% off" o "$5000 off"
    
    tipo_2_creditos_referrer:
      - Cantidad de clases gratis
      - Pueden tener vencimiento
      - Ejemplo: "2 clases gratis (válidas 90 días)"
    
    configurable_por: "Owner (Settings → Referidos)"
    puede_cambiar: "Sí, pero no afecta referidos anteriores"
  
  Tracking:
    
    dashboard_referidos:
      ubicación: "Mi Cuenta → Referidos"
      
      estadísticas:
        - Total referidos: 5
        - Referidos activos: 3 (compraron paquete)
        - Referidos pendientes: 2 (registrados, no compraron)
        - Créditos ganados: 6 clases
      
      lista_referidos:
        por_cada_referido:
          - Nombre (o "Pendiente" si no se registró)
          - Fecha de registro
          - Estado: "Registrado" / "Activo" (compró) / "Inactivo"
          - Recompensa otorgada: "2 clases" o "Pendiente"
    
    límites:
      - Sin límite de referidos
      - Sin fecha de expiración del código
      - Beneficios según configuración de escuela
  
  Fraude_Prevention:
    
    validaciones:
      - Email y teléfono del referido NO pueden ser duplicados
      - NO puede referirse a sí mismo
      - NO puede crear cuentas fake (validación por staff)
      - IP tracking (evitar múltiples registros desde misma IP)
    
    revisión_manual:
      - Staff ve dashboard de referidos
      - Puede marcar referidos como "sospechosos"
      - Puede revocar créditos promocionales si detecta fraude
```

---

### 16.4 Compartir en Redes Sociales

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "No es crítico para operación"
  - "Estudiantes pueden compartir manualmente si quieren"
  - "Poco ROI para MVP"

Post_MVP:
  compartir_logros:
    - "Acabo de completar mi clase #10! 🚗"
    - Imagen generada automáticamente con branding
    - Share buttons: Facebook, Twitter, Instagram
  
  compartir_certificado:
    - LinkedIn (específicamente para graduados)
    - Imagen del certificado + link a verificación
```

---

### 16.5 Blog o Contenido Educativo

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Portal del estudiante ≠ sitio de marketing"
  - "Blog va en sitio web público"
  - "Requiere creación de contenido constante"
  - "No aporta a funcionalidad core"

Alternativa:
  - Blog/contenido en sitio web de marketing (separado)
  - Links desde portal si hay contenido relevante
  - FAQ interno (si se agrega post-MVP)

Post_MVP_Posible:
  - Sección "Consejos" o "Tips"
  - Videos educativos cortos
  - Artículos sobre conducción segura
  - Preparación para el examen
```

---

### 16.6 Clases Teóricas Grupales

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Agrega complejidad al sistema de agendamiento"
  - "No todas las escuelas ofrecen clases grupales"
  - "Lógica diferente a clases 1-on-1"
  - "Requiere features de gestión de grupos"

Implicaciones_Post_MVP:
  si_se_agrega:
    nuevas_features:
      - Capacidad máxima por clase grupal
      - Lista de participantes
      - Inscripción hasta que se llene cupo
      - Cancelación grupal vs individual
      - Pricing diferente (usualmente más barato)
      - Instructor ve todos los estudiantes
    
    complejidad: ALTA
    timeline: 4-6 semanas adicionales

MVP_Workaround:
  - Si escuela ofrece clases grupales:
    - Staff las crea manualmente como múltiples clases 1-on-1
    - Mismo horario, mismo instructor
    - Se ven separadas para cada estudiante
  - Funciona, pero no es óptimo
```

---

### 16.7 Ver Disponibilidad de Vehículos

**Decisión:** NO en MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Vehículo se asigna automáticamente"
  - "Estudiante no elige vehículo"
  - "Info innecesaria en flujo de agendamiento"

Post_MVP:
  podría_mostrarse:
    - Foto del vehículo asignado
    - Características especiales (cámara reversa, sensores, etc)
    - "Este auto es el que más usaste" (familiaridad)
  
  galería_de_flota:
    - Página "Nuestros Vehículos"
    - Fotos de todos los autos
    - Especificaciones
    - Más para marketing que para funcionalidad
```

---

### 16.8 Integración con Google Calendar

**Decisión:** Sería genial, pero POST-MVP.

**Justificación:**
```yaml
Razones_Posponer:
  - "Requiere OAuth flow con Google"
  - "Complejidad de sincronización bidireccional"
  - "Edge cases: conflictos, eliminaciones, etc"
  - "No crítico para MVP"

Beneficios_Si_Se_Agrega:
  - Clases aparecen automáticamente en calendario personal
  - Sincronización bidireccional:
    * Clase agendada → aparece en Google Calendar
    * Clase cancelada → se elimina de Google Calendar
  - Recordatorios nativos de Google
  - Compartir con familia

Implementación_Post_MVP:
  
  flujo:
    1. Estudiante: "Conectar con Google Calendar"
    2. OAuth flow → permiso de acceso
    3. Sistema crea evento en calendario
    4. Webhook de Google para cambios (opcional)
  
  alcance:
    - Solo sync unidireccional en v1 (nuestro sistema → Google)
    - Bidireccional en v2 (más complejo)
  
  timeline: 2-3 semanas
  complejidad: MEDIA
```

---

## 17. MVP Scope

### 17.1 Features Críticas

**Decisión:** Las 5 features MÍNIMAS para MVP son:

```yaml
Critical_Features_MVP:
  
  1. Ver_Clases_Agendadas:
    descripción: "Estudiante puede ver sus clases upcoming y pasadas"
    incluye:
      - Calendario y lista
      - Filtros básicos
      - Detalles de cada clase
    sin_esto: "Portal no tiene propósito básico"
  
  2. Agendar_Clases:
    descripción: "Estudiante puede agendar clases (auto-agendamiento)"
    incluye:
      - Wizard de 4 pasos
      - Selección de instructor
      - Selección de fecha/hora
      - Confirmación inmediata
    sin_esto: "Estudiante debe llamar siempre (no hay valor digital)"
  
  3. Cancelar_y_Reprogramar:
    descripción: "Estudiante puede cancelar o reprogramar clases"
    incluye:
      - Botón de cancelación
      - Política de ventanas (24h, 12h)
      - Devolución automática de créditos
      - Flujo de re-programación
    sin_esto: "Depende 100% del staff, no tiene autonomía"
  
  4. Ver_Balance_de_Créditos:
    descripción: "Estudiante puede ver sus créditos disponibles"
    incluye:
      - Balance actual
      - Desglose por paquete
      - Historial de transacciones
      - Alertas de vencimiento
    sin_esto: "No sabe si puede agendar clases"
  
  5. Historial_Completo:
    descripción: "Ver historial de clases y pagos"
    incluye:
      - Todas las clases pasadas
      - Todos los pagos realizados
      - Recibos descargables
      - Evaluaciones de instructores
    sin_esto: "No tiene registro de su progreso"

Propuesta_de_Valor_MVP:
  con_estas_5_features:
    - Estudiante tiene AUTONOMÍA básica
    - Reduce carga de trabajo del staff
    - Experiencia digital completa (aunque simple)
    - Transparencia total (créditos, pagos, clases)
    - Conveniencia (agendar 24/7)
```

---

### 17.2 Features Pospuestas

**Decisión:** Todo lo demás se puede posponer sin afectar operación básica.

**Lista de features POST-MVP:**
```yaml
Post_MVP_Features:
  
  Prioridad_Alta (Sprint 1-2 post-MVP):
    - Compra online de paquetes
    - Notificaciones push (PWA)
    - Sistema de favoritos de instructores (parcialmente en MVP)
    - Exportación de datos (GDPR)
  
  Prioridad_Media (Sprint 3-5 post-MVP):
    - App móvil nativa
    - Multi-idioma (inglés)
    - Gamificación básica
    - Google Calendar sync
    - Referidos con tracking avanzado
  
  Prioridad_Baja (Sprint 6+ post-MVP):
    - Sistema de tickets
    - Chat en vivo
    - Blog/contenido educativo
    - Clases teóricas grupales
    - Sharing en redes sociales
    - Contenido regionalizado
    - Reviews internas
    - FAQ / Centro de ayuda
  
  Puede_Nunca_Agregarse:
    - Ver disponibilidad de vehículos
    - Contacto directo con instructor
    - 2FA obligatorio
    - Audit log público
```

---

### 17.3 Importancia para Lanzamiento

**Decisión:** Student Portal NO es bloqueante para MVP del SaaS completo.

**Explicación:**
```yaml
MVP_Launch_Strategy:
  
  Escenario_A_Sin_Portal:
    
    qué_se_puede_vender:
      - Sistema completo de gestión para staff
      - Scheduling avanzado
      - Resource management
      - Payments integration
      - WhatsApp notifications
    
    cómo_funciona_sin_portal:
      - Staff agenda clases para estudiantes
      - Staff envía notificaciones por WhatsApp
      - Estudiantes llaman/WhatsApp para cancelar
      - Staff gestiona todo manualmente
    
    propuesta_de_valor:
      - "Sistema de gestión completo para tu escuela"
      - "Automati todos tus procesos internos"
      - Portal de estudiantes: "Coming soon"
    
    viable: SÍ
    recomendado: SOLO si portal se atrasa mucho
  
  Escenario_B_Con_Portal (IDEAL):
    
    propuesta_de_valor_superior:
      - "Sistema completo con portal para estudiantes"
      - "Tus estudiantes pueden auto-agendar 24/7"
      - "Reduce tu carga de trabajo en un 50%"
      - "Experiencia moderna para tus estudiantes"
    
    diferenciación:
      - Competencia NO tiene portal de estudiantes
      - Feature destacado en marketing
      - Justifica precio más alto
    
    viable: SÍ
    recomendado: SÍ (si timeline lo permite)
  
  Decisión_Estratégica:
    
    if timeline_ajustado:
      prioridad: "Lanzar SIN portal"
      razón: "Validar negocio primero"
      timeline_portal: "Agregar en versión 1.1 (2-3 meses después)"
    
    if timeline_holgado:
      prioridad: "Lanzar CON portal básico"
      razón: "Mejor propuesta de valor desde día 1"
      scope_portal: "Solo 5 features críticas (ver 17.1)"

Recomendación_Final:
  - Intentar lanzar CON portal básico
  - Pero estar preparados para lanzar SIN portal si hay delays
  - Portal suma mucho valor, pero NO es life-or-death
  - Escuelas pueden operar sin portal (lo hacen hoy)
```

---

## 18. Timeline y Complejidad

### 18.1 Estimación de Tiempo

**Decisión:** Timeline estimado para Student Portal completo.

**Desglose:**
```yaml
Development_Timeline:
  
  Sprint_0_Planning: "1 semana"
    tareas:
      - Finalizar wireframes
      - Diseño UI/UX
      - Setup de proyecto frontend
      - Configurar i18n desde el inicio
  
  Sprint_1_Auth_Dashboard: "2 semanas"
    features:
      - Login/logout
      - Password reset
      - Email verification
      - Phone verification
      - Dashboard básico
      - Header/navigation
    complejidad: MEDIA
  
  Sprint_2_Clases_Visualización: "2 semanas"
    features:
      - Vista de calendario
      - Vista de lista
      - Filtros y búsqueda
      - Detalles de clase
      - Historial completo
    complejidad: MEDIA-ALTA
  
  Sprint_3_Agendamiento: "3 semanas"
    features:
      - Wizard de agendamiento (4 pasos)
      - Selección de instructor
      - Calendario interactivo
      - Validaciones
      - Confirmación
    complejidad: ALTA (feature más compleja)
  
  Sprint_4_Cancelación: "2 semanas"
    features:
      - Cancelación con políticas
      - Re-programación
      - Devolución de créditos
      - Validaciones de ventanas
    complejidad: MEDIA-ALTA
  
  Sprint_5_Créditos_Pagos: "2 semanas"
    features:
      - Vista de créditos
      - Desglose por paquete
      - Alertas de vencimiento
      - Historial de transacciones
      - Historial de pagos
      - Descarga de recibos
    complejidad: MEDIA
  
  Sprint_6_Perfil_Progreso: "2 semanas"
    features:
      - Vista de perfil (read-only)
      - Progreso del curso
      - Evaluaciones visibles
      - Objetivos
      - Certificado de graduación
    complejidad: MEDIA
  
  Sprint_7_Notificaciones: "1 semana"
    features:
      - Centro de notificaciones
      - Preferencias
      - In-app notifications
      - (Email/WhatsApp ya en backend de Fase 2)
    complejidad: BAJA-MEDIA
  
  Sprint_8_Comunicación: "1 semana"
    features:
      - Botones de contacto (WhatsApp)
      - Info de escuela
      - Links útiles
    complejidad: BAJA
  
  Sprint_9_Seguridad: "1 semana"
    features:
      - Términos y condiciones
      - Exportación de datos
      - Settings de cuenta
    complejidad: MEDIA
  
  Sprint_10_Referidos: "1 semana"
    features:
      - Sistema de referidos
      - Tracking
      - Dashboard de referidos
    complejidad: MEDIA
  
  Sprint_11_Testing_Bugs: "2 semanas"
    tareas:
      - Testing end-to-end
      - Bug fixes
      - Performance optimization
      - Responsive testing
      - User acceptance testing (UAT)
    complejidad: VARIABLE

Total_Estimado: "20 semanas" (5 meses)

Con_Equipo_de_2:
  horas_semana: 20 horas combinadas
  dedicación: "10 horas cada uno"
  
  ajuste_realista: "x1.5 factor (learning curve, imprevistos)"
  total_ajustado: "30 semanas" (7.5 meses)

MVP_Reducido (solo features críticas):
  sprints: [0, 1, 2, 3, 4, 5, 7, 11]
  total: "14 semanas" (3.5 meses)
  ajustado: "21 semanas" (5 meses)
```

---

### 18.2 Complejidades Técnicas

**Decisión:** Ninguna feature es particularmente compleja según el usuario.

**Análisis:**
```yaml
Technical_Challenges:
  
  1. Wizard_de_Agendamiento:
    complejidad_percibida: "Ninguna (según usuario)"
    complejidad_real: ALTA
    razones:
      - Múltiples pasos con estado
      - Validaciones complejas (disponibilidad, créditos, ventanas)
      - Sincronización con backend
      - Race conditions posibles
      - UI/UX debe ser fluida
    mitigación:
      - Usar state management robusto (Redux/Zustand)
      - Queries optimizadas
      - Loading states claros
      - Error handling exhaustivo
  
  2. Sistema_de_Créditos:
    complejidad_percibida: "Ninguna"
    complejidad_real: MEDIA-ALTA
    razones:
      - Lógica de fracciones (0.5 créditos)
      - Múltiples paquetes activos
      - Orden de consumo (FIFO)
      - Créditos congelados
      - Vencimientos
    mitigación:
      - Lógica bien encapsulada en backend
      - Frontend solo muestra, no calcula
      - Testing exhaustivo de edge cases
  
  3. Calendario_Interactivo:
    complejidad_percibida: "Ninguna"
    complejidad_real: MEDIA
    razones:
      - Renderizado eficiente
      - Eventos drag & drop (post-MVP)
      - Zonas horarias
      - Responsive en móvil
    mitigación:
      - Usar librería probada (FullCalendar, react-big-calendar)
      - No reinventar la rueda
  
  4. Notificaciones_Tiempo_Real:
    complejidad_percibida: "Ninguna"
    complejidad_real: MEDIA
    razones:
      - WebSocket o Server-Sent Events
      - Fallback a polling
      - Estado de conexión
      - Queueing si offline
    mitigación:
      - Usar Supabase Realtime (ya incluido)
      - O polling simple cada 30 segundos
  
  5. Responsive_Design:
    complejidad_percibida: "Ninguna"
    complejidad_real: MEDIA
    razones:
      - Múltiples breakpoints
      - Componentes deben adaptarse
      - Testing en múltiples dispositivos
      - Performance en móvil
    mitigación:
      - Mobile-first desde el inicio
      - Tailwind CSS (simplifica responsive)
      - Testing constante en móvil real

Ninguna_Es_Imposible:
  - Todas son factibles con React + Next.js
  - Mayor complejidad está en Fase 2 (Scheduling backend)
  - Frontend es mayormente "display" + "forms"
  - No hay algoritmos complejos en frontend
```

**Nota de confianza:** El usuario dijo "ninguna" a complejidad porque confía en que con IA (Claude/GPT) pueden construirlo. Esto es factible, pero requiere iteración y aprendizaje.

---

## 📊 Resumen Técnico - MVP Scope

### **Features Incluidos en MVP del Portal:**

✅ **Autenticación:**
- Email + contraseña
- Password reset
- Email y teléfono verification
- No 2FA

✅ **Dashboard:**
- Vista general con widgets
- Próxima clase destacada
- Balance de créditos
- Historial reciente
- Progreso del curso

✅ **Clases:**
- Vista calendario + lista
- Filtros y búsqueda
- Historial completo
- Auto-agendamiento (híbrido)
- Cancelación con políticas escalonadas (24h, 12h)
- Re-programación

✅ **Créditos:**
- Balance desglosado por paquete
- Alertas de vencimiento
- Historial de transacciones
- Créditos congelados visibles

✅ **Pagos:**
- Historial completo
- Descarga de recibos PDF
- NO compra online en MVP

✅ **Perfil:**
- Vista read-only (no editable)
- Info legal visible
- Documentos visibles

✅ **Progreso:**
- Tracking visual
- Estadísticas
- Evaluaciones de instructor (públicas)
- Objetivos / próximos pasos
- Fecha estimada de examen

✅ **Notificaciones:**
- Centro de notificaciones in-app
- Preferencias configurables
- Email + WhatsApp (backend de Fase 2)

✅ **Comunicación:**
- Botón WhatsApp directo
- NO chat interno
- NO sistema de tickets

✅ **Seguridad:**
- Términos y condiciones
- Exportación de datos (GDPR)
- NO puede eliminar cuenta (debe solicitar)

✅ **Extras:**
- Sistema de referidos
- Responsive design (mobile-first)
- Certificado descargable (graduados)
- Reviews en Google Maps

---

### **Features Post-MVP:**

❌ Compra online de paquetes  
❌ App móvil nativa  
❌ PWA (Progressive Web App)  
❌ 2FA (Two-Factor Authentication)  
❌ Multi-idioma (inglés)  
❌ Chat interno / tickets  
❌ FAQ / Centro de ayuda  
❌ Contacto directo con instructor  
❌ Gamificación  
❌ Clases teóricas grupales  
❌ Google Calendar sync  
❌ Compartir en redes sociales  
❌ Blog / contenido educativo  
❌ Ver disponibilidad de vehículos  
❌ Edición de perfil  
❌ Upload de foto  
❌ Contenido regionalizado  
❌ Audit log público  
❌ Reviews internas  

---

## 🚨 Riesgos y Mitigaciones

### **Riesgo 1: Timeline Optimista**
**Severidad:** Alta  
**Probabilidad:** Media

**Mitigación:**
- Usar AI (Claude/GPT) para acelerar desarrollo
- Priorizar MVP reducido si hay delays
- Lanzar sin portal si es crítico (ver 17.3)
- Buffer de 50% en estimaciones

---

### **Riesgo 2: UX del Wizard de Agendamiento**
**Severidad:** Media  
**Probabilidad:** Baja

**Descripción:** Wizard de 4 pasos puede ser confuso o tedioso.

**Mitigación:**
- User testing temprano con estudiantes reales
- Permitir "back" entre pasos
- Progress indicator claro
- Opción de "vista rápida" (post-MVP)

---

### **Riesgo 3: Responsive en Móvil**
**Severidad:** Media  
**Probabilidad:** Baja

**Descripción:** Calendario puede ser difícil de usar en pantallas pequeñas.

**Mitigación:**
- Mobile-first design desde el inicio
- Vista "lista" prioritaria en móvil
- Testing constante en dispositivos reales
- Considerar gestures nativos (swipe, tap)

---

## 🔄 Dependencias con Otras Fases

**Con Fase 1 (Auth):**
- Sistema de roles y permisos
- Estudiante es un rol específico
- RLS policies protegen datos del estudiante

**Con Fase 2 (Scheduling):**
- Auto-agendamiento usa lógica de scheduling
- Validaciones de conflictos
- Políticas de cancelación
- Notificaciones WhatsApp + Email

**Con Fase 3 (Resources):**
- Vista de créditos usa sistema de créditos
- Balance y transacciones
- Historial de pagos
- Información de perfil

**Con Fase 4 (Payments):**
- Historial de pagos
- Recibos descargables
- Sistema de cupones (cuando haya compra online)

---

## 📅 Timeline Estimado

```yaml
MVP_Reducido (Features Críticas):
  Desarrollo: 14 sprints → 14 semanas
  Con_Ajuste_Realista: 21 semanas (5 meses)
  
  Team_de_2 (20h/semana):
    fecha_inicio: Después de completar Fase 4
    fecha_fin_estimada: +5 meses

Portal_Completo (Todas las Features MVP):
  Desarrollo: 20 sprints → 20 semanas
  Con_Ajuste_Realista: 30 semanas (7.5 meses)
  
  Team_de_2 (20h/semana):
    fecha_inicio: Después de completar Fase 4
    fecha_fin_estimada: +7.5 meses

Recomendación:
  - Desarrollar Portal DESPUÉS de Fase 4
  - O en PARALELO si tienen ayuda adicional
  - Priorizar MVP Reducido (5 meses)
  - Agregar features adicionales post-lanzamiento
```

---

**Documento creado:** 22 de Octubre 2025  
**Próxima revisión:** Post-MVP Planning  
**Versión:** 1.0  
**Status:** ✅ Listo para Desarrollo

---

# 🎉 FIN DE FASE 5 - STUDENT PORTAL

**Siguiente paso:** Diseñar Fases 6 y 7

¿Quieres que ahora hagamos las preguntas para la **Fase 6: Admin Dashboard & Configuration** o prefieres revisar algo de esta Fase 5 primero?
<!-- Actualización para alinear con feedback operativo: siempre descontar y luego compensar en faltas/late cancellations -->

### 5.1.3 Modelo operativo: siempre descontar y luego compensar

Objetivo: simplificar la operatoria y evitar “créditos en evaluación”. En toda falta del alumno o cancelación tardía, el sistema SIEMPRE descuenta 1.0 crédito de inmediato. Luego:
- Aplica automáticamente la compensación que corresponda por política (p. ej., 12–24h devuelve 0.5).
- Si el estudiante presenta justificativo válido dentro de la ventana, el staff aprueba y el sistema acredita el compensatorio adicional (0.5 o 1.0 según corresponda).

Alcance:
- Aplica a no‑shows y cancelaciones tardías (<24h).
- Cancelaciones con ≥24h: no hay “falta”; se gestiona como devolución total directa (no se descuenta primero).

Flujos de ledger (resumen):
- Cancelación 12–24h, sin justificativo:
  1) -1.0 credit_used
  2) +0.5 partial_refund (auto)
  Resultado neto: -0.5
- Cancelación 12–24h, con justificativo aprobado:
  1) -1.0 credit_used
  2) +0.5 partial_refund (auto)
  3) +0.5 justified_absence_approved (staff)
  Resultado neto: 0.0 (devolución total)
- <12h o no‑show, sin justificativo:
  1) -1.0 credit_used
  Resultado neto: -1.0
- <12h o no‑show, con justificativo aprobado:
  1) -1.0 credit_used
  2) +1.0 justified_absence_approved (staff)
  Resultado neto: 0.0

Ventana y aprobadores para justificativos:
- Ventana de presentación: hasta 24h posteriores a la clase.
- Aprobadores: Owner o Secretary.

Efectos en pagos a instructor:
- Con justificativo aprobado: instructor NO cobra esa clase (si se había provisionado, se revierte).
- Sin justificativo: se mantienen reglas de pago por cancelación tardía/no‑show.

Ledger: nuevos tipos de transacción (visibles en “Mis Créditos → Historial”):
- reserved (cuando se toma el slot)
- released (si la reserva se libera sin consumir)
- credit_used (-1.0)
- partial_refund (+0.5)
- justified_absence_requested
- justified_absence_approved (+0.5 o +1.0)
- justified_absence_rejected
- no_show

Nota de UI en portal:
- En detalle de clase cancelada 12–24h, se muestra “Se aplicó penalización de 0.5 créditos” y, si luego el staff aprueba justificativo, aparece una notificación y un asiento “Compensación de 0.5 créditos aprobada”.

---

### 5.3.1 Lógica de ledger para cancelaciones y no‑shows

Aclaración: La función de cálculo de reembolso comunicada al estudiante refleja el saldo visible, pero la lógica contable aplica “debit first, credit after” para faltas/late cancellations.

Ejemplo de aplicación de ledger (pseudo‑TypeScript) — ver [applyCancellationLedger()](DECISIONES_FASE_5_StudentPortal.md:0):
```typescript
// Aplica los movimientos de ledger según ventana y justificación.
// Siempre descuenta 1.0 en faltas/late; luego compensa según política.
function applyCancellationLedger(input: {
  window: '>=24h' | '12-24h' | '<12h' | 'no_show';
  justificationApproved: boolean;
}) {
  const entries: { type: string; amount: number }[] = [];

  if (input.window === '>=24h') {
    // Cancelación en término: devolución directa (sin “falta”).
    // Si el crédito estaba reservado, se libera; si ya estaba usado por error, compensar 1.0.
    entries.push({ type: 'released', amount: 1.0 }); // o refund equivalente
    return entries;
  }

  // Late cancellation / no-show: siempre descontar 1.0
  entries.push({ type: 'credit_used', amount: -1.0 });

  if (input.window === '12-24h') {
    // Compensación automática por política
    entries.push({ type: 'partial_refund', amount: +0.5 });
    if (input.justificationApproved) {
      entries.push({ type: 'justified_absence_approved', amount: +0.5 }); // completa a +1.0
    }
  } else {
    // '<12h' o 'no_show'
    if (input.justificationApproved) {
      entries.push({ type: 'justified_absence_approved', amount: +1.0 });
    }
  }

  return entries;
}
```

Mensajería en portal:
- Si la clase se cancela <12h: el botón “Cancelar” está deshabilitado. En caso de ausencia, se descuenta 1.0 y se guía al estudiante a “Enviar justificativo” (con “¿Cómo presentar evidencia?”).
- Si se aprueba el justificativo, el estudiante ve “Compensación acreditada: +0.5/+1.0” en su timeline de créditos y el saldo actualizado.