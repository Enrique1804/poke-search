# ⚡ PokéSearch

Una aplicación web moderna, rápida e interactiva construida con **React**, **TypeScript**, **Vite** y **Tailwind CSS v4**, que consume datos en tiempo real de la **PokéAPI** y de la **TCGdex API**.

---

## ✨ Características Principales

* 🔍 **Búsqueda en Tiempo Real y Autocompletado**:
  * Menú flotante interactivo que sugiere Pokémon mientras escribes por nombre o número de Pokédex.
  * Precarga de datos en caché local (`localStorage`) para resultados a 0 ms.
* 🐕 **Soporte Completo de Pokémon Multiforma**:
  * Resolución inteligente por especie: puedes buscar Pokémon como *Zygarde*, *Urshifu*, *Maushold*, *Giratina*, *Deoxys*, *Rotom*, etc., por su nombre común sin necesidad de escribir sufijos técnicos.
  * Botones dinámicos para alternar entre sus diferentes formas (10%, Completa, Golpe Fluido, Formas de Rotom, etc.).
* 💥 **Transformaciones Especiales**:
  * **Modo Shiny**: Alterna la paleta de colores variocolor en alta definición.
  * **Mega Evoluciones**: Soporte para formas individuales y múltiples (ej: Mega X y Mega Y para Charizard).
  * **Gigantamax (G-Max)**: Formas gigantescas exclusivas de Galar.
  * **Regresión Primigenia**: Formas primigenias con estilos temáticos (Groudon y Kyogre).
  * **Formas Regionales**: Alola, Galar, Hisui y Paldea con adaptación de tipos y estadísticas base.
* 🔊 **Grito Oficial de Audio**:
  * Reproduce el sonido característico de cada Pokémon directamente desde la API con ondas de sonido animadas.
* 🌳 **Árbol Evolutivo Ramificado**:
  * Jerarquía recursiva que representa correctamente evoluciones lineales y ramificaciones complejas en paralelo (como *Tyrogue*, *Eevee* o *Wooper/Clodsire*).
  * Requisitos de evolución (niveles, piedras, intercambio, condiciones de stats).
  * Clic directo sobre cualquier fase para navegar a ese Pokémon de inmediato.
* 🃏 **Colección de Cartas Pokémon TCG**:
  * Integración con la **TCGdex API** con soporte en español.
  * Galería de cartas coleccionables y modal inspector en alta resolución (`high.webp`).
  * Cotizaciones de mercado en tiempo real de **TCGPlayer (USD)** y **Cardmarket (EUR)**.
* 💾 **Persistencia y Utilidades**:
  * **Favoritos**: Guarda tus Pokémon preferidos en `localStorage`.
  * **Historial reciente**: Chips de acceso rápido con botón para vaciar el historial.
  * **Botón Azar ("Sorpréndeme")**: Elige un Pokémon aleatorio entre los 1025 existentes.
  * **Navegación Secuencial**: Botones Anterior / Siguiente (`◀` y `▶`) para recorrer la Pokédex.

---

## 🛠️ Tecnologías

* [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* [Vite](https://vitejs.dev/)
* [Tailwind CSS v4](https://tailwindcss.com/)
* [PokéAPI](https://pokeapi.co/) (Datos de videojuegos, estadísticas, sprites y audios)
* [TCGdex API](https://www.tcgdex.dev/) (Cartas coleccionables y precios de mercado)

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/poke-search.git
   cd poke-search
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia [MIT](LICENSE). Pokémon y todos los nombres respectivos son marcas registradas de Nintendo, Creatures Inc. y Game Freak.
