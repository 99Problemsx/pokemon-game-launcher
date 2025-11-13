// Lokale Analytics ohne externe Services
export class LocalAnalytics {
  constructor(gameId = 'default') {
    this.storageKey = `mirrorbytes_analytics_${gameId}`;
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultData();
    } catch (error) {
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      totalPlaytime: 0,
      totalSessions: 0,
      lastPlayed: null,
      favoriteGame: null,
      launcherOpens: 0,
      gamesPlayed: {},
      achievements: [],
      installDate: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  // Track launcher open
  trackLauncherOpen() {
    this.data.launcherOpens++;
    this.saveData();
  }

  // Track game session
  trackGameSession(gameId, durationMinutes) {
    if (!this.data.gamesPlayed[gameId]) {
      this.data.gamesPlayed[gameId] = {
        playtime: 0,
        sessions: 0,
        firstPlayed: new Date().toISOString(),
      };
    }

    this.data.gamesPlayed[gameId].playtime += durationMinutes;
    this.data.gamesPlayed[gameId].sessions++;
    this.data.totalPlaytime += durationMinutes;
    this.data.totalSessions++;
    this.data.lastPlayed = new Date().toISOString();

    this.updateFavoriteGame();
    this.saveData();
  }

  // Track download
  trackDownload(gameId, success) {
    if (!this.data.downloads) {
      this.data.downloads = {};
    }
    
    if (!this.data.downloads[gameId]) {
      this.data.downloads[gameId] = { attempts: 0, successes: 0 };
    }

    this.data.downloads[gameId].attempts++;
    if (success) {
      this.data.downloads[gameId].successes++;
    }

    this.saveData();
  }

  updateFavoriteGame() {
    let maxPlaytime = 0;
    let favorite = null;

    for (const [gameId, stats] of Object.entries(this.data.gamesPlayed)) {
      if (stats.playtime > maxPlaytime) {
        maxPlaytime = stats.playtime;
        favorite = gameId;
      }
    }

    this.data.favoriteGame = favorite;
  }

  // Get statistics for display
  getStats() {
    return {
      totalPlaytime: this.formatPlaytime(this.data.totalPlaytime),
      totalSessions: this.data.totalSessions,
      favoriteGame: this.data.favoriteGame,
      launcherOpens: this.data.launcherOpens,
      daysActive: this.getDaysActive(),
      avgSessionLength: this.getAverageSessionLength(),
    };
  }

  formatPlaytime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getDaysActive() {
    const installDate = new Date(this.data.installDate);
    const now = new Date();
    const diffTime = Math.abs(now - installDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getAverageSessionLength() {
    if (this.data.totalSessions === 0) return 0;
    return Math.round(this.data.totalPlaytime / this.data.totalSessions);
  }

  // Export data (for user to download)
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Clear all data (GDPR compliance)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    this.data = this.getDefaultData();
  }
}
