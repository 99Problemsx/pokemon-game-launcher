# 🎁 Mystery Gift System

## Wie funktioniert es?

Das Mystery Gift System ermöglicht es dir, spezielle Codes im Launcher einzulösen und Belohnungen im Spiel zu erhalten!

## 📋 Anleitung

### 1. Code einlösen (im Launcher)
1. Öffne den Launcher
2. Gehe zu **"Belohnungen"** (Alt+5)
3. Klicke auf den **"🎁 Mystery Gifts"** Tab
4. Gib einen Code ein (z.B. `ILLUSION2025`)
5. Klicke **"Einlösen"** oder drücke Enter

### 2. Belohnung erhalten (im Spiel)
1. **Starte das Spiel** über den Launcher
2. Die Belohnungen werden **automatisch** beim Start vergeben!
3. Du erhältst eine Nachricht mit deinen Gifts

## 🎮 Verfügbare Codes

| Code | Belohnung |
|------|-----------|
| `ILLUSION2025` | 5000 Pokédollar + 10 Pokébälle |
| `DISCORD100` | Shiny Pikachu (Level 5) |
| `BETA` | Beta-Badge + 1000 Pokédollar |

## ⚙️ Technische Details

### Datei-Speicherort
Die Mystery Gifts werden gespeichert in:
```
%APPDATA%/Pokemon Illusion/mystery_gifts.json
```

### Datei-Format
```json
[
  {
    "code": "ILLUSION2025",
    "timestamp": 1697040000000,
    "claimed": false,
    "data": {
      "type": "items",
      "items": [
        { "item": "POKEBALL", "quantity": 10 },
        { "item": "MONEY", "quantity": 5000 }
      ]
    }
  }
]
```

### Status
- `claimed: false` → Gift wurde noch nicht im Spiel abgeholt
- `claimed: true` → Gift wurde bereits im Spiel erhalten

## 🔧 Für Entwickler

### Neue Codes hinzufügen

**1. Im Launcher** (`src/components/AchievementsPage.jsx`):
```javascript
const MYSTERY_CODES = {
  'MEINCODE': {
    name: 'Mein Gift',
    description: 'Beschreibung',
    rewards: ['Item 1', 'Item 2'],
    icon: '🎁',
    expires: null
  }
};
```

**2. Im Service** (`src/services/mysteryGiftService.js`):
```javascript
'MEINCODE': {
  type: 'items', // oder 'pokemon'
  items: [
    { item: 'POTION', quantity: 5 }
  ]
}
```

### Pokemon Gifts
```javascript
{
  type: 'pokemon',
  pokemon: {
    species: 'PIKACHU',
    level: 5,
    shiny: true,
    item: 'LIGHTBALL',
    moves: ['THUNDERSHOCK', 'GROWL']
  }
}
```

## ❓ Troubleshooting

### Gift wird nicht im Spiel angezeigt
1. Stelle sicher, dass das Spiel über den **Launcher** gestartet wurde
2. Prüfe ob die Datei existiert: `%APPDATA%/Pokemon Illusion/mystery_gifts.json`
3. Prüfe den Status: `claimed` sollte `false` sein

### Code lässt sich nicht einlösen
1. Prüfe Groß-/Kleinschreibung (wird automatisch konvertiert)
2. Code bereits eingelöst? → Check die Liste der eingelösten Codes
3. Code existiert? → Siehe verfügbare Codes oben

## 🎉 Features

- ✅ **Unlimited Codes**: Löse so viele Codes ein wie du willst
- ✅ **Einmalig**: Jeder Code kann nur einmal pro Account eingelöst werden
- ✅ **Automatisch**: Belohnungen werden beim Spielstart automatisch vergeben
- ✅ **Sicher**: LocalStorage + Electron IPC + Ruby Plugin
- ✅ **Persistent**: Codes bleiben gespeichert bis sie im Spiel abgeholt wurden

---

**Viel Spaß beim Sammeln! 🎁✨**
