// Achievement Manager - Verwaltet das Freischalten von Achievements
export class AchievementManager {
  constructor(gameId = 'default') {
    this.storageKey = `mirrorbytes_achievements_${gameId}`;
    this.unlockedAchievements = this.loadAchievements();
    this.notificationCallbacks = [];
  }

  loadAchievements() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }

  saveAchievements() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.unlockedAchievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  unlockAchievement(achievementId, achievementData) {
    if (this.unlockedAchievements.includes(achievementId)) {
      return false; // Already unlocked
    }

    this.unlockedAchievements.push(achievementId);
    this.saveAchievements();

    // Trigger notification callbacks
    this.notificationCallbacks.forEach(callback => {
      callback({
        id: achievementId,
        ...achievementData,
        timestamp: new Date().toISOString(),
      });
    });

    console.log('🏆 Achievement unlocked:', achievementId);
    return true;
  }

  isUnlocked(achievementId) {
    return this.unlockedAchievements.includes(achievementId);
  }

  onAchievementUnlocked(callback) {
    this.notificationCallbacks.push(callback);
  }

  // Check various conditions and unlock achievements
  checkAchievements(analytics) {
    const stats = analytics.data;

    // First Launch
    if (stats.totalSessions === 1 && !this.isUnlocked('first_launch')) {
      this.unlockAchievement('first_launch', {
        name: 'Erstes Abenteuer',
        icon: '🎮',
        points: 10,
      });
    }

    // Play Time Achievements
    if (stats.totalPlaytime >= 600 && !this.isUnlocked('play_10h')) { // 10 hours
      this.unlockAchievement('play_10h', {
        name: 'Pokémon Trainer',
        icon: '⏱️',
        points: 25,
      });
    }

    if (stats.totalPlaytime >= 3000 && !this.isUnlocked('play_50h')) { // 50 hours
      this.unlockAchievement('play_50h', {
        name: 'Pokémon Meister',
        icon: '🏆',
        points: 50,
      });
    }

    if (stats.totalPlaytime >= 6000 && !this.isUnlocked('play_100h')) { // 100 hours
      this.unlockAchievement('play_100h', {
        name: 'Pokémon Champion',
        icon: '👑',
        points: 100,
      });
    }

    // Time-based achievements
    const now = new Date();
    const hour = now.getHours();

    if (hour < 6 && !this.isUnlocked('early_bird')) {
      this.unlockAchievement('early_bird', {
        name: 'Frühaufsteher',
        icon: '🌅',
        points: 30,
      });
    }

    if (hour >= 0 && hour < 4 && !this.isUnlocked('night_owl')) {
      this.unlockAchievement('night_owl', {
        name: 'Nachteule',
        icon: '🦉',
        points: 30,
      });
    }

    // Daily streak (would need more complex logic)
    // For now, just check if played 7+ days
    const daysActive = analytics.getDaysActive();
    if (daysActive >= 7 && stats.totalSessions >= 7 && !this.isUnlocked('daily_streak_7')) {
      this.unlockAchievement('daily_streak_7', {
        name: 'Wöchentliche Hingabe',
        icon: '🔥',
        points: 40,
      });
    }
  }

  // Get all unlocked achievements
  getUnlockedAchievements() {
    return this.unlockedAchievements;
  }

  // Calculate total points
  getTotalPoints() {
    const ACHIEVEMENT_POINTS = {
      first_launch: 10,
      play_10h: 25,
      play_50h: 50,
      play_100h: 100,
      early_bird: 30,
      night_owl: 30,
      daily_streak_7: 40,
      beta_tester: 200,
    };

    return this.unlockedAchievements.reduce((total, id) => {
      return total + (ACHIEVEMENT_POINTS[id] || 0);
    }, 0);
  }
}
