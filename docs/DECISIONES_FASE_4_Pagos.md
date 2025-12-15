# 💳 FASE 4: Gestión de Pagos - Decisiones Finales

**Proyecto:** Driving School Management SaaS  
**Cliente:** DriverCloud  
**Fecha:** 22 de Octubre 2025  
**Versión:** 1.0 - MVP Scope

---

## 📑 Índice

1. [Mercado Pago Integration](#1-mercado-pago-integration)
2. [Flujo de Compra de Paquetes](#2-flujo-de-compra-de-paquetes)
3. [Registro Manual de Pagos](#3-registro-manual-de-pagos)
4. [Invoicing (Facturación)](#4-invoicing-facturación)
5. [Payment History y Reconciliation](#5-payment-history-y-reconciliation)
6. [Refunds (Devoluciones)](#6-refunds-devoluciones)
7. [Pricing Configuration](#7-pricing-configuration)
8. [Payment Notifications](#8-payment-notifications)
9. [Failed Payments](#9-failed-payments)
10. [Payment Analytics](#10-payment-analytics)

---

## ⚠️ NOTA CRÍTICA: Primera Integración con Mercado Pago

**CONTEXTO IMPORTANTE:**

Tanto Rau Solutions como el cliente tienen **CERO experiencia** con Mercado Pago. Esto requiere:

```yaml
Plan_de_Aprendizaje:
  Sprint_0_RD:
    duración: 1-2 semanas
    actividades:
      - Crear cuenta Mercado Pago Business
      - Verificación de identidad (puede tomar 3-7 días)
      - Estudiar documentación de API
      - Setup de ambiente Sandbox
      - Pruebas de integración básica
      - Entender webhooks y flujo de pago
  
  Riesgo: ALTO
  Mitigación:
    - Agregar 2 sprints de buffer al timeline
    - Considerar consultoría externa si hay bloqueos
    - Empezar con método más simple (Checkout Pro)
```

**Recomendación:** Fase 4 no puede empezar hasta completar Sprint 0 de R&D exitosamente.

---

## 1. Mercado Pago Integration

### 1.1 Estado Actual

**Decisión:** Integración desde cero sin experiencia previa.

**Cuenta requerida:**
```yaml
Mercado_Pago_Business:
  tipo_cuenta: Business
  status: "Pendiente de crear"
  
  pasos_setup:
    1. Crear cuenta en mercadopago.com.ar
    2. Verificar identidad (DNI/CUIT)
    3. Vincular cuenta bancaria
    4. Obtener credenciales de producción
    5. Setup de webhooks
  
  tiempo_estimado: 7-15 días
```

---

### 1.2 Métodos de Pago Soportados

**Decisión:** Soportar TODOS los métodos posibles de Mercado Pago.

**Prioridad de implementación:**

```yaml
MVP_Phase_1 (Sprint 1-2):
  metodo: "Checkout Pro (Redirect)"
  descripcion: "Link de pago - redirige a Mercado Pago"
  complejidad: BAJA
  ventajas:
    - Más fácil de implementar
    - Mercado Pago maneja UI de pago
    - Menos código custom
  proceso:
    1. Sistema genera link de pago
    2. Staff envía link por WhatsApp/Email
    3. Cliente paga en sitio de Mercado Pago
    4. Webhook notifica a sistema
    5. Staff valida y acredita créditos

MVP_Phase_2 (Sprint 3):
  metodo: "QR Code"
  descripcion: "Código QR para pagos presenciales"
  complejidad: MEDIA
  proceso:
    1. Sistema genera QR único por paquete/estudiante
    2. Cliente escanea con app Mercado Pago
    3. Paga desde su celular
    4. Webhook notifica a sistema

Post_MVP:
  - "Checkout Bricks (Embedded)": Pago directo en plataforma
  - "POS Integration": Terminal física de punto de venta
  - "Suscripciones recurrentes": Para paquetes mensuales
```

**Arquitectura de Webhooks:**
```yaml
Webhook_Endpoint: https://app.drivingschool.com/api/webhooks/mercadopago

Events_to_Handle:
  - payment.created
  - payment.approved
  - payment.rejected
  - payment.cancelled
  - payment.refunded

Security:
  - Verificar firma de Mercado Pago
  - Validar IP origen
  - Idempotency keys para evitar duplicados
```

---

### 1.3 Métodos de Pago Offline (Adicionales)

**Decisión:** Además de Mercado Pago, soportar pagos offline.

**Métodos adicionales:**
```yaml
Offline_Payment_Methods:
  - efectivo: "Pago en efectivo en escuela"
  - transferencia_bancaria: "Transferencia a cuenta de escuela"
  - tarjeta_presencial: "Tarjeta de crédito/débito en escuela (POS físico)"
  - cheque: "Pago con cheque"
  - otro: "Otros métodos (campo de texto libre)"
```

**Nota:** Estos se registran manualmente en el sistema (ver sección 3).

---

## 2. Flujo de Compra de Paquetes

### 2.1 Compra Presencial (MVP)

**Decisión:** En MVP, todas las compras se realizan PRESENCIALMENTE en la escuela.

**Flujo completo:**

```yaml
Proceso_Compra_Presencial:
  
  Paso_1_Estudiante_Llega:
    ubicacion: "En la escuela física"
    quiere: "Comprar paquete de clases"
  
  Paso_2_Secretary_Abre_Sistema:
    acción: "Busca estudiante existente O crea nuevo"
    pantalla: "Perfil de estudiante"
  
  Paso_3_Seleccionar_Paquete:
    secretary: "Selecciona paquete deseado"
    opciones:
      - Paquete_10_Clases: $50000
      - Paquete_20_Clases: $90000
      - Paquete_Custom: precio variable
    sistema_muestra: "Precio final con descuentos (si aplican)"
  
  Paso_4_Método_de_Pago:
    secretary: "Selecciona método"
    opciones:
      A_Mercado_Pago_Link:
        1. Sistema genera link de pago
        2. Secretary envía link por WhatsApp al estudiante
        3. Estudiante paga desde su celular
        4. Sistema espera confirmación de Mercado Pago
        5. Secretary valida pago (ve pantalla de confirmación)
        6. Secretary presiona "Acreditar Créditos"
      
      B_Mercado_Pago_QR:
        1. Sistema genera QR
        2. Estudiante escanea con app Mercado Pago
        3. Paga desde su celular
        4. Sistema espera confirmación
        5. Secretary valida y acredita
      
      C_Efectivo:
        1. Estudiante paga en efectivo
        2. Secretary ingresa monto recibido
        3. Sistema calcula vuelto (si aplica)
        4. Secretary confirma pago
        5. Créditos acreditados INMEDIATAMENTE
      
      D_Transferencia:
        1. Secretary selecciona "Transferencia"
        2. Estudiante hace transferencia
        3. Secretary sube comprobante (foto/PDF)
        4. Secretary confirma pago
        5. Créditos acreditados INMEDIATAMENTE
  
  Paso_5_Confirmación:
    sistema_genera:
      - Recibo interno (PDF)
      - Email de confirmación a estudiante
      - Actualización de créditos en perfil
    
    estudiante_recibe:
      - Recibo impreso (opcional)
      - Email con detalles de compra
      - WhatsApp de confirmación (post-MVP)
```

**UI Requerida:**
- Modal "Nueva Compra de Paquete"
- Selector de paquetes con precios visibles
- Selector de método de pago
- Pantalla de "Esperando confirmación de Mercado Pago" (con spinner)
- Vista de "Comprobante de pago" para upload

---

### 2.2 Compra Online (POST-MVP)

**Decisión:** Compra online habilitada POST-MVP.

**Flujo futuro:**
```yaml
Post_MVP_Online_Purchase:
  
  Proceso:
    1. Estudiante se loguea en plataforma
    2. Ve catálogo de paquetes disponibles
    3. Selecciona paquete
    4. Paga con Mercado Pago (checkout embedded)
    5. Pago aprobado: créditos acreditados AUTOMÁTICAMENTE
    6. Email de confirmación automático
  
  Aprobación:
    decisión: "AUTOMÁTICO después del pago"
    sin_intervención_manual: true
    justificación: "Webhook de Mercado Pago es confiable"
  
  Características:
    - Portal de estudiante (login requerido)
    - Historial de compras visible
    - Posibilidad de re-comprar paquete anterior
    - Sistema de cupones de descuento
```

**Seguridad online (POST-MVP):**
- Autenticación de estudiante
- Validación de email
- Prevención de fraude (verificar con Mercado Pago)
- Límite de intentos fallidos

---

## 3. Registro Manual de Pagos

### 3.1 Pagos Offline - Registro Manual

**Decisión:** Secretary puede registrar pagos manuales (efectivo, transferencia, etc.)

**UI/UX:**

```yaml
Modal_Registro_Manual:
  campos:
    - estudiante: autocomplete (buscar)
    - paquete: dropdown (paquetes activos de la escuela)
    - monto_pagado: decimal (pre-llenado con precio de paquete)
    - metodo_pago: dropdown ['efectivo', 'transferencia', 'tarjeta_presencial', 'cheque', 'otro']
    - fecha_pago: date (default: hoy)
    - notas: text (opcional)
    - comprobante: file_upload (opcional, ver 3.2)
  
  validaciones:
    - monto_pagado > 0
    - estudiante existe
    - paquete existe
  
  al_guardar:
    1. Crear registro de pago en DB
    2. Acreditar créditos inmediatamente
    3. Generar recibo interno
    4. Enviar email de confirmación (opcional)
```

---

### 3.2 Upload de Comprobante

**Decisión:** Para pagos con Mercado Pago/transferencia/tarjeta: upload de comprobante. Para efectivo: NO es posible (no hay comprobante).

**Especificaciones:**

```yaml
Comprobante_Upload:
  formatos: ['jpg', 'jpeg', 'png', 'pdf']
  max_size: 5MB
  storage: Cloud storage (Cloudinary / S3)
  
  casos:
    mercado_pago:
      opcional: true
      fuente: "Screenshot de app Mercado Pago"
    
    transferencia:
      obligatorio: true
      fuente: "Comprobante bancario"
    
    tarjeta_presencial:
      opcional: true
      fuente: "Ticket de POS"
    
    efectivo:
      no_disponible: true
      razon: "No existe comprobante de efectivo"
      alternativa: "Sistema genera recibo interno"
```

---

### 3.3 Métodos de Pago - Selector

**Decisión:** Dropdown con múltiples métodos.

**Lista completa:**
```yaml
Payment_Methods:
  online:
    - mercadopago_link: "Mercado Pago (Link)"
    - mercadopago_qr: "Mercado Pago (QR)"
  
  offline:
    - efectivo: "Efectivo"
    - transferencia_bancaria: "Transferencia Bancaria"
    - tarjeta_debito: "Tarjeta de Débito (Presencial)"
    - tarjeta_credito: "Tarjeta de Crédito (Presencial)"
    - cheque: "Cheque"
    - otro: "Otro"
```

---

### 3.4 Aprobación de Pagos Manuales

**Decisión:** Pagos manuales se acreditan AUTOMÁTICAMENTE (sin aprobación de Owner).

**Justificación:**
- Secretary es personal de confianza
- Owner puede revisar historial después
- Evita fricción operativa

**Control:**
```yaml
Audit_Trail:
  cada_pago_registra:
    - quien_registro: secretary_user_id
    - cuando: timestamp
    - metodo_usado: payment_method
    - comprobante: url (si existe)
  
  owner_puede:
    - Ver todos los pagos registrados
    - Filtrar por secretary
    - Exportar reporte
    - Anular pago (ver sección 6)
```

---

## 4. Invoicing (Facturación)

### 4.1 Facturación Oficial con AFIP

**Decisión:** Facturación con AFIP queda FUERA del sistema en MVP.

**Proceso actual:**
```yaml
Escenario: Cliente solicita factura oficial

Proceso_Manual:
  1. Cliente pide factura en escuela
  2. Secretary toma datos fiscales del cliente:
     - Razón social / Nombre
     - CUIT/CUIL
     - Domicilio fiscal
     - Condición IVA
  3. Owner genera factura en sistema de AFIP (fuera del SaaS)
  4. Owner entrega factura impresa o PDF al cliente
  
  sistema_saas: "NO genera factura oficial"
  registro_en_sistema: "Se marca que se emitió factura (flag)"
```

**Campo adicional en Payment:**
```yaml
Payment:
  invoice_required: boolean
  invoice_emitted: boolean
  invoice_number: string (nullable)
  invoice_date: date (nullable)
  invoice_notes: text (nullable)
```

---

### 4.2 Recibo Interno

**Decisión:** Sistema genera "recibo interno" (NO válido fiscalmente) por defecto.

**Recibo Interno - Contenido:**

```yaml
Internal_Receipt:
  header:
    - school_name
    - school_logo
    - school_address
    - school_cuit (si existe)
    - receipt_number: "REC-2025-00001" (auto-incrementa)
    - receipt_date: date
  
  student_info:
    - nombre_completo
    - documento
    - email
    - telefono
  
  purchase_details:
    - package_name: "Paquete 10 Clases"
    - quantity: "10 clases"
    - unit_price: "$5000"
    - discount: "$500" (si aplica)
    - total: "$45000"
  
  payment_info:
    - payment_method: "Efectivo"
    - payment_date: date
    - transaction_id: uuid
  
  credits_info:
    - creditos_otorgados: 10
    - creditos_totales_disponibles: 25
    - fecha_vencimiento: "2025-04-15"
  
  footer:
    - nota: "Este recibo NO es válido como factura fiscal"
    - firma_secretary: (opcional)
    - QR_code: link a verificación online (post-MVP)
  
  formato: PDF
  acciones:
    - Ver online
    - Descargar PDF
    - Enviar por email
    - Imprimir
```

---

### 4.3 Integración con Servicios de Facturación

**Decisión:** NO hay integración con servicios terceros en MVP.

**Servicios mencionados (POST-MVP):**
- Afip.io
- FacturAR
- Ninguno en uso actualmente

**Post-MVP:** Evaluar integración si hay demanda alta de facturación oficial.

---

## 5. Payment History y Reconciliation

### 5.1 Historial Completo de Pagos

**Decisión:** Sí, historial COMPLETO y detallado por estudiante.

**Vista "Historial de Pagos":**

```yaml
Payment_History_View:
  filtros:
    - rango_fechas: date_range
    - metodo_pago: multiselect
    - paquete: multiselect
    - status: multiselect ['completed', 'pending', 'failed', 'refunded']
  
  tabla_columnas:
    - fecha: date
    - paquete: string
    - monto: decimal
    - metodo: badge (color-coded)
    - creditos_otorgados: integer
    - status: badge
    - comprobante: icon (click to view)
    - acciones: [Ver Detalle, Descargar Recibo, Anular]
  
  exportar:
    - formato: ['CSV', 'Excel', 'PDF']
    - incluye: "Todos los datos de la tabla"
```

**Datos Guardados por Pago:**
```yaml
Payment_Record:
  # Identificación
  id: uuid
  transaction_id: string (Mercado Pago ID o interno)
  
  # Relaciones
  student_id: uuid
  package_id: uuid
  school_id: uuid
  
  # Montos
  package_price: decimal  # Precio del paquete
  discount_amount: decimal (nullable)
  final_amount: decimal  # Precio final pagado
  
  # Método y Estado
  payment_method: enum
  payment_status: enum ['pending', 'completed', 'failed', 'refunded']
  
  # Fechas
  created_at: timestamp  # Cuándo se creó el registro
  paid_at: timestamp (nullable)  # Cuándo se confirmó el pago
  
  # Mercado Pago (si aplica)
  mercadopago_payment_id: string (nullable)
  mercadopago_status: string (nullable)
  mercadopago_status_detail: string (nullable)
  
  # Créditos
  credits_granted: integer
  credits_expiration_date: date
  
  # Documentación
  receipt_number: string  # REC-2025-00001
  receipt_url: string  # Link al PDF
  payment_proof_url: string (nullable)  # Comprobante subido
  
  # Auditoría
  registered_by: uuid (staff)
  notes: text (nullable)
  
  # Facturación (si aplica)
  invoice_required: boolean
  invoice_emitted: boolean
  invoice_number: string (nullable)
```

---

### 5.2 Reconciliación Bancaria

**Decisión:** Reconciliación bancaria automática NO está en MVP.

**Justificación:**
- Complejidad alta
- Requiere integración con APIs bancarias
- Owner puede hacer manualmente al principio

**Workaround MVP:**
```yaml
Manual_Reconciliation:
  1. Owner descarga extracto de Mercado Pago (CSV)
  2. Owner descarga reporte de pagos del sistema (CSV)
  3. Owner compara manualmente en Excel
  4. Si hay discrepancias: investigar y ajustar
```

**Post-MVP:**
```yaml
Automatic_Reconciliation:
  - Integración con API de Mercado Pago
  - Comparación automática de transacciones
  - Dashboard de discrepancias
  - Alertas de pagos no registrados
```

---

### 5.3 Información a Guardar - Completa

**Decisión:** Guardar TODA la información mencionada en 5.1.

**Importancia:**
- Auditoría completa
- Soporte a estudiantes
- Resolución de disputas
- Reportes financieros precisos
- Compliance legal (retención de datos)

---

## 6. Refunds (Devoluciones)

### 6.1 Casos de Devolución

**Decisión:** Sí, hay casos de devolución.

**Casos comunes:**
```yaml
Refund_Cases:
  caso_1:
    motivo: "Estudiante canceló curso antes de empezar"
    acción: "Devolver 100% del monto"
  
  caso_2:
    motivo: "Estudiante usó 3 de 10 clases y se muda de ciudad"
    acción: "Devolver proporcional (7 clases restantes)"
  
  caso_3:
    motivo: "Pago duplicado por error"
    acción: "Devolver monto duplicado"
  
  caso_4:
    motivo: "Estudiante insatisfecho con servicio"
    acción: "Decisión de Owner (caso por caso)"
```

---

### 6.2 Proceso de Devolución

**Decisión:** Devoluciones son MANUALES, aprobadas por Owner y/o Secretary.

**Flujo completo:**

```yaml
Refund_Process:
  
  Paso_1_Solicitud:
    quien: "Estudiante contacta escuela"
    medio: "Presencial, teléfono, email, WhatsApp"
    student_service: "Secretary escucha el caso"
  
  Paso_2_Evaluación:
    secretary: "Consulta con Owner (si es necesario)"
    owner: "Decide si aprueba o rechaza devolución"
    factores:
      - Motivo del estudiante
      - Política de la escuela
      - Cantidad de clases usadas
      - Antigüedad del pago
  
  Paso_3_Registro_en_Sistema:
    secretary_abre: "Perfil del estudiante > Pagos > Ver Pago"
    boton: "Solicitar Devolución"
    modal_campos:
      - monto_a_devolver: decimal (max = monto_pagado - monto_usado)
      - motivo: text (obligatorio)
      - metodo_devolucion: enum ['efectivo', 'transferencia', 'mercadopago']
      - aprobado_por: dropdown (Owner/Secretary)
    
    al_guardar:
      - payment.status = 'refund_pending'
      - crear registro de refund en DB
  
  Paso_4_Ejecución:
    
    Si_Efectivo:
      1. Secretary entrega efectivo a estudiante
      2. Estudiante firma recibo
      3. Secretary marca refund como 'completed'
      4. Sistema ajusta créditos
    
    Si_Transferencia:
      1. Owner hace transferencia bancaria
      2. Owner sube comprobante
      3. Owner marca refund como 'completed'
      4. Sistema ajusta créditos
    
    Si_Mercado_Pago:
      1. Owner inicia refund desde panel de Mercado Pago (MANUAL)
      2. Mercado Pago procesa devolución (1-10 días)
      3. Owner marca refund como 'completed' cuando ve que se acreditó
      4. Sistema ajusta créditos
  
  Paso_5_Ajuste_de_Créditos:
    logica:
      if creditos_no_usados > 0:
        student.credits -= creditos_no_usados
        student.packages[X].status = 'refunded'
      
      if creditos_ya_usados:
        no_se_pueden_devolver: true
        monto_devuelto = precio_por_clase * creditos_no_usados
```

**Nota:** Devolución vía Mercado Pago API es POST-MVP (por ahora es manual).

---

### 6.3 Tracking de Devoluciones

**Decisión:** NO hay tracking detallado de devoluciones en MVP.

**MVP:**
- Campo en Payment: `status = 'refunded'`
- Monto devuelto guardado
- Motivo de devolución guardado

**POST-MVP:**
```yaml
Refund_Tracking:
  tabla_separada: refunds
  campos:
    - original_payment_id
    - refund_amount
    - refund_method
    - refund_reason
    - requested_by
    - approved_by
    - requested_date
    - completed_date
    - refund_proof_url
  
  reportes:
    - "Total refunded por mes"
    - "Top motivos de devolución"
    - "Tasa de devoluciones"
```

---

### 6.4 Política de Devoluciones

**Decisión:** NO hay políticas definidas aún. Cada caso se evalúa individualmente.

**Acción requerida:**
```yaml
Tarea_Pendiente:
  responsable: Owner del cliente
  deadline: Antes de lanzamiento
  crear:
    - Documento "Política de Devoluciones"
    - Definir casos cubiertos/no cubiertos
    - Porcentajes de devolución según clases usadas
    - Plazo máximo para solicitar devolución
  
  propuesta_basica:
    - Devolución 100% si no usó clases (dentro de 7 días)
    - Devolución proporcional si usó algunas clases
    - No hay devolución si pasaron más de 6 meses
    - No hay devolución si usó más del 50% de clases
```

---

## 7. Pricing Configuration

### 7.1 Frecuencia de Cambios

**Decisión:** Los precios cambian frecuentemente (inflación en Argentina).

**Implicaciones:**
```yaml
Realidad_Argentina:
  inflación: "Alta (~50-100% anual en 2024-2025)"
  cambios_precios: "Cada 1-3 meses típicamente"
  
  necesidad:
    - Fácil actualización de precios
    - Historial de cambios
    - No afectar paquetes ya comprados
```

---

### 7.2 Historial de Cambios de Precios

**Decisión:** Sí, sistema guarda historial de precios.

**Implementación:**

```yaml
Package_Price_History:
  tabla: package_prices
  
  estructura:
    id: uuid
    package_id: uuid
    school_id: uuid
    price: decimal
    valid_from: date
    valid_until: date (nullable)  # NULL = precio actual
    created_by: staff_user_id
    notes: text (nullable)
  
  ejemplo:
    Paquete_10_Clases_School_A:
      - id: 1, price: 50000, valid_from: 2024-01-01, valid_until: 2024-03-31
      - id: 2, price: 60000, valid_from: 2024-04-01, valid_until: 2024-06-30
      - id: 3, price: 70000, valid_from: 2024-07-01, valid_until: NULL (actual)

Query_Precio_Actual:
  SELECT price 
  FROM package_prices 
  WHERE package_id = X 
    AND school_id = Y 
    AND valid_until IS NULL
```

**UI para Owner:**
```yaml
Edit_Package_Price:
  acción: "Cambiar Precio"
  modal:
    - precio_actual: 70000 (readonly, mostrado para referencia)
    - nuevo_precio: input decimal
    - fecha_vigencia: date (default: hoy)
    - motivo: text (opcional, ej: "Ajuste por inflación")
  
  al_guardar:
    1. Actualizar registro actual: valid_until = (fecha_vigencia - 1 día)
    2. Crear nuevo registro: valid_from = fecha_vigencia, valid_until = NULL
    3. Los paquetes comprados antes siguen con precio viejo
```

---

### 7.3 Precio de Clases Compradas vs Nuevas

**Decisión CRÍTICA:** Precio se congela en el momento de la compra.

**Regla:**

```yaml
Pricing_Rule:
  
  Escenario:
    fecha: 2025-01-15
    alumno: "Juan Pérez"
    acción: "Compra Paquete 10 clases"
    precio: $50000
    vencimiento: 2025-04-15
  
  # Pasan 2 meses...
  
  fecha: 2025-03-15
  precio_actual_paquete: $60000 (subió por inflación)
  alumno_tiene: 2 clases restantes (no vencidas)
  alumno_quiere: "Comprar 10 clases más"
  
  Resultado:
    - 2 clases restantes mantienen precio: $50000 / 10 = $5000 c/u
    - 10 clases nuevas al precio actual: $60000 / 10 = $6000 c/u
    - Tiene 12 créditos, 2 precios diferentes
  
  Nota: Esto es automático, sistema maneja por paquete
```

**Modelo de Datos:**
```yaml
Student_Package:
  id: uuid
  student_id: uuid
  package_id: uuid
  purchase_date: date
  purchase_price: decimal  # Precio al momento de compra
  credits_total: integer
  credits_used: integer
  credits_remaining: integer
  expiration_date: date
  
  # Al usar un crédito:
  # Sistema consume del paquete más antiguo primero (FIFO)
```

---

### 7.4 Promociones y Descuentos Temporales

**Decisión:** Sí, sistema de promociones.

**Sistema de Cupones:**

```yaml
Promotion_System:
  tabla: promotions
  
  estructura:
    id: uuid
    school_id: uuid
    code: string (ej: "VERANO2025", "REFERIDO10")
    description: text
    discount_type: enum ['percentage', 'fixed_amount', 'free_credits']
    discount_value: decimal
    
    # Límites
    valid_from: date
    valid_until: date (nullable)
    max_uses: integer (nullable)  # NULL = ilimitado
    current_uses: integer (default: 0)
    
    # Aplicabilidad
    applicable_to: enum ['all_packages', 'specific_packages']
    package_ids: array (si specific)
    min_purchase_amount: decimal (nullable)
    
    # Estado
    active: boolean
    created_by: staff_user_id
  
  ejemplos:
    
    Promo_1_Porcentaje:
      code: "VERANO2025"
      discount_type: "percentage"
      discount_value: 10  # 10% off
      valid_until: "2025-03-31"
      max_uses: NULL  # Ilimitado
    
    Promo_2_Monto_Fijo:
      code: "PROMO5000"
      discount_type: "fixed_amount"
      discount_value: 5000  # $5000 de descuento
      valid_until: "2025-02-28"
      max_uses: 50  # Solo 50 usos
    
    Promo_3_Clases_Gratis:
      code: "REFERIDO"
      discount_type: "free_credits"
      discount_value: 2  # 2 clases gratis
      valid_until: NULL  # Sin vencimiento
      max_uses: 1  # Una vez por estudiante
```

**Aplicación de Cupón:**
```yaml
Purchase_Flow_With_Coupon:
  1. Secretary/Estudiante ingresa código
  2. Sistema valida:
     - Código existe y está activo
     - No expiró (valid_until)
     - No alcanzó max_uses
     - Aplica al paquete seleccionado
  3. Si válido:
     - Calcula descuento
     - Muestra precio final
     - Incrementa current_uses
  4. Si inválido:
     - Muestra error específico
```

**Combinación de Promociones:**
```yaml
Multiple_Promotions:
  decisión: "NO permitido en MVP"
  razon: "Complejidad de reglas de negocio"
  
  Post_MVP:
    permitir: "1 cupón + 1 descuento de estudiante"
    ejemplo: "VERANO2025 (10% off) + Descuento por lealtad (5% off)"
```

---

## 8. Payment Notifications

### 8.1 Notificación a Estudiante

**Decisión:** Sí, estudiante recibe notificación cuando se acredita pago.

**Canales en MVP:**

```yaml
Notification_Channels:
  email:
    status: ✅ MVP
    trigger: "Al completar pago"
    template: "payment_confirmation"
    contenido:
      - Nombre del estudiante
      - Paquete comprado
      - Monto pagado
      - Créditos otorgados
      - Fecha de vencimiento
      - Link al recibo (PDF)
      - Próximos pasos (agendar clase)
  
  whatsapp:
    status: ❌ Post-MVP
    razon: "Requiere integración con WhatsApp Business API"
    timeline: "Sprint 6-8"
  
  sms:
    status: ❌ Post-MVP
    razon: "Costo por SMS alto en Argentina"
```

**Email Template:**
```html
Asunto: ¡Tu pago ha sido confirmado! 🎉

Hola [NOMBRE],

¡Genial! Tu pago ha sido confirmado exitosamente.

📦 Paquete: [PAQUETE_NOMBRE]
💰 Monto: $[MONTO]
🎫 Créditos: [CREDITOS] clases
📅 Válido hasta: [FECHA_VENCIMIENTO]

Ahora puedes agendar tus clases contactando a la escuela.

[BOTÓN: Ver mi recibo]

¡Nos vemos pronto en las clases!

[NOMBRE_ESCUELA]
[TELEFONO_ESCUELA]
```

---

### 8.2 Notificación a Owner

**Decisión:** Owner puede CONFIGURAR si quiere recibir notificaciones de cada pago.

**Configuración:**

```yaml
Owner_Notification_Settings:
  ubicación: "Configuración > Notificaciones > Pagos"
  
  opciones:
    notify_on_every_payment:
      type: boolean
      default: false
      descripción: "Recibir email por cada pago"
    
    notify_on_large_payment:
      type: boolean
      default: true
      threshold: decimal (configurable, ej: $100000)
      descripción: "Recibir email si pago > threshold"
    
    notify_on_failed_payment:
      type: boolean
      default: true
      descripción: "Recibir email si pago falla"
    
    notification_email:
      type: string
      default: owner.email
      descripción: "Email donde recibir notificaciones"
```

**Justificación:** Owner puede estar muy ocupado y no querer spam de cada pago pequeño.

---

### 8.3 Resumen Diario/Semanal

**Decisión:** Sí, resúmenes automáticos.

**Resumen Diario:**
```yaml
Daily_Summary:
  enviado: "Todos los días a las 20:00"
  destinatario: Owner (si está habilitado)
  
  contenido:
    título: "Resumen de Pagos - [FECHA]"
    métricas:
      - Total ingresado hoy: $X
      - Cantidad de pagos: Y
      - Paquetes vendidos:
        * Paquete 10: 3 ventas
        * Paquete 20: 1 venta
      - Métodos de pago usados:
        * Efectivo: $X (Y pagos)
        * Mercado Pago: $X (Y pagos)
      - Créditos otorgados: Z clases
    
    acciones_pendientes:
      - Pagos pendientes de confirmación: N
      - Devoluciones solicitadas: M
```

**Resumen Semanal:**
```yaml
Weekly_Summary:
  enviado: "Domingos a las 20:00"
  destinatario: Owner + Secretary (opcional)
  
  contenido:
    título: "Resumen Semanal - [FECHA_INICIO] a [FECHA_FIN]"
    métricas:
      - Total ingresado: $X
      - Comparación con semana anterior: +Y% o -Y%
      - Mejor día de ventas: [DIA] con $X
      - Paquete más vendido: [PAQUETE]
      - Tasa de conversión: X% (prospectos que compraron)
    
    gráfico: (imagen inline de ingresos por día)
```

---

## 9. Failed Payments

### 9.1 Manejo de Pagos Fallidos

**Decisión:** Si pago falla, NO se otorgan créditos.

**Regla estricta:**
```yaml
Payment_Validation:
  IF pago_confirmado == false:
    THEN creditos_otorgados = 0
  
  IF pago_confirmado == true:
    THEN creditos_otorgados = package.credits
```

**Estados de Pago:**
```yaml
Payment_Status_Flow:
  
  pending:
    descripción: "Pago iniciado pero no confirmado"
    creditos: 0
    acciones:
      - Esperar webhook de Mercado Pago
      - Timeout: 15 minutos
  
  completed:
    descripción: "Pago confirmado y exitoso"
    creditos: ✅ Otorgados
    acciones:
      - Enviar email de confirmación
      - Generar recibo
  
  failed:
    descripción: "Pago rechazado o falló"
    creditos: 0
    razones:
      - Tarjeta rechazada
      - Fondos insuficientes
      - Error de Mercado Pago
      - Timeout
    acciones:
      - Notificar a estudiante
      - Ofrecer re-intento
  
  cancelled:
    descripción: "Estudiante canceló el pago"
    creditos: 0
```

---

### 9.2 Re-intento de Pago

**Decisión:** Estudiante puede re-intentar contactando al Owner/Secretary.

**Flujo:**

```yaml
Failed_Payment_Recovery:
  
  Escenario: Pago falló por tarjeta rechazada
  
  Proceso:
    1. Sistema registra payment con status='failed'
    2. Estudiante recibe email: "Tu pago no pudo procesarse"
    3. Estudiante contacta escuela (teléfono/WhatsApp/presencial)
    4. Secretary busca el payment fallido en sistema
    5. Secretary inicia nuevo intento:
       - Opción A: Nuevo link de Mercado Pago
       - Opción B: Otro método de pago (efectivo, transferencia)
    6. Si nuevo pago exitoso:
       - Créditos otorgados
       - Payment original se marca como 'replaced_by' nuevo payment
```

**UI:**
```yaml
Failed_Payments_View:
  ubicación: "Pagos > Fallidos"
  filtros:
    - últimos 7 días
    - últimos 30 días
    - todos
  
  tabla:
    - estudiante
    - paquete
    - monto
    - fecha_intento
    - razón_falla
    - acciones: [Re-intentar, Contactar Estudiante, Descartar]
```

---

### 9.3 Tracking de Intentos Fallidos

**Decisión:** Si no es difícil, incluir en MVP. Si es difícil, POST-MVP.

**MVP Simplificado:**
```yaml
Failed_Payment_Tracking:
  campo_en_payment: 
    failure_reason: text (nullable)
    failure_detail: text (nullable)
    retry_count: integer (default: 0)
  
  log_básico:
    - Cuántos pagos fallaron hoy
    - Razón más común de fallo
```

**POST-MVP Completo:**
```yaml
Failed_Payments_Analytics:
  tabla: payment_attempts
  campos:
    - payment_id
    - attempt_number
    - attempted_at
    - failure_reason
    - failure_detail
    - mercadopago_error_code
  
  reportes:
    - Tasa de pagos fallidos por método
    - Razones más comunes de fallo
    - Estudiantes con múltiples intentos fallidos
```

---

## 10. Payment Analytics

### 10.1 Métricas Críticas para Owner

**Decisión:** Las siguientes métricas son CRÍTICAS para MVP.

**Dashboard Financiero:**

```yaml
Financial_Dashboard:
  
  Métricas_Principales:
    
    1. Ingresos_Totales:
      período: [diario, semanal, mensual, anual, custom]
      visualización: "Gráfico de línea"
      comparación: "vs período anterior"
      breakdown:
        - Por método de pago
        - Por paquete
        - Por school (si multi-school)
    
    2. Paquetes_Vendidos:
      período: [diario, semanal, mensual, custom]
      visualización: "Gráfico de barras"
      desglose:
        - Paquete A: X ventas ($Y total)
        - Paquete B: X ventas ($Y total)
      métrica_clave: "Paquete más vendido"
    
    3. Método_de_Pago_Más_Usado:
      período: [semanal, mensual, custom]
      visualización: "Gráfico de torta"
      datos:
        - Efectivo: X%
        - Mercado Pago: Y%
        - Transferencia: Z%
    
    4. Estudiantes_Nuevos_vs_Recurrentes:
      definición:
        nuevo: "Primera compra"
        recurrente: "Ya compró antes"
      período: mensual
      visualización: "Gráfico de barras apiladas"
      métricas:
        - Ingresos de nuevos: $X
        - Ingresos de recurrentes: $Y
        - % cada uno
    
    5. Cantidad_de_Clases_Vendidas:
      período: mensual
      visualización: "Número grande"
      breakdown:
        - Clases vendidas: X
        - Clases usadas: Y
        - Clases pendientes: Z
    
    6. Estudiantes_que_Compran_Más:
      descripción: "Top 10 estudiantes por gasto total"
      período: "histórico"
      tabla:
        - nombre
        - total_gastado
        - paquetes_comprados
        - última_compra
```

---

### 10.2 Implementación con Metabase

**Decisión:** Usar METABASE para analytics en MVP (no custom dashboard).

**Ventajas de Metabase:**
```yaml
Metabase_Benefits:
  - Open source y gratuito
  - Conecta directo a PostgreSQL
  - Owner puede crear sus propios reportes
  - Queries SQL custom si necesita
  - Exportar a CSV/Excel/PDF
  - Compartir dashboards
  - No requiere desarrollo de frontend custom
```

**Trabajo requerido:**
```yaml
Metabase_Setup:
  
  Fase_1_Infrastructure:
    - Deploy de Metabase (Docker)
    - Conectar a database
    - Configurar usuarios (Owner, Secretary)
  
  Fase_2_Data_Modeling:
    - Asegurar que DB tiene estructura correcta
    - Crear views si es necesario (para simplificar queries)
    - Documentar nombres de tablas/columnas
  
  Fase_3_Initial_Dashboards:
    - Crear 5-10 dashboards básicos para Owner
    - Métricas listadas en 10.1
    - Configurar periodicidad de refresh
  
  Fase_4_Training:
    - Capacitar a Owner en uso de Metabase
    - Mostrar cómo crear queries nuevos
    - Mostrar cómo modificar dashboards
```

**Estructura de Datos Requerida (para Metabase):**
```sql
-- Vista útil para analytics
CREATE VIEW payment_analytics AS
SELECT 
  p.id,
  p.paid_at::date as payment_date,
  p.final_amount,
  p.payment_method,
  p.credits_granted,
  s.id as student_id,
  s.name as student_name,
  CASE 
    WHEN (SELECT COUNT(*) FROM payments WHERE student_id = s.id AND paid_at < p.paid_at) = 0 
    THEN 'new_student' 
    ELSE 'recurring_student' 
  END as student_type,
  pkg.name as package_name,
  sch.name as school_name
FROM payments p
JOIN students s ON p.student_id = s.id
JOIN packages pkg ON p.package_id = pkg.id
JOIN schools sch ON p.school_id = sch.id
WHERE p.payment_status = 'completed'
  AND p.deleted_at IS NULL;
```

---

### 10.3 Cálculo Manual vs Automático

**Decisión:** Métricas son automáticas (Metabase las calcula).

**Owner NO necesita calcular manualmente:**
- Metabase refresca datos cada X minutos (configurable)
- Queries son automáticos
- Gráficos se actualizan solos

**Owner SÍ puede:**
- Crear queries custom
- Exportar datos a Excel para análisis adicional
- Programar emails con reportes (Metabase feature)

---

### 10.4 Proyecciones

**Decisión:** Proyecciones financieras NO están en MVP.

**Justificación:**
- Complejidad de algoritmos de predicción
- Requiere histórico suficiente (3-6 meses mínimo)
- No es crítico para operación inicial

**POST-MVP:**
```yaml
Financial_Projections:
  tipos:
    - Linear projection: "A este ritmo, mes que viene: $X"
    - Seasonal trends: "Diciembre suele ser 20% mejor que promedio"
    - Growth rate: "Crecimiento mensual: +X%"
  
  requisitos:
    - Mínimo 6 meses de datos
    - Integración con librería de ML (Prophet, ARIMA)
```

**Workaround MVP:**
```yaml
Manual_Projection:
  Owner_puede:
    1. Ver ingresos de últimos 3 meses en Metabase
    2. Calcular promedio
    3. Proyectar manualmente: promedio * 12 = ingreso anual esperado
```

---

## 📊 Resumen Técnico - MVP Scope

### **Features Incluidos en MVP:**

✅ **Mercado Pago Integration:**
- Checkout Pro (link de pago)
- QR Code
- Webhook handling
- Validación manual de pagos

✅ **Múltiples Métodos de Pago:**
- Mercado Pago (online)
- Efectivo
- Transferencia
- Tarjeta presencial
- Otros

✅ **Registro Manual:**
- Secretary puede registrar pagos offline
- Upload de comprobantes (excepto efectivo)
- Acreditación automática

✅ **Recibos Internos:**
- PDF generado automáticamente
- Email automático a estudiante
- Descargable desde sistema

✅ **Payment History:**
- Historial completo por estudiante
- Filtros y búsqueda
- Exportar a CSV/Excel

✅ **Refunds:**
- Proceso manual de devolución
- Registro de motivo
- Ajuste de créditos

✅ **Pricing:**
- Historial de precios
- Cambios frecuentes soportados
- Precio congelado al comprar

✅ **Promociones:**
- Sistema de cupones
- Límites configurables (fecha, cantidad)
- Descuentos por porcentaje o monto fijo

✅ **Notificaciones:**
- Email a estudiante (confirmación)
- Email a Owner (configurable)
- Resúmenes diarios/semanales

✅ **Analytics con Metabase:**
- Dashboards pre-configurados
- Owner puede crear queries custom
- Exportación de datos

---

### **Features Post-MVP:**

❌ Compra online por estudiantes (portal)  
❌ Acreditación automática sin validación manual  
❌ WhatsApp notifications  
❌ SMS notifications  
❌ Refund automático vía Mercado Pago API  
❌ Reconciliación bancaria automática  
❌ Facturación con AFIP integrada  
❌ Custom analytics dashboard (usar Metabase)  
❌ Proyecciones financieras  
❌ Tracking completo de payment attempts  
❌ Checkout Bricks (embedded)  
❌ POS físico integration  
❌ Suscripciones recurrentes  

---

## 🚨 Riesgos y Mitigaciones

### **Riesgo 1: Inexperiencia con Mercado Pago**
**Severidad:** Alta  
**Probabilidad:** 100% (confirmado)  

**Mitigación:**
- Sprint 0 dedicado a R&D (1-2 semanas)
- Sandbox testing extensivo
- Empezar con método más simple (Checkout Pro)
- Considerar consultor externo si hay bloqueos
- Buffer de 2 sprints en timeline

---

### **Riesgo 2: Validación Manual de Pagos**
**Severidad:** Media  
**Probabilidad:** Baja  

**Descripción:** Depender de humano para validar pagos puede causar delays.

**Mitigación:**
- Notificaciones claras cuando hay pago pendiente
- Dashboard de "Pagos Pendientes" bien visible
- Timeout: si pago no validado en 24h, enviar alerta
- POST-MVP: automatizar completamente

---

### **Riesgo 3: Rate Limits de Mercado Pago**
**Severidad:** Baja  
**Probabilidad:** Baja  

**Descripción:** Mercado Pago tiene límites de requests por segundo.

**Mitigación:**
- En MVP, volumen será bajo (pocas escuelas)
- Implementar queue para webhooks
- Retry logic para llamadas fallidas

---

## 🔄 Dependencias con Otras Fases

**Con Fase 1 (Foundation):**
- Sistema de Schools y Owners
- Permisos de Secretary para registrar pagos

**Con Fase 3 (Recursos):**
- Compra de paquetes otorga créditos
- Créditos otorgados tienen vencimiento
- Payment history vinculado a student profile

**Con Fase 2 (Scheduling):**
- Estudiante debe tener créditos para agendar clase
- Clase completada consume crédito

---

## 📅 Timeline Estimado

```yaml
Sprint_0_RD: 1-2 semanas
  - Setup Mercado Pago
  - Sandbox testing
  - Proof of concept

Sprint_1: 2 semanas
  - Checkout Pro (link de pago)
  - Webhook básico
  - Registro manual de pagos
  - Recibos internos

Sprint_2: 2 semanas
  - QR Code
  - Upload de comprobantes
  - Payment history
  - Email notifications

Sprint_3: 2 semanas
  - Sistema de promociones
  - Refunds
  - Pricing history
  - Owner notification settings

Sprint_4: 1 semana
  - Metabase setup
  - Dashboards iniciales
  - Testing end-to-end
  - Bug fixes

TOTAL: 7-8 semanas para Fase 4 completa
```

---

**Documento creado:** 22 de Octubre 2025  
**Próxima revisión:** Post-MVP Planning  
**Versión:** 1.0  
**Status:** ✅ Listo para Desarrollo

## 11. Créditos, Ledger y Recibos (Unificación MVP)

Objetivo: Alinear Fase 4 con la política operativa de créditos, la contabilidad (ledger) y los documentos (recibos y pagos a instructores), siguiendo el modelo “debit first + compensaciones” y evitando estados “en evaluación”.

### 11.1 Modelo Operativo de Créditos: “Siempre descontar y luego compensar”

- Principio operativo:
  - Ante una falta o cancelación tardía del alumno, el sistema SIEMPRE descuenta 1.0 crédito de inmediato (debit first).
  - Luego, aplica automáticamente la compensación que corresponda por política (p. ej., +0.5 en 12–24h).
  - Si el estudiante presenta justificativo válido dentro de la ventana y es aprobado por el staff, se acredita el compensatorio adicional (+0.5 o +1.0) vía asiento de ledger.
- Beneficio: evita créditos “pendientes de evaluación”, simplifica la operación administrativa y mantiene el historial claro.

Política escalonada (resumen):
```yaml
Refunds_Escalonadas_MVP:
  ">=24h": 1.0
  "12-24h": 0.5
  "<12h": 0.0
Justificada (médica/emerg./fuerza mayor, aprobada):
  "12-24h": 1.0  # (0.5 auto + 0.5 por justificada)
  "<12h":   1.0
Portal_Blocking:
  bloquear_cancelación_menos_12h: true  # estudiante no puede cancelar; staff sí
```

Referencias:
- Reglas de UI/UX y bloqueo en [DECISIONES_FASE_5_StudentPortal.md](DECISIONES_FASE_5_StudentPortal.md)
- Detalle de política y “ausencia justificada” en [DECISIONES_FASE_3_Recursos.md](DECISIONES_FASE_3_Recursos.md)
- Ejemplo de lógica contable en [applyCancellationLedger()](DECISIONES_FASE_5_StudentPortal.md:0)

### 11.2 Ledger: Tipos de Transacción y Flujo

Nuevos tipos de transacción (visibles en “Historial de Créditos” del estudiante):
- reserved
- released
- credit_used (-1.0)
- partial_refund (+0.5)
- justified_absence_requested
- justified_absence_approved (+0.5 o +1.0)
- justified_absence_rejected
- no_show

Flujos típicos:
- 12–24h sin justificativo:  
  -1.0 credit_used → +0.5 partial_refund = neto -0.5
- 12–24h con justificativo aprobado:  
  -1.0 credit_used → +0.5 partial_refund → +0.5 justified_absence_approved = neto 0.0
- <12h/no‑show sin justificativo:  
  -1.0 credit_used = neto -1.0
- <12h/no‑show con justificativo aprobado:  
  -1.0 credit_used → +1.0 justified_absence_approved = neto 0.0

Nota de modelo fraccional:
- Requiere `fractional_amount DECIMAL(3,2)` en créditos (soportar 0.50).

### 11.3 Impacto en Recibos y Documentos

- Recibo de compra (estudiante):
  - No cambia: detalla paquete, monto, créditos otorgados, validez.
  - Ajustes por cancelaciones/justificativos NO alteran el recibo original; se reflejan en el “Historial de Créditos” (ledger).
- Recibo/PDF de pago a instructor:
  - Si una clase ya provisionada cambia por “ausencia justificada aprobada”, se agrega línea de ajuste (reverso) en el período correspondiente:
    - Ejemplo: “Ajuste por justificada aprobada – Clase 2025‑03‑15: -$X”
  - Si fue “late sin justificada” o “no‑show sin justificada”, el instructor cobra según reglas; no hay ajuste.
- Historial de pagos (estudiante):
  - Los ajustes de créditos (partial_refund/justified_absence_approved) se muestran en la vista de “Créditos” (ledger), no como pagos monetarios.
  - En “Pagos”, se mantienen solo transacciones dinerarias (compra, refund monetario si aplica en 6.x).

### 11.4 Ventanas, Aprobación y Evidencias (Backoffice)

Configuración en Admin Dashboard:
- Ventana de presentación de justificativo: hasta 24h POST‑clase.
- Aprobadores: Owner o Secretary.
- Motivos aceptados: Salud, Emergencia familiar, Fuerza mayor; archivo adjunto obligatorio (pdf/jpg/png).
- Bandeja de revisión: Pendientes / Aprobados / Rechazados; acción: Aprobar/Rechazar.
- Al aprobar:
  - Crear asiento ledger `justified_absence_approved` (+0.5 o +1.0).
  - Reversar pago a instructor si estaba provisionado.
  - Notificar al estudiante (email/WhatsApp).
- Al rechazar:
  - Se mantiene penalización original.

Referencias:
- Workflow y settings en [DECISIONES_FASE_6_AdminDashboard.md](DECISIONES_FASE_6_AdminDashboard.md)

### 11.5 Consumo y Reservas (Alineación con Scheduling)

- “Reservar al agendar” y “Consumir al completar”:
  - Al confirmar slot: `reserved`.
  - Cancelación ≥24h: `released` (sin consumo).
  - Late/no‑show: aplicar `credit_used` y compensaciones.
- Orden de consumo:
  - FIFO entre paquetes.
  - Prioridad a créditos “congelados” antes de normales.

Referencias:
- Reglas de scheduling y validaciones en [fase1-2-juntas.md](fase1-2-juntas.md)

### 11.6 Reportes y Analytics

- Reportes de cancelación por ventana: ≥24h / 12‑24h / <12h.
- Tasa de “ausencias justificadas” aprobadas vs rechazadas.
- Créditos compensatorios otorgados (parciales y totales).
- Impacto en pagos a instructores por ajustes (líneas de reverso).
- Metabase: incorporar vistas y questions específicas (ver sección 10.2).

### 11.7 Consideraciones de Reembolsos Monetarios (Refunds)

- Las compensaciones de créditos (partial/justificada) NO son reembolsos monetarios; afectan solo el balance de créditos.
- Refunds monetarios siguen la sección 6 (manuales, aprobados por Owner/Secretary) y se reflejan en “Historial de Pagos”.
- Si por política comercial se desea devolver dinero en lugar de créditos:
  - Registrar “refund” en pagos (6.x) y descontar créditos correspondientes (ajuste en ledger para mantener consistencia histórica).

### 11.8 Cambios de Esquema (DB)

- student_credits: agregar `fractional_amount DECIMAL(3,2) DEFAULT 1.00`.
- credit_ledger (o tabla equivalente): soportar tipos: reserved, released, credit_used, partial_refund, justified_absence_requested, justified_absence_approved, justified_absence_rejected, no_show.
- Recibos de instructor: permitir “líneas de ajuste” vinculadas a justificada aprobada.
