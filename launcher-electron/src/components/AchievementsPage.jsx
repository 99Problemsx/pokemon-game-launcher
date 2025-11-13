import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiStar, FiLock, FiGift } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';
import gamesConfigData from '../../games.config.json';

// Load games from external config
const GAMES = gamesConfigData.games.map(game => ({
  id: game.id,
  name: game.name,
  color: 'cyan' // Default color, can be added to config later
}));

// Example Mystery Gift Codes for UI display
// Note: Actual codes are loaded from mystery-gifts.config.json
// These are just for showing the UI structure
const MYSTERY_CODES = {
  // Examples will be generated dynamically from games config
  // Add your codes to mystery-gifts.config.json
};

// Function to get translated achievements
const getAchievements = (t) => [
  {
    id: 'first_launch',
    name: t('firstAdventure'),
    description: t('firstAdventureDesc'),
    icon: '🎮',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'play_10h',
    name: t('pokemonTrainer'),
    description: t('pokemonTrainerDesc'),
    icon: '⏱️',
    rarity: 'uncommon',
    points: 25,
  },
  {
    id: 'play_50h',
    name: t('pokemonMaster'),
    description: t('pokemonMasterDesc'),
    icon: '🏆',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'play_100h',
    name: t('pokemonChampion'),
    description: t('pokemonChampionDesc'),
    icon: '👑',
    rarity: 'epic',
    points: 100,
  },
  {
    id: 'early_bird',
    name: t('earlyBird'),
    description: t('earlyBirdDesc'),
    icon: '🌅',
    rarity: 'rare',
    points: 30,
  },
  {
    id: 'night_owl',
    name: t('nightOwl'),
    description: t('nightOwlDesc'),
    icon: '🦉',
    rarity: 'rare',
    points: 30,
  },
  {
    id: 'daily_streak_7',
    name: t('weeklyDedication'),
    description: t('weeklyDedicationDesc'),
    icon: '🔥',
    rarity: 'uncommon',
    points: 40,
  },
  {
    id: 'beta_tester',
    name: t('betaTester'),
    description: t('betaTesterDesc'),
    icon: '🧪',
    rarity: 'legendary',
    points: 200,
  },
];

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-600',
};

const AchievementsPage = () => {
  const { t } = useTranslation();
  const ACHIEVEMENTS = getAchievements(t);
  const [gameData, setGameData] = useState({});
  const [showNotification, setShowNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' or 'rewards'
  const [mysteryCode, setMysteryCode] = useState({ illusion: '', zorua: '' });

  useEffect(() => {
    loadAllGamesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllGamesData = () => {
    const data = {};
    
    GAMES.forEach(game => {
      try {
        // Load achievements
        const achievementsStored = localStorage.getItem(`mirrorbytes_achievements_${game.id}`);
        const unlocked = achievementsStored ? JSON.parse(achievementsStored) : [];
        
        // Load redeemed codes
        const codesStored = localStorage.getItem(`mirrorbytes_redeemed_codes_${game.id}`);
        const redeemed = codesStored ? JSON.parse(codesStored) : [];
        
        // Calculate points
        const points = unlocked.reduce((sum, id) => {
          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          return sum + (achievement?.points || 0);
        }, 0);
        
        data[game.id] = {
          unlockedAchievements: unlocked,
          redeemedCodes: redeemed,
          totalPoints: points
        };
      } catch (error) {
        console.error(`Failed to load data for ${game.id}:`, error);
        data[game.id] = {
          unlockedAchievements: [],
          redeemedCodes: [],
          totalPoints: 0
        };
      }
    });
    
    setGameData(data);
  };

  const redeemCode = async (gameId) => {
    const code = mysteryCode[gameId]?.trim().toUpperCase();
    const game = GAMES.find(g => g.id === gameId);
    
    if (!code) {
      toast.error(t('pleaseEnterCode'));
      return;
    }

    const currentData = gameData[gameId] || { redeemedCodes: [] };
    
    if (currentData.redeemedCodes.includes(code)) {
      toast.warning(`${t('codeAlreadyRedeemed')} ${game.name}!`);
      return;
    }

    const reward = MYSTERY_CODES[gameId]?.[code];
    if (!reward) {
      toast.error(t('invalidCode'));
      return;
    }

    // Code einlösen
    const newRedeemed = [...currentData.redeemedCodes, code];
    const updatedData = {
      ...gameData,
      [gameId]: {
        ...currentData,
        redeemedCodes: newRedeemed
      }
    };
    setGameData(updatedData);
    localStorage.setItem(`mirrorbytes_redeemed_codes_${gameId}`, JSON.stringify(newRedeemed));

    // Speichere für das Spiel (Electron API)
    if (window.electronAPI?.saveMysteryGifts) {
      try {
        await window.electronAPI.saveMysteryGifts(newRedeemed);
        console.log(`✅ Mystery Gifts saved for ${game.name}`);
      } catch (error) {
        console.error(`Failed to save mystery gifts for ${game.name}:`, error);
      }
    }

    // Clear input
    setMysteryCode(prev => ({ ...prev, [gameId]: '' }));

    // Success notification
    toast.success(`🎁 ${reward.name} ${t('rewardRedeemedFor')} ${game.name}!\n\n${t('startGameToReceive')}`, {
      position: 'top-center',
      autoClose: 7000
    });
  };

  const isUnlocked = (achievementId, gameId) => {
    return gameData[gameId]?.unlockedAchievements?.includes(achievementId) || false;
  };

  const getProgress = (gameId) => {
    const unlocked = gameData[gameId]?.unlockedAchievements?.length || 0;
    return {
      unlocked,
      total: ACHIEVEMENTS.length,
      percentage: Math.round((unlocked / ACHIEVEMENTS.length) * 100),
    };
  };

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
                {activeTab === 'achievements' ? (
                  <>
                    <FiAward className="text-yellow-400" size={32} />
                    <span>{t('achievementsTitle')}</span>
                  </>
                ) : (
                  <>
                    <FiGift className="text-purple-400" size={32} />
                    <span>{t('mysteryGiftsTitle')}</span>
                  </>
                )}
              </h1>
              <p className="text-gray-400">
                {activeTab === 'achievements' 
                  ? t('achievementsDesc')
                  : t('mysteryGiftsDesc')}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-dark-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('achievementsTab')}
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'rewards'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('mysteryGiftsTab')}
            </button>
          </div>
        </div>

        {activeTab === 'achievements' ? (
          <>
        {/* Multi-Game Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GAMES.map((game) => {
            const progress = getProgress(game.id);
            const data = gameData[game.id] || { unlockedAchievements: [], totalPoints: 0 };
            
            return (
              <div key={game.id} className="space-y-4">
                {/* Game Header & Progress */}
                <div className={`glass-effect rounded-xl p-6 border-2 border-${game.color}-500/30`}>
                  <h2 className={`text-2xl font-bold mb-4 text-${game.color}-400`}>
                    {game.name}
                  </h2>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{progress.unlocked} / {progress.total}</h3>
                      <p className="text-sm text-gray-400">{t('achievementsTitle')}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-bold text-yellow-400">{data.totalPoints}</h3>
                      <p className="text-sm text-gray-400">{t('points')}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r from-${game.color}-500 to-${game.color}-600`}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-2">{progress.percentage}%</p>
                </div>

                {/* Achievements List (compact) */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30">
                  {ACHIEVEMENTS.slice(0, 8).map((achievement) => {
                    const unlocked = isUnlocked(achievement.id, game.id);

                    return (
                      <motion.div
                        key={`${game.id}-${achievement.id}`}
                        whileHover={{ scale: unlocked ? 1.02 : 1 }}
                        className={`glass-effect rounded-lg p-3 ${
                          unlocked ? `border border-${game.color}-500/50` : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                            unlocked
                              ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}`
                              : 'bg-dark-700'
                          }`}>
                            {unlocked ? achievement.icon : <FiLock size={16} />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm flex items-center space-x-1">
                              <span className="truncate">{achievement.name}</span>
                              {unlocked && <FiStar className="text-yellow-400 flex-shrink-0" size={14} />}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">{achievement.description}</p>
                          </div>

                          {/* Points */}
                          <span className="text-sm font-bold text-yellow-400 flex-shrink-0">
                            +{achievement.points}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievement Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed bottom-8 right-8 glass-effect-strong rounded-xl p-6 border-2 border-cyan-500 max-w-sm z-50"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{showNotification.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('achievementUnlockedNotif')}</h3>
                  <p className="text-sm text-gray-300">{showNotification.name}</p>
                  <p className="text-xs text-yellow-400 mt-1">+{showNotification.points} {t('points')}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        ) : (
          /* Mystery Gifts Tab - Multi-Game */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {GAMES.map((game) => {
              const data = gameData[game.id] || { redeemedCodes: [] };
              
              return (
                <div key={game.id} className={`glass-effect rounded-xl p-6 border-2 border-${game.color}-500/30`}>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🎁</div>
                    <h3 className={`text-2xl font-bold mb-2 text-${game.color}-400`}>
                      {game.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {t('redeemCodesFor')}
                    </p>
                  </div>

                  {/* Code Input */}
                  <div className="mb-6">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={mysteryCode[game.id] || ''}
                        onChange={(e) => setMysteryCode(prev => ({ 
                          ...prev, 
                          [game.id]: e.target.value.toUpperCase() 
                        }))}
                        onKeyPress={(e) => e.key === 'Enter' && redeemCode(game.id)}
                        placeholder={t('enterCode')}
                        className="flex-1 px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors uppercase text-sm"
                      />
                      <button 
                        onClick={() => redeemCode(game.id)}
                        className={`px-4 py-3 bg-gradient-to-r from-${game.color}-500 to-${game.color}-600 rounded-lg font-medium hover:shadow-lg transition-all text-sm`}
                      >
                        {t('redeem')}
                      </button>
                    </div>
                  </div>

                  {/* Redeemed Codes */}
                  {data.redeemedCodes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-3 text-green-400 text-sm">{t('redeemed')}</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                        {data.redeemedCodes.map((code) => {
                          const reward = MYSTERY_CODES[game.id]?.[code];
                          return (
                            <div key={code} className="bg-dark-700/50 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{reward?.icon || '🎁'}</span>
                                <div className="text-left">
                                  <p className="font-bold text-xs">{reward?.name || code}</p>
                                  <p className="text-xs text-gray-400">{reward?.description}</p>
                                </div>
                              </div>
                              <span className="text-xs text-green-400 font-mono">{code}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-gray-300">
                      💡 <strong>{t('tipFollowSocial')}</strong>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AchievementsPage;
