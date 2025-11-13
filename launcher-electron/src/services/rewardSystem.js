// Mystery Gift Reward System
export class RewardSystem {
  constructor() {
    this.storageKey = 'mirrorbytes_rewards';
    this.claimedRewards = this.loadClaimedRewards();
  }

  loadClaimedRewards() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load rewards:', error);
      return [];
    }
  }

  saveClaimedRewards() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.claimedRewards));
    } catch (error) {
      console.error('Failed to save rewards:', error);
    }
  }

  isClaimed(rewardId) {
    return this.claimedRewards.includes(rewardId);
  }

  claimReward(rewardId) {
    if (!this.isClaimed(rewardId)) {
      this.claimedRewards.push(rewardId);
      this.saveClaimedRewards();
      return true;
    }
    return false;
  }

  getClaimedRewards() {
    return this.claimedRewards;
  }
}

// Verfügbare Belohnungen basierend auf Achievements und Punkten
export const REWARDS = [
  {
    id: 'starter_pikachu',
    name: 'Shiny Pikachu',
    description: 'Ein seltenes Shiny Pikachu mit perfekten IVs!',
    icon: '⚡',
    type: 'pokemon',
    requirement: {
      type: 'points',
      value: 50,
      description: 'Erreiche 50 Achievement-Punkte',
    },
    mysteryGiftCode: 'LAUNCHER50',
    details: {
      pokemon: 'Pikachu',
      shiny: true,
      level: 5,
      nature: 'Jolly',
      ivs: '31/31/31/31/31/31',
      moves: ['Thunder Shock', 'Quick Attack'],
    },
  },
  {
    id: 'mega_stone',
    name: 'Mega Stone Pack',
    description: 'Ein Pack mit 3 zufälligen Mega Steinen',
    icon: '💎',
    type: 'item',
    requirement: {
      type: 'points',
      value: 100,
      description: 'Erreiche 100 Achievement-Punkte',
    },
    mysteryGiftCode: 'LAUNCHER100',
    details: {
      items: ['Random Mega Stone x3'],
    },
  },
  {
    id: 'legendary_egg',
    name: 'Mystery Egg',
    description: 'Ein mysteriöses Ei mit einem seltenen Pokémon',
    icon: '🥚',
    type: 'pokemon',
    requirement: {
      type: 'points',
      value: 200,
      description: 'Erreiche 200 Achievement-Punkte',
    },
    mysteryGiftCode: 'LAUNCHER200',
    details: {
      pokemon: 'Mystery Egg',
      shiny: true,
      level: 1,
      note: 'Kann zu verschiedenen legendären Pokémon schlüpfen',
    },
  },
  {
    id: 'master_ball_pack',
    name: 'Master Ball x5',
    description: 'Ein Pack mit 5 Master Balls',
    icon: '🎱',
    type: 'item',
    requirement: {
      type: 'achievements',
      value: ['play_10h', 'play_50h'],
      description: 'Schalte "Pokémon Trainer" und "Pokémon Meister" frei',
    },
    mysteryGiftCode: 'MASTERTRAINER',
    details: {
      items: ['Master Ball x5'],
    },
  },
  {
    id: 'shiny_charm',
    name: 'Shiny Charm',
    description: 'Erhöht die Chance auf Shiny Pokémon',
    icon: '✨',
    type: 'item',
    requirement: {
      type: 'achievements',
      value: ['play_100h', 'daily_streak_7'],
      description: 'Schalte "Pokémon Champion" und "Wöchentliche Hingabe" frei',
    },
    mysteryGiftCode: 'SHINYHUNTER',
    details: {
      items: ['Shiny Charm'],
      effect: '+33% Shiny Chance',
    },
  },
  {
    id: 'rare_candy_pack',
    name: 'Rare Candy x50',
    description: 'Ein großes Pack mit 50 Rare Candies',
    icon: '🍬',
    type: 'item',
    requirement: {
      type: 'points',
      value: 150,
      description: 'Erreiche 150 Achievement-Punkte',
    },
    mysteryGiftCode: 'CANDYPOWER',
    details: {
      items: ['Rare Candy x50'],
    },
  },
  {
    id: 'event_pokemon',
    name: 'Event Pokémon',
    description: 'Ein exklusives Event-Pokémon nur für Launcher-Nutzer!',
    icon: '🌟',
    type: 'pokemon',
    requirement: {
      type: 'special',
      value: 'beta_tester',
      description: 'Schalte das "Beta Tester" Achievement frei',
    },
    mysteryGiftCode: 'BETAREWARD',
    details: {
      pokemon: 'Event Pokémon (Secret)',
      shiny: true,
      level: 50,
      special: 'Exklusiv für Beta-Tester',
    },
  },
];

// Prüft, welche Belohnungen verfügbar sind
export function checkAvailableRewards(achievementManager, rewardSystem) {
  const unlockedAchievements = achievementManager.getUnlockedAchievements();
  const totalPoints = achievementManager.getTotalPoints();
  const availableRewards = [];

  REWARDS.forEach(reward => {
    // Bereits eingelöst?
    if (rewardSystem.isClaimed(reward.id)) {
      return;
    }

    let isAvailable = false;

    // Prüfe Anforderung
    if (reward.requirement.type === 'points') {
      isAvailable = totalPoints >= reward.requirement.value;
    } else if (reward.requirement.type === 'achievements') {
      // Alle erforderlichen Achievements freigeschaltet?
      isAvailable = reward.requirement.value.every(achId => 
        unlockedAchievements.includes(achId)
      );
    } else if (reward.requirement.type === 'special') {
      // Spezielles Achievement
      isAvailable = unlockedAchievements.includes(reward.requirement.value);
    }

    if (isAvailable) {
      availableRewards.push(reward);
    }
  });

  return availableRewards;
}

// Gibt alle Belohnungen zurück (für Anzeige mit Status)
export function getAllRewardsWithStatus(achievementManager, rewardSystem) {
  const unlockedAchievements = achievementManager.getUnlockedAchievements();
  const totalPoints = achievementManager.getTotalPoints();

  return REWARDS.map(reward => {
    const isClaimed = rewardSystem.isClaimed(reward.id);
    let isUnlocked = false;
    let progress = 0;

    // Prüfe Anforderung
    if (reward.requirement.type === 'points') {
      isUnlocked = totalPoints >= reward.requirement.value;
      progress = Math.min(100, (totalPoints / reward.requirement.value) * 100);
    } else if (reward.requirement.type === 'achievements') {
      const unlockedCount = reward.requirement.value.filter(achId => 
        unlockedAchievements.includes(achId)
      ).length;
      isUnlocked = unlockedCount === reward.requirement.value.length;
      progress = (unlockedCount / reward.requirement.value.length) * 100;
    } else if (reward.requirement.type === 'special') {
      isUnlocked = unlockedAchievements.includes(reward.requirement.value);
      progress = isUnlocked ? 100 : 0;
    }

    return {
      ...reward,
      isClaimed,
      isUnlocked,
      progress: Math.round(progress),
      status: isClaimed ? 'claimed' : isUnlocked ? 'available' : 'locked',
    };
  });
}
