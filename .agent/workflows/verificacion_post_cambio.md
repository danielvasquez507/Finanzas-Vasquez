---
description: Guía de pruebas extensivas para aplicar después de cambios en la aplicación.
---
# Workflow: Verificación Post-Cambio

Siempre que se realice un cambio significativo, este skill asegura que la aplicación siga funcionando correctamente.

## 1. Verificación de Compilación
1.  Si el servidor de desarrollo está corriendo (`npm run dev`), revisa la terminal en busca de errores.
2.  Si hay errores de compilación (`Failed to compile`), **DETENTE** y corrige antes de seguir.

## 2. Pruebas de Renderizado (UI)
1.  Verifica que las rutas principales carguen:
    -   `/` (Home/Dashboard)
    -   `/transactions` (si existe)
2.  Asegúrate de que no haya errores de hidratación ("Text content does not match server-rendered HTML").

## 3. Pruebas de Integración (Backend/DB)
1.  Verifica que las Server Actions respondan.
    -   Si la página carga datos (ej. lista de transacciones), significa que `prisma.findMany` funciona.
2.  Si se modificó el esquema de DB, verifica `npx prisma studio` para asegurar integridad.

## 4. Pruebas de Estilos (Tailwind)
1.  Si agregaste nuevas clases o variables CSS, verifica que `tailwind.config.ts` las incluya.
2.  Si el error reporta clases faltantes (ej. `border-border`), revisa que el tema esté extendido correctamente en la config.
