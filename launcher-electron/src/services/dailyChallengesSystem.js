// Daily Challenges System
export class DailyChallengesSystem {
  constructor(gameId = 'default') {
    this.storageKey = `mirrorbytes_daily_challenges_${gameId}`;
    this.data = this.loadData();
    this.checkAndGenerateNewChallenges();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        currentDate: null,
        challenges: [],
        completedChallenges: [],
        totalChallengesCompleted: 0,
        totalPointsEarned: 0,
        streakDays: 0,
        lastCompletionDate: null
      };
    } catch (error) {
      console.error('Failed to load challenges:', error);
      return {
        currentDate: null,
        challenges: [],
        completedChallenges: [],
        totalChallengesCompleted: 0,
        totalPointsEarned: 0,
        streakDays: 0,
        lastCompletionDate: null
      };
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save challenges:', error);
    }
  }

  getTodayDateString() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  // Challenge Templates
  getChallengeTemplates() {
    return [
      // Launcher Usage
      { id: 'open_launcher_5', type: 'launcher', title: 'Frühaufsteher', description: 'Öffne den Launcher 5 Mal', target: 5, current: 0, reward: 20, icon: '🌅' },
      { id: 'check_updates', type: 'launcher', title: 'Immer aktuell', description: 'Prüfe auf Updates', target: 1, current: 0, reward: 15, icon: '🔄' },
      
      // Gameplay (simuliert, da wir nicht ins Spiel eingreifen)
      { id: 'play_30min', type: 'gameplay', title: 'Spielsession', description: 'Spiele 30 Minuten', target: 30, current: 0, reward: 25, icon: '🎮' },
      { id: 'play_1hour', type: 'gameplay', title: 'Ausdauer', description: 'Spiele 1 Stunde', target: 60, current: 0, reward: 50, icon: '⏰' },
      { id: 'play_2hours', type: 'gameplay', title: 'Marathon', description: 'Spiele 2 Stunden', target: 120, current: 0, reward: 100, icon: '🏃' },
      
      // Social
      { id: 'check_rewards', type: 'social', title: 'Schatzsucher', description: 'Checke Mystery Gifts', target: 1, current: 0, reward: 10, icon: '🎁' },
      { id: 'view_achievements', type: 'social', title: 'Erfolgs-Check', description: 'Sieh dir Achievements an', target: 1, current: 0, reward: 10, icon: '🏆' },
      { id: 'view_news', type: 'social', title: 'Informiert bleiben', description: 'Lese die News', target: 1, current: 0, reward: 10, icon: '📰' },
      
      // Exploration
      { id: 'explore_features', type: 'exploration', title: 'Entdecker', description: 'Besuche 5 verschiedene Bereiche', target: 5, current: 0, reward: 30, icon: '🗺️' },
      { id: 'open_settings', type: 'exploration', title: 'Tüftler', description: 'Öffne die Einstellungen', target: 1, current: 0, reward: 10, icon: '⚙️' },
      
      // Streak Challenges
      { id: 'daily_login_3', type: 'streak', title: '3-Tage-Streak', description: 'Logge dich 3 Tage ein', target: 3, current: 0, reward: 40, icon: '🔥' },
      { id: 'complete_all_daily', type: 'streak', title: 'Perfektionist', description: 'Schließe alle täglichen Challenges ab', target: 3, current: 0, reward: 75, icon: '💎' },
    ];
  }

  // Generiert 3-5 zufällige Challenges für den Tag
  generateDailyChallenges() {
    const templates = this.getChallengeTemplates();
    const numChallenges = 3 + Math.floor(Math.random() * 3); // 3-5 Challenges
    
    // Shuffle templates
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    
    // Select first N challenges
    const selected = shuffled.slice(0, numChallenges);
    
    // Add unique IDs and reset progress
    return selected.map((challenge, index) => ({
      ...challenge,
      id: `daily_${this.getTodayDateString()}_${index}`,
      current: 0,
      completed: false,
      date: this.getTodayDateString()
    }));
  }

  // Prüft ob neue Challenges generiert werden müssen
  checkAndGenerateNewChallenges() {
    const today = this.getTodayDateString();
    
    if (this.data.currentDate !== today) {
      // Neuer Tag! Generiere neue Challenges
      this.data.currentDate = today;
      this.data.challenges = this.generateDailyChallenges();
      this.saveData();
    }
  }

  // Gibt alle aktuellen Challenges zurück
  getChallenges() {
    this.checkAndGenerateNewChallenges();
    return this.data.challenges;
  }

  // Update Challenge Progress
  updateChallengeProgress(challengeId, increment = 1) {
    const challenge = this.data.challenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.completed) {
      return null;
    }

    challenge.current = Math.min(challenge.current + increment, challenge.target);
    
    // Check if completed
    if (challenge.current >= challenge.target && !challenge.completed) {
      challenge.completed = true;
      this.data.completedChallenges.push(challengeId);
      this.data.totalChallengesCompleted++;
      this.data.totalPointsEarned += challenge.reward;
      
      // Update streak
      const today = this.getTodayDateString();
      if (this.data.lastCompletionDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (this.data.lastCompletionDate === yesterdayString) {
          this.data.streakDays++;
        } else {
          this.data.streakDays = 1;
        }
        
        this.data.lastCompletionDate = today;
      }
      
      this.saveData();
      
      return {
        completed: true,
        challenge: challenge,
        reward: challenge.reward,
        message: `Challenge abgeschlossen! +${challenge.reward} Punkte!`
      };
    }
    
    this.saveData();
    return {
      completed: false,
      challenge: challenge,
      progress: `${challenge.current}/${challenge.target}`
    };
  }

  // Track verschiedene Actions
  trackLauncherOpen() {
    return this.updateChallengeProgress('open_launcher_5');
  }

  trackUpdateCheck() {
    const challenges = this.data.challenges.filter(c => c.id.includes('check_updates'));
    challenges.forEach(c => this.updateChallengeProgress(c.id));
  }

  trackPlaytime(minutes) {
    // Update alle Spielzeit-Challenges
    const playtimeChallenges = this.data.challenges.filter(c => 
      c.type === 'gameplay' && !c.completed
    );
    
    playtimeChallenges.forEach(challenge => {
      this.updateChallengeProgress(challenge.id, minutes);
    });
  }

  trackSectionVisit(section) {
    const sectionMap = {
      'rewards': 'check_rewards',
      'achievements': 'view_achievements',
      'changelog': 'view_news',
      'settings': 'open_settings'
    };
    
    const challengeType = sectionMap[section];
    if (challengeType) {
      const challenges = this.data.challenges.filter(c => 
        c.id.includes(challengeType)
      );
      challenges.forEach(c => this.updateChallengeProgress(c.id));
    }
    
    // Track "Entdecker" Challenge
    const explorerChallenges = this.data.challenges.filter(c => 
      c.id.includes('explore_features')
    );
    explorerChallenges.forEach(c => this.updateChallengeProgress(c.id));
  }

  // Statistiken
  getStats() {
    return {
      totalCompleted: this.data.totalChallengesCompleted,
      totalPoints: this.data.totalPointsEarned,
      streakDays: this.data.streakDays,
      todayProgress: {
        completed: this.data.challenges.filter(c => c.completed).length,
        total: this.data.challenges.length
      }
    };
  }

  // Reset für Testing
  resetDaily() {
    this.data.currentDate = null;
    this.data.challenges = [];
    this.checkAndGenerateNewChallenges();
    this.saveData();
  }

  resetAll() {
    this.data = {
      currentDate: null,
      challenges: [],
      completedChallenges: [],
      totalChallengesCompleted: 0,
      totalPointsEarned: 0,
      streakDays: 0,
      lastCompletionDate: null
    };
    this.saveData();
  }
}

export default DailyChallengesSystem;
