# 🎮 Multi-Game Launcher - Open Source

> A modern, feature-rich game launcher built with Electron, React, and Tailwind CSS. Perfect for indie game studios managing multiple games!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-31+-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)

## ✨ Features

### 🎯 Core Features

- **Multi-Game Management** - Manage multiple games from one launcher
- **Auto-Updates** - Automatic game and launcher updates from GitHub Releases
- **Download Manager** - Download and install games directly from GitHub
- **Play Time Tracking** - Track how long you've played each game
- **Achievement System** - Unlock achievements across all your games
- **Mystery Gift System** - Reward players with in-game items and Pokémon

### 🎨 User Interface

- **Modern Glassmorphism Design** - Beautiful glass effects and animations
- **Framer Motion Animations** - Smooth 60 FPS animations
- **Custom Themes** - Multiple pre-built themes (Cyberpunk, Sunset, Ocean, etc.)
- **Theme Editor** - Create custom color schemes
- **Responsive Design** - Works on any screen size
- **i18n Support** - Multi-language (German & English included)

### 🔧 Advanced Features

- **Discord Rich Presence** - Show what you're playing on Discord
- **Daily Login Rewards** - Keep players engaged with daily rewards
- **Daily Challenges** - Complete challenges for bonus rewards
- **Statistics Dashboard** - Detailed stats about gameplay
- **Backup System** - Automatic save file backups
- **News Feed** - In-launcher news and announcements
- **Patch Notes** - Automatic changelog display from GitHub releases

### 🚀 Developer Features

- **External Configuration** - All game data in JSON config files
- **Hot Module Replacement** - Fast development with Vite
- **TypeScript Support** - Type-safe code (optional)
- **ESLint + Prettier** - Code quality enforcement
- **Auto-Update Service** - Built-in update mechanism
- **GitHub API Integration** - Download releases automatically

---

## 📦 Quick Start

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/your-launcher.git
cd your-launcher/launcher-electron

# Install dependencies
npm install

# Copy configuration templates
cp games.config.example.json games.config.json
cp mystery-gifts.config.example.json mystery-gifts.config.json
cp .env.example .env

# Configure your games (see Configuration section below)
# Edit games.config.json, mystery-gifts.config.json, and .env

# Run in development mode
npm run dev

# Or build for production
npm run build
```

---

## ⚙️ Configuration

### 1. Games Configuration (`games.config.json`)

This file defines all your games:

```json
{
  "games": [
    {
      "id": "your-game-id",
      "name": "Your Game Name",
      "descriptionKey": "yourGameDesc",
      "version": "v1.0.0",
      "coverImage": "/assets/games/your-game-cover.jpg",
      "repo": {
        "owner": "YourGitHubUsername",
        "name": "your-game-repo"
      },
      "installPath": "Your Game Name",
      "exeName": "Game.exe",
      "saveFolder": "Your Game Name",
      "discord": {
        "clientId": "YOUR_DISCORD_APP_ID",
        "appName": "Your Game Name"
      }
    }
  ],
  "launcher": {
    "studioName": "Your Studio Name",
    "discord": {
      "clientId": "LAUNCHER_DISCORD_APP_ID"
    }
  }
}
```

**Fields Explanation:**

- `id` - Unique identifier (lowercase, no spaces)
- `name` - Display name shown in launcher
- `descriptionKey` - Translation key for game description
- `version` - Current version (from GitHub releases)
- `coverImage` - Path to cover image (1920x1080 recommended)
- `repo.owner` - GitHub username/organization
- `repo.name` - GitHub repository name
- `installPath` - Installation folder name (in AppData/Local)
- `exeName` - Executable filename
- `saveFolder` - Save game folder name
- `discord.clientId` - Discord Application ID (optional)
- `discord.appName` - Display name in Discord

### 2. Mystery Gifts Configuration (`mystery-gifts.config.json`)

Define redeemable codes for your games:

```json
{
  "gifts": {
    "WELCOME2025": {
      "type": "items",
      "items": [
        { "item": "POKEBALL", "quantity": 10 },
        { "item": "MONEY", "quantity": 5000 }
      ]
    },
    "SHINY100": {
      "type": "pokemon",
      "pokemon": {
        "species": "PIKACHU",
        "level": 5,
        "shiny": true,
        "item": null,
        "moves": ["THUNDERSHOCK", "GROWL"]
      }
    }
  }
}
```

**Gift Types:**

- `items` - Give items/money
- `pokemon` - Give a Pokémon (supports: species, level, shiny, item, moves)

### 3. Environment Variables (`.env`)

```bash
# Discord Rich Presence (optional)
DISCORD_CLIENT_ID=YOUR_LAUNCHER_DISCORD_APP_ID
DISCORD_CLIENT_ID_GAME1=YOUR_FIRST_GAME_DISCORD_APP_ID

# GitHub Token (optional - for higher rate limits)
GITHUB_TOKEN=your_personal_access_token_here
```

### 4. Translations (`src/i18n/translations.js`)

Add your game descriptions:

```javascript
export const translations = {
  de: {
    yourGameDesc: "Deine deutsche Spielbeschreibung hier",
  },
  en: {
    yourGameDesc: "Your English game description here",
  },
};
```

### 5. Game Cover Images

Place cover images in `launcher-electron/public/assets/games/`:

- Recommended size: **1920x1080** or **1280x720**
- Format: **JPG** or **PNG**
- Filename: `your-game-cover.jpg`

---

## 🎮 Game Setup

Your games must be hosted as **GitHub Releases** with a `.zip` file containing `Game.exe`.

### Release Structure

```
your-game-repo/
└── releases/
    └── v1.0.0/
        └── YourGame-v1.0.0.zip
            └── Game.exe
            └── (other game files)
```

### Creating a Release

1. Go to your game's GitHub repository
2. Click **Releases** → **Create a new release**
3. Tag: `v1.0.0` (semantic versioning)
4. Title: `Your Game v1.0.0`
5. Upload your game ZIP file as an asset
6. Publish release

The launcher will automatically:

- Detect the latest release
- Download the ZIP file
- Extract to `%LOCALAPPDATA%/Your Game Name/`
- Launch `Game.exe`

---

## 🔥 Discord Rich Presence Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name: Your Game/Launcher Name
4. Copy the **Application ID**

### 2. Upload Assets

1. Go to **Rich Presence** → **Art Assets**
2. Upload images:

   - `game_logo` (512x512) - Main game logo
   - `studio_logo` (512x512) - Studio/launcher logo
   - `launcher_icon` (128x128) - Small icon

3. Optional: Upload additional icons (playing_icon, menu_icon, battle_icon, etc.)

### 3. Configure `.env`

```bash
DISCORD_CLIENT_ID_YOURGAME=1234567890123456789
```

### 4. Add to `games.config.json`

```json
{
  "discord": {
    "clientId": "1234567890123456789",
    "appName": "Your Game Name"
  }
}
```

---

## 🏗️ Building for Production

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

This creates:

- `dist-electron/` - Installer files
- `Mirrorbytes Studio-X.X.X-Setup.exe` - Windows installer
- `latest.yml` - Auto-update manifest

### Build Configuration

Edit `launcher-electron/package.json` → `build` section:

```json
{
  "build": {
    "appId": "com.yourstudio.launcher",
    "productName": "Your Launcher Name",
    "icon": "public/icon.png"
  }
}
```

---

## 📁 Project Structure

```
launcher-electron/
├── electron/              # Electron main process
│   ├── main.js           # Main entry point
│   └── preload.js        # Preload script
├── src/                  # React frontend
│   ├── App.jsx           # Main app component
│   ├── components/       # UI components
│   ├── services/         # Business logic
│   ├── hooks/            # Custom React hooks
│   └── i18n/             # Translations
├── public/               # Static assets
│   └── assets/
│       └── games/        # Game cover images
├── games.config.json     # Game configuration (create from example)
├── mystery-gifts.config.json  # Gift codes (create from example)
├── .env                  # Environment variables (create from example)
├── package.json          # Dependencies
└── vite.config.js        # Vite configuration
```

---

## 🎨 Customization

### Adding a New Game

1. **Add to `games.config.json`**:

```json
{
  "id": "my-new-game",
  "name": "My New Game",
  ...
}
```

2. **Add cover image**: `public/assets/games/my-new-game-cover.jpg`

3. **Add translation**: `src/i18n/translations.js`

```javascript
myNewGameDesc: "Game description here";
```

4. **Restart launcher**: Changes will be loaded automatically

### Creating Custom Themes

1. Open launcher
2. Go to **Themes & Designs**
3. Click **Theme Editor**
4. Adjust colors and see live preview
5. Click **Save Theme**

Or edit `themeSystem.js` for pre-built themes.

### Modifying UI

All UI components are in `src/components/`:

- `GameCard.jsx` - Game display cards
- `Sidebar.jsx` - Navigation menu
- `Settings.jsx` - Settings page
- `AchievementsPage.jsx` - Achievements
- `RewardsPage.jsx` - Mystery gifts

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Hot Reload

Changes to React components are hot-reloaded automatically. Changes to Electron main process require restart.

### Debugging

- **React DevTools**: Available in development mode
- **Electron DevTools**: Press `F12` or `Ctrl+Shift+I`
- **Console Logs**: Check terminal for backend logs

---

## 📚 API Reference

### IPC Handlers (Electron ↔ React)

```javascript
// Download game
window.electron.downloadGame(gameId);

// Launch game
window.electron.launchGame(gameId);

// Get game path
window.electron.getGamePath(gameId);

// Check if file exists
window.electron.fileExists(filePath);

// Read file
window.electron.readFile(filePath);

// Get settings
window.electron.getSettings();

// Save settings
window.electron.saveSettings(settings);
```

### Services

- **Analytics** - `services/analytics.js` - Usage tracking
- **Achievements** - `services/achievementManager.js` - Achievement system
- **Backups** - `services/backupService.js` - Save file backups
- **Discord** - `services/discordService.js` - Rich Presence
- **GitHub** - `services/githubService.js` - Release fetching
- **Mystery Gifts** - `services/mysteryGiftService.js` - Gift codes
- **Statistics** - `services/statisticsService.js` - Gameplay stats
- **Themes** - `services/themeSystem.js` - Theme management

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use **ESLint** + **Prettier**
- Follow **React best practices**
- Comment complex logic
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

**In short**: You can use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. Just include the original copyright notice.

---

## 🙏 Acknowledgments

- **Electron** - Cross-platform desktop apps
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Vite** - Build tool
- **Pokemon Essentials** - Inspiration for Mystery Gift system

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YourUsername/your-launcher/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YourUsername/your-launcher/discussions)
- **Discord**: [Your Discord Server](https://discord.gg/yourserver)

---

## 🗺️ Roadmap

- [ ] macOS support
- [ ] Linux support
- [ ] Cloud save sync
- [ ] In-launcher game updates (delta patching)
- [ ] Mod manager integration
- [ ] Streaming/broadcast integration
- [ ] Controller support configuration
- [ ] Voice chat integration

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/YourUsername/your-launcher?style=social)
![GitHub forks](https://img.shields.io/github/forks/YourUsername/your-launcher?style=social)
![GitHub issues](https://img.shields.io/github/issues/YourUsername/your-launcher)
![GitHub pull requests](https://img.shields.io/github/issues-pr/YourUsername/your-launcher)

---

**Made with ❤️ for indie game developers**
