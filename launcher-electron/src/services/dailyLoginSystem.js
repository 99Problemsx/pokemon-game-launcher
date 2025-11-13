import { translations } from '../i18n/translations.js';

// Daily Login & Streak System
export class DailyLoginSystem {
  constructor(gameId = 'default') {
    this.storageKey = `mirrorbytes_daily_login_${gameId}`;
    this.data = this.loadData();
    this.language = localStorage.getItem('language') || 'de';
  }
  
  t(key) {
    return translations[this.language]?.[key] || translations.de[key] || key;
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        lastLogin: null,
        currentStreak: 0,
        longestStreak: 0,
        totalLogins: 0,
        totalPointsEarned: 0,
        loginHistory: [], // Array of timestamps
        claimedDates: [] // Array of date strings (YYYY-MM-DD)
      };
    } catch (error) {
      console.error('Failed to load daily login data:', error);
      return {
        lastLogin: null,
        currentStreak: 0,
        longestStreak: 0,
        totalLogins: 0,
        totalPointsEarned: 0,
        loginHistory: [],
        claimedDates: []
      };
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save daily login data:', error);
    }
  }

  // Prüft ob heute bereits eingeloggt wurde
  hasLoggedInToday() {
    if (!this.data.lastLogin) return false;
    
    const today = this.getTodayDateString();
    return this.data.claimedDates.includes(today);
  }

  // Heutiges Datum als String (YYYY-MM-DD)
  getTodayDateString() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  // Berechnet Tage zwischen zwei Daten
  getDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor((date2 - date1) / oneDay);
  }

  // Führt täglichen Login durch
  performDailyLogin(onReward) {
    if (this.hasLoggedInToday()) {
      return {
        success: false,
        message: 'Du hast heute bereits deine tägliche Belohnung erhalten!',
        alreadyClaimed: true
      };
    }

    const now = new Date();
    const today = this.getTodayDateString();
    const lastLoginDate = this.data.lastLogin ? new Date(this.data.lastLogin) : null;

    // Streak berechnen
    if (lastLoginDate) {
      const daysSinceLastLogin = this.getDaysBetween(lastLoginDate, now);
      
      if (daysSinceLastLogin === 1) {
        // Streak fortsetzen
        this.data.currentStreak++;
      } else if (daysSinceLastLogin > 1) {
        // Streak verloren
        this.data.currentStreak = 1;
      }
    } else {
      // Erster Login
      this.data.currentStreak = 1;
    }

    // Update longest streak
    if (this.data.currentStreak > this.data.longestStreak) {
      this.data.longestStreak = this.data.currentStreak;
    }

    // Berechne Belohnung basierend auf Streak
    const basePoints = 10;
    const streakBonus = Math.min(this.data.currentStreak * 5, 100); // Max 100 Bonus
    const totalPoints = basePoints + streakBonus;

    // Spezielle Milestones
    let milestone = null;
    if (this.data.currentStreak === 7) {
      milestone = { name: 'Woche Vollständig!', bonus: 50 };
    } else if (this.data.currentStreak === 30) {
      milestone = { name: 'Monat Vollständig!', bonus: 200 };
    } else if (this.data.currentStreak === 100) {
      milestone = { name: '100 Tage Streak!', bonus: 500 };
    }

    const finalPoints = totalPoints + (milestone ? milestone.bonus : 0);

    // Update data
    this.data.lastLogin = now.toISOString();
    this.data.totalLogins++;
    this.data.totalPointsEarned += finalPoints;
    this.data.loginHistory.push(now.toISOString());
    this.data.claimedDates.push(today);

    // Keep history limited to last 100 entries
    if (this.data.loginHistory.length > 100) {
      this.data.loginHistory = this.data.loginHistory.slice(-100);
    }

    this.saveData();

    // Callback für Achievement Manager
    if (onReward) {
      onReward(finalPoints);
    }

    return {
      success: true,
      points: finalPoints,
      streak: this.data.currentStreak,
      milestone: milestone,
      message: `+${finalPoints} Punkte! ${this.data.currentStreak} Tage Streak! 🔥`
    };
  }

  // Gibt Login-Status zurück
  getLoginStatus() {
    return {
      hasLoggedInToday: this.hasLoggedInToday(),
      currentStreak: this.data.currentStreak,
      longestStreak: this.data.longestStreak,
      totalLogins: this.data.totalLogins,
      totalPointsEarned: this.data.totalPointsEarned,
      lastLogin: this.data.lastLogin,
      nextMilestone: this.getNextMilestone()
    };
  }

  // Berechnet nächsten Milestone
  getNextMilestone() {
    const streak = this.data.currentStreak;
    const lang = localStorage.getItem('language') || 'de';
    const t = (key) => translations[lang]?.[key] || translations.de[key] || key;
    
    if (streak < 7) return { days: 7 - streak, name: `${t('weekly')} ${t('reward')}`, reward: 50 };
    if (streak < 30) return { days: 30 - streak, name: `${t('monthly')} ${t('reward')}`, reward: 200 };
    if (streak < 100) return { days: 100 - streak, name: `${t('century')} ${t('reward')}`, reward: 500 };
    return { days: 0, name: t('allMilestonesReached'), reward: 0 };
  }

  // Reset für Testing
  resetStreak() {
    this.data.currentStreak = 0;
    this.saveData();
  }

  // Vollständiger Reset
  resetAll() {
    this.data = {
      lastLogin: null,
      currentStreak: 0,
      longestStreak: 0,
      totalLogins: 0,
      totalPointsEarned: 0,
      loginHistory: [],
      claimedDates: []
    };
    this.saveData();
  }
}

export default DailyLoginSystem;
