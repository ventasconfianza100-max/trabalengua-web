# PRD — Trabalengua Escolares

## Original Problem Statement
Tienda online de uniformes escolares para "Trabalengua Escolares" con 6 colegios (Colegio Talca destacado + Concepción, Baltazar, Montessori, Escuela Carlos Spano, Escuela Amancay), 4 prendas por colegio (Buzo completo, Pantalón de buzo, Polera de buzo, Polar), 11 tallas (4,6,8,10,12,14,16,S,M,L,XL), stock/precio por talla, carrito, checkout con transferencia bancaria, panel admin con gestión de productos/imágenes/stock/precios/pedidos.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT auth (python-jose + bcrypt). Emergent object storage for product images.
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui. Cart in React Context + localStorage. Toasts with sonner.
- **Design**: Swiss minimalist, Outfit + Manrope fonts, coral #FF4D4D accent, sharp corners, white/light surfaces.

## User Personas
1. **Padre/madre comprador** — Busca su colegio, elige prenda y talla, paga por transferencia.
2. **Admin (Trabalengua)** — Gestiona catálogo, stock, precios e imágenes; revisa pedidos.

## Core Requirements (static)
- 6 colegios fijos, Colegio Talca destacado primero.
- 4 prendas por colegio con una sola foto por prenda (no cambia por talla).
- 11 tallas con stock y precio independientes.
- Carrito con edición de cantidades y recálculo.
- Checkout con datos de transferencia fijos (TRABALENGUA SPA, RUT 78.286.443.2, Mercado Pago, Cuenta Vista 1025957476, trabalenguaescolares@gmail.com).
- Panel admin protegido con JWT.

## Implemented (2026-02-20)
- Landing con hero + grid bento (Talca destacado span-12).
- Página de colegio con grid de 4 prendas.
- Ficha de producto con selector de tallas + stock + precio dinámico.
- Carrito slide-over (Sheet) con add/update/remove.
- Checkout con validación + creación de pedido + pantalla de confirmación con datos de transferencia.
- Admin login + dashboard con tabs Productos (stock/precio/imagen por prenda) y Pedidos (tabla con cambio de estado).
- Backend: /api/schools, /api/schools/:slug, /api/products/:id, /api/orders, /api/auth/login, /api/auth/me, /api/admin/products, /api/admin/products/:id (PATCH), /api/admin/products/:id/image (upload), /api/files/:path, /api/admin/orders, /api/admin/orders/:id (PATCH).
- Seed automático de admin + 6 colegios + 24 productos (4 por colegio) con stock 5 por talla.
- Subida de imágenes a Emergent Object Storage, servidas vía /api/files/:path.

## Iteration 2 (2026-02-23)
- Sección **Contacto** en Home + página `/contacto` con Google Maps embed, tarjeta Instagram, horarios, mensaje WhatsApp.
- **Botón flotante WhatsApp** (+56 9 7883 8174) visible en todas las páginas públicas, con animación ping + tooltip desktop; oculto en `/admin/*`.
- Header: removido enlace a Admin; agregados **Bordados** y **Contacto**. Footer con enlace `· admin ·` discreto.
- Página **/bordados** con hero + pasos + 2 CTA WhatsApp con mensaje pre-cargado "Hola, quiero solicitar un bordado personalizado."
- **Checkout rediseñado** con jerarquía visual: selector Retiro/Delivery ($4.990 solo Talca) con mensajes respectivos, tarjeta negra con TOTAL grande, preview de datos del cliente en vivo, resumen de productos, datos de transferencia.
- Backend: campos `subtotal`, `delivery_method`, `delivery_fee`, `is_deleted` en pedidos; DELETE/restore/permanent endpoints.
- **Admin mejorado**: nueva pestaña Dashboard con gráfico de barras horizontal (recharts) + 4 stat cards (Productos, Stock total, Stock bajo, Sin stock). Filtro por colegio (dropdown) afecta Dashboard + Productos. Nueva pestaña Papelera con Restaurar / Eliminar definitivo.

## Iteration 3 (2026-02-23)
- **Badge "Made with Emergent"** ocultado vía MutationObserver en App.js (hider corre en todas las rutas).
- **Mapa corregido** a coordenadas reales -35.4253351,-71.6132162 / "Calle 36 Ote. 1994, Talca" con iframe de Google Maps embed.
- **Card WhatsApp** en contacto suavizado (bg verde claro con borde, en lugar del negro agresivo).
- **Header con bg sutil** `#FAFAF7` que lo diferencia del body blanco.
- **Buscador de colegios** en home con filtrado en vivo + estado vacío.
- **Imagen hero dinámica**: ahora se carga desde `/api/settings` (foto de madre comprando uniforme por defecto) y el admin puede reemplazarla via upload o URL desde la pestaña Ajustes.
- **Acentos celestes en tarjeta Colegio Talca**: borde celeste, gradient sutil, chip "Uniforme celeste".
- **Admin ampliado**: filtro por talla en Dashboard (junto al de colegio); labels dinámicos en StatCards; título de chart dinámico; **SizeBreakdownTable** con filas por producto y columnas por talla (4-XL) + Total; nueva pestaña **Ajustes** con preview + upload de imagen hero + input de URL.
- Backend: modelo `Settings` singleton + endpoints `GET /api/settings` (público), `PATCH /api/admin/settings`, `POST /api/admin/settings/hero-image` (upload).

## Iteration 4 (2026-02-23)
- **Título de pestaña** y **favicon** corregidos: `Trabalengua Uniformes` + logo oficial (`/trabalengua-logo.png`).
- **"Made with Emergent" eliminado definitivamente** del HTML (removido el `<a id=emergent-badge>` hardcodeado en index.html + CSS safety rule).
- **Catálogo Colegio Talca extendido a 7 prendas**: Buzo Completo, Pantalón de Buzo, **Polerón de buzo** (renombrado), Polera manga corta, Polera manga larga, Polar, Delantales y cotonas. Otros colegios conservan 4 prendas.
- **Stock dinámico para Buzo Completo Talca**: stock por talla = min(pantalón, polerón). Ordenar un buzo completo decrementa automáticamente ambas prendas.
- **Banner "Bordamos nombres"** en home con link a `/bordados`.
- **Header con más contraste**: `bg-[#F2F0E8]` (cream tone más visible).
- **SchoolPage**: buscador interno + índice rápido con chips por tipo de prenda (sticky bajo el header).

## Test Credentials
- **Admin**: admin@trabalengua.cl / admin123 (en `/app/memory/test_credentials.md`)

## Prioritized Backlog
### P1
- Validación de stock atómica (evitar race condition al crear pedido simultáneo).
- Límite de tamaño de archivo al subir imágenes (5 MB máx).
- Cache headers en /api/files/:path.
- Notificación por email/WhatsApp al cliente y admin cuando se confirma un pedido.

### P2
- Búsqueda/filtro global de productos.
- Descuentos por kit (ej. buzo completo vs. pantalón+polera).
- Historial de cambios de precio/stock.
- Export CSV de pedidos.
- Modo oscuro opcional.

### P3
- Integración de pago online (Webpay/Mercado Pago) además de transferencia.
- Multi-admin con roles.
