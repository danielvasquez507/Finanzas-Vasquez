---
description: Guía para dividir componentes grandes en piezas más pequeñas y mantenibles.
---
# Workflow: Refactorizar Componente

Usa este flujo cuando encuentres archivos como `index.tsx` que superen las 200 líneas.

## 1. Identificar Bloque Lógico
1.  Busca una sección de JSX que tenga una responsabilidad clara (ej. "Lista de Transacciones", "Formulario de Ingreso").
2.  Identifica qué variables de estado (`useState`) y funciones usa ese bloque.

## 2. Crear Nuevo Componente
1.  Crea un archivo en `componentes/<Contexto>/<NombreComponente>.tsx`.
2.  Define la interfaz de `Props` explícitamente:
    ```typescript
    interface Props {
        transactions: Transaction[];
        onDelete: (id: number) => void;
        // ... otras props necesarias
    }
    ```
3.  Copia y pega el JSX y la lógica necesaria.

## 3. Limpiar Dependencias
1.  Asegúrate de importar componentes UI o iconos necesarios (ej. `lucide-react`).
2.  Si el componente necesita muchos estados del padre, considera agruparlos en un objeto o usar un objeto de configuración.

## 4. Reemplazar en Padre
1.  Importa el nuevo componente en el archivo original.
2.  Reemplaza el bloque JSX gigante con la etiqueta del nuevo componente:
    ```tsx
    // Antes: <div>...50 líneas de código...</div>
    
    // Ahora:
    <TransactionList 
        transactions={data} 
        onDelete={handleDelete} 
    />
    ```

## 5. Verificar comportamiento
1.  Asegúrate de que la funcionalidad, estilos y capacidad de respuesta (responsive) sean idénticos al original.
