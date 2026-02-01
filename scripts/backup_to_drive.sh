#!/bin/bash

# --- CONFIGURACIÓN ---
# 1. Nombre que le pondrás a tu conexión en rclone (ej: "gdrive")
REMOTE_NAME="gdrive"
# 2. Carpeta en Drive donde se guardarán (ej: "Backups_Finanzas")
REMOTE_FOLDER="Backups_Finanzas"
# 3. Ruta local de tu base de datos
DB_PATH="/home/dany/Code/FinanzasApp/db-data/dev.db"
# 4. Directorio temporal para el backup
TEMP_DIR="/tmp"

# --- PROCESO ---
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="finanzas_backup_$TIMESTAMP.db"

echo " iniciando backup de: $DB_PATH"

# 1. Hacemos una copia local temporal para evitar problemas de bloqueo
cp "$DB_PATH" "$TEMP_DIR/$BACKUP_FILENAME"

# 2. Subimos a Google Drive usando rclone
echo " Subiendo a Google Drive ($REMOTE_NAME:$REMOTE_FOLDER)..."
rclone copy "$TEMP_DIR/$BACKUP_FILENAME" "$REMOTE_NAME:$REMOTE_FOLDER"

# 3. Verificamos si subió bien
if [ $? -eq 0 ]; then
    echo " ✅ Backup subido exitosamente: $BACKUP_FILENAME"
    # Limpiamos el archivo temporal
    rm "$TEMP_DIR/$BACKUP_FILENAME"
else
    echo " ❌ Error al subir el backup."
fi
