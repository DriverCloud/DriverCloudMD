# 📋 FASE 3 y 4: Preguntas de Decisión

---

# 🎯 FASE 3: Gestión de Recursos (Students, Instructors, Vehicles)

---

## **TEMA 1: CRUD de Students**

### **Información básica:**
1. ¿Qué información del estudiante es OBLIGATORIA para crear su perfil? (nombre, email, teléfono, documento, dirección, fecha nacimiento, etc.)
Agregar, numero de contacto de un familiar, campo de comentarios y/ aclaraciones
2. ¿Hay información que sea opcional pero deseable capturar? (fecha de nacimiento, dirección, foto de perfil, etc.)
Todos los datos requeridos ya son solicitados en el punto 1
3. ¿Necesitan capturar información legal del estudiante? (tipo de documento, número, foto del documento, firma digital, etc.)
Si, lo ideal seria implementarlo despues
4. ¿Los estudiantes pueden auto-editar su perfil, o solo el staff puede modificar su información?
Solo el staff
5. ¿Necesitan campo de "notas internas" que solo el staff puede ver? (ej: "Estudiante nervioso", "Prestar atención especial")
Si, las necesitamos, que solo lo lea el staff
---

## **TEMA 2: Sistema de Créditos de Students**

### **Cómo funcionan los créditos:**
6. ¿Un crédito = una clase de cualquier tipo, o hay clases que consumen más créditos? (ej: clase práctica = 1 crédito, clase con instructor premium = 2 créditos)
Todas las clases alen 1 credito.
7. Cuando un estudiante compra un paquete de 10 clases: ¿Los créditos tienen fecha de vencimiento, o son válidos para siempre?
Si, tiene que tener un vencimiento, que debe ser establecido por cada escuela.
8. ¿Hay diferentes tipos de paquetes? (ej: "Paquete 10 clases", "Paquete 20 clases", "Mensual ilimitado", etc.)
Si, va a haber distintos paquetes
9. ¿El precio de los paquetes es igual para todos los estudiantes, o puede haber descuentos personalizados?
Puede haber descuentos personalizados
10. ¿Necesitan sistema de "créditos promocionales" o "clases de prueba gratis"?
Si, creditos promocionales si - referidos, lo que generan clases/puntos gratis , clases de prueba gratis tambien.
11. ¿Qué pasa si un estudiante tiene clases pendientes pero se acabaron sus créditos? ¿Puede agendar igual y quedar con balance negativo, o está bloqueado hasta pagar?
Una clase vale un credito, entonces si el alumno asistio a la clase, se consumio el credito, si falto y aviso con mas de X horas de anticipacion, y se logro reprogramar, no pierde el credito. y si falta sin avisar, pierde el credito, por lo tanto no encuentro un escenario donde una persona pueda tener distinto numero de clases y de credito. En resumen, siempre el n de clases es el mismo n de creitos.
12. ¿Necesitan historial de transacciones de créditos? (ej: "Compró 10 créditos el 01/01, usó 1 el 05/01, quedan 9")
SI, SI SI
---

## **TEMA 3: Packages (Paquetes de Clases)**

### **Configuración de paquetes:**
13. ¿Quién crea los paquetes disponibles? (Owner/Admin define: "Paquete A = 10 clases por $X", "Paquete B = 20 clases por $Y")
El dueño, o la secretaria
14. ¿Los paquetes son iguales en todas las Schools de un Owner, o cada School tiene sus propios precios?
No, cada escuela podria tener sus propios precios.
15. ¿Hay paquetes con "clase de prueba incluida"? (ej: compras paquete 10 y te regalan 1)
Eso suena mas a una promocion, es decir te doy una clase gratuita, y si te gusta me compras el paquete de 10, pero en si el paquete tiene 10, no 11. 
16. ¿Necesitan paquetes con validez temporal? (ej: "10 clases válidas por 3 meses")
Si
17. ¿Puede un estudiante tener múltiples paquetes activos al mismo tiempo? (ej: compró paquete de 10, usó 5, compró otro de 20, ahora tiene 5+20=25 créditos)
Si, ya que quizas si compro 10 clases, cuando lleva usadas 8, se da cuenta que va a necesitar X clases mas, y compra un paquete extra, es decir, tiene 2 paquetes en simultaneo, 1 con utilizacion 8/10 y el otro 0/X.
---

## **TEMA 4: Student Status y Lifecycle**

### **Estados del estudiante:**
18. ¿Qué estados puede tener un estudiante? (ej: "Activo", "Inactivo", "Bloqueado", "Egresado", "Prospecto")
Esos estados que mencionas estan bien
19. ¿Cómo se marca que un estudiante "se graduó" o "terminó el curso"?
mmm tendria que tener un campo de donde se señale la fecha de finalizacion de curso, la fecha de examen de conduccion, y si aprobo o no
20. ¿Necesitan re-activar estudiantes inactivos? (ej: estudiante que dejó de venir hace 6 meses vuelve)
Si, se necesita
21. ¿Hay estudiantes "en pausa" que no pueden agendar pero mantienen sus créditos?
Si, podria haber casos de este tipo.
---

## **TEMA 5: CRUD de Instructors**

### **Información del instructor:**
22. ¿Qué información del instructor es OBLIGATORIA? (nombre, email, teléfono, licencia de conducir, certificaciones, etc.)
Todo eso, mas los datos escritos de la licencia de conducir, su licencia, el telefono de contacto de un familiar. 
23. ¿Necesitan campos específicos legales del instructor? (licencia profesional, fecha de vencimiento, tipo de vehículo que puede manejar, etc.)
No
24. ¿Instructores pueden tener "especialidades"? (ej: "Experto en estacionamiento", "Certificado para motos", etc.)
Si, dividades en el tiupo de vehiculo, ej, instructor de moto, e instructor de auto. 
25. ¿Necesitan tracking de cuándo vence la licencia del instructor para alertar?
Si
---

## **TEMA 6: Instructor Payments (Compensación)**

### **Cómo se pagan a instructores:**
26. ¿Los instructores son empleados fijos (salario mensual) o se les paga por clase dictada?
Depende de la estructura de la escuela, 
27. Si es por clase: ¿Todas las clases pagan lo mismo, o hay clases que pagan diferente? (ej: clase práctica $X, clase teórica $Y)
Las clases podrian o no valer lo mismo, es mejor dejar que el dueno lo decida.
28. ¿El sistema debe calcular automáticamente cuánto se le debe a cada instructor al fin de mes?
Seria ideal, y que tenga un log, podria ser semanal, diario, mensual, quincenal, etc. seria ideal un friltro, y ademas opciones predefinidas, como las que te comente antes. 
29. ¿Necesitan generar "recibos de pago" o "comprobantes" para los instructors?
Si, seria ideal, que tenga la cantidad de clases dadas y el monto correspondiente, y que tenga la opcion de imprimirse el log de las clases para que el chofer pueda ver que clases dio con que alumno, esto tambien debe poderse exportar en PDF.
30. ¿Los instructors pueden ver cuánto han ganado en el sistema, o eso es privado solo para Owner?
Si, seria ideal que puedan obtener esa info, LIMITADA a ellos mismo, es decir NO podrian ver lo de otros instructores
---

## **TEMA 7: Instructor Availability (ya parcialmente cubierto en Fase 2)**

### **Confirmación:**
31. En Fase 2 decidimos que instructores pueden (o no) auto-bloquearse según configuración. ¿Hay algo más de disponibilidad que necesites? (horarios preferenciales, zonas donde no trabajan, etc.)
El instructor debe hablarlo con el dueño, y es este quien le puede bloquear la fecha. y la secretaria tambien.  
---

## **TEMA 8: CRUD de Vehicles**

### **Información del vehículo:**
32. ¿Qué información del vehículo es OBLIGATORIA? (marca, modelo, año, patente, color, tipo de transmisión, etc.)
tipo de combustible, kilometraje. 
33. ¿Necesitan tracking de documentación legal del vehículo? (seguro, VTV, fecha de vencimiento, patente, registro, etc.)
Si, es absolutamente necesario, TODO eso que mencionaste, tambien obleas de GNC (gas natural comprimido)
34. ¿Vehículos pueden tener "características especiales"? (ej: "Tiene cámara reversa", "Tiene sensores de estacionamiento", "Es para motos", etc.)
Si, podria tenerlo.
35. ¿Necesitan fotos de los vehículos?
Si, estaria bueno.
---

## **TEMA 9: Vehicle Maintenance**

### **Mantenimiento preventivo:**
36. ¿Necesitan scheduling de mantenimiento? (ej: cada 10,000 km hacer service, cada 6 meses renovar seguro)
SI, y deber poderse decidir con factor de KM recorrdigo, y ademas tiempo. 
37. ¿Qué información del mantenimiento necesitan guardar? (fecha, tipo de service, costo, próximo service, etc.)
TODO eso, quien realizo el mantenimiento, gastos de mantenimiento, que se le hizo, ademas de todo lo que propusiste. Seria idea poder discriminar los gastos 1 a 1, ej: $50 Correa de distribucion, $20 Cambio de aceite, etc.
38. ¿Cuando un vehículo está en mantenimiento: se bloquea automáticamente en el sistema para no agendar clases?
Lo ideal es programar el mantenimiento, y efectivamente, se bloquea ese auto en el calendario para tomar clases. 
39. ¿Necesitan alertas cuando se acerca fecha de service o vencimiento de seguro?
Para los services se toman en cuenta el kilometraje y el tiempo, expresado en fechas, y para el seguro es por tiempo tambien. Necesitamos alertas.
---

## **TEMA 10: Vehicle Utilization**

### **Asignación y uso:**
40. ¿Cada instructor tiene vehículos "asignados fijos", o cualquier instructor puede usar cualquier vehículo?
Cada instructor puede usar cualquier vehiculo, pero son asignados por la secretario o el dueno
41. ¿Hay vehículos "premium" que solo ciertos instructores pueden usar?
No hay por el momento
42. ¿Necesitan tracking de kilometraje por clase? (ej: para calcular gastos de combustible)
Seria genial. 
---

## **TEMA 11: Compartir Recursos Entre Schools**

### **Multi-school resources (ya discutido en Fase 1 - POSTPONER):**
43. Confirmando de Fase 1: ¿En MVP, instructores y vehículos pertenecen a 1 School solamente, correcto? (no compartidos entre sedes)
Compartir los resusos es ideal, instructores y autos,.
44. ¿Hay casos reales donde tu amigo necesite compartir un instructor o vehículo entre sus 2 sedes?
Si, cuando se rompe un auto en la sede B, y hay un auto ocioso en la sede A. El auto de la sede A se lleva a la B. o cuando un instructor se enferma.
---

## **TEMA 12: Bulk Operations**

### **Operaciones masivas:**
45. ¿Necesitan importar estudiantes desde Excel/CSV? (ej: migración desde sistema viejo)
Si, seria util
46. ¿Necesitan importar instructores o vehículos en masa?
Tambien seria util.
47. ¿O con crear uno por uno manualmente es suficiente?
Esto es una funcionalidad basica, aunque lo de importar deberia estar tambien. 
---

## **TEMA 13: Search y Filters**

### **Búsqueda de recursos:**
48. ¿Necesitan buscar estudiantes por nombre, email, teléfono, documento?
SI, por esos datos que mencionas, nombre, apellido, email, telefono, documento. 
49. ¿Necesitan filtros avanzados? (ej: "Mostrar solo estudiantes activos con créditos > 0", "Instructores disponibles hoy")
Si, seria util. 
50. ¿Qué tan grande puede llegar a ser la lista de estudiantes? (50, 500, 5000?)
Hasta 10.000 es un numero razonable, acumulativo, por escuela. 
---

## **TEMA 14: Data Retention**

### **Borrado de datos:**
51. Cuando "borran" un estudiante: ¿Es soft delete (se marca como eliminado pero datos quedan) o hard delete (se borra de la DB)?
Es un softdelete. 
52. ¿Necesitan mantener histórico de estudiantes que se fueron hace años?
Si, seria lo ideal, por ahora no tenemos tantos estudiantes como para necesitar borrar.
53. ¿Hay requerimientos legales de cuánto tiempo deben retener datos personales? (GDPR, PDPA en Argentina, etc.)
Desconozco, habria que investigar. 
---

# 🎯 FASE 4: Gestión de Pagos

---

## **TEMA 1: Mercado Pago Integration**

### **Experiencia con Mercado Pago:**
54. ¿Tienen CERO experiencia con Mercado Pago, o alguien del equipo ya lo usó antes?
0 experiencia con mercado pago.
55. ¿Ya tienen cuenta de Mercado Pago Business, o necesitan crearla?
no
56. ¿Qué método de pago de Mercado Pago quieren soportar? (Checkout Pro - redirect, Checkout Bricks - embedded, API directa, Link de pago, QR, etc.)
link, qr, todos los que sean posibles
---

## **TEMA 2: Flujo de Compra de Paquetes**

### **Cómo compran los estudiantes:**
57. ¿Estudiantes compran paquetes desde la plataforma (online), o siempre es en persona en la escuela?
Inicialmente se hara por la escuela de manejo, luego cuando avancemos lo habilitamos para que compren online. 
58. Si es online: ¿El Owner quiere aprobar la compra manualmente antes de dar acceso, o es automático después del pago?
automatico 
59. Si es en persona: ¿El pago se registra manualmente en el sistema por Secretary/Owner?
si
60. ¿Aceptan múltiples métodos de pago? (Mercado Pago, efectivo, transferencia bancaria, tarjeta en persona, etc.)
si
---

## **TEMA 3: Registro Manual de Pagos**

### **Pagos offline:**
61. ¿Secretary necesita poder registrar pagos manuales? (ej: "Estudiante pagó $5000 en efectivo por paquete de 10 clases")
si, si el alumno va a la esceuela
62. Cuando se registra pago manual: ¿Necesitan subir comprobante/foto del recibo?
Si es conm mercado pago, tarjeta etc, seria ideal. Si es efectivo es imposible. 
63. ¿Necesitan diferentes "métodos de pago" para elegir? (efectivo, transferencia, cheque, tarjeta, etc.)
Si
64. ¿Owner debe aprobar pagos manuales registrados por Secretary, o se acreditan automáticamente?
Se acreditan automaticamente. 
---

## **TEMA 4: Invoicing (Facturación)**

### **Comprobantes fiscales:**
65. ¿Necesitan generar facturas oficiales (A, B, C) integradas con AFIP?
A corto plazo no. 
66. ¿O con un "recibo interno" es suficiente por ahora?
Siempre por defecto un recibo interno alcanza, pero si el cliente lo pide se hace la factura por AFIP, por FUERA DEL SISTEMA, de manera manual. 
67. ¿Tienen servicio de facturación tercerizado? (ej: Afip.io, FacturAR, etc.)
No
68. ¿Es crítico tener facturación en MVP, o puede ser una feature post-MVP?
Si necesitamos llevar las cuentas, pero no son facturas con valor ffiscal. 
---

## **TEMA 5: Payment History y Reconciliation**

### **Historial de pagos:**
69. ¿Necesitan ver historial completo de pagos de cada estudiante? (fecha, monto, método, paquete comprado, créditos agregados)
Si, %100 es necesario
70. ¿Necesitan reconciliar pagos con extractos bancarios? (ej: "verificar que todos los pagos de Mercado Pago llegaron a la cuenta")
en el MVP no, a menos que sea facil de implementar. 
71. ¿Qué información del pago necesitan guardar? (transaction ID, fecha, monto, método, estado, comprobante, etc.)
Todos esos valores.
---

## **TEMA 6: Refunds (Devoluciones)**

### **Devolución de dinero:**
72. ¿Hay casos donde devuelven dinero a estudiantes? (ej: "canceló el curso, le devolvemos las clases no usadas")
Si, podria haber algunos casos. 
73. Si SÍ: ¿Las devoluciones son automáticas (via Mercado Pago) o manuales (efectivo/transferencia)?
No son automaticas, son manuales aprobadas por el owner y o la secretaria
74. ¿Necesitan tracking de devoluciones en el sistema?
no
75. ¿Hay política de "no hay devoluciones" o depende del caso?
No tenemos politicas, epro las necesitamos. 
---

## **TEMA 7: Pricing Configuration**

### **Gestión de precios:**
76. ¿Los precios de paquetes cambian frecuentemente, o son bastante estables?
Si, cambian frecuentemetne.
77. ¿Necesitan historial de cambios de precios? (ej: "Paquete de 10 clases costaba $5000 en enero, ahora cuesta $6000")
Si, si lo necesitamos.
78. ¿Estudiantes que compraron con precio viejo mantienen ese precio, o pagan el nuevo?
Depende de si se le vencieron las clases o no. 
79. ¿Hay promociones o descuentos temporales? (ej: "Este mes el paquete de 20 tiene 10% off")
Si, definitivamente
---

## **TEMA 8: Payment Notifications**

### **Notificaciones de pago:**
80. ¿Estudiante recibe notificación cuando se acredita su pago? (email, WhatsApp)
Si, seria genial
81. ¿Owner recibe notificación de cada pago que entra?
Deberia heber un apartaeo donde el dueño lo pueda configurar, si quiere o no recibir eso
82. ¿Necesitan resumen diario/semanal de pagos? (ej: "Esta semana ingresaron $50,000")
Seria genial.
---

## **TEMA 9: Failed Payments**

### **Pagos fallidos:**
83. ¿Qué pasa si un pago de Mercado Pago falla o es rechazado?
Si el pago no ingreso, no se otorga ni el curso ni las clases, ni los creditos ni nada. 
84. ¿Estudiante puede re-intentar, o debe contactar al Owner?
Si, puede contactarnos para ese fin
85. ¿Necesitan tracking de intentos fallidos?
Estaria bueno si noe s dificil de implementar
---

## **TEMA 10: Payment Analytics**

### **Reportes financieros:**
86. ¿Qué métricas financieras son importantes para Owner? (ingresos diarios/semanales/mensuales, método de pago más usado, paquete más vendido, etc.)
Todo lo que dijiste, ingresos de alumnos nuevos, de aquellos que compran mas paquetes, cantida de clase. 
87. ¿Estas métricas son críticas para MVP o pueden calcularse manualmente?
SI, son criticas. 
88. ¿Necesitan proyecciones? (ej: "A este ritmo, este mes ingresarán $X")
Estaria buenisimo, si es facil de implementar lo incluimos en el MVP.
---

**Respondé las que consideres más importantes y con tus respuestas voy a crear los documentos de decisiones de Fase 3 y 4 con el mismo formato que Fase 1 y 2.**
