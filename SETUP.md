# 🚀 Setup Guide for Open Source Users

This guide will help you set up the Multi-Game Launcher for your own games.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **Git** installed ([Download](https://git-scm.com/))
- [ ] **GitHub account** (for hosting game releases)
- [ ] **Your game(s)** ready to package
- [ ] **Discord Developer account** (optional, for Rich Presence)

---

## ⚡ Quick Setup (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/YourUsername/your-launcher.git
cd your-launcher/launcher-electron

# 2. Install dependencies
npm install

# 3. Copy configuration templates
cp games.config.example.json games.config.json
cp mystery-gifts.config.example.json mystery-gifts.config.json
cp .env.example .env

# 4. Edit games.config.json with your game info
# (See detailed steps below)

# 5. Run the launcher
npm run dev
```

---

## 📝 Step-by-Step Configuration

### Step 1: Configure Your Games

Edit `launcher-electron/games.config.json`:

```json
{
  "games": [
    {
      "id": "my-awesome-game",
      "name": "My Awesome Game",
      "descriptionKey": "myGameDesc",
      "version": "v1.0.0",
      "coverImage": "/assets/games/my-game-cover.jpg",
      "repo": {
        "owner": "YourGitHubUsername",
        "name": "my-awesome-game-repo"
      },
      "installPath": "My Awesome Game",
      "exeName": "Game.exe",
      "saveFolder": "My Awesome Game",
      "discord": {
        "clientId": "YOUR_DISCORD_APP_ID",
        "appName": "My Awesome Game"
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

**Field Guide:**

| Field            | Description                              | Example                   |
| ---------------- | ---------------------------------------- | ------------------------- |
| `id`             | Unique identifier (lowercase, no spaces) | `my-awesome-game`         |
| `name`           | Display name                             | `My Awesome Game`         |
| `descriptionKey` | Translation key (add to translations.js) | `myGameDesc`              |
| `version`        | Current version                          | `v1.0.0`                  |
| `coverImage`     | Path to cover image                      | `/assets/games/cover.jpg` |
| `repo.owner`     | Your GitHub username                     | `YourUsername`            |
| `repo.name`      | Repository name                          | `my-awesome-game-repo`    |
| `installPath`    | Folder name in AppData/Local             | `My Awesome Game`         |
| `exeName`        | Executable filename                      | `Game.exe`                |
| `saveFolder`     | Save file folder                         | `My Awesome Game`         |

### Step 2: Add Game Description

Edit `launcher-electron/src/i18n/translations.js`:

```javascript
export const translations = {
  de: {
    myGameDesc: "Eine epische Geschichte über...",
    // ... other translations
  },
  en: {
    myGameDesc: "An epic story about...",
    // ... other translations
  },
};
```

### Step 3: Add Cover Image

1. Create a cover image:

   - **Size**: 1920x1080 or 1280x720
   - **Format**: JPG or PNG
   - **Content**: Your game's key art/promotional image

2. Save it to: `launcher-electron/public/assets/games/my-game-cover.jpg`

### Step 4: Configure Mystery Gifts (Optional)

Edit `launcher-electron/mystery-gifts.config.json`:

```json
{
  "gifts": {
    "WELCOME2025": {
      "type": "items",
      "items": [
        { "item": "STARTER_PACK", "quantity": 1 },
        { "item": "GOLD", "quantity": 1000 }
      ]
    },
    "LAUNCH_BONUS": {
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

- `items` - Give items/currency
- `pokemon` - Give a Pokémon (for Pokémon fangames)

### Step 5: Setup Discord Rich Presence (Optional)

#### 5.1 Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name: Your game name
4. Copy the **Application ID**

#### 5.2 Upload Assets

1. Go to **Rich Presence** → **Art Assets**
2. Upload images:
   - `game_logo` (512x512) - Main logo
   - `studio_logo` (512x512) - Studio logo
   - `launcher_icon` (128x128) - Small icon

#### 5.3 Configure .env

Edit `launcher-electron/.env`:

```bash
DISCORD_CLIENT_ID_MYGAME=1234567890123456789
```

---

## 🎮 Preparing Your Game for GitHub Releases

### Step 1: Package Your Game

Create a ZIP file containing:

```
MyGame-v1.0.0.zip
├── Game.exe           # Main executable
├── Data/              # Game data
├── Graphics/          # Graphics
├── Audio/             # Audio files
└── (other files)
```

**Important**: The launcher extracts everything and looks for `Game.exe` in the root.

### Step 2: Create GitHub Release

1. Go to your game's repository
2. Click **Releases** → **Draft a new release**
3. **Tag**: `v1.0.0` (use semantic versioning)
4. **Title**: `My Awesome Game v1.0.0`
5. **Description**: Changelog/patch notes
6. **Attach files**: Upload your `MyGame-v1.0.0.zip`
7. Click **Publish release**

### Step 3: Test Download

1. Run launcher: `npm run dev`
2. Your game should appear with "Download" button
3. Click download and verify it installs correctly

---

## 🏗️ Building Your Launcher

### Development Mode

```bash
npm run dev
```

- Hot reload enabled
- DevTools available
- Fast iteration

### Production Build

```bash
npm run build
```

Creates installer in `dist-electron/`:

- `YourLauncher-1.0.0-Setup.exe` - Windows installer
- `latest.yml` - Auto-update manifest

### Customizing Build

Edit `launcher-electron/package.json`:

```json
{
  "name": "your-launcher",
  "productName": "Your Launcher Name",
  "version": "1.0.0",
  "build": {
    "appId": "com.yourstudio.launcher",
    "productName": "Your Launcher",
    "icon": "public/icon.png",
    "win": {
      "target": "nsis"
    }
  }
}
```

---

## 🎨 Customization Tips

### Change Launcher Name

1. `package.json` → `"productName": "Your Name"`
2. `src/components/TitleBar.jsx` → Update title text
3. `electron/main.js` → Update window title

### Change Colors/Theme

1. Open launcher
2. Go to **Themes & Designs**
3. Use **Theme Editor** to customize
4. Save your theme

Or edit `src/services/themeSystem.js` directly.

### Add More Games

Just add more entries to `games.config.json`:

```json
{
  "games": [
    { "id": "game1", ... },
    { "id": "game2", ... },
    { "id": "game3", ... }
  ]
}
```

### Modify UI

Edit components in `src/components/`:

- `GameCard.jsx` - How games are displayed
- `Sidebar.jsx` - Navigation menu
- `Settings.jsx` - Settings page
- `AchievementsPage.jsx` - Achievements

---

## 🔧 Common Issues & Solutions

### Issue: "games.config.json not found"

**Solution:**

```bash
cp games.config.example.json games.config.json
```

### Issue: "Cannot download game"

**Possible causes:**

1. GitHub repository is private (make it public)
2. No release published yet
3. Release has no ZIP file attached
4. Incorrect repo owner/name in config

**Solution:**

- Verify release exists at: `github.com/YourUsername/YourRepo/releases`
- Check `games.config.json` has correct owner and repo name
- Ensure ZIP file is attached to release

### Issue: "Discord Rich Presence not working"

**Possible causes:**

1. Discord not running
2. Invalid Discord App ID
3. .env file not configured

**Solution:**

- Make sure Discord desktop app is running
- Verify App ID in Discord Developer Portal
- Check `.env` file has correct `DISCORD_CLIENT_ID_YOURGAME`

### Issue: Build fails

**Solution:**

```bash
# Clear cache and rebuild
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📚 Next Steps

Once your launcher is working:

1. ✅ **Test thoroughly** - Download, install, launch games
2. ✅ **Customize UI** - Make it match your brand
3. ✅ **Add achievements** - Edit `achievementManager.js`
4. ✅ **Setup auto-updates** - Host your launcher on GitHub Releases
5. ✅ **Gather feedback** - Share with beta testers
6. ✅ **Iterate** - Improve based on feedback

---

## 🆘 Getting Help

- **Documentation**: See `README_OPENSOURCE.md`
- **Issues**: [GitHub Issues](https://github.com/YourUsername/your-launcher/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YourUsername/your-launcher/discussions)
- **Discord**: [Your Server](https://discord.gg/yourserver)

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `games.config.json` created and configured
- [ ] `mystery-gifts.config.json` configured (optional)
- [ ] `.env` configured (optional)
- [ ] Cover image added
- [ ] Translation keys added
- [ ] Game published as GitHub Release
- [ ] Launcher tested in dev mode
- [ ] Production build tested

---

**Congratulations!** 🎉 Your launcher is ready to go!

**Happy Launching!** 🚀
