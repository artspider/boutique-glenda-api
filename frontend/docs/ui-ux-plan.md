# UI/UX Guardrails y Criterios de Aceptación

## Alcance de la Fase 0

Esta fase define la base de trabajo para mejorar consistencia visual y usabilidad sin cambiar lógica de negocio.

Objetivos:

- fijar reglas técnicas de implementación UI
- documentar criterios de aceptación por módulo
- evitar decisiones visuales aisladas durante las siguientes fases

## Guardrails técnicos

1. Fuente de verdad visual
- Toda decisión de color, espaciado, tipografía, radio, sombra y foco debe salir de tokens compartidos.
- Evitar hardcodear valores nuevos en módulos cuando ya exista token equivalente.

2. Componentes base primero
- Botones, inputs, selects, textareas, cards, badges, alertas y estados vacíos se implementan como piezas reutilizables.
- Los módulos deben componer estas piezas en lugar de redefinir estilos por archivo.

3. Estados de interacción obligatorios
- Todo control interactivo debe contemplar: `default`, `hover`, `focus`, `active`, `disabled`.
- Todo flujo de datos debe contemplar: `loading`, `error`, `success`, `empty`.

4. Accesibilidad mínima requerida
- Contraste suficiente de texto y controles.
- Indicador de foco visible para navegación por teclado.
- Labels asociados a inputs y textos de error cercanos al campo.
- Botones con texto claro y semántica consistente.

5. Consistencia de feedback
- Evitar `alert()` y `confirm()` nativos para acciones de negocio.
- Usar componentes de feedback de la UI con tono y copy consistente.

6. Responsivo por defecto
- Las pantallas deben funcionar al menos en móvil (`<= 768px`) y desktop (`>= 1024px`).
- Tablas anchas deben incluir estrategia de scroll u otro patrón legible en móvil.

## Convención de implementación

1. Orden recomendado por capa
- tokens globales
- estilos base
- componentes UI compartidos
- shell de aplicación
- módulos de negocio

2. Criterio para mover estilos
- Si un patrón aparece en 2 o más módulos, se convierte en componente compartido.
- Si un estilo es exclusivo de un caso puntual, puede permanecer local.

3. Criterio para nuevos componentes
- Deben tener API simple, nombres explícitos y variantes acotadas.
- Evitar crear variantes visuales sin justificar su uso en más de un flujo.

## Criterios de aceptación por módulo

## Login
- Jerarquía visual clara: título, descripción, campos, acción principal.
- Manejo de error visible y estado de envío.
- Consistencia visual con el shell autenticado.

## Shell (`LayoutBase`)
- Header, sidebar y contenedor principal alineados con tokens globales.
- Navegación activa y foco visual claros.
- Comportamiento móvil estable en apertura/cierre de menú.

## Dashboard
- KPI, paneles y tablas con mismo lenguaje visual que el resto.
- Estados de carga/error integrados al sistema de alertas/panel.

## Clientes
- Formulario, resumen y tabla usando componentes base compartidos.
- Errores, ayudas y acciones consistentes con otros módulos.

## Productos
- Misma estructura de interacción que Clientes para formularios y tablas.
- Alta rápida de categoría integrada al sistema de controles compartidos.

## Ventas
- Flujo completo con feedback no bloqueante y consistente.
- Carrito, resumen y configuración de pagos con jerarquía visual uniforme.

## Pagos
- Registro de pago y filtros con controles compartidos.
- Estados de validación y feedback alineados al sistema.

## Créditos
- Lista, detalle y cronograma con cards y badges consistentes.
- Selección de crédito con estado activo evidente y accesible.

## Inventario
- Cuando se implemente, debe nacer directamente sobre componentes compartidos.

## Definition of Done para las fases siguientes

- no se introducen nuevos estilos duplicados sin justificación
- se reducen estilos inline estructurales en módulos
- cada módulo mantiene funcionalidad existente
- UI validada en desktop y móvil
- copy de acciones y errores consistente en tono y claridad
