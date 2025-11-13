/**
 * Settings Manager
 * Zentraler Service für alle LocalStorage-Operationen
 */

class SettingsManager {
  constructor() {
    this.storageKey = 'launcherSettings';
    this.defaultSettings = {
      // Theme
      theme: 'cyber',
      
      // Updates
      autoUpdate: true,
      checkUpdateInterval: 3600000, // 1 hour
      
      // Launch Options
      fullscreen: false,
      skipIntro: false,
      debugMode: false,
      customArgs: '',
      
      // Discord
      discordRPC: true,
      
      // Notifications
      showNotifications: true,
      notificationSound: true,
      
      // Statistics
      trackStats: true,
      
      // Daily Features
      dailyLoginEnabled: true,
      challengesEnabled: true,
      
      // Performance
      enableAnimations: true,
      enableParticles: true,
      
      // Privacy
      anonymousAnalytics: true
    };
  }

  /**
   * Lade alle Settings
   */
  getAll() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return { ...this.defaultSettings };
      }
      
      const parsed = JSON.parse(stored);
      // Merge mit defaults für neue Settings
      return { ...this.defaultSettings, ...parsed };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...this.defaultSettings };
    }
  }

  /**
   * Hole ein einzelnes Setting
   */
  get(key) {
    const all = this.getAll();
    return all[key] !== undefined ? all[key] : this.defaultSettings[key];
  }

  /**
   * Setze ein einzelnes Setting
   */
  set(key, value) {
    const all = this.getAll();
    all[key] = value;
    this.saveAll(all);
    this.emit('settingChanged', { key, value });
  }

  /**
   * Setze mehrere Settings auf einmal
   */
  setMultiple(updates) {
    const all = this.getAll();
    Object.assign(all, updates);
    this.saveAll(all);
    this.emit('settingsChanged', updates);
  }

  /**
   * Speichere alle Settings
   */
  saveAll(settings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Setze Settings zurück
   */
  reset() {
    localStorage.removeItem(this.storageKey);
    this.emit('settingsReset');
    return { ...this.defaultSettings };
  }

  /**
   * Exportiere Settings als JSON
   */
  export() {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Importiere Settings von JSON
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.saveAll(imported);
      this.emit('settingsImported');
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  /**
   * Event System für Settings-Änderungen
   */
  listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

// Export als Singleton
let instance = null;

export function getSettingsManager() {
  if (!instance) {
    instance = new SettingsManager();
  }
  return instance;
}

export default SettingsManager;
