// Theme System - Manages launcher themes and color schemes
export class ThemeSystem {
  constructor() {
    this.storageKey = 'mirrorbytes_theme';
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  // Available themes
  getThemes() {
    return [
      {
        id: 'default',
        name: 'Mirrorbytes (Standard)',
        description: 'Das klassische Mirrorbytes Studio-Design',
        primary: '#8b5cf6', // purple-500
        secondary: '#ec4899', // pink-500
        accent: '#06b6d4', // cyan-500
        background: '#0f172a', // slate-900
        isDark: true,
        gradient: 'from-purple-600 to-pink-600'
      },
      {
        id: 'midnight',
        name: 'Midnight',
        description: 'Dunkles Blau für nächtliches Gaming',
        primary: '#3b82f6', // blue-500
        secondary: '#1e40af', // blue-800
        accent: '#60a5fa', // blue-400
        background: '#0c1425',
        isDark: true,
        gradient: 'from-blue-600 to-indigo-800'
      },
      {
        id: 'forest',
        name: 'Forest',
        description: 'Natürliche grüne Töne',
        primary: '#10b981', // emerald-500
        secondary: '#059669', // emerald-600
        accent: '#34d399', // emerald-400
        background: '#0a1f16',
        isDark: true,
        gradient: 'from-emerald-600 to-green-700'
      },
      {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warme Sonnenuntergangsfarben',
        primary: '#f59e0b', // amber-500
        secondary: '#ef4444', // red-500
        accent: '#fbbf24', // amber-400
        background: '#1f1209',
        isDark: true,
        gradient: 'from-orange-500 to-red-600'
      },
      {
        id: 'ocean',
        name: 'Ocean',
        description: 'Kühle Meeresfarben',
        primary: '#06b6d4', // cyan-500
        secondary: '#0891b2', // cyan-600
        accent: '#67e8f9', // cyan-300
        background: '#081420',
        isDark: true,
        gradient: 'from-cyan-500 to-blue-600'
      },
      {
        id: 'cherry',
        name: 'Cherry Blossom',
        description: 'Sanfte rosa Kirschblüten',
        primary: '#ec4899', // pink-500
        secondary: '#db2777', // pink-600
        accent: '#f9a8d4', // pink-300
        background: '#1f0818',
        isDark: true,
        gradient: 'from-pink-500 to-rose-600'
      },
      {
        id: 'electric',
        name: 'Electric',
        description: 'Energiegeladenes Neon-Gelb',
        primary: '#eab308', // yellow-500
        secondary: '#84cc16', // lime-500
        accent: '#fde047', // yellow-300
        background: '#18130a',
        isDark: true,
        gradient: 'from-yellow-400 to-lime-500'
      },
      {
        id: 'royal',
        name: 'Royal Purple',
        description: 'Königliches Lila',
        primary: '#a855f7', // purple-500
        secondary: '#7c3aed', // violet-600
        accent: '#c084fc', // purple-400
        background: '#1a0a2e',
        isDark: true,
        gradient: 'from-purple-600 to-violet-700'
      }
    ];
  }

  // Load saved theme
  loadTheme() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const theme = JSON.parse(saved);
        return theme;
      }
      return this.getThemes()[0]; // Default theme
    } catch (error) {
      console.error('Failed to load theme:', error);
      return this.getThemes()[0];
    }
  }

  // Save theme
  saveTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(theme));
      this.currentTheme = theme;
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  // Apply theme to document
  applyTheme(theme) {
    const root = document.documentElement;
    
    // Set data attribute for theme
    root.setAttribute('data-theme', theme.id);
    
    // Set CSS variables for dynamic colors
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-background', theme.background);
    
    // Apply dark/light mode class and body styles
    if (theme.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = theme.background;
      document.body.style.color = '#ffffff';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // Light gray background
      document.body.style.color = '#1e293b'; // Dark text for light mode
    }

    this.saveTheme(theme);
    
    // Trigger re-render by dispatching custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }

  // Change theme
  changeTheme(themeId) {
    const theme = this.getThemes().find(t => t.id === themeId);
    if (theme) {
      this.applyTheme(theme);
      return theme;
    }
    return null;
  }

  // Get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Reset to default
  resetTheme() {
    const defaultTheme = this.getThemes()[0];
    this.applyTheme(defaultTheme);
    return defaultTheme;
  }
}

export default ThemeSystem;
