# Plan de Implementación - Persistencia y Despliegue

Este plan aborda las funcionalidades críticas de persistencia faltantes en FinanzasApp.

# Descripción del Objetivo
El objetivo es evitar la pérdida de datos al recargar la página para "Gastos Recurrentes" y "Categorías", y persistir el estado "Pagado" de las transacciones. También desplegaremos la aplicación localmente.

## Revisión de Usuario Requerida
> [!IMPORTANT]
> Esto requiere una migración de base de datos usando Prisma. Esto modificará el archivo de base de datos SQLite.

## Cambios Propuestos

### Capa de Base de Datos (Prisma)
#### [MODIFICAR] [schema.prisma](file:///c:/Users/dany_/Documents/Code/FinanzasApp/prisma/schema.prisma)
- Agregar `model Category` (Categoría)
- Agregar `model Recurring` (Recurrente)
- Actualizar `model gastos` para incluir `isPaid Boolean @default(false)`
- *Nota:* Mantendremos las relaciones simples por ahora para evitar romper la lógica basada en cadenas (strings) existente en el frontend a menos que sea necesario.

### Capa Backend (Rutas API)
#### [NUEVO] [categories.ts](file:///c:/Users/dany_/Documents/Code/FinanzasApp/pages/api/categories.ts)
- Implementar GET, POST, PUT (para subcategorías/iconos).
- *Lógica de Semilla:* Si no hay categorías, insertar las predeterminadas.

#### [NUEVO] [recurring.ts](file:///c:/Users/dany_/Documents/Code/FinanzasApp/pages/api/recurring.ts)
- Implementar GET, POST, DELETE, PUT.

#### [MODIFICAR] [gastos.ts](file:///c:/Users/dany_/Documents/Code/FinanzasApp/pages/api/gastos.ts)
- Actualizar manejadores POST/PUT para aceptar `isPaid`.
- El campo `isPaid` se agregará automáticamente a la base de datos con la migración.

### Capa Frontend
#### [MODIFICAR] [index.tsx](file:///c:/Users/dany_/Documents/Code/FinanzasApp/pages/index.tsx)
- Eliminar constantes `INITIAL_CATEGORIES` e `INITIAL_RECURRING`.
- Agregar hooks `useEffect` para obtener Categorías y Recurrentes al cargar.
- Actualizar `handleAddTransaction`, `handleSaveRecurring`, `saveCategoryEdit` para llamar a las nuevas APIs.
- Actualizar `togglePaid` para llamar a la API de `gastos`.

## Plan de Verificación
### Verificación Manual
1.  **Despliegue**: Ejecutar `npm run dev` y verificar que la app cargue en `localhost:3000`.
2.  **Prueba de Persistencia**:
    -   Agregar un nuevo Gasto Recurrente. Recargar página. Verificar que permanece.
    -   Cambiar un icono de Categoría. Recargar página. Verificar que persiste.
    -   Marcar una transacción como "Pagado". Recargar página. Verificar que permanece marcado.
