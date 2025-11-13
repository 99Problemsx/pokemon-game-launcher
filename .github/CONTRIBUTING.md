# 🤝 Contributing to Illusion

Vielen Dank für dein Interesse an unserem Pokémon Essentials Projekt!

## 📋 Code of Conduct

Sei respektvoll und konstruktiv in allen Interaktionen.

## 🚀 Getting Started

### 1. Fork das Repository
Klicke auf "Fork" oben rechts auf der GitHub-Seite.

### 2. Clone dein Fork
```bash
git clone https://github.com/YOUR-USERNAME/Illusion.git
cd Illusion
```

### 3. Erstelle einen Branch
```bash
git checkout -b feature/mein-neues-feature
```

## 💻 Development Guidelines

### Ruby Code
- Folge den RuboCop-Regeln (`.rubocop.yml`)
- Teste deinen Code vor dem Commit
- Kommentiere komplexe Logik

### PBS Dateien
- UTF-8 Encoding verwenden
- Keine Tabs, nur Spaces
- Kein Trailing Whitespace

### JavaScript
- Validiere Syntax mit `node --check`
- Schreibe lesbaren, dokumentierten Code

## ✅ Pull Request Prozess

### 1. Teste deine Änderungen
```bash
# Ruby Syntax
ruby -c deine_datei.rb

# Im Spiel testen
# Öffne das Spiel und teste deine Features!
```

### 2. Commit mit aussagekräftigen Messages
```bash
git add .
git commit -m "feat: Add neue Funktion"
```

Verwende diese Prefixes:
- `feat:` - Neues Feature
- `fix:` - Bugfix
- `docs:` - Dokumentation
- `style:` - Formatierung
- `refactor:` - Code-Umstrukturierung
- `test:` - Tests
- `chore:` - Maintenance

### 3. Push zu deinem Fork
```bash
git push origin feature/mein-neues-feature
```

### 4. Erstelle einen Pull Request
- Gehe zum Original Repository
- Klicke "New Pull Request"
- Wähle deinen Branch
- Fülle die PR-Template aus
- Warte auf Review von den Maintainern!

## 🔍 Code Review

Pull Requests werden automatisch überprüft:
- ✅ RuboCop Lint
- ✅ Ruby Syntax Check
- ✅ PBS Validation
- ✅ Security Scan

Ein Maintainer wird deinen Code reviewen und Feedback geben.

## 🐛 Bug Reports

Verwende das [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md):
- Beschreibe das Problem klar
- Schritte zur Reproduktion
- Erwartetes vs. tatsächliches Verhalten
- Screenshots wenn möglich

## ✨ Feature Requests

Verwende das [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md):
- Beschreibe das gewünschte Feature
- Begründung und Use Cases
- Mögliche Implementierung

## 📁 Repository Struktur

```
Illusion/
├── Plugins/          # Ruby Plugins
├── PBS/              # Pokémon Battle System Dateien
├── Graphics/         # Sprites, Tilesets, etc.
├── Audio/            # Musik und Sound Effects
├── Data/             # Spiel-Daten
├── .github/          # GitHub Actions & Templates
└── pokemon/          # Generierte Pokédex-Seiten
```

## 🎮 Testing im Spiel

1. Öffne `Game.exe` oder nutze RPG Maker
2. Teste deine Änderungen ausgiebig
3. Prüfe auf:
   - Crashes
   - Visuelle Bugs
   - Performance-Probleme
   - Unerwartetes Verhalten

## 💬 Community

- **Discord**: Tritt unserem Server bei! (Link im Webhook)
- **Issues**: Stelle Fragen via GitHub Issues
- **Discussions**: Nutze GitHub Discussions für allgemeine Themen

## 🎯 Prioritäten

Wir freuen uns besonders über Beiträge in diesen Bereichen:
- 🐛 Bugfixes
- ⚡ Performance-Verbesserungen
- 🌍 Übersetzungen (Deutsch/Englisch)
- 📚 Dokumentation
- 🎨 Grafik-Verbesserungen

## ❓ Fragen?

Erstelle ein Issue mit dem Label `question` oder frage im Discord!

---

**Vielen Dank für deine Beiträge! 🎉**

Jeder Beitrag macht Illusion besser! 💪
