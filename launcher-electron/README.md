# 🎮 Illusion Launcher

Ein moderner Multi-Game Launcher für Pokémon Illusion, inspiriert vom Riot Client.

## ✨ Features

### 🎮 Core Features
- 🎨 **Moderne UI** - Glassmorphism-Effekte, Animationen mit Framer Motion
- 🎮 **Multi-Game Support** - Unterstützung für mehrere Spiele
- 🌈 **Animierter Hintergrund** - Canvas-basierte Partikel-Animation
- ⚡ **Schnell & Performant** - Electron + React + Vite
- 🎯 **Tailwind CSS** - Modernes Styling-System
- 📰 **News-Bereich** - Zeige Updates und Ankündigungen
- ⚙️ **Einstellungen** - Sprache, Theme, Auto-Update

### 🆕 Neue Features (v2.0)
- 🏆 **Achievement System** - Sammle 8+ Achievements und verdiene Punkte
- 📊 **Analytics & Statistiken** - Lokales Tracking deiner Spielaktivität
- 🔄 **Auto-Update** - Automatische Prüfung auf neue Launcher-Versionen
- 🤖 **CI/CD Pipeline** - Automatische Builds für alle Plattformen

## 🚀 Installation

```powershell
# In den Launcher-Ordner wechseln
cd launcher-electron

# Dependencies installieren
npm install

# Entwicklungsmodus starten
npm run dev
```

## 📦 Build

```powershell
# Für Windows
npm run build:win

# Für macOS
npm run build:mac

# Für Linux
npm run build:linux
```

## 🏗️ Projektstruktur

```
launcher-electron/
├── electron/          # Electron Main Process
│   ├── main.js       # Hauptprozess
│   └── preload.js    # Preload-Script
├── src/              # React Frontend
│   ├── components/   # React-Komponenten
│   ├── App.jsx      # Haupt-App
│   ├── main.jsx     # Entry Point
│   └── index.css    # Globale Styles
├── assets/          # Bilder, Icons
├── package.json     # Dependencies
└── vite.config.js   # Vite-Konfiguration
```

## 🎨 Anpassung

### Neue Spiele hinzufügen

Bearbeite `src/App.jsx` und füge ein neues Spiel zum `GAMES` Array hinzu:

```javascript
const GAMES = [
  {
    id: 'dein-spiel',
    name: 'Dein Spiel Name',
    description: 'Beschreibung',
    version: 'v1.0.0',
    image: '/assets/games/cover.jpg',
    status: 'installed',
    playTime: '0h 0m',
  },
];
```

### Spiel-Pfade konfigurieren

Bearbeite `electron/main.js` in der `getGamePath()` Funktion:

```javascript
const gamePaths = {
  'illusion': path.join(__dirname, '../../Game.exe'),
  'dein-spiel': path.join(__dirname, '../../DeinSpiel.exe'),
};
```

## 🎯 Features im Detail

### Glassmorphism-Effekte
- Transparente Hintergründe mit Blur
- Moderne UI-Elemente

### Animationen
- Framer Motion für flüssige Übergänge
- Hover-Effekte auf Buttons
- Partikel-Animation im Hintergrund

### Window Controls
- Frameless Window (wie Riot Client)
- Custom Minimize/Maximize/Close Buttons
- Drag-to-Move Titlebar

## 🛠️ Entwicklung

- **Electron**: Desktop-App Framework
- **React**: UI Library
- **Vite**: Build Tool & Dev Server
- **Tailwind CSS**: Utility-First CSS
- **Framer Motion**: Animation Library

## 📝 TODO

- [ ] Auto-Update-Funktion
- [ ] Mehrsprachigkeit (i18n)
- [ ] Store/Download-Funktion
- [ ] Cloud-Spielstände
- [ ] Freundesliste
- [ ] Achievements

## 🎮 Game Integration

Der Launcher startet dein Spiel über `Game.exe`. Stelle sicher, dass:
- Die Datei existiert
- Der Pfad in `electron/main.js` korrekt ist
- Das Spiel eigenständig läuft

## 🐛 Troubleshooting

**Launcher startet nicht:**
- Node.js Version überprüfen (>= 18)
- Dependencies neu installieren: `npm install`

**Spiel startet nicht:**
- Pfad in `electron/main.js` überprüfen
- Game.exe Berechtigungen prüfen

**Styling-Probleme:**
- Tailwind CSS Build: `npm run build`
- Browser-Cache leeren

## 📄 Lizenz

MIT License - siehe LICENSE Datei

---

Erstellt mit ❤️ für Pokémon Illusion
