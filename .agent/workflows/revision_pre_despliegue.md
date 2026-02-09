# Protocolo de Seguridad Pre-Despliegue

Sigue estos pasos OBLIGATORIOS antes de subir cualquier cambio a producción. El objetivo es prevenir CUALQUIER error en producción, no solo de conexión.

## 1. Verificación de Infraestructura (Docker & Prisma)

⚠️ **Cambio Importante:** Estamos usando **Debian Slim** en lugar de Alpine para evitar errores de SSL.

### A. Dockerfile Correcto
- [ ] **Imagen Base**: Debe ser `node:20-slim`. Alpine da problemas con Prisma.
- [ ] **Dependencias**: Debe usar `apt-get` para instalar `openssl`.
```dockerfile
# Dockerfile
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y openssl python3 make g++
```

### B. Schema Prisma
- [ ] **Binary Targets**: Debe incluir `debian-openssl-3.0.x`.
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

## 2. Check de Integridad de Datos

Antes de desplegar, pregúntate:
- [ ] **¿Cambié el schema de la DB?** Si sí, ¿ejecuté `npx prisma migrate dev` o preparé el comando para producción?
- [ ] **Variables de Entorno**: Si agregué una nueva variable en `.env` local, ¿la agregué también en **Portainer**? De lo contrario la app fallará al arrancar.

## 3. Limpieza de Código y UI

- [ ] **Funcionalidades Beta**: Elimina cualquier botón o menú marcado como "WIP", "Beta" o "Importación" que no esté listo.
- [ ] **Console Logs**: Revisa que no hayan `console.log` con datos sensibles.
- [ ] **Versión Visual**: Asegúrate de que el texto de versión en `SettingsTab.tsx` coincida con lo que estás subiendo (ej. "v2.5").

## 4. Prueba de Fuego Local (Build Check)

**NUNCA DESPLIEGUES SIN EJECUTAR ESTO PRIMERO:**

// turbo
Local Build Check:
```powershell
npx prisma generate
npm run build
```

Si este comando muestra *cualquier* advertencia roja, **DETENTE**. No subas.

## 5. Protocolo de Push

Solo si todos los checks anteriores están marcados:

```bash
git add .
git commit -m "chore: pre-deploy checks passed - ready for prod"
git push origin main
```
