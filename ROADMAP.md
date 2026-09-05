# 🗺️ Roadmap de Ideas y Mejoras para PokéSearch

Este documento reúne propuestas y funcionalidades potenciales para expandir el proyecto **PokéSearch**.

---

## 1. 🎨 Mejoras Visuales e Interactivas
- **🔊 Reproductor del Grito del Pokémon (Audio Cries)**:
  - Integrar el audio oficial de la PokéAPI (`cries.latest`).
  - Añadir un botón interactivo con ondas de sonido animadas para reproducir el rugido característico.
- **🌳 Cadena Evolutiva Interactiva (Evolution Chain)**:
  - Visualizar la línea evolutiva completa (ej: *Charmander ➔ Charmeleon ➔ Charizard*).
  - Incluir el método o condición de evolución (nivel, piedra, intercambio, felicidad).
  - Permitir hacer clic sobre cualquier miembro de la cadena para cargarlo directamente en el buscador.
- **🌍 Formas Regionales (Alola, Galar, Hisui, Paldea)**:
  - Añadir un botón similar al de Megas / G-Max / Primigenios para alternar variantes regionales (ej: *Vulpix de Alola*, *Zorua de Hisui*).

---

## 2. ⚔️ Utilidades de Combate y Competitivo
- **🛡️ Tabla de Efectividad de Tipos (Type Matchups)**:
  - Matriz con cálculo de daño recibido: debilidades ($2\times$, $4\times$), resistencias ($0.5\times$, $0.25\times$) e inmunidades ($0\times$).
- **🕸️ Gráfico Radial de Estadísticas (Radar / Hexagon Chart)**:
  - Representación tipo telaraña para apreciar visualmente el balance de estadísticas (HP, Ataque, Defensa, At. Esp, Def. Esp, Velocidad).
- **🆚 Modo Comparador (Versus / Side-by-Side)**:
  - Comparar dos Pokémon lado a lado para evaluar diferencias en estadísticas base y combinaciones de tipos.
- **📖 Detalles de Habilidades y Movimientos (Moveset)**:
  - Pestañas para consultar la lista de movimientos que aprende por nivel o MT, indicando potencia, precisión y categoría (Físico / Especial / Estado).

---

## 3. 💾 Experiencia de Usuario y Persistencia
- **⭐ Favoritos e Historial Reciente**:
  - Almacenar los últimos Pokémon buscados para acceder a ellos con un solo clic.
  - Botón de guardado en favoritos con persistencia local (`localStorage`).
- **🎲 Botón de Pokémon Aleatorio ("Sorpréndeme")**:
  - Selector al azar entre todos los Pokémon existentes (IDs 1 al 1025).
- **⏮️ Paginación y Navegación Rápida**:
  - Botones de "Anterior" y "Siguiente" para recorrer la Pokédex secuencialmente sin tener que teclear el ID.
