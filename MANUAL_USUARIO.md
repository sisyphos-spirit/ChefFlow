# Manual de Usuario – ChefFlow

## Índice
1. Introducción
2. Instalación y primeros pasos
3. Navegación y estructura de la app
4. Funcionalidades principales
   - Registro e inicio de sesión
   - Gestión de recetas
   - Exploración de recetas públicas
   - Visualización de detalles de receta
   - Cambio de idioma y tema
5. Ejemplos de uso
6. Preguntas frecuentes (FAQ)
7. Buenas prácticas y soporte

---

## 1. Introducción
ChefFlow es una aplicación móvil multiplataforma para la gestión y exploración de recetas culinarias. Permite crear, editar, eliminar, explorar y compartir recetas, calcular información nutricional y gestionar ingredientes de forma sencilla. Incluye autenticación segura, soporte multilenguaje y una interfaz moderna adaptable a tema claro/oscuro.

## 2. Instalación y primeros pasos
### Requisitos previos
- Node.js >= 18.x
- npm >= 9.x
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (para emulador) o dispositivo físico

### Instalación
1. Clona el repositorio y accede a la carpeta del proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd GRPC
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las claves de Supabase en `src/lib/supabase.ts`.
4. Inicia la app en modo desarrollo:
   ```bash
   npx expo start
   ```
   Escanea el QR con Expo Go o ejecuta en un emulador.

## 3. Navegación y estructura de la app
La app se organiza en tres pestañas principales:
- **Mis Recetas**: Gestión de tus recetas (crear, editar, eliminar, ver detalles).
- **Explorar**: Buscar y explorar recetas públicas de otros usuarios.
- **Perfil**: Configuración de cuenta, idioma y tema.

La navegación es intuitiva mediante pestañas inferiores y pantallas apiladas para detalles y formularios.

## 4. Funcionalidades principales
### Registro e inicio de sesión
- Accede con email y contraseña.
- Si no tienes cuenta, regístrate desde la pantalla de inicio.
- Recupera tu sesión automáticamente si ya has iniciado antes.

### Gestión de recetas
- Desde "Mis Recetas" puedes:
  - Crear una nueva receta (botón flotante).
  - Editar o eliminar recetas existentes.
  - Visualizar detalles completos de cada receta.

### Exploración de recetas públicas
- En "Explorar" puedes:
  - Buscar recetas por título, descripción o ingredientes.
  - Acceder a detalles de recetas públicas.
  - Buscar recetas por ID específico.

### Visualización de detalles de receta
- Consulta ingredientes, pasos y valores nutricionales (calorías, proteínas, grasas, carbohidratos).
- Copia el ID de la receta para compartirla.
- Si eres el autor, puedes editar, eliminar o cambiar la visibilidad (pública/privada).

### Cambio de idioma y tema
- Desde la pestaña "Perfil" puedes alternar entre español e inglés.
- Cambia entre tema claro y oscuro según preferencia.

## 5. Ejemplos de uso
- **Crear receta**: Ve a "Mis Recetas" > botón "Crear Receta" > completa el formulario y guarda.
- **Buscar receta pública**: Ve a "Explorar" > usa la barra de búsqueda o el botón de búsqueda por ID.
- **Editar perfil**: Ve a "Perfil" > actualiza tu nombre, avatar, idioma o tema.

## 6. Preguntas frecuentes (FAQ)
- **¿Necesito internet para usar la app?** Sí, ChefFlow requiere conexión para autenticación y gestión de recetas.
- **¿Puedo recuperar mi contraseña?** Sí, desde la pantalla de inicio de sesión.
- **¿Cómo comparto una receta?** Copia el ID desde los detalles de la receta y compártelo.
- **¿Puedo cambiar el idioma?** Sí, desde la pestaña "Perfil".
- **¿Cómo elimino mi cuenta?** Ponte en contacto con soporte para eliminar tu cuenta.

## 7. Buenas prácticas y soporte
- Mantén tus datos de acceso seguros.
- Utiliza ingredientes y pasos claros en tus recetas.
- Si encuentras errores, revisa tu conexión y vuelve a intentarlo.
- Para soporte adicional, consulta la documentación técnica o contacta al autor.

---

**Autor:** José Manuel Muñoz Ros
**Licencia:** Creative Commons Attribution 4.0 International (CC BY 4.0)
