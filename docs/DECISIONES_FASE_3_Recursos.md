# 📋 FASE 3: Gestión de Recursos - Decisiones Finales

**Proyecto:** Driving School Management SaaS  
**Cliente:** DriverCloud  
**Fecha:** 22 de Octubre 2025  
**Versión:** 1.0 - MVP Scope

---

## 📑 Índice

1. [CRUD de Students](#1-crud-de-students)
2. [Sistema de Créditos](#2-sistema-de-créditos)
3. [Packages (Paquetes de Clases)](#3-packages-paquetes-de-clases)
4. [Student Status y Lifecycle](#4-student-status-y-lifecycle)
5. [CRUD de Instructors](#5-crud-de-instructors)
6. [Instructor Payments](#6-instructor-payments)
7. [Instructor Availability](#7-instructor-availability)
8. [CRUD de Vehicles](#8-crud-de-vehicles)
9. [Vehicle Maintenance](#9-vehicle-maintenance)
10. [Vehicle Utilization](#10-vehicle-utilization)
11. [Compartir Recursos Entre Schools](#11-compartir-recursos-entre-schools)
12. [UI/UX de Gestión](#12-uiux-de-gestión)
13. [Data Retention](#13-data-retention)

---

## 1. CRUD de Students

### 1.1 Información Básica Obligatoria

**Decisión:** Los siguientes campos son OBLIGATORIOS para crear un estudiante:

```yaml
Campos_Obligatorios:
  - nombre_completo
  - email
  - telefono
  - documento (tipo + número)
  - direccion
  - fecha_nacimiento
  - numero_contacto_familiar
  - campo_comentarios_aclaraciones
```

**Justificación:** Información mínima necesaria para contacto, identificación legal y emergencias.

---

### 1.2 Información Opcional

**Decisión:** Todos los datos requeridos ya están cubiertos en información obligatoria. No hay campos opcionales en MVP.

**Nota Técnica:** Post-MVP puede incluir: foto de perfil, preferencias de horario, historial médico relevante.

---

### 1.3 Información Legal

**Decisión:** Captura de información legal (tipo de documento, número, foto del documento, firma digital) será implementada **POST-MVP**.

**Justificación:**

- Requiere sistema de upload de archivos
- Validación de documentos
- Storage de imágenes
- No crítico para operación inicial

**Timeline:** Sprint 6-8 (post-MVP)

---

### 1.4 Permisos de Edición

**Decisión:** Solo el STAFF puede modificar perfiles de estudiantes.

**Roles con permiso de edición:**

- ✅ Owner
- ✅ Secretary
- ❌ Instructor (solo lectura)
- ❌ Student (sin acceso al sistema en MVP)

**Justificación:** Control centralizado de datos, evita inconsistencias.

---

### 1.5 Notas Internas

**Decisión:** Campo de "notas internas" visible solo para staff.

**Especificaciones:**

```yaml
Campo: internal_notes
Tipo: Text (unlimited)
Visible_para:
  - Owner: ✅ Read/Write
  - Secretary: ✅ Read/Write
  - Instructor: ❌ No visible
  - Student: ❌ No visible
```

**Casos de uso:**

- "Estudiante nervioso - asignar instructor con paciencia"
- "Prestar atención especial en rotondas"
- "Tiene miedo a autopistas"

---

## 2. Sistema de Créditos

### 2.1 Equivalencia Crédito-Clase

**Decisión:** 1 crédito = 1 clase (cualquier tipo)

**Regla simple:**

```
1 crédito = 1 clase práctica
1 crédito = 1 clase teórica
1 crédito = 1 clase con cualquier instructor
```

**Justificación:** Simplicidad operativa. Post-MVP puede agregarse clases premium que consuman más créditos.

---

### 2.2 Vencimiento de Créditos

**Decisión:** Los créditos tienen fecha de vencimiento **configurable por escuela**.

**Configuración:**

```yaml
Paquete:
  cantidad_clases: 10
  precio: $50000
  validez_dias: 90 # Configurable por Owner

Cálculo:
  fecha_compra: 2025-01-15
  fecha_vencimiento: 2025-04-15 # (fecha_compra + validez_dias)
```

**Comportamiento:**

- ✅ Cada paquete tiene su propia fecha de vencimiento
- ✅ Al comprar múltiples paquetes, cada uno tiene su contador independiente
- ⚠️ **EXCEPCIÓN:** Créditos "congelados" (ver 2.4) pueden usarse después del vencimiento

---

### 2.3 Tipos de Paquetes

**Decisión:** Sí, habrá diferentes tipos de paquetes.

**Ejemplos:**

```yaml
Paquete_Básico:
  clases: 10
  precio: $50000
  validez: 90 días

Paquete_Premium:
  clases: 20
  precio: $90000
  validez: 120 días

Paquete_Intensivo:
  clases: 30
  precio: $120000
  validez: 60 días
```

**Nota:** Cada school puede tener sus propios paquetes con precios diferentes.

---

### 2.4 Política de Cancelación y Créditos Congelados

**Decisión CRÍTICA:** Sistema de cancelación con ventana configurable.

**Flujo completo:**

```yaml
Configuración_Escuela:
  ventana_cancelacion_horas: 24 # Configurable (12h, 24h, 48h, etc.)

Escenario_1_Cancela_a_tiempo:
  alumno: "Cancela con 30 horas de anticipación"
  ventana: "24 horas"
  dentro_de_ventana: true
  acción: "SE DEBE reprogramar con secretaria"
  resultado: "Crédito NO se consume"

  sub_caso_1a:
    fechas_disponibles: "Le gustan las opciones"
    resultado: "Clase reprogramada, crédito intacto"

  sub_caso_1b:
    fechas_disponibles: "No le gustan las opciones"
    acción: "Guarda crédito para uso futuro"
    resultado: "Crédito CONGELADO, puede usar después"
    nota: "⚠️ Crédito congelado puede usarse DESPUÉS de vencimiento del paquete"

  sub_caso_1c:
    fechas_disponibles: "No hay slots disponibles"
    acción: "Guarda crédito para uso futuro"
    resultado: "Crédito CONGELADO, puede usar después"

Escenario_2_No_show_sin_aviso:
  alumno: "No aparece a clase y no canceló"
  resultado: "Crédito CONSUMIDO y PERDIDO"
  pago_instructor: "Instructor cobra igual"

Escenario_3_Cancela_tarde:
  alumno: "Cancela con 10 horas de anticipación"
  ventana: "24 horas"
  fuera_de_ventana: true
  resultado: "Crédito CONSUMIDO y PERDIDO"
  pago_instructor: "Instructor cobra igual"
```

### 2.4.1 Política Escalonada MVP y Ausencia Justificada (Actualización)

- Objetivo: Unificar reglas de devolución y pago a instructores, y alinear con portal del estudiante.

Política de devolución (estudiante):

```yaml
Cancellation_Refunds_MVP:
  # Ventanas con y sin justificativo
  ">=24h":
    sin_justificativo: 1.0 # Devolución total
    con_justificativo: 1.0 # Devolución total
  "12-24h":
    sin_justificativo: 0.5 # Devolución parcial (medio crédito)
    con_justificativo: 1.0 # Devolución total (justificado)
  "<12h":
    sin_justificativo: 0.0 # Sin devolución
    con_justificativo: 1.0 # Devolución total (justificado)

Portal_Blocking:
  # En portal del estudiante (Fase 5):
  # si faltan <12h, el botón "Cancelar" se muestra DESHABILITADO.
  # Staff (Owner/Secretary) puede cancelar manualmente en cualquier momento.
  bloquear_menos_de_12h: true
```

Ausencia justificada:

```yaml
Justified_Absence:
  motivos_aceptados:
    - "Salud (certificado/constancia médica fechada)"
    - "Emergencia familiar (documentación fehaciente)"
    - "Fuerza mayor (parte policial, evidencia verificable)"
  ventana_presentación: "hasta 24h POST clase"
  aprueba:
    - Owner
    - Secretary
  efectos:
    estudiante_credito: "Devolución 1.0 (reverso de penalización si 12–24h o <12h)"
    instructor_pago: "NO cobra si justificada aprobada"
  ledger_eventos:
    - justified_absence_requested
    - justified_absence_approved
    - justified_absence_rejected
```

Impacto en pago a instructor (alinea 6.6):

```yaml
Instructor_Payment_Rules_MVP:
  completed: "Cobra"
  student_no_show:
    sin_justificada: "Cobra"
    con_justificada_aprobada: "NO cobra"
  cancelled_by_student:
    ">=24h": "NO cobra"
    "12-24h":
      sin_justificada: "Cobra (mismo criterio de 'late')"
      con_justificada_aprobada: "NO cobra"
    "<12h":
      sin_justificada: "Cobra"
      con_justificada_aprobada: "NO cobra"
  cancelled_by_instructor: "NO cobra (crédito devuelto al estudiante)"
```

Notas de implementación técnica:

```yaml
Notas_Técnicas:
  # Para soportar devolución parcial (0.5) se requiere modelo fraccional:
  student_credits:
    fractional_amount: DECIMAL(3,2) DEFAULT 1.00 # 1.00 / 0.50 / 0.00
  ledger_tipos_nuevos:
    - reserved
    - released
    - partial_refund # +0.50
    - no_show
    - justified_absence_approved
  consumo:
    orden: "FIFO"
    prioridad: "créditos_congelados primero"
```

Relación con portal (Fase 5):

- Bloqueo de cancelación en portal cuando faltan <12h (botón deshabilitado con explicación).
- En 12–24h el portal permite cancelar y aplica la devolución según tabla.
- Owner/Secretary pueden cancelar en cualquier momento (excepción manual + registrar justificativo).

Relación con Admin Dashboard (Fase 6):

- Settings deben permitir configurar:
  - Habilitar/deshabilitar “auto‑bloqueo” de instructores con aprobación (default: OFF).
  - Gestión del workflow de ausencias justificadas (ver/aprobar/rechazar + evidencia).
- Reportes y recibos deben reflejar los ajustes por justificada (estudiante e instructor).
  **Nota Técnica - Créditos Congelados:**

```sql
-- Base de datos necesita campo adicional
student_package_credit:
  id: uuid
  student_package_id: uuid
  status: enum ['available', 'frozen', 'used', 'expired']
  frozen_date: timestamp (nullable)
  used_date: timestamp (nullable)
```

---

### 2.5 Descuentos Personalizados

**Decisión:** Sí, puede haber descuentos personalizados por estudiante.

**Casos de uso:**

- Descuento por referido
- Descuento por cantidad (compra 3 paquetes, descuento en el 3ro)
- Descuento por lealtad (cliente antiguo)
- Descuento para familiares de staff

**Implementación:**

```yaml
Student_Discount:
  student_id: uuid
  discount_type: enum ['percentage', 'fixed_amount']
  discount_value: decimal
  reason: text
  valid_until: date (nullable)
  created_by: staff_user_id
```

---

### 2.6 Créditos Promocionales

**Decisión:** Sí, sistema de créditos promocionales.

**Tipos:**

1. **Créditos por referido:** Alumno que refiere a alguien recibe X clases gratis
2. **Clase de prueba gratis:** Nuevo estudiante recibe 1 clase gratis antes de comprar paquete

**Implementación:**

```yaml
Promotional_Credit:
  type: enum ['referral', 'trial', 'campaign', 'compensation']
  quantity: integer
  reason: text
  expires_at: date (nullable)
  granted_by: staff_user_id

  # Los créditos promocionales:
  - No cuentan en el límite de paquetes comprados
  - Pueden tener o no fecha de vencimiento
  - Se usan PRIMERO antes que créditos pagos (FIFO)
```

---

### 2.7 Múltiples Paquetes Activos

**Decisión:** Sí, un estudiante puede tener múltiples paquetes activos simultáneamente.

**Ejemplo:**

```yaml
Estudiante_Juan:
  paquetes_activos:
    - paquete_1:
        total_clases: 10
        clases_usadas: 8
        clases_restantes: 2
        fecha_compra: 2025-01-15
        fecha_vencimiento: 2025-04-15

    - paquete_2:
        total_clases: 20
        clases_usadas: 0
        clases_restantes: 20
        fecha_compra: 2025-03-01
        fecha_vencimiento: 2025-05-30

  total_creditos_disponibles: 22
```

**Regla de consumo:** FIFO (First In, First Out) - se consumen primero los créditos del paquete más antiguo.

---

### 2.8 Historial de Transacciones

**Decisión:** SÍ, historial COMPLETO de transacciones de créditos.

**Eventos a registrar:**

```yaml
Credit_Transaction_Types:
  - package_purchase: "Compró paquete de 10 clases"
  - credit_used: "Usó 1 crédito en clase del 2025-03-15"
  - credit_refund: "Devolución de 1 crédito (clase cancelada a tiempo)"
  - credit_frozen: "Crédito congelado (sin slots disponibles)"
  - credit_unfrozen: "Crédito descongelado y usado"
  - credit_expired: "Crédito venció sin usar"
  - promotional_grant: "Crédito promocional otorgado (referido)"

Log_Entry_Structure:
  id: uuid
  student_id: uuid
  transaction_type: enum
  credits_change: integer # +10, -1, etc.
  balance_after: integer
  related_class_id: uuid (nullable)
  related_package_id: uuid (nullable)
  notes: text
  created_at: timestamp
  created_by: staff_user_id (nullable)
```

**UI Requirement:** Vista de timeline de transacciones para cada estudiante.

---

## 3. Packages (Paquetes de Clases)

### 3.1 Quién Crea los Paquetes

**Decisión:** Owner o Secretary pueden crear/editar paquetes.

**Permisos:**

```yaml
Create_Package:
  - Owner: ✅
  - Secretary: ✅
  - Instructor: ❌

Edit_Package:
  - Owner: ✅
  - Secretary: ✅ (solo si Owner lo permite)
  - Instructor: ❌
```

---

### 3.2 Precios por School

**Decisión:** Cada School tiene sus propios precios de paquetes.

**Estructura:**

```yaml
Package_Template:
  id: uuid
  name: "Paquete 10 Clases"
  class_quantity: 10
  validity_days: 90

PackagePrice_Per_School:
  package_template_id: uuid
  school_id: uuid
  price: decimal
  active: boolean

# Ejemplo:
School_A:
  Paquete_10_Clases: $50000
School_B:
  Paquete_10_Clases: $55000 # Diferente precio
```

**Justificación:** Flexibilidad para diferentes mercados/ubicaciones.

---

### 3.3 Clase de Prueba

**Decisión:** Las clases de prueba son un CRÉDITO PROMOCIONAL, no parte del paquete.

**Flujo:**

```yaml
Proceso:
  1. Prospecto contacta escuela
  2. Secretary otorga 1 crédito promocional (tipo: trial)
  3. Prospecto toma clase de prueba
  4. Si le gusta: compra paquete de 10 (sin clase adicional)
  5. Si no le gusta: crédito se marca como usado

Nota: "Paquete de 10 clases" = 10 clases, NO 11
```

---

### 3.4 Paquetes con Validez Temporal

**Decisión:** Sí, todos los paquetes tienen validez temporal (ya cubierto en 2.2).

---

## 4. Student Status y Lifecycle

### 4.1 Estados Posibles

**Decisión:** Los siguientes estados están disponibles:

```yaml
Student_Status:
  - prospect: "Prospecto (tomó clase de prueba, no compró aún)"
  - active: "Activo (tiene créditos disponibles, puede agendar)"
  - inactive: "Inactivo (sin créditos, no se borró del sistema)"
  - paused: "En pausa (tiene créditos pero no puede agendar)"
  - graduated: "Egresado (completó curso y aprobó examen)"
  - blocked: "Bloqueado (por comportamiento o deuda, no puede agendar)"
```

**Transiciones:**

```
prospect → active (compra primer paquete)
active → inactive (se acabaron créditos)
active → paused (decisión manual de staff)
active → graduated (marca de finalización)
inactive → active (compra nuevo paquete)
paused → active (staff lo reactiva)
cualquier_estado → blocked (decisión de Owner)
```

---

### 4.2 Estudiante Graduado

**Decisión:** Marcado de graduación con campos específicos.

**Campos necesarios:**

```yaml
Student:
  status: "graduated"
  graduation_date: date
  driving_exam_date: date
  exam_passed: boolean
  exam_notes: text (nullable)
  instructor_at_graduation: uuid (nullable)
```

**UI:** Botón "Marcar como Graduado" que abre modal con estos campos.

---

### 4.3 Re-activación de Estudiantes

**Decisión:** Sí, estudiantes inactivos pueden ser re-activados.

**Proceso:**

```yaml
Escenario: Estudiante dejó de venir hace 6 meses
Acción:
  1. Staff busca estudiante (status: inactive)
  2. Verifica si tiene créditos vencidos
  3. Si tiene créditos vencidos:
     - Opción A: Renovar vencimiento (decisión de Owner)
     - Opción B: Comprar nuevo paquete
  4. Cambiar status a 'active'
  5. Estudiante puede agendar de nuevo
```

---

### 4.4 Estudiantes en Pausa

**Decisión:** Sí, estado "paused" disponible.

**Características:**

```yaml
Paused_Student:
  puede_agendar: false
  mantiene_creditos: true
  creditos_siguen_venciendo: true # ⚠️ El tiempo corre

Casos_de_uso:
  - "Estudiante viaja por 2 meses"
  - "Estudiante tiene emergencia médica"
  - "Estudiante pidió pausar por trabajo"

Acción_staff: Botón "Pausar Estudiante" con campo de razón
```

---

## 5. CRUD de Instructors

### 5.1 Información Obligatoria

**Decisión:** Campos obligatorios para crear instructor:

```yaml
Instructor_Required_Fields:
  - nombre_completo
  - email
  - telefono
  - licencia_conducir_numero
  - licencia_conducir_tipo # A, B, C, D, profesional, etc.
  - licencia_conducir_vencimiento
  - documento_tipo
  - documento_numero
  - telefono_contacto_familiar
  - certificaciones: text # Descripción de certificaciones
```

---

### 5.2 Campos Específicos Legales

**Decisión:** No se requieren campos legales adicionales en MVP más allá de los ya mencionados en 5.1.

**Post-MVP:** Agregar upload de documentos (foto de licencia, certificados, etc.)

---

### 5.3 Especialidades de Instructors

**Decisión:** Sí, instructores tienen especialidades por tipo de vehículo.

**Implementación:**

```yaml
Instructor_Specialties:
  instructor_id: uuid
  vehicle_types: array
    - 'car_manual'      # Auto manual
    - 'car_automatic'   # Auto automático
    - 'motorcycle'      # Moto
    - 'truck'           # Camión (post-MVP)

Ejemplo:
  Instructor_Juan:
    specialties: ['car_manual', 'car_automatic']
    puede_enseñar: "Autos solamente"

  Instructor_María:
    specialties: ['motorcycle']
    puede_enseñar: "Motos solamente"
```

**Validación:** Al agendar clase, solo mostrar instructores con especialidad en el tipo de vehículo seleccionado.

---

### 5.4 Tracking de Vencimiento de Licencia

**Decisión:** Sí, alertas de vencimiento de licencia del instructor.

**Sistema de Alertas:**

```yaml
Alert_System:
  check_frequency: daily (cronjob)

  alert_levels:
    - critical: 7 días antes de vencimiento
    - warning: 30 días antes de vencimiento
    - info: 60 días antes de vencimiento

  notification_to:
    - Owner: ✅ (todas las alertas)
    - Secretary: ✅ (solo warning y critical)
    - Instructor: ✅ (solo sus propias alertas)

  acción_automática:
    if vencimiento_pasado:
      instructor.status = 'inactive'
      instructor.can_teach = false
      cancelar_clases_futuras_agendadas: true
```

---

## 6. Instructor Payments

### 6.1 Modelo de Compensación

**Decisión CRÍTICA:** Sistema HÍBRIDO en MVP - soporta ambos modelos.

**Modelos soportados:**

```yaml
Payment_Model_A_Fixed_Salary:
  type: 'fixed_salary'
  monthly_amount: decimal
  tracking_classes: true  # Sí, para performance

Ejemplo:
  Instructor_Pedro:
    payment_type: 'fixed_salary'
    monthly_salary: $150000
    clases_dictadas_mes: 45  # Se trackea pero no afecta pago
    performance_metric: "clases/mes"

Payment_Model_B_Per_Class:
  type: 'per_class'
  rate_per_class: decimal

Ejemplo:
  Instructor_Ana:
    payment_type: 'per_class'
    rate: $3000  # Por clase
    clases_dictadas_mes: 30
    pago_total_mes: $90000  # Auto-calculado
```

**Nota Técnica:** Mismo instructor NO puede tener ambos modelos simultáneamente (es uno u otro).

---

### 6.2 Variación de Pago por Clase

**Decisión:** En modelo "per_class", el dueño puede configurar diferentes tarifas.

**Implementación:**

```yaml
Opción_1_Tarifa_Única:
  instructor.default_rate_per_class: $3000
  todas_las_clases: $3000

Opción_2_Tarifa_Variable:
  instructor.default_rate_per_class: $3000

  class_type_rates:
    - practical_class: $3000
    - theoretical_class: $2000
    - highway_practice: $3500
    - exam_simulation: $4000

  # Al crear clase, se selecciona tipo y se aplica tarifa correspondiente
```

**UI:** Dropdown "Tipo de Clase" al agendar, que ajusta tarifa automáticamente.

---

### 6.3 Cálculo Automático de Pagos

**Decisión:** Sí, sistema calcula automáticamente cuánto se debe a cada instructor.

**Períodos configurables:**

```yaml
Payment_Periods:
  - daily: "Pago diario"
  - weekly: "Pago semanal"
  - biweekly: "Pago quincenal"
  - monthly: "Pago mensual"

Filter_Options:
  - Rango de fechas custom
  - Mes específico
  - Última semana
  - Últimos 30 días
```

**Cálculo:**

```yaml
For_Per_Class_Instructor:
  1. Obtener todas las clases con status 'completed' en período
  2. Sumar: SUM(class.instructor_payment_amount)
  3. Restar: Pagos ya realizados en ese período
  4. Total_a_pagar = Suma - Pagos_realizados

For_Fixed_Salary_Instructor:
  1. Verificar si ya se pagó en el período
  2. Total_a_pagar = monthly_salary (si no se pagó)
  3. Total_a_pagar = $0 (si ya se pagó)
```

---

### 6.4 Recibos de Pago

**Decisión:** Sí, generación de recibos exportables en PDF.

**Contenido del recibo:**

```yaml
Payment_Receipt:
  header:
    - school_name
    - school_logo
    - receipt_number
    - payment_date
    - payment_period

  instructor_info:
    - nombre_completo
    - documento
    - payment_type

  class_log: # Solo para per_class instructors
    - date | student_name | class_type | amount
    - Ejemplo: "15/03/2025 | Juan Pérez | Práctica | $3000"

  summary:
    - total_classes: integer
    - total_amount: decimal
    - payment_method: enum
    - paid_by: staff_name

  footer:
    - firma_instructor
    - firma_owner
```

**Exportación:** Botón "Descargar PDF" y "Enviar por Email".

---

### 6.5 Visibilidad de Pagos

**Decisión:** Instructores pueden ver sus propios pagos, NO los de otros instructores.

**Permisos:**

```yaml
Instructor_View:
  puede_ver:
    - Sus propios pagos históricos
    - Sus clases dictadas y pendientes de pago
    - Su balance actual

  NO_puede_ver:
    - Pagos de otros instructores
    - Tarifas de otros instructores
    - Total de pagos de la escuela

Owner/Secretary_View:
  pueden_ver:
    - Todos los instructores
    - Todos los pagos
    - Reportes comparativos
```

---

### 6.6 Regla de Pago por No-Show

**Decisión:** Instructor COBRA si alumno no cancela a tiempo.

**Lógica:**

```yaml
Class_Payment_Logic:
  Caso_1_Clase_Completada:
    class.status: "completed"
    instructor.payment: ✅ Cobra

  Caso_2_Alumno_No_Show:
    class.status: "student_no_show"
    alumno_perdio_credito: true
    instructor.payment: ✅ Cobra
    justificación: "Instructor llegó y esperó, su tiempo vale"

  Caso_3_Alumno_Canceló_a_Tiempo:
    class.status: "cancelled_by_student"
    dentro_de_ventana: true
    alumno_perdio_credito: false
    instructor.payment: ❌ NO cobra

  Caso_4_Instructor_Canceló:
    class.status: "cancelled_by_instructor"
    alumno_perdio_credito: false
    instructor.payment: ❌ NO cobra

  Caso_5_Clase_Pendiente:
    class.status: "scheduled"
    instructor.payment: ⏳ Pendiente hasta que se complete
```

---

## 7. Instructor Availability

### 7.1 Gestión de Disponibilidad

**Decisión:** Instructores NO pueden auto-bloquearse. Solo Owner y Secretary pueden bloquear/desbloquear.

**Proceso:**

```yaml
Escenario: Instructor necesita día libre

Proceso:
  1. Instructor contacta a Owner/Secretary (fuera del sistema)
  2. Owner/Secretary evalúa request
  3. Si aprueba: Marca días como bloqueados en calendario
  4. Sistema impide agendar clases en esos días
  5. Instructor ve su calendario con días bloqueados

UI:
  - Vista "Gestionar Disponibilidad de Instructores"
  - Calendario con drag & drop para bloquear rangos
  - Razón de bloqueo (opcional)
```

**Referencia:** Ver Fase 2 para detalles de scheduling.

---

## 8. CRUD de Vehicles

### 8.1 Información Obligatoria

**Decisión:** Campos obligatorios para crear vehículo:

```yaml
Vehicle_Required_Fields:
  # Identificación
  - marca: string
  - modelo: string
  - año: integer
  - patente: string (unique)
  - color: string

  # Técnico
  - tipo_transmision: enum ['manual', 'automatic']
  - tipo_combustible: enum ['gasoline', 'diesel', 'gnc', 'electric', 'hybrid']
  - kilometraje_actual: integer

  # Legal (ver 8.2)
```

---

### 8.2 Documentación Legal del Vehículo

**Decisión:** Tracking COMPLETO de documentación legal.

**Campos requeridos:**

```yaml
Vehicle_Legal_Documentation:
  seguro:
    - compania_seguro: string
    - numero_poliza: string
    - fecha_inicio: date
    - fecha_vencimiento: date
    - tipo_cobertura: enum ['terceros', 'terceros_completo', 'todo_riesgo']

  vtv:
    - fecha_ultima_vtv: date
    - fecha_vencimiento_vtv: date
    - resultado: enum ['aprobado', 'condicional', 'rechazado']

  registro:
    - numero_registro: string
    - titular: string
    - fecha_emision: date

  gnc: # Solo si vehicle.tipo_combustible = 'gnc'
    - numero_oblea: string
    - fecha_vencimiento_oblea: date
    - fecha_proxima_revision: date
```

**Sistema de Alertas (similar a instructors):**

```yaml
Alert_System:
  check_frequency: daily (cronjob)

  alert_for:
    - seguro_vencimiento
    - vtv_vencimiento
    - gnc_oblea_vencimiento

  alert_levels:
    - critical: 7 días antes
    - warning: 30 días antes
    - info: 60 días antes

  acción_automática:
    if documentacion_vencida:
      vehicle.status = 'out_of_service'
      vehicle.can_be_used = false
      cancelar_clases_futuras_agendadas: true
```

---

### 8.3 Características Especiales

**Decisión:** Sí, vehículos pueden tener características especiales.

**Implementación:**

```yaml
Vehicle_Features:
  vehicle_id: uuid
  features: array
    - 'rear_camera'            # Cámara reversa
    - 'parking_sensors'        # Sensores estacionamiento
    - 'abs'                    # Frenos ABS
    - 'airbags'                # Airbags
    - 'cruise_control'         # Control crucero
    - 'automatic_lights'       # Luces automáticas
    - 'power_steering'         # Dirección asistida
    - 'air_conditioning'       # Aire acondicionado

UI: Checklist al crear/editar vehículo
```

---

### 8.4 Fotos de Vehículos

**Decisión:** Sí, upload de fotos de vehículos.

**Especificaciones:**

```yaml
Vehicle_Photos:
  max_photos: 5
  formats: ["jpg", "jpeg", "png", "webp"]
  max_size: 5MB por foto
  storage: Cloud storage (Cloudinary / S3)

  tipos_sugeridos:
    - Foto frontal
    - Foto lateral
    - Foto interior (tablero)
    - Foto patente
    - Foto documentación
```

---

## 9. Vehicle Maintenance

### 9.1 Scheduling de Mantenimiento

**Decisión:** Sí, sistema de scheduling preventivo con DOBLE criterio.

**Criterios de mantenimiento:**

```yaml
Maintenance_Triggers:

  Trigger_1_Kilometraje:
    cada: 10000  # Configurable
    unidad: "km"
    ejemplo: "Cada 10,000 km hacer service"

  Trigger_2_Tiempo:
    cada: 6  # Configurable
    unidad: "meses"
    ejemplo: "Cada 6 meses hacer service"

  Lógica: "Lo que ocurra PRIMERO"

Ejemplo:
  Vehicle_123:
    ultimo_service: 2025-01-15 (km: 50000)
    proximo_service_km: 60000
    proximo_service_fecha: 2025-07-15

    if (km_actual >= 60000) OR (fecha_actual >= 2025-07-15):
      trigger_alert: true
```

---

### 9.2 Información de Mantenimiento

**Decisión:** Registro DETALLADO de cada mantenimiento.

**Estructura:**

```yaml
Maintenance_Record:
  id: uuid
  vehicle_id: uuid

  # Cuándo
  scheduled_date: date
  completed_date: date

  # Qué
  maintenance_type: enum ['service', 'repair', 'inspection', 'emergency']
  description: text

  # Quién
  performed_by: string  # Mecánico/taller
  mechanic_contact: string

  # Detalles de gastos
  total_cost: decimal
  line_items: array
    - item: "Correa de distribución"
      cost: 5000
    - item: "Cambio de aceite"
      cost: 2000
    - item: "Filtro de aire"
      cost: 1500

  # Kilometraje
  kilometraje_at_maintenance: integer

  # Próximo
  next_maintenance_km: integer
  next_maintenance_date: date

  # Documentos
  invoice_photo: url (nullable)
  notes: text
```

---

### 9.3 Bloqueo Durante Mantenimiento

**Decisión:** Sí, vehículo se bloquea automáticamente durante mantenimiento programado.

**Flujo:**

```yaml
Programación_Mantenimiento:
  1. Secretary/Owner crea maintenance record
  2. Selecciona fecha inicio y fecha fin (estimada)
  3. Al guardar:
     - vehicle.status = 'in_maintenance'
     - vehicle.available_for_booking = false
     - calendario bloquea ese vehículo en rango de fechas

Durante_Mantenimiento:
  - No se pueden agendar clases nuevas con ese vehículo
  - Clases ya agendadas quedan "en alerta" (ver 9.4)

Después_de_Mantenimiento:
  1. Staff marca maintenance como "completed"
  2. Ingresa fecha real de finalización
  3. Sistema pregunta: "¿Desbloquear vehículo ahora?"
  4. Si SÍ:
     - vehicle.status = 'active'
     - vehicle.available_for_booking = true
```

---

### 9.4 Mantenimiento de Emergencia

**Decisión:** Cuando se programa mantenimiento de emergencia y hay clases agendadas, se deben re-agendar MANUALMENTE.

**Proceso:**

```yaml
Escenario: Vehículo se rompe y tiene clases hoy/mañana

Proceso:
  1. Staff marca vehicle como 'emergency_maintenance'
  2. Sistema detecta clases afectadas en próximos X días
  3. Sistema genera LISTA de clases afectadas:
     - Fecha, Hora, Alumno, Instructor
  4. Staff contacta a cada alumno para re-agendar
  5. Opciones:
     - Cambiar a otro vehículo (si hay disponible)
     - Cambiar fecha
     - Cancelar (crédito se guarda)

UI:
  - Alerta "Este vehículo tiene 5 clases agendadas en próximos 3 días"
  - Botón "Ver clases afectadas"
  - Acción manual de re-agendado por cada clase
```

---

### 9.5 Alertas de Mantenimiento

**Decisión:** Sí, alertas automáticas en MVP.

**Sistema de Alertas:**

```yaml
Alert_System:
  check_frequency: daily (cronjob 9:00 AM)

  checks:
    - Kilometraje próximo a service
    - Fecha próxima a service
    - Vencimiento de seguro
    - Vencimiento de VTV
    - Vencimiento de oblea GNC

  alert_levels:

    Kilometraje:
      - info: 1000 km antes (ej: vehicle tiene 59000, service a los 60000)
      - warning: 500 km antes
      - critical: 100 km antes

    Fecha:
      - info: 30 días antes
      - warning: 15 días antes
      - critical: 7 días antes

  notification_to:
    - Owner: ✅ (todas)
    - Secretary: ✅ (warning y critical)

  notification_method:
    - In-app notification
    - Email (configurable)
    - WhatsApp (post-MVP)
```

---

## 10. Vehicle Utilization

### 10.1 Asignación de Vehículos

**Decisión:** Cualquier instructor puede usar cualquier vehículo, pero la asignación es MANUAL por staff.

**Proceso:**

```yaml
Al_Agendar_Clase:
  1. Secretary/Owner selecciona Student
  2. Selecciona tipo de clase (práctica/teórica)
  3. Sistema muestra:
     - Instructores disponibles (filtrado por especialidad)
     - Vehículos disponibles (del tipo correcto)
  4. Staff asigna: Instructor + Vehículo
  5. Sistema verifica conflictos
  6. Clase agendada

No_Hay_Restricciones:
  - Instructor A puede usar Vehicle X hoy y Vehicle Y mañana
  - No hay "vehículo preferido" por instructor en MVP
```

---

### 10.2 Vehículos Premium

**Decisión:** No hay vehículos premium en MVP.

**Post-MVP:** Podría agregarse concepto de "vehículos premium" que:

- Solo ciertos instructores pueden usar
- Cuestan más créditos
- Requieren experiencia mínima del estudiante

---

### 10.3 Tracking de Kilometraje

**Decisión:** Sí, tracking de kilometraje por clase.

**Implementación:**

```yaml
Class_Session:
  vehicle_id: uuid

  # Antes de clase
  kilometraje_inicio: integer (staff ingresa antes de salir)

  # Después de clase
  kilometraje_fin: integer (staff ingresa al volver)

  # Auto-calculado
  kilometros_recorridos: integer # = fin - inicio

Vehicle:
  kilometraje_actual: integer # Se actualiza al completar clase

Beneficios:
  - Saber cuándo hacer service (trigger por km)
  - Calcular gastos de combustible
  - Analizar uso por instructor
  - Detectar anomalías (ej: 200 km en clase de 1 hora = error)
```

**UI:**

- Modal al completar clase: "Ingresar kilometraje final"
- Validación: kilometraje_fin debe ser > kilometraje_inicio

---

## 11. Compartir Recursos Entre Schools

### 11.1 Decisión MVP

**Decisión:** **POST-MVP**. En MVP, cada School tiene sus propios recursos.

**Restricción MVP:**

```yaml
MVP_Model:
  Student: pertenece a 1 School
  Instructor: pertenece a 1 School
  Vehicle: pertenece a 1 School

  no_cross_school_assignments: true
```

### 11.2 Arquitectura para Futuro (Post-MVP)

**Diseño preparado para evolución:**

```sql
-- MVP (actual)
CREATE TABLE instructors (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL,  -- Pertenece a 1 school
  ...
);

-- POST-MVP (futuro - SIN romper lo anterior)
ALTER TABLE instructors
  RENAME COLUMN school_id TO primary_school_id;

CREATE TABLE instructor_school_assignments (
  id UUID PRIMARY KEY,
  instructor_id UUID REFERENCES instructors(id),
  school_id UUID REFERENCES schools(id),
  can_teach_here BOOLEAN DEFAULT true,
  priority INTEGER,  -- 1 = principal, 2 = secundaria, etc.
  created_at TIMESTAMP
);

-- Lógica de negocio post-MVP:
-- 1. Instructor sigue "perteneciendo" a primary_school (para pagos)
-- 2. Puede enseñar en otras schools asignadas
-- 3. Al agendar, filtrar por: school_id = X OR assigned_to_school_id = X
```

**Impacto estimado de upgrade:**

- Código nuevo: ~15%
- Código modificado: ~20%
- Código sin tocar: ~65%

---

## 12. UI/UX de Gestión

### 12.1 Búsqueda de Recursos

**Decisión:** Búsqueda avanzada con múltiples campos.

**Búsqueda de Students:**

```yaml
Search_Fields:
  - nombre
  - apellido
  - email
  - telefono
  - documento
  - status (dropdown)

Search_Type: "Contains" (parcial)
Ejemplo: Buscar "juan" encuentra "Juan Pérez" y "María Juanita"
```

---

### 12.2 Filtros Avanzados

**Decisión:** Sí, filtros avanzados útiles.

**Filtros por Students:**

```yaml
Filters:
  - status: dropdown ['active', 'inactive', 'paused', etc.]
  - creditos > 0: checkbox
  - creditos_vencidos: checkbox
  - paquete_vence_en: "próximos X días"
  - sin_clases_en: "últimos X días" (inactivos potenciales)

Ejemplo_Query:
  "Mostrar estudiantes activos con más de 5 créditos que no tuvieron clase en 30 días"
```

**Filtros por Instructors:**

```yaml
Filters:
  - status: dropdown
  - specialty: checkbox ['car', 'motorcycle']
  - available_today: checkbox (tiene slots libres hoy)
  - payment_type: dropdown ['fixed_salary', 'per_class']
```

**Filtros por Vehicles:**

```yaml
Filters:
  - status: dropdown
  - tipo_transmision: checkbox
  - tipo_combustible: checkbox
  - available_today: checkbox
  - documentacion_al_dia: checkbox (nada vencido)
```

---

### 12.3 Escalabilidad

**Decisión:** Sistema debe soportar hasta 10,000 estudiantes por escuela (acumulativo).

**Implicaciones técnicas:**

```yaml
Performance_Requirements:
  - Paginación obligatoria (20-50 items per page)
  - Indexación de campos de búsqueda
  - Lazy loading de imágenes
  - Cache de queries frecuentes

Database_Indexes:
  students:
    - (nombre, apellido)
    - email
    - telefono
    - documento
    - status
    - school_id + status # Compound index

  instructors:
    - email
    - documento
    - school_id

  vehicles:
    - patente
    - school_id
```

---

## 13. Data Retention

### 13.1 Soft Delete

**Decisión:** Soft delete para todos los recursos.

**Implementación:**

```yaml
Soft_Delete_Pattern:
  # Agregar a todas las tablas:
  deleted_at: timestamp (nullable)
  deleted_by: uuid (nullable) # staff que borró

  # Queries:
  SELECT * FROM students WHERE deleted_at IS NULL  # Solo activos
  SELECT * FROM students  # Incluir borrados (admin)

  # UI:
  - Botón "Eliminar" → marca deleted_at = NOW()
  - NO se borran físicamente de DB
  - Opción admin: "Ver eliminados"
  - Opción admin: "Restaurar" (deleted_at = NULL)
```

---

### 13.2 Histórico de Estudiantes

**Decisión:** Sí, mantener histórico de estudiantes indefinidamente.

**Justificación:**

- Valor para análisis de negocio
- Historial de pagos y clases
- Posible re-contacto (marketing)
- Por ahora no hay presión de storage

---

### 13.3 Requerimientos Legales

**Decisión:** Investigar requerimientos de PDPA (Ley de Protección de Datos Personales de Argentina).

**Acción:**

```yaml
Tarea_Legal:
  responsable: Owner del cliente
  deadline: Antes de producción
  investigar:
    - Tiempo mínimo de retención de datos
    - Derecho al olvido (GDPR-style)
    - Consentimiento para uso de datos
    - Política de privacidad requerida

  resultado_esperado:
    - Documento "Políticas de Retención de Datos"
    - Formulario de consentimiento (si necesario)
    - Feature de "Eliminar mis datos" (si necesario)
```

**Nota:** Pendiente de investigación. Por ahora, soft delete es suficiente.

---

## 📊 Resumen Técnico - MVP Scope

### **Features Incluidos en MVP:**

✅ CRUD completo de Students/Instructors/Vehicles  
✅ Sistema de créditos con múltiples paquetes y vencimientos  
✅ Créditos congelados (con uso post-vencimiento)  
✅ Sistema híbrido de instructor payments  
✅ Vehicle maintenance con alertas (cronjob)  
✅ Tracking de kilometraje  
✅ Soft delete  
✅ Búsqueda y filtros avanzados

### **Features Post-MVP:**

❌ Recursos compartidos entre schools  
❌ Upload de documentos legales (fotos de licencias, etc.)  
❌ Reconciliación bancaria automática  
❌ Auto-gestión de cancelaciones por estudiantes  
❌ WhatsApp notifications

---

## 🚀 Dependencias con Otras Fases

**Con Fase 1 (Foundation):**

- Usa sistema de Owners/Schools/Roles
- Permisos heredados de Fase 1

**Con Fase 2 (Scheduling):**

- Créditos se consumen al completar clase
- Availability de instructors/vehicles afecta scheduling
- Cancelaciones de clase afectan créditos

**Con Fase 4 (Payments):**

- Compra de paquetes genera créditos
- Pagos validados antes de otorgar créditos
- Historial de pagos vinculado a transacciones de créditos

---

**Documento creado:** 22 de Octubre 2025  
**Próxima revisión:** Post-MVP Planning  
**Versión:** 1.0
