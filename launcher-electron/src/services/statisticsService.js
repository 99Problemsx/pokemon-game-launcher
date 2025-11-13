/**
 * Statistics Service
 * Sammelt und verwaltet detaillierte Statistiken über Launcher-Nutzung
 */

class StatisticsService {
  constructor() {
    this.storageKey = 'mirrorbytes_statistics';
    this.sessionStartTime = Date.now();
    this.currentSession = {
      startTime: this.sessionStartTime,
      launches: 0,
      timeSpent: 0,
      featuresUsed: []
    };
    
    // Lade gespeicherte Statistiken
    this.stats = this.loadStats();
    
    // Session-Tracking starten
    this.startSessionTracking();
  }
  
  loadStats() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
    
    // Default-Statistiken
    return {
      totalLaunches: 0,
      totalPlaytime: 0, // in Sekunden
      sessionsHistory: [], // Letzte 30 Sessions
      dailyStats: {}, // { "2025-10-11": { launches: 5, playtime: 3600 } }
      featuresUsage: {
        backup: 0,
        restore: 0,
        themeChange: 0,
        newsRead: 0,
        challengesCompleted: 0,
        dailyLogins: 0
      },
      peakTimes: {}, // { "14": 25, "15": 30 } - Stunde des Tages -> Anzahl Launches
      achievements: [],
      firstLaunch: Date.now(),
      lastLaunch: Date.now()
    };
  }
  
  saveStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Fehler beim Speichern der Statistiken:', error);
    }
  }
  
  startSessionTracking() {
    // Speichere Statistiken alle 30 Sekunden
    this.trackingInterval = setInterval(() => {
      this.updateSessionTime();
      this.saveStats();
    }, 30000);
    
    // Speichere beim Schließen
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }
  
  updateSessionTime() {
    const now = Date.now();
    const sessionTime = Math.floor((now - this.sessionStartTime) / 1000);
    this.currentSession.timeSpent = sessionTime;
    this.stats.totalPlaytime += 30; // +30 Sekunden seit letztem Update
  }
  
  endSession() {
    this.updateSessionTime();
    
    // Speichere Session in Historie (max 30 Sessions)
    this.stats.sessionsHistory.unshift({
      date: new Date().toISOString(),
      duration: this.currentSession.timeSpent,
      launches: this.currentSession.launches,
      features: this.currentSession.featuresUsed
    });
    
    if (this.stats.sessionsHistory.length > 30) {
      this.stats.sessionsHistory = this.stats.sessionsHistory.slice(0, 30);
    }
    
    this.saveStats();
    clearInterval(this.trackingInterval);
  }
  
  // Tracke Game-Launch
  trackGameLaunch() {
    const today = this.getTodayKey();
    const hour = new Date().getHours();
    
    this.stats.totalLaunches++;
    this.stats.lastLaunch = Date.now();
    this.currentSession.launches++;
    
    // Daily Stats
    if (!this.stats.dailyStats[today]) {
      this.stats.dailyStats[today] = { launches: 0, playtime: 0 };
    }
    this.stats.dailyStats[today].launches++;
    
    // Peak Times
    this.stats.peakTimes[hour] = (this.stats.peakTimes[hour] || 0) + 1;
    
    this.saveStats();
  }
  
  // Tracke Feature-Nutzung
  trackFeature(featureName) {
    if (this.stats.featuresUsage.hasOwnProperty(featureName)) {
      this.stats.featuresUsage[featureName]++;
    }
    
    if (!this.currentSession.featuresUsed.includes(featureName)) {
      this.currentSession.featuresUsed.push(featureName);
    }
    
    this.saveStats();
  }
  
  // Hole Statistiken für Dashboard
  getStatistics() {
    return {
      ...this.stats,
      currentSession: this.currentSession,
      averageSessionTime: this.calculateAverageSessionTime(),
      mostUsedFeature: this.getMostUsedFeature(),
      launchesThisWeek: this.getLaunchesThisWeek(),
      peakHour: this.getPeakHour()
    };
  }
  
  // Berechne durchschnittliche Session-Zeit
  calculateAverageSessionTime() {
    if (this.stats.sessionsHistory.length === 0) return 0;
    
    const total = this.stats.sessionsHistory.reduce((sum, session) => sum + session.duration, 0);
    return Math.floor(total / this.stats.sessionsHistory.length);
  }
  
  // Finde meist-genutztes Feature
  getMostUsedFeature() {
    const features = this.stats.featuresUsage;
    let maxFeature = null;
    let maxCount = 0;
    
    Object.entries(features).forEach(([feature, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxFeature = feature;
      }
    });
    
    return { feature: maxFeature, count: maxCount };
  }
  
  // Launches diese Woche
  getLaunchesThisWeek() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let count = 0;
    Object.entries(this.stats.dailyStats).forEach(([dateKey, data]) => {
      const date = new Date(dateKey);
      if (date >= weekAgo) {
        count += data.launches;
      }
    });
    
    return count;
  }
  
  // Peak Hour
  getPeakHour() {
    const peakTimes = this.stats.peakTimes;
    let maxHour = null;
    let maxCount = 0;
    
    Object.entries(peakTimes).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });
    
    return maxHour ? `${maxHour}:00` : 'N/A';
  }
  
  // Hole Chart-Daten für letzte 7 Tage
  getLast7DaysData() {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = this.formatDate(date);
      
      const dayData = this.stats.dailyStats[dateKey] || { launches: 0, playtime: 0 };
      
      data.push({
        date: dateKey,
        day: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        launches: dayData.launches,
        playtime: Math.floor(dayData.playtime / 60) // in Minuten
      });
    }
    
    return data;
  }
  
  // Hole Chart-Daten für Peak-Zeiten (24 Stunden)
  getPeakTimesData() {
    const data = [];
    
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        hour: `${hour}:00`,
        launches: this.stats.peakTimes[hour] || 0
      });
    }
    
    return data;
  }
  
  // Exportiere Statistiken als JSON
  exportStatistics() {
    const exportData = {
      exported: new Date().toISOString(),
      statistics: this.getStatistics(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirrorbytes-stats-${this.formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  }
  
  // Reset Statistiken
  resetStatistics() {
    if (confirm('Möchtest du wirklich alle Statistiken zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      localStorage.removeItem(this.storageKey);
      this.stats = this.loadStats();
      this.saveStats();
      return true;
    }
    return false;
  }
  
  // Helper: Heute als Key
  getTodayKey() {
    return this.formatDate(new Date());
  }
  
  // Helper: Formatiere Datum
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
}

export default new StatisticsService();
