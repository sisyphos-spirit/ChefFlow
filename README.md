# ChefFlow

> Aplicación móvil multiplataforma para la gestión y exploración de recetas culinarias.

## Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características-principales)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Autor](#autor)
- [Licencia](#licencia)

---

## Descripción

ChefFlow es una aplicación móvil desarrollada con React Native orientada a la gestión integral de recetas culinarias. Permite a los usuarios crear, editar, eliminar, explorar y compartir recetas, además de calcular información nutricional y gestionar ingredientes de forma sencilla.

---

## Características principales

- **Autenticación segura**: Registro e inicio de sesión mediante email y contraseña.
- **Gestión de recetas**: Crear, editar, eliminar y visualizar recetas propias.
- **Exploración pública**: Buscar y explorar recetas de otros usuarios.
- **Búsqueda avanzada**: Filtrar recetas por título, descripción o ingredientes.
- **Gestión de ingredientes**: Seleccionar y manejar ingredientes con unidades y cantidades.
- **Cálculo nutricional**: Ver valores nutricionales (calorías, proteínas, grasas, carbohidratos).
- **Soporte multilenguaje**: Disponible en español e inglés.
- **Interfaz moderna**: Temas claro/oscuro, diseño responsive y accesibilidad.

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

---

## Instalación y ejecución

### Requisitos previos
- Node.js >= 18.x
- npm >= 9.x
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (para emulador) o dispositivo físico

### Pasos para ejecutar el proyecto

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd GRPC
   ```
2. **Instalar dependencias**
   ```bash
   npm install
   ```
3. **Configurar variables de entorno**
   - Revisar `src/lib/supabase.ts` y asegurarse de que las claves de Supabase sean válidas.
4. **Ejecutar la app en modo desarrollo**
   ```bash
   npx expo start
   ```
   - Escanear el QR con la app Expo Go o lanzar en un emulador Android/iOS.

---

## Uso de la aplicación

- **Registro e inicio de sesión**: Acceso mediante email y contraseña.
- **Gestión de recetas**: Desde la pestaña "Mis Recetas" puedes crear, editar o eliminar tus recetas.
- **Explorar recetas**: En la pestaña "Explorar" puedes buscar recetas públicas de otros usuarios.
- **Visualización de detalles**: Consulta ingredientes, pasos y valores nutricionales de cada receta.
- **Cambio de idioma y tema**: Desde el perfil puedes alternar entre español/inglés y tema claro/oscuro.

---

## Tecnologías utilizadas

- **Frontend**: React Native, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth)
- **Gestión de estado**: Zustand
- **UI**: @rneui/themed, estilos personalizados
- **Otras**: Expo, react-navigation, react-native-dropdown-picker

---

## Estructura de la base de datos

- **Usuarios**: Autenticación gestionada por Supabase Auth.
- **Recetas**: Tabla principal con campos como `id_receta`, `id_usuario`, `titulo`, `descripcion`, `imagen_url`, `pasos`, `publicada`, `fecha_creacion`.
- **Ingredientes**: Tabla de ingredientes base y tabla intermedia `receta_ingredientes` para asociar ingredientes y cantidades a cada receta.
- **Conversiones**: Tabla para conversión de unidades a gramos.

---

## Buenas prácticas y consideraciones

- Código modular y reutilizable.
- Separación clara entre lógica de negocio y presentación.
- Manejo de errores y validaciones en formularios.
- Internacionalización y soporte de temas.
- Uso de hooks personalizados para acceso a datos y lógica de negocio.

---

## Autor

- José Manuel Muñoz Ros

---

## Licencia

Este proyecto está bajo la licencia [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.es).  
