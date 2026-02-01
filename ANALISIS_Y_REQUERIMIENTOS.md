# Análisis y Requerimientos del Sistema (FinanzasApp)

Fecha: 28 de Enero de 2026
Estado: Análisis de Código Existente

## 1. Visión General del Proyecto

La aplicación es un gestor de finanzas personales diseñado para ser utilizado principalmente en dispositivos móviles (Mobile-First), aunque funciona en escritorio mediante un contenedor centrado. Está construida con **Next.js** (Pages Router) y utiliza **SQLite** como base de datos local gestionada por **Prisma ORM**.

### Stack Tecnológico
-   **Frontend:** React, Next.js (v14), Tailwind CSS, Lucide React (Iconos).
-   **Backend:** Next.js API Routes.
-   **Base de Datos:** SQLite (archivo `Esquema.db`).
-   **ORM:** Prisma.
-   **Contenedor:** Docker & Docker Compose.

---

## 2. Requerimientos Funcionales Existentes

A continuación se detallan las funcionalidades implementadas en el código actual:

### 2.1 Módulo de Transacciones (Gastos)
Es el único módulo totalmente persistente en base de datos.
-   **Registro:** Creación de nuevos gastos con monto, categoría, subcategoría, fecha y nota.
-   **Listado:** Visualización de histórico de gastos.
-   **Edición/Eliminado:** Modificación y borrado de registros existentes.
-   **Conciliación:** Modo especial en el listado ("Conciliar") que permite marcar gastos como "pagados" visualmente (este estado `isPaid` es **local**, no se guarda en BD, ver sección de Errores).
-   **Importación Masiva:** Interfaz para pegar CSV generado por IA y procesarlo para crear múltiples registros.

### 2.2 Dashboard
-   **Métricas:** Total gastado filtrado por periodo.
-   **Gráficos:** Gráfico de barras horizontales mostrando gastos por categoría.
-   **Filtros de Tiempo:** Semana, Mes, Año.
-   **Navegación:** Botones anterior/siguiente para moverse en el tiempo.

### 2.3 Módulo de Recurrentes (Fijos)
**Nota Importante:** Actualmente opera solo en memoria (Client-Side). **Los datos se pierden al recargar.**
-   **Tipos:** Ingresos y Gastos Fijos (Recurrentes).
-   **Propietarios:** Asignación a 'Daniel', 'Gedalya' o 'Ambos'.
-   **Cálculo:** Muestra balance teórico (Ingresos - Gastos Fijos = Disponible).

### 2.4 Configuración (Categorías)
**Nota Importante:** Actualmente opera solo en memoria (Client-Side). **Los cambios se pierden al recargar.**
-   **Gestión:** Edición de iconos y adición de subcategorías a las categorías existentes.

---

## 3. Modelo de Datos (Base de Datos)

Actualmente solo existe una tabla en `Esquema.db`:

### Tabla: `gastos`
| Campo       | Tipo     | Descripción |
| :--- | :--- | :--- |
| `id`        | Int      | Clave Primaria (Autoincremental) |
| `fecha`     | DateTime | Fecha del gasto |
| `categoria` | String?  | Nombre de la categoría (Texto plano) |
| `descripcion`| String? | Descripción o Subcategoría |
| `monto`     | Float    | Cantidad numérica |

> **Observación:** No existen tablas relacionales para `Categorias`, `Usuarios` o `Recurrentes`. Todo se maneja con strings o datos en duro (hardcoded) en el frontend.

---

## 4. Estructura de Archivos Clave

-   `pages/index.tsx`: **Monolito UI**. Contiene TODA la lógica del frontend (aprox. 675 líneas). Maneja el estado, navegación, modales y lógica de negocio.
-   `pages/api/gastos.ts`: API Endpoint. Maneja CRUD (Create, Read, Update, Delete) para la tabla `gastos`.
-   `prisma/schema.prisma`: Definición del modelo de base de datos.
-   `lib/prisma.ts`: Cliente instanciado de Prisma.

---

## 5. Recomendaciones de Mejora

Se recomienda priorizar las mejoras en el siguiente orden:

### 🔴 Críticas (Prioridad Alta)
1.  **Persistencia de Datos Faltante:**
    -   Crear tablas en Prisma para `Categories` y `RecurringItems`. Actualmente, si el usuario crea un gasto fijo o edita una categoría, pierde la información al cerrar la app.
    -   Actualizar `schema.prisma` y crear las migraciones.
    -   Crear endpoints API (`api/categories`, `api/recurring`).
2.  **Persistencia de Estado "Pagado":**
    -   El campo `isPaid` (Conciliación) existe en la interfaz (`index.tsx` línea 314) pero **no existe en la base de datos**. Al recargar, todos los pagos vuelven a estar "no pagados". Agregar campo `pagado Boolean @default(false)` al modelo `gastos`.

### 🟡 Estructurales (Mantenibilidad)
3.  **Refactorización de `index.tsx`:**
    -   El archivo es demasiado grande y difícil de mantener. Separar en componentes:
        -   `componentes/Dashboard.tsx`
        -   `componentes/TransactionForm.tsx`
        -   `componentes/TransactionList.tsx`
        -   `componentes/RecurringPanel.tsx`
    -   Mover la lógica de estado (hooks) a un custom hook `useFinanceApp.ts` o usar Context API.
4.  **Gestión de Categorías Relacional:**
    -   Actualmente se guarda el *nombre* de la categoría como texto en la tabla `gastos`. Si se renombra una categoría, los gastos antiguos quedan "huérfanos" o con el nombre viejo.
    -   Se recomienda usar `Relation` en Prisma: `Gasto` -> `Categoria`.

### 🟢 Experiencia de Usuario (UI/UX)
5.  **Validación de Formularios:** Usar librerías como `react-hook-form` y `zod` para evitar entradas vacías o datos incorrectos, en lugar de alertas nativas (`alert()`).
6.  **Feedback Visual:** Reemplazar `alert("Guardado")` por "Toasts" (notificaciones emergentes no intrusivas, ej. `sonner` o `react-hot-toast`).
7.  **Responsive Real:** La app está forzada a `max-w-md` (ancho de celular) incluso en PC. Si se desea usar en escritorio se podría adoptar un layout responsive real (grid de dashboard en PC, lista en móvil).

### ⚙️ Backend & Infraestructura
8.  **Base de Datos Recomendada:** Si se planea usar Docker en producción o compartir la app, SQLite puede presentar bloqueos. Considerar PostgreSQL.
9.  **Autenticación:** Actualmente los usuarios ("Daniel", "Gedalya") están en duro en el código. Si se requiere seguridad real, implementar `NextAuth.js`.
