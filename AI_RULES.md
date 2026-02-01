# Reglas de Desarrollo (FinanzasApp)

Este documento define los estándares **OBLIGATORIOS** para el desarrollo de esta aplicación. Todo código generado debe cumplir con estas reglas para asegurar estabilidad y mantenibilidad.

## 1. Principios Generales
-   **Idioma:** Todo el código (variables, funciones, comentarios) y documentación debe estar en **Español**.
-   **Seguridad de Tipos:** Prohibido usar `any`. Se debe definir interfaces para todas las props y estructuras de datos.
-   **Mobile-First:** La UI debe diseñarse primero para móviles y luego adaptarse a escritorio.
-   **Validación:** Nunca confiar en el input del usuario. Usar `zod` para validar datos en API y Frontend.

## 2. Frontend (React/Next.js)
-   **Componentización:**
    -   Archivos de más de **150 líneas** deben refactorizarse.
    -   Componentes UI reutilizables van en `componentes/ui/`.
    -   Componentes de negocio van en `componentes/<Modulo>/`.
-   **Gestión de Estado:**
    -   Preferir estado local (`useState`) para UI simple.
    -   Usar `Context` solo para estado global real (Usuario, Tema).
    -   Evitar "Prop Drilling" excesivo (más de 2 niveles).
-   **Estilos:**
    -   Usar **Tailwind CSS**.
    -   No usar estilos en línea (`style={{...}}`) salvo casos dinámicos extremos.
    -   Colores y espaciados deben ser consistentes con el sistema de diseño.

## 3. Backend & Base de Datos (Prisma/API)
-   **Consultas:**
    -   Usar siempre `prisma.<modelo>.<accion>`.
    -   Manejar errores con `try/catch` y devolver códigos HTTP correctos (200, 400, 500).
-   **Migraciones:**
    -   **NUNCA** editar `schema.prisma` y ejecutar `db push` en producción.
    -   Usar siempre el flujo de migraciones: `npx prisma migrate dev`.
    -   Verificar integridad de datos antes de migraciones destructivas.

## 4. Flujo de Trabajo (Workflows)
Para tareas complejas, consulta los workflows en `.agent/workflows/`:
-   `crear_funcionalidad.md`: Pasos para añadir nuevas features full-stack.
-   `refactorizar_componente.md`: Guía para limpiar código spaghetti.
-   `migracion_segura_db.md`: Protocolo para cambios en base de datos.
