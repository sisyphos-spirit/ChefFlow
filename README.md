# Proyecto Final DAM: Gestor de Recetas Multiplataforma

## Descripción

Este proyecto es una aplicación móvil multiplataforma desarrollada con React Native, orientada a la gestión de recetas culinarias. Permite a los usuarios crear, editar, eliminar, explorar y compartir recetas, así como consultar información nutricional detallada de cada plato. La aplicación utiliza Supabase como backend para la gestión de datos y autenticación de usuarios.

## Características principales

- **Autenticación de usuarios**: Registro e inicio de sesión seguro.
- **Gestión de recetas**: Crear, editar, eliminar y visualizar recetas propias.
- **Exploración pública**: Buscar y explorar recetas públicas de otros usuarios.
- **Búsqueda avanzada**: Filtrado de recetas por título, descripción o ingredientes.
- **Gestión de ingredientes**: Selección y gestión de ingredientes con unidades y cantidades.
- **Cálculo nutricional**: Visualización de valores nutricionales (calorías, proteínas, grasas, carbohidratos) por receta.
- **Soporte multilenguaje**: Español e inglés.
- **Interfaz moderna y adaptable**: Temas claro y oscuro, diseño responsive y accesible.

## Estructura del proyecto

```
GRPC/
├── App.tsx
├── package.json
├── src/
│   ├── components/         # Componentes reutilizables de UI
│   ├── constants/          # Constantes globales (colores, textos, estilos)
│   ├── hooks/              # Hooks personalizados para lógica de negocio
│   ├── lib/                # Configuración de servicios externos (Supabase)
│   ├── navigation/         # Configuración de la navegación
│   ├── screens/            # Pantallas principales de la app
│   ├── store/              # Estado global (Zustand)
│   └── utils/              # Utilidades y helpers
└── android/                # Proyecto nativo Android
```

## Instalación y ejecución

### Requisitos previos
- Node.js >= 18.x
- npm >= 9.x
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (para emulador) o dispositivo físico

### Pasos para ejecutar el proyecto

1. **Clonar el repositorio**
   ```powershell
   git clone <URL_DEL_REPOSITORIO>
   cd GRPC
   ```
2. **Instalar dependencias**
   ```powershell
   npm install
   ```
3. **Configurar variables de entorno**
   - Revisar `src/lib/supabase.ts` y asegurarse de que las claves de Supabase sean válidas.
4. **Ejecutar la app en modo desarrollo**
   ```powershell
   npx expo start
   ```
   - Escanear el QR con la app Expo Go o lanzar en un emulador Android/iOS.

## Uso de la aplicación

- **Registro e inicio de sesión**: Acceso mediante email y contraseña.
- **Gestión de recetas**: Desde la pestaña "Mis Recetas" puedes crear, editar o eliminar tus recetas.
- **Explorar recetas**: En la pestaña "Explorar" puedes buscar recetas públicas de otros usuarios.
- **Visualización de detalles**: Consulta ingredientes, pasos y valores nutricionales de cada receta.
- **Cambio de idioma y tema**: Desde el perfil puedes alternar entre español/inglés y tema claro/oscuro.

## Tecnologías utilizadas

- **Frontend**: React Native, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth)
- **Gestión de estado**: Zustand
- **UI**: @rneui/themed, estilos personalizados
- **Otras**: Expo, react-navigation, react-native-dropdown-picker

## Estructura de la base de datos (Supabase)

- **Usuarios**: Autenticación gestionada por Supabase Auth.
- **Recetas**: Tabla principal con campos como `id_receta`, `id_usuario`, `titulo`, `descripcion`, `imagen_url`, `pasos`, `publicada`, `fecha_creacion`.
- **Ingredientes**: Tabla de ingredientes base y tabla intermedia `receta_ingredientes` para asociar ingredientes y cantidades a cada receta.
- **Conversiones**: Tabla para conversión de unidades a gramos.

## Buenas prácticas y consideraciones

- Código modular y reutilizable.
- Separación clara entre lógica de negocio y presentación.
- Manejo de errores y validaciones en formularios.
- Internacionalización y soporte de temas.
- Uso de hooks personalizados para acceso a datos y lógica de negocio.

## Limitaciones y mejoras futuras

- **Pruebas**: Actualmente no existen tests automatizados. Se recomienda añadir tests unitarios y de integración.
- **Documentación**: Mejorar la documentación técnica y de despliegue.
- **Gestión de errores**: Centralizar y mejorar la gestión de errores.
- **Optimización de rendimiento**: Mejorar la carga de datos y la experiencia offline.

## Autor

- José Manuel (Estudiante de DAM)

---

**Este proyecto es parte del módulo de Desarrollo de Aplicaciones Multiplataforma (DAM).**
