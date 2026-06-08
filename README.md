# HexWalk 🧭 (Ciudad Desvelada)

**HexWalk** es una aplicación móvil nativa multiplataforma (iOS y Android) diseñada para gamificar la exploración urbana. Convierte tus caminatas diarias en un juego de descubrimiento: el mapa del mundo está cubierto por una "niebla de guerra" hecha de hexágonos grises, los cuales se desbloquean y se vuelven brillantes y translúcidos a medida que caminas en el mundo real.

Desarrollada con **React Native, Expo SDK 56 y TypeScript**, la app está optimizada para bajo consumo de batería, cuenta con filtros de ruido GPS avanzados (QA), vibración háptica inmersiva (UX) y una base estructurada para la monetización de datos espaciales y cupones comerciales B2B.

---

## 📂 Arquitectura y Estructura del Proyecto

El proyecto está organizado bajo el enrutamiento de **Expo Router** basado en archivos, aislando la interfaz de la lógica de negocio:

```
├── assets/                  # Imágenes, splash screen e iconos de pestañas
├── src/
│   ├── app/                 # Rutas de navegación (Pestañas)
│   │   ├── _layout.tsx      # Configuración de tema global y pantalla de carga
│   │   ├── index.tsx        # Dashboard (Estadísticas, nivel, XP y misiones)
│   │   ├── explore.tsx      # Mapa satelital interactivo y panel simulador GPS
│   │   ├── quests.tsx       # Misiones diarias y logros a largo plazo
│   │   ├── leaderboard.tsx  # Podio visual competitivo de exploradores locales
│   │   └── settings.tsx     # Selector de temas neón, ajustes de batería y premium
│   ├── components/          # Componentes reutilizables de UI
│   ├── constants/
│   │   ├── theme.ts         # Tokens de espaciados y tipografías por defecto
│   │   └── Themes.ts        # Temas visuales y Map Styles JSON personalizados
│   ├── hooks/
│   │   ├── useHexStore.ts   # Estado persistido offline (Zustand + AsyncStorage)
│   │   └── useLocationTracker.ts # Geolocalización background y podómetro
│   ├── types/               # Tipados de TypeScript
│   └── utils/
│       └── hexGrid.ts       # Fórmulas de proyección hexagonal axial esférica
```

---

## 🛡️ Características Técnicas y Aseguramiento de Calidad (QA/UX)

*   **Filtro Antidesviación GPS (QA Senior):** Ignora de forma automática lecturas de satélite con precisión horizontal baja (`accuracy > 35 metros`) o velocidades imposibles (> 12 m/s), evitando que la niebla de guerra se desbloquee sola por rebotes de señal cuando el usuario está en interiores.
*   **Vibración Háptica Rítmica (UX Senior):** Utiliza la API física `Vibration` para crear un lazo sensitivo físico en el bolsillo del usuario. Emite una micro-vibración sutil (60ms) al capturar un hexágono nuevo y una vibración doble diferenciada (`[0, 100, 50, 150]`) al abrir cofres.
*   **Cofres de Recompensas y Cupones:** Marcadores interactivos distribuidos en el mapa. Al entrar en su radio de 35 metros, el cofre se desbloquea, otorga monedas de oro y despliega en pantalla un cupón digital promocional (ej. *Nike*, *Starbucks*).
*   **Temas Neón Premium:** Soporta personalización visual completa que altera no solo la interfaz, sino también las carreteras, masas de agua e infraestructuras del mapa con estilos personalizados (**Cyberpunk, Synthwave, Mundo Esmeralda y Luz Mínima**).

---

## 📈 Estrategia Comercial de Lanzamiento (Cold Start)

Para iniciar la aplicación en una ciudad por primera vez cuando aún no contamos con patrocinadores de pago:

1.  **Fase 1 (Gamificación Digital):** Distribución de cofres del sistema que otorgan monedas in-game, multiplicadores de experiencia temporal y postales de colección virtuales basadas en monumentos históricos de la ciudad.
2.  **Fase 2 (Pilotos Gratuitos):** Colocación gratuita de cofres patrocinados en cafeterías de especialidad y tiendas independientes locales. Los comercios ofrecen un beneficio sencillo (ej: 10% de descuento al mostrar la app) a cambio de flujo de caminantes orgánicos.
3.  **Fase 3 (Venta B2B con Datos):** Tras recolectar analíticas de tráfico peatonal de los primeros meses (ej: *"HexWalk trajo 150 usuarios físicos a tu local"*), vendemos el canal publicitario a franquicias multinacionales.
4.  **Monetización por Big Data (Foot-Traffic Analytics):** Agregación de datos a nivel de hexágonos y horas de forma anonimizada localmente en el móvil para construir un banco de analíticas geográficas vendible, respetando al 100% regulaciones GDPR y CCPA.

---

## 🧪 Instrucciones de Ejecución y Pruebas

### 1. Iniciar el Servidor de Desarrollo
Instala las dependencias y arranca el bundler Metro:
```bash
npm install
npx expo start --lan
```

### 2. Probar en el Navegador (Web Demo)
*   Presiona `w` en la consola para abrir el simulador web interactivo en **`http://localhost:8081`**.
*   Utiliza el **Simulador GPS flotante** en la pestaña **Mapa** para teletransportarte a presets mundiales (Zócalo CDMX, Sol Madrid, Plaza de Mayo) y "caminar" usando el teclado para verificar la lógica de cofres, monedas y misiones.

### 3. Probar en Celular Físico (Nativo)
*   Descarga la app **Expo Go** desde Google Play (Android) o App Store (iOS).
*   Asegúrate de que tu computadora y tu celular estén en la **misma red Wi-Fi**.
*   Obtén la dirección IP local de tu máquina ejecutando el servidor (ej: `192.168.1.147`).
*   En **Expo Go**, presiona *"Enter URL manually"* y escribe:
    ```
    exp://TU_DIRECCION_IP:8081
    ```
    *(Por ejemplo: `exp://192.168.1.147:8081`)*
*   El código se descargará directamente en tu móvil y podrás probar los sensores reales (GPS y pasos) y las vibraciones físicas.

---

## 📦 Compilación y Despliegue en Tiendas (EAS Build)

Para compilar binarios nativos listos para subir a producción sin necesidad de tener Xcode o Android Studio instalados localmente, utilizamos **Expo Application Services (EAS)**:

### 1. Configurar la cuenta de Expo
Inicia sesión en tu cuenta de Expo CLI:
```bash
npm install -g eas-cli
eas login
eas project:init
```

### 2. Compilar para Android (Google Play)
*   **Para pruebas en celular (APK):**
    ```bash
    eas build --platform android --profile development
    ```
*   **Para subir a la Play Store (AAB):**
    ```bash
    eas build --platform android --profile production
    ```

### 3. Compilar para iOS (App Store)
*   **Para compilar la versión de producción (requiere cuenta de Apple Developer):**
    ```bash
    eas build --platform ios --profile production
    ```
*   EAS generará las firmas nativas y te proporcionará el archivo `.ipa` o `.aab` compilado directamente en los servidores de Expo en la nube, dejándote el link de descarga listo.
