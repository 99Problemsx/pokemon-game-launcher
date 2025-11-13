# Illusion Launcher - Quick Start

## 🚀 Launcher starten

```powershell
cd launcher-electron
npm run dev
```

## ✨ Der Launcher läuft jetzt mit:

✅ **Animierter Canvas-Background**
- 80 leuchtende Partikel mit Puls-Effekt
- 5 animierte Wellen
- 5 schwebende Orbs
- Verbindungslinien zwischen Partikeln
- Sparkle-Effekte
- Beweglicher Gradient

✅ **Aurora-Overlay**
- Sanfter Farbwechsel über dem gesamten Fenster

✅ **Animierte UI-Komponenten**
- **TitleBar**: Rotierendes Logo, Scale-Animationen
- **Sidebar**: Stagger-Animation, rotierende Icons, Glow-Effekte
- **Game Card**: Rainbow-Text, Zoom-In, Ripple-Effekt
- **News Cards**: Hover-Zoom, Text-Gradient, Lift-Effekt

## 🎮 Features

- 🎨 Glassmorphism-Effekte
- ✨ Framer Motion Animationen
- 🌈 Tailwind CSS mit Custom-Animationen
- 🎯 Multi-Game Support
- ⚡ 60 FPS Performance
- 🖼️ Frameless Window (wie Riot Client)

## ⚙️ Spiel-Pfad anpassen

Bearbeite `electron/main.js`:

```javascript
const gamePaths = {
  'illusion': path.join(__dirname, '../../Game.exe'),
};
```

## 🎨 Neue Spiele hinzufügen

Bearbeite `src/App.jsx`:

```javascript
const GAMES = [
  {
    id: 'illusion',
    name: 'Pokémon Illusion',
    description: 'Erlebe ein episches Abenteuer',
    version: 'v1.0.0',
    image: '/assets/games/illusion-cover.jpg',
    status: 'installed',
    playTime: '12h 34m',
  },
  // Füge hier neue Spiele hinzu...
];
```

## 📦 Build für Production

```powershell
npm run build:win
```

## 🐛 Troubleshooting

**Launcher schließt sich sofort:**
- Vite Server muss auf Port 5173 laufen
- Prüfe `npm run dev:vite` Output

**Black Screen:**
- DevTools öffnen (F12)
- Console-Errors prüfen

**Game startet nicht:**
- Game.exe Pfad in `electron/main.js` prüfen
- Berechtigungen überprüfen

---

**Der Launcher ist fertig und funktioniert! 🎉**

Viel Spaß mit Pokémon Illusion! 🌟
