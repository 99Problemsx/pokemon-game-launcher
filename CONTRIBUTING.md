# Contributing to Multi-Game Launcher

First off, thank you for considering contributing to this project! 🎉

The following is a set of guidelines for contributing. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

**Our Pledge:**

- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

**Unacceptable Behavior:**

- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Fork & Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/your-launcher.git
cd your-launcher/launcher-electron
npm install
```

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

---

## 🤝 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check existing issues to avoid duplicates.

**Good Bug Reports Include:**

- **Clear title** - Summarize the problem
- **Description** - Detailed explanation
- **Steps to reproduce** - Numbered list
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Screenshots** - If applicable
- **Environment** - OS, Node version, launcher version
- **Additional context** - Logs, error messages

**Example:**

```markdown
**Bug**: Launcher crashes when downloading large files

**Steps to Reproduce:**

1. Open launcher
2. Click "Download" on a game > 500MB
3. Launcher freezes at 80% progress

**Expected**: Download completes successfully
**Actual**: Launcher crashes with error "Out of memory"

**Environment**: Windows 11, Node 20.10.0, Launcher v1.0.0
**Logs**: [Attach logs]
```

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues.

**Good Enhancement Suggestions Include:**

- **Clear title** - Feature name
- **Problem** - What problem does it solve?
- **Solution** - How should it work?
- **Alternatives** - Other solutions considered
- **Mockups** - If UI change
- **Additional context** - Examples, use cases

### Contributing Code 💻

1. **Pick an issue** - Check "good first issue" or "help wanted" labels
2. **Comment on it** - Let others know you're working on it
3. **Fork & create branch**
4. **Write code** - Follow coding guidelines
5. **Test thoroughly** - Ensure nothing breaks
6. **Commit & push**
7. **Open PR** - Reference the issue

---

## 🛠️ Development Setup

### Initial Setup

```bash
cd launcher-electron
npm install

# Copy config templates
cp games.config.example.json games.config.json
cp mystery-gifts.config.example.json mystery-gifts.config.json
cp .env.example .env

# Start development server
npm run dev
```

### Project Structure

```
launcher-electron/
├── electron/           # Electron main process (Node.js)
│   ├── main.js        # App entry point, IPC handlers
│   └── preload.js     # Bridge between main & renderer
├── src/               # React frontend
│   ├── App.jsx        # Main component
│   ├── components/    # UI components
│   ├── services/      # Business logic
│   ├── hooks/         # Custom hooks
│   └── i18n/          # Translations
└── public/            # Static assets
```

### Running Tests

```bash
npm run lint          # Check code style
npm run build         # Test production build
```

---

## 📝 Coding Guidelines

### General Principles

- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It
- **Write readable code** - Code is read more than written
- **Comment complex logic** - Explain WHY, not WHAT

### JavaScript/React

```javascript
// ✅ Good
const GameCard = ({ game, onLaunch }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onLaunch(game.id);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {game.name}
    </div>
  );
};

// ❌ Bad
const gc = ({ g, ol }) => {
  const [h, sh] = useState(false);
  return (
    <div onMouseEnter={() => sh(true)} onClick={() => ol(g.id)}>
      {g.name}
    </div>
  );
};
```

### Naming Conventions

- **Components**: `PascalCase` (e.g., `GameCard.jsx`)
- **Functions**: `camelCase` (e.g., `handleDownload`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_DOWNLOAD_SIZE`)
- **Files**: `camelCase.js` or `PascalCase.jsx`

### File Organization

```javascript
// ✅ Good order
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SomeComponent from "./SomeComponent";
import { useTranslation } from "../i18n/translations";
import "./styles.css";

// Constants
const MAX_RETRIES = 3;

// Component
const MyComponent = () => {
  // State
  const [data, setData] = useState(null);

  // Hooks
  const { t } = useTranslation();

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const loadData = async () => {
    // ...
  };

  // Render
  return <div>{/* JSX */}</div>;
};

export default MyComponent;
```

### Comments

```javascript
// ✅ Good - Explains WHY
// Use exponential backoff to avoid overwhelming the GitHub API
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// ❌ Bad - States the obvious
// Set delay variable
const delay = 1000;
```

### Error Handling

```javascript
// ✅ Good
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error("Failed to fetch data:", error);
  showNotification("Error loading data. Please try again.", "error");
  return null;
}

// ❌ Bad
try {
  return await fetchData();
} catch (e) {
  // Silent fail
}
```

### Async/Await

```javascript
// ✅ Good
const downloadGame = async (gameId) => {
  try {
    setDownloading(true);
    const result = await window.electron.downloadGame(gameId);
    if (result.success) {
      showNotification("Download complete!");
    }
  } catch (error) {
    console.error("Download failed:", error);
  } finally {
    setDownloading(false);
  }
};

// ❌ Bad (promise hell)
const downloadGame = (gameId) => {
  setDownloading(true);
  window.electron
    .downloadGame(gameId)
    .then((result) => {
      if (result.success) {
        showNotification("Download complete!");
        setDownloading(false);
      }
    })
    .catch((error) => {
      console.error(error);
      setDownloading(false);
    });
};
```

---

## 💬 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `perf:` - Performance improvement
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples

```bash
# Good
feat(launcher): add auto-update notification
fix(download): prevent memory leak on large downloads
docs(readme): update installation instructions
style(gamecard): improve button hover effect
refactor(discord): extract Rich Presence logic
perf(ui): reduce re-renders with useMemo
chore(deps): update electron to v31.0.0

# Bad
fixed bug
updated stuff
changes
asdf
```

### Detailed Example

```
feat(achievements): add daily challenge system

- Add DailyChallengesSystem service
- Implement challenge tracking
- Add UI component for daily challenges
- Update translations for new strings

Closes #123
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review of code
- [ ] Commented hard-to-understand areas
- [ ] Updated documentation if needed
- [ ] No warnings or errors
- [ ] Tested on Windows (primary platform)
- [ ] Updated CHANGELOG.md if major change

### PR Title

Follow commit message format:

```
feat(launcher): add cloud save sync
fix(discord): resolve Rich Presence disconnect issue
```

### PR Description Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues

Fixes #123
Related to #456

## How Has This Been Tested?

Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

### Review Process

1. **Automated Checks** - CI runs linting and builds
2. **Code Review** - Maintainer reviews code
3. **Feedback** - Address any requested changes
4. **Approval** - Once approved, PR is merged
5. **Cleanup** - Delete feature branch after merge

### After Merge

- Your contribution is now part of the project! 🎉
- You'll be added to the contributors list
- Update your fork: `git pull upstream main`

---

## 🎨 Style Guide

### React Components

```javascript
// Functional components with hooks
import React, { useState, useEffect } from "react";

const GameCard = ({ game, onLaunch, onSettings }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div whileHover={{ scale: 1.05 }} className="game-card">
      <img src={game.image} alt={game.name} />
      <h3>{game.name}</h3>
      <button onClick={() => onLaunch(game.id)}>Play</button>
    </motion.div>
  );
};

export default GameCard;
```

### Tailwind CSS

```javascript
// Use Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
  <span className="text-lg font-bold">Game Name</span>
  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg">
    Play
  </button>
</div>

// Avoid inline styles unless dynamic
<div style={{ background: `linear-gradient(to right, ${color1}, ${color2})` }}>
```

### File Naming

```
components/
├── GameCard.jsx          # Component
├── Sidebar.jsx
└── UpdateNotification.jsx

services/
├── discordService.js     # Service
├── achievementManager.js
└── backupService.js

hooks/
└── useKeyboardShortcuts.jsx
```

---

## 🐛 Debugging Tips

### Electron DevTools

```javascript
// In main.js, enable DevTools
mainWindow.webContents.openDevTools();
```

### Logging

```javascript
// Use appropriate log levels
console.log("Info:", data); // General info
console.warn("Warning:", issue); // Potential problem
console.error("Error:", error); // Actual error
console.debug("Debug:", state); // Development only
```

### React DevTools

Press `F12` → React tab to inspect component tree.

---

## 📚 Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 💡 Getting Help

- **Discord**: [Join our server](https://discord.gg/yourserver)
- **Discussions**: [GitHub Discussions](https://github.com/YourUsername/your-launcher/discussions)
- **Issues**: [Report bugs or request features](https://github.com/YourUsername/your-launcher/issues)

---

## 🎓 Good First Issues

Look for issues labeled:

- `good first issue` - Easy for newcomers
- `help wanted` - We need help!
- `documentation` - Improve docs
- `enhancement` - New features

---

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort! ❤️

**Happy Coding!** 🚀
