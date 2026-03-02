# system_rules.md — Reglas y Guías de Desarrollo para DotaT B2B

## 1. Contexto del Proyecto (Siempre Presente)

- **Proyecto:** Página web B2B para DotaT, distribuidor en Barranquilla (suministros institucionales y dotaciones, marca principal Tork).
- **Identidad DotaT:** La marca proyecta eficiencia, crecimiento y solidez institucional. El logo base tiene tipografía redondeada en gris carbón y un isotipo de flechas dobles de crecimiento en un verde menta/teal muy vibrante.
- **Tono Visual:** Premium, moderno, corporativo y limpio. Destinado a gerentes de compras que buscan cotizar volumen.

## 2. Antes de Codificar (Siempre Haz Primero)

- **Invocar la habilidad `frontend-design`** antes de escribir código frontend.
- **Fidelidad Manual de Marca:** Aplica estrictamente los colores y tipografías definidos en el punto 3 de este documento. La consistencia es clave para la percepción B2B.

## 3. Identidad de Marca y Estilo Visual (Brand Identity)

*Inspirado en el logo oficial `Logo_DotaT.jpeg`:*

### Paleta de Colores Exclusiva

- **Acento Principal (Verde DotaT):** `#18C995` (Verde Menta/Teal energético). Uso obligatorio para CTAs primarios (Botón Cotizar), "hover states", marcas de éxito e iconografía funcional.
- **Primario Oscuro (Carbón DotaT):** `#2D2B3F` (Gris noche profundo). Uso obligatorio para Navbar, Footer, Títulos principales (H1-H4) y textos de contraste alto. Nunca usar negro puro `#000000`.
- **Soporte Institucional (Azul Tork):** `#009EDD`. Uso restringido para indicar productos de marca Tork, badges de certificación y etiquetas que vinculan la distribución autorizada.
- **Neutrales y Papel:** Fondos en blanco `#FFFFFF` y grises fríos/suaves como `#F8FAFC` o `#E2E8F0` para el sombreado y segmentación de las `cards` de catálogo.

### Tipografía (Typography)

- **Títulos y Cabeceras:** `Outfit` (Preferida) o `Quicksand`. (Fuentes sin serifas geométricas con curva sutil, igual a la tipografía del logo). Pesos: `SemiBold (600)` o `Bold (700)`.
- **Cuerpo, Tablas y Catálogo:** `Inter`. (Legibilidad de datos técnicos en pantallas). Peso: `Regular (400)` o `Medium (500)`. Tracking estándar, con Interlineado suelto (`1.6` o `1.7`) para facilitar la lectura de especificaciones.

### Geometría y Componentes UI

- **Border Radius ("Soft Edges"):** Prohibidos los bordes afilados (`rounded-none`). Dado que el isotipo es curvo, los botones, inputs de formularios y "product cards" tendrán `rounded-lg` o `rounded-xl` (12px - 16px).
- **Glassmorphism corporativo (Opcional ligero):** Para paneles de filtros o la Navbar al hacer scroll, se puede usar desenfoque (backdrop-blur) con el Carbón DotaT translúcido.

## 4. Diseño Premium y Anti-Genérico (Guardrails)

- **Colores:** Prohibido usar paletas base genéricas de Tailwind (blue-600, indigo-500) como colores principales de la marca. Construye todo a partir de la paleta DotaT.
- **Sombras (Shadows):** Cero sombras duras. Las "Cards" de productos deben tener sombras difusas y amplias, ligeramente teñidas con el Carbón DotaT (`rgba(45, 43, 63, 0.05)`).
- **Animaciones e Interacciones:** Micro-interacciones (ease-in-out, duraciones de 150-300ms) para los botones y al pasar el cursor sobre los productos del catálogo. Botones principales deben tener un sutil escalado (`scale-105`) al *hover*.
- **Espaciado (White Space):** El catálogo necesita respirar. Las fichas técnicas B2B no deben ser agobiantes. Dobla el padding habitual en tus diseños B2B corporativos.

## 5. Arquitectura web y Reglas Estrictas

- La página web no es e-commerce retail con carrito de compras; es una plataforma B2B enfocada en **Agrupación y Solicitud de Cotización**.
- No inventar textos de relleno ("Lorem Ipsum") en el apartado de productos; existe un `Catalogo_Tork_Estructurado.md` que funge como base de datos.
