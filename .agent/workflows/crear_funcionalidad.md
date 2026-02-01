---
description: Guía paso a paso para crear una nueva funcionalidad completa (Full-Stack).
---
# Workflow: Crear Nueva Funcionalidad

Sigue estos pasos para añadir una nueva característica a la aplicación sin romper la arquitectura existente.

## 1. Planificación de Datos (Backend)
1.  Abre `prisma/schema.prisma`.
2.  Define el nuevo modelo o actualiza uno existente.
3.  **IMPORTANTE:** Usa nombres en inglés para los modelos (ej. `Budget` no `Presupuesto`) para mantener consistencia con Prisma, pero puedes comentar en español.

## 2. Migración de Base de Datos
// turbo
1.  Ejecuta el comando para crear la migración:
    ```bash
    npx prisma migrate dev --name <nombre_descriptivo_feature>
    ```
2.  Verifica que el archivo SQL generado en `prisma/migrations` sea correcto.

## 3. Creación de API (Backend)
1.  Crea un archivo en `pages/api/<nombre_recurso>.ts`.
2.  Estructura básica obligatoria:
    ```typescript
    import type { NextApiRequest, NextApiResponse } from 'next';
    import prisma from '../../lib/prisma';
    import { z } from 'zod'; // Usar validación

    // Esquema de Validación
    const Schema = z.object({
        // define campos aquí
    });

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method === 'GET') {
            // Lógica GET
        } else if (req.method === 'POST') {
            // Validación
            const result = Schema.safeParse(req.body);
            if (!result.success) return res.status(400).json(result.error);
            
            // Lógica POST
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    }
    ```

## 4. Desarrollo de Frontend
1.  Crea los componentes necesarios en `componentes/<Feature>/`.
2.  Define tipos TypeScript para las respuestas de la API.
3.  Usa `fetch` o una librería de hooks para consumir la API `pages/api/<nombre_recurso>`.

## 5. Verificación
1.  Reinicia el servidor de desarrollo si es necesario.
2.  Prueba el flujo completo (Frontend -> API -> DB).
