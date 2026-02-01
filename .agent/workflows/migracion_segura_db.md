---
description: Protocolo de seguridad para modificar la base de datos sin perder datos.
---
# Workflow: Migración Segura de DB

**ADVERTENCIA:** Las operaciones de base de datos pueden ser destructivas. Sigue esto al pie de la letra.

## 1. Respaldo (Backup)
// turbo
1.  Copia la base de datos actual antes de tocar nada:
    ```powershell
    Copy-Item "prisma/dev.db" -Destination "prisma/dev_backup_$(Get-Date -Format 'yyyyMMdd_HHmm').db"
    ```

## 2. Modificación de Schema
1.  Edita `prisma/schema.prisma`.
2.  Si estás **renombrando** campos, Prisma intentará borrar la columna vieja y crear una nueva (perdiendo datos).
3.  Si necesitas preservar datos al renombrar, es un proceso manual de edición SQL (avanzado).

## 3. Ejecutar Migración Local
1.  Ejecuta:
    ```bash
    npx prisma migrate dev --name <descripcion_cambio>
    ```
2.  Si Prisma advierte sobre pérdida de datos (`Data loss warning`), **DETENTE** y cancela si no es intencional.

## 4. Verificación
1.  Usa `npx prisma studio` para abrir una interfaz visual y verificar que los datos siguen ahí.
2.  Verifica que la aplicación arranca y lee los datos correctamente.

## 5. Restauración (En caso de emergencia)
1.  Si algo sale mal, detén la app.
2.  Restaura el archivo `.db` desde el backup creado en el paso 1.
