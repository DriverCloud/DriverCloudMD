# 📊 FASE 6: Admin Dashboard & Configuration - Decisiones Finales

**Proyecto:** Driving School Management SaaS  
**Cliente:** DriverCloud  
**Fecha:** 23 de Octubre 2025  
**Versión:** 1.0 - MVP Scope

---

## 📑 Índice

1. [Dashboard Principal](#1-dashboard-principal)
2. [Reportes Financieros](#2-reportes-financieros)
3. [Reportes Operacionales](#3-reportes-operacionales)
4. [Configuración de Escuela](#4-configuración-de-escuela)
5. [Gestión de Staff y Permisos](#5-gestión-de-staff-y-permisos)
6. [Alertas Críticas](#6-alertas-críticas)
7. [Calendario Maestro](#7-calendario-maestro)
8. [Búsqueda y Navegación](#8-búsqueda-y-navegación)
9. [Personalización y Branding](#9-personalización-y-branding)
10. [Audit Log](#10-audit-log)
11. [Bulk Operations](#11-bulk-operations)
12. [Integration con Metabase](#12-integration-con-metabase)

---

## 1. Dashboard Principal

### 1.1 KPIs Críticos - Vista Inmediata

**Decisión:** Dashboard con KPIs críticos visibles en los primeros 5 segundos.

**Métricas principales:**

```yaml
Dashboard_Layout:
  
  Sección_Superior: "KPIs Principales"
  
  Card_1_Ingresos:
    título: "Ingresos del Mes"
    valor_principal: "$380,000"
    comparación: "+15% vs mes anterior"
    meta: "Meta: $500K (76% alcanzado)"
    gráfico_mini: "Sparkline últimos 7 días"
    color: verde
  
  Card_2_Clases_Hoy:
    título: "Clases Hoy"
    valor_principal: "15 clases"
    desglose:
      - Completadas: 8
      - En curso: 2
      - Pendientes: 5
    próxima_clase: "Próxima en 45 minutos"
    color: azul
  
  Card_3_Estudiantes_Activos:
    título: "Estudiantes Activos"
    valor_principal: "127"
    comparación: "+8 esta semana"
    desglose:
      - Activos: 127 (con créditos)
      - Inactivos: 45 (sin créditos)
      - Prospectos: 12
    color: morado
  
  Card_4_Disponibilidad_Citas:
    título: "Disponibilidad de Citas"
    representación_opción_A: "45/80 slots ocupados"
    representación_opción_B: "56% de ocupación"
    período: "Esta semana"
    breakdown:
      - Lunes: 12/15 (80%)
      - Martes: 10/15 (67%)
      - Miércoles: 8/15 (53%)
      - Jueves: 7/15 (47%)
      - Viernes: 6/15 (40%)
      - Sábado: 2/5 (40%)
    alerta: "⚠️ Lunes casi completo"
    color: amarillo
  
  Card_5_Pagos_Pendientes:
    título: "Pagos Pendientes"
    valor_principal: "5 pagos"
    monto_total: "$85,000"
    más_antiguo: "Hace 36 horas"
    botón_acción: "Revisar pagos"
    color: naranja

Visualización:
  - Cards en grid 2x3 (móvil: apiladas)
  - Números grandes y destacados
  - Colores semánticos (verde = bien, rojo = alerta)
  - Iconos representativos
  - Click en card → detalle completo
```

---

### 1.2 Revenue/Ingresos - Visualización Completa

**Decisión:** Sistema completo de visualización de ingresos con múltiples vistas.

**Implementación:**

```yaml
Revenue_Dashboard:
  
  Widget_Principal:
    título: "Ingresos"
    tabs:
      - "Resumen"
      - "Por Método"
      - "Por Paquete"
      - "Histórico"
  
  Tab_1_Resumen:
    
    Número_Grande:
      valor: "$380,000"
      período: "Octubre 2025"
      comparación: "+15% vs Septiembre"
      ícono: "↑" (verde)
    
    Meta_Mensual:
      target: "$500,000"
      actual: "$380,000"
      porcentaje: "76%"
      barra_progreso: "[████████████████░░░░] 76%"
      falta: "$120,000 para la meta"
      días_restantes: "8 días"
      proyección: "A este ritmo: $420K (84% de meta)"
    
    Mini_Stats:
      - Promedio por día: "$17,272"
      - Día con más ingresos: "Lunes 15 Oct ($28K)"
      - Total de transacciones: 156
  
  Tab_2_Por_Método:
    
    Gráfico_Torta:
      datos:
        - Efectivo: $150K (39%)
        - Mercado Pago: $180K (47%)
        - Transferencia: $50K (13%)
      colores: distintos por método
    
    Tabla_Detalle:
      columnas:
        - Método
        - Cantidad de transacciones
        - Monto total
        - Promedio por transacción
        - % del total
      
      filas:
        - Efectivo: 62 pagos, $150K, $2,419 prom, 39%
        - Mercado Pago: 78 pagos, $180K, $2,307 prom, 47%
        - Transferencia: 16 pagos, $50K, $3,125 prom, 13%
  
  Tab_3_Por_Paquete:
    
    Gráfico_Barras:
      eje_x: Nombre de paquete
      eje_y: Monto vendido
      barras:
        - Paquete 10 Clases: $200K (80 ventas)
        - Paquete 20 Clases: $150K (35 ventas)
        - Paquete 5 Clases: $30K (15 ventas)
    
    Insights:
      - "Paquete más vendido: 10 Clases"
      - "Ticket promedio: $2,923"
      - "Paquete 20 genera más revenue por venta ($4,285)"
  
  Tab_4_Histórico:
    
    Gráfico_Línea:
      período: "Últimos 12 meses"
      línea_1: "Ingresos mensuales"
      línea_2: "Meta mensual"
      línea_3: "Ingresos año anterior (comparación)"
      
      features:
        - Zoom por rango
        - Hover para ver detalle
        - Marcar eventos (ej: "Lanzamiento promo")
    
    Comparación_YoY:
      octubre_2024: "$320,000"
      octubre_2025: "$380,000"
      crecimiento: "+18.75%"
    
    Tendencia:
      - "Ingresos han crecido 12% en promedio mensual"
      - "Mejor mes: Julio ($450K)"
      - "Peor mes: Febrero ($280K)"
      - "Proyección fin de año: $4.8M"

Exportación:
  botones:
    - "Exportar PDF" (reporte visual completo)
    - "Exportar Excel" (datos crudos)
    - "Enviar por email" (programar envío)
  
  configuración_export:
    - Seleccionar período
    - Seleccionar secciones a incluir
    - Agregar notas/comentarios
```

---

### 1.3 Período de Tiempo - Configuración

**Decisión:** Selector de período con default SEMANAL.

**Opciones disponibles:**

```yaml
Time_Period_Selector:
  
  Ubicación: "Header del dashboard, prominente"
  
  Opciones_Preset:
    - "Hoy"
    - "Ayer"
    - "Esta Semana" ⭐ DEFAULT
    - "Semana Pasada"
    - "Este Mes"
    - "Mes Pasado"
    - "Este Año"
    - "Año Pasado"
    - "Últimos 7 días"
    - "Últimos 30 días"
    - "Últimos 90 días"
    - "Custom" (selector de rango)
  
  Comportamiento:
    - Al cambiar período: TODOS los widgets se actualizan
    - Guarda última selección por usuario
    - Animación suave en cambio
  
  Custom_Range:
    modal:
      - Fecha inicio (date picker)
      - Fecha fin (date picker)
      - Botón "Aplicar"
      - Validación: fecha_fin >= fecha_inicio

KPIs_Con_Período_Fijo:
  excepciones:
    - "Clases Hoy": Siempre muestra día actual
    - "Pagos Pendientes": Siempre acumulativo (sin filtro de período)
  
  nota: "La mayoría de KPIs respetan el período seleccionado"
```

---

### 1.4 Comparación con Período Anterior

**Decisión:** Sí, comparación automática habilitada para KPIs principales.

**Implementación:**

```yaml
Period_Comparison:
  
  Cálculo_Automático:
    
    Si_Período_Es_Semana:
      comparar_con: "Semana anterior"
      ejemplo: "Esta semana: $85K (+15% vs semana pasada: $74K)"
    
    Si_Período_Es_Mes:
      comparar_con: "Mes anterior"
      ejemplo: "Octubre: $380K (+15% vs Septiembre: $330K)"
    
    Si_Período_Es_Custom:
      comparar_con: "Período anterior de igual duración"
      ejemplo:
        - Período seleccionado: 15 Oct - 22 Oct (8 días)
        - Período comparación: 7 Oct - 14 Oct (8 días anteriores)
  
  Visualización:
    
    Badge_Positivo:
      ícono: "↑"
      color: verde
      ejemplo: "+15%"
    
    Badge_Negativo:
      ícono: "↓"
      color: rojo
      ejemplo: "-8%"
    
    Badge_Neutro:
      ícono: "→"
      color: gris
      ejemplo: "0%"
    
    Tooltip_Hover:
      muestra: "Valor anterior: $330K"
  
  KPIs_Con_Comparación:
    ✅ Ingresos
    ✅ Cantidad de clases
    ✅ Estudiantes activos (nuevos vs período anterior)
    ✅ Tasa de ocupación
    ✅ Pagos completados
    ❌ Pagos pendientes (no tiene sentido comparar)
    ❌ Alertas críticas (no tiene sentido comparar)
```

---

## 2. Reportes Financieros

### 2.1 Tipos de Reportes

**Decisión:** Sistema completo de reportes financieros.

**Lista de reportes MVP:**

```yaml
Financial_Reports:
  
  Reporte_1_Ingresos_Por_Período:
    descripción: "Ingresos totales en período seleccionado"
    filtros:
      - Rango de fechas
      - Por school (si multi-school)
    
    contenido:
      - Total de ingresos
      - Breakdown por día/semana/mes
      - Gráfico de tendencia
      - Comparación con período anterior
      - Promedio diario
      - Proyección (si es período en curso)
    
    formato_export: [PDF, Excel]
  
  Reporte_2_Ingresos_Por_Método:
    descripción: "Desglose de ingresos por método de pago"
    
    contenido:
      - Total por método (efectivo, MP, transferencia)
      - Cantidad de transacciones por método
      - Promedio por transacción
      - Porcentaje del total
      - Gráfico de torta
      - Tendencia por método (qué método crece más)
    
    formato_export: [PDF, Excel]
  
  Reporte_3_Ingresos_Por_Paquete:
    descripción: "Revenue por tipo de paquete vendido"
    
    contenido:
      - Cantidad vendida de cada paquete
      - Revenue por paquete
      - Ticket promedio por paquete
      - Paquete más popular
      - Gráfico de barras
    
    formato_export: [PDF, Excel]
  
  Reporte_4_Pagos_Completados_vs_Pendientes:
    descripción: "Estado de pagos"
    
    contenido:
      - Total de pagos pendientes (cantidad y monto)
      - Total de pagos completados
      - Tiempo promedio de confirmación
      - Pagos fallidos (cantidad y monto perdido)
      - Alertas de pagos muy antiguos (>48h)
    
    formato_export: [PDF, Excel]
  
  Reporte_5_Refunds:
    descripción: "Historial de devoluciones"
    
    contenido:
      - Total de devoluciones (cantidad y monto)
      - Motivos de devolución más comunes
      - Tasa de refund (% de ventas)
      - Estudiantes con más refunds
      - Impacto en revenue
    
    formato_export: [PDF, Excel]
  
  Reporte_6_Instructor_Payments:
    descripción: "Pagos a instructores"
    filtros:
      - Instructor específico o todos
      - Período
    
    contenido:
      - Total pagado a cada instructor
      - Breakdown de clases dictadas
      - Pagos pendientes
      - Comparación con períodos anteriores
      - Instructor que más clases dio
    
    formato_export: [PDF, Excel]
  
  Reporte_7_Proyección_Financiera:
    descripción: "Proyección de ingresos futuros"
    
    contenido:
      - Ingresos del mes hasta ahora
      - Días transcurridos del mes
      - Promedio diario actual
      - Proyección: "A este ritmo terminarás con $X"
      - Comparación con meta mensual
      - Gráfico de proyección lineal
      - Factores: "Últimos 3 meses tuvieron 15% más en última semana"
    
    formato_export: [PDF]
    
    nota: "Proyección simple (lineal). Post-MVP: ML models"

Acceso_Reportes:
  ubicación: "Menú → Reportes → Financieros"
  permisos:
    - Owner: ✅ Todos
    - Admin: ✅ Todos
    - Secretary: ⚠️ Configurable (Owner decide)
    - Instructor: ❌ NO
```

---

### 2.2 Exportación de Reportes

**Decisión:** Exportación en PDF y Excel con opciones avanzadas.

**Implementación:**

```yaml
Report_Export:
  
  Formatos:
    
    PDF:
      características:
        - Header con logo de escuela
        - Fecha de generación
        - Período del reporte
        - Gráficos incluidos (imágenes)
        - Tablas formateadas
        - Footer con numeración
      
      layout:
        - Portrait o Landscape (según reporte)
        - Tamaño: A4
        - Margins: estándar
      
      contenido:
        - Cover page (opcional)
        - Resumen ejecutivo
        - Gráficos visuales
        - Tablas de datos
        - Conclusiones/insights (si aplica)
      
      calidad: "Alta resolución para impresión"
    
    Excel:
      características:
        - Múltiples hojas (sheets)
        - Datos crudos exportados
        - Fórmulas incluidas
        - Formato condicional (colores)
        - Tablas dinámicas (opcional)
      
      hojas:
        - "Resumen": Métricas principales
        - "Datos": Data cruda
        - "Gráficos": Charts en Excel
      
      uso: "Para análisis adicional por Owner"
  
  Opciones_Export:
    
    Modal_Configuración:
      título: "Exportar Reporte"
      
      opciones:
        - Formato: [PDF, Excel]
        - Período: [selector de rango]
        - Incluir gráficos: checkbox (default: sí)
        - Incluir datos crudos: checkbox (default: sí en Excel)
        - Agregar notas: text area (opcional)
        - Enviar por email: checkbox + campo email
      
      botones:
        - "Cancelar"
        - "Exportar" (genera y descarga)
        - "Exportar y Enviar" (si email seleccionado)
  
  Envío_Automático:
    
    Configuración_Opcional:
      ubicación: "Settings → Reportes Automáticos"
      
      opciones:
        - Reporte a enviar: dropdown
        - Frecuencia: [Diario, Semanal, Mensual]
        - Día/Hora de envío
        - Email destinatario(s)
        - Formato: PDF o Excel
      
      ejemplo:
        "Enviar Reporte de Ingresos Mensual
        cada 1er día del mes a las 9:00 AM
        a owner@escuela.com en formato PDF"
    
    Envío:
      - Email automático con reporte adjunto
      - Asunto: "Reporte Mensual - Octubre 2025"
      - Cuerpo: Resumen de métricas clave
      - Attachment: PDF o Excel

Naming_Convention:
  formato: "{Tipo_Reporte}_{Escuela}_{Período}.{ext}"
  ejemplos:
    - "Ingresos_MiEscuela_Oct2025.pdf"
    - "Pagos_MiEscuela_Semana42.xlsx"
```

---

## 3. Reportes Operacionales

### 3.1 Utilización de Instructores

**Decisión:** Métricas completas de performance de instructores.

**Implementación:**

```yaml
Instructor_Utilization_Report:
  
  Ubicación: "Reportes → Operacionales → Instructores"
  
  Filtros:
    - Instructor: [Todos, Individual]
    - Período: selector de rango
    - Tipo de clase: [Todas, Prácticas, Teóricas]
  
  Métricas_Por_Instructor:
    
    Tabla_Principal:
      columnas:
        - Nombre del instructor
        - Horas trabajadas
        - Cantidad de clases dictadas
        - Tasa de cancelación (%)
        - Revenue generado
        - Promedio por clase
        - Rating promedio (si existe)
      
      ordenamiento:
        - Por cualquier columna (ascendente/descendente)
        - Default: Por horas trabajadas (mayor a menor)
      
      ejemplo_fila:
        - Juan Pérez
        - 120 horas
        - 60 clases
        - 5% cancelación
        - $180,000 generado
        - $3,000 por clase
        - 4.8/5 ⭐
    
    Horas_Trabajadas:
      cálculo: "Suma de duración de todas las clases completadas"
      incluye:
        ✅ Clases completadas
        ✅ Estudiante no-show (instructor llegó)
        ❌ Clases canceladas por instructor
        ❌ Clases canceladas por estudiante a tiempo
      
      visualización:
        - Total en período
        - Promedio por día laborable
        - Gráfico de barras comparando instructores
    
    Clases_Dictadas:
      tipos:
        - Total
        - Prácticas
        - Teóricas
      
      breakdown_semanal:
        - Gráfico de línea: clases por semana
        - Identificar picos y valles
    
    Tasa_Cancelación:
      cálculo: |
        (Clases canceladas por instructor / Total clases agendadas) * 100
      
      interpretación:
        - < 5%: Excelente (verde)
        - 5-10%: Normal (amarillo)
        - > 10%: Preocupante (rojo)
      
      detalle:
        - Motivos de cancelación (si están registrados)
        - Fechas de las cancelaciones
    
    Revenue_Generado:
      cálculo: "Suma de todos los pagos de estudiantes por clases con este instructor"
      
      nota: |
        "Solo aplicable si instructor tiene comisión por clase.
        Si tiene sueldo fijo, este campo muestra el valor
        generado por sus clases para comparación."
      
      breakdown:
        - Por mes
        - Por tipo de clase
        - Comparación con otros instructores
    
    Horarios_Pico:
      descripción: "Cuándo trabaja más este instructor"
      
      visualización:
        - Heatmap: días de semana vs horas del día
        - Identificar slots más ocupados
        - Ejemplo: "Juan trabaja más los Lunes 16-18h"
      
      utilidad: "Optimizar scheduling"
  
  Gráficos_Comparativos:
    
    Gráfico_1_Barras_Apiladas:
      título: "Clases por Instructor"
      eje_x: Instructores
      eje_y: Cantidad de clases
      barras:
        - Completadas (verde)
        - Canceladas por instructor (rojo)
        - Canceladas por estudiante (amarillo)
    
    Gráfico_2_Línea:
      título: "Horas Trabajadas - Tendencia Mensual"
      líneas: Una por instructor
      eje_x: Meses
      eje_y: Horas
    
    Gráfico_3_Torta:
      título: "Distribución de Clases entre Instructores"
      mostrar: % de clases totales por instructor
  
  Insights_Automáticos:
    
    ejemplos:
      - "Juan Pérez es el instructor más activo (35% de clases)"
      - "María García tiene la menor tasa de cancelación (2%)"
      - "Pedro López genera más revenue por hora ($1,500)"
      - "Los Lunes 16-18h son el horario más solicitado"
      - "Ana Martínez tiene 15% más clases este mes vs anterior"
  
  Exportación:
    formatos: [PDF, Excel]
    incluye:
      - Todas las tablas
      - Todos los gráficos
      - Insights automáticos

Permisos:
  Owner: ✅ Ve todos los instructores
  Admin: ✅ Ve todos los instructores
  Secretary: ⚠️ Configurable
  Instructor: ✅ Solo ve sus propias métricas
```

---

### 3.2 Utilización de Vehículos

**Decisión:** Métricas de clases por vehículo y downtime.

**Implementación:**

```yaml
Vehicle_Utilization_Report:
  
  Ubicación: "Reportes → Operacionales → Vehículos"
  
  Filtros:
    - Vehículo: [Todos, Individual]
    - Período: selector de rango
  
  Tabla_Principal:
    
    columnas:
      - Vehículo (Marca/Modelo/Patente)
      - Cantidad de clases
      - Horas de uso
      - Downtime (horas fuera de servicio)
      - % de disponibilidad
      - Último mantenimiento
      - Próximo mantenimiento
    
    ejemplo_fila:
      - Toyota Corolla ABC123
      - 80 clases
      - 120 horas
      - 24 horas downtime
      - 83% disponibilidad
      - 15/10/2025
      - 15/11/2025
  
  Clases_Por_Vehículo:
    
    métricas:
      - Total de clases en período
      - Promedio de clases por día
      - Comparación con otros vehículos
      - Tendencia (creciente/decreciente)
    
    gráfico:
      tipo: Barras horizontales
      ordenamiento: Por cantidad de clases (mayor a menor)
      colores: Diferenciados por tipo de transmisión
  
  Downtime_Tiempo_Fuera_Servicio:
    
    definición: |
      "Tiempo en que vehículo NO estuvo disponible para clases
      debido a mantenimiento, reparación, o bloqueo manual"
    
    cálculo:
      - Suma de horas en estado 'in_maintenance'
      - Suma de horas en estado 'out_of_service'
      - Suma de horas en estado 'blocked'
    
    breakdown:
      tabla:
        columnas:
          - Fecha inicio
          - Fecha fin
          - Duración (horas)
          - Motivo (Mantenimiento/Reparación/Otro)
          - Costo (si aplicable)
        
        ejemplo:
          - 01/10/2025 | 03/10/2025 | 48h | Service 10K km | $15,000
          - 15/10/2025 | 15/10/2025 | 4h | Reparación frenos | $8,000
    
    impacto:
      - "24 horas de downtime = 24 clases potencialmente perdidas"
      - "Costo de oportunidad: $72,000" (si clase = $3,000)
      - "Costo real mantenimiento: $23,000"
      - "Total pérdida: $95,000"
  
  Disponibilidad:
    
    cálculo: |
      % = ((Horas totales en período - Horas downtime) / Horas totales) * 100
    
    ejemplo:
      - Período: 30 días = 720 horas
      - Downtime: 24 horas
      - Disponibilidad: 696 / 720 = 96.67%
    
    interpretación:
      - > 95%: Excelente (verde)
      - 85-95%: Normal (amarillo)
      - < 85%: Problemático (rojo)
    
    alerta:
      if disponibilidad < 85%:
        mostrar: "⚠️ Este vehículo tiene baja disponibilidad. Revisar."
  
  Mantenimientos:
    
    historial:
      - Último mantenimiento (fecha, tipo, costo)
      - Próximo mantenimiento (fecha estimada)
      - Frecuencia de mantenimientos
    
    alertas:
      - "Próximo service en 500 km"
      - "VTV vence en 15 días"
      - "Seguro vence en 30 días"
  
  Insights:
    ejemplos:
      - "Toyota Corolla ABC123 es el más usado (30% de clases)"
      - "Ford Focus XYZ789 tiene más downtime (15% del período)"
      - "Promedio de downtime: 3% del tiempo total"
      - "Costo total de mantenimiento este mes: $45,000"
  
  Exportación:
    formatos: [PDF, Excel]
```

---

### 3.3 Performance de Estudiantes

**Decisión:** Todos los reportes mencionados de performance.

**Implementación:**

```yaml
Student_Performance_Reports:
  
  Reporte_1_Tasa_Asistencia:
    
    métrica_global:
      cálculo: "(Clases completadas / Clases agendadas) * 100"
      ejemplo: "850 completadas / 900 agendadas = 94.4%"
    
    tabla_por_estudiante:
      columnas:
        - Nombre
        - Clases agendadas
        - Clases completadas
        - No-shows
        - Tasa de asistencia (%)
        - Ranking
      
      ordenamiento: Por tasa (menor a mayor, ver problemáticos)
      
      ejemplo:
        - Juan Pérez | 20 | 19 | 1 | 95% | #15
        - María López | 15 | 10 | 5 | 67% | #98 ⚠️
    
    gráfico:
      tipo: Histograma
      eje_x: Rangos de tasa (0-50%, 50-70%, 70-85%, 85-95%, 95-100%)
      eje_y: Cantidad de estudiantes
    
    insights:
      - "94% de estudiantes tienen >85% asistencia"
      - "6% tienen tasa preocupante (<85%)"
      - "Promedio general: 94.4%"
  
  Reporte_2_Estudiantes_Cancelan_Más:
    
    descripción: "Identificar estudiantes problemáticos"
    
    tabla:
      columnas:
        - Nombre
        - Total cancelaciones
        - Cancelaciones dentro ventana (devuelve crédito)
        - Cancelaciones fuera ventana (pierde crédito)
        - No-shows
        - Tasa de cancelación (%)
      
      filtro: "Mostrar solo estudiantes con >X cancelaciones"
      ordenamiento: Por total cancelaciones (mayor a menor)
      
      alerta_visual:
        if cancelaciones > 5 en mes:
          color: rojo
          ícono: "⚠️"
          acción_sugerida: "Contactar estudiante"
    
    insights:
      - "5 estudiantes con >8 cancelaciones este mes"
      - "Tasa promedio de cancelación: 7%"
      - "Razón #1 de cancelación: 'Trabajo'"
  
  Reporte_3_Tiempo_Hasta_Graduación:
    
    descripción: "Cuánto tardan estudiantes en completar curso"
    
    métricas:
      - Promedio de tiempo: "4.5 meses"
      - Promedio de clases hasta graduación: "28 clases"
      - Más rápido: "2 meses (15 clases)" - Juan Pérez
      - Más lento: "12 meses (45 clases)" - María López
    
    histograma:
      eje_x: Meses hasta graduación (1-2, 2-3, 3-4, 4-6, 6-12, >12)
      eje_y: Cantidad de estudiantes
    
    factores:
      - "Estudiantes que toman 2+ clases/semana: 3 meses promedio"
      - "Estudiantes que toman 1 clase/semana: 6 meses promedio"
      - "Cancelaciones frecuentes aumentan tiempo en 40%"
  
  Reporte_4_Tasa_Conversión:
    
    descripción: "De prospecto a pago"
    
    funnel:
      etapa_1: "Prospectos (clase de prueba)" - 100 estudiantes
      etapa_2: "Compraron paquete" - 75 estudiantes (75% conversión)
      etapa_3: "Completaron >5 clases" - 65 estudiantes (87% retención)
      etapa_4: "Graduados" - 50 estudiantes (77% finalización)
    
    métricas_clave:
      - Tasa de conversión prospecto→pago: 75%
      - Tasa de retención: 87%
      - Tasa de finalización: 77%
    
    insights:
      - "25% de prospectos no convierten (no compran después de prueba)"
      - "13% abandonan después de primeras clases"
      - "23% no completan el curso después de empezar"
    
    acciones_sugeridas:
      - "Mejorar seguimiento post-clase de prueba"
      - "Investigar por qué abandonan después de 5 clases"
      - "Incentivar finalización del curso"

Permisos:
  Owner: ✅ Todos los reportes
  Admin: ✅ Todos los reportes
  Secretary: ⚠️ Configurable
```

---

### 3.4 Horarios Pico y Scheduling

**Decisión:** Análisis de horarios pico para optimización.

**Implementación:**

```yaml
Peak_Hours_Report:
  
  Ubicación: "Reportes → Operacionales → Horarios"
  
  Heatmap_Principal:
    
    ejes:
      eje_y: Días de la semana (Lun-Dom)
      eje_x: Horas del día (8:00-20:00)
    
    colores:
      - Blanco: Sin clases (0%)
      - Amarillo claro: Baja ocupación (1-30%)
      - Naranja: Ocupación media (31-70%)
      - Rojo: Alta ocupación (71-100%)
    
    interactividad:
      hover: "Mostrar cantidad exacta de clases en ese slot"
      click: "Ver detalle de clases en ese horario"
    
    ejemplo_visual:
      ```
           8  9  10 11 12 13 14 15 16 17 18 19 20
      Lun  □  □  ■  ■  □  □  ■  ■  ■  ■  □  □  □
      Mar  □  □  ■  ■  □  □  ■  ■  ■  □  □  □  □
      Mié  □  □  ■  ■  □  □  ■  ■  ■  ■  ■  □  □
      Jue  □  □  ■  □  □  □  ■  ■  ■  ■  □  □  □
      Vie  □  □  ■  ■  □  □  □  ■  ■  □  □  □  □
      Sáb  □  ■  ■  ■  □  □  □  □  □  □  □  □  □
      Dom  □  □  □  □  □  □  □  □  □  □  □  □  □
      ```
  
  Horarios_Más_Solicitados:
    
    top_5:
      1. "Lunes 16:00-18:00" - 45 clases en período
      2. "Miércoles 17:00-19:00" - 42 clases
      3. "Martes 16:00-18:00" - 38 clases
      4. "Jueves 18:00-20:00" - 35 clases
      5. "Sábado 09:00-11:00" - 30 clases
    
    interpretación:
      - "Horarios pico: tarde-noche entre semana (16-20h)"
      - "Sábados por la mañana también popular"
      - "Domingos y horarios matutinos tienen baja demanda"
  
  Horarios_Con_Baja_Demanda:
    
    slots_disponibles:
      - "Lunes 08:00-10:00" - 0% ocupación
      - "Martes 13:00-15:00" - 10% ocupación
      - "Viernes 19:00-21:00" - 15% ocupación
      - "Domingos" - Cerrado
    
    oportunidad:
      - "Promocionar estos horarios con descuento"
      - "Ajustar disponibilidad de instructores"
      - "Considerar cerrar slots sin demanda"
  
  Análisis_Por_Instructor:
    
    pregunta: "¿Qué instructores trabajan en horarios pico?"
    
    tabla:
      columnas:
        - Instructor
        - % clases en horario pico
        - % clases en horario normal
        - % clases en horario bajo
      
      ejemplo:
        - Juan Pérez | 60% pico | 30% normal | 10% bajo
        - María López | 40% pico | 40% normal | 20% bajo
    
    insight:
      "Juan Pérez cubre más horarios pico (valiosos).
      María López tiene más disponibilidad en horarios flexibles."
  
  Recomendaciones:
    
    basadas_en_data:
      - "Contratar instructor adicional para Lunes-Miércoles 16-20h"
      - "Reducir slots en Martes 13-15h (sin demanda)"
      - "Promoción 'Mañanas de descuento' para optimizar 8-12h"
      - "Considerar abrir Domingos si hay demanda latente"
  
  Exportación:
    formatos: [PDF con heatmap, Excel con datos]
```

---

### 3.5 Cancelaciones - Análisis

**Decisión:** Reporte de cantidad de cancelaciones por período.

**Implementación:**

```yaml
Cancellation_Report:
  
  Ubicación: "Reportes → Operacionales → Cancelaciones"
  
  Métricas_Generales:
    
    card_1:
      título: "Total Cancelaciones"
      valor: "85 clases"
      comparación: "+12% vs mes anterior"
      porcentaje_total: "9.4% de clases agendadas"
    
    card_2:
      título: "Por Estudiante"
      valor: "52 cancelaciones"
      porcentaje: "61%"
    
    card_3:
      título: "Por Instructor"
      valor: "25 cancelaciones"
      porcentaje: "29%"
    
    card_4:
      título: "Por Escuela"
      valor: "8 cancelaciones"
      porcentaje: "9%"
      razones: "Mantenimiento, clima, etc"
  
  Timeline_Cancelaciones:
    
    gráfico_línea:
      eje_x: Días/Semanas del período
      eje_y: Cantidad de cancelaciones
      líneas:
        - Total
        - Por estudiante
        - Por instructor
      
      marcar_eventos:
        - "Día con más cancelaciones: 15/10 (12 cancelaciones)"
        - Posible razón: "Lluvia intensa ese día"
  
  Breakdown_Por_Ventana:
    
    tabla:
      categorías:
        - "Cancelada >24h": 45 (53%) - ✅ Devolución completa
        - "Cancelada 12-24h": 15 (18%) - ⚠️ Devolución 50%
        - "Cancelada <12h": 18 (21%) - ❌ Sin devolución
        - "No-show": 7 (8%) - ❌ Crédito perdido
      
      total: 85 cancelaciones
    
    impacto_financiero:
      créditos_devueltos_completo: 45 créditos
      créditos_devueltos_parcial: 7.5 créditos (15 * 0.5)
      créditos_perdidos: 25 créditos (18 + 7)
      
      pérdida_potencial: "$75,000" (25 clases * $3,000)
  
  Top_Razones:
    
    si_razón_registrada:
      tabla:
        columnas:
          - Razón
          - Cantidad
          - %
        
        filas:
          - "Trabajo/compromiso laboral" | 28 | 33%
          - "Enfermedad" | 15 | 18%
          - "Clima/lluvia" | 12 | 14%
          - "Sin razón especificada" | 18 | 21%
          - "Cambio de planes" | 8 | 9%
          - "Emergencia familiar" | 4 | 5%
    
    si_no_hay_razones:
      mostrar: "No se registraron razones de cancelación"
      sugerencia: "Agregar campo obligatorio de razón en cancelaciones"
  
  Exportación:
    formatos: [PDF, Excel]
```

---

## 4. Configuración de Escuela

### 4.1 Información Básica

**Decisión:** Toda la información básica es configurable.

**Implementación:**

```yaml
School_Basic_Settings:
  
  Ubicación: "Settings → Información de la Escuela"
  
  Formulario:
    
    Sección_Identidad:
      
      nombre:
        label: "Nombre de la Escuela"
        tipo: text
        obligatorio: true
        max_length: 100
        ejemplo: "Autoescuela San Martín"
      
      logo:
        label: "Logo"
        tipo: file_upload
        formatos: [jpg, png, svg]
        max_size: 2MB
        dimensiones_recomendadas: "500x500px"
        preview: "Muestra logo actual"
        botón: "Cambiar logo"
      
      favicon:
        label: "Favicon"
        tipo: file_upload
        formatos: [ico, png]
        dimensiones: "32x32px o 64x64px"
        uso: "Ícono en pestaña del navegador"
    
    Sección_Ubicación:
      
      dirección_principal:
        label: "Dirección Principal"
        tipo: text
        obligatorio: true
        placeholder: "Av. San Martín 123"
        google_maps_integration: true
        botón: "Ver en mapa"
      
      ciudad:
        tipo: text
        obligatorio: true
      
      provincia:
        tipo: dropdown
        opciones: [Provincias de Argentina]
      
      código_postal:
        tipo: text
        max_length: 10
      
      múltiples_sedes:
        nota: "Por ahora solo 1 sede por School (ver 4.2)"
    
    Sección_Contacto:
      
      teléfono_principal:
        label: "Teléfono de Contacto"
        tipo: text
        formato: "+54 9 11 1234-5678"
        obligatorio: true
        nota: "Usado en recibos, emails, WhatsApp"
      
      teléfono_secundario:
        label: "Teléfono Alternativo"
        tipo: text
        obligatorio: false
      
      email_contacto:
        label: "Email de Contacto"
        tipo: email
        obligatorio: true
        ejemplo: "info@escuela.com"
        nota: "Email público para consultas"
      
      email_admin:
        label: "Email Administrativo"
        tipo: email
        obligatorio: true
        ejemplo: "admin@escuela.com"
        nota: "Para notificaciones del sistema"
      
      sitio_web:
        label: "Sitio Web"
        tipo: url
        obligatorio: false
        placeholder: "https://www.escuela.com"
    
    Sección_Horarios:
      
      horario_atención:
        tipo: "Selector de horarios por día"
        
        por_cada_día:
          - día: dropdown [Lunes-Domingo]
          - abierto: checkbox
          - desde: time picker
          - hasta: time picker
          - botón: "Agregar horario" (para split shifts)
        
        ejemplo:
          - Lunes: 09:00-13:00, 15:00-20:00
          - Martes: 09:00-13:00, 15:00-20:00
          - Sábado: 09:00-14:00
          - Domingo: Cerrado
        
        quick_presets:
          - "Lun-Vie 9-18"
          - "Lun-Vie 9-20, Sáb 9-14"
          - "Copiar de otro día"
    
    Sección_Redes_Sociales:
      
      facebook:
        label: "Facebook"
        tipo: url
        placeholder: "https://facebook.com/escuela"
      
      instagram:
        label: "Instagram"
        tipo: url
        placeholder: "https://instagram.com/escuela"
      
      google_maps:
        label: "Google Maps Place ID"
        tipo: text
        ayuda: "Para integración de reseñas"
        link: "¿Cómo obtener Place ID?"
  
  Botones_Acción:
    - "Guardar Cambios"
    - "Cancelar"
    - "Vista Previa" (cómo se verá en portal estudiantes)
  
  Validaciones:
    - Campos obligatorios deben estar completos
    - Formato de email válido
    - Formato de teléfono válido (Argentina)
    - URL válidas
    - Logo tamaño < 2MB
  
  Confirmación:
    mensaje: "Cambios guardados exitosamente ✓"
    impacto: "Los cambios se reflejan inmediatamente en el portal"

Permisos:
  Owner: ✅ Puede editar todo
  Admin: ⚠️ Configurable (Owner decide)
  Secretary: ❌ Solo lectura
```

---

### 4.2 Múltiples Sedes

**Decisión:** Opción C - Por ahora 1 sede por School, múltiples sedes POST-MVP.

**Justificación:**

```yaml
MVP_Decision:
  
  Implementación_Actual:
    - 1 School = 1 Sede física
    - Dirección única configurada en Settings
    - Si escuela tiene 2 sedes → crear 2 Schools separadas
  
  Razones_Posponer:
    complejidad:
      - "Relaciones DB más complejas"
      - "Scheduling se complica (instructores en qué sede)"
      - "Vehículos asignados a qué sede"
      - "Reportes por sede adicionales"
    
    MVP_scope:
      - "Mayoría de clientes iniciales tendrán 1 sede"
      - "Validar producto primero con modelo simple"
      - "Agregar complejidad después de tener usuarios"
    
    workaround:
      - "Si escuela tiene 2 sedes, crear 2 accounts"
      - "Ejemplo: 'Escuela Norte' y 'Escuela Sur'"
      - "Owner puede gestionar ambas (mismo login con multi-school)"

Post_MVP_Design:
  
  timeline: "Sprint 8-12 post-MVP"
  
  arquitectura:
    
    database:
      new_table: branches
        - id: uuid
        - school_id: uuid
        - name: string (ej: "Sede Centro", "Sede Norte")
        - address: string
        - phone: string
        - is_primary: boolean
        - created_at: timestamp
      
      foreign_keys:
        - instructors.branch_id (nullable)
        - vehicles.branch_id (nullable)
        - classes.branch_id
    
    UI_changes:
      - Selector de sede en scheduling
      - Filtro de sede en reportes
      - Gestión de sedes en Settings
      - Asignación de recursos a sedes
    
    scheduling_logic:
      - Instructor solo puede dar clases en su sede asignada
      - Vehículos solo disponibles en sede asignada
      - Estudiante puede tomar clases en cualquier sede (flexible)
    
    reportes:
      - "Ver por sede" o "Ver consolidado"
      - Comparación entre sedes
      - KPIs por sede

Migration_Path:
  cuando_llegue_el_momento:
    1. Crear tabla branches
    2. Migrar schools existentes → crear 1 branch por school
    3. Actualizar FK en todas las tablas
    4. UI para gestionar múltiples sedes
    5. Testing extensivo
    6. Rollout gradual
```

---

### 4.3 Políticas de Negocio - Scheduling

**Decisión:** Todas las políticas mencionadas son configurables.

**Implementación:**

```yaml
Scheduling_Policies:
  
  Ubicación: "Settings → Políticas → Scheduling"
  
  Anticipación_Mínima:
    
    label: "Ventana de Anticipación Mínima"
    descripción: "Cuánto tiempo antes debe agendar el estudiante"
    
    opciones:
      durante_horario_oficina:
        label: "Durante horario de oficina"
        tipo: number
        unidad: "horas"
        default: 6
        min: 1
        max: 48
        ejemplo: "6 horas"
        
        explicación: |
          "Si estudiante agenda dentro del horario de atención,
          puede agendar clase con X horas de anticipación"
      
      fuera_horario_oficina:
        label: "Fuera de horario de oficina"
        tipo: number
        unidad: "horas"
        default: 12
        min: 6
        max: 72
        
        explicación: |
          "Si estudiante agenda fuera del horario de atención,
          necesita más anticipación"
  
  Buffer_Entre_Clases:
    
    label: "Tiempo de buffer entre clases"
    descripción: "Tiempo mínimo entre fin de una clase e inicio de otra"
    
    tipo: number
    unidad: "minutos"
    default: 15
    opciones: [0, 10, 15, 20, 30, 45, 60]
    
    aplicación:
      - "Buffer por instructor (traslado, descanso)"
      - "Buffer por vehículo (limpieza, inspección)"
    
    ejemplo:
      clase_1: "10:00-11:00"
      buffer: "15 minutos"
      clase_2: "11:15-12:15" (más temprano no se puede)
  
  Límite_Clases_Simultáneas:
    
    label: "Límite de clases agendadas por estudiante"
    descripción: "Máximo de clases futuras que un estudiante puede tener agendadas"
    
    tipo: number
    default: 3
    min: 1
    max: 10
    
    ejemplo:
      if estudiante.upcoming_classes >= 3:
        bloquear_agendamiento: true
        mensaje: "Ya tienes 3 clases agendadas. Completa alguna primero."
  
  Clases_Consecutivas:
    
    label: "Clases consecutivas permitidas por estudiante"
    descripción: "Máximo de clases seguidas que un estudiante puede tomar"
    
    tipo: number
    default: 2
    opciones: [1, 2, 3, 4]
    
    validación:
      if estudiante_intenta_agendar_clase:
        check: "¿Hay otra clase inmediatamente antes o después?"
        if count_consecutive >= 2:
          bloquear: true
          mensaje: "Solo puedes agendar hasta 2 clases consecutivas"
    
    ejemplo:
      permitido:
        - Clase 1: 10:00-11:00
        - Clase 2: 11:00-12:00 ✓
        - Clase 3: 12:00-13:00 ✗ (3ra consecutiva, bloqueada)
      
      permitido_con_gap:
        - Clase 1: 10:00-11:00
        - [Gap de 1 hora]
        - Clase 2: 12:00-13:00 ✓
        - Clase 3: 13:00-14:00 ✓ (contador reinicia)
  
  Horario_Operación:
    
    label: "Horario de clases"
    descripción: "Horarios en que se pueden dictar clases"
    
    por_día:
      configuración:
        - día: dropdown
        - activo: checkbox
        - desde: time picker
        - hasta: time picker
      
      ejemplo:
        - Lunes: 08:00-20:00 ✓
        - Martes: 08:00-20:00 ✓
        - Sábado: 09:00-14:00 ✓
        - Domingo: Cerrado ✗
    
    validación:
      - No puede agendar fuera de estos horarios
      - Sistema sugiere slots dentro de horario
  
  Días_No_Laborables:
    
    label: "Días no laborables"
    descripción: "Feriados y días especiales sin clases"
    
    import_automático:
      provider: "API de feriados Argentina"
      url: "https://nolaborables.com.ar/api/"
      frecuencia: "Anual (al inicio de año)"
      
      acción:
        - Sistema importa feriados nacionales
        - Owner puede revisar y modificar
        - Owner puede agregar días custom
    
    gestión_manual:
      tabla:
        columnas:
          - Fecha
          - Nombre (ej: "Día de la Independencia")
          - Tipo (Feriado nacional / Día escuela)
          - Acciones (Editar, Eliminar)
        
        botón: "Agregar día no laborable"
      
      modal_agregar:
        - Fecha: date picker
        - Nombre: text
        - Tipo: dropdown
        - Repetir anualmente: checkbox
    
    impacto:
      - Sistema no muestra estos días en calendario
      - Bloquea agendamiento
      - Alerta si hay clases ya agendadas para esos días

Cancelación_Políticas:
  ver_sección: "4.4 Políticas de Cancelación"

Créditos_Políticas:
  ver_sección: "4.5 Políticas de Créditos"

Botones:
  - "Guardar Cambios"
  - "Restaurar Defaults"
  - "Vista Previa de Impacto"

Permisos:
  Owner: ✅ Puede modificar todas las políticas
  Admin: ⚠️ Configurable
  Secretary: ❌ Solo lectura
```

---

### 4.4 Políticas de Cancelación

**Decisión:** Políticas de cancelación configurables.

**Implementación:**

```yaml
Cancellation_Policies:
  
  Ubicación: "Settings → Políticas → Cancelación"
  
  Ventanas_Cancelación:
    
    descripción: "Define cuándo y cuánto se devuelve"
    
    ventana_1:
      label: "Cancelación con anticipación"
      desde: number (horas)
      default: 24
      devolución: dropdown
        opciones:
          - "100% del crédito"
          - "50% del crédito"
          - "0% (crédito perdido)"
        default: "100% del crédito"
      
      ejemplo:
        ">= 24 horas antes: Devolución completa"
    
    ventana_2:
      label: "Cancelación tarde"
      desde: number (horas)
      hasta: number (horas)
      default_desde: 12
      default_hasta: 24
      devolución: dropdown
        default: "50% del crédito"
      
      ejemplo:
        "12-24 horas antes: Devolución 50%"
    
    ventana_3:
      label: "Cancelación muy tarde"
      desde: 0
      hasta: number (horas)
      default_hasta: 12
      devolución: dropdown
        default: "0% (crédito perdido)"
      
      ejemplo:
        "< 12 horas antes: Sin devolución"
    
    no_show:
      label: "No-Show (no apareció)"
      devolución: "0% (crédito perdido)"
      fijo: true
      nota: "Esta política no se puede cambiar"
  
  Límite_Cancelaciones:
    
    label: "Límite de cancelaciones por mes"
    tipo: number
    default: null (sin límite en MVP)
    min: 0
    max: 20
    
    comportamiento:
      if cancelaciones_mes >= límite:
        bloquear_más_cancelaciones: true
        mensaje: "Alcanzaste el límite de cancelaciones este mes"
        excepción: "Staff puede cancelar manualmente"
    
    nota: "Dejar en blanco = sin límite (MVP)"
  
  Penalización_Progresiva:
    
    label: "Penalización progresiva"
    descripción: "A más cancelaciones, más penalización"
    
    habilitado: checkbox (default: false en MVP)
    
    reglas:
      si_habilitado:
        - 1-2 cancelaciones: política normal
        - 3-5 cancelaciones: -10% adicional en devolución
        - 6+ cancelaciones: -25% adicional
      
      ejemplo:
        cancelación_3: "24h antes = 90% devolución (en vez de 100%)"
        cancelación_7: "24h antes = 75% devolución"
    
    nota: "Feature POST-MVP"
  
  Razón_Obligatoria:
    
    label: "Razón de cancelación obligatoria"
    checkbox: true/false
    default: false
    
    si_true:
      - Campo "Razón" obligatorio en modal de cancelación
      - Opciones predefinidas + "Otro"
      - Usado para analytics
  
  Notificaciones:
    
    label: "Notificar a instructor en cancelación"
    checkbox: true/false
    default: true
    
    canales:
      - Email: checkbox (default: true)
      - WhatsApp: checkbox (default: true)

Botones:
  - "Guardar Políticas"
  - "Restaurar Defaults"
  - "Simular Escenario" (calculadora de devolución)

Permisos:
  Owner: ✅ Puede modificar
  Admin: ⚠️ Configurable
```

---

### 4.5 Políticas de Créditos

**Decisión:** Configuración de validez y alertas.

**Implementación:**

```yaml
Credit_Policies:
  
  Ubicación: "Settings → Políticas → Créditos"
  
  Validez_Paquetes:
    
    label: "Validez de paquetes (días)"
    descripción: "Cuántos días son válidos los créditos desde la compra"
    
    configuración:
      tipo: "Por paquete"
      
      tabla:
        columnas:
          - Paquete
          - Validez (días)
          - Editar
        
        ejemplo:
          - Paquete 10 Clases | 90 días | ✏️
          - Paquete 20 Clases | 120 días | ✏️
          - Paquete 5 Clases | 60 días | ✏️
      
      modal_editar:
        - Nombre paquete: (readonly)
        - Validez: number input
        - Unidad: dropdown [días, meses]
        - Botón "Guardar"
    
    nota: "Paquetes ya vendidos NO se ven afectados por cambios"
  
  Créditos_Congelados:
    
    label: "Validez de créditos congelados"
    descripción: "Cuánto tiempo pueden estar congelados antes de vencer"
    
    tipo: number
    unidad: "días"
    default: 180
    min: 30
    max: 365
    
    explicación: |
      "Créditos congelados (por cancelación sin slots)
      pueden usarse después del vencimiento del paquete,
      pero tienen su propio límite de validez"
  
  Alertas_Vencimiento:
    
    label: "Alertas de vencimiento"
    descripción: "Cuándo notificar a estudiantes sobre créditos por vencer"
    
    múltiples_alertas:
      
      alerta_1:
        label: "Primera alerta"
        días_antes: number
        default: 7
        canales:
          - Email: checkbox (default: true)
          - WhatsApp: checkbox (default: true)
          - In-app: checkbox (default: true, readonly)
      
      alerta_2:
        label: "Segunda alerta"
        días_antes: number
        default: 3
        canales: (igual que alerta_1)
      
      alerta_3:
        label: "Alerta final"
        días_antes: number
        default: 1
        canales: (igual que alerta_1)
      
      alerta_vencimiento:
        label: "Día de vencimiento"
        fixed: true
        canales:
          - Email: ✓
          - WhatsApp: ✓
    
    botón: "Agregar alerta" (hasta 5 alertas)
  
  Créditos_Promocionales:
    
    label: "Validez de créditos promocionales"
    descripción: "Cuánto tiempo son válidos los créditos gratis otorgados"
    
    tipo: dropdown
      opciones:
        - "Sin vencimiento"
        - "30 días"
        - "60 días"
        - "90 días"
        - "Igual que paquete pagado"
      default: "90 días"
  
  Créditos_Bajos:
    
    label: "Alerta de créditos bajos"
    descripción: "Notificar cuando estudiante tiene pocos créditos"
    
    threshold: number
    default: 2
    explicación: "Alertar cuando créditos <= X"
    
    frecuencia: dropdown
      opciones:
        - "Una sola vez"
        - "Cada vez que baja del threshold"
      default: "Una sola vez"
    
    canales:
      - Email: checkbox
      - In-app: checkbox

Botones:
  - "Guardar Configuración"
  - "Restaurar Defaults"

Permisos:
  Owner: ✅ Puede modificar
  Admin: ⚠️ Configurable
```

---

### 4.6 Gestión de Paquetes

**Decisión:** CRUD completo de paquetes.

**Implementación:**

```yaml
Package_Management:
  
  Ubicación: "Settings → Paquetes"
  
  Lista_Paquetes:
    
    tabla:
      columnas:
        - Nombre
        - Cantidad de clases
        - Precio
        - Validez (días)
        - Estado (Activo/Inactivo)
        - Destacado
        - Acciones
      
      ejemplo:
        - Paquete 10 Clases | 10 | $50,000 | 90 | Activo ✓ | ⭐ | ✏️ 🗑️
        - Paquete 20 Clases | 20 | $90,000 | 120 | Activo ✓ | - | ✏️ 🗑️
      
      ordenamiento: "Arrastrar y soltar para cambiar orden"
    
    botón: "+ Crear Nuevo Paquete"
  
  Crear_Editar_Paquete:
    
    modal:
      
      nombre:
        label: "Nombre del Paquete"
        tipo: text
        obligatorio: true
        placeholder: "Ej: Paquete 10 Clases"
        max_length: 50
      
      descripción:
        label: "Descripción"
        tipo: textarea
        obligatorio: false
        placeholder: "Ej: Ideal para principiantes..."
        max_length: 500
      
      cantidad_clases:
        label: "Cantidad de Clases"
        tipo: number
        obligatorio: true
        min: 1
        max: 100
      
      precio:
        label: "Precio"
        tipo: number
        obligatorio: true
        currency: "ARS $"
        min: 0
        
        nota: "Este es el precio base. Puede variar por School en multi-tenant"
      
      validez:
        label: "Validez"
        tipo: number
        unidad: dropdown [días, meses]
        obligatorio: true
        default: 90 días
      
      tipo_clases:
        label: "Tipo de clases incluidas"
        tipo: multiselect
        opciones:
          - Prácticas
          - Teóricas
          - Ambas
        default: "Ambas"
      
      destacado:
        label: "Marcar como destacado"
        tipo: checkbox
        badge: "⭐ Más popular"
        tooltip: "Aparece resaltado para estudiantes"
      
      mejor_valor:
        label: "Badge 'Mejor Valor'"
        tipo: checkbox
        tooltip: "Muestra badge de mejor precio/clase"
      
      activo:
        label: "Paquete activo"
        tipo: checkbox
        default: true
        explicación: "Si inactivo, no aparece en lista para compra"
      
      características:
        label: "Características incluidas"
        tipo: "Lista editable"
        
        ejemplos:
          - "Clases prácticas y teóricas"
          - "Flexibilidad de horarios"
          - "Instructores certificados"
          - "Vehículos nuevos"
        
        botón: "+ Agregar característica"
      
      botones:
        - "Cancelar"
        - "Guardar Paquete"
  
  Eliminar_Paquete:
    
    validación:
      - Solo puede eliminarse si NO hay estudiantes con ese paquete activo
      - Si hay estudiantes: opción "Marcar como inactivo"
    
    confirmación:
      modal: "¿Estás seguro?"
      advertencia: "Esta acción no se puede deshacer"
      botón_confirmar: "Sí, eliminar"
      botón_cancelar: "Cancelar"
  
  Historial_Precios:
    
    ver_sección: "Fase 4 - 7.2 Historial de Precios"
    
    ubicación: "Dentro de cada paquete → Tab 'Historial'"
    
    muestra:
      - Cambios históricos de precio
      - Fecha de cada cambio
      - Usuario que hizo el cambio
      - Razón del cambio (si se registró)

Permisos:
  Owner: ✅ CRUD completo
  Admin: ⚠️ Configurable
  Secretary: ⚠️ Configurable (puede crear pero no eliminar)
```

---

### 4.7 Configuración de Notificaciones

**Decisión:** Owner puede configurar qué notificaciones recibe.

**Implementación:**

```yaml
Notification_Settings:
  
  Ubicación: "Settings → Notificaciones"
  
  Preferencias_Owner:
    
    Sección_Pagos:
      
      cada_pago:
        label: "Notificar en cada pago"
        checkbox: true/false
        default: false
        
        canales:
          - Email: checkbox
          - WhatsApp: checkbox
      
      pagos_grandes:
        label: "Notificar solo pagos mayores a:"
        habilitado: checkbox
        threshold: number input (currency)
        default: $100,000
        
        explicación: "Solo recibir notificación si pago > X"
      
      pagos_fallidos:
        label: "Notificar pagos fallidos"
        checkbox: true/false
        default: true
        
        obligatorio: true (no se puede desactivar)
    
    Sección_Clases:
      
      cada_clase_agendada:
        label: "Notificar cuando se agenda clase"
        checkbox: true/false
        default: false
        
        nota: "Alto volumen de notificaciones"
      
      clase_cancelada:
        label: "Notificar cancelaciones"
        checkbox: true/false
        default: true
        
        filtro:
          - Todas las cancelaciones
          - Solo cancelaciones por instructor
          - Solo cancelaciones tardías (<12h)
        default: "Todas"
      
      clase_reprogramada:
        label: "Notificar reprogramaciones"
        checkbox: true/false
        default: true
    
    Sección_Estudiantes:
      
      nuevo_estudiante:
        label: "Notificar cuando se registra estudiante"
        checkbox: true/false
        default: true
      
      estudiante_graduado:
        label: "Notificar cuando estudiante se gradúa"
        checkbox: true/false
        default: true
    
    Sección_Alertas:
      
      alertas_críticas:
        label: "Alertas críticas del sistema"
        checkbox: true/false
        default: true
        obligatorio: true (no se puede desactivar)
        
        incluye:
          - VTV vencida
          - Seguro vencido
          - Licencia instructor vencida
          - Pagos pendientes >48h
      
      alertas_warning:
        label: "Alertas de advertencia"
        checkbox: true/false
        default: true
        
        incluye:
          - Documentación por vencer (7-30 días)
          - Mantenimiento próximo
          - Créditos por vencer (estudiantes)
      
      alertas_info:
        label: "Alertas informativas"
        checkbox: true/false
        default: false
  
  Resúmenes_Automáticos:
    
    resumen_diario:
      habilitado: checkbox
      default: true
      
      hora_envío: time picker
      default: "20:00"
      
      incluye:
        - Ingresos del día
        - Cantidad de clases
        - Pagos pendientes
        - Alertas importantes
      
      canales:
        - Email: checkbox (default: true)
        - WhatsApp: checkbox (default: false)
    
    resumen_semanal:
      habilitado: checkbox
      default: true
      
      día: dropdown [Lunes-Domingo]
      default: "Domingo"
      
      hora: time picker
      default: "18:00"
      
      incluye:
        - Ingresos de la semana
        - Comparación con semana anterior
        - Top métricas
        - Tendencias
      
      canales:
        - Email: checkbox (default: true)
    
    resumen_mensual:
      habilitado: checkbox
      default: true
      
      día: number (1-28)
      default: 1 (primer día del mes)
      
      incluye:
        - Reporte completo del mes
        - PDF adjunto
        - Comparación YoY
      
      canales:
        - Email: checkbox (default: true)

Email_Destinatarios:
  
  principal:
    label: "Email principal"
    tipo: email
    default: owner.email
    obligatorio: true
  
  adicionales:
    label: "Emails adicionales"
    tipo: "Lista de emails"
    botón: "+ Agregar email"
    
    ejemplo:
      - admin@escuela.com
      - contador@escuela.com
    
    nota: "Todos recibirán las mismas notificaciones"

Botones:
  - "Guardar Configuración"
  - "Enviar Prueba" (envía notificación de prueba)

Permisos:
  Owner: ✅ Puede configurar su perfil
  Admin: ✅ Puede configurar su perfil
  Secretary: ⚠️ Perfil limitado
```

---

### 4.8 Templates de WhatsApp

**Decisión:** Templates fijos por ahora (no personalizables en MVP).

**Justificación:**

```yaml
Fixed_Templates_MVP:
  
  razones:
    - "WhatsApp Business API requiere templates pre-aprobados por Meta"
    - "Proceso de aprobación toma 24-72 horas"
    - "Cambios frecuentes requieren re-aprobación"
    - "Templates deben cumplir políticas estrictas de WhatsApp"
    - "MVP debe tener templates genéricos que funcionen para todas las escuelas"
  
  templates_incluidos:
    
    recordatorio_clase:
      nombre: "class_reminder_24h"
      contenido: |
        Hola {{1}},
        
        Recordatorio: Mañana tienes clase de conducción:
        📅 Fecha: {{2}}
        🕐 Hora: {{3}}
        👨‍🏫 Instructor: {{4}}
        📍 Punto de encuentro: {{5}}
        
        ¡Te esperamos!
        {{6}} (nombre escuela)
      
      variables:
        1: nombre_estudiante
        2: fecha
        3: hora
        4: nombre_instructor
        5: ubicación
        6: nombre_escuela
    
    confirmación_pago:
      nombre: "payment_confirmation"
      contenido: |
        ¡Hola {{1}}!
        
        ✅ Tu pago de ${{2}} fue confirmado.
        
        Detalles:
        📦 Paquete: {{3}}
        🎫 Créditos: {{4}} clases
        📅 Válido hasta: {{5}}
        
        Puedes agendar tus clases contactándonos.
        
        Gracias,
        {{6}}
    
    clase_cancelada:
      nombre: "class_cancelled"
      contenido: |
        Hola {{1}},
        
        ❌ Tu clase del {{2}} a las {{3}} fue cancelada.
        
        Motivo: {{4}}
        
        Tu crédito fue devuelto. Por favor, reprograma tu clase.
        
        {{5}}
    
    créditos_venciendo:
      nombre: "credits_expiring"
      contenido: |
        ⚠️ Hola {{1}},
        
        Tienes {{2}} créditos que vencen el {{3}}.
        
        ¡Agenda tus clases antes de que se pierdan!
        
        Contáctanos para agendar.
        {{4}}

Configuración_Visible:
  
  ubicación: "Settings → WhatsApp"
  
  mostrar:
    - Lista de templates disponibles
    - Vista previa de cada template
    - Variables que se pueden usar
    - Estado de aprobación en Meta
  
  NO_editable_en_MVP:
    mensaje: |
      "Los templates de WhatsApp están pre-aprobados
      por Meta y no se pueden editar por ahora.
      
      Si necesitas templates personalizados, contacta
      a soporte de Rau Solutions."

Post_MVP_Custom_Templates:
  
  timeline: "Sprint 6-8 post-MVP"
  
  features:
    - Editor de templates
    - Preview en tiempo real
    - Envío a Meta para aprobación
    - Tracking de estado de aprobación
    - Múltiples templates por tipo
    - A/B testing de templates
  
  proceso:
    1. Owner crea template custom
    2. Sistema valida que cumple políticas de WhatsApp
    3. Submit a Meta para aprobación
    4. Esperar 24-72h
    5. Si aprobado: disponible para usar
    6. Si rechazado: mostrar razón y sugerir cambios
```

---

### 4.9 Integración Mercado Pago

**Decisión:** Owner configura credenciales, pero necesita investigar detalles.

**Implementación (tentativa, requiere R&D):**

```yaml
MercadoPago_Integration:
  
  Nota_Crítica: |
    "Usuario mencionó que nunca integró Mercado Pago.
    Esta sección es TENTATIVA y requiere R&D durante
    Sprint 0 de Fase 4.
    
    Documentación oficial:
    https://www.mercadopago.com.ar/developers/es/docs"
  
  Ubicación: "Settings → Integraciones → Mercado Pago"
  
  Configuración_Básica:
    
    ambiente:
      label: "Ambiente"
      tipo: radio buttons
      opciones:
        - "Sandbox (Pruebas)"
        - "Producción"
      default: "Sandbox"
      
      nota: "Comienza en Sandbox para probar"
    
    credenciales:
      
      public_key:
        label: "Public Key"
        tipo: text (password-style)
        placeholder: "APP_USR-xxxxxx-xxxxxx"
        obligatorio: true
        
        ayuda: "Obtén tus credenciales en: mercadopago.com.ar/developers"
      
      access_token:
        label: "Access Token"
        tipo: text (password-style)
        placeholder: "APP_USR-xxxxxx-xxxxxx"
        obligatorio: true
        
        seguridad: "Nunca compartas tu Access Token"
    
    webhook_url:
      label: "Webhook URL"
      tipo: text (readonly)
      valor: "https://app.drivingschool.com/api/webhooks/mercadopago"
      
      instrucciones: |
        "Copia esta URL y configúrala en tu panel de
        Mercado Pago en: Integraciones → Webhooks"
      
      eventos_requeridos:
        - payment.created
        - payment.updated
    
    botones:
      - "Guardar Credenciales"
      - "Probar Conexión" (valida credenciales con API)
  
  Estado_Conexión:
    
    card:
      si_conectado:
        ícono: "✅"
        título: "Conectado"
        mensaje: "Mercado Pago está configurado correctamente"
        última_actualización: timestamp
      
      si_error:
        ícono: "❌"
        título: "Error de Conexión"
        mensaje: "Credenciales inválidas o webhook no configurado"
        botón: "Revisar Configuración"
      
      si_no_configurado:
        ícono: "⚠️"
        título: "No Configurado"
        mensaje: "Configura Mercado Pago para aceptar pagos online"
        botón: "Configurar Ahora"
  
  Configuración_Avanzada:
    
    descripción_producto:
      label: "Descripción en checkout"
      tipo: text
      default: "Paquete de clases - {ESCUELA}"
      placeholder: "Paquete de clases de manejo"
    
    statement_descriptor:
      label: "Descripción en estado de cuenta"
      tipo: text
      max_length: 22
      default: nombre_escuela (truncado)
      ayuda: "Cómo aparece en el resumen de tarjeta del cliente"
    
    métodos_pago:
      label: "Métodos de pago habilitados"
      tipo: checkboxes
      opciones:
        - Tarjeta de crédito ✓
        - Tarjeta de débito ✓
        - Efectivo (Rapipago, Pago Fácil) ✓
      default: todos seleccionados
    
    installments:
      label: "Cuotas permitidas"
      tipo: multiselect
      opciones: [1, 3, 6, 9, 12]
      default: [1, 3, 6]
      
      nota: "Mercado Pago cobra comisión adicional por cuotas"
  
  Testing:
    
    sandbox_test:
      botón: "Probar Pago de Prueba"
      
      acción:
        - Genera link de pago de $100
        - Owner puede completar flujo en Sandbox
        - Verifica que webhook funciona
        - Valida registro en sistema
      
      tarjetas_prueba:
        link: "https://www.mercadopago.com.ar/developers/es/docs/testing/test-cards"
        ejemplos:
          - VISA: 4509 9535 6623 3704
          - Mastercard: 5031 7557 3453 0604

Permisos:
  Owner: ✅ Puede configurar
  Admin: ❌ Solo lectura
  Secretary: ❌ No ve esta sección
```

---

### 4.10 Integración WhatsApp

**Decisión:** Por ahora NO pueden integrar su propio número (manejado por Rau Solutions).

**Justificación:**

```yaml
WhatsApp_Integration:
  
  MVP_Approach:
    
    modelo: "Rau Solutions gestiona WhatsApp Business API"
    
    razones:
      técnicas:
        - "WhatsApp Business API requiere aprobación de Meta"
        - "Proceso de aprobación: 2-4 semanas"
        - "Requiere: CUIT, verificación de negocio, etc"
        - "Costo: USD $X/mes por número + costos por mensaje"
      
      operacionales:
        - "Configuración compleja para cliente no-técnico"
        - "Mantenimiento de múltiples integraciones"
        - "Monitoreo de límites y quotas"
        - "Troubleshooting de problemas"
      
      económicas:
        - "Negociar rates con proveedores (Twilio, MessageBird)"
        - "Economía de escala si Rau gestiona todo"
        - "Simplifica billing"
  
  Implementación_MVP:
    
    número_compartido:
      descripción: |
        "Rau Solutions tiene 1 número de WhatsApp Business
        que se usa para todas las escuelas"
      
      número_ejemplo: "+54 9 11 2345-6789"
      
      cómo_funciona:
        - Estudiante recibe mensaje de este número
        - Mensaje incluye nombre de la escuela
        - Respuestas van a Rau Solutions backend
        - Sistema rutea mensaje a escuela correcta
      
      ejemplo_mensaje:
        "Hola Juan,
        
        [Autoescuela San Martín] Recordatorio: Mañana tienes clase..."
    
    configuración_visible:
      ubicación: "Settings → WhatsApp"
      
      pantalla:
        título: "Integración WhatsApp"
        
        info_card:
          ícono: "ℹ️"
          mensaje: |
            "Las notificaciones por WhatsApp son gestionadas
            por Rau Solutions usando WhatsApp Business API.
            
            Número: +54 9 11 2345-6789
            
            Los mensajes incluirán el nombre de tu escuela
            para que los estudiantes sepan de dónde vienen."
          
          estado: "✅ Activo"
        
        estadísticas:
          - Mensajes enviados este mes: 450
          - Tasa de entrega: 98%
          - Tasa de lectura: 85%
        
        templates:
          link: "Ver templates disponibles"
          → redirige a Settings → WhatsApp (sección 4.8)
        
        NO_hay:
          ❌ Campo para ingresar número propio
          ❌ Configuración de API Keys
          ❌ Webhook configuration

Post_MVP_Bring_Your_Own_Number:
  
  timeline: "Sprint 10-15 post-MVP"
  
  cuándo_implementar:
    - Cuando hay > 20 escuelas usando el sistema
    - Cuando Owner solicita explícitamente
    - Cuando el costo lo justifica
  
  features:
    
    configuración:
      ubicación: "Settings → WhatsApp → Avanzado"
      
      opciones:
        - "Usar número de Rau Solutions (Recomendado)"
        - "Usar mi propio número de WhatsApp Business"
      
      si_propio:
        - Wizard de configuración paso a paso
        - Validación de número
        - Verificación con Meta
        - Configuración de webhooks
        - Testing de integración
    
    requisitos_número_propio:
      - WhatsApp Business API aprobado por Meta
      - Número de teléfono dedicado
      - CUIT verificado
      - Contrato con provider (Twilio, MessageBird, etc)
      - Budget mensual (USD $50-200/mes aprox)
    
    soporte:
      - Documentación completa
      - Soporte técnico de Rau Solutions
      - Troubleshooting
      - Migración desde número compartido
```

---

## 5. Gestión de Staff y Permisos

### 5.1 CRUD de Usuarios del Staff

**Decisión:** Owner puede crear/editar/eliminar usuarios del staff.

**Implementación:**

```yaml
Staff_Management:
  
  Ubicación: "Staff → Gestión de Usuarios"
  
  Lista_Usuarios:
    
    tabs:
      - "Todos"
      - "Owners"
      - "Admins"
      - "Secretaries"
      - "Instructors"
    
    tabla:
      columnas:
        - Nombre
        - Email
        - Rol
        - Estado (Activo/Inactivo)
        - Último login
        - Acciones
      
      ejemplo:
        - María González | maria@escuela.com | Secretary | Activo ✓ | Hace 2 horas | ✏️ 🔒 🗑️
      
      filtros:
        - Por rol
        - Por estado
        - Búsqueda por nombre/email
      
      ordenamiento: Por cualquier columna
    
    botón: "+ Crear Usuario"
  
  Crear_Usuario:
    
    modal:
      
      información_básica:
        
        nombre_completo:
          label: "Nombre Completo"
          tipo: text
          obligatorio: true
        
        email:
          label: "Email"
          tipo: email
          obligatorio: true
          validación: "Email único en el sistema"
        
        teléfono:
          label: "Teléfono"
          tipo: text
          obligatorio: true
        
        rol:
          label: "Rol"
          tipo: dropdown
          opciones:
            - Admin
            - Secretary
            - Instructor
          
          nota: "No se puede crear Owner desde aquí"
        
        contraseña_temporal:
          label: "Contraseña Temporal"
          tipo: password generator
          botón: "Generar Automática"
          
          política:
            - Mínimo 8 caracteres
            - Mayúscula + minúscula + número
            - Caracteres especiales
          
          nota: "Usuario debe cambiarla en primer login"
      
      permisos:
        
        si_rol_es_secretary:
          label: "Permisos de Secretary"
          tipo: checkboxes
          
          opciones:
            ✅ Agendar clases
            ✅ Cancelar clases
            ✅ Registrar pagos
            ✅ Ver reportes financieros
            ✅ Gestionar estudiantes
            ✅ Gestionar vehículos
            ❌ Gestionar instructors (Owner only)
            ❌ Cambiar configuración (Owner only)
          
          configuración: "Owner puede personalizar estos permisos"
        
        si_rol_es_instructor:
          automático: "Permisos fijos de instructor"
          ver: "Matriz de permisos en sección 5.3"
      
      botones:
        - "Cancelar"
        - "Crear Usuario"
  
  Editar_Usuario:
    
    modal: (similar a crear)
    
    adicional:
      - Puede cambiar rol
      - Puede activar/desactivar
      - Puede resetear contraseña
      - NO puede cambiar email (es único identificador)
    
    botón_reset_password:
      acción: "Generar nueva contraseña temporal"
      envío: "Email con nueva contraseña"
  
  Desactivar_Usuario:
    
    acción: "Marcar como inactivo (soft delete)"
    
    comportamiento:
      - user.active = false
      - No puede hacer login
      - Aparece en lista con badge "Inactivo"
      - Historial se mantiene
      - Puede reactivarse después
    
    validación:
      if usuario_es_instructor:
        check: "¿Tiene clases futuras agendadas?"
        if sí:
          advertencia: "Este instructor tiene X clases agendadas. ¿Reasignar o cancelar?"
          opciones:
            - Reasignar a otro instructor
            - Cancelar clases
            - Mantener clases (pero no puede agregar más)
  
  Eliminar_Usuario:
    
    restricción: "Solo si NO tiene historial asociado"
    
    validación:
      if instructor:
        if clases_dictadas > 0:
          bloquear: true
          mensaje: "No se puede eliminar. Desactivar en su lugar."
    
    confirmación:
      modal: "¿Estás seguro?"
      advertencia: "Esta acción es PERMANENTE"
      campo: "Escribe 'ELIMINAR' para confirmar"

Permisos_Gestión:
  Owner: ✅ Puede gestionar TODOS (excepto otros Owners)
  Admin: ⚠️ Puede gestionar Secretaries e Instructors (configurable)
  Secretary: ❌ Solo puede ver lista (no editar)
  Instructor: ❌ No tiene acceso
```

---

### 5.2 Actividad del Staff - Audit Log

**Decisión:** Sí, sistema de logs visible para Owner.

**Implementación:**

```yaml
Staff_Activity_Log:
  
  Ubicación: "Staff → Actividad"
  
  Vista_Lista:
    
    filtros:
      
      usuario:
        label: "Usuario"
        tipo: multiselect
        opciones: [Todos los staff]
        default: "Todos"
      
      acción:
        label: "Tipo de Acción"
        tipo: multiselect
        opciones:
          - Login/Logout
          - Crear estudiante
          - Editar estudiante
          - Registrar pago
          - Agendar clase
          - Cancelar clase
          - Editar configuración
          - Crear usuario
          - Eliminar usuario
        default: "Todas"
      
      fecha:
        label: "Período"
        tipo: date range
        presets:
          - Hoy
          - Últimos 7 días
          - Últimos 30 días
          - Custom
    
    tabla:
      columnas:
        - Fecha/Hora
        - Usuario
        - Rol
        - Acción
        - Detalles
        - IP Address
        - Ver más
      
      ejemplo:
        - 23/10/2025 14:35 | María González | Secretary | Registró pago | $50,000 a Juan Pérez | 190.123.45.67 | 👁️
      
      paginación: "50 items por página"
      
      ordenamiento: "Más reciente primero (default)"
  
  Detalle_Acción:
    
    modal: "Click en 👁️"
    
    contenido:
      
      información_básica:
        - Fecha y hora exacta
        - Usuario que realizó la acción
        - Rol del usuario
        - IP address
        - User agent (navegador)
      
      detalles_acción:
        
        ejemplo_pago:
          acción: "Registró pago"
          detalles:
            - Estudiante: Juan Pérez
            - Monto: $50,000
            - Método: Efectivo
            - Paquete: 10 Clases
            - Créditos otorgados: 10
            - Payment ID: #PAY-12345
          
          link: "Ver comprobante"
        
        ejemplo_editar_estudiante:
          acción: "Editó estudiante"
          cambios:
            - Teléfono: 1234-5678 → 8765-4321
            - Dirección: Calle A → Calle B
          
          estudiante: "María López"
          link: "Ver perfil"
      
      contexto_adicional:
        - Session ID
        - Request ID (para debugging)
  
  Exportación:
    
    botón: "Exportar Log"
    
    formato: CSV / Excel
    
    incluye:
      - Todas las columnas de la tabla
      - Período seleccionado
      - Filtros aplicados
    
    límite: "Máximo 10,000 registros por export"
  
  Retención:
    
    política:
      - Logs se guardan por 365 días (1 año)
      - Después: archivados o eliminados (configurable)
      - Owner puede exportar antes de eliminación

Tipos_de_Eventos_Registrados:
  
  autenticación:
    - user.login
    - user.logout
    - user.password_reset
    - user.failed_login (3+ intentos)
  
  estudiantes:
    - student.created
    - student.updated (con cambios específicos)
    - student.deleted
    - student.status_changed
  
  pagos:
    - payment.registered
    - payment.confirmed
    - payment.refunded
  
  clases:
    - class.scheduled
    - class.cancelled (con razón)
    - class.rescheduled
    - class.completed
  
  configuración:
    - settings.updated (qué cambió)
    - package.created
    - package.updated
    - policy.changed
  
  staff:
    - staff_user.created
    - staff_user.updated
    - staff_user.deleted
    - staff_user.deactivated
    - permissions.changed

Permisos:
  Owner: ✅ Ve todos los logs
  Admin: ✅ Ve todos los logs
  Secretary: ⚠️ Ve solo sus propios logs
  Instructor: ⚠️ Ve solo sus propios logs
```

---

### 5.3 Matriz de Permisos - Configurable

**Decisión:** Matriz de permisos que Owner puede modificar.

**Implementación:**

```yaml
Permission_Matrix:
  
  Ubicación: "Settings → Permisos y Roles"
  
  Matriz_Visual:
    
    tabla_2D:
      
      eje_y: "Módulos/Acciones"
      eje_x: "Roles"
      
      columnas: [Owner, Admin, Secretary, Instructor, Student]
      
      filas_por_módulo:
        
        Dashboard:
          - Ver dashboard: [✓, ✓, ✓, ✓, ✓]
          - Ver KPIs financieros: [✓, ✓, ⚙️, ✗, ✗]
          - Exportar reportes: [✓, ✓, ⚙️, ✗, ✗]
        
        Estudiantes:
          - Ver lista: [✓, ✓, ✓, ⚙️, ✗]
          - Ver perfil: [✓, ✓, ✓, ✓, Solo propio]
          - Crear estudiante: [✓, ✓, ✓, ✗, ✗]
          - Editar estudiante: [✓, ✓, ⚙️, ✗, ✗]
          - Eliminar estudiante: [✓, ⚙️, ✗, ✗, ✗]
          - Ver créditos: [✓, ✓, ✓, ✓, Solo propio]
        
        Scheduling:
          - Ver calendario: [✓, ✓, ✓, ✓, Solo propias]
          - Agendar clase: [✓, ✓, ✓, ✗, ⚙️]
          - Cancelar clase: [✓, ✓, ⚙️, ⚙️, ⚙️]
          - Reprogramar clase: [✓, ✓, ✓, ✗, ⚙️]
        
        Pagos:
          - Ver pagos: [✓, ✓, ⚙️, ✗, Solo propios]
          - Registrar pago: [✓, ✓, ✓, ✗, ✗]
          - Refund: [✓, ⚙️, ✗, ✗, ✗]
          - Ver reportes financieros: [✓, ✓, ⚙️, ✗, ✗]
        
        Instructores:
          - Ver lista: [✓, ✓, ✓, Solo propio, ✗]
          - Crear instructor: [✓, ⚙️, ✗, ✗, ✗]
          - Editar instructor: [✓, ⚙️, ✗, ✗, ✗]
          - Ver pagos a instructores: [✓, ✓, ✗, Solo propio, ✗]
          - Registrar pago a instructor: [✓, ⚙️, ✗, ✗, ✗]
        
        Vehículos:
          - Ver lista: [✓, ✓, ✓, ✓, ✗]
          - Crear vehículo: [✓, ⚙️, ✗, ✗, ✗]
          - Editar vehículo: [✓, ⚙️, ⚙️, ✗, ✗]
          - Registrar mantenimiento: [✓, ✓, ⚙️, ✗, ✗]
        
        Configuración:
          - Ver settings: [✓, ⚙️, Solo leer, ✗, ✗]
          - Editar información básica: [✓, ✗, ✗, ✗, ✗]
          - Editar políticas: [✓, ✗, ✗, ✗, ✗]
          - Gestionar paquetes: [✓, ⚙️, ✗, ✗, ✗]
          - Gestionar usuarios: [✓, ⚙️, ✗, ✗, ✗]
          - Ver audit log: [✓, ✓, Solo propio, Solo propio, ✗]
      
      leyenda:
        ✓: "Siempre permitido"
        ✗: "Siempre bloqueado"
        ⚙️: "Configurable por Owner"
  
  Editar_Permisos:
    
    acción: "Click en celda con ⚙️"
    
    modal:
      título: "Configurar Permiso"
      
      información:
        - Acción: "Editar estudiante"
        - Rol: "Secretary"
        - Estado actual: "Permitido" / "Bloqueado"
      
      toggle:
        label: "Permitir esta acción para Secretary"
        tipo: switch
        default: (depende del estado actual)
      
      nota:
        mensaje: |
          "Cambiar este permiso afectará a TODOS los usuarios
          con rol Secretary en tu escuela."
      
      botones:
        - "Cancelar"
        - "Guardar Cambio"
    
    confirmación:
      - Cambio se aplica inmediatamente
      - Se registra en audit log
      - Notificación a usuarios afectados (opcional)
  
  Presets:
    
    botón: "Aplicar Preset"
    
    opciones:
      
      preset_restrictivo:
        descripción: "Mínimos permisos para cada rol"
        ejemplo:
          - Secretary: Solo agendar y registrar pagos
          - Instructor: Solo ver sus clases
      
      preset_estándar:
        descripción: "Configuración recomendada (default)"
        ejemplo:
          - Secretary: Gestión completa de estudiantes y scheduling
          - Instructor: Ver y gestionar sus clases
      
      preset_permisivo:
        descripción: "Máximos permisos (excepto configuración)"
        ejemplo:
          - Secretary: Casi todo (excepto eliminar y config)
          - Instructor: Más acceso a datos
    
    aplicar:
      advertencia: "Esto sobrescribirá tu configuración actual"
      confirmación: "¿Estás seguro?"
  
  Roles_Custom:
    
    nota: "Post-MVP feature"
    
    descripción: |
      "En el futuro podrás crear roles personalizados
      como 'Coordinador', 'Asistente', etc. con permisos
      específicos.
      
      Por ahora, solo existen los 5 roles predefinidos."

Permisos_No_Configurables:
  
  owner:
    - Owner SIEMPRE tiene todos los permisos
    - No se puede limitar a Owner
    - No se puede auto-eliminar
  
  student:
    - Permisos de Student son fijos
    - Definidos en Fase 5
    - No configurables en matriz
  
  críticos:
    - Algunos permisos críticos no son configurables
    - Ejemplo: Owner es el único que puede eliminar la escuela
    - Ejemplo: Solo Owner puede cambiar credenciales de MP

Exportación_Matriz:
  - Botón "Exportar Matriz" (PDF)
  - Útil para documentación interna
  - Útil para auditorías

Permisos_de_Configuración:
  Owner: ✅ Puede modificar matriz completa
  Admin: ❌ Solo lectura (no puede cambiar permisos)
```

---

## 6. Alertas Críticas

### 6.1 Dashboard de Alertas

**Decisión:** Todas las alertas mencionadas en un tablero prominente.

**Implementación:**

```yaml
Critical_Alerts_Dashboard:
  
  Ubicación: "Dashboard → Widget 'Alertas Críticas'"
  
  Prominencia:
    - Siempre visible en dashboard
    - Badge con número en sidebar (menu)
    - Color coded por urgencia
    - No se puede cerrar hasta resolver
  
  Widget_Alertas:
    
    header:
      título: "🚨 Alertas Críticas"
      contador: "5 alertas requieren atención"
      botón: "Ver todas"
    
    lista_resumida:
      muestra: "Top 3 alertas más urgentes"
      
      por_alerta:
        - Nivel urgencia (ícono + color)
        - Título corto
        - Acción sugerida
        - Link "Resolver"
      
      ejemplo:
        - 🔴 VTV vencida - Toyota Corolla ABC123 → "Actualizar documentación"
        - 🟡 2 instructores con licencia por vencer (7 días) → "Verificar licencias"
        - 🟡 5 pagos pendientes >48h → "Confirmar pagos"
    
    botón_footer:
      "Ver todas las alertas (5)" → redirige a página completa
  
  Página_Completa_Alertas:
    
    ubicación: "Alertas" (menú principal)
    
    tabs:
      - "Todas" (5)
      - "Críticas" (1) 🔴
      - "Advertencias" (3) 🟡
      - "Resueltas" (12)
    
    filtros:
      - Por categoría:
        * Vehículos
        * Instructores
        * Pagos
        * Estudiantes
        * Sistema
      - Por fecha
      - Por estado
    
    lista_alertas:
      
      por_cada_alerta:
        
        card:
          
          header:
            - Badge de nivel (CRÍTICO/ADVERTENCIA)
            - Timestamp ("Hace 3 días")
            - Categoría ("Vehículos")
          
          body:
            título: "VTV vencida - Toyota Corolla ABC123"
            descripción: "La VTV de este vehículo venció el 15/10/2025"
            
            impacto:
              - "Vehículo fuera de servicio"
              - "3 clases futuras afectadas"
              - "Estudiantes: Juan, María, Pedro"
            
            acciones_sugeridas:
              - "Hacer VTV urgente"
              - "Reasignar clases a otro vehículo"
              - "Marcar vehículo como no disponible"
          
          footer:
            botones:
              - "Marcar como Resuelta"
              - "Posponer por X días"
              - "Ver Detalles"
              - "Tomar Acción" → redirige a módulo relevante

Categorías_Alertas:
  
  Vehículos:
    
    seguro_vencido:
      nivel: CRÍTICO 🔴
      trigger: "seguro.fecha_vencimiento < HOY"
      título: "Seguro vencido - {vehículo}"
      impacto: "Vehículo no puede usarse legalmente"
      acción: "Renovar seguro inmediatamente"
    
    seguro_por_vencer:
      nivel: ADVERTENCIA 🟡
      trigger: "seguro.fecha_vencimiento <= (HOY + 7 días)"
      título: "Seguro vence en {X} días - {vehículo}"
      acción: "Contactar aseguradora para renovación"
    
    vtv_vencida:
      nivel: CRÍTICO 🔴
      trigger: "vtv.fecha_vencimiento < HOY"
      título: "VTV vencida - {vehículo}"
      impacto: "Vehículo no puede circular"
      acción: "Hacer VTV urgente"
    
    vtv_por_vencer:
      nivel: ADVERTENCIA 🟡
      trigger: "vtv.fecha_vencimiento <= (HOY + 30 días)"
    
    oblea_gnc_vencida:
      nivel: CRÍTICO 🔴
      trigger: "si vehicle.combustible = 'gnc' AND oblea.vencimiento < HOY"
    
    mantenimiento_atrasado:
      nivel: ADVERTENCIA 🟡
      trigger: "kilometraje >= próximo_service_km"
      título: "Mantenimiento atrasado - {vehículo}"
      detalle: "Excedió {X} km desde último service"
      acción: "Agendar service"
  
  Instructores:
    
    licencia_vencida:
      nivel: CRÍTICO 🔴
      trigger: "licencia.vencimiento < HOY"
      título: "Licencia vencida - {instructor}"
      impacto: "Instructor no puede dar clases"
      acción: "Renovar licencia urgente"
      auto_acción: "Sistema bloqueó al instructor automáticamente"
    
    licencia_por_vencer:
      nivel: ADVERTENCIA 🟡
      trigger: "licencia.vencimiento <= (HOY + 30 días)"
  
  Pagos:
    
    pagos_pendientes_antiguos:
      nivel: ADVERTENCIA 🟡
      trigger: "payment.status = 'pending' AND created_at < (HOY - 48h)"
      título: "{X} pagos pendientes >48h"
      detalle: "Total: ${monto}"
      acción: "Revisar y confirmar pagos"
      link: "Ver pagos pendientes"
    
    pago_fallido_alto_monto:
      nivel: ADVERTENCIA 🟡
      trigger: "payment.status = 'failed' AND amount > threshold"
      título: "Pago fallido de ${monto} - {estudiante}"
      acción: "Contactar estudiante"
  
  Estudiantes:
    
    muchas_cancelaciones:
      nivel: ADVERTENCIA 🟡
      trigger: "student.cancelaciones_mes >= 5"
      título: "{estudiante} canceló {X} veces este mes"
      acción: "Contactar estudiante para entender situación"
    
    créditos_vencen_pronto:
      nivel: INFO 🔵
      trigger: "student.credits_expiring <= 7 días"
      título: "{X} estudiantes con créditos por vencer"
      acción: "Recordar a estudiantes que agenden"
  
  Sistema:
    
    espacio_disco_bajo:
      nivel: CRÍTICO 🔴
      trigger: "disk_space < 10%"
      título: "Espacio en disco bajo"
      acción: "Contactar soporte Rau Solutions"
    
    backup_fallido:
      nivel: CRÍTICO 🔴
      trigger: "último backup > 24h"
      título: "Backup diario falló"
      acción: "Contactar soporte"

Niveles_Urgencia:
  
  CRÍTICO:
    color: "Rojo"
    ícono: "🔴"
    significado: "Requiere acción INMEDIATA"
    ejemplos:
      - VTV/Seguro vencido
      - Licencia instructor vencida
      - Sistema fuera de servicio
    
    acciones_sistema:
      - Email inmediato a Owner
      - WhatsApp a Owner
      - Push notification
      - Banner persistente en dashboard
    
    no_se_puede_cerrar: "Hasta que se resuelva"
  
  ADVERTENCIA:
    color: "Amarillo/Naranja"
    ícono: "🟡"
    significado: "Requiere atención pronto"
    ejemplos:
      - Documentación por vencer (7-30 días)
      - Pagos pendientes >48h
      - Estudiante con muchas cancelaciones
    
    acciones_sistema:
      - Aparece en dashboard
      - Email diario (si está en resumen)
    
    se_puede_posponer: "Por X días"
  
  INFO:
    color: "Azul"
    ícono: "🔵"
    significado: "Informativo, no urgente"
    ejemplos:
      - Créditos por vencer (>7 días)
      - Mantenimiento preventivo próximo
    
    acciones_sistema:
      - Solo aparece en página de alertas
      - Incluido en resumen semanal

Marcar_como_Resuelta:
  
  acción: "Botón en cada alerta"
  
  modal:
    título: "Marcar alerta como resuelta"
    
    campo_razón:
      label: "¿Cómo se resolvió?"
      tipo: textarea
      placeholder: "Ej: Se renovó el seguro del vehículo"
      obligatorio: false
    
    campo_evidencia:
      label: "Adjuntar evidencia (opcional)"
      tipo: file_upload
      formatos: [pdf, jpg, png]
      ejemplo: "Foto de nueva VTV, recibo de pago, etc"
    
    botones:
      - "Cancelar"
      - "Marcar como Resuelta"
  
  después_de_resolver:
    - Alerta desaparece de "Activas"
    - Aparece en tab "Resueltas"
    - Se registra en audit log
    - Notificación a Owner (opcional)

Posponer_Alerta:
  
  acción: "Botón 'Posponer'"
  
  solo_para: "Alertas de tipo ADVERTENCIA"
  
  opciones:
    - "1 día"
    - "3 días"
    - "1 semana"
    - "Custom"
  
  comportamiento:
    - Alerta se oculta temporalmente
    - Reaparece después del tiempo seleccionado
    - Se registra en audit log

Permisos:
  Owner: ✅ Ve todas, puede resolver todas
  Admin: ✅ Ve todas, puede resolver todas
  Secretary: ⚠️ Ve alertas relevantes a su trabajo (configurable)
  Instructor: ⚠️ Ve solo alertas sobre sí mismo
```

---

## 7. Calendario Maestro

### 7.1 Vista Unificada

**Decisión:** Sí, calendario maestro con vista de todos los recursos.

**Implementación:**

```yaml
Master_Calendar:
  
  Ubicación: "Calendario" (menú principal)
  
  Vistas_Disponibles:
    
    tabs:
      - "Día"
      - "Semana" ⭐ DEFAULT
      - "Mes"
      - "Agenda" (lista)
    
    cada_vista:
      características:
        - Drag & drop para reprogramar
        - Color coded por tipo/instructor
        - Hover para quick info
        - Click para detalle completo
  
  Vista_Semana:
    
    layout:
      
      eje_y: "Horas del día (8:00-20:00)"
      eje_x: "Días de la semana (Lun-Dom)"
      
      grid:
        - Celda = 30 minutos
        - Clases se muestran como bloques
        - Múltiples clases en mismo slot = overlap visual
      
      ejemplo_visual:
        ```
               Lunes    Martes   Miércoles  Jueves   Viernes   Sábado
        08:00  [───]     [───]     [───]     [───]    [───]     [───]
        08:30  │   │     │   │     │   │     │   │    │   │     │   │
        09:00  │Ju │     │Ma │     [───]     │   │    │Pe │     │   │
        09:30  │an │     │rí │     │Ju │     [───]    │dr │     [───]
        10:00  [───]     │a  │     │an │     │Lu │    │o  │     │An │
        10:30            [───]     [───]     │is │    [───]     │a  │
        ...                                  [───]              [───]
        ```
    
    filtros_laterales:
      
      por_instructor:
        tipo: multiselect
        opciones: [Todos, Juan, María, Pedro, ...]
        comportamiento: "Mostrar solo clases de instructores seleccionados"
        color: "Cada instructor tiene color único"
      
      por_vehículo:
        tipo: multiselect
        similar_a_instructor
      
      por_tipo_clase:
        opciones: [Todas, Prácticas, Teóricas]
      
      por_estudiante:
        búsqueda: "Buscar estudiante"
        resultado: "Resalta clases de ese estudiante"
    
    navegación:
      botones:
        - "< Semana Anterior"
        - "Hoy" (vuelve a semana actual)
        - "Semana Siguiente >"
      
      selector_semana:
        - Date picker
        - "Ir a semana específica"
  
  Vista_Instructor:
    
    modo: "Vista paralela de múltiples instructores"
    
    layout:
      columnas: Una por instructor
      filas: Horarios
      
      ejemplo:
        ```
               Juan          María         Pedro
        10:00  [Clase]       [Libre]       [Clase]
        11:00  [Clase]       [Clase]       [Libre]
        12:00  [Libre]       [Clase]       [Clase]
        ```
    
    utilidad:
      - Ver ocupación de cada instructor
      - Identificar quién tiene más/menos clases
      - Balancear carga de trabajo
  
  Vista_Vehículo:
    
    similar_a_vista_instructor
    
    utilidad:
      - Ver qué vehículos están más usados
      - Identificar vehículos subutilizados
      - Planificar mantenimientos

Color_Coding:
  
  por_instructor:
    - Cada instructor tiene color único
    - Consistente en todo el sistema
    - Generado automáticamente (hashing del nombre)
  
  por_estado:
    - Scheduled (azul)
    - Completed (verde)
    - Cancelled (rojo, tachado)
    - In Progress (amarillo, pulsando)
  
  por_tipo:
    - Práctica: borde sólido
    - Teórica: borde punteado

Drag_and_Drop:
  
  reprogramar_clase:
    
    acción: "Arrastrar bloque de clase a nuevo slot"
    
    validaciones_en_tiempo_real:
      ✅ Nuevo slot disponible (sin conflictos)
      ✅ Instructor disponible
      ✅ Vehículo disponible
      ✅ Dentro de horario laboral
      ✅ Respeta ventana de cancelación
      ❌ Fuera de horario → feedback visual (rojo)
      ❌ Conflicto → feedback visual (rojo)
    
    al_soltar:
      if válido:
        - Modal de confirmación
        - Muestra: fecha/hora nueva
        - Botón "Confirmar Reprogramación"
        - Sistema notifica a estudiante
      
      if inválido:
        - Bloque vuelve a posición original
        - Tooltip con razón del error
  
  crear_clase:
    
    acción: "Click y drag en slot vacío"
    
    wizard_rápido:
      - Auto-detecta instructor/vehículo según columna
      - Seleccionar estudiante (búsqueda rápida)
      - Tipo de clase
      - Confirmar
    
    ventaja: "Agendar muy rápido visualmente"

Detección_Conflictos:
  
  visualización:
    
    overlap_visual:
      - Si 2 clases en mismo slot: bloques apilados
      - Badge "⚠️ Conflicto" en bloques
      - Color rojo para alertar
    
    tooltip_hover:
      "Conflicto: Juan tiene 2 clases a las 10:00"
  
  resolución:
    - Click en conflicto → modal con opciones
    - Opción 1: Cancelar una
    - Opción 2: Mover una
    - Opción 3: Cambiar instructor/vehículo

Quick_Info_Hover:
  
  al_pasar_mouse_sobre_clase:
    tooltip_popup:
      - Estudiante: "Juan Pérez"
      - Instructor: "María López"
      - Vehículo: "Toyota Corolla ABC123"
      - Hora: "10:00-11:00"
      - Tipo: "Práctica"
      - Estado: "Scheduled"
      - Click para ver más

Modal_Detalle_Completo:
  
  al_hacer_click_en_clase:
    modal:
      - Toda la información de la clase
      - Información del estudiante
      - Información del instructor
      - Información del vehículo
      - Historial de cambios (si fue reprogramada)
      
      acciones:
        - "Editar"
        - "Cancelar"
        - "Reprogramar"
        - "Completar" (si es clase en curso/pasada)
        - "Ver Perfil Estudiante"

Exportación:
  
  opciones:
    - "Exportar Semana" (PDF)
    - "Exportar Mes" (PDF)
    - "Imprimir" (print-friendly view)
  
  formato_PDF:
    - Layout: Landscape A4
    - Grid con todas las clases
    - Color coded (en PDF)
    - Header con rango de fechas
    - Footer con total de clases

Sincronización:
  
  con_Google_Calendar:
    nota: "Post-MVP feature"
    descripción: "Sincronizar clases con Google Calendar del instructor"

Permisos:
  Owner: ✅ Ve todo, puede editar todo
  Admin: ✅ Ve todo, puede editar todo
  Secretary: ✅ Ve todo, puede editar (según permisos)
  Instructor: ⚠️ Ve solo sus clases
  Student: ❌ No tiene acceso a calendario maestro
```

---

## 8. Búsqueda y Navegación

### 8.1 Búsqueda Global

**Decisión:** NO hay búsqueda global en MVP.

**Justificación:**

```yaml
No_Global_Search_MVP:
  
  razones:
    complejidad_técnica:
      - "Requiere indexación de múltiples entidades"
      - "Elasticsearch o Algolia para buenos resultados"
      - "Pesos y rankings complejos"
    
    UX:
      - "Puede ser confuso si resultados son mezclados"
      - "Ejemplo: buscar 'Juan' devuelve estudiante Y instructor Y clases"
      - "Usuario debe filtrar manualmente"
    
    MVP_scope:
      - "Cada módulo tiene su propia búsqueda optimizada"
      - "Suficiente para casos de uso iniciales"
  
  alternativa_MVP:
    - Estudiantes: buscar en módulo "Estudiantes"
    - Instructores: buscar en módulo "Instructores"
    - Clases: filtrar en "Calendario"
    - Pagos: buscar en "Pagos"
  
  navegación_rápida:
    - Menú bien organizado
    - Breadcrumbs
    - Links contextuales
    - "Recientemente visitados" (post-MVP)

Post_MVP_Global_Search:
  
  timeline: "Sprint 8-10 post-MVP"
  
  ubicación: "Barra superior, prominente"
  
  características:
    
    search_bar:
      placeholder: "Buscar estudiantes, clases, pagos..."
      shortcut: "Ctrl+K o Cmd+K"
      
      resultados_categorizados:
        - Estudiantes (max 3)
        - Instructores (max 3)
        - Clases (max 3)
        - Pagos (max 3)
        - Vehículos (max 3)
      
      cada_resultado:
        - Tipo (badge)
        - Título/nombre
        - Subtexto (info adicional)
        - Click → ir a detalle
      
      footer:
        "Ver todos los resultados de 'Juan'" → página completa
    
    búsqueda_inteligente:
      - Fuzzy matching ("Jaun" → "Juan")
      - Sinónimos
      - Búsqueda por múltiples campos
      - Ranking por relevancia
    
    historial:
      - Últimas 5 búsquedas
      - Quick access
```

---

### 8.2 Atajos de Teclado

**Decisión:** NO en MVP.

**Justificación:**

```yaml
No_Keyboard_Shortcuts_MVP:
  
  razones:
    - "Añade complejidad de implementación"
    - "Curva de aprendizaje para usuarios"
    - "Mayoría de usuarios usarán mouse/touch"
    - "No es crítico para MVP"
  
  excepciones:
    - Ctrl+S para guardar en forms (estándar del navegador)
    - Enter para submit en forms
    - Esc para cerrar modals
  
  Post_MVP:
    shortcuts_útiles:
      navegación:
        - "g + d" → Go to Dashboard
        - "g + s" → Go to Students
        - "g + c" → Go to Calendar
      
      acciones:
        - "n" → New (crear nuevo, contexto-aware)
        - "/" → Focus search bar
        - "?" → Mostrar ayuda/shortcuts
      
      implementación:
        - Biblioteca: react-hotkeys o similar
        - Modal de ayuda: lista todos los shortcuts
        - Tooltips: mostrar shortcut junto a botón
```

---

## 9. Personalización y Branding

### 9.1 Branding del Portal

**Decisión:** School puede personalizar logo y favicon solamente.

**Implementación:**

```yaml
Branding_Customization:
  
  Ubicación: "Settings → Branding"
  
  Logo:
    
    configuración:
      label: "Logo de la Escuela"
      tipo: file_upload
      formatos: [png, jpg, svg]
      max_size: 2MB
      dimensiones_recomendadas: "500x500px (cuadrado)"
      
      preview:
        - Muestra logo actual
        - Tamaño real
        - "Cómo se verá en el portal"
      
      uso:
        - Header del portal de estudiante
        - Recibos internos
        - Emails (header)
        - Dashboard del staff
    
    recomendaciones:
      - "Fondo transparente (PNG)"
      - "Logo horizontal o cuadrado"
      - "Colores que contrasten con fondo blanco"
  
  Favicon:
    
    configuración:
      label: "Favicon"
      tipo: file_upload
      formatos: [ico, png]
      dimensiones: "32x32px o 64x64px"
      max_size: 100KB
      
      preview:
        - Vista de cómo aparece en tab del navegador
        - Simulación: [🌟] Mi Escuela
      
      uso:
        - Tab del navegador
        - Bookmarks
        - App shortcuts (PWA)
    
    generación_automática:
      botón: "Generar desde Logo"
      acción: "Sistema redimensiona logo automáticamente"
  
  NO_Personalizable:
    
    colores:
      ❌ No se pueden cambiar colores corporativos
      razón: "Mantener consistencia visual del SaaS"
      colores_fijos: "Definidos por Rau Solutions"
      
      Post_MVP:
        - Color primario configurable
        - Color secundario configurable
        - Presets de temas
    
    fuentes:
      ❌ No se pueden cambiar fuentes
      razón: "Mantener legibilidad y accesibilidad"
      fuentes_fijas: "System fonts + Google Fonts seleccionadas"
      
      Post_MVP:
        - 3-5 fuentes pre-aprobadas para elegir
    
    layout:
      ❌ No se puede cambiar estructura de páginas
      razón: "Complejidad técnica alta"
  
  Footer:
    
    configuración:
      mostrar_logo_rau: checkbox
      default: true
      texto: "Powered by Rau Solutions"
      
      si_false:
        - Solo muestra logo de la escuela
        - Nota: "Requiere plan Premium" (futuro)

Aplicación_Branding:
  
  dónde_aparece:
    
    portal_estudiante:
      - Header: Logo escuela (grande)
      - Favicon: En tab
      - Footer: Logo escuela (pequeño) + "Powered by Rau" (opcional)
      - Emails: Logo en header
    
    admin_panel:
      - Header: Logo escuela (pequeño) + "Admin Panel"
      - Favicon: mismo
      - No aparece en documentos internos (solo público)
    
    documentos:
      - Recibos: Logo escuela + datos de contacto
      - Certificados: Logo escuela
      - Reportes PDF: Logo en header

Permisos:
  Owner: ✅ Puede cambiar logo y favicon
  Admin: ❌ Solo lectura
```

---

### 9.2 Templates de Recibos

**Decisión:** Template unificado, solo cambia logo y nombre de escuela.

**Implementación:**

```yaml
Receipt_Template:
  
  Template_Único:
    
    descripción: |
      "Todos los recibos tienen el mismo diseño base.
      Solo se personalizan: logo, nombre, datos de contacto."
    
    layout_fijo:
      
      header:
        - Logo de la escuela (izquierda)
        - Datos de la escuela (derecha):
          * Nombre
          * Dirección
          * Teléfono
          * Email
          * CUIT (si existe)
        - Título: "RECIBO INTERNO"
        - Número: "REC-2025-00123"
        - Fecha: date
      
      body:
        - Datos del estudiante:
          * Nombre completo
          * Documento
          * Email
          * Teléfono
        
        - Detalle de compra:
          * Paquete comprado
          * Cantidad de clases
          * Precio unitario
          * Descuento (si aplica)
          * Total
        
        - Información de pago:
          * Método de pago
          * Fecha de pago
          * ID de transacción
        
        - Información de créditos:
          * Créditos otorgados
          * Fecha de vencimiento
          * Balance total después de compra
      
      footer:
        - Nota: "Este recibo NO es válido como factura fiscal"
        - Firma (opcional, si está configurada)
        - Footer text (configurable)
    
    estilos_fijos:
      - Fuente: Sans-serif profesional
      - Colores: Blanco y negro + 1 color acento
      - Márgenes: Estándar
      - Tamaño: A4
  
  Configuración_Personalizable:
    
    ubicación: "Settings → Recibos"
    
    opciones:
      
      firma_digital:
        label: "Firma del Responsable"
        tipo: file_upload
        formatos: [png, jpg]
        dimensiones: "300x100px"
        uso: "Aparece en footer del recibo"
      
      footer_text:
        label: "Texto del Footer"
        tipo: textarea
        max_length: 200
        placeholder: "Gracias por confiar en nosotros"
        opcional: true
      
      incluir_qr:
        label: "Incluir QR de verificación"
        tipo: checkbox
        default: false
        nota: "Requiere sistema de verificación online (Post-MVP)"
      
      numeración:
        label: "Formato de numeración"
        opciones:
          - "REC-{AÑO}-{NÚMERO}" (default)
          - "REC-{ESCUELA}-{AÑO}-{NÚMERO}"
        
        auto_increment: true
        no_editable_manual: true
  
  Generación:
    
    cuándo:
      - Automática al confirmar pago
      - On-demand desde historial de pagos
      - Batch para múltiples pagos
    
    formato: PDF
    
    storage:
      - Temporal (24h) para downloads
      - Regenerable en cualquier momento
  
  NO_Hay_Múltiples_Templates:
    
    razón: "Mantener consistencia profesional"
    
    Post_MVP:
      - 2-3 templates pre-diseñados
      - Owner puede elegir cuál usar
      - Ejemplo: "Clásico", "Moderno", "Minimalista"

Permisos:
  Owner: ✅ Puede configurar firma y footer
  Admin: ⚠️ Configurable
  Secretary: ❌ Solo lectura
```

---

## 10. Audit Log

### 10.1 Audit Log Completo

**Decisión:** Audit log visible con todas las características mencionadas.

**Implementación:**

```yaml
Audit_Log_System:
  
  Ver_También: "Sección 5.2 - Staff Activity Log"
  
  Nota: |
    "El Audit Log es una extensión del Staff Activity Log.
    Staff Activity Log = solo acciones de staff
    Audit Log = todas las acciones del sistema (staff + automatizadas)"
  
  Ubicación: "Settings → Audit Log"
  
  Eventos_Registrados:
    
    categorías:
      
      autenticación:
        - Login exitoso
        - Login fallido (3+ intentos)
        - Logout
        - Password reset
        - 2FA habilitado/deshabilitado (futuro)
      
      estudiantes:
        - student.created (quién, cuándo)
        - student.updated (cambios específicos)
        - student.deleted
        - student.status_changed (activo→inactivo, etc)
        - student.credits_adjusted
      
      pagos:
        - payment.registered
        - payment.confirmed
        - payment.failed
        - payment.refunded (motivo)
        - package.purchased
      
      clases:
        - class.scheduled (por quién)
        - class.cancelled (motivo, por quién)
        - class.rescheduled
        - class.completed
        - class.no_show
      
      staff:
        - staff_user.created
        - staff_user.updated (cambios)
        - staff_user.deactivated
        - staff_user.deleted
        - staff_user.permissions_changed
      
      configuración:
        - settings.school_info_updated
        - settings.policies_updated (qué cambió)
        - package.created
        - package.updated (precio, validez, etc)
        - package.deleted
      
      vehículos:
        - vehicle.created
        - vehicle.updated
        - vehicle.maintenance_scheduled
        - vehicle.maintenance_completed
        - vehicle.status_changed (active→maintenance)
      
      instructores:
        - instructor.created
        - instructor.updated
        - instructor.license_expiring (alerta automática)
        - instructor.payment_processed
      
      sistema:
        - backup.completed
        - backup.failed
        - integration.mercadopago_connected
        - integration.mercadopago_error
        - alert.critical_triggered
  
  Estructura_Log_Entry:
    
    campos:
      id: uuid
      timestamp: datetime (precisión milisegundos)
      event_type: string (ej: "student.updated")
      category: enum [authentication, students, payments, etc]
      user_id: uuid (quien hizo la acción, null si automático)
      user_role: enum (owner, admin, secretary, etc)
      target_type: string (ej: "student", "payment")
      target_id: uuid (estudiante/pago/clase afectado)
      changes: jsonb (qué cambió exactamente)
      ip_address: string
      user_agent: string
      session_id: string
      notes: text (opcional, para acciones manuales)
    
    ejemplo_json:
      ```json
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "timestamp": "2025-10-23T14:35:22.123Z",
        "event_type": "student.updated",
        "category": "students",
        "user_id": "uuid-maria-secretary",
        "user_role": "secretary",
        "target_type": "student",
        "target_id": "uuid-juan-estudiante",
        "changes": {
          "phone": {
            "old": "1234-5678",
            "new": "8765-4321"
          },
          "address": {
            "old": "Calle Vieja 123",
            "new": "Calle Nueva 456"
          }
        },
        "ip_address": "190.123.45.67",
        "user_agent": "Mozilla/5.0...",
        "session_id": "sess_abc123",
        "notes": null
      }
      ```
  
  Vista_UI:
    
    filtros:
      
      por_categoría:
        tipo: multiselect
        opciones: [Todas, Autenticación, Estudiantes, Pagos, ...]
      
      por_usuario:
        tipo: dropdown con búsqueda
        opciones: [Todos los usuarios, específico]
      
      por_tipo_evento:
        tipo: multiselect
        opciones: [Todos, student.created, payment.registered, ...]
      
      por_fecha:
        tipo: date range
        presets:
          - Hoy
          - Últimos 7 días
          - Últimos 30 días
          - Custom
      
      por_ip:
        tipo: text input
        uso: "Buscar acciones desde IP específica (seguridad)"
    
    tabla:
      columnas:
        - Timestamp
        - Evento
        - Categoría (badge)
        - Usuario
        - Objetivo (qué fue afectado)
        - IP
        - Detalles
      
      ordenamiento: "Más reciente primero"
      
      paginación: "50 por página"
    
    detalle_expandible:
      click_en_fila: "Expandir para ver JSON completo"
      
      muestra:
        - Todos los campos del log entry
        - Cambios específicos (before/after)
        - Metadata completa
  
  Exportación:
    
    botón: "Exportar Audit Log"
    
    formatos:
      - CSV: Para análisis en Excel
      - JSON: Para procesamiento técnico
      - PDF: Para auditorías oficiales
    
    opciones:
      - Seleccionar rango de fechas
      - Seleccionar columnas a incluir
      - Incluir/excluir cambios detallados
      - Agregar notas de auditoría
    
    límite: "Máximo 50,000 registros por export"
    
    seguridad:
      - Export se registra en audit log
      - Solo Owner y Admin pueden exportar
  
  Búsqueda_Avanzada:
    
    campo_búsqueda:
      placeholder: "Buscar en audit log..."
      
      busca_en:
        - Nombre de usuario
        - Email
        - Evento tipo
        - Target ID
        - Notas
      
      resultado: "Resalta coincidencias en tabla"
  
  Retención:
    
    política:
      - Logs se guardan por 365 días (1 año)
      - Después: archivados en cold storage
      - Acceso a archivados: requiere request a soporte
    
    configuración:
      ubicación: "Settings → Audit Log → Retención"
      
      opciones:
        - 90 días
        - 180 días
        - 365 días ⭐ (default, recomendado)
        - Indefinido (no recomendado, costo storage)
    
    cumplimiento:
      - Requerido por normativas (PDPA Argentina)
      - Útil para auditorías externas
      - Evidencia en caso de disputas

Permisos:
  Owner: ✅ Acceso completo, puede exportar
  Admin: ✅ Acceso completo, puede exportar
  Secretary: ⚠️ Solo puede ver logs relacionados a sus acciones
  Instructor: ⚠️ Solo puede ver logs relacionados a sus acciones
```

---

## 11. Bulk Operations

### 11.1 Operaciones Masivas

**Decisión:** Sí a bulk operations incluyendo importar contactos.

**Implementación:**

```yaml
Bulk_Operations:
  
  Ubicación: "Herramientas → Operaciones Masivas"
  
  Operación_1_Email_Masivo:
    
    descripción: "Enviar email a múltiples estudiantes"
    
    wizard:
      
      paso_1_seleccionar_destinatarios:
        
        opciones:
          
          filtros:
            label: "Seleccionar por filtros"
            opciones:
              - Todos los estudiantes activos
              - Estudiantes con créditos por vencer (< 7 días)
              - Estudiantes inactivos (sin créditos)
              - Estudiantes graduados
              - Custom (filtros avanzados)
          
          manual:
            label: "Seleccionar manualmente"
            ui: "Lista con checkboxes"
            búsqueda: "Buscar estudiantes"
          
          import_csv:
            label: "Importar lista (CSV)"
            formato: "Email o ID por línea"
        
        preview: "X estudiantes seleccionados"
      
      paso_2_componer_email:
        
        asunto:
          label: "Asunto"
          tipo: text
          obligatorio: true
          variables: {{nombre}}, {{escuela}}
        
        cuerpo:
          label: "Mensaje"
          tipo: rich text editor
          variables:
            - {{nombre}}
            - {{escuela}}
            - {{créditos}}
            - {{vencimiento}}
          
          templates:
            dropdown: "Usar template"
            opciones:
              - "Promoción especial"
              - "Recordatorio créditos venciendo"
              - "Encuesta satisfacción"
              - "Nuevo horario disponible"
          
          preview: "Vista previa del email"
        
        adjuntos:
          label: "Archivos adjuntos"
          max_size: 5MB total
          formatos: [pdf, jpg, png]
      
      paso_3_programar_envío:
        
        opciones:
          - "Enviar ahora"
          - "Programar para después"
            * Fecha: date picker
            * Hora: time picker
        
        nota: "Los emails se envían de a X por minuto para evitar spam"
      
      paso_4_confirmación:
        
        resumen:
          - Destinatarios: X estudiantes
          - Asunto: "..."
          - Programado para: now / date
          - Costo: "Gratis" (incluido en plan)
        
        botones:
          - "← Volver"
          - "Enviar Emails"
    
    tracking:
      - Ver estado de envío
      - Cantidad enviados / fallidos
      - Tasa de apertura (si integrado con ESP)
  
  Operación_2_Marcar_Clases_Completadas:
    
    descripción: "Marcar múltiples clases pasadas como completadas"
    
    uso: "Para clases que ocurrieron pero no se marcaron"
    
    filtros:
      - Clases con status 'scheduled'
      - Fecha en el pasado
      - Instructor específico (opcional)
    
    preview:
      tabla: Muestra clases que serán marcadas
      columnas:
        - Fecha
        - Estudiante
        - Instructor
        - Select (checkbox)
    
    acción:
      - Seleccionar clases
      - Botón "Marcar como Completadas"
      - Confirmación con cantidad
      - Bulk update en DB
      - Notificaciones a estudiantes (opcional)
  
  Operación_3_Aplicar_Descuento_Múltiples:
    
    descripción: "Aplicar descuento a múltiples estudiantes"
    
    casos_uso:
      - "Promoción de fin de mes"
      - "Descuento por lealtad a estudiantes antiguos"
      - "Compensación por inconveniente"
    
    wizard:
      
      seleccionar_estudiantes:
        similar_a_email_masivo
      
      configurar_descuento:
        tipo: dropdown ['porcentaje', 'monto_fijo']
        valor: number
        válido_hasta: date (nullable)
        razón: text (obligatorio, para audit)
      
      aplicar:
        - Preview de estudiantes afectados
        - Confirmación
        - Aplicación masiva
        - Log en audit trail
  
  Operación_4_Exportar_Datos_Múltiples:
    
    descripción: "Exportar data de múltiples estudiantes"
    
    selección:
      - Filtros (igual que email masivo)
      - Selección manual
    
    opciones_export:
      - Incluir: perfil, pagos, clases, créditos
      - Formato: CSV / Excel / JSON
    
    generación:
      - Job asíncrono (puede tardar)
      - Notificación cuando está listo
      - Download link
  
  Operación_5_Importar_Contactos:
    
    descripción: "Importar lista de contactos/clientes desde CSV/Excel"
    
    casos_uso:
      - Migración desde sistema anterior
      - Importar lista de prospectos
      - Agregar contactos de campañas
    
    wizard:
      
      paso_1_upload:
        
        label: "Subir archivo"
        formatos: [CSV, XLSX, XLS]
        max_size: 10MB
        
        template_descargable:
          botón: "Descargar Template"
          archivo: "template_import_contactos.csv"
          columnas:
            obligatorias:
              - nombre_completo
              - email
              - teléfono
            opcionales:
              - documento_tipo
              - documento_numero
              - dirección
              - fecha_nacimiento
              - contacto_emergencia
              - notas
        
        validación_inicial:
          - Verificar formato
          - Verificar columnas obligatorias
          - Mostrar errores si los hay
      
      paso_2_mapear_columnas:
        
        descripción: "Sistema intenta auto-mapear columnas"
        
        tabla_mapping:
          columnas:
            - Columna en archivo
            - Mapea a (dropdown)
            - Preview (primeras 3 filas)
          
          ejemplo:
            - "Nombre" → "nombre_completo" → "Juan Pérez, María López, ..."
            - "Email" → "email" → "juan@example.com, ..."
            - "Teléfono" → "teléfono" → "1234-5678, ..."
        
        validación:
          - Verificar que obligatorias están mapeadas
          - Advertir si columnas no usadas
      
      paso_3_preview_validación:
        
        tabla_preview:
          muestra: "Primeras 10 filas"
          columnas: Todas las mapeadas
          
          errores_por_fila:
            - Email inválido → ⚠️ (en rojo)
            - Teléfono mal formato → ⚠️
            - Datos duplicados → ⚠️
        
        resumen:
          - Total filas: X
          - Válidas: Y
          - Con errores: Z
          - Duplicados: W
        
        opciones:
          - "Importar solo válidas"
          - "Corregir errores y re-intentar"
          - "Cancelar import"
      
      paso_4_confirmar_import:
        
        opciones:
          
          crear_como:
            label: "Crear contactos como"
            opciones:
              - "Prospectos" (sin créditos, inactivos)
              - "Estudiantes activos" (requiere asignar paquete)
          
          si_duplicado:
            label: "Si email ya existe"
            opciones:
              - "Saltar (no importar)"
              - "Actualizar información existente"
              - "Crear de todos modos" (permitir duplicados)
          
          enviar_bienvenida:
            label: "Enviar email de bienvenida"
            checkbox: true/false
            default: false
        
        confirmación:
          - "Vas a importar X contactos"
          - "Esto no se puede deshacer fácilmente"
          - Botón "Confirmar Import"
      
      paso_5_procesamiento:
        
        progress_bar:
          - "Importando... X de Y (Z%)"
          - Animación de carga
        
        resultado:
          - "Importados exitosamente: X"
          - "Con errores: Y"
          - "Duplicados saltados: Z"
          - "Botón: Descargar log de errores"
        
        acciones:
          - "Ver estudiantes importados"
          - "Importar más"
          - "Volver al dashboard"
    
    limitaciones:
      - Máximo 1000 contactos por import
      - Si necesitas más: múltiples imports
      - Rate limit: 1 import cada 5 minutos

Permisos:
  Owner: ✅ Todas las operaciones
  Admin: ✅ Todas las operaciones
  Secretary: ⚠️ Algunas operaciones (configurable)
  Instructor: ❌ No tiene acceso
```

---

## 12. Integration con Metabase

### 12.1 Metabase Setup

**Decisión:** Opción C - Dashboard custom simple + link a Metabase.

**Implementación:**

```yaml
Metabase_Integration:
  
  Arquitectura:
    
    componentes:
      
      custom_dashboard:
        descripción: "Dashboard nativo en el SaaS"
        ubicación: "Dashboard (home)"
        contenido:
          - KPIs principales (ver sección 1)
          - Gráficos básicos
          - Alertas críticas
          - Acceso rápido a módulos
        
        características:
          - Responsive
          - Real-time (o casi)
          - Integrado con el sistema
          - Limitado a métricas básicas
      
      metabase:
        descripción: "Análisis profundo y reportes"
        ubicación: "Link desde dashboard"
        contenido:
          - Dashboards complejos
          - Queries custom
          - Reportes avanzados
          - Gráficos interactivos (drill-down)
        
        características:
          - SQL queries
          - Múltiples vistas
          - Exportación avanzada
          - Colaboración (compartir dashboards)
    
    flujo:
      1. Owner entra al sistema
      2. Ve dashboard custom (rápido, overview)
      3. Si necesita análisis profundo: click "Ver Análisis Avanzado"
      4. Se abre Metabase en nueva pestaña
      5. SSO automático (no re-login)
      6. Ve dashboards pre-configurados
      7. Puede crear queries propias
  
  Setup_Metabase:
    
    hosting:
      opción: "Rau Solutions hostea Metabase centralmente"
      infraestructura:
        - Docker container
        - Base de datos compartida (cada school aislada)
        - Subdominio: analytics.drivingschool.com
    
    por_school:
      - Database connection: PostgreSQL read-only replica
      - User: metabase_school_{school_id}
      - Permisos: Solo lectura en tablas de esa school
      - RLS: Row Level Security para aislar data
    
    configuración_inicial:
      
      dashboards_pre_creados:
        
        1. "Overview Financiero":
          - Ingresos por mes (12 meses)
          - Ingresos por método de pago
          - Ingresos por paquete
          - Proyección
          - Comparación YoY
        
        2. "Performance Operacional":
          - Clases por instructor
          - Utilización de vehículos
          - Horarios pico (heatmap)
          - Tasa de cancelaciones
        
        3. "Estudiantes":
          - Estudiantes activos vs inactivos
          - Tasa de conversión
          - Tiempo hasta graduación
          - Tasa de asistencia
        
        4. "Pagos":
          - Pagos pendientes
          - Refunds
          - Métodos de pago trending
        
        5. "Instructor Performance":
          - Clases por instructor
          - Revenue por instructor
          - Tasa de cancelación
          - Evaluaciones promedio
      
      questions_útiles:
        - "¿Cuántos estudiantes nuevos este mes?"
        - "¿Qué paquete se vende más?"
        - "¿Qué instructor tiene más clases?"
        - "¿Cuál es el horario más popular?"
        - "¿Cuánto ingresó la semana pasada?"
  
  SSO_Integration:
    
    método: "JWT-based SSO"
    
    flujo:
      1. User hace click "Ver Análisis Avanzado"
      2. Sistema genera JWT token:
         - user_id
         - school_id
         - role
         - expiration (1 hora)
      3. Redirect a: analytics.drivingschool.com/auth/sso?token={jwt}
      4. Metabase valida JWT
      5. Crea/actualiza session
      6. Redirige a dashboard principal
    
    seguridad:
      - JWT firmado con secret compartido
      - Expiration corta (1h)
      - Rotate secrets periódicamente
      - HTTPS obligatorio
  
  Permisos_Metabase:
    
    por_rol:
      
      Owner:
        - Ve todos los dashboards
        - Puede crear queries custom
        - Puede crear dashboards propios
        - Puede compartir con otros
      
      Admin:
        - Ve todos los dashboards
        - Puede crear queries custom
        - Puede crear dashboards propios
      
      Secretary:
        - Ve dashboards limitados (configurables)
        - NO puede crear queries (SQL riesgo)
        - Solo visualización
      
      Instructor:
        - Ve solo dashboard "Instructor Performance"
        - Solo sus propias métricas
        - NO puede ver data de otros instructores
  
  UI_Integration:
    
    en_dashboard_custom:
      
      widget:
        título: "Análisis Avanzado"
        descripción: "Reportes y análisis profundos con Metabase"
        
        quick_links:
          - "📊 Dashboard Financiero"
          - "📈 Performance Operacional"
          - "👥 Análisis de Estudiantes"
          - "💰 Reportes de Pagos"
          - "🎨 Crear Reporte Custom"
        
        botón_principal: "Abrir Metabase"
      
      icono_header:
        - Ícono de gráfico en menu superior
        - Click → abre Metabase
        - Badge: "Analytics"
  
  Mantenimiento:
    
    responsable: "Rau Solutions"
    
    incluye:
      - Updates de Metabase
      - Backups de dashboards
      - Monitoring de performance
      - Soporte a Owner si tiene preguntas
      - Crear dashboards custom (servicio adicional)
    
    Owner_NO_necesita:
      - Instalar nada
      - Configurar servidor
      - Gestionar usuarios
      - Actualizar software

Gráficos_Custom_Dashboard:
  
  características:
    - Estáticos (no interactivos con drill-down)
    - Pre-renderizados
    - Fast loading
    - Exportables como imagen
  
  NO_incluye:
    - Drill-down (click para ver detalle)
    - Filters dinámicos complejos
    - SQL queries custom
  
  para_eso_usar: "Metabase"

Exportación:
  
  desde_custom_dashboard:
    - Solo PDF de vista actual
    - CSV de tablas simples
  
  desde_metabase:
    - PDF, CSV, Excel, JSON
    - Programar envíos automáticos
    - Múltiples formatos
```

---

## 📊 Resumen Técnico - MVP Scope

### **Features Incluidos en MVP:**

✅ **Dashboard Completo:**
- KPIs críticos + disponibilidad de citas
- Revenue multi-vista
- Alertas críticas prominentes
- Comparación con período anterior

✅ **Reportes:**
- Financieros (7 tipos)
- Operacionales (instructores, vehículos, estudiantes)
- Horarios pico
- Cancelaciones
- Exportación PDF + Excel

✅ **Configuración:**
- Información básica de escuela
- Políticas de scheduling configurables
- Políticas de cancelación configurables
- Políticas de créditos configurables
- CRUD de paquetes
- Gestión de días no laborables

✅ **Gestión de Staff:**
- CRUD usuarios
- Matriz de permisos configurable
- Activity log completo
- Audit trail

✅ **Alertas:**
- Sistema completo de 3 niveles
- Todas las alertas mencionadas
- Resolución y tracking

✅ **Calendario Maestro:**
- Vista semana/día/mes
- Drag & drop
- Detección de conflictos
- Filtros por recurso

✅ **Branding:**
- Logo y favicon personalizable
- Templates de recibos unificados

✅ **Bulk Operations:**
- Email masivo
- Marcar clases completadas
- Aplicar descuentos
- Exportar datos
- Importar contactos

✅ **Metabase:**
- Link desde dashboard
- SSO integration
- Dashboards pre-configurados

---

### **Features Post-MVP:**

❌ Múltiples sedes por School  
❌ Búsqueda global  
❌ Atajos de teclado  
❌ Super-admin panel (por ahora)  
❌ Personalización de colores/fuentes  
❌ Múltiples templates de recibos  
❌ WhatsApp propio número  
❌ Templates WhatsApp personalizables  

---

## 🚀 Siguiente Paso: Fase 7

Ahora que terminamos la Fase 6, ¿continuamos con la **Fase 7: Testing & Deployment**?

Esta fase incluirá:
- Testing strategy completa
- CI/CD pipeline
- Deployment a producción
- Monitoring y alertas
- Rollout plan

¿Empezamos con las preguntas de Fase 7? 🎯
## 4.11 Ausencia Justificada – Workflow y Configuración (MVP)

Objetivo: centralizar la gestión de justificativos y alinear reglas de devolución/pagos con las fases 3 y 5.

Configuración (Settings → Políticas → Ausencias Justificadas):
- Habilitar módulo:
  - toggle: enabled (default: ON)
- Ventana de presentación:
  - number: horas_post_clase (default: 24)
- Aprobadores:
  - multiselect: Owner, Secretary (ambos permitidos por default)
- Motivos aceptados:
  - checkboxes:
    - Salud (requiere certificado/constancia fechada)
    - Emergencia familiar (documentación fehaciente)
    - Fuerza mayor (parte policial/evidencia verificable)
  - campo “Otro” con descripción (opcional)
- Requerimientos de evidencia:
  - file_upload: pdf/jpg/png (max 5MB)
  - notas internas (solo staff)

Workflow de revisión (Módulo: Justificativos):
- Bandeja “Pendientes / Aprobados / Rechazados”
- Por registro:
  - Estudiante, Clase, Fecha/Hora, Motivo, Evidencia, Notas
  - Botones: Aprobar / Rechazar
- Al aprobar:
  - Ledger: crear asiento justified_absence_approved (+0.5 o +1.0 según ventana; ver [DECISIONES_FASE_3_Recursos.md](DECISIONES_FASE_3_Recursos.md))
  - Pago a instructor: NO cobra (si hubo provisión, generar reverso)
  - Notificaciones: Email/WhatsApp al estudiante (según configuración)
- Al rechazar:
  - Se mantiene penalización original (sin asientos compensatorios)
  - Notificación al estudiante

Referencias:
- Reglas de crédito y ledger en [DECISIONES_FASE_3_Recursos.md](DECISIONES_FASE_3_Recursos.md)
- UI/Portal y bloqueo &lt;12h en [DECISIONES_FASE_5_StudentPortal.md](DECISIONES_FASE_5_StudentPortal.md)

---

## 4.12 Cancelación – Parámetros de Política (Unificación 24/12/0 + bloqueo &lt;12h)

Settings → Políticas → Cancelación:
- Ventanas:
  - “≥ 24h”: devolución 1.0 (fijo en MVP)
  - “12–24h”: devolución 0.5 (fijo en MVP)
  - “&lt; 12h”: devolución 0.0 (fijo en MVP)
- Bloqueo en portal:
  - bloquear_cancelación_menos_12h: true (default)
  - Nota: staff puede cancelar en cualquier momento (excepción)
- Simulador:
  - Calculadora: dada fecha/hora de clase y hora de cancelación, mostrar devolución esperada y mensaje de política
- Auditoría:
  - Cambios de política se registran en audit log

Efecto operativo (siempre descontar y luego compensar):
- En faltas/late, el sistema descuenta 1.0 y luego:
  - 12–24h sin justificativo: +0.5 (partial_refund)
  - 12–24h con justificativo: +0.5 (partial_refund) +0.5 (justified_absence_approved)
  - &lt;12h/no-show con justificativo: +1.0 (justified_absence_approved)
- Ver detalle contable en [DECISIONES_FASE_5_StudentPortal.md](DECISIONES_FASE_5_StudentPortal.md) y [DECISIONES_FASE_3_Recursos.md](DECISIONES_FASE_3_Recursos.md)

---

## 4.13 Disponibilidad de Instructores – Auto-bloqueo sujeto a aprobación

Alineación con Fase 2:
- Setting: instructors_can_self_block (default: OFF)
- Si OFF:
  - Solo Owner/Admin pueden bloquear días del instructor (aprobado automáticamente)
- Si ON:
  - Instructor puede solicitar bloqueos:
    - Estado: pending → approved/rejected (aprobadores: Owner/Admin)
    - Motivos: vacation, medical, personal, other
    - Evidencias (opcional)
- Vista de aprobación:
  - Bandeja de solicitudes con filtros por fecha/instructor/estado
- Impacto:
  - Al aprobar: calendario bloquea esos días y se previenen citas

Referencia:
- Validaciones de scheduling y RLS en [fase1-2-juntas.md](fase1-2-juntas.md)

---

## 6.x Alertas y Reportes relacionados

Alertas:
- “Justificativo pendiente por vencer” (falta &lt;= 12h para fin de ventana de 24h post-clase)
- “Bloqueo instructor pendiente de aprobación” (si instructors_can_self_block = ON)
- “Alto volumen de cancelaciones 12–24h” (umbral configurable)

Reportes:
- Cancelaciones por ventana (≥24h / 12–24h / &lt;12h)
- Tasa de justificaciones aprobadas vs rechazadas
- Créditos compensatorios otorgados (parciales y totales)
- Impacto en pagos a instructores por ausencias justificadas

---

## 11.x Exportaciones y Auditoría

- Export de justificativos (CSV/Excel) con campos: estudiante, clase, fecha, motivo, estado, aprobador, timestamps
- Audit log:
  - justification.created / approved / rejected
  - policy.changed (cancelación)
  - instructor_availability.requested / approved / rejected

---

Notas de implementación (DB y Ledger):
- Nuevos tipos de transacción (ledger):
  - reserved, released, credit_used, partial_refund, justified_absence_requested, justified_absence_approved, justified_absence_rejected, no_show
- Modelo fraccional de créditos:
  - fractional_amount DECIMAL(3,2); ejemplos con 0.50 en “parcial”
- Pagos a instructor:
  - Reglas reflejadas en recibos y cálculo de período (si reverso por justificada aprobada, mostrar asiento de ajuste)